from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Importar routers
from app.api.auth import router as auth_router
from app.api.appointments import router as appointments_router
from app.api.clients import router as clients_router
from app.api.barbers import router as barbers_router
from app.api.services import router as services_router
from app.api.products import router as products_router
from app.api.sales import router as sales_router
from app.api.analytics import router as analytics_router
from app.api.ai import router as ai_router
from app.api.commissions import router as commissions_router
from app.api.barber_blocks import router as barber_blocks_router

# Importar modelos para garantir que sejam registrados no Base.metadata
from app.models import (
    User, Barbershop, Barber, Client, Service, 
    Appointment, Commission, Product, BarberBlock
)

# Importar função de inicialização do banco
from app.core.database import init_database

# Criar instância do FastAPI
app = FastAPI(
    title="💈 Barbershop Manager API",
    description="""
    Sistema completo de gestão para barbearias com IA integrada.
    
    ## Funcionalidades Principais
    
    * **Agendamento Online 24/7** com IA assistente
    * **Gestão Completa de Clientes** com histórico
    * **Sistema POS** com múltiplas formas de pagamento
    * **Estoque Inteligente** com alertas automáticos
    * **Comissões Automáticas** para barbeiros
    * **Marketing Automatizado** com segmentação
    * **Analytics Avançados** com previsões
    * **Lista de Espera Dinâmica**
    * **Notificações SMS/WhatsApp**
    
    ## Tecnologias
    
    - FastAPI para APIs RESTful
    - SQLAlchemy para ORM
    - PostgreSQL como banco de dados
    - Redis para cache
    - OpenAI/Ollama para IA
    - Celery para tasks assíncronas
    """,
    version="1.0.0",
    contact={
        "name": "Equipe Barbershop Manager",
        "email": "suporte@barbershop-manager.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# Configurar CORS - DEVE SER O PRIMEIRO MIDDLEWARE
# Obter URLs permitidas das variáveis de ambiente
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
]

# Adicionar URLs de produção se definidas
frontend_url = os.getenv("FRONTEND_URL", "")
if frontend_url:
    allowed_origins.append(frontend_url)
    # Também adicionar variantes com/sem www e http/https
    if frontend_url.startswith("https://"):
        allowed_origins.append(frontend_url.replace("https://", "http://"))
    if "www." not in frontend_url:
        allowed_origins.append(frontend_url.replace("://", "://www."))

# Adicionar domínios Vercel padrão
allowed_origins.extend([
    "https://app-barber-iota.vercel.app",
])

# Regex para aceitar subdomínios da Vercel (necessário para deploys de preview)
# Isso resolve o problema do wildcard "*" que o FastAPI não aceita em allow_origins
allow_origin_regex = r"https://.*\.vercel\.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Middleware de segurança - COMENTADO TEMPORARIAMENTE PARA DEBUG
# app.add_middleware(
#     TrustedHostMiddleware,
#     allowed_hosts=[
#         "localhost",
#         "127.0.0.1",
#         "*.railway.app",
#         "*.vercel.app",
#         os.getenv("ALLOWED_HOST", "localhost")
#     ]
# )

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Endpoint para verificar se a API está funcionando.
    """
    return {
        "status": "healthy",
        "message": "💈 Barbershop Manager API está funcionando!",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Endpoint raiz com informações básicas da API.
    """
    return {
        "message": "💈 Bem-vindo ao Barbershop Manager API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health"
    }

# Incluir routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Autenticação"])
app.include_router(appointments_router, prefix="/api/v1/appointments", tags=["Agendamentos"])
app.include_router(clients_router, prefix="/api/v1/clients", tags=["Clientes"])
app.include_router(barbers_router, prefix="/api/v1/barbers", tags=["Barbeiros"])
app.include_router(services_router, prefix="/api/v1/services", tags=["Serviços"])
app.include_router(products_router, prefix="/api/v1/products", tags=["Produtos"])
app.include_router(sales_router, prefix="/api/v1/sales", tags=["Vendas"])
app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(ai_router, prefix="/api/v1/ai", tags=["Inteligência Artificial"])
app.include_router(commissions_router, prefix="/api/v1/commissions", tags=["Comissões"])
app.include_router(barber_blocks_router, prefix="/api/v1/barber-blocks", tags=["Bloqueios de Agenda"])

# Evento de startup
@app.on_event("startup")
async def startup_event():
    """
    Eventos executados na inicialização da aplicação.
    """
    print("Iniciando Barbershop Manager API...")
    print("Conectando ao banco de dados...")
    
    # Log da configuração do banco
    from app.core.config import settings
    db_url_preview = settings.database_url[:50] + "..." if len(settings.database_url) > 50 else settings.database_url
    print(f"🔍 DATABASE_URL: {db_url_preview}")
    
    # Inicializar banco de dados (criar tabelas se não existirem)
    try:
        print("🔄 Inicializando tabelas do banco de dados...")
        if init_database():
            print("✅ Banco de dados inicializado com sucesso!")
        else:
            print("⚠️ Aviso: Não foi possível inicializar o banco de dados")
    except Exception as e:
        print(f"❌ Erro ao inicializar banco de dados: {e}")
        import traceback
        print(traceback.format_exc())
        # Não bloquear o startup se o banco já existir
    
    print("Inicializando modulos de IA...")
    print("API pronta para receber requisicoes!")

# Evento de shutdown
@app.on_event("shutdown")
async def shutdown_event():
    """
    Eventos executados no encerramento da aplicação.
    """
    print("Encerrando Barbershop Manager API...")
    print("Fechando conexoes do banco de dados...")
    print("API encerrada com sucesso!")

# Exception handlers
from fastapi.responses import JSONResponse
from starlette.requests import Request

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Endpoint não encontrado. Verifique a documentação em /docs"}
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Erro interno do servidor. Entre em contato com o suporte."}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=["app"]
    ) 