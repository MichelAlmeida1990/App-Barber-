from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.core.database import get_db
from app.api.auth import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/test")
async def test_appointments():
    """Endpoint de teste para agendamentos"""
    return {
        "message": "📅 API de Agendamentos funcionando!",
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": [
            "GET /test - Este endpoint de teste",
            "GET / - Listar agendamentos (em breve)",
            "POST / - Criar agendamento (em breve)",
            "GET /{id} - Obter agendamento (em breve)",
            "PUT /{id} - Atualizar agendamento (em breve)",
            "DELETE /{id} - Cancelar agendamento (em breve)"
        ]
    }

@router.get("/")
async def list_appointments(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Listar agendamentos do usuário"""
    return {
        "message": "Lista de agendamentos (em implementação)",
        "user_id": current_user.id,
        "user_role": current_user.role.value,
        "appointments": []  # TODO: Implementar busca no banco
    } 