from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, Text, Time, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from app.core.database import Base

class Barbershop(Base):
    """
    Modelo da barbearia.
    Representa uma unidade de barbearia.
    """
    __tablename__ = "barbershops"
    
    # === IDENTIFICAÇÃO ===
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # === CONTATO ===
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    whatsapp = Column(String(20), nullable=True)
    website = Column(String(500), nullable=True)
    
    # === ENDEREÇO ===
    address_street = Column(String(255), nullable=True)
    address_number = Column(String(20), nullable=True)
    address_complement = Column(String(100), nullable=True)
    address_neighborhood = Column(String(100), nullable=True)
    address_city = Column(String(100), nullable=True)
    address_state = Column(String(2), nullable=True)
    address_zipcode = Column(String(20), nullable=True)
    address_country = Column(String(2), default="BR")
    
    # === COORDENADAS ===
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)
    
    # === IMAGENS ===
    logo_url = Column(String(500), nullable=True)
    cover_url = Column(String(500), nullable=True)
    gallery_urls = Column(JSON, nullable=True)  # Array de URLs das fotos
    
    # === CONFIGURAÇÕES DE FUNCIONAMENTO ===
    # Segunda a Domingo (0=Segunda, 6=Domingo)
    opening_hours = Column(JSON, nullable=True)  # {"0": {"open": "08:00", "close": "18:00", "break_start": "12:00", "break_end": "13:00"}}
    
    # === CONFIGURAÇÕES DE NEGÓCIO ===
    default_appointment_duration = Column(Integer, default=30)  # minutos
    max_appointments_per_day = Column(Integer, default=20)
    advance_booking_days = Column(Integer, default=30)  # quantos dias de antecedência
    cancellation_deadline_hours = Column(Integer, default=2)  # prazo para cancelar
    
    # === COMISSÕES E PAGAMENTOS ===
    default_commission_rate = Column(Numeric(5, 4), default=0.6000)  # 60%
    accepts_cash = Column(Boolean, default=True)
    accepts_card = Column(Boolean, default=True)
    accepts_pix = Column(Boolean, default=True)
    
    # === REDES SOCIAIS ===
    instagram_url = Column(String(500), nullable=True)
    facebook_url = Column(String(500), nullable=True)
    google_my_business_url = Column(String(500), nullable=True)
    
    # === STATUS E CONFIGURAÇÕES ===
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    accepts_online_booking = Column(Boolean, default=True)
    requires_deposit = Column(Boolean, default=False)
    deposit_amount = Column(Numeric(10, 2), default=0.00)
    
    # === CONFIGURAÇÕES DE NOTIFICAÇÃO ===
    notification_settings = Column(JSON, nullable=True)  # Configurações de notificação
    
    # === TIMEZONE ===
    timezone = Column(String(50), default="America/Sao_Paulo")
    
    # === OWNER ===
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # === TIMESTAMPS ===
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)  # Soft delete
    
    # === RELACIONAMENTOS ===
    # owner = relationship("User", back_populates="owned_barbershops")
    barbers = relationship("Barber", back_populates="barbershop", cascade="all, delete-orphan")
    clients = relationship("Client", back_populates="barbershop", cascade="all, delete-orphan")
    services = relationship("Service", back_populates="barbershop", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="barbershop", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Barbershop(id={self.id}, name='{self.name}', owner_id={self.owner_id})>"
    
    @property
    def full_address(self) -> str:
        """Endereço completo formatado"""
        parts = []
        if self.address_street:
            street_part = self.address_street
            if self.address_number:
                street_part += f", {self.address_number}"
            if self.address_complement:
                street_part += f", {self.address_complement}"
            parts.append(street_part)
        
        if self.address_neighborhood:
            parts.append(self.address_neighborhood)
        
        if self.address_city and self.address_state:
            parts.append(f"{self.address_city}, {self.address_state}")
        
        if self.address_zipcode:
            parts.append(f"CEP: {self.address_zipcode}")
        
        return " - ".join(parts)
    
    @property
    def is_open_now(self) -> bool:
        """Verifica se a barbearia está aberta agora"""
        from datetime import datetime
        import pytz
        
        if not self.opening_hours:
            return False
        
        # Obter hora atual no timezone da barbearia
        tz = pytz.timezone(self.timezone)
        now = datetime.now(tz)
        weekday = str(now.weekday())  # 0=Segunda, 6=Domingo
        current_time = now.time()
        
        day_hours = self.opening_hours.get(weekday)
        if not day_hours:
            return False
        
        # Verificar se está dentro do horário de funcionamento
        from datetime import time
        open_time = time.fromisoformat(day_hours.get("open", "00:00"))
        close_time = time.fromisoformat(day_hours.get("close", "23:59"))
        
        # Verificar intervalo (se houver)
        break_start = day_hours.get("break_start")
        break_end = day_hours.get("break_end")
        
        if break_start and break_end:
            break_start_time = time.fromisoformat(break_start)
            break_end_time = time.fromisoformat(break_end)
            
            # Se está no intervalo, não está aberto
            if break_start_time <= current_time <= break_end_time:
                return False
        
        return open_time <= current_time <= close_time
    
    def get_available_times(self, date, duration_minutes: int = 30) -> list:
        """Obter horários disponíveis para um dia específico"""
        # TODO: Implementar lógica de horários disponíveis
        # Considerar: horários de funcionamento, agendamentos existentes, intervalos
        pass
    
    def to_dict(self) -> dict:
        """Converte para dicionário (para JSON)"""
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "email": self.email,
            "phone": self.phone,
            "whatsapp": self.whatsapp,
            "website": self.website,
            "full_address": self.full_address,
            "latitude": float(self.latitude) if self.latitude else None,
            "longitude": float(self.longitude) if self.longitude else None,
            "logo_url": self.logo_url,
            "cover_url": self.cover_url,
            "gallery_urls": self.gallery_urls,
            "opening_hours": self.opening_hours,
            "is_active": self.is_active,
            "is_featured": self.is_featured,
            "accepts_online_booking": self.accepts_online_booking,
            "is_open_now": self.is_open_now,
            "instagram_url": self.instagram_url,
            "facebook_url": self.facebook_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        } 