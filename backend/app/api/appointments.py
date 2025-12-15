from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime, timedelta, time
from typing import List, Optional
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.api.auth import get_current_active_user
from app.models.user import User, UserRole
from app.models.appointment import Appointment, AppointmentStatus
from app.models.barber import Barber
from app.models.service import Service
from app.models.client import Client, ClientStatus

router = APIRouter()

# === SCHEMAS ===

class AppointmentCreate(BaseModel):
    barber_id: int
    service_ids: List[int]
    appointment_date: datetime
    notes: Optional[str] = None
    
class AppointmentUpdate(BaseModel):
    appointment_date: Optional[datetime] = None
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None
    
class AppointmentResponse(BaseModel):
    id: int
    appointment_code: Optional[str] = None
    client_id: int
    client_name: str
    barber_id: int
    barber_name: str
    services: List[dict]
    appointment_date: datetime
    status: str
    total_price: float
    total_duration: int
    notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class TimeSlot(BaseModel):
    time: str
    available: bool
    appointment_id: Optional[int] = None

# === ENDPOINTS ===

@router.get("/test")
async def test_appointments():
    """Endpoint de teste para agendamentos"""
    return {
        "message": "📅 API de Agendamentos funcionando!",
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": [
            "GET /test - Este endpoint de teste",
            "GET / - Listar agendamentos",
            "POST / - Criar agendamento",
            "GET /{id} - Obter agendamento",
            "PUT /{id} - Atualizar agendamento",
            "DELETE /{id} - Cancelar agendamento",
            "GET /availability - Verificar disponibilidade",
            "GET /my-appointments - Meus agendamentos"
        ]
    }

@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment_data: AppointmentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Criar novo agendamento"""
    
    try:
        # Verificar se barbeiro existe
        barber = db.query(Barber).filter(Barber.id == appointment_data.barber_id).first()
        if not barber:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Barber not found"
            )
        
        # Verificar se serviços existem
        services = db.query(Service).filter(Service.id.in_(appointment_data.service_ids)).all()
        if len(services) != len(appointment_data.service_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more services not found"
            )
        
        # Calcular duração e preço total
        total_duration = sum(service.duration_minutes for service in services)
        total_price = sum(service.price for service in services)
        
        # Verificar disponibilidade (verificar conflitos com agendamentos ativos)
        end_time = appointment_data.appointment_date + timedelta(minutes=total_duration)
        conflicts = db.query(Appointment).filter(
            and_(
                Appointment.barber_id == appointment_data.barber_id,
                Appointment.status.in_([
                    AppointmentStatus.PENDING,
                    AppointmentStatus.CONFIRMED,
                    AppointmentStatus.IN_PROGRESS
                ]),
                or_(
                    and_(
                        Appointment.appointment_date <= appointment_data.appointment_date,
                        Appointment.end_time > appointment_data.appointment_date
                    ),
                    and_(
                        Appointment.appointment_date < end_time,
                        Appointment.end_time >= end_time
                    )
                )
            )
        ).first()
        
        if conflicts:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Time slot not available"
            )
        
        # Obter cliente
        client = None
        if current_user.is_client:
            client = db.query(Client).filter(Client.user_id == current_user.id).first()
            if not client:
                # Garantir que barbearia padrão existe
                from app.core.database import ensure_default_barbershop
                barbershop_id = ensure_default_barbershop(db)
                
                # Criar cliente automaticamente se não existir
                client = Client(
                    user_id=current_user.id,
                    name=current_user.full_name,
                    email=current_user.email,
                    phone=current_user.phone,
                    barbershop_id=barbershop_id,
                    status=ClientStatus.ACTIVE
                )
                db.add(client)
                db.commit()
                db.refresh(client)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only clients can create appointments"
            )
        
        # Gerar código único de agendamento
        import random
        import string
        appointment_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        
        # Verificar se o código já existe (improvável mas garantir unicidade)
        while db.query(Appointment).filter(Appointment.appointment_number == appointment_code).first():
            appointment_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        
        # Criar agendamento
        db_appointment = Appointment(
            appointment_number=appointment_code,
            barbershop_id=1,  # TODO: Implementar seleção de barbearia
            client_id=client.id,
            barber_id=appointment_data.barber_id,
            appointment_date=appointment_data.appointment_date,
            start_time=appointment_data.appointment_date,
            end_time=end_time,
            duration_minutes=total_duration,
            total_amount=total_price,
            final_amount=total_price,
            status=AppointmentStatus.PENDING,
            client_name=client.name,
            client_phone=client.phone,
            client_email=client.email,
            client_notes=appointment_data.notes,
            booking_source="website"
        )
        
        db.add(db_appointment)
        db.commit()
        db.refresh(db_appointment)
        
        # Adicionar serviços ao relacionamento (implementar many-to-many se necessário)
        # Por enquanto, os serviços estão sendo retornados separadamente
        
        # Construir response com código de agendamento
        response_data = {
            "id": db_appointment.id,
            "appointment_code": db_appointment.appointment_number,
            "client_id": client.id,
            "client_name": client.name,
            "barber_id": barber.id,
            "barber_name": barber.professional_name,
            "services": [{"id": s.id, "name": s.name, "price": float(s.price)} for s in services],
            "appointment_date": db_appointment.appointment_date,
            "status": db_appointment.status.value,
            "total_price": float(db_appointment.total_amount),
            "total_duration": db_appointment.duration_minutes,
            "notes": db_appointment.client_notes or "",
            "created_at": db_appointment.created_at or db_appointment.appointment_date
        }
        
        return response_data
    except HTTPException:
        # Re-raise HTTP exceptions (já têm status code apropriado)
        raise
    except Exception as e:
        # Capturar outros erros e retornar erro 500 com detalhes
        import traceback
        error_details = traceback.format_exc()
        print(f"Erro ao criar agendamento: {error_details}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno ao criar agendamento: {str(e)}"
        )

@router.get("/", response_model=List[AppointmentResponse])
async def list_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[AppointmentStatus] = None,
    barber_id: Optional[int] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Listar agendamentos com filtros"""
    
    query = db.query(Appointment)
    
    # Filtros baseados no role do usuário
    if current_user.is_client:
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        if client:
            query = query.filter(Appointment.client_id == client.id)
        else:
            return []
    elif current_user.is_barber:
        barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
        if barber:
            query = query.filter(Appointment.barber_id == barber.id)
        else:
            return []
    
    # Aplicar filtros
    if status:
        query = query.filter(Appointment.status == status)
    if barber_id:
        query = query.filter(Appointment.barber_id == barber_id)
    if date_from:
        query = query.filter(Appointment.appointment_date >= date_from)
    if date_to:
        query = query.filter(Appointment.appointment_date <= date_to)
    
    # Paginação
    appointments = query.offset(skip).limit(limit).all()
    
    # Montar response
    result = []
    for appointment in appointments:
        barber = db.query(Barber).filter(Barber.id == appointment.barber_id).first()
        client = db.query(Client).filter(Client.id == appointment.client_id).first()
        
        result.append(AppointmentResponse(
            id=appointment.id,
            client_id=appointment.client_id,
            client_name=client.name if client else "Unknown",
            barber_id=appointment.barber_id,
            barber_name=barber.professional_name if barber else "Unknown",
            services=[],  # TODO: Implementar relacionamento
            appointment_date=appointment.appointment_date,
            status=appointment.status.value,
            total_price=appointment.total_price,
            total_duration=appointment.total_duration,
            notes=appointment.notes,
            created_at=appointment.created_at
        ))
    
    return result

@router.get("/availability")
async def get_availability(
    barber_id: int,
    date: str,  # YYYY-MM-DD format
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Verificar disponibilidade de horários para um barbeiro em uma data"""
    
    try:
        appointment_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    # Gerar slots de 30 minutos (8h às 18h)
    time_slots = []
    current_time = datetime.combine(appointment_date, time(8, 0))
    end_time = datetime.combine(appointment_date, time(18, 0))
    
    while current_time < end_time:
        slot_end = current_time + timedelta(minutes=30)
        
        # Por enquanto, todos os horários estão disponíveis
        # TODO: Implementar verificação real de disponibilidade
        is_available = True
        
        time_slots.append(TimeSlot(
            time=current_time.strftime("%H:%M"),
            available=is_available,
            appointment_id=None
        ))
        
        current_time = slot_end
    
    return {
        "barber_id": barber_id,
        "barber_name": f"Barbeiro {barber_id}",
        "date": date,
        "slots": time_slots
    }

@router.get("/my-appointments", response_model=List[AppointmentResponse])
async def get_my_appointments(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obter agendamentos do usuário logado"""
    
    if current_user.is_client:
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        if not client:
            return []
        
        appointments = db.query(Appointment).filter(
            Appointment.client_id == client.id
        ).order_by(Appointment.appointment_date.desc()).all()
        
    elif current_user.is_barber:
        barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
        if not barber:
            return []
        
        appointments = db.query(Appointment).filter(
            Appointment.barber_id == barber.id
        ).order_by(Appointment.appointment_date.desc()).all()
        
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Montar response
    result = []
    for appointment in appointments:
        barber = db.query(Barber).filter(Barber.id == appointment.barber_id).first()
        client = db.query(Client).filter(Client.id == appointment.client_id).first()
        
        result.append(AppointmentResponse(
            id=appointment.id,
            appointment_code=appointment.appointment_number,
            client_id=appointment.client_id,
            client_name=client.name if client else "Unknown",
            barber_id=appointment.barber_id,
            barber_name=barber.professional_name if barber else "Unknown",
            services=[],
            appointment_date=appointment.appointment_date,
            status=appointment.status.value,
            total_price=float(appointment.total_amount or appointment.final_amount or 0),
            total_duration=appointment.duration_minutes or 0,
            notes=appointment.client_notes or "",
            created_at=appointment.created_at or appointment.appointment_date
        ))
    
    return result

@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: int,
    appointment_data: AppointmentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualizar agendamento"""
    
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Verificar permissões
    can_update = False
    if current_user.is_client:
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        can_update = client and appointment.client_id == client.id
    elif current_user.is_barber:
        barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
        can_update = barber and appointment.barber_id == barber.id
    elif current_user.can_manage_barbershop:
        can_update = True
    
    if not can_update:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this appointment"
        )
    
    # Atualizar campos
    if appointment_data.appointment_date:
        appointment.appointment_date = appointment_data.appointment_date
    if appointment_data.status:
        appointment.status = appointment_data.status
    if appointment_data.notes is not None:
        appointment.notes = appointment_data.notes
    
    db.commit()
    db.refresh(appointment)
    
    # Montar response
    barber = db.query(Barber).filter(Barber.id == appointment.barber_id).first()
    client = db.query(Client).filter(Client.id == appointment.client_id).first()
    
    return AppointmentResponse(
        id=appointment.id,
        client_id=appointment.client_id,
        client_name=client.name if client else "Unknown",
        barber_id=appointment.barber_id,
        barber_name=barber.professional_name if barber else "Unknown",
        services=[],
        appointment_date=appointment.appointment_date,
        status=appointment.status.value,
        total_price=appointment.total_price,
        total_duration=appointment.total_duration,
        notes=appointment.notes,
        created_at=appointment.created_at
    )

@router.get("/by-code/{appointment_code}")
async def get_appointment_by_code(
    appointment_code: str,
    db: Session = Depends(get_db)
):
    """
    Buscar agendamento por código único.
    Não requer autenticação - qualquer pessoa com o código pode consultar.
    """
    
    appointment = db.query(Appointment).filter(
        Appointment.appointment_number == appointment_code.upper()
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado. Verifique o código e tente novamente."
        )
    
    # Buscar barbeiro e cliente
    barber = db.query(Barber).filter(Barber.id == appointment.barber_id).first()
    client = db.query(Client).filter(Client.id == appointment.client_id).first()
    
    # Formatar data
    formatted_date = appointment.appointment_date.strftime("%d/%m/%Y às %H:%M")
    
    return {
        "id": appointment.id,
        "appointment_code": appointment.appointment_number,
        "status": appointment.status.value,
        "client_name": appointment.client_name or (client.name if client else "Desconhecido"),
        "barber_name": barber.professional_name if barber else "Desconhecido",
        "appointment_date": appointment.appointment_date.isoformat(),
        "formatted_date": formatted_date,
        "total_amount": float(appointment.total_amount or appointment.final_amount),
        "duration_minutes": appointment.duration_minutes,
        "notes": appointment.client_notes,
        "can_cancel": appointment.status in [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        "created_at": appointment.created_at.isoformat() if appointment.created_at else None
    }

@router.delete("/{appointment_id}")
async def cancel_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cancelar agendamento"""
    
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Verificar permissões
    can_cancel = False
    if current_user.is_client:
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        can_cancel = client and appointment.client_id == client.id
    elif current_user.is_barber:
        barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
        can_cancel = barber and appointment.barber_id == barber.id
    elif current_user.can_manage_barbershop:
        can_cancel = True
    
    if not can_cancel:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this appointment"
        )
    
    # Cancelar (não deletar, apenas alterar status)
    appointment.status = AppointmentStatus.CANCELLED
    db.commit()
    
    return {"message": "Appointment cancelled successfully"} 

@router.get("/availability-test")
async def test_availability(
    barber_id: int = 1,
    date: str = "2025-07-21"
):
    """Endpoint de teste para disponibilidade (sem autenticação)"""
    
    try:
        appointment_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        return {
            "error": "Invalid date format. Use YYYY-MM-DD",
            "date": date
        }
    
    # Gerar slots de 30 minutos (8h às 18h)
    time_slots = []
    current_time = datetime.combine(appointment_date, time(8, 0))
    end_time = datetime.combine(appointment_date, time(18, 0))
    
    while current_time < end_time:
        slot_end = current_time + timedelta(minutes=30)
        
        time_slots.append({
            "time": current_time.strftime("%H:%M"),
            "available": True,
            "appointment_id": None
        })
        
        current_time = slot_end
    
    return {
        "barber_id": barber_id,
        "barber_name": f"Barbeiro {barber_id}",
        "date": date,
        "slots": time_slots,
        "message": "Teste de disponibilidade funcionando"
    } 

@router.get("/availability-public")
async def get_availability_public(
    barber_id: int,
    date: str  # YYYY-MM-DD format
):
    """Verificar disponibilidade de horários para um barbeiro em uma data (sem autenticação)"""
    
    try:
        appointment_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    # Gerar slots de 30 minutos (8h às 18h)
    time_slots = []
    current_time = datetime.combine(appointment_date, time(8, 0))
    end_time = datetime.combine(appointment_date, time(18, 0))
    
    while current_time < end_time:
        slot_end = current_time + timedelta(minutes=30)
        
        # Por enquanto, todos os horários estão disponíveis
        # TODO: Implementar verificação real de disponibilidade
        is_available = True
        
        time_slots.append({
            "time": current_time.strftime("%H:%M"),
            "available": is_available,
            "appointment_id": None
        })
        
        current_time = slot_end
    
    return {
        "barber_id": barber_id,
        "barber_name": f"Barbeiro {barber_id}",
        "date": date,
        "slots": time_slots
    } 

# Lista em memória para armazenar agendamentos (temporário)
appointments_storage = []

# Dados mock de barbeiros (copiado do barbers.py)
MOCK_BARBERS = [
    {
        "id": 1,
        "name": "Carlos Santos",
        "specialties": ["Corte Masculino", "Barba Completa", "Degradê"],
        "rating": 4.8,
        "experience_years": 8,
        "bio": "Especialista em cortes masculinos clássicos e modernos",
        "avatar_url": None,
        "is_active": True
    },
    {
        "id": 2,
        "name": "André Lima",
        "specialties": ["Corte Feminino", "Luzes", "Escova Progressiva"],
        "rating": 4.9,
        "experience_years": 12,
        "bio": "Expert em cortes femininos e técnicas de coloração",
        "avatar_url": None,
        "is_active": True
    },
    {
        "id": 3,
        "name": "Roberto Costa",
        "specialties": ["Corte + Barba", "Relaxamento", "Tratamentos"],
        "rating": 4.7,
        "experience_years": 15,
        "bio": "Veterano com experiência em todos os tipos de serviços",
        "avatar_url": None,
        "is_active": True
    }
]

# Dados mock de serviços (copiado do services.py)
MOCK_SERVICES = [
    {
        "id": 1,
        "name": "Corte Masculino",
        "description": "Corte clássico masculino com máquina e tesoura",
        "price": 45.00,
        "duration_minutes": 30,
        "category": "corte",
        "is_active": True
    },
    {
        "id": 2,
        "name": "Corte Feminino",
        "description": "Corte feminino personalizado com técnicas modernas",
        "price": 60.00,
        "duration_minutes": 45,
        "category": "corte",
        "is_active": True
    },
    {
        "id": 3,
        "name": "Barba Completa",
        "description": "Aparar, modelar e finalizar a barba",
        "price": 25.00,
        "duration_minutes": 20,
        "category": "barba",
        "is_active": True
    },
    {
        "id": 4,
        "name": "Corte + Barba",
        "description": "Pacote completo: corte de cabelo + barba",
        "price": 65.00,
        "duration_minutes": 50,
        "category": "combo",
        "is_active": True
    },
    {
        "id": 5,
        "name": "Degradê",
        "description": "Corte degradê com transições suaves",
        "price": 50.00,
        "duration_minutes": 35,
        "category": "corte",
        "is_active": True
    },
    {
        "id": 6,
        "name": "Luzes",
        "description": "Aplicação de luzes e mechas",
        "price": 120.00,
        "duration_minutes": 90,
        "category": "coloracao",
        "is_active": True
    },
    {
        "id": 7,
        "name": "Escova Progressiva",
        "description": "Tratamento alisante com escova progressiva",
        "price": 150.00,
        "duration_minutes": 120,
        "category": "tratamento",
        "is_active": True
    },
    {
        "id": 8,
        "name": "Relaxamento",
        "description": "Tratamento relaxante para cabelo e couro cabeludo",
        "price": 80.00,
        "duration_minutes": 60,
        "category": "tratamento",
        "is_active": True
    }
]

@router.post("/create-simple")
async def create_appointment_simple(
    appointment_data: dict
):
    """Criar agendamento simples (salvando em memória)"""
    
    try:
        # Validar dados básicos
        required_fields = ['barber_id', 'service_ids', 'appointment_date', 'time']
        for field in required_fields:
            if field not in appointment_data:
                return {
                    "success": False,
                    "error": f"Campo obrigatório ausente: {field}"
                }
        
        # Buscar nome do barbeiro
        barber = next((b for b in MOCK_BARBERS if b["id"] == appointment_data['barber_id']), None)
        if not barber:
            return {
                "success": False,
                "error": f"Barbeiro com ID {appointment_data['barber_id']} não encontrado"
            }
        
        # Buscar serviços selecionados
        selected_services = []
        total_price = 0
        total_duration = 0
        
        for service_id in appointment_data['service_ids']:
            service = next((s for s in MOCK_SERVICES if s["id"] == service_id), None)
            if service:
                selected_services.append({
                    "id": service["id"],
                    "name": service["name"],
                    "price": service["price"],
                    "duration_minutes": service["duration_minutes"]
                })
                total_price += service["price"]
                total_duration += service["duration_minutes"]
            else:
                return {
                    "success": False,
                    "error": f"Serviço com ID {service_id} não encontrado"
                }
        
        # Gerar ID único
        appointment_id = len(appointments_storage) + 1
        
        # Criar objeto do agendamento
        appointment = {
            "id": appointment_id,
            "client_id": 1,  # ID do cliente logado
            "client_name": "Michel Paulo",  # Nome do cliente
            "barber_id": appointment_data['barber_id'],
            "barber_name": barber["name"],  # Nome real do barbeiro
            "services": selected_services,  # Serviços com nomes reais
            "appointment_date": appointment_data['appointment_date'],
            "time": appointment_data['time'],
            "status": "SCHEDULED",
            "total_price": total_price,
            "total_duration": total_duration,
            "notes": appointment_data.get('notes', ''),
            "created_at": datetime.now().isoformat()
        }
        
        # Salvar na lista em memória
        appointments_storage.append(appointment)
        
        return {
            "success": True,
            "message": "Agendamento criado com sucesso!",
            "appointment": appointment
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Erro ao criar agendamento: {str(e)}"
        }

@router.post("/clear-all")
async def clear_all_appointments():
    """Limpar todos os agendamentos (para teste)"""
    global appointments_storage
    appointments_storage = []
    return {
        "success": True,
        "message": "Todos os agendamentos foram removidos",
        "count": 0
    }

@router.get("/admin/all")
async def get_all_appointments_admin(db: Session = Depends(get_db)):
    """Listar todos os agendamentos para o painel administrativo (do banco de dados)"""
    
    # Buscar todos os agendamentos do banco de dados
    appointments = db.query(Appointment).order_by(Appointment.appointment_date.desc()).all()
    
    # Formatar resposta
    result = []
    for appointment in appointments:
        barber = db.query(Barber).filter(Barber.id == appointment.barber_id).first()
        client = db.query(Client).filter(Client.id == appointment.client_id).first()
        
        result.append({
            "id": appointment.id,
            "appointment_code": appointment.appointment_number,
            "client_id": appointment.client_id,
            "client_name": client.name if client else appointment.client_name,
            "barber_id": appointment.barber_id,
            "barber_name": barber.professional_name if barber else "Unknown",
            "services": [],  # TODO: Implementar relacionamento many-to-many
            "appointment_date": appointment.appointment_date.isoformat(),
            "time": appointment.appointment_date.strftime("%H:%M"),
            "status": appointment.status.value,
            "total_price": float(appointment.total_amount or appointment.final_amount or 0),
            "total_duration": appointment.duration_minutes or 0,
            "notes": appointment.client_notes or "",
            "created_at": appointment.created_at.isoformat() if appointment.created_at else appointment.appointment_date.isoformat()
        })
    
    return result

@router.get("/my-appointments-test")
async def get_my_appointments_test():
    """Listar agendamentos reais (da memória)"""
    
    # Retornar agendamentos salvos em memória
    return appointments_storage

@router.get("/barber-appointments/{barber_id}")
async def get_barber_appointments(barber_id: int):
    """Listar agendamentos de um barbeiro específico (da memória)"""
    
    # Filtrar agendamentos do barbeiro específico
    barber_appointments = [
        apt for apt in appointments_storage 
        if apt["barber_id"] == barber_id
    ]
    
    return {
        "barber_id": barber_id,
        "appointments": barber_appointments,
        "total": len(barber_appointments)
    }

@router.get("/barber-appointments")
async def get_my_barber_appointments(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Listar agendamentos do barbeiro logado (do banco de dados)"""
    
    try:
        # Buscar barber_id do usuário logado
        barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
        
        if not barber:
            return {
                "barber_id": None,
                "barber_name": None,
                "appointments": [],
                "total": 0
            }
        
        # Buscar agendamentos do barbeiro no banco de dados
        appointments = db.query(Appointment).filter(
            Appointment.barber_id == barber.id
        ).order_by(Appointment.appointment_date.desc()).all()
        
        # Montar response
        result = []
        for appointment in appointments:
            try:
                client = db.query(Client).filter(Client.id == appointment.client_id).first()
                
                # Buscar serviços relacionados
                services_list = []
                try:
                    from sqlalchemy import text
                    services_result = db.execute(
                        text("""
                            SELECT s.name, s.price, aps.custom_price
                            FROM appointment_services aps
                            JOIN services s ON s.id = aps.service_id
                            WHERE aps.appointment_id = :apt_id
                        """),
                        {"apt_id": appointment.id}
                    )
                    
                    for row in services_result:
                        price = float(row[2]) if row[2] else float(row[1])
                        services_list.append({
                            "name": row[0],
                            "price": price
                        })
                except Exception:
                    services_list = [{"name": "N/A", "price": 0}]
                
                result.append({
                    "id": appointment.id,
                    "appointment_code": appointment.appointment_number,
                    "client_id": appointment.client_id,
                    "client_name": client.name if client else "Cliente Desconhecido",
                    "barber_id": appointment.barber_id,
                    "barber_name": barber.professional_name,
                    "services": services_list if services_list else [{"name": "N/A", "price": 0}],
                    "appointment_date": appointment.appointment_date.isoformat(),
                    "status": appointment.status.value,
                    "total_price": float(appointment.total_amount or appointment.final_amount or 0),
                    "total_duration": appointment.duration_minutes or 0,
                    "notes": appointment.client_notes or "",
                    "created_at": appointment.created_at.isoformat() if appointment.created_at else appointment.appointment_date.isoformat()
                })
            except Exception:
                continue
        
        return {
            "barber_id": barber.id,
            "barber_name": barber.professional_name,
            "appointments": result,
            "total": len(result)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar agendamentos: {str(e)}"
        )

@router.put("/{appointment_id}/status-simple")
async def update_appointment_status_simple(
    appointment_id: int,
    status_data: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualizar status de agendamento de forma simplificada"""
    
    # Buscar o agendamento no banco de dados
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    # Verificar permissões
    can_update = False
    if current_user.is_barber:
        barber = db.query(Barber).filter(Barber.user_id == current_user.id).first()
        can_update = barber and appointment.barber_id == barber.id
    elif current_user.can_manage_barbershop:
        can_update = True
    
    if not can_update:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Não autorizado a atualizar este agendamento"
        )
    
    # Validar e atualizar status
    new_status_str = status_data.get("status", "").upper()
    try:
        new_status = AppointmentStatus[new_status_str]
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status inválido: {new_status_str}. Status válidos: {[s.value for s in AppointmentStatus]}"
        )
    
    appointment.status = new_status
    db.commit()
    db.refresh(appointment)
    
    # Buscar dados relacionados para resposta
    barber = db.query(Barber).filter(Barber.id == appointment.barber_id).first()
    client = db.query(Client).filter(Client.id == appointment.client_id).first()
    
    return {
        "success": True,
        "message": f"Status atualizado para {new_status.value}",
        "appointment": {
            "id": appointment.id,
            "status": appointment.status.value,
            "client_name": client.name if client else "Unknown",
            "barber_name": barber.professional_name if barber else "Unknown",
            "appointment_date": appointment.appointment_date.isoformat()
        }
    } 