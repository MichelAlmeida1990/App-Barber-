from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User, UserRole, UserStatus

router = APIRouter()

# === CONFIGURAÇÕES DE SEGURANÇA ===
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

# === SCHEMAS BÁSICOS ===
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CLIENT

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: UserResponse

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# === FUNÇÕES DE AUTENTICAÇÃO ===

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar senha"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Gerar hash da senha"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Criar token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Buscar usuário por email"""
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Autenticar usuário"""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Obter usuário atual pelo token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Obter usuário ativo atual"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# === ENDPOINTS ===

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registrar novo usuário.
    
    - **email**: Email único do usuário
    - **password**: Senha (mínimo 6 caracteres)
    - **full_name**: Nome completo
    - **phone**: Telefone (opcional)
    - **role**: Papel do usuário (padrão: client)
    """
    
    # Verificar se email já existe
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validar senha
    if len(user_data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters"
        )
    
    # Criar usuário
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=user_data.role,
        status=UserStatus.ACTIVE,  # Ativar direto por enquanto
        is_verified=True  # Verificar direto por enquanto
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserResponse(
        id=db_user.id,
        email=db_user.email,
        full_name=db_user.full_name,
        role=db_user.role.value,
        is_verified=db_user.is_verified,
        created_at=db_user.created_at
    )

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Fazer login no sistema.
    
    - **email**: Email do usuário
    - **password**: Senha do usuário
    
    Retorna token JWT para autenticação.
    """
    
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Atualizar dados de login
    user.last_login = datetime.utcnow()
    user.login_count += 1
    user.failed_login_attempts = 0
    db.commit()
    
    # Criar token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,  # em segundos
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role.value,
            is_verified=user.is_verified,
            created_at=user.created_at
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """
    Obter dados do usuário logado.
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role.value,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at
    )

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """
    Fazer logout (por enquanto só confirma o logout).
    Em produção, implementar blacklist de tokens.
    """
    return {"message": "Logout successful"}

@router.post("/create-test-data")
async def create_test_data(db: Session = Depends(get_db)):
    """
    Criar dados de teste para desenvolvimento.
    Cria barbeiros e clientes de exemplo.
    """
    
    test_users = [
        # Barbeiros
        {
            "email": "carlos@barbearia.com",
            "password": "123456",
            "full_name": "Carlos Santos",
            "phone": "(11) 99999-0001",
            "role": UserRole.BARBER
        },
        {
            "email": "andre@barbearia.com",
            "password": "123456",
            "full_name": "André Lima",
            "phone": "(11) 99999-0002",
            "role": UserRole.BARBER
        },
        {
            "email": "roberto@barbearia.com",
            "password": "123456",
            "full_name": "Roberto Costa",
            "phone": "(11) 99999-0003",
            "role": UserRole.BARBER
        },
        # Clientes
        {
            "email": "joao@email.com",
            "password": "123456",
            "full_name": "João Silva",
            "phone": "(11) 98888-1001",
            "role": UserRole.CLIENT
        },
        {
            "email": "maria@email.com",
            "password": "123456",
            "full_name": "Maria Santos",
            "phone": "(11) 98888-1002",
            "role": UserRole.CLIENT
        },
        {
            "email": "pedro@email.com",
            "password": "123456",
            "full_name": "Pedro Oliveira",
            "phone": "(11) 98888-1003",
            "role": UserRole.CLIENT
        }
    ]
    
    created_users = []
    skipped_users = []
    
    for user_data in test_users:
        # Verificar se já existe
        existing_user = get_user_by_email(db, user_data["email"])
        if existing_user:
            skipped_users.append(user_data["email"])
            continue
        
        # Criar usuário
        hashed_password = get_password_hash(user_data["password"])
        db_user = User(
            email=user_data["email"],
            hashed_password=hashed_password,
            full_name=user_data["full_name"],
            phone=user_data["phone"],
            role=user_data["role"],
            status=UserStatus.ACTIVE,
            is_verified=True
        )
        
        db.add(db_user)
        created_users.append({
            "email": user_data["email"],
            "name": user_data["full_name"],
            "role": user_data["role"].value
        })
    
    db.commit()
    
    return {
        "message": "Dados de teste criados com sucesso!",
        "created_users": created_users,
        "skipped_users": skipped_users,
        "total_created": len(created_users),
        "total_skipped": len(skipped_users),
        "login_info": {
            "barbeiros": [
                "carlos@barbearia.com:123456",
                "andre@barbearia.com:123456", 
                "roberto@barbearia.com:123456"
            ],
            "clientes": [
                "joao@email.com:123456",
                "maria@email.com:123456",
                "pedro@email.com:123456"
            ]
        }
    }

@router.get("/test")
async def test_auth():
    """
    Endpoint de teste para verificar se a API está funcionando.
    """
    return {
        "message": "🔐 API de Autenticação funcionando!",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    } 