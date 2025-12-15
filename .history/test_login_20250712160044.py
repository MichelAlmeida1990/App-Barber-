#!/usr/bin/env python3
import requests
import json

# Testar login do barbeiro
def test_login():
    url = "http://localhost:8000/api/v1/auth/login"
    data = {
        "email": "carlos@barbearia.com",
        "password": "123456"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login funcionou!")
            return True
        else:
            print("❌ Login falhou!")
            return False
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return False

if __name__ == "__main__":
    test_login() 