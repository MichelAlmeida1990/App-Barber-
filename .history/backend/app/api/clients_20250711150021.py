from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.api.auth import get_current_active_user
from app.models.user import User, UserRole
from app.models.client import Client, ClientStatus, Gender

router = APIRouter()

# === SCHEMAS ===

class ClientBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    cpf: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[Gender] = Gender.NOT_INFORMED
    address_street: Optional[str] = None
    address_number: Optional[str] = None
    address_complement: Optional[str] = None
    address_neighborhood: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_zipcode: Optional[str] = None
    notes: Optional[str] = None
    referral_source: Optional[str] = None
    accepts_marketing: bool = True
    prefers_whatsapp: bool = True
    prefers_sms: bool = True
    prefers_email: bool = True
    prefers_call: bool = False

class ClientCreate(ClientBase):
    barbershop_id: int = 1  # Por padrão

class ClientUpdate(ClientBase):
    name: Optional[str] = None

class ClientResponse(ClientBase):
    id: int
    barbershop_id: int
    user_id: Optional[int] = None
    status: ClientStatus
    is_vip: bool
    loyalty_points: int
    loyalty_level: str
    total_visits: int
    total_spent: float
    average_ticket: float
    first_visit: Optional[datetime] = None
    last_visit: Optional[datetime] = None
    age: Optional[int] = None
    full_phone: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ClientStats(BaseModel):
    total_clients: int
    active_clients: int
    vip_clients: int
    new_clients_this_month: int
    average_age: Optional[float] = None
    top_referral_sources: List[dict]
    loyalty_distribution: dict

class LoyaltyPointsUpdate(BaseModel):
    points: int
    reason: str

# === FUNÇÕES AUXILIARES ===

def validate_admin_or_manager(current_user: User):
    """Valida se o usuário é admin ou manager"""
    if not current_user.can_manage_barbershop:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and managers can perform this action"
        )

# === ENDPOINTS ===

# Endpoint de teste
@router.get("/test")
async def test_clients_api():
    """
    Endpoint de teste para verificar se a API de clientes está funcionando.
    """
    return {
        "status": "success",
        "message": "✅ API de Clientes funcionando perfeitamente!",
        "timestamp": datetime.now().isoformat(),
        "endpoint": "clients"
    }

@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    client_data: ClientCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Criar novo cliente.
    
    Requer permissão de admin/manager/receptionist ou cliente criando próprio perfil.
    """
    
    # Verificar se email já existe
    if client_data.email:
        existing_client = db.query(Client).filter(
            and_(Client.email == client_data.email, Client.deleted_at.is_(None))
        ).first()
        if existing_client:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Client with this email already exists"
            )
    
    # Verificar se CPF já existe
    if client_data.cpf:
        existing_cpf = db.query(Client).filter(
            and_(Client.cpf == client_data.cpf, Client.deleted_at.is_(None))
        ).first()
        if existing_cpf:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Client with this CPF already exists"
            )
    
    # Criar cliente
    db_client = Client(
        **client_data.model_dump(),
        status=ClientStatus.ACTIVE
    )
    
    # Se cliente está criando próprio perfil, vincular ao usuário
    if current_user.is_client:
        db_client.user_id = current_user.id
    
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    
    return ClientResponse(**db_client.to_dict())

@router.get("/", response_model=List[ClientResponse])
async def list_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None, description="Buscar por nome, email ou telefone"),
    status: Optional[ClientStatus] = Query(None),
    is_vip: Optional[bool] = Query(None),
    gender: Optional[Gender] = Query(None),
    city: Optional[str] = Query(None),
    barbershop_id: Optional[int] = Query(None),
    sort_by: str = Query("created_at", description="Campo para ordenação"),
    sort_order: str = Query("desc", description="Ordem: asc ou desc"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Listar clientes com filtros e busca.
    """
    
    # Construir query base
    query = db.query(Client).filter(Client.deleted_at.is_(None))
    
    # Se cliente, mostrar apenas seu próprio perfil
    if current_user.is_client:
        query = query.filter(Client.user_id == current_user.id)
    
    # Filtros
    if barbershop_id:
        query = query.filter(Client.barbershop_id == barbershop_id)
    
    if status:
        query = query.filter(Client.status == status)
    
    if is_vip is not None:
        query = query.filter(Client.is_vip == is_vip)
    
    if gender:
        query = query.filter(Client.gender == gender)
    
    if city:
        query = query.filter(Client.address_city.ilike(f"%{city}%"))
    
    # Busca textual
    if search:
        search_filter = or_(
            Client.name.ilike(f"%{search}%"),
            Client.email.ilike(f"%{search}%"),
            Client.phone.ilike(f"%{search}%"),
            Client.cpf.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Ordenação
    if hasattr(Client, sort_by):
        order_col = getattr(Client, sort_by)
        if sort_order.lower() == "asc":
            query = query.order_by(order_col.asc())
        else:
            query = query.order_by(order_col.desc())
    
    # Paginação
    clients = query.offset(skip).limit(limit).all()
    
    return [ClientResponse(**client.to_dict()) for client in clients]

@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obter dados de um cliente específico.
    """
    
    client = db.query(Client).filter(
        and_(Client.id == client_id, Client.deleted_at.is_(None))
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Se cliente, só pode ver próprio perfil
    if current_user.is_client and client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return ClientResponse(**client.to_dict())

@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: int,
    client_data: ClientUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Atualizar dados de um cliente.
    """
    
    client = db.query(Client).filter(
        and_(Client.id == client_id, Client.deleted_at.is_(None))
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Se cliente, só pode editar próprio perfil
    if current_user.is_client and client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Verificar email único
    if client_data.email and client_data.email != client.email:
        existing_email = db.query(Client).filter(
            and_(
                Client.email == client_data.email,
                Client.id != client_id,
                Client.deleted_at.is_(None)
            )
        ).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
    
    # Atualizar campos
    update_data = client_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    
    db.commit()
    db.refresh(client)
    
    return ClientResponse(**client.to_dict())

@router.delete("/{client_id}")
async def delete_client(
    client_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Excluir cliente (soft delete).
    
    Requer permissão de admin/manager.
    """
    validate_admin_or_manager(current_user)
    
    client = db.query(Client).filter(
        and_(Client.id == client_id, Client.deleted_at.is_(None))
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Soft delete
    client.deleted_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Client deleted successfully"}

@router.post("/{client_id}/loyalty", response_model=ClientResponse)
async def update_loyalty_points(
    client_id: int,
    loyalty_data: LoyaltyPointsUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Atualizar pontos de fidelidade de um cliente.
    
    Requer permissão de admin/manager/receptionist.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    client = db.query(Client).filter(
        and_(Client.id == client_id, Client.deleted_at.is_(None))
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Atualizar pontos
    client.loyalty_points += loyalty_data.points
    
    # Verificar se virou VIP (1000+ pontos)
    if client.loyalty_points >= 1000 and not client.is_vip:
        client.is_vip = True
    elif client.loyalty_points < 1000 and client.is_vip:
        client.is_vip = False
    
    db.commit()
    db.refresh(client)
    
    return ClientResponse(**client.to_dict())

@router.get("/stats/overview", response_model=ClientStats)
async def get_client_stats(
    barbershop_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obter estatísticas dos clientes.
    
    Requer permissão de admin/manager.
    """
    validate_admin_or_manager(current_user)
    
    # Base query
    base_query = db.query(Client).filter(Client.deleted_at.is_(None))
    if barbershop_id:
        base_query = base_query.filter(Client.barbershop_id == barbershop_id)
    
    # Estatísticas básicas
    total_clients = base_query.count()
    active_clients = base_query.filter(Client.status == ClientStatus.ACTIVE).count()
    vip_clients = base_query.filter(Client.is_vip == True).count()
    
    # Novos clientes este mês
    from datetime import datetime
    start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_clients_this_month = base_query.filter(Client.created_at >= start_of_month).count()
    
    # Idade média (clientes com data de nascimento)
    clients_with_birth = base_query.filter(Client.birth_date.is_not(None)).all()
    average_age = None
    if clients_with_birth:
        ages = [client.age for client in clients_with_birth if client.age]
        average_age = sum(ages) / len(ages) if ages else None
    
    # Top fontes de referência
    from sqlalchemy import func
    top_referrals = db.query(
        Client.referral_source,
        func.count(Client.id).label('count')
    ).filter(
        and_(Client.deleted_at.is_(None), Client.referral_source.is_not(None))
    ).group_by(Client.referral_source).order_by(func.count(Client.id).desc()).limit(5).all()
    
    top_referral_sources = [
        {"source": ref[0], "count": ref[1]} for ref in top_referrals
    ]
    
    # Distribuição de fidelidade
    loyalty_distribution = {
        "Bronze": base_query.filter(Client.loyalty_points < 100).count(),
        "Prata": base_query.filter(and_(Client.loyalty_points >= 100, Client.loyalty_points < 500)).count(),
        "Ouro": base_query.filter(and_(Client.loyalty_points >= 500, Client.loyalty_points < 1000)).count(),
        "Diamante": base_query.filter(Client.loyalty_points >= 1000).count(),
    }
    
    return ClientStats(
        total_clients=total_clients,
        active_clients=active_clients,
        vip_clients=vip_clients,
        new_clients_this_month=new_clients_this_month,
        average_age=average_age,
        top_referral_sources=top_referral_sources,
        loyalty_distribution=loyalty_distribution
    )

@router.get("/{client_id}/history")
async def get_client_history(
    client_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obter histórico de agendamentos de um cliente.
    """
    
    client = db.query(Client).filter(
        and_(Client.id == client_id, Client.deleted_at.is_(None))
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Se cliente, só pode ver próprio histórico
    if current_user.is_client and client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Por enquanto retorna estrutura básica
    # TODO: Implementar quando tivermos o histórico completo de agendamentos
    return {
        "client_id": client_id,
        "client_name": client.name,
        "total_appointments": client.total_visits,
        "total_spent": float(client.total_spent),
        "first_visit": client.first_visit.isoformat() if client.first_visit else None,
        "last_visit": client.last_visit.isoformat() if client.last_visit else None,
        "loyalty_level": client.loyalty_level,
        "appointments": []  # TODO: Buscar do modelo de agendamentos
    } 