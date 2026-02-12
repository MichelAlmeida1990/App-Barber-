from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, Text, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class ServiceSessionStatus(str, enum.Enum):
    """Status da sessão de serviço"""
    NOT_STARTED = "not_started"      # Ainda não iniciado
    IN_PROGRESS = "in_progress"      # Em andamento
    PAUSED = "paused"                # Em pausa (aguardando produto fazer efeito)
    RESUMED = "resumed"               # Retomado após pausa
    COMPLETED = "completed"          # Finalizado
    CANCELLED = "cancelled"           # Cancelado

class ServiceSession(Base):
    """
    Modelo para gerenciar sessões de serviços com pausas.
    Permite que um barbeiro pause um serviço (ex: progressiva) e atenda outros clientes durante a pausa.
    """
    __tablename__ = "service_sessions"
    
    # === IDENTIFICAÇÃO ===
    id = Column(Integer, primary_key=True, index=True)
    
    # === RELACIONAMENTOS ===
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    barber_id = Column(Integer, ForeignKey("barbers.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    
    # === ETAPAS DO SERVIÇO ===
    status = Column(Enum(ServiceSessionStatus), default=ServiceSessionStatus.NOT_STARTED, nullable=False)
    
    # Tempo de cada etapa
    start_time = Column(DateTime(timezone=True), nullable=True)  # Quando iniciou
    pause_time = Column(DateTime(timezone=True), nullable=True)  # Quando pausou
    resume_time = Column(DateTime(timezone=True), nullable=True)  # Quando retomou
    end_time = Column(DateTime(timezone=True), nullable=True)  # Quando finalizou
    
    # Durações
    active_duration_minutes = Column(Integer, default=0)  # Tempo ativo (sem contar pausa)
    pause_duration_minutes = Column(Integer, default=0)   # Tempo em pausa
    total_duration_minutes = Column(Integer, default=0)  # Duração total
    
    # === CONFIGURAÇÕES ===
    has_pause = Column(Boolean, default=False)  # Se o serviço requer pausa
    expected_pause_minutes = Column(Integer, default=0)  # Tempo esperado de pausa (ex: 60min para progressiva)
    
    # === OBSERVAÇÕES ===
    notes = Column(Text, nullable=True)  # Observações sobre a sessão
    
    # === TIMESTAMPS ===
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # === RELACIONAMENTOS ===
    # appointment = relationship("Appointment", back_populates="service_sessions")
    # service = relationship("Service", back_populates="sessions")
    # barber = relationship("Barber", back_populates="service_sessions")
    # client = relationship("Client", back_populates="service_sessions")
    
    def __repr__(self):
        return f"<ServiceSession(id={self.id}, appointment_id={self.appointment_id}, status='{self.status.value}')>"
    
    @property
    def is_paused(self) -> bool:
        """Verifica se está em pausa"""
        return self.status == ServiceSessionStatus.PAUSED
    
    @property
    def is_active(self) -> bool:
        """Verifica se está ativo (em andamento ou retomado)"""
        return self.status in [ServiceSessionStatus.IN_PROGRESS, ServiceSessionStatus.RESUMED]
    
    @property
    def can_be_paused(self) -> bool:
        """Verifica se pode ser pausado"""
        return self.status == ServiceSessionStatus.IN_PROGRESS and self.has_pause
    
    @property
    def can_be_resumed(self) -> bool:
        """Verifica se pode ser retomado"""
        return self.status == ServiceSessionStatus.PAUSED
    
    @property
    def can_be_completed(self) -> bool:
        """Verifica se pode ser finalizado"""
        return self.status in [ServiceSessionStatus.IN_PROGRESS, ServiceSessionStatus.RESUMED]
    
    def pause(self):
        """Pausa o serviço"""
        if not self.can_be_paused:
            raise ValueError("Serviço não pode ser pausado neste momento")
        
        from datetime import datetime
        self.pause_time = datetime.now()
        self.status = ServiceSessionStatus.PAUSED
        
        # Calcular tempo ativo até agora
        if self.start_time:
            delta = self.pause_time - self.start_time
            self.active_duration_minutes = int(delta.total_seconds() / 60)
    
    def resume(self):
        """Retoma o serviço após pausa"""
        if not self.can_be_resumed:
            raise ValueError("Serviço não pode ser retomado neste momento")
        
        from datetime import datetime
        self.resume_time = datetime.now()
        self.status = ServiceSessionStatus.RESUMED
        
        # Calcular tempo de pausa
        if self.pause_time:
            delta = self.resume_time - self.pause_time
            self.pause_duration_minutes = int(delta.total_seconds() / 60)
    
    def complete(self):
        """Finaliza o serviço"""
        if not self.can_be_completed:
            raise ValueError("Serviço não pode ser finalizado neste momento")
        
        from datetime import datetime
        self.end_time = datetime.now()
        self.status = ServiceSessionStatus.COMPLETED
        
        # Calcular duração total
        if self.status == ServiceSessionStatus.RESUMED and self.resume_time:
            # Se foi retomado, calcular desde o retorno
            delta = self.end_time - self.resume_time
            additional_minutes = int(delta.total_seconds() / 60)
            self.active_duration_minutes += additional_minutes
        elif self.start_time:
            # Se nunca foi pausado, calcular desde o início
            delta = self.end_time - self.start_time
            self.active_duration_minutes = int(delta.total_seconds() / 60)
        
        self.total_duration_minutes = self.active_duration_minutes + self.pause_duration_minutes
    
    def start(self):
        """Inicia o serviço"""
        from datetime import datetime
        self.start_time = datetime.now()
        self.status = ServiceSessionStatus.IN_PROGRESS
    
    def to_dict(self) -> dict:
        """Converte para dicionário (para JSON)"""
        return {
            "id": self.id,
            "appointment_id": self.appointment_id,
            "service_id": self.service_id,
            "barber_id": self.barber_id,
            "client_id": self.client_id,
            "status": self.status.value,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "pause_time": self.pause_time.isoformat() if self.pause_time else None,
            "resume_time": self.resume_time.isoformat() if self.resume_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "active_duration_minutes": self.active_duration_minutes,
            "pause_duration_minutes": self.pause_duration_minutes,
            "total_duration_minutes": self.total_duration_minutes,
            "has_pause": self.has_pause,
            "expected_pause_minutes": self.expected_pause_minutes,
            "notes": self.notes,
            "is_paused": self.is_paused,
            "is_active": self.is_active,
            "can_be_paused": self.can_be_paused,
            "can_be_resumed": self.can_be_resumed,
            "can_be_completed": self.can_be_completed,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }




