from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Numeric, Text, Enum, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
import enum
from app.core.database import Base

class ClientStatus(str, enum.Enum):
    """Status do cliente"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    BLOCKED = "blocked"
    VIP = "vip"

class Gender(str, enum.Enum):
    """Gênero"""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    NOT_INFORMED = "not_informed"

class Client(Base):
    """
    Modelo de cliente da barbearia.
    """
    __tablename__ = "clients"
    
    # === IDENTIFICAÇÃO ===
    id = Column(Integer, primary_key=True, index=True)
    barbershop_id = Column(Integer, ForeignKey("barbershops.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Se for usuário do sistema
    
    # === DADOS PESSOAIS ===
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(20), nullable=True, index=True)
    whatsapp = Column(String(20), nullable=True)
    cpf = Column(String(14), nullable=True, index=True)
    birth_date = Column(Date, nullable=True)
    gender = Column(Enum(Gender), default=Gender.NOT_INFORMED)
    
    # === ENDEREÇO ===
    address_street = Column(String(255), nullable=True)
    address_number = Column(String(20), nullable=True)
    address_complement = Column(String(100), nullable=True)
    address_neighborhood = Column(String(100), nullable=True)
    address_city = Column(String(100), nullable=True)
    address_state = Column(String(2), nullable=True)
    address_zipcode = Column(String(20), nullable=True)
    
    # === PERFIL ===
    avatar_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)  # Observações gerais
    preferences = Column(JSON, nullable=True)  # Preferências do cliente
    
    # === STATUS E FIDELIDADE ===
    status = Column(Enum(ClientStatus), default=ClientStatus.ACTIVE)
    is_vip = Column(Boolean, default=False)
    loyalty_points = Column(Integer, default=0)
    total_visits = Column(Integer, default=0)
    total_spent = Column(Numeric(10, 2), default=0.00)
    
    # === PREFERÊNCIAS DE CONTATO ===
    prefers_whatsapp = Column(Boolean, default=True)
    prefers_sms = Column(Boolean, default=True)
    prefers_email = Column(Boolean, default=True)
    prefers_call = Column(Boolean, default=False)
    
    # === DADOS COMERCIAIS ===
    first_visit = Column(DateTime, nullable=True)
    last_visit = Column(DateTime, nullable=True)
    average_ticket = Column(Numeric(10, 2), default=0.00)
    favorite_barber_id = Column(Integer, ForeignKey("barbers.id"), nullable=True)
    
    # === MARKETING ===
    referral_source = Column(String(100), nullable=True)  # Como conheceu a barbearia
    accepts_marketing = Column(Boolean, default=True)
    marketing_tags = Column(JSON, nullable=True)  # Tags para segmentação
    
    # === TIMESTAMPS ===
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)  # Soft delete
    
    # === RELACIONAMENTOS ===
    barbershop = relationship("Barbershop", back_populates="clients")
    user = relationship("User", back_populates="client_profile")
    appointments = relationship("Appointment", back_populates="client", cascade="all, delete-orphan")
    favorite_barber = relationship("Barber", foreign_keys=[favorite_barber_id])
    
    def __repr__(self):
        return f"<Client(id={self.id}, name='{self.name}', barbershop_id={self.barbershop_id})>"
    
    @property
    def age(self) -> int:
        """Calcula idade baseada na data de nascimento"""
        if not self.birth_date:
            return None
        from datetime import date
        today = date.today()
        return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))
    
    @property
    def full_phone(self) -> str:
        """Telefone formatado"""
        if not self.phone:
            return None
        # Formatação brasileira
        phone = ''.join(filter(str.isdigit, self.phone))
        if len(phone) == 11:
            return f"({phone[:2]}) {phone[2:7]}-{phone[7:]}"
        elif len(phone) == 10:
            return f"({phone[:2]}) {phone[2:6]}-{phone[6:]}"
        return self.phone
    
    @property
    def loyalty_level(self) -> str:
        """Nível de fidelidade baseado em pontos"""
        if self.loyalty_points < 100:
            return "Bronze"
        elif self.loyalty_points < 500:
            return "Prata"
        elif self.loyalty_points < 1000:
            return "Ouro"
        else:
            return "Diamante"
    
    def add_loyalty_points(self, amount: float):
        """Adiciona pontos de fidelidade baseado no valor gasto"""
        # 1 ponto por R$ 1,00 gasto
        points = int(amount)
        self.loyalty_points += points
        return points
    
    def update_visit_stats(self, amount: float):
        """Atualiza estatísticas de visitas"""
        self.total_visits += 1
        self.total_spent += amount
        if self.total_visits > 0:
            self.average_ticket = self.total_spent / self.total_visits
        
        from datetime import datetime
        now = datetime.now()
        if not self.first_visit:
            self.first_visit = now
        self.last_visit = now
    
    def to_dict(self) -> dict:
        """Converte para dicionário (para JSON)"""
        return {
            "id": self.id,
            "barbershop_id": self.barbershop_id,
            "user_id": self.user_id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "full_phone": self.full_phone,
            "whatsapp": self.whatsapp,
            "cpf": self.cpf,
            "birth_date": self.birth_date.isoformat() if self.birth_date else None,
            "age": self.age,
            "gender": self.gender.value if self.gender else None,
            "avatar_url": self.avatar_url,
            "notes": self.notes,
            "preferences": self.preferences,
            "status": self.status.value,
            "is_vip": self.is_vip,
            "loyalty_points": self.loyalty_points,
            "loyalty_level": self.loyalty_level,
            "total_visits": self.total_visits,
            "total_spent": float(self.total_spent),
            "average_ticket": float(self.average_ticket),
            "first_visit": self.first_visit.isoformat() if self.first_visit else None,
            "last_visit": self.last_visit.isoformat() if self.last_visit else None,
            "favorite_barber_id": self.favorite_barber_id,
            "referral_source": self.referral_source,
            "accepts_marketing": self.accepts_marketing,
            "marketing_tags": self.marketing_tags,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        } 