from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.core.database import get_db
from app.api.auth import get_current_active_user
from app.models.user import User

router = APIRouter()

# Dados mock de barbeiros
MOCK_BARBERS = [
    {
        "id": 1,
        "name": "Carlos Santos",
        "specialties": ["Corte Masculino", "Barba Completa", "Degradê"],
        "rating": 4.8,
        "experience_years": 8,
        "bio": "Especialista em cortes masculinos clássicos e modernos",
        "avatar_url": None,
        "is_active": True,
        "work_schedule": {
            "monday": {"start": "08:00", "end": "18:00"},
            "tuesday": {"start": "08:00", "end": "18:00"},
            "wednesday": {"start": "08:00", "end": "18:00"},
            "thursday": {"start": "08:00", "end": "18:00"},
            "friday": {"start": "08:00", "end": "18:00"},
            "saturday": {"start": "08:00", "end": "16:00"},
            "sunday": None
        }
    },
    {
        "id": 2,
        "name": "André Lima",
        "specialties": ["Corte Feminino", "Luzes", "Escova Progressiva"],
        "rating": 4.9,
        "experience_years": 12,
        "bio": "Expert em cortes femininos e técnicas de coloração",
        "avatar_url": None,
        "is_active": True,
        "work_schedule": {
            "monday": {"start": "09:00", "end": "19:00"},
            "tuesday": {"start": "09:00", "end": "19:00"},
            "wednesday": {"start": "09:00", "end": "19:00"},
            "thursday": {"start": "09:00", "end": "19:00"},
            "friday": {"start": "09:00", "end": "19:00"},
            "saturday": {"start": "08:00", "end": "17:00"},
            "sunday": None
        }
    },
    {
        "id": 3,
        "name": "Roberto Costa",
        "specialties": ["Corte + Barba", "Relaxamento", "Tratamentos"],
        "rating": 4.7,
        "experience_years": 15,
        "bio": "Veterano com experiência em todos os tipos de serviços",
        "avatar_url": None,
        "is_active": True,
        "work_schedule": {
            "monday": {"start": "08:00", "end": "17:00"},
            "tuesday": {"start": "08:00", "end": "17:00"},
            "wednesday": {"start": "08:00", "end": "17:00"},
            "thursday": {"start": "08:00", "end": "17:00"},
            "friday": {"start": "08:00", "end": "17:00"},
            "saturday": {"start": "08:00", "end": "15:00"},
            "sunday": None
        }
    }
]

@router.get("/test")
async def test_barbers():
    """Endpoint de teste para barbeiros"""
    return {
        "message": "✂️ API de Barbeiros funcionando!",
        "timestamp": datetime.utcnow().isoformat(),
        "total_barbers": len(MOCK_BARBERS),
        "endpoints": [
            "GET /test - Este endpoint de teste",
            "GET / - Listar barbeiros",
            "GET /{id} - Obter barbeiro específico",
            "GET /{id}/schedule - Agenda do barbeiro",
            "GET /{id}/stats - Estatísticas do barbeiro"
        ]
    }

@router.get("/")
async def list_barbers(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Listar todos os barbeiros disponíveis"""
    
    # Filtrar apenas barbeiros ativos
    active_barbers = [barber for barber in MOCK_BARBERS if barber["is_active"]]
    
    return {
        "barbers": active_barbers,
        "total": len(active_barbers),
        "message": "Lista de barbeiros carregada com sucesso"
    }

@router.get("/{barber_id}")
async def get_barber(
    barber_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obter detalhes de um barbeiro específico"""
    
    barber = next((b for b in MOCK_BARBERS if b["id"] == barber_id), None)
    
    if not barber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Barber not found"
        )
    
    return {
        "barber": barber,
        "message": f"Dados do barbeiro {barber['name']} carregados"
    }

@router.get("/{barber_id}/schedule")
async def get_barber_schedule(
    barber_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obter agenda/horários do barbeiro"""
    
    barber = next((b for b in MOCK_BARBERS if b["id"] == barber_id), None)
    
    if not barber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Barber not found"
        )
    
    return {
        "barber_id": barber_id,
        "barber_name": barber["name"],
        "schedule": barber["work_schedule"],
        "message": f"Agenda do barbeiro {barber['name']}"
    }

@router.get("/{barber_id}/stats")
async def get_barber_stats(
    barber_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obter estatísticas do barbeiro"""
    
    barber = next((b for b in MOCK_BARBERS if b["id"] == barber_id), None)
    
    if not barber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Barber not found"
        )
    
    # Estatísticas mock
    stats = {
        "total_appointments": 450,
        "completed_appointments": 425,
        "monthly_revenue": 8500.00,
        "average_rating": barber["rating"],
        "total_reviews": 89,
        "completion_rate": 94.4,
        "popular_services": barber["specialties"][:2],
        "next_available": "2024-01-15T14:30:00"
    }
    
    return {
        "barber_id": barber_id,
        "barber_name": barber["name"],
        "stats": stats,
        "message": f"Estatísticas do barbeiro {barber['name']}"
    } 