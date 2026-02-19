from typing import Optional

import httpx

from app.config import get_settings

settings = get_settings()


class YevvekoClient:
    """Yevveko API'ye baglanan HTTP client."""

    def __init__(self):
        self.base_url = settings.yevveko_api_url
        self.api_key = settings.yevveko_crm_api_key
        self.headers = {"X-API-Key": self.api_key}

    async def get_talep(self, talep_id: int) -> Optional[dict]:
        """Yevveko'dan tek talep detayini ceker."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.base_url}/crm/talep/{talep_id}",
                    headers=self.headers,
                )
                if response.status_code == 200:
                    data = response.json()
                    if data.get("ok"):
                        return data.get("talep")
        except httpx.RequestError:
            pass
        return None

    async def get_new_talepler(self, since_id: int = 0) -> list[dict]:
        """Son sync'ten sonra olusan talepleri ceker."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.base_url}/crm/talepler",
                    params={"since_id": since_id},
                    headers=self.headers,
                )
                if response.status_code == 200:
                    data = response.json()
                    if data.get("ok"):
                        return data.get("talepler", [])
        except httpx.RequestError:
            pass
        return []

    async def update_talep_status(self, talep_id: int, status: str) -> bool:
        """Yevveko'daki talep durumunu gunceller."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self.base_url}/crm/talep/{talep_id}/durum",
                    json={"durum": status},
                    headers=self.headers,
                )
                return response.status_code == 200
        except httpx.RequestError:
            return False
