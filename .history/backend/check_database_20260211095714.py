#!/usr/bin/env python3
"""
Script para verificar dados no banco de dados SQLite.
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "barbershop_dev.db"

def check_database():
    """Verificar dados nas tabelas principais"""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("=" * 70)
        print("📊 VERIFICAÇÃO DO BANCO DE DADOS")
        print("=" * 70)
        
        # Verificar usuários
        cursor.execute("SELECT COUNT(*) FROM users")
        users_count = cursor.fetchone()[0]
        print(f"\n👥 Usuários: {users_count}")
        
        cursor.execute("SELECT id, email, full_name, role FROM users")
        for row in cursor.fetchall():
            print(f"   - ID: {row[0]} | Email: {row[1]} | Nome: {row[2]} | Role: {row[3]}")
        
        # Verificar barbeiros
        cursor.execute("SELECT COUNT(*) FROM barbers")
        barbers_count = cursor.fetchone()[0]
        print(f"\n✂️  Barbeiros: {barbers_count}")
        
        if barbers_count > 0:
            cursor.execute("SELECT id, professional_name, user_id, is_active FROM barbers")
            for row in cursor.fetchall():
                print(f"   - ID: {row[0]} | Nome: {row[1]} | User ID: {row[2]} | Ativo: {row[3]}")
        else:
            print("   ⚠️  Nenhum barbeiro cadastrado!")
        
        # Verificar serviços
        cursor.execute("SELECT COUNT(*) FROM services")
        services_count = cursor.fetchone()[0]
        print(f"\n💈 Serviços: {services_count}")
        
        if services_count > 0:
            cursor.execute("SELECT id, name, price, duration_minutes, is_active FROM services")
            for row in cursor.fetchall():
                print(f"   - ID: {row[0]} | Nome: {row[1]} | Preço: R$ {row[2]} | Duração: {row[3]}min | Ativo: {row[4]}")
        else:
            print("   ⚠️  Nenhum serviço cadastrado!")
        
        # Verificar clientes
        cursor.execute("SELECT COUNT(*) FROM clients")
        clients_count = cursor.fetchone()[0]
        print(f"\n👤 Clientes: {clients_count}")
        
        print("\n" + "=" * 70)
        print("✅ Verificação concluída")
        print("=" * 70)
        
        return barbers_count, services_count
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return 0, 0
    finally:
        conn.close()

if __name__ == "__main__":
    barbers, services = check_database()
    
    if barbers == 0:
        print("\n⚠️  PROBLEMA: Não há barbeiros cadastrados!")
        print("   Solução: Os barbeiros precisam ser criados manualmente.")
    elif services == 0:
        print("\n⚠️  PROBLEMA: Não há serviços cadastrados!")
        print("   Solução: Os serviços precisam ser criados.")
