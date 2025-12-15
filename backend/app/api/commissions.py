from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract
from typing import List, Optional
from datetime import datetime, date, timedelta
from pydantic import BaseModel
from enum import Enum

from app.core.database import get_db
from app.api.auth import get_current_active_user
from app.models.user import User
from app.models.commission import Commission, CommissionType as ModelCommissionType
from app.models.barber import Barber
from app.models.appointment import Appointment, AppointmentStatus
from app.models.product import Product

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
    commission_type: str
    amount: float
    percentage: float
    description: str
    date: date
    created_at: datetime

    class Config:
        from_attributes = True

# Configurações padrão de comissão
DEFAULT_SERVICE_COMMISSION_RATE = 0.30  # 30% padrão para serviços
DEFAULT_PRODUCT_COMMISSION_RATE = 0.25  # 25% padrão para produtos

# Configurações específicas podem ser personalizadas por barbeiro
CUSTOM_COMMISSION_RATES = {
    "Corte + Barba": 0.30,
    "Corte Feminino": 0.25,
    "Barba Completa": 0.35,
    "Degradê": 0.30,
    "Luzes": 0.20,
    "Escova Progressiva": 0.15,
}

@router.post("/calculate-appointment", response_model=dict)
async def calculate_appointment_commission(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Calcular comissão para um agendamento específico"""
    
    # Buscar o agendamento
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    
    # Buscar barbeiro
    barber = db.query(Barber).filter(Barber.id == appointment.barber_id).first()
    if not barber:
        raise HTTPException(status_code=404, detail="Barbeiro não encontrado")
    
    # Usar taxa de comissão do barbeiro ou padrão
    commission_rate = barber.commission_rate if hasattr(barber, 'commission_rate') and barber.commission_rate else DEFAULT_SERVICE_COMMISSION_RATE
    
    # Calcular comissão
    total_value = float(appointment.final_amount or appointment.total_amount)
    commission_amount = total_value * commission_rate
    
    return {
        "appointment_id": appointment_id,
        "barber_id": barber.id,
        "barber_name": barber.name,
        "total_appointment_value": total_value,
        "total_commission": commission_amount,
        "commission_rate": commission_rate,
        "commission_percentage": commission_rate * 100
    }

@router.post("/create", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_commission(
    commission_data: CommissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Criar uma nova comissão"""
    
    # Verificar se barbeiro existe
    barber = db.query(Barber).filter(Barber.id == commission_data.barber_id).first()
    if not barber:
        raise HTTPException(status_code=404, detail="Barbeiro não encontrado")
    
    # Criar comissão
    commission = Commission(
        barber_id=commission_data.barber_id,
        appointment_id=commission_data.appointment_id,
        product_id=commission_data.product_id,
        commission_type=ModelCommissionType(commission_data.commission_type.value),
        amount=commission_data.amount,
        percentage=commission_data.percentage,
        description=commission_data.description,
        date=commission_data.date
    )
    
    db.add(commission)
    db.commit()
    db.refresh(commission)
    
    return {
        "id": commission.id,
        "barber_id": commission.barber_id,
        "barber_name": barber.name,
        "appointment_id": commission.appointment_id,
        "product_id": commission.product_id,
        "commission_type": commission.commission_type.value,
        "amount": commission.amount,
        "percentage": commission.percentage,
        "description": commission.description,
        "date": commission.date.isoformat(),
        "created_at": commission.created_at.isoformat()
    }

@router.get("/barber/{barber_id}")
async def get_barber_commissions(
    barber_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Listar comissões de um barbeiro específico"""
    
    # Verificar se barbeiro existe
    barber = db.query(Barber).filter(Barber.id == barber_id).first()
    if not barber:
        raise HTTPException(status_code=404, detail="Barbeiro não encontrado")
    
    # Query base
    query = db.query(Commission).filter(Commission.barber_id == barber_id)
    
    # Filtrar por data
    if start_date:
        query = query.filter(Commission.date >= start_date)
    if end_date:
        query = query.filter(Commission.date <= end_date)
    
    # Ordenar por data (mais recentes primeiro)
    commissions = query.order_by(Commission.date.desc()).all()
    
    # Formatar resposta
    result = []
    for comm in commissions:
        result.append({
            "id": comm.id,
            "barber_id": comm.barber_id,
            "barber_name": barber.name,
            "appointment_id": comm.appointment_id,
            "product_id": comm.product_id,
            "commission_type": comm.commission_type.value,
            "amount": comm.amount,
            "percentage": comm.percentage,
            "description": comm.description,
            "date": comm.date.isoformat(),
            "created_at": comm.created_at.isoformat() if comm.created_at else None
        })
    
    return result

@router.get("/barber/{barber_id}/summary")
async def get_barber_commission_summary(
    barber_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Resumo de comissões de um barbeiro"""
    
    # Verificar se barbeiro existe
    barber = db.query(Barber).filter(Barber.id == barber_id).first()
    if not barber:
        raise HTTPException(status_code=404, detail="Barbeiro não encontrado")
    
    # Definir período padrão (mês atual)
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = date(end_date.year, end_date.month, 1)
    
    # Query base
    query = db.query(Commission).filter(
        and_(
            Commission.barber_id == barber_id,
            Commission.date >= start_date,
            Commission.date <= end_date
        )
    )
    
    commissions = query.all()
    
    # Calcular totais
    total_commission = sum(float(comm.amount) for comm in commissions)
    service_commissions = sum(
        float(comm.amount) for comm in commissions 
        if comm.commission_type == ModelCommissionType.SERVICE
    )
    product_commissions = sum(
        float(comm.amount) for comm in commissions 
        if comm.commission_type == ModelCommissionType.PRODUCT
    )
    
    # Agrupar por mês
    monthly_commissions = {}
    for comm in commissions:
        month_key = comm.date.strftime("%Y-%m")
        if month_key not in monthly_commissions:
            monthly_commissions[month_key] = 0
        monthly_commissions[month_key] += float(comm.amount)
    
    # Calcular comparativo com mês anterior
    previous_month_start = start_date - timedelta(days=30)
    previous_month_commissions = db.query(func.sum(Commission.amount)).filter(
        and_(
            Commission.barber_id == barber_id,
            Commission.date >= previous_month_start,
            Commission.date < start_date
        )
    ).scalar() or 0
    
    growth_rate = 0
    if previous_month_commissions > 0:
        growth_rate = ((total_commission - float(previous_month_commissions)) / float(previous_month_commissions)) * 100
    
    return {
        "barber_id": barber_id,
        "barber_name": barber.name,
        "total_commission": round(total_commission, 2),
        "service_commissions": round(service_commissions, 2),
        "product_commissions": round(product_commissions, 2),
        "total_commissions_count": len(commissions),
        "monthly_commissions": {k: round(v, 2) for k, v in monthly_commissions.items()},
        "growth_rate": round(growth_rate, 2),
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
    }

@router.get("/all")
async def get_all_commissions(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Listar todas as comissões (admin)"""
    
    # Query base
    query = db.query(Commission).join(Barber)
    
    # Filtrar por data
    if start_date:
        query = query.filter(Commission.date >= start_date)
    if end_date:
        query = query.filter(Commission.date <= end_date)
    
    # Ordenar por data
    commissions = query.order_by(Commission.date.desc()).all()
    
    # Formatar resposta
    result = []
    for comm in commissions:
        result.append({
            "id": comm.id,
            "barber_id": comm.barber_id,
            "barber_name": comm.barber.name,
            "appointment_id": comm.appointment_id,
            "product_id": comm.product_id,
            "commission_type": comm.commission_type.value,
            "amount": comm.amount,
            "percentage": comm.percentage,
            "description": comm.description,
            "date": comm.date.isoformat(),
            "created_at": comm.created_at.isoformat() if comm.created_at else None
        })
    
    return result

@router.get("/summary")
async def get_commissions_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Resumo geral de comissões (admin)"""
    
    # Definir período padrão
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = date(end_date.year, end_date.month, 1)
    
    # Query base
    query = db.query(Commission).filter(
        and_(
            Commission.date >= start_date,
            Commission.date <= end_date
        )
    )
    
    commissions = query.all()
    
    # Calcular totais
    total_commission = sum(float(comm.amount) for comm in commissions)
    service_commissions = sum(
        float(comm.amount) for comm in commissions 
        if comm.commission_type == ModelCommissionType.SERVICE
    )
    product_commissions = sum(
        float(comm.amount) for comm in commissions 
        if comm.commission_type == ModelCommissionType.PRODUCT
    )
    
    # Agrupar por barbeiro
    barber_commissions = {}
    for comm in commissions:
        barber_id = comm.barber_id
        if barber_id not in barber_commissions:
            barber_commissions[barber_id] = {
                "barber_name": comm.barber.name if comm.barber else "Desconhecido",
                "total_commission": 0,
                "commissions_count": 0
            }
        barber_commissions[barber_id]["total_commission"] += float(comm.amount)
        barber_commissions[barber_id]["commissions_count"] += 1
    
    # Formatar valores
    for barber_id in barber_commissions:
        barber_commissions[barber_id]["total_commission"] = round(barber_commissions[barber_id]["total_commission"], 2)
    
    return {
        "total_commission": round(total_commission, 2),
        "service_commissions": round(service_commissions, 2),
        "product_commissions": round(product_commissions, 2),
        "total_commissions_count": len(commissions),
        "barber_commissions": barber_commissions,
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
    }

@router.post("/auto-generate")
async def auto_generate_commissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Gerar comissões automaticamente para agendamentos concluídos sem comissão"""
    
    # Buscar agendamentos completados
    completed_appointments = db.query(Appointment).filter(
        Appointment.status == AppointmentStatus.COMPLETED
    ).all()
    
    generated_count = 0
    generated_commissions = []
    
    for appointment in completed_appointments:
        # Verificar se já existe comissão para este agendamento
        existing_commission = db.query(Commission).filter(
            Commission.appointment_id == appointment.id
        ).first()
        
        if existing_commission:
            continue
        
        # Buscar barbeiro
        barber = db.query(Barber).filter(Barber.id == appointment.barber_id).first()
        if not barber:
            continue
        
        # Usar taxa de comissão do barbeiro ou padrão
        commission_rate = barber.commission_rate if hasattr(barber, 'commission_rate') and barber.commission_rate else DEFAULT_SERVICE_COMMISSION_RATE
        
        # Calcular valor da comissão
        total_value = float(appointment.final_amount or appointment.total_amount)
        commission_amount = total_value * commission_rate
        
        # Criar comissão
        commission = Commission(
            barber_id=barber.id,
            appointment_id=appointment.id,
            commission_type=ModelCommissionType.SERVICE,
            amount=commission_amount,
            percentage=commission_rate * 100,
            description=f"Comissão por agendamento #{appointment.id} - {appointment.client_name}",
            date=appointment.appointment_date.date()
        )
        
        db.add(commission)
        generated_count += 1
        generated_commissions.append({
            "appointment_id": appointment.id,
            "barber_name": barber.name,
            "amount": commission_amount
        })
    
    # Salvar todas as comissões
    db.commit()
    
    return {
        "message": f"Geradas {generated_count} comissões automaticamente",
        "generated_count": generated_count,
        "generated_commissions": generated_commissions
    }

@router.post("/generate-for-appointment/{appointment_id}")
async def generate_commission_for_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Gerar comissão para um agendamento específico"""
    
    # Buscar agendamento
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    
    # Verificar se está completado
    if appointment.status != AppointmentStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Agendamento precisa estar concluído")
    
    # Verificar se já existe comissão
    existing_commission = db.query(Commission).filter(
        Commission.appointment_id == appointment_id
    ).first()
    
    if existing_commission:
        raise HTTPException(status_code=400, detail="Comissão já existe para este agendamento")
    
    # Buscar barbeiro
    barber = db.query(Barber).filter(Barber.id == appointment.barber_id).first()
    if not barber:
        raise HTTPException(status_code=404, detail="Barbeiro não encontrado")
    
    # Calcular comissão
    commission_rate = barber.commission_rate if hasattr(barber, 'commission_rate') and barber.commission_rate else DEFAULT_SERVICE_COMMISSION_RATE
    total_value = float(appointment.final_amount or appointment.total_amount)
    commission_amount = total_value * commission_rate
    
    # Criar comissão
    commission = Commission(
        barber_id=barber.id,
        appointment_id=appointment.id,
        commission_type=ModelCommissionType.SERVICE,
        amount=commission_amount,
        percentage=commission_rate * 100,
        description=f"Comissão por agendamento #{appointment.id} - {appointment.client_name}",
        date=appointment.appointment_date.date()
    )
    
    db.add(commission)
    db.commit()
    db.refresh(commission)
    
    return {
        "message": "Comissão gerada com sucesso",
        "commission": {
            "id": commission.id,
            "barber_name": barber.name,
            "amount": commission.amount,
            "percentage": commission.percentage,
            "date": commission.date.isoformat()
        }
    } 