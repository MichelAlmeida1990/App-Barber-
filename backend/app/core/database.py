from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import redis
from typing import Generator
import logging
import json

from app.core.config import settings

# Configurar logging
logger = logging.getLogger(__name__)

# === CONFIGURAÇÃO DO BANCO ===

# Usar DATABASE_URL da variável de ambiente, ou SQLite como fallback para desenvolvimento
DATABASE_URL = settings.database_url or "sqlite:///./barbershop_dev.db"

# Log para debug
logger.info(f"🔍 DATABASE_URL configurado: {DATABASE_URL[:50]}..." if len(DATABASE_URL) > 50 else f"🔍 DATABASE_URL configurado: {DATABASE_URL}")
if DATABASE_URL.startswith("sqlite"):
    logger.warning("⚠️ Usando SQLite! Verifique se DATABASE_URL está configurado corretamente.")
else:
    logger.info("✅ Usando PostgreSQL")

# Configurar connect_args baseado no tipo de banco
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    poolclass = StaticPool
else:
    # PostgreSQL não precisa de connect_args especiais
    poolclass = None

# Criar engine do SQLAlchemy
if poolclass:
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        poolclass=poolclass,
        echo=settings.database_echo
    )
else:
    engine = create_engine(
        DATABASE_URL,
        echo=settings.database_echo,
        pool_pre_ping=True,  # Verificar conexão antes de usar
        pool_size=5,
        max_overflow=10
    )

# Criar SessionLocal
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base para os modelos
Base = declarative_base()

# Metadata para migrations
metadata = MetaData()

# === CONFIGURAÇÃO DO REDIS ===

try:
    redis_client = redis.from_url(
        settings.redis_url,
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5,
        retry_on_timeout=True
    )
    # Testar conexão
    redis_client.ping()
    logger.info("✅ Conexão com Redis estabelecida")
except Exception as e:
    logger.warning(f"⚠️ Não foi possível conectar ao Redis: {e}")
    redis_client = None

# === DEPENDENCY INJECTION ===

def get_db() -> Generator[Session, None, None]:
    """
    Dependency para obter sessão do banco de dados.
    Usado nas rotas FastAPI com Depends(get_db).
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Erro na sessão do banco: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def get_redis() -> redis.Redis:
    """
    Dependency para obter cliente Redis.
    Retorna None se Redis não estiver disponível.
    """
    return redis_client

# === FUNÇÕES UTILITÁRIAS ===

def init_database():
    """
    Inicializar banco de dados criando todas as tabelas e dados essenciais.
    """
    try:
        # Criar todas as tabelas
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Tabelas criadas com sucesso")
        
        # Criar dados essenciais (barbearia padrão)
        from app.models.barbershop import Barbershop
        from app.models.user import User, UserRole, UserStatus
        from app.core.security import get_password_hash
        
        db = SessionLocal()
        try:
            # Verificar se já existe barbearia com id=1
            existing_barbershop = db.query(Barbershop).filter(Barbershop.id == 1).first()
            
            if not existing_barbershop:
                logger.info("🔄 Criando barbearia padrão...")
                
                # Verificar se existe usuário admin, se não criar um
                admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()
                
                if not admin_user:
                    logger.info("🔄 Criando usuário admin padrão...")
                    admin_user = User(
                        email="admin@barbearia.com",
                        hashed_password=get_password_hash("admin123"),
                        full_name="Administrador",
                        role=UserRole.ADMIN,
                        status=UserStatus.ACTIVE,
                        is_verified=True
                    )
                    db.add(admin_user)
                    db.commit()
                    db.refresh(admin_user)
                    logger.info("✅ Usuário admin criado")
                
                # Criar barbearia padrão usando ORM (mais confiável)
                opening_hours_data = {
                    "0": {"open": "08:00", "close": "18:00", "break_start": "12:00", "break_end": "13:00"},
                    "1": {"open": "08:00", "close": "18:00", "break_start": "12:00", "break_end": "13:00"},
                    "2": {"open": "08:00", "close": "18:00", "break_start": "12:00", "break_end": "13:00"},
                    "3": {"open": "08:00", "close": "18:00", "break_start": "12:00", "break_end": "13:00"},
                    "4": {"open": "08:00", "close": "18:00", "break_start": "12:00", "break_end": "13:00"},
                    "5": {"open": "08:00", "close": "18:00", "break_start": "12:00", "break_end": "13:00"},
                    "6": {"open": "09:00", "close": "14:00"}
                }
                
                default_barbershop = Barbershop(
                    name="Barbearia Principal",
                    slug="barbearia-principal",
                    description="Barbearia principal do sistema",
                    email="contato@barbearia.com",
                    phone="(11) 99999-9999",
                    owner_id=admin_user.id,
                    is_active=True,
                    accepts_online_booking=True,
                    default_appointment_duration=30,
                    max_appointments_per_day=20,
                    opening_hours=opening_hours_data
                )
                db.add(default_barbershop)
                db.flush()  # Flush para obter o ID
                
                # Se não for ID=1, tentar atualizar a sequência do PostgreSQL
                if default_barbershop.id != 1 and not DATABASE_URL.startswith("sqlite"):
                    try:
                        # Resetar sequência para que o próximo ID seja 1 (se a tabela estiver vazia)
                        db.execute(text("SELECT setval('barbershops_id_seq', 1, false)"))
                        # Deletar e recriar com ID=1
                        db.delete(default_barbershop)
                        db.flush()
                        default_barbershop.id = 1
                        db.add(default_barbershop)
                    except Exception as seq_error:
                        logger.warning(f"⚠️ Não foi possível resetar sequência: {seq_error}")
                        # Continuar com o ID gerado automaticamente
                
                db.commit()
                db.refresh(default_barbershop)
                logger.info(f"✅ Barbearia padrão criada com ID={default_barbershop.id}")
                
                # Verificar se realmente foi criada
                verify_barbershop = db.query(Barbershop).filter(Barbershop.id == default_barbershop.id).first()
                if verify_barbershop:
                    logger.info(f"✅ Verificação: Barbearia ID={verify_barbershop.id} existe no banco")
                else:
                    logger.error(f"❌ ERRO: Barbearia não foi criada corretamente!")
            else:
                logger.info("✅ Barbearia padrão já existe")
        
        except Exception as e:
            logger.error(f"⚠️ Erro ao criar dados essenciais: {e}")
            db.rollback()
        finally:
            db.close()
        
        logger.info("✅ Banco de dados inicializado completamente")
        return True
    except Exception as e:
        logger.error(f"❌ Erro ao inicializar banco: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

def reset_database():
    """
    CUIDADO: Remove todas as tabelas e recria.
    Usar apenas em desenvolvimento.
    """
    try:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Banco de dados resetado")
        return True
    except Exception as e:
        logger.error(f"❌ Erro ao resetar banco: {e}")
        return False

def ensure_default_barbershop(db: Session) -> int:
    """
    Garante que existe uma barbearia padrão no banco.
    Retorna o ID da barbearia (pode ser 1 ou outro ID se já existir).
    """
    from app.models.barbershop import Barbershop
    from app.models.user import User, UserRole, UserStatus
    from app.core.security import get_password_hash
    
    # Verificar se já existe barbearia com ID=1
    barbershop = db.query(Barbershop).filter(Barbershop.id == 1).first()
    
    if barbershop:
        return barbershop.id
    
    # Verificar se existe qualquer barbearia
    any_barbershop = db.query(Barbershop).first()
    if any_barbershop:
        logger.info(f"⚠️ Barbearia padrão não tem ID=1, mas existe ID={any_barbershop.id}")
        return any_barbershop.id
    
    # Não existe nenhuma barbearia, criar uma
    logger.info("🔄 Criando barbearia padrão...")
    
    # Verificar se existe usuário admin
    admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()
    
    if not admin_user:
        logger.info("🔄 Criando usuário admin padrão...")
        admin_user = User(
            email="admin@barbearia.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Administrador",
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE,
            is_verified=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        logger.info("✅ Usuário admin criado")
    
    # Criar barbearia
    opening_hours_data = {
        "0": {"open": "08:00", "close": "18:00", "break_start": "12:00", "break_end": "13:00"},
        "1": {"open": "08:00", "close": "18:00", "break_start": "12:00", "break_end": "13:00"},
        "2": {"open": "08:00", "close": "18:00", "break_start": "12:00", "break_end": "13:00"},
        "3": {"open": "08:00", "close": "18:00", "break_start": "12:00", "break_end": "13:00"},
        "4": {"open": "08:00", "close": "18:00", "break_start": "12:00", "break_end": "13:00"},
        "5": {"open": "08:00", "close": "18:00", "break_start": "12:00", "break_end": "13:00"},
        "6": {"open": "09:00", "close": "14:00"}
    }
    
    default_barbershop = Barbershop(
        name="Barbearia Principal",
        slug="barbearia-principal",
        description="Barbearia principal do sistema",
        email="contato@barbearia.com",
        phone="(11) 99999-9999",
        owner_id=admin_user.id,
        is_active=True,
        accepts_online_booking=True,
        default_appointment_duration=30,
        max_appointments_per_day=20,
        opening_hours=opening_hours_data
    )
    db.add(default_barbershop)
    db.commit()
    db.refresh(default_barbershop)
    
    logger.info(f"✅ Barbearia padrão criada com ID={default_barbershop.id}")
    return default_barbershop.id 