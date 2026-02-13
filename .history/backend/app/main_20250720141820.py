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

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend local
        "http://localhost:3001",  # Frontend alternativo
        "http://localhost:3002",  # Frontend atual
        "http://127.0.0.1:3000",  # Frontend local (IP)
        "http://127.0.0.1:3001",  # Frontend alternativo (IP)
        "http://127.0.0.1:3002",  # Frontend atual (IP)
        "https://*.vercel.app",   # Vercel deploys
        "*"  # Temporariamente permitir todas as origens
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Middleware de segurança
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        "localhost",
        "127.0.0.1",
        "*.railway.app",
        "*.vercel.app",
        os.getenv("ALLOWED_HOST", "localhost")
    ]
)

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

# Evento de startup
@app.on_event("startup")
async def startup_event():
    """
    Eventos executados na inicialização da aplicação.
    """
    print("🚀 Iniciando Barbershop Manager API...")
    print("📊 Conectando ao banco de dados...")
    print("🤖 Inicializando módulos de IA...")
    print("✅ API pronta para receber requisições!")

# Evento de shutdown
@app.on_event("shutdown")
async def shutdown_event():
    """
    Eventos executados no encerramento da aplicação.
    """
    print("🛑 Encerrando Barbershop Manager API...")
    print("💾 Fechando conexões do banco de dados...")
    print("✅ API encerrada com sucesso!")

# Exception handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return HTTPException(
        status_code=404,
        detail="Endpoint não encontrado. Verifique a documentação em /docs"
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return HTTPException(
        status_code=500,
        detail="Erro interno do servidor. Entre em contato com o suporte."
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