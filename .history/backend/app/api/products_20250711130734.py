from fastapi import APIRouter, Depends
from datetime import datetime
from app.api.auth import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/test")
async def test_products():
    return {"message": "📦 API de Produtos funcionando!", "timestamp": datetime.utcnow().isoformat()}

@router.get("/")
async def list_products(current_user: User = Depends(get_current_active_user)):
    return {"message": "Lista de produtos (em implementação)"} 