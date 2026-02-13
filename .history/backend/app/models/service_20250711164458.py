from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from app.core.database import Base

class Service(Base):
    """
    Modelo de serviços oferecidos pela barbearia.
    """
    __tablename__ = "services"
    
    # === IDENTIFICAÇÃO ===
    id = Column(Integer, primary_key=True, index=True)
    barbershop_id = Column(Integer, ForeignKey("barbershops.id"), nullable=False)
    barber_id = Column(Integer, ForeignKey("barbers.id"), nullable=True)  # Se for específico do barbeiro
    
    # === DADOS BÁSICOS ===
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True, index=True)  # "corte", "barba", "combo", etc.
    
    # === PREÇOS ===
    price = Column(Numeric(10, 2), nullable=False)
    promotional_price = Column(Numeric(10, 2), nullable=True)
    is_promotional = Column(Boolean, default=False)
    
    # === TEMPO ===
    duration_minutes = Column(Integer, nullable=False, default=30)
    preparation_time = Column(Integer, default=0)  # Tempo de preparação
    cleanup_time = Column(Integer, default=5)      # Tempo de limpeza
    
    # === CONFIGURAÇÕES ===
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    requires_appointment = Column(Boolean, default=True)
    max_per_day = Column(Integer, nullable=True)  # Limite por dia
    
    # === IMAGENS ===
    image_url = Column(String(500), nullable=True)
    gallery_urls = Column(JSON, nullable=True)  # Array de URLs
    
    # === REQUISITOS ===
    age_restriction = Column(Integer, nullable=True)  # Idade mínima
    gender_restriction = Column(String(20), nullable=True)  # "male", "female", null
    special_requirements = Column(Text, nullable=True)
    
    # === COMISSÃO ===
    commission_rate = Column(Numeric(5, 4), nullable=True)  # Se diferente do padrão
    
    # === ESTATÍSTICAS ===
    total_bookings = Column(Integer, default=0)
    total_revenue = Column(Numeric(10, 2), default=0.00)
    average_rating = Column(Numeric(3, 2), default=0.00)
    
    # === TIMESTAMPS ===
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)  # Soft delete
    
    # === RELACIONAMENTOS ===
    # barbershop = relationship("Barbershop", back_populates="services")
    # barber = relationship("Barber", back_populates="services")
    # appointments = relationship("Appointment", secondary="appointment_services", back_populates="services")
    
    def __repr__(self):
        return f"<Service(id={self.id}, name='{self.name}', price={self.price})>"
    
    @property
    def effective_price(self) -> float:
        """Preço efetivo (promocional se ativo, senão normal)"""
        if self.is_promotional and self.promotional_price:
            return float(self.promotional_price)
        return float(self.price)
    
    @property
    def total_duration(self) -> int:
        """Duração total incluindo preparação e limpeza"""
        return self.duration_minutes + self.preparation_time + self.cleanup_time
    
    @property
    def discount_percentage(self) -> float:
        """Percentual de desconto se em promoção"""
        if not self.is_promotional or not self.promotional_price:
            return 0.0
        
        discount = float(self.price) - float(self.promotional_price)
        return (discount / float(self.price)) * 100
    
    def is_available_for(self, client_age: int = None, client_gender: str = None) -> bool:
        """Verifica se o serviço está disponível para o cliente"""
        if not self.is_active:
            return False
        
        if self.age_restriction and client_age and client_age < self.age_restriction:
            return False
        
        if self.gender_restriction and client_gender and client_gender != self.gender_restriction:
            return False
        
        return True
    
    def update_stats(self, amount: float, rating: int = None):
        """Atualiza estatísticas do serviço"""
        self.total_bookings += 1
        self.total_revenue += amount
        
        if rating:
            # Atualizar média de avaliações
            total_ratings = self.average_rating * (self.total_bookings - 1)
            self.average_rating = (total_ratings + rating) / self.total_bookings
    
    def to_dict(self) -> dict:
        """Converte para dicionário (para JSON)"""
        return {
            "id": self.id,
            "barbershop_id": self.barbershop_id,
            "barber_id": self.barber_id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "price": float(self.price),
            "promotional_price": float(self.promotional_price) if self.promotional_price else None,
            "is_promotional": self.is_promotional,
            "effective_price": self.effective_price,
            "discount_percentage": self.discount_percentage,
            "duration_minutes": self.duration_minutes,
            "preparation_time": self.preparation_time,
            "cleanup_time": self.cleanup_time,
            "total_duration": self.total_duration,
            "is_active": self.is_active,
            "is_featured": self.is_featured,
            "requires_appointment": self.requires_appointment,
            "max_per_day": self.max_per_day,
            "image_url": self.image_url,
            "gallery_urls": self.gallery_urls,
            "age_restriction": self.age_restriction,
            "gender_restriction": self.gender_restriction,
            "special_requirements": self.special_requirements,
            "commission_rate": float(self.commission_rate) if self.commission_rate else None,
            "total_bookings": self.total_bookings,
            "total_revenue": float(self.total_revenue),
            "average_rating": float(self.average_rating),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        } 