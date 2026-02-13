from pydantic_settings import BaseSettings
from typing import Optional, List
import os
from functools import lru_cache

class Settings(BaseSettings):
    """
    Configurações da aplicação usando Pydantic Settings.
    Todas as configurações podem ser definidas via variáveis de ambiente.
    """
    
    # === CONFIGURAÇÕES BÁSICAS ===
    app_name: str = "Barbershop Manager"
    app_version: str = "1.0.0"
    debug: bool = False
    environment: str = "development"  # development, staging, production
    
    # === CONFIGURAÇÕES DO SERVIDOR ===
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = True
    
    # === SEGURANÇA ===
    secret_key: str = "sua-chave-secreta-super-segura-aqui-123456789"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # === BANCO DE DADOS ===
    # PostgreSQL via Supabase (gratuito)
    database_url: str = "postgresql://user:password@localhost:5432/barbershop_db"
    database_echo: bool = False  # Log de queries SQL
    
    # === REDIS (CACHE) ===
    # Upstash Redis (gratuito)
    redis_url: str = "redis://localhost:6379"
    redis_expire_seconds: int = 3600  # 1 hora
    
    # === SUPABASE ===
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_secret: str = ""
    
    # === INTELIGÊNCIA ARTIFICIAL ===
    # OpenAI (tier gratuito)
    openai_api_key: str = ""
    openai_model: str = "gpt-3.5-turbo"
    openai_max_tokens: int = 150
    
    # Ollama (local, gratuito)
    ollama_host: str = "http://localhost:11434"
    ollama_model: str = "llama2"
    
    # === NOTIFICAÇÕES ===
    # Twilio (trial gratuito)
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    
    # EmailJS (gratuito)
    emailjs_service_id: str = ""
    emailjs_template_id: str = ""
    emailjs_user_id: str = ""
    
    # WhatsApp Business API
    whatsapp_token: str = ""
    whatsapp_phone_number_id: str = ""
    
    # === PAGAMENTOS ===
    # PIX - Banco do Brasil (sandbox gratuito)
    bb_client_id: str = ""
    bb_client_secret: str = ""
    bb_sandbox: bool = True
    
    # Stripe (tier gratuito)
    stripe_publishable_key: str = ""
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    
    # === STORAGE E UPLOADS ===
    upload_max_size: int = 5 * 1024 * 1024  # 5MB
    allowed_image_types: List[str] = ["image/jpeg", "image/png", "image/webp"]
    
    # Cloudinary (gratuito)
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    
    # === CORS ===
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app"
    ]
    
    # === RATE LIMITING ===
    rate_limit_per_minute: int = 100
    rate_limit_per_hour: int = 1000
    
    # === LOGS ===
    log_level: str = "INFO"
    log_file: str = "app.log"
    
    # === CELERY (TASKS ASSÍNCRONAS) ===
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"
    
    # === MONITORAMENTO ===
    # Sentry (tier gratuito)
    sentry_dsn: str = ""
    
    # === BUSINESS RULES ===
    # Configurações específicas do negócio
    default_appointment_duration: int = 30  # minutos
    max_appointments_per_day: int = 20
    commission_rate_default: float = 0.60  # 60% para o barbeiro
    loyalty_points_rate: int = 10  # 10 pontos por R$ 1,00
    
    # Horários de funcionamento padrão
    opening_time: str = "08:00"
    closing_time: str = "18:00"
    break_start: str = "12:00"
    break_end: str = "13:00"
    
    # === CONFIGURAÇÕES DE DESENVOLVIMENTO ===
    # Apenas para desenvolvimento
    create_sample_data: bool = False
    reset_database: bool = False
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        
        # Mapear nomes de variáveis de ambiente
        fields = {
            "database_url": {"env": "DATABASE_URL"},
            "redis_url": {"env": "REDIS_URL"},
            "secret_key": {"env": "SECRET_KEY"},
            "supabase_url": {"env": "SUPABASE_URL"},
            "supabase_key": {"env": "SUPABASE_KEY"},
            "openai_api_key": {"env": "OPENAI_API_KEY"},
            "twilio_account_sid": {"env": "TWILIO_ACCOUNT_SID"},
            "twilio_auth_token": {"env": "TWILIO_AUTH_TOKEN"},
            "stripe_secret_key": {"env": "STRIPE_SECRET_KEY"},
            "sentry_dsn": {"env": "SENTRY_DSN"},
        }

@lru_cache()
def get_settings() -> Settings:
    """
    Função para obter as configurações de forma cached.
    Usa lru_cache para evitar recriar o objeto a cada chamada.
    """
    return Settings()

# Instância global das configurações
settings = get_settings()

# === CONFIGURAÇÕES ESPECÍFICAS POR AMBIENTE ===

class DevelopmentSettings(Settings):
    """Configurações para desenvolvimento"""
    debug: bool = True
    environment: str = "development"
    database_echo: bool = True
    reload: bool = True
    
class ProductionSettings(Settings):
    """Configurações para produção"""
    debug: bool = False
    environment: str = "production"
    database_echo: bool = False
    reload: bool = False
    
class TestingSettings(Settings):
    """Configurações para testes"""
    debug: bool = True
    environment: str = "testing"
    database_url: str = "sqlite:///./test.db"
    redis_url: str = "redis://localhost:6379/15"  # DB diferente para testes

def get_environment_settings() -> Settings:
    """
    Retorna as configurações baseadas na variável de ambiente ENVIRONMENT
    """
    env = os.getenv("ENVIRONMENT", "development").lower()
    
    if env == "production":
        return ProductionSettings()
    elif env == "testing":
        return TestingSettings()
    else:
        return DevelopmentSettings()

# === VALIDAÇÕES ===

def validate_settings():
    """
    Valida se as configurações essenciais estão definidas
    """
    errors = []
    
    if not settings.secret_key or len(settings.secret_key) < 32:
        errors.append("SECRET_KEY deve ter pelo menos 32 caracteres")
    
    if settings.environment == "production":
        if not settings.database_url.startswith("postgresql"):
            errors.append("DATABASE_URL deve ser PostgreSQL em produção")
        
        if settings.debug:
            errors.append("DEBUG deve ser False em produção")
    
    if errors:
        raise ValueError(f"Configurações inválidas: {', '.join(errors)}")

# Validar configurações na importação
validate_settings() 