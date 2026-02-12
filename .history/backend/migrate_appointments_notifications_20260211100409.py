#!/usr/bin/env python3
"""
Script de migração para adicionar colunas de notificação e confirmação na tabela appointments.
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "barbershop_dev.db"

def migrate_appointments_table():
    """Adicionar colunas de notificação e confirmação na tabela appointments"""
    
    if not DB_PATH.exists():
        print(f"❌ Banco de dados não encontrado: {DB_PATH}")
        return False
    
    print(f"🔍 Conectando ao banco: {DB_PATH}")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Verificar se a tabela appointments existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='appointments'")
        if not cursor.fetchone():
            print("❌ Tabela 'appointments' não existe no banco de dados")
            return False
        
        print("✅ Tabela 'appointments' encontrada")
        
        # Obter colunas atuais
        cursor.execute("PRAGMA table_info(appointments)")
        existing_columns = {row[1] for row in cursor.fetchall()}
        print(f"📋 Colunas existentes: {len(existing_columns)}")
        
        # Colunas que precisam ser adicionadas
        columns_to_add = {
            'confirmed_at': 'TIMESTAMP',
            'confirmation_notification_sent': 'INTEGER DEFAULT 0',
            'timeline_events': 'TEXT'  # JSON com histórico de eventos
        }
        
        added_count = 0
        
        for column_name, column_type in columns_to_add.items():
            if column_name not in existing_columns:
                try:
                    sql = f"ALTER TABLE appointments ADD COLUMN {column_name} {column_type}"
                    print(f"   ➕ Adicionando coluna: {column_name}")
                    cursor.execute(sql)
                    added_count += 1
                except sqlite3.OperationalError as e:
                    print(f"   ⚠️  Erro ao adicionar {column_name}: {e}")
            else:
                print(f"   ✅ Coluna {column_name} já existe")
        
        conn.commit()
        print(f"\n✅ Migração concluída!")
        print(f"   📊 Colunas adicionadas: {added_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro durante migração: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("🚀 Iniciando migração de appointments...")
    print("=" * 70)
    
    if migrate_appointments_table():
        print("\n" + "=" * 70)
        print("✅ Migração de appointments concluída com sucesso!")
    else:
        print("\n" + "=" * 70)
        print("❌ Migração de appointments falhou!")
