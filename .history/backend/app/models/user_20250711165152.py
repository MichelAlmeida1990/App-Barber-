from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class UserRole(str, enum.Enum):
    """Roles de usuários do sistema"""
    ADMIN = "admin"          # Administrador da barbearia
    MANAGER = "manager"      # Gerente da barbearia
    BARBER = "barber"        # Barbeiro
    CLIENT = "client"        # Cliente
    RECEPTIONIST = "receptionist"  # Recepcionista

class UserStatus(str, enum.Enum):
    """Status do usuário"""
    ACTIVE = "active"        # Ativo
    INACTIVE = "inactive"    # Inativo
    SUSPENDED = "suspended"  # Suspenso
    PENDING = "pending"      # Aguardando aprovação

class User(Base):
    """
    Modelo de usuário do sistema.
    Usado para autenticação e autorização.
    """
    __tablename__ = "users"
    
    # === CAMPOS BÁSICOS ===
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=True)
    phone = Column(String(20), index=True, nullable=True)
    
    # === AUTENTICAÇÃO ===
    hashed_password = Column(String(255), nullable=False)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(255), nullable=True)
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)

    # === OAUTH ===
    google_id = Column(String(255), unique=True, index=True, nullable=True)
    picture_url = Column(String(500), nullable=True)
    
    # === PERFIL ===
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(String(500), nullable=True)
    
    # === SISTEMA ===
    role = Column(Enum(UserRole), default=UserRole.CLIENT, nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING, nullable=False)
    
    # === PREFERÊNCIAS ===
    language = Column(String(10), default="pt-BR")
    timezone = Column(String(50), default="America/Sao_Paulo")
    notification_email = Column(Boolean, default=True)
    notification_sms = Column(Boolean, default=True)
    notification_whatsapp = Column(Boolean, default=True)
    
    # === DADOS DE ACESSO ===
    last_login = Column(DateTime, nullable=True)
    login_count = Column(Integer, default=0)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    
    # === TIMESTAMPS ===
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)  # Soft delete
    
    # === RELACIONAMENTOS ===
    owned_barbershops = relationship("Barbershop", back_populates="owner")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
    
    @property
    def is_active(self) -> bool:
        """Verifica se o usuário está ativo"""
        return self.status == UserStatus.ACTIVE and self.deleted_at is None
    
    @property
    def is_admin(self) -> bool:
        """Verifica se o usuário é administrador"""
        return self.role == UserRole.ADMIN
    
    @property
    def is_barber(self) -> bool:
        """Verifica se o usuário é barbeiro"""
        return self.role == UserRole.BARBER
    
    @property
    def is_client(self) -> bool:
        """Verifica se o usuário é cliente"""
        return self.role == UserRole.CLIENT
    
    @property
    def can_manage_barbershop(self) -> bool:
        """Verifica se pode gerenciar a barbearia"""
        return self.role in [UserRole.ADMIN, UserRole.MANAGER]
    
    @property
    def display_name(self) -> str:
        """Nome para exibição"""
        return self.full_name or self.username or self.email.split('@')[0]
    
    def to_dict(self) -> dict:
        """Converte para dicionário (para JSON)"""
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "phone": self.phone,
            "full_name": self.full_name,
            "avatar_url": self.picture_url or self.avatar_url,  # Priorizar foto do Google
            "bio": self.bio,
            "role": self.role.value,
            "status": self.status.value,
            "language": self.language,
            "timezone": self.timezone,
            "is_verified": self.is_verified,
            "google_id": self.google_id,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        } 