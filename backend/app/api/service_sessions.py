from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.service_session import ServiceSession, ServiceSessionStatus
from app.models.service import Service
from app.models.appointment import Appointment
from app.models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/service-sessions", tags=["Service Sessions"])

class ServiceSessionResponse(BaseModel):
    id: int
    appointment_id: int
    service_id: int
    barber_id: int
    client_id: int
    status: str
    start_time: Optional[str] = None
    pause_time: Optional[str] = None
    resume_time: Optional[str] = None
    end_time: Optional[str] = None
    active_duration_minutes: int
    pause_duration_minutes: int
    total_duration_minutes: int
    has_pause: bool
    expected_pause_minutes: int
    notes: Optional[str] = None
    is_paused: bool
    is_active: bool
    can_be_paused: bool
    can_be_resumed: bool
    can_be_completed: bool

    class Config:
        from_attributes = True

@router.post("/", response_model=ServiceSessionResponse)
async def create_service_session(
    appointment_id: int,
    service_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Criar uma nova sessão de serviço"""
    
    # Verificar se o agendamento existe
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    # Verificar se o serviço existe
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    
    # Verificar se já existe uma sessão ativa para este agendamento
    existing = db.query(ServiceSession).filter(
        ServiceSession.appointment_id == appointment_id,
        ServiceSession.status.in_([
            ServiceSessionStatus.IN_PROGRESS,
            ServiceSessionStatus.PAUSED,
            ServiceSessionStatus.RESUMED
        ])
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma sessão ativa para este agendamento"
        )
    
    # Criar nova sessão
    session = ServiceSession(
        appointment_id=appointment_id,
        service_id=service_id,
        barber_id=appointment.barber_id,
        client_id=appointment.client_id,
        has_pause=service.has_pause if hasattr(service, 'has_pause') else False,
        expected_pause_minutes=service.pause_duration_minutes if hasattr(service, 'pause_duration_minutes') else 0,
        status=ServiceSessionStatus.NOT_STARTED
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return session.to_dict()

@router.post("/{session_id}/start", response_model=ServiceSessionResponse)
async def start_service_session(
    session_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Iniciar uma sessão de serviço"""
    
    session = db.query(ServiceSession).filter(ServiceSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sessão não encontrada"
        )
    
    if session.status != ServiceSessionStatus.NOT_STARTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sessão já foi iniciada"
        )
    
    session.start()
    db.commit()
    db.refresh(session)
    
    return session.to_dict()

@router.post("/{session_id}/pause", response_model=ServiceSessionResponse)
async def pause_service_session(
    session_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Pausar uma sessão de serviço (libera a agenda do barbeiro)"""
    
    session = db.query(ServiceSession).filter(ServiceSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sessão não encontrada"
        )
    
    try:
        session.pause()
        db.commit()
        db.refresh(session)
        return session.to_dict()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{session_id}/resume", response_model=ServiceSessionResponse)
async def resume_service_session(
    session_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retomar uma sessão de serviço após pausa"""
    
    session = db.query(ServiceSession).filter(ServiceSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sessão não encontrada"
        )
    
    try:
        session.resume()
        db.commit()
        db.refresh(session)
        return session.to_dict()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{session_id}/complete", response_model=ServiceSessionResponse)
async def complete_service_session(
    session_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Finalizar uma sessão de serviço"""
    
    session = db.query(ServiceSession).filter(ServiceSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sessão não encontrada"
        )
    
    try:
        session.complete()
        
        # Atualizar status do agendamento para concluído
        appointment = db.query(Appointment).filter(Appointment.id == session.appointment_id).first()
        if appointment:
            from app.models.appointment import AppointmentStatus
            appointment.status = AppointmentStatus.COMPLETED
        
        db.commit()
        db.refresh(session)
        return session.to_dict()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/barber/{barber_id}/active", response_model=List[ServiceSessionResponse])
async def get_active_sessions(
    barber_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obter todas as sessões ativas de um barbeiro"""
    
    sessions = db.query(ServiceSession).filter(
        ServiceSession.barber_id == barber_id,
        ServiceSession.status.in_([
            ServiceSessionStatus.IN_PROGRESS,
            ServiceSessionStatus.PAUSED,
            ServiceSessionStatus.RESUMED
        ])
    ).all()
    
    return [s.to_dict() for s in sessions]

@router.get("/{session_id}", response_model=ServiceSessionResponse)
async def get_service_session(
    session_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obter detalhes de uma sessão de serviço"""
    
    session = db.query(ServiceSession).filter(ServiceSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sessão não encontrada"
        )
    
    return session.to_dict()




