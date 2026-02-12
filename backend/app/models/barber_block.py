from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class BarberBlock(Base):
    """
    Modelo para bloqueios de agenda de barbeiros.
    Permite que barbeiros bloqueiem períodos da agenda.
    """
    __tablename__ = "barber_blocks"
    
    # === IDENTIFICAÇÃO ===
    id = Column(Integer, primary_key=True, index=True)
    
    # === RELACIONAMENTOS ===
    barber_id = Column(Integer, ForeignKey("barbers.id"), nullable=False, index=True)
    
    # === PERÍODO DO BLOQUEIO ===
    block_date = Column(Date, nullable=False, index=True)  # Data do bloqueio
    start_time = Column(DateTime(timezone=True), nullable=True)  # Horário inicial (se for bloqueio parcial)
    end_time = Column(DateTime(timezone=True), nullable=True)  # Horário final (se for bloqueio parcial)
    all_day = Column(Boolean, default=True)  # Se True, bloqueia o dia inteiro
    
    # === INFORMAÇÕES ===
    reason = Column(String(255), nullable=True)  # Motivo do bloqueio
    notes = Column(Text, nullable=True)  # Observações adicionais
    
    # === CONTROLE ===
    is_active = Column(Boolean, default=True)  # Se o bloqueio está ativo
    
    # === TIMESTAMPS ===
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)  # Soft delete
    
    # === RELACIONAMENTOS ===
    barber = relationship("Barber", back_populates="blocks")
    
    def __repr__(self):
        return f"<BarberBlock(id={self.id}, barber_id={self.barber_id}, date={self.block_date}, all_day={self.all_day})>"
    
    @property
    def is_full_day_block(self) -> bool:
        """Verifica se é bloqueio de dia inteiro"""
        return self.all_day
    
    @property
    def formatted_period(self) -> str:
        """Retorna o período formatado"""
        if self.all_day:
            return "Dia inteiro"
        
        if self.start_time and self.end_time:
            return f"{self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}"
        
        return "Horário não definido"
    
    def to_dict(self) -> dict:
        """Converte para dicionário (para JSON)"""
        return {
            "id": self.id,
            "barber_id": self.barber_id,
            "block_date": self.block_date.isoformat() if self.block_date else None,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "all_day": self.all_day,
            "reason": self.reason,
            "notes": self.notes,
            "is_active": self.is_active,
            "formatted_period": self.formatted_period,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }









