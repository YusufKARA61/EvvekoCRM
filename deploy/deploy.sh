#!/bin/bash
set -e

# ============================================
# EvvekoCRM - Sunucu Deploy Script
# AlmaLinux 8 / Python 3.11 / Node 20 / PostgreSQL 15
# ============================================

echo "=========================================="
echo "  EvvekoCRM Deploy Baslatiliyor..."
echo "=========================================="

# --- DEGISKENLER ---
APP_DIR="/var/www/vhosts/app.evveko.com"
PROJECT_DIR="$APP_DIR/EvvekoCRM"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
PYTHON="/usr/local/bin/python3.11"
GITHUB_REPO="https://github.com/YusufKARA61/EvvekoCRM.git"

# --- 1. REPO CLONE ---
echo ""
echo "[1/8] Repo clone ediliyor..."
if [ -d "$PROJECT_DIR" ]; then
    echo "  -> Mevcut proje bulundu, git pull yapiliyor..."
    cd "$PROJECT_DIR"
    git pull origin master
else
    echo "  -> Yeni clone yapiliyor..."
    mkdir -p "$APP_DIR"
    cd "$APP_DIR"
    git clone "$GITHUB_REPO"
fi

# --- 2. BACKEND KURULUM ---
echo ""
echo "[2/8] Backend kuruluyor..."
cd "$BACKEND_DIR"

# Venv olustur
if [ ! -d "venv" ]; then
    echo "  -> Python venv olusturuluyor..."
    $PYTHON -m venv venv
fi

echo "  -> Pip guncelleniyor..."
./venv/bin/pip install --upgrade pip -q

echo "  -> Bagimliliklar kuruluyor..."
./venv/bin/pip install -r requirements.txt -q

echo "  -> Uploads klasoru olusturuluyor..."
mkdir -p uploads

# --- 3. BACKEND .env ---
echo ""
echo "[3/8] Backend .env hazirlaniyor..."
if [ ! -f "$BACKEND_DIR/.env" ]; then
    # Rastgele secret key olustur
    SECRET_KEY=$(openssl rand -hex 32)

    cat > "$BACKEND_DIR/.env" << ENVEOF
# App
DEBUG=false

# Database
DATABASE_URL=postgresql+asyncpg://evvekocrm:evvekocrm_pass_2026@localhost:5432/evvekocrm_db

# Auth
SECRET_KEY=$SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Yevveko Integration
YEVVEKO_API_URL=https://evveko.com/api/v1
YEVVEKO_CRM_API_KEY=

# CORS
CORS_ORIGINS=["https://app.evveko.com"]

# Uploads
UPLOAD_DIR=$BACKEND_DIR/uploads
ENVEOF
    echo "  -> .env olusturuldu"
else
    echo "  -> .env zaten mevcut, atlanıyor"
fi

# --- 4. POSTGRESQL ---
echo ""
echo "[4/8] PostgreSQL veritabani hazirlaniyor..."

# Kullanici ve DB olustur (hata verirse zaten var demektir)
sudo -u postgres psql -c "CREATE USER evvekocrm WITH PASSWORD 'evvekocrm_pass_2026';" 2>/dev/null || echo "  -> Kullanici zaten var"
sudo -u postgres psql -c "CREATE DATABASE evvekocrm_db OWNER evvekocrm;" 2>/dev/null || echo "  -> Veritabani zaten var"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE evvekocrm_db TO evvekocrm;" 2>/dev/null || true

echo "  -> Seed data calistiriliyor..."
cd "$BACKEND_DIR"
./venv/bin/python seed.py 2>&1 || echo "  -> Seed zaten calistirilmis olabilir"

# --- 5. FRONTEND KURULUM ---
echo ""
echo "[5/8] Frontend kuruluyor..."
cd "$FRONTEND_DIR"

echo "  -> npm install..."
npm install --production=false 2>&1 | tail -3

echo "  -> .env.local hazirlaniyor..."
cat > "$FRONTEND_DIR/.env.local" << ENVEOF
NEXT_PUBLIC_API_URL=https://app.evveko.com/api/v1
ENVEOF

echo "  -> Frontend build ediliyor (bu birkaç dakika surebilir)..."
npm run build 2>&1 | tail -5

# --- 6. SYSTEMD SERVISLERI ---
echo ""
echo "[6/8] Systemd servisleri olusturuluyor..."

# Backend servisi
cat > /etc/systemd/system/evvekocrm-backend.service << SVCEOF
[Unit]
Description=EvvekoCRM Backend (FastAPI)
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=$BACKEND_DIR
Environment=PATH=$BACKEND_DIR/venv/bin:/usr/local/bin:/usr/bin
ExecStart=$BACKEND_DIR/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SVCEOF

# Frontend servisi
cat > /etc/systemd/system/evvekocrm-frontend.service << SVCEOF
[Unit]
Description=EvvekoCRM Frontend (Next.js)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$FRONTEND_DIR
ExecStart=/usr/bin/npm start -- -p 3000
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
echo "  -> Servisler olusturuldu"

# --- 7. NGINX ---
echo ""
echo "[7/8] Nginx yapilandiriliyor..."

# Mevcut config'i yedekle
cp /etc/nginx/conf.d/app.evveko.com.ssl.conf /etc/nginx/conf.d/app.evveko.com.ssl.conf.pre-crm-backup

cat > /etc/nginx/conf.d/app.evveko.com.ssl.conf << 'NGINXEOF'
server {
    listen 213.238.191.69:443 ssl;
    listen 213.238.191.238:443 ssl;
    http2 on;

    server_name app.evveko.com;

    ssl_certificate     /etc/letsencrypt/live/app.evveko.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.evveko.com/privkey.pem;

    access_log /var/log/nginx/app.evveko.com.ssl.access.log;
    error_log  /var/log/nginx/app.evveko.com.ssl.error.log;

    client_max_body_size 50M;

    # API istekleri -> Backend (FastAPI)
    location /api/v1/ {
        proxy_pass http://127.0.0.1:8000/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    # API docs
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
        proxy_set_header Host $host;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
    }

    # Uploads (statik dosyalar)
    location /uploads/ {
        alias /var/www/vhosts/app.evveko.com/EvvekoCRM/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Her sey -> Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Next.js statik dosyalar
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000/_next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

# Nginx config test
nginx -t 2>&1
echo "  -> Nginx yapilandirma tamamlandi"

# --- 8. SERVISLERI BASLAT ---
echo ""
echo "[8/8] Servisler baslatiliyor..."

systemctl enable evvekocrm-backend
systemctl enable evvekocrm-frontend
systemctl restart evvekocrm-backend
systemctl restart evvekocrm-frontend
systemctl reload nginx

sleep 3

echo ""
echo "=========================================="
echo "  DEPLOY TAMAMLANDI!"
echo "=========================================="
echo ""
echo "  URL:     https://app.evveko.com"
echo "  API:     https://app.evveko.com/api/v1"
echo "  Docs:    https://app.evveko.com/docs"
echo "  Health:  https://app.evveko.com/health"
echo ""
echo "  Demo Hesaplar:"
echo "    Admin:  admin@evveko.com / admin123"
echo "    Cagri:  cagri@evveko.com / cagri123"
echo "    Bayi:   bayi@evveko.com  / bayi123"
echo ""
echo "  Servis Durumu:"
systemctl status evvekocrm-backend --no-pager -l | head -5
echo ""
systemctl status evvekocrm-frontend --no-pager -l | head -5
echo ""
echo "  Loglar:"
echo "    journalctl -u evvekocrm-backend -f"
echo "    journalctl -u evvekocrm-frontend -f"
echo "=========================================="
