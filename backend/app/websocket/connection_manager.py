from fastapi import WebSocket


class ConnectionManager:
    """WebSocket baglanti yoneticisi."""

    def __init__(self):
        # user_id -> WebSocket
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None)

    async def send_to_user(self, user_id: int, message: dict):
        ws = self.active_connections.get(user_id)
        if ws:
            await ws.send_json(message)

    async def send_to_users(self, user_ids: list[int], message: dict):
        for user_id in user_ids:
            await self.send_to_user(user_id, message)

    async def broadcast(self, message: dict):
        for ws in self.active_connections.values():
            await ws.send_json(message)


manager = ConnectionManager()
