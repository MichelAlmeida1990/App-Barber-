from fastapi import APIRouter, Depends
from datetime import datetime
from app.api.auth import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/test")
async def test_ai():
    return {"message": "🤖 API de IA funcionando!", "timestamp": datetime.utcnow().isoformat()}

@router.post("/chat")
async def chat_ai(current_user: User = Depends(get_current_active_user)):
    return {"message": "Chat com IA (em implementação)"} 