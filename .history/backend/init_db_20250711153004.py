#!/usr/bin/env python3
"""
Script para inicializar o banco de dados.
Cria todas as tabelas e dados iniciais.
"""

import sys
from pathlib import Path

# Adicionar o diretório do projeto ao path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import engine, Base
from app.models.user import User
from app.models.client import Client
from app.models.barber import Barber
from app.models.service import Service
from app.models.appointment import Appointment
from app.models.barbershop import Barbershop

def create_tables():
    """Criar todas as tabelas"""
    print("🔄 Criando tabelas do banco de dados...")
    
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas criadas com sucesso!")
        return True
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        return False

def main():
    """Função principal"""
    print("🚀 Inicializando banco de dados...")
    print("=" * 50)
    
    # Criar tabelas
    if create_tables():
        print("\n✅ Banco de dados inicializado com sucesso!")
        print("\n📝 Próximos passos:")
        print("1. Execute o servidor: python -m uvicorn app.main:app --host 127.0.0.1 --port 8002 --reload")
        print("2. Acesse: http://127.0.0.1:8002/docs")
        print("3. Execute: POST /api/v1/auth/create-test-data para criar usuários de teste")
        print("\n👥 Usuários de teste serão:")
        print("Barbeiros:")
        print("  - carlos@barbearia.com:123456")
        print("  - andre@barbearia.com:123456")
        print("  - roberto@barbearia.com:123456")
        print("Clientes:")
        print("  - joao@email.com:123456")
        print("  - maria@email.com:123456")
        print("  - pedro@email.com:123456")
    else:
        print("\n❌ Falha ao inicializar banco de dados!")
        sys.exit(1)

if __name__ == "__main__":
    main() 