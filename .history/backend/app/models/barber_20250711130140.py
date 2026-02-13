from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, Text, JSON, Time
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from app.core.database import Base

class Barber(Base):
    """
    Modelo de barbeiro da barbearia.
    """
    __tablename__ = "barbers"
    
    # === IDENTIFICAÇÃO ===
    id = Column(Integer, primary_key=True, index=True)
    barbershop_id = Column(Integer, ForeignKey("barbershops.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # === DADOS PROFISSIONAIS ===
    professional_name = Column(String(255), nullable=False, index=True)  # Nome artístico
    bio = Column(Text, nullable=True)
    experience_years = Column(Integer, default=0)
    specialties = Column(JSON, nullable=True)  # Lista de especialidades
    
    # === CONFIGURAÇÕES DE TRABALHO ===
    is_active = Column(Boolean, default=True)
    accepts_appointments = Column(Boolean, default=True)
    max_appointments_per_day = Column(Integer, default=15)
    
    # === HORÁRIOS DE TRABALHO ===
    # Segunda a Domingo (0=Segunda, 6=Domingo)
    working_hours = Column(JSON, nullable=True)  # {"0": {"start": "08:00", "end": "18:00", "break_start": "12:00", "break_end": "13:00"}}
    
    # === COMISSÕES ===
    commission_rate = Column(Numeric(5, 4), default=0.6000)  # 60%
    fixed_salary = Column(Numeric(10, 2), default=0.00)
    
    # === CONTATO ===
    phone = Column(String(20), nullable=True)
    whatsapp = Column(String(20), nullable=True)
    instagram = Column(String(100), nullable=True)
    
    # === IMAGENS ===
    avatar_url = Column(String(500), nullable=True)
    portfolio_urls = Column(JSON, nullable=True)  # Array de URLs do portfólio
    
    # === ESTATÍSTICAS ===
    total_appointments = Column(Integer, default=0)
    total_earnings = Column(Numeric(10, 2), default=0.00)
    average_rating = Column(Numeric(3, 2), default=0.00)
    total_reviews = Column(Integer, default=0)
    
    # === CONFIGURAÇÕES ===
    notification_settings = Column(JSON, nullable=True)
    auto_accept_appointments = Column(Boolean, default=False)
    
    # === TIMESTAMPS ===
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)  # Soft delete
    
    # === RELACIONAMENTOS ===
    barbershop = relationship("Barbershop", back_populates="barbers")
    user = relationship("User", back_populates="barber_profile")
    appointments = relationship("Appointment", back_populates="barber", cascade="all, delete-orphan")
    services = relationship("Service", back_populates="barber", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Barber(id={self.id}, name='{self.professional_name}', barbershop_id={self.barbershop_id})>"
    
    @property
    def is_working_now(self) -> bool:
        """Verifica se o barbeiro está trabalhando agora"""
        from datetime import datetime
        import pytz
        
        if not self.is_active or not self.working_hours:
            return False
        
        # Usar timezone da barbearia
        tz = pytz.timezone("America/Sao_Paulo")  # TODO: pegar do barbershop
        now = datetime.now(tz)
        weekday = str(now.weekday())
        current_time = now.time()
        
        day_hours = self.working_hours.get(weekday)
        if not day_hours:
            return False
        
        from datetime import time
        start_time = time.fromisoformat(day_hours.get("start", "00:00"))
        end_time = time.fromisoformat(day_hours.get("end", "23:59"))
        
        # Verificar intervalo
        break_start = day_hours.get("break_start")
        break_end = day_hours.get("break_end")
        
        if break_start and break_end:
            break_start_time = time.fromisoformat(break_start)
            break_end_time = time.fromisoformat(break_end)
            
            if break_start_time <= current_time <= break_end_time:
                return False
        
        return start_time <= current_time <= end_time
    
    def get_available_slots(self, date, duration_minutes: int = 30) -> list:
        """Obter horários disponíveis para uma data"""
        # TODO: Implementar lógica de horários disponíveis
        pass
    
    def calculate_commission(self, amount: float) -> float:
        """Calcula comissão do barbeiro"""
        return float(amount * self.commission_rate)
    
    def update_stats(self, appointment_amount: float, rating: int = None):
        """Atualiza estatísticas do barbeiro"""
        self.total_appointments += 1
        commission = self.calculate_commission(appointment_amount)
        self.total_earnings += commission
        
        if rating:
            # Recalcular média de avaliações
            total_rating = (self.average_rating * self.total_reviews) + rating
            self.total_reviews += 1
            self.average_rating = total_rating / self.total_reviews
    
    def to_dict(self) -> dict:
        """Converte para dicionário (para JSON)"""
        return {
            "id": self.id,
            "barbershop_id": self.barbershop_id,
            "user_id": self.user_id,
            "professional_name": self.professional_name,
            "bio": self.bio,
            "experience_years": self.experience_years,
            "specialties": self.specialties,
            "is_active": self.is_active,
            "accepts_appointments": self.accepts_appointments,
            "max_appointments_per_day": self.max_appointments_per_day,
            "working_hours": self.working_hours,
            "commission_rate": float(self.commission_rate),
            "fixed_salary": float(self.fixed_salary),
            "phone": self.phone,
            "whatsapp": self.whatsapp,
            "instagram": self.instagram,
            "avatar_url": self.avatar_url,
            "portfolio_urls": self.portfolio_urls,
            "total_appointments": self.total_appointments,
            "total_earnings": float(self.total_earnings),
            "average_rating": float(self.average_rating),
            "total_reviews": self.total_reviews,
            "is_working_now": self.is_working_now,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        } 