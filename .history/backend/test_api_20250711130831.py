#!/usr/bin/env python3
"""
Script de teste básico para a API do Barbershop Manager.
"""

import requests
import json
from datetime import datetime

# Configurações
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/v1"

def test_health():
    """Testar endpoint de saúde"""
    print("🏥 Testando Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health Check OK")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health Check falhou: {response.status_code}")
    except Exception as e:
        print(f"❌ Erro no Health Check: {e}")

def test_root():
    """Testar endpoint raiz"""
    print("\n🏠 Testando Root endpoint...")
    try:
        response = requests.get(BASE_URL)
        if response.status_code == 200:
            print("✅ Root endpoint OK")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Root endpoint falhou: {response.status_code}")
    except Exception as e:
        print(f"❌ Erro no Root endpoint: {e}")

def test_auth_endpoints():
    """Testar endpoints de autenticação"""
    print("\n🔐 Testando endpoints de autenticação...")
    
    # Test auth test endpoint
    try:
        response = requests.get(f"{API_URL}/auth/test")
        if response.status_code == 200:
            print("✅ Auth test endpoint OK")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Auth test endpoint falhou: {response.status_code}")
    except Exception as e:
        print(f"❌ Erro no Auth test endpoint: {e}")

def test_all_test_endpoints():
    """Testar todos os endpoints de teste"""
    print("\n🧪 Testando todos os endpoints de teste...")
    
    endpoints = [
        ("auth", "🔐"),
        ("appointments", "📅"),
        ("clients", "👥"),
        ("barbers", "✂️"),
        ("services", "🛠️"),
        ("products", "📦"),
        ("sales", "💰"),
        ("analytics", "📊"),
        ("ai", "🤖")
    ]
    
    for endpoint, emoji in endpoints:
        try:
            response = requests.get(f"{API_URL}/{endpoint}/test")
            if response.status_code == 200:
                print(f"✅ {emoji} {endpoint.title()} test OK")
            else:
                print(f"❌ {emoji} {endpoint.title()} test falhou: {response.status_code}")
        except Exception as e:
            print(f"❌ Erro no {endpoint} test: {e}")

def test_docs():
    """Testar se a documentação está acessível"""
    print("\n📚 Testando documentação...")
    
    docs_endpoints = [
        ("/docs", "Swagger UI"),
        ("/redoc", "ReDoc")
    ]
    
    for endpoint, name in docs_endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}")
            if response.status_code == 200:
                print(f"✅ {name} acessível")
            else:
                print(f"❌ {name} não acessível: {response.status_code}")
        except Exception as e:
            print(f"❌ Erro ao acessar {name}: {e}")

def main():
    """Executar todos os testes"""
    print("🚀 INICIANDO TESTES DA API - BARBERSHOP MANAGER")
    print("=" * 50)
    
    test_health()
    test_root()
    test_auth_endpoints()
    test_all_test_endpoints()
    test_docs()
    
    print("\n" + "=" * 50)
    print("🏁 TESTES CONCLUÍDOS!")
    print(f"   Horário: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Acesse a documentação em: {BASE_URL}/docs")

if __name__ == "__main__":
    main() 