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

# === CONFIGURAÇÃO DO POSTGRESQL ===

# Criar engine do SQLAlchemy
if settings.database_url.startswith("sqlite"):
    # Para testes com SQLite
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.database_echo
    )
else:
    # Para PostgreSQL (produção/desenvolvimento)
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,  # Verificar conexão antes de usar
        pool_recycle=300,    # Reciclar conexões a cada 5 minutos
        pool_size=10,        # Tamanho do pool de conexões
        max_overflow=20,     # Máximo de conexões extras
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
    Usado nas rotas FastAPI com Depends(get_redis).
    """
    if redis_client is None:
        raise Exception("Redis não está disponível")
    return redis_client

# === FUNÇÕES UTILITÁRIAS ===

def create_tables():
    """
    Criar todas as tabelas no banco de dados.
    Usado apenas para desenvolvimento/testes.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Tabelas criadas com sucesso")
    except Exception as e:
        logger.error(f"❌ Erro ao criar tabelas: {e}")
        raise

def drop_tables():
    """
    Remover todas as tabelas do banco de dados.
    ⚠️ CUIDADO: Usar apenas em desenvolvimento!
    """
    if settings.environment == "production":
        raise Exception("❌ Não é possível dropar tabelas em produção!")
    
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("⚠️ Todas as tabelas foram removidas")
    except Exception as e:
        logger.error(f"❌ Erro ao remover tabelas: {e}")
        raise

def check_database_connection() -> bool:
    """
    Verificar se a conexão com o banco está funcionando.
    """
    try:
        with engine.connect() as connection:
            connection.execute("SELECT 1")
        logger.info("✅ Conexão com banco de dados OK")
        return True
    except Exception as e:
        logger.error(f"❌ Erro na conexão com banco: {e}")
        return False

def check_redis_connection() -> bool:
    """
    Verificar se a conexão com Redis está funcionando.
    """
    try:
        if redis_client:
            redis_client.ping()
            logger.info("✅ Conexão com Redis OK")
            return True
        return False
    except Exception as e:
        logger.error(f"❌ Erro na conexão com Redis: {e}")
        return False

# === CACHE HELPER FUNCTIONS ===

class CacheManager:
    """
    Gerenciador de cache Redis com métodos utilitários.
    """
    
    def __init__(self, redis_client: redis.Redis = None):
        self.redis = redis_client or get_redis()
        self.default_expire = settings.redis_expire_seconds
    
    def get(self, key: str):
        """Obter valor do cache"""
        try:
            return self.redis.get(key)
        except:
            return None
    
    def set(self, key: str, value: str, expire: int = None):
        """Definir valor no cache"""
        try:
            expire_time = expire or self.default_expire
            return self.redis.setex(key, expire_time, value)
        except:
            return False
    
    def delete(self, key: str):
        """Remover valor do cache"""
        try:
            return self.redis.delete(key)
        except:
            return False
    
    def exists(self, key: str) -> bool:
        """Verificar se chave existe"""
        try:
            return bool(self.redis.exists(key))
        except:
            return False
    
    def flush_all(self):
        """Limpar todo o cache (cuidado!)"""
        try:
            return self.redis.flushdb()
        except:
            return False
    
    def get_keys(self, pattern: str = "*"):
        """Obter todas as chaves por padrão"""
        try:
            return self.redis.keys(pattern)
        except:
            return []

# Instância global do cache manager
cache = CacheManager() if redis_client else None

# === DATABASE UTILITIES ===

class DatabaseManager:
    """
    Gerenciador do banco de dados com métodos utilitários.
    """
    
    @staticmethod
    def get_session() -> Session:
        """Obter nova sessão do banco"""
        return SessionLocal()
    
    @staticmethod
    def execute_raw_sql(sql: str, params: dict = None):
        """Executar SQL raw (cuidado!)"""
        with engine.connect() as connection:
            return connection.execute(sql, params or {})
    
    @staticmethod
    def get_table_count(table_name: str) -> int:
        """Contar registros em uma tabela"""
        sql = f"SELECT COUNT(*) FROM {table_name}"
        result = DatabaseManager.execute_raw_sql(sql)
        return result.scalar()
    
    @staticmethod
    def backup_table(table_name: str, file_path: str):
        """Fazer backup de uma tabela (implementar conforme necessário)"""
        # TODO: Implementar backup
        pass

# === HEALTH CHECK ===

def health_check() -> dict:
    """
    Verificar saúde do banco de dados e cache.
    """
    return {
        "database": check_database_connection(),
        "redis": check_redis_connection(),
        "database_url": settings.database_url.split("@")[-1] if "@" in settings.database_url else "local",
        "redis_url": settings.redis_url.split("@")[-1] if "@" in settings.redis_url else "local"
    }

# === INICIALIZAÇÃO ===

def init_database():
    """
    Inicializar banco de dados.
    Executado no startup da aplicação.
    """
    logger.info("🔄 Inicializando banco de dados...")
    
    # Verificar conexões
    db_ok = check_database_connection()
    redis_ok = check_redis_connection()
    
    if not db_ok:
        raise Exception("❌ Não foi possível conectar ao banco de dados")
    
    if not redis_ok:
        logger.warning("⚠️ Redis não disponível - cache desabilitado")
    
    # Criar tabelas se necessário (apenas desenvolvimento)
    if settings.environment == "development" and settings.create_sample_data:
        create_tables()
        logger.info("✅ Banco de dados inicializado")
    
    logger.info("✅ Conexões estabelecidas com sucesso") 