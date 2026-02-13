from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.api.auth import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/test")
async def test_clients():
    """Endpoint de teste para clientes"""
    return {
        "message": "👥 API de Clientes funcionando!",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/")
async def list_clients(current_user: User = Depends(get_current_active_user)):
    """Listar clientes"""
    return {"message": "Lista de clientes (em implementação)"} 