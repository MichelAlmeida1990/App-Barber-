from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Date, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class CommissionType(str, enum.Enum):
    """Tipos de comissão"""
    SERVICE = "service"      # Comissão por serviço
    PRODUCT = "product"      # Comissão por produto

class Commission(Base):
    """
    Modelo de comissão para barbeiros.
    Registra comissões por serviços e produtos vendidos.
    """
    __tablename__ = "commissions"
    
    # === IDENTIFICAÇÃO ===
    id = Column(Integer, primary_key=True, index=True)
    
    # === RELACIONAMENTOS ===
    barber_id = Column(Integer, ForeignKey("barbers.id"), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True, index=True)
    
    # === DADOS DA COMISSÃO ===
    commission_type = Column(Enum(CommissionType), nullable=False)
    amount = Column(Float, nullable=False)  # Valor da comissão
    percentage = Column(Float, nullable=False)  # Percentual da comissão
    description = Column(Text, nullable=True)
    
    # === DATAS ===
    date = Column(Date, nullable=False, index=True)  # Data da comissão
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # === RELACIONAMENTOS ===
    barber = relationship("Barber", back_populates="commissions")
    appointment = relationship("Appointment", back_populates="commissions")
    product = relationship("Product", back_populates="commissions")
    
    def __repr__(self):
        return f"<Commission(id={self.id}, barber_id={self.barber_id}, amount={self.amount}, type='{self.commission_type}')>"
    
    @property
    def formatted_amount(self) -> str:
        """Valor formatado da comissão"""
        return f"R$ {self.amount:.2f}"
    
    @property
    def formatted_percentage(self) -> str:
        """Percentual formatado"""
        return f"{self.percentage:.1f}%"
    
    @property
    def is_service_commission(self) -> bool:
        """Verifica se é comissão por serviço"""
        return self.commission_type == CommissionType.SERVICE
    
    @property
    def is_product_commission(self) -> bool:
        """Verifica se é comissão por produto"""
        return self.commission_type == CommissionType.PRODUCT 