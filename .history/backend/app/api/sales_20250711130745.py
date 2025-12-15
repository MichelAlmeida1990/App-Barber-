from fastapi import APIRouter, Depends
from datetime import datetime
from app.api.auth import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/test")
async def test_sales():
    return {"message": "💰 API de Vendas funcionando!", "timestamp": datetime.utcnow().isoformat()}

@router.get("/")
async def list_sales(current_user: User = Depends(get_current_active_user)):
    return {"message": "Lista de vendas (em implementação)"} 