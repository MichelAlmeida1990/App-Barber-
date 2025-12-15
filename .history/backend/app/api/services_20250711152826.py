from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from app.core.database import get_db
from app.api.auth import get_current_active_user
from app.models.user import User

router = APIRouter()

# Dados mock de serviços
MOCK_SERVICES = [
    {
        "id": 1,
        "name": "Corte Masculino",
        "description": "Corte clássico masculino com máquina e tesoura",
        "price": 45.00,
        "duration_minutes": 30,
        "category": "corte",
        "is_active": True,
        "barber_specialties": ["Carlos Santos", "Roberto Costa"],
        "popularity": 95
    },
    {
        "id": 2,
        "name": "Corte Feminino",
        "description": "Corte feminino personalizado com técnicas modernas",
        "price": 60.00,
        "duration_minutes": 45,
        "category": "corte",
        "is_active": True,
        "barber_specialties": ["André Lima"],
        "popularity": 88
    },
    {
        "id": 3,
        "name": "Barba Completa",
        "description": "Aparar, modelar e finalizar a barba",
        "price": 25.00,
        "duration_minutes": 20,
        "category": "barba",
        "is_active": True,
        "barber_specialties": ["Carlos Santos", "Roberto Costa"],
        "popularity": 78
    },
    {
        "id": 4,
        "name": "Corte + Barba",
        "description": "Pacote completo: corte de cabelo + barba",
        "price": 65.00,
        "duration_minutes": 50,
        "category": "combo",
        "is_active": True,
        "barber_specialties": ["Carlos Santos", "Roberto Costa"],
        "popularity": 92
    },
    {
        "id": 5,
        "name": "Degradê",
        "description": "Corte degradê com transições suaves",
        "price": 50.00,
        "duration_minutes": 35,
        "category": "corte",
        "is_active": True,
        "barber_specialties": ["Carlos Santos"],
        "popularity": 85
    },
    {
        "id": 6,
        "name": "Luzes",
        "description": "Aplicação de luzes e mechas",
        "price": 120.00,
        "duration_minutes": 90,
        "category": "coloracao",
        "is_active": True,
        "barber_specialties": ["André Lima"],
        "popularity": 65
    },
    {
        "id": 7,
        "name": "Escova Progressiva",
        "description": "Tratamento alisante com escova progressiva",
        "price": 150.00,
        "duration_minutes": 120,
        "category": "tratamento",
        "is_active": True,
        "barber_specialties": ["André Lima"],
        "popularity": 45
    },
    {
        "id": 8,
        "name": "Relaxamento",
        "description": "Tratamento relaxante para cabelo e couro cabeludo",
        "price": 80.00,
        "duration_minutes": 60,
        "category": "tratamento",
        "is_active": True,
        "barber_specialties": ["Roberto Costa"],
        "popularity": 55
    }
]

@router.get("/test")
async def test_services():
    """Endpoint de teste para serviços"""
    return {
        "message": "🛠️ API de Serviços funcionando!",
        "timestamp": datetime.utcnow().isoformat(),
        "total_services": len(MOCK_SERVICES),
        "categories": list(set([s["category"] for s in MOCK_SERVICES])),
        "price_range": {
            "min": min([s["price"] for s in MOCK_SERVICES]),
            "max": max([s["price"] for s in MOCK_SERVICES])
        },
        "endpoints": [
            "GET /test - Este endpoint de teste",
            "GET / - Listar serviços",
            "GET /{id} - Obter serviço específico",
            "GET /categories - Listar categorias",
            "GET /popular - Serviços mais populares"
        ]
    }

@router.get("/")
async def list_services(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Listar todos os serviços disponíveis com filtros opcionais"""
    
    # Filtrar apenas serviços ativos
    services = [service for service in MOCK_SERVICES if service["is_active"]]
    
    # Aplicar filtros
    if category:
        services = [s for s in services if s["category"].lower() == category.lower()]
    
    if min_price is not None:
        services = [s for s in services if s["price"] >= min_price]
    
    if max_price is not None:
        services = [s for s in services if s["price"] <= max_price]
    
    # Ordenar por popularidade
    services.sort(key=lambda x: x["popularity"], reverse=True)
    
    return {
        "services": services,
        "total": len(services),
        "filters_applied": {
            "category": category,
            "min_price": min_price,
            "max_price": max_price
        },
        "message": "Lista de serviços carregada com sucesso"
    }

@router.get("/categories")
async def list_categories(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Listar todas as categorias de serviços"""
    
    categories = list(set([s["category"] for s in MOCK_SERVICES if s["is_active"]]))
    
    category_info = []
    for category in categories:
        services_in_category = [s for s in MOCK_SERVICES if s["category"] == category and s["is_active"]]
        category_info.append({
            "name": category,
            "count": len(services_in_category),
            "price_range": {
                "min": min([s["price"] for s in services_in_category]),
                "max": max([s["price"] for s in services_in_category])
            }
        })
    
    return {
        "categories": category_info,
        "total": len(categories),
        "message": "Categorias de serviços carregadas"
    }

@router.get("/popular")
async def get_popular_services(
    limit: int = 5,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obter serviços mais populares"""
    
    # Filtrar serviços ativos e ordenar por popularidade
    popular_services = [s for s in MOCK_SERVICES if s["is_active"]]
    popular_services.sort(key=lambda x: x["popularity"], reverse=True)
    
    # Limitar resultado
    popular_services = popular_services[:limit]
    
    return {
        "popular_services": popular_services,
        "total": len(popular_services),
        "message": f"Top {limit} serviços mais populares"
    }

@router.get("/{service_id}")
async def get_service(
    service_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obter detalhes de um serviço específico"""
    
    service = next((s for s in MOCK_SERVICES if s["id"] == service_id), None)
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    if not service["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service is not available"
        )
    
    # Adicionar informações extras
    service_info = {
        **service,
        "estimated_total_time": service["duration_minutes"],
        "available_barbers": len(service["barber_specialties"]),
        "category_display": service["category"].title(),
        "price_formatted": f"R$ {service['price']:.2f}"
    }
    
    return {
        "service": service_info,
        "message": f"Detalhes do serviço {service['name']}"
    }

@router.get("/barber/{barber_id}")
async def get_services_by_barber(
    barber_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obter serviços disponíveis para um barbeiro específico"""
    
    # Mock: mapear ID do barbeiro para nome
    barber_names = {
        1: "Carlos Santos",
        2: "André Lima", 
        3: "Roberto Costa"
    }
    
    barber_name = barber_names.get(barber_id)
    if not barber_name:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Barber not found"
        )
    
    # Filtrar serviços que o barbeiro pode realizar
    barber_services = [
        s for s in MOCK_SERVICES 
        if s["is_active"] and barber_name in s["barber_specialties"]
    ]
    
    return {
        "barber_id": barber_id,
        "barber_name": barber_name,
        "services": barber_services,
        "total": len(barber_services),
        "message": f"Serviços disponíveis para {barber_name}"
    } 