#!/usr/bin/env python3
"""
Script para criar um usuário administrador.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from app.core.database import SessionLocal
from app.models.user import User, UserRole, UserStatus
from app.api.auth import get_password_hash

def create_admin_user():
    """Criar usuário administrador"""
    db = SessionLocal()
    
    try:
        # Verificar se já existe admin
        admin_user = db.query(User).filter(
            User.email == "admin@barbearia.com"
        ).first()
        
        if admin_user:
            print("✅ Usuário administrador já existe!")
            print(f"   Email: admin@barbearia.com")
            print(f"   Senha: admin123")
            return
        
        # Criar novo usuário admin
        hashed_password = get_password_hash("admin123")
        admin_user = User(
            email="admin@barbearia.com",
            full_name="Administrador",
            hashed_password=hashed_password,
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE,
            is_verified=True,
            phone="(11) 99999-0000"
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Usuário administrador criado com sucesso!")
        print(f"   Email: admin@barbearia.com")
        print(f"   Senha: admin123")
        print(f"   ID: {admin_user.id}")
        
    except Exception as e:
        print(f"❌ Erro ao criar administrador: {e}")
        db.rollback()
        
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user() 