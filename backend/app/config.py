from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "EvvekoCRM"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://yusufkara@localhost:5432/evvekocrm_db"

    # Redis
    redis_url: str = "redis://localhost:6380/0"

    # Auth
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # Yevveko Integration
    yevveko_api_url: str = "https://evveko.com/api/v1"
    yevveko_crm_api_key: str = ""
    yevveko_database_url: str = "postgresql+asyncpg://postgres:v20.y85*B82@localhost:5432/evveko_db"

    # SMS (NetGSM)
    netgsm_usercode: str = ""
    netgsm_password: str = ""
    netgsm_msgheader: str = "EVVEKO"

    # File Storage
    upload_dir: str = "./uploads"

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "https://app.evveko.com"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
