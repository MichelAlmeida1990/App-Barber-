from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract, case
from datetime import datetime, timedelta, date
from typing import Optional, List
from collections import defaultdict

from app.core.database import get_db
from app.api.auth import get_current_active_user
from app.models.user import User
from app.models.appointment import Appointment, AppointmentStatus
from app.models.barber import Barber
from app.models.client import Client
from app.models.service import Service

router = APIRouter()

@router.get("/test")
async def test_analytics():
    return {"message": "📊 API de Analytics funcionando!", "timestamp": datetime.utcnow().isoformat()}

# ===== ENDPOINT: RECEITA AO LONGO DO TEMPO =====
@router.get("/revenue")
async def get_revenue_over_time(
    period: str = Query("daily", regex="^(daily|weekly|monthly)$"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retorna receita ao longo do tempo
    
    Períodos disponíveis:
    - daily: Últimos 30 dias
    - weekly: Últimas 12 semanas
    - monthly: Últimos 12 meses
    """
    
    # Definir período padrão se não especificado
    if not end_date:
        end_date = date.today()
    
    if not start_date:
        if period == "daily":
            start_date = end_date - timedelta(days=30)
        elif period == "weekly":
            start_date = end_date - timedelta(weeks=12)
        else:  # monthly
            start_date = end_date - timedelta(days=365)
    
    # Buscar agendamentos completados no período
    appointments = db.query(Appointment).filter(
        and_(
            Appointment.status == AppointmentStatus.COMPLETED,
            func.date(Appointment.appointment_date) >= start_date,
            func.date(Appointment.appointment_date) <= end_date
        )
    ).all()
    
    # Agrupar por período
    revenue_data = defaultdict(float)
    
    for apt in appointments:
        apt_date = apt.appointment_date.date()
        
        if period == "daily":
            key = apt_date.strftime("%Y-%m-%d")
        elif period == "weekly":
            # Agrupar por semana (segunda-feira)
            week_start = apt_date - timedelta(days=apt_date.weekday())
            key = week_start.strftime("%Y-%m-%d")
        else:  # monthly
            key = apt_date.strftime("%Y-%m")
        
        revenue_data[key] += float(apt.final_amount or apt.total_amount)
    
    # Converter para lista ordenada
    result = [
        {"period": period_key, "revenue": revenue}
        for period_key, revenue in sorted(revenue_data.items())
    ]
    
    # Calcular estatísticas
    total_revenue = sum(item["revenue"] for item in result)
    avg_revenue = total_revenue / len(result) if result else 0
    
    # Calcular comparativo com período anterior
    previous_period_start = start_date - (end_date - start_date)
    previous_appointments = db.query(Appointment).filter(
        and_(
            Appointment.status == AppointmentStatus.COMPLETED,
            func.date(Appointment.appointment_date) >= previous_period_start,
            func.date(Appointment.appointment_date) < start_date
        )
    ).all()
    
    previous_revenue = sum(float(apt.final_amount or apt.total_amount) for apt in previous_appointments)
    growth_rate = ((total_revenue - previous_revenue) / previous_revenue * 100) if previous_revenue > 0 else 0
    
    return {
        "period_type": period,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "data": result,
        "summary": {
            "total_revenue": total_revenue,
            "average_revenue": avg_revenue,
            "previous_period_revenue": previous_revenue,
            "growth_rate": round(growth_rate, 2)
        }
    }

# ===== ENDPOINT: AGENDAMENTOS POR DIA DA SEMANA =====
@router.get("/appointments-by-weekday")
async def get_appointments_by_weekday(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retorna distribuição de agendamentos por dia da semana
    """
    
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=90)  # Últimos 3 meses
    
    # Buscar agendamentos
    appointments = db.query(Appointment).filter(
        and_(
            Appointment.status.in_([AppointmentStatus.COMPLETED, AppointmentStatus.CONFIRMED]),
            func.date(Appointment.appointment_date) >= start_date,
            func.date(Appointment.appointment_date) <= end_date
        )
    ).all()
    
    # Contar por dia da semana
    weekday_counts = defaultdict(lambda: {"count": 0, "revenue": 0.0})
    weekday_names = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
    
    for apt in appointments:
        weekday = apt.appointment_date.weekday()  # 0 = Monday
        weekday_counts[weekday]["count"] += 1
        weekday_counts[weekday]["revenue"] += float(apt.final_amount or apt.total_amount)
    
    # Formatar resultado
    result = [
        {
            "weekday": weekday_names[day],
            "appointments": weekday_counts[day]["count"],
            "revenue": weekday_counts[day]["revenue"]
        }
        for day in range(7)
    ]
    
    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "data": result
    }

# ===== ENDPOINT: PERFORMANCE DE BARBEIROS =====
@router.get("/barbers-performance")
async def get_barbers_performance(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retorna performance de cada barbeiro
    """
    
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)  # Último mês
    
    # Buscar todos os barbeiros
    barbers = db.query(Barber).all()
    
    result = []
    for barber in barbers:
        # Buscar agendamentos do barbeiro
        appointments = db.query(Appointment).filter(
            and_(
                Appointment.barber_id == barber.id,
                Appointment.status == AppointmentStatus.COMPLETED,
                func.date(Appointment.appointment_date) >= start_date,
                func.date(Appointment.appointment_date) <= end_date
            )
        ).all()
        
        total_appointments = len(appointments)
        total_revenue = sum(float(apt.final_amount or apt.total_amount) for apt in appointments)
        
        # Calcular média de avaliações
        ratings = [apt.rating for apt in appointments if apt.rating]
        avg_rating = sum(ratings) / len(ratings) if ratings else 0
        
        result.append({
            "barber_id": barber.id,
            "barber_name": barber.name,
            "total_appointments": total_appointments,
            "total_revenue": total_revenue,
            "average_rating": round(avg_rating, 2),
            "average_revenue_per_appointment": round(total_revenue / total_appointments, 2) if total_appointments > 0 else 0
        })
    
    # Ordenar por receita (maior primeiro)
    result.sort(key=lambda x: x["total_revenue"], reverse=True)
    
    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "data": result
    }

# ===== ENDPOINT: SERVIÇOS MAIS VENDIDOS =====
@router.get("/services-ranking")
async def get_services_ranking(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retorna ranking dos serviços mais vendidos
    """
    
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    # Buscar todos os serviços
    services = db.query(Service).all()
    
    # Para cada serviço, contar quantas vezes foi usado
    # NOTA: Como não temos a tabela appointment_services populada,
    # vamos usar dados mock baseados nos serviços cadastrados
    
    result = []
    for service in services:
        # TODO: Implementar query real quando appointment_services estiver populada
        # Por enquanto, usar valores mock para demonstração
        result.append({
            "service_id": service.id,
            "service_name": service.name,
            "category": service.category,
            "times_sold": 0,  # TODO: Query real
            "total_revenue": 0.0,  # TODO: Query real
            "price": float(service.price)
        })
    
    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "data": result,
        "note": "Dados de serviços requerem tabela appointment_services populada"
    }

# ===== ENDPOINT: TAXA DE OCUPAÇÃO (HEATMAP) =====
@router.get("/occupancy-heatmap")
async def get_occupancy_heatmap(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retorna taxa de ocupação por dia e hora (para heatmap)
    """
    
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    # Buscar agendamentos
    appointments = db.query(Appointment).filter(
        and_(
            Appointment.status.in_([AppointmentStatus.COMPLETED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS]),
            func.date(Appointment.appointment_date) >= start_date,
            func.date(Appointment.appointment_date) <= end_date
        )
    ).all()
    
    # Agrupar por hora e dia da semana
    occupancy = defaultdict(lambda: defaultdict(int))
    weekday_names = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
    
    for apt in appointments:
        weekday = apt.appointment_date.weekday()
        hour = apt.appointment_date.hour
        occupancy[weekday][hour] += 1
    
    # Formatar para heatmap
    heatmap_data = []
    for day in range(7):
        for hour in range(8, 19):  # 8h às 18h
            count = occupancy[day].get(hour, 0)
            heatmap_data.append({
                "weekday": weekday_names[day],
                "hour": f"{hour:02d}:00",
                "appointments": count,
                "occupancy_level": "high" if count >= 3 else "medium" if count >= 2 else "low"
            })
    
    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "data": heatmap_data
    }

# ===== ENDPOINT: RETENÇÃO DE CLIENTES =====
@router.get("/retention-metrics")
async def get_retention_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retorna métricas de retenção de clientes
    """
    
    today = date.today()
    thirty_days_ago = today - timedelta(days=30)
    sixty_days_ago = today - timedelta(days=60)
    
    # Total de clientes
    total_clients = db.query(Client).filter(Client.is_active == True).count()
    
    # Clientes ativos (com agendamento nos últimos 30 dias)
    active_clients = db.query(Client.id).join(Appointment).filter(
        and_(
            Client.is_active == True,
            Appointment.status == AppointmentStatus.COMPLETED,
            func.date(Appointment.appointment_date) >= thirty_days_ago
        )
    ).distinct().count()
    
    # Clientes novos (primeiro agendamento nos últimos 30 dias)
    new_clients = db.query(Client.id).join(Appointment).filter(
        and_(
            Client.is_active == True,
            Appointment.status == AppointmentStatus.COMPLETED,
            func.date(Appointment.appointment_date) >= thirty_days_ago
        )
    ).group_by(Client.id).having(
        func.min(func.date(Appointment.appointment_date)) >= thirty_days_ago
    ).count()
    
    # Taxa de retenção
    retention_rate = (active_clients / total_clients * 100) if total_clients > 0 else 0
    
    return {
        "total_clients": total_clients,
        "active_clients": active_clients,
        "new_clients": new_clients,
        "retention_rate": round(retention_rate, 2),
        "churn_risk": total_clients - active_clients
    }

# ===== ENDPOINT: DASHBOARD COMPLETO =====
@router.get("/dashboard")
async def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retorna resumo completo para o dashboard
    """
    
    today = date.today()
    thirty_days_ago = today - timedelta(days=30)
    
    # Agendamentos hoje
    today_appointments = db.query(Appointment).filter(
        func.date(Appointment.appointment_date) == today
    ).count()
    
    # Receita do mês
    monthly_revenue = db.query(
        func.sum(Appointment.final_amount)
    ).filter(
        and_(
            Appointment.status == AppointmentStatus.COMPLETED,
            func.date(Appointment.appointment_date) >= thirty_days_ago
        )
    ).scalar() or 0
    
    # Clientes ativos
    active_clients = db.query(Client).filter(Client.is_active == True).count()
    
    # Barbeiros ativos
    active_barbers = db.query(Barber).filter(Barber.is_active == True).count()
    
    # Agendamentos pendentes
    pending_appointments = db.query(Appointment).filter(
        Appointment.status == AppointmentStatus.PENDING
    ).count()
    
    return {
        "today_appointments": today_appointments,
        "monthly_revenue": float(monthly_revenue),
        "active_clients": active_clients,
        "active_barbers": active_barbers,
        "pending_appointments": pending_appointments,
        "timestamp": datetime.utcnow().isoformat()
    } 