from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel
from enum import Enum

router = APIRouter()

# Modelos Pydantic
class CommissionType(str, Enum):
    SERVICE = "service"
    PRODUCT = "product"

class CommissionCreate(BaseModel):
    barber_id: int
    appointment_id: Optional[int] = None
    product_id: Optional[int] = None
    commission_type: CommissionType
    amount: float
    percentage: float
    description: str
    date: date

class CommissionResponse(BaseModel):
    id: int
    barber_id: int
    barber_name: str
    appointment_id: Optional[int]
    product_id: Optional[int]
    commission_type: CommissionType
    amount: float
    percentage: float
    description: str
    date: date
    created_at: datetime

    class Config:
        from_attributes = True

# Dados mock para comissões (temporário)
commissions_storage = []

# Configurações de comissão por tipo de serviço
SERVICE_COMMISSION_RATES = {
    "Corte + Barba": 0.30,  # 30% de comissão
    "Corte Feminino": 0.25,  # 25% de comissão
    "Barba Completa": 0.35,  # 35% de comissão
    "Corte + Barba + Sobrancelha": 0.30,  # 30% de comissão
    "Degradê": 0.30,  # 30% de comissão
    "Luzes": 0.20,  # 20% de comissão
    "Escova Progressiva": 0.15,  # 15% de comissão
    "Relaxamento": 0.20,  # 20% de comissão
}

# Configurações de comissão por produto
PRODUCT_COMMISSION_RATES = {
    "Shampoo": 0.25,  # 25% de comissão
    "Condicionador": 0.25,  # 25% de comissão
    "Pomada": 0.30,  # 30% de comissão
    "Óleo": 0.30,  # 30% de comissão
    "Máscara": 0.25,  # 25% de comissão
}

@router.post("/calculate-appointment", response_model=dict)
async def calculate_appointment_commission(appointment_id: int):
    """Calcular comissão para um agendamento específico"""
    
    # Buscar o agendamento (usando dados mock por enquanto)
    from .appointments import appointments_storage
    
    appointment = next((apt for apt in appointments_storage if apt["id"] == appointment_id), None)
    if not appointment:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    
    # Calcular comissões para cada serviço
    total_commission = 0
    service_commissions = []
    
    for service in appointment["services"]:
        service_name = service["name"]
        service_price = service["price"]
        
        # Buscar taxa de comissão para o serviço
        commission_rate = SERVICE_COMMISSION_RATES.get(service_name, 0.25)  # Padrão 25%
        commission_amount = service_price * commission_rate
        
        service_commissions.append({
            "service_name": service_name,
            "service_price": service_price,
            "commission_rate": commission_rate,
            "commission_amount": commission_amount
        })
        
        total_commission += commission_amount
    
    return {
        "appointment_id": appointment_id,
        "barber_id": appointment["barber_id"],
        "barber_name": appointment["barber_name"],
        "total_appointment_value": appointment["total_price"],
        "total_commission": total_commission,
        "service_commissions": service_commissions,
        "commission_percentage": (total_commission / appointment["total_price"]) * 100 if appointment["total_price"] > 0 else 0
    }

@router.post("/create", response_model=CommissionResponse)
async def create_commission(commission_data: CommissionCreate):
    """Criar uma nova comissão"""
    
    # Gerar ID único
    commission_id = len(commissions_storage) + 1
    
    # Buscar nome do barbeiro
    from .barbers import MOCK_BARBERS
    barber = next((b for b in MOCK_BARBERS if b["id"] == commission_data.barber_id), None)
    if not barber:
        raise HTTPException(status_code=404, detail="Barbeiro não encontrado")
    
    # Criar comissão
    commission = {
        "id": commission_id,
        "barber_id": commission_data.barber_id,
        "barber_name": barber["name"],
        "appointment_id": commission_data.appointment_id,
        "product_id": commission_data.product_id,
        "commission_type": commission_data.commission_type,
        "amount": commission_data.amount,
        "percentage": commission_data.percentage,
        "description": commission_data.description,
        "date": commission_data.date.isoformat(),
        "created_at": datetime.now().isoformat()
    }
    
    commissions_storage.append(commission)
    
    return commission

@router.get("/barber/{barber_id}", response_model=List[CommissionResponse])
async def get_barber_commissions(
    barber_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """Listar comissões de um barbeiro específico"""
    
    # Filtrar comissões do barbeiro
    barber_commissions = [
        comm for comm in commissions_storage 
        if comm["barber_id"] == barber_id
    ]
    
    # Filtrar por data se especificado
    if start_date:
        barber_commissions = [
            comm for comm in barber_commissions 
            if datetime.fromisoformat(comm["date"]).date() >= start_date
        ]
    
    if end_date:
        barber_commissions = [
            comm for comm in barber_commissions 
            if datetime.fromisoformat(comm["date"]).date() <= end_date
        ]
    
    return barber_commissions

@router.get("/barber/{barber_id}/summary", response_model=dict)
async def get_barber_commission_summary(
    barber_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """Resumo de comissões de um barbeiro"""
    
    # Buscar comissões do barbeiro
    barber_commissions = [
        comm for comm in commissions_storage 
        if comm["barber_id"] == barber_id
    ]
    
    # Filtrar por data se especificado
    if start_date:
        barber_commissions = [
            comm for comm in barber_commissions 
            if datetime.fromisoformat(comm["date"]).date() >= start_date
        ]
    
    if end_date:
        barber_commissions = [
            comm for comm in barber_commissions 
            if datetime.fromisoformat(comm["date"]).date() <= end_date
        ]
    
    # Calcular totais
    total_commission = sum(comm["amount"] for comm in barber_commissions)
    service_commissions = sum(
        comm["amount"] for comm in barber_commissions 
        if comm["commission_type"] == "service"
    )
    product_commissions = sum(
        comm["amount"] for comm in barber_commissions 
        if comm["commission_type"] == "product"
    )
    
    # Agrupar por mês
    monthly_commissions = {}
    for comm in barber_commissions:
        month_key = datetime.fromisoformat(comm["date"]).strftime("%Y-%m")
        if month_key not in monthly_commissions:
            monthly_commissions[month_key] = 0
        monthly_commissions[month_key] += comm["amount"]
    
    return {
        "barber_id": barber_id,
        "total_commission": total_commission,
        "service_commissions": service_commissions,
        "product_commissions": product_commissions,
        "total_commissions_count": len(barber_commissions),
        "monthly_commissions": monthly_commissions,
        "period": {
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat() if end_date else None
        }
    }

@router.get("/all", response_model=List[CommissionResponse])
async def get_all_commissions(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """Listar todas as comissões (admin)"""
    
    all_commissions = commissions_storage.copy()
    
    # Filtrar por data se especificado
    if start_date:
        all_commissions = [
            comm for comm in all_commissions 
            if datetime.fromisoformat(comm["date"]).date() >= start_date
        ]
    
    if end_date:
        all_commissions = [
            comm for comm in all_commissions 
            if datetime.fromisoformat(comm["date"]).date() <= end_date
        ]
    
    return all_commissions

@router.get("/summary", response_model=dict)
async def get_commissions_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """Resumo geral de comissões (admin)"""
    
    all_commissions = commissions_storage.copy()
    
    # Filtrar por data se especificado
    if start_date:
        all_commissions = [
            comm for comm in all_commissions 
            if datetime.fromisoformat(comm["date"]).date() >= start_date
        ]
    
    if end_date:
        all_commissions = [
            comm for comm in all_commissions 
            if datetime.fromisoformat(comm["date"]).date() <= end_date
        ]
    
    # Calcular totais
    total_commission = sum(comm["amount"] for comm in all_commissions)
    service_commissions = sum(
        comm["amount"] for comm in all_commissions 
        if comm["commission_type"] == "service"
    )
    product_commissions = sum(
        comm["amount"] for comm in all_commissions 
        if comm["commission_type"] == "product"
    )
    
    # Agrupar por barbeiro
    barber_commissions = {}
    for comm in all_commissions:
        barber_id = comm["barber_id"]
        if barber_id not in barber_commissions:
            barber_commissions[barber_id] = {
                "barber_name": comm["barber_name"],
                "total_commission": 0,
                "commissions_count": 0
            }
        barber_commissions[barber_id]["total_commission"] += comm["amount"]
        barber_commissions[barber_id]["commissions_count"] += 1
    
    return {
        "total_commission": total_commission,
        "service_commissions": service_commissions,
        "product_commissions": product_commissions,
        "total_commissions_count": len(all_commissions),
        "barber_commissions": barber_commissions,
        "period": {
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat() if end_date else None
        }
    }

@router.post("/auto-generate")
async def auto_generate_commissions():
    """Gerar comissões automaticamente para agendamentos concluídos"""
    
    from .appointments import appointments_storage
    
    generated_commissions = []
    
    for appointment in appointments_storage:
        # Verificar se já existe comissão para este agendamento
        existing_commission = next(
            (comm for comm in commissions_storage 
             if comm["appointment_id"] == appointment["id"]), 
            None
        )
        
        if existing_commission:
            continue
        
        # Gerar comissão apenas para agendamentos concluídos
        if appointment["status"] == "COMPLETED":
            # Calcular comissão para cada serviço
            for service in appointment["services"]:
                service_name = service["name"]
                service_price = service["price"]
                
                # Buscar taxa de comissão
                commission_rate = SERVICE_COMMISSION_RATES.get(service_name, 0.25)
                commission_amount = service_price * commission_rate
                
                # Criar comissão
                commission_id = len(commissions_storage) + 1
                commission = {
                    "id": commission_id,
                    "barber_id": appointment["barber_id"],
                    "barber_name": appointment["barber_name"],
                    "appointment_id": appointment["id"],
                    "product_id": None,
                    "commission_type": "service",
                    "amount": commission_amount,
                    "percentage": commission_rate * 100,
                    "description": f"Comissão por {service_name} - Agendamento #{appointment['id']}",
                    "date": appointment["appointment_date"],
                    "created_at": datetime.now().isoformat()
                }
                
                commissions_storage.append(commission)
                generated_commissions.append(commission)
    
    return {
        "message": f"Geradas {len(generated_commissions)} comissões automaticamente",
        "generated_commissions": generated_commissions
    } 