#!/usr/bin/env python3
"""
Script de migração para adicionar colunas faltantes na tabela services.
Adiciona as colunas relacionadas a pausa (has_pause, pause_duration_minutes, pause_description).
"""

import sqlite3
import sys
from pathlib import Path

DB_PATH = Path(__file__).parent / "barbershop_dev.db"

def migrate_services_table():
    """Adicionar colunas faltantes na tabela services"""
    
    if not DB_PATH.exists():
        print(f"❌ Banco de dados não encontrado: {DB_PATH}")
        return False
    
    print(f"🔍 Conectando ao banco: {DB_PATH}")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Verificar se a tabela services existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='services'")
        if not cursor.fetchone():
            print("❌ Tabela 'services' não existe no banco de dados")
            return False
        
        print("✅ Tabela 'services' encontrada")
        
        # Obter colunas atuais
        cursor.execute("PRAGMA table_info(services)")
        existing_columns = {row[1] for row in cursor.fetchall()}
        print(f"📋 Colunas existentes: {', '.join(sorted(existing_columns))}")
        
        # Colunas que precisam ser adicionadas
        columns_to_add = {
            'preparation_time': 'INTEGER DEFAULT 0',
            'cleanup_time': 'INTEGER DEFAULT 5',
            'has_pause': 'INTEGER DEFAULT 0',
            'pause_duration_minutes': 'INTEGER DEFAULT 0',
            'pause_description': 'TEXT',
            'promotional_price': 'REAL',
            'is_promotional': 'INTEGER DEFAULT 0',
            'is_featured': 'INTEGER DEFAULT 0',
            'requires_appointment': 'INTEGER DEFAULT 1',
            'max_per_day': 'INTEGER',
            'image_url': 'TEXT',
            'gallery_urls': 'TEXT',
            'age_restriction': 'INTEGER',
            'gender_restriction': 'TEXT',
            'special_requirements': 'TEXT',
            'commission_rate': 'REAL',
            'total_bookings': 'INTEGER DEFAULT 0',
            'total_revenue': 'REAL DEFAULT 0.0',
            'average_rating': 'REAL DEFAULT 0.0',
            'created_at': 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            'updated_at': 'TIMESTAMP',
            'deleted_at': 'TIMESTAMP'
        }
        
        added_count = 0
        skipped_count = 0
        
        for column_name, column_type in columns_to_add.items():
            if column_name not in existing_columns:
                try:
                    sql = f"ALTER TABLE services ADD COLUMN {column_name} {column_type}"
                    print(f"   ➕ Adicionando coluna: {column_name}")
                    cursor.execute(sql)
                    added_count += 1
                except sqlite3.OperationalError as e:
                    print(f"   ⚠️  Erro ao adicionar {column_name}: {e}")
            else:
                skipped_count += 1
        
        conn.commit()
        print(f"\n✅ Migração concluída!")
        print(f"   📊 Colunas adicionadas: {added_count}")
        print(f"   📊 Colunas já existentes: {skipped_count}")
        
        # Verificar colunas após migração
        cursor.execute("PRAGMA table_info(services)")
        new_columns = {row[1] for row in cursor.fetchall()}
        print(f"\n📋 Total de colunas após migração: {len(new_columns)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro durante migração: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def migrate_barbers_table():
    """Verificar e adicionar colunas faltantes na tabela barbers se necessário"""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='barbers'")
        if not cursor.fetchone():
            print("ℹ️  Tabela 'barbers' não existe (será criada automaticamente)")
            return True
        
        print("\n✅ Tabela 'barbers' encontrada")
        return True
        
    except Exception as e:
        print(f"⚠️  Erro ao verificar tabela barbers: {e}")
        return True
    finally:
        conn.close()

if __name__ == "__main__":
    print("🚀 Iniciando migração do banco de dados...")
    print("=" * 60)
    
    success = migrate_services_table()
    migrate_barbers_table()
    
    if success:
        print("\n" + "=" * 60)
        print("✅ Migração concluída com sucesso!")
        print("\n📝 Próximos passos:")
        print("   1. Execute: curl -X POST http://localhost:8000/api/v1/auth/create-test-data")
        print("   2. Teste o agendamento no frontend")
        sys.exit(0)
    else:
        print("\n" + "=" * 60)
        print("❌ Migração falhou!")
        sys.exit(1)
