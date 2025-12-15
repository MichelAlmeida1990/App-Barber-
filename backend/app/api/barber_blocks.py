from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime, date, time, timedelta
from pydantic import BaseModel

from app.core.database import get_db
from app.api.auth import get_current_active_user
from app.models.user import User
from app.models.barber import Barber
from app.models.barber_block import BarberBlock
from app.models.appointment import Appointment, AppointmentStatus

router = APIRouter()

# === SCHEMAS PYDANTIC ===

class BarberBlockCreate(BaseModel):
    block_date: date
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    all_day: bool = True
    reason: Optional[str] = None
    notes: Optional[str] = None

class BarberBlockUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    all_day: Optional[bool] = None
    reason: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class BarberBlockResponse(BaseModel):
    id: int
    barber_id: int
    block_date: date
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    all_day: bool
    reason: Optional[str]
    notes: Optional[str]
    is_active: bool
    formatted_period: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# === ENDPOINTS ===

@router.post("/", response_model=BarberBlockResponse, status_code=status.HTTP_201_CREATED)
async def create_barber_block(
    block_data: BarberBlockCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Criar bloqueio de agenda para barbeiro.
    Apenas o próprio barbeiro ou admin pode criar bloqueios.
    """
    
    # Verificar se é barbeiro
    if not current_user.is_barber and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only barbers can create blocks"
        )
    
    # Obter barber_id do usuário
    barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
    if not barber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Barber profile not found"
        )
    
    # Validar horários
    if not block_data.all_day:
        if not block_data.start_time or not block_data.end_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start and end time required for partial day blocks"
            )
        
        if block_data.start_time >= block_data.end_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start time must be before end time"
            )
    
    # Criar bloqueio
    new_block = BarberBlock(
        barber_id=barber.id,
        block_date=block_data.block_date,
        start_time=block_data.start_time,
        end_time=block_data.end_time,
        all_day=block_data.all_day,
        reason=block_data.reason,
        notes=block_data.notes,
        is_active=True
    )
    
    db.add(new_block)
    db.commit()
    db.refresh(new_block)
    
    return BarberBlockResponse(
        id=new_block.id,
        barber_id=new_block.barber_id,
        block_date=new_block.block_date,
        start_time=new_block.start_time,
        end_time=new_block.end_time,
        all_day=new_block.all_day,
        reason=new_block.reason,
        notes=new_block.notes,
        is_active=new_block.is_active,
        formatted_period=new_block.formatted_period,
        created_at=new_block.created_at
    )

@router.get("/", response_model=List[BarberBlockResponse])
async def list_barber_blocks(
    barber_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    is_active: Optional[bool] = True,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Listar bloqueios de agenda.
    Barbeiros veem apenas seus bloqueios, admin vê todos.
    """
    
    # Query base
    query = db.query(BarberBlock)
    
    # Se for barbeiro, filtrar apenas seus bloqueios
    if current_user.is_barber:
        barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
        if barber:
            query = query.filter(BarberBlock.barber_id == barber.id)
    elif barber_id:
        # Admin pode filtrar por barbeiro específico
        query = query.filter(BarberBlock.barber_id == barber_id)
    
    # Filtros
    if is_active is not None:
        query = query.filter(BarberBlock.is_active == is_active)
    
    if start_date:
        query = query.filter(BarberBlock.block_date >= start_date)
    
    if end_date:
        query = query.filter(BarberBlock.block_date <= end_date)
    
    # Ordenar por data
    blocks = query.order_by(BarberBlock.block_date.desc()).all()
    
    return [
        BarberBlockResponse(
            id=block.id,
            barber_id=block.barber_id,
            block_date=block.block_date,
            start_time=block.start_time,
            end_time=block.end_time,
            all_day=block.all_day,
            reason=block.reason,
            notes=block.notes,
            is_active=block.is_active,
            formatted_period=block.formatted_period,
            created_at=block.created_at
        )
        for block in blocks
    ]

@router.get("/{block_id}", response_model=BarberBlockResponse)
async def get_barber_block(
    block_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obter bloqueio específico"""
    
    block = db.query(BarberBlock).filter(BarberBlock.id == block_id).first()
    
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Block not found"
        )
    
    # Verificar permissões
    if current_user.is_barber:
        barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
        if not barber or block.barber_id != barber.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    return BarberBlockResponse(
        id=block.id,
        barber_id=block.barber_id,
        block_date=block.block_date,
        start_time=block.start_time,
        end_time=block.end_time,
        all_day=block.all_day,
        reason=block.reason,
        notes=block.notes,
        is_active=block.is_active,
        formatted_period=block.formatted_period,
        created_at=block.created_at
    )

@router.put("/{block_id}", response_model=BarberBlockResponse)
async def update_barber_block(
    block_id: int,
    block_data: BarberBlockUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualizar bloqueio de agenda"""
    
    block = db.query(BarberBlock).filter(BarberBlock.id == block_id).first()
    
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Block not found"
        )
    
    # Verificar permissões
    if current_user.is_barber:
        barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
        if not barber or block.barber_id != barber.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    # Atualizar campos
    if block_data.start_time is not None:
        block.start_time = block_data.start_time
    if block_data.end_time is not None:
        block.end_time = block_data.end_time
    if block_data.all_day is not None:
        block.all_day = block_data.all_day
    if block_data.reason is not None:
        block.reason = block_data.reason
    if block_data.notes is not None:
        block.notes = block_data.notes
    if block_data.is_active is not None:
        block.is_active = block_data.is_active
    
    db.commit()
    db.refresh(block)
    
    return BarberBlockResponse(
        id=block.id,
        barber_id=block.barber_id,
        block_date=block.block_date,
        start_time=block.start_time,
        end_time=block.end_time,
        all_day=block.all_day,
        reason=block.reason,
        notes=block.notes,
        is_active=block.is_active,
        formatted_period=block.formatted_period,
        created_at=block.created_at
    )

@router.delete("/{block_id}")
async def delete_barber_block(
    block_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remover bloqueio de agenda"""
    
    block = db.query(BarberBlock).filter(BarberBlock.id == block_id).first()
    
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Block not found"
        )
    
    # Verificar permissões
    if current_user.is_barber:
        barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
        if not barber or block.barber_id != barber.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    # Soft delete
    block.deleted_at = datetime.now()
    block.is_active = False
    
    db.commit()
    
    return {"message": "Block deleted successfully"}

@router.get("/check-availability/{barber_id}")
async def check_barber_availability(
    barber_id: int,
    check_date: date,
    start_time: Optional[str] = None,  # Format: "HH:MM"
    end_time: Optional[str] = None,     # Format: "HH:MM"
    db: Session = Depends(get_db)
):
    """
    Verificar se barbeiro está disponível em uma data/horário.
    Endpoint público para facilitar agendamentos.
    """
    
    # Buscar bloqueios ativos para a data
    blocks = db.query(BarberBlock).filter(
        and_(
            BarberBlock.barber_id == barber_id,
            BarberBlock.block_date == check_date,
            BarberBlock.is_active == True,
            BarberBlock.deleted_at.is_(None)
        )
    ).all()
    
    if not blocks:
        return {
            "available": True,
            "reason": None
        }
    
    # Verificar se há bloqueio de dia inteiro
    for block in blocks:
        if block.all_day:
            return {
                "available": False,
                "reason": block.reason or "Barbeiro não disponível neste dia",
                "block_type": "all_day"
            }
    
    # Se foram fornecidos horários, verificar bloqueios parciais
    if start_time and end_time:
        check_start = datetime.strptime(f"{check_date} {start_time}", "%Y-%m-%d %H:%M")
        check_end = datetime.strptime(f"{check_date} {end_time}", "%Y-%m-%d %H:%M")
        
        for block in blocks:
            if block.start_time and block.end_time:
                # Verificar sobreposição de horários
                if not (check_end <= block.start_time or check_start >= block.end_time):
                    return {
                        "available": False,
                        "reason": block.reason or "Horário bloqueado",
                        "block_type": "partial",
                        "blocked_period": block.formatted_period
                    }
    
    return {
        "available": True,
        "reason": None
    }


