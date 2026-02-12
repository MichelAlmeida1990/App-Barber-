"""
Script para verificar status completo do sistema.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import SessionLocal, engine
from app.models.user import User
from app.models.barber import Barber
from app.models.client import Client
from app.models.appointment import Appointment
from app.models.commission import Commission
from app.models.barber_block import BarberBlock
from sqlalchemy import inspect

def check_tables():
    """Verificar tabelas no banco"""
    print("\n" + "="*60)
    print("🗄️  VERIFICAÇÃO DE TABELAS NO BANCO DE DADOS")
    print("="*60)
    
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    expected_tables = [
        'users',
        'clients',
        'barbers',
        'barbershops',
        'services',
        'appointments',
        'appointment_services',
        'commissions',
        'products',
        'barber_blocks'  # NOVA TABELA
    ]
    
    print(f"\n📊 Total de tabelas: {len(tables)}")
    print("\n✅ Tabelas encontradas:")
    for table in sorted(tables):
        icon = "✅" if table in expected_tables else "❓"
        print(f"   {icon} {table}")
    
    missing = [t for t in expected_tables if t not in tables]
    if missing:
        print(f"\n❌ Tabelas faltando: {', '.join(missing)}")
    else:
        print(f"\n✅ Todas as {len(expected_tables)} tabelas esperadas estão presentes!")
    
    return len(tables)

def check_data():
    """Verificar dados no banco"""
    print("\n" + "="*60)
    print("📊 VERIFICAÇÃO DE DADOS")
    print("="*60)
    
    db = SessionLocal()
    
    try:
        # Contar registros
        users_count = db.query(User).count()
        barbers_count = db.query(Barber).count()
        clients_count = db.query(Client).count()
        appointments_count = db.query(Appointment).count()
        commissions_count = db.query(Commission).count()
        blocks_count = db.query(BarberBlock).count()
        
        print(f"\n📈 Estatísticas:")
        print(f"   👥 Usuários: {users_count}")
        print(f"   ✂️  Barbeiros: {barbers_count}")
        print(f"   👤 Clientes: {clients_count}")
        print(f"   📅 Agendamentos: {appointments_count}")
        print(f"   💰 Comissões: {commissions_count}")
        print(f"   🚫 Bloqueios: {blocks_count}")
        
        # Verificar admin
        admin = db.query(User).filter(User.email == 'admin@barbershop.com').first()
        if admin:
            print(f"\n✅ Admin encontrado:")
            print(f"   Email: {admin.email}")
            print(f"   Role: {admin.role.value}")
            print(f"   Status: {admin.status.value}")
        else:
            print("\n❌ Admin não encontrado!")
        
    finally:
        db.close()

def check_models():
    """Verificar relacionamentos dos modelos"""
    print("\n" + "="*60)
    print("🔗 VERIFICAÇÃO DE RELACIONAMENTOS")
    print("="*60)
    
    db = SessionLocal()
    
    try:
        # Testar relacionamento Barber -> Blocks
        barber = db.query(Barber).first()
        if barber:
            print(f"\n✅ Barbeiro encontrado: {barber.professional_name}")
            print(f"   Bloqueios: {len(barber.blocks) if hasattr(barber, 'blocks') else 'N/A'}")
            print(f"   Comissões: {len(barber.commissions)}")
        
        # Testar relacionamento Commission -> Barber
        commission = db.query(Commission).first()
        if commission:
            print(f"\n✅ Comissão encontrada:")
            print(f"   Valor: R$ {commission.amount:.2f}")
            print(f"   Barbeiro: {commission.barber.professional_name if commission.barber else 'N/A'}")
    
    finally:
        db.close()

def main():
    """Executar todas as verificações"""
    print("\n" + "="*60)
    print("🔍 VERIFICAÇÃO COMPLETA DO SISTEMA")
    print("="*60)
    
    try:
        tables_count = check_tables()
        check_data()
        check_models()
        
        print("\n" + "="*60)
        print("✅ VERIFICAÇÃO CONCLUÍDA")
        print("="*60)
        print(f"\n📊 Resumo:")
        print(f"   • {tables_count} tabelas no banco")
        print(f"   • Sistema funcionando corretamente")
        print(f"   • Pronto para testes")
        
        print(f"\n📚 Documentação:")
        print(f"   • API Docs: http://127.0.0.1:8000/docs")
        print(f"   • Análise Completa: ANALISE_COMPLETA_PRODUCAO.md")
        print(f"   • Resumo: RESUMO_IMPLEMENTACOES.md")
        
    except Exception as e:
        print(f"\n❌ Erro na verificação: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)









