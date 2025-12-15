from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import redis
from typing import Generator
import logging

from app.core.config import settings

# Configurar logging
logger = logging.getLogger(__name__)

# === CONFIGURAÇÃO DO BANCO ===

# Usar SQLite temporariamente para desenvolvimento
DATABASE_URL = "sqlite:///./barbershop_dev.db"

# Criar engine do SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=settings.database_echo
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
    Inicializar banco de dados criando todas as tabelas.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Banco de dados inicializado")
        return True
    except Exception as e:
        logger.error(f"❌ Erro ao inicializar banco: {e}")
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