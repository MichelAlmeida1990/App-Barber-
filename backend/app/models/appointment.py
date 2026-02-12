from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey, Table
import enum
from app.core.database import Base

class AppointmentStatus(str, enum.Enum):
    """Status do agendamento"""
    PENDING = "pending"          # Aguardando confirmação
    CONFIRMED = "confirmed"      # Confirmado
    IN_PROGRESS = "in_progress"  # Em andamento
    PAUSED = "paused"            # Pausado (libera agenda para outros atendimentos)
    COMPLETED = "completed"      # Concluído
    CANCELLED = "cancelled"      # Cancelado pelo cliente
    NO_SHOW = "no_show"         # Cliente não compareceu
    RESCHEDULED = "rescheduled"  # Reagendado

class AppointmentType(str, enum.Enum):
    """Tipo de agendamento"""
    REGULAR = "regular"          # Agendamento normal
    WALK_IN = "walk_in"         # Cliente chegou sem agendamento
    EMERGENCY = "emergency"      # Emergência
    FOLLOW_UP = "follow_up"     # Retoque/seguimento

# Tabela de associação para agendamentos e serviços (many-to-many)
appointment_services = Table(
    'appointment_services',
    Base.metadata,
    Column('appointment_id', Integer, ForeignKey('appointments.id'), primary_key=True),
    Column('service_id', Integer, ForeignKey('services.id'), primary_key=True),
    Column('quantity', Integer, default=1),
    Column('custom_price', Numeric(10, 2), nullable=True),  # Preço personalizado
    Column('notes', Text, nullable=True)  # Observações específicas do serviço
)

class Appointment(Base):
    """
    Modelo de agendamento.
    Representa um agendamento de serviços na barbearia.
    """
    __tablename__ = "appointments"
    
    # === IDENTIFICAÇÃO ===
    id = Column(Integer, primary_key=True, index=True)
    appointment_number = Column(String(50), unique=True, index=True, nullable=False)
    
    # === RELACIONAMENTOS PRINCIPAIS ===
    barbershop_id = Column(Integer, ForeignKey("barbershops.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    barber_id = Column(Integer, ForeignKey("barbers.id"), nullable=False)
    
    # === DATA E HORA ===
    appointment_date = Column(DateTime(timezone=True), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, nullable=False, default=30)
    
    # === STATUS E TIPO ===
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.PENDING, nullable=False)
    appointment_type = Column(Enum(AppointmentType), default=AppointmentType.REGULAR, nullable=False)
    
    # === VALORES ===
    total_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    discount_amount = Column(Numeric(10, 2), default=0.00)
    final_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    
    # === OBSERVAÇÕES ===
    client_notes = Column(Text, nullable=True)  # Observações do cliente
    barber_notes = Column(Text, nullable=True)  # Observações do barbeiro
    internal_notes = Column(Text, nullable=True)  # Observações internas
    
    # === CONFIGURAÇÕES ===
    is_recurring = Column(Boolean, default=False)
    recurring_pattern = Column(String(50), nullable=True)  # "weekly", "monthly", etc.
    send_reminders = Column(Boolean, default=True)
    requires_confirmation = Column(Boolean, default=True)
    
    # === DADOS DE CONTATO ===
    client_name = Column(String(255), nullable=False)  # Cache do nome (para performance)
    client_phone = Column(String(20), nullable=True)   # Cache do telefone
    client_email = Column(String(255), nullable=True)  # Cache do email
    
    # === ORIGEM DO AGENDAMENTO ===
    booking_source = Column(String(50), default="website")  # website, phone, walk_in, instagram, etc.
    booking_user_agent = Column(Text, nullable=True)  # Para analytics
    booking_ip = Column(String(45), nullable=True)    # IP do cliente (para analytics)
    
    # === PAGAMENTO ===
    deposit_required = Column(Boolean, default=False)
    deposit_amount = Column(Numeric(10, 2), default=0.00)
    deposit_paid = Column(Boolean, default=False)
    payment_method = Column(String(50), nullable=True)  # cash, card, pix
    
    # === CANCELAMENTO/REAGENDAMENTO ===
    cancelled_at = Column(DateTime, nullable=True)
    cancelled_by = Column(String(50), nullable=True)  # client, barber, admin
    cancellation_reason = Column(Text, nullable=True)
    
    rescheduled_from_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    rescheduled_to_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    
    # === PAUSA DINÂMICA ===
    paused_at = Column(DateTime(timezone=True), nullable=True)  # Quando foi pausado
    resumed_at = Column(DateTime(timezone=True), nullable=True)  # Quando foi retomado
    pause_duration_minutes = Column(Integer, default=0)  # Duração total da pausa em minutos
    pause_reason = Column(Text, nullable=True)  # Motivo da pausa (opcional)
    
    # === FEEDBACK ===
    rating = Column(Integer, nullable=True)  # 1-5
    review = Column(Text, nullable=True)
    review_date = Column(DateTime, nullable=True)
    
    # === NOTIFICAÇÕES ===
    reminder_sent_24h = Column(Boolean, default=False)
    reminder_sent_2h = Column(Boolean, default=False)
    confirmation_sent = Column(Boolean, default=False)
    
    # === TIMESTAMPS ===
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)  # Soft delete
    
    # === RELACIONAMENTOS ===
    # barbershop = relationship("Barbershop", back_populates="appointments")
    client = relationship("Client", back_populates="appointments", foreign_keys=[client_id])
    barber = relationship("Barber", back_populates="appointments", foreign_keys=[barber_id])
    # services = relationship("Service", secondary=appointment_services, back_populates="appointments")
    commissions = relationship("Commission", back_populates="appointment", cascade="all, delete-orphan")
    
    # Auto-relacionamento para reagendamentos
    # rescheduled_from = relationship("Appointment", remote_side=[id], foreign_keys=[rescheduled_from_id])
    # rescheduled_to = relationship("Appointment", remote_side=[id], foreign_keys=[rescheduled_to_id])
    
    def __repr__(self):
        return f"<Appointment(id={self.id}, number='{self.appointment_number}', client='{self.client_name}', date='{self.appointment_date}')>"
    
    @property
    def is_past(self) -> bool:
        """Verifica se o agendamento já passou"""
        from datetime import datetime
        return self.appointment_date < datetime.now()
    
    @property
    def is_today(self) -> bool:
        """Verifica se o agendamento é hoje"""
        from datetime import datetime, date
        return self.appointment_date.date() == date.today()
    
    @property
    def is_upcoming(self) -> bool:
        """Verifica se o agendamento é futuro"""
        from datetime import datetime
        return self.appointment_date > datetime.now()
    
    @property
    def can_be_cancelled(self) -> bool:
        """Verifica se pode ser cancelado"""
        if self.status in [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW]:
            return False
        
        from datetime import datetime, timedelta
        # Verificar se ainda está dentro do prazo de cancelamento
        cancellation_deadline = self.appointment_date - timedelta(hours=2)  # 2 horas antes
        return datetime.now() < cancellation_deadline
    
    @property
    def can_be_rescheduled(self) -> bool:
        """Verifica se pode ser reagendado"""
        return self.can_be_cancelled and self.status == AppointmentStatus.CONFIRMED
    
    @property
    def is_paused(self) -> bool:
        """Verifica se está pausado"""
        return self.status == AppointmentStatus.PAUSED
    
    @property
    def can_be_paused(self) -> bool:
        """Verifica se pode ser pausado (deve estar em andamento)"""
        return self.status == AppointmentStatus.IN_PROGRESS
    
    @property
    def can_be_resumed(self) -> bool:
        """Verifica se pode ser retomado (deve estar pausado)"""
        return self.status == AppointmentStatus.PAUSED
    
    def pause(self, reason: str = None):
        """Pausa o agendamento (libera a agenda)"""
        if not self.can_be_paused:
            raise ValueError("Agendamento não pode ser pausado neste momento")
        
        from datetime import datetime
        self.paused_at = datetime.now()
        self.pause_reason = reason
        self.status = AppointmentStatus.PAUSED
    
    def resume(self):
        """Retoma o agendamento pausado"""
        if not self.can_be_resumed:
            raise ValueError("Agendamento não pode ser retomado neste momento")
        
        from datetime import datetime
        if self.paused_at:
            # Calcular duração da pausa
            pause_delta = datetime.now() - self.paused_at
            self.pause_duration_minutes += int(pause_delta.total_seconds() / 60)
        
        self.resumed_at = datetime.now()
        self.status = AppointmentStatus.IN_PROGRESS
    
    @property
    def time_until_appointment(self) -> str:
        """Tempo até o agendamento (formatado)"""
        from datetime import datetime
        if self.is_past:
            return "Já passou"
        
        delta = self.appointment_date - datetime.now()
        days = delta.days
        hours, remainder = divmod(delta.seconds, 3600)
        minutes, _ = divmod(remainder, 60)
        
        if days > 0:
            return f"{days}d {hours}h {minutes}m"
        elif hours > 0:
            return f"{hours}h {minutes}m"
        else:
            return f"{minutes}m"
    
    def generate_appointment_number(self) -> str:
        """Gera número do agendamento"""
        from datetime import datetime
        import random
        date_str = datetime.now().strftime("%Y%m%d")
        random_num = random.randint(1000, 9999)
        return f"AG{date_str}{random_num}"
    
    def calculate_total_amount(self) -> float:
        """Calcula valor total dos serviços"""
        total = 0.0
        for service in self.services:
            # Verificar se há preço personalizado na tabela de associação
            association = appointment_services.c
            # TODO: Implementar lógica para pegar preço personalizado
            total += float(service.price)
        return total
    
    def send_confirmation(self):
        """Enviar confirmação do agendamento"""
        # TODO: Implementar envio de notificação
        self.confirmation_sent = True
    
    def send_reminder(self, hours_before: int = 24):
        """Enviar lembrete do agendamento"""
        # TODO: Implementar envio de lembrete
        if hours_before == 24:
            self.reminder_sent_24h = True
        elif hours_before == 2:
            self.reminder_sent_2h = True
    
    def to_dict(self) -> dict:
        """Converte para dicionário (para JSON)"""
        return {
            "id": self.id,
            "appointment_number": self.appointment_number,
            "barbershop_id": self.barbershop_id,
            "client_id": self.client_id,
            "barber_id": self.barber_id,
            "appointment_date": self.appointment_date.isoformat() if self.appointment_date else None,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "duration_minutes": self.duration_minutes,
            "status": self.status.value,
            "appointment_type": self.appointment_type.value,
            "total_amount": float(self.total_amount),
            "discount_amount": float(self.discount_amount),
            "final_amount": float(self.final_amount),
            "client_name": self.client_name,
            "client_phone": self.client_phone,
            "client_email": self.client_email,
            "client_notes": self.client_notes,
            "barber_notes": self.barber_notes,
            "booking_source": self.booking_source,
            "is_past": self.is_past,
            "is_today": self.is_today,
            "is_upcoming": self.is_upcoming,
            "can_be_cancelled": self.can_be_cancelled,
            "can_be_rescheduled": self.can_be_rescheduled,
            "time_until_appointment": self.time_until_appointment,
            "rating": self.rating,
            "review": self.review,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        } 