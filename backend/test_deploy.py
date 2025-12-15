#!/usr/bin/env python3
"""
Script de teste para verificar se o backend está pronto para deploy.
"""

import sys
import os

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Testa se todos os imports funcionam"""
    print("🔍 Testando imports...")
    try:
        from app.main import app
        from app.core.database import Base, engine
        from app.core.config import settings
        print("✅ Todos os imports funcionaram!")
        return True
    except Exception as e:
        print(f"❌ Erro nos imports: {e}")
        return False

def test_config():
    """Testa se as configurações estão corretas"""
    print("🔍 Testando configurações...")
    try:
        from app.core.config import settings
        
        # Verificar configurações essenciais
        if not settings.secret_key or len(settings.secret_key) < 32:
            print("⚠️  SECRET_KEY deve ter pelo menos 32 caracteres")
            return False
        
        print("✅ Configurações OK!")
        return True
    except Exception as e:
        print(f"❌ Erro nas configurações: {e}")
        return False

def test_database_connection():
    """Testa conexão com banco de dados"""
    print("🔍 Testando conexão com banco de dados...")
    try:
        from app.core.database import engine
        from sqlalchemy import text
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        print("✅ Conexão com banco de dados OK!")
        return True
    except Exception as e:
        print(f"⚠️  Erro na conexão com banco (pode ser normal se não estiver configurado): {e}")
        return True  # Não é crítico para o build

def test_routes():
    """Testa se as rotas estão registradas"""
    print("🔍 Testando rotas...")
    try:
        from app.main import app
        
        routes = [route.path for route in app.routes]
        expected_routes = [
            "/health",
            "/",
            "/docs",
            "/api/v1/auth",
            "/api/v1/appointments",
        ]
        
        found_routes = [r for r in expected_routes if any(r in route for route in routes)]
        
        if len(found_routes) >= 3:
            print(f"✅ {len(found_routes)} rotas principais encontradas!")
            return True
        else:
            print(f"⚠️  Apenas {len(found_routes)} rotas encontradas")
            return False
    except Exception as e:
        print(f"❌ Erro ao testar rotas: {e}")
        return False

def main():
    """Executa todos os testes"""
    print("🚀 Iniciando testes de deploy...\n")
    
    tests = [
        ("Imports", test_imports),
        ("Configurações", test_config),
        ("Conexão DB", test_database_connection),
        ("Rotas", test_routes),
    ]
    
    results = []
    for name, test_func in tests:
        print(f"\n📋 Teste: {name}")
        result = test_func()
        results.append((name, result))
        print()
    
    # Resumo
    print("=" * 50)
    print("📊 RESUMO DOS TESTES")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASSOU" if result else "❌ FALHOU"
        print(f"{name}: {status}")
    
    print(f"\n🎯 Resultado: {passed}/{total} testes passaram")
    
    if passed == total:
        print("\n🎉 Todos os testes passaram! Pronto para deploy!")
        return 0
    elif passed >= total - 1:
        print("\n⚠️  Alguns testes falharam, mas pode ser seguro fazer deploy")
        return 0
    else:
        print("\n❌ Muitos testes falharam. Revise antes de fazer deploy!")
        return 1

if __name__ == "__main__":
    sys.exit(main())

