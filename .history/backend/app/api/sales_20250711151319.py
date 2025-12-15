from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel
from app.api.auth import get_current_active_user
from app.models.user import User

router = APIRouter()

# === MODELS ===
class SaleItem(BaseModel):
    tipo: str  # 'servico' ou 'produto'
    nome: str
    preco: float
    quantidade: int = 1

class SaleCreate(BaseModel):
    cliente_id: Optional[str] = None
    cliente_nome: str
    barbeiro_id: Optional[str] = None
    barbeiro_nome: str
    itens: List[SaleItem]
    desconto: float = 0.0
    forma_pagamento: str
    observacoes: Optional[str] = None

class SaleUpdate(BaseModel):
    status: Optional[str] = None
    forma_pagamento: Optional[str] = None
    desconto: Optional[float] = None
    observacoes: Optional[str] = None

class SaleResponse(BaseModel):
    id: str
    cliente_nome: str
    barbeiro_nome: str
    itens: List[SaleItem]
    valor_bruto: float
    desconto: float
    valor_final: float
    forma_pagamento: str
    status: str
    data_criacao: datetime
    observacoes: Optional[str] = None

# === DADOS MOCK ===
mock_sales = [
    {
        "id": "1",
        "cliente_nome": "João Silva",
        "barbeiro_nome": "Carlos Santos", 
        "itens": [
            {"tipo": "servico", "nome": "Corte Masculino", "preco": 45.0, "quantidade": 1},
            {"tipo": "servico", "nome": "Barba Completa", "preco": 25.0, "quantidade": 1},
            {"tipo": "produto", "nome": "Pomada Modeladora", "preco": 35.0, "quantidade": 1}
        ],
        "valor_bruto": 105.0,
        "desconto": 5.0,
        "valor_final": 100.0,
        "forma_pagamento": "Cartão de Crédito",
        "status": "concluida",
        "data_criacao": "2025-01-11T14:30:00",
        "observacoes": "Cliente satisfeito"
    },
    {
        "id": "2", 
        "cliente_nome": "Maria Santos",
        "barbeiro_nome": "André Lima",
        "itens": [
            {"tipo": "servico", "nome": "Corte Feminino", "preco": 60.0, "quantidade": 1}
        ],
        "valor_bruto": 60.0,
        "desconto": 0.0,
        "valor_final": 60.0,
        "forma_pagamento": "PIX",
        "status": "concluida", 
        "data_criacao": "2025-01-11T15:00:00",
        "observacoes": ""
    }
]

# === ENDPOINTS ===

@router.get("/test")
async def test_sales():
    """Endpoint de teste para verificar se a API de vendas está funcionando"""
    return {
        "status": "success",
        "message": "✅ API de Vendas funcionando perfeitamente!",
        "timestamp": datetime.now().isoformat(),
        "endpoint": "sales",
        "features": [
            "Registro de vendas completo",
            "Gestão de serviços e produtos",
            "Múltiplas formas de pagamento",
            "Sistema de descontos",
            "Relatórios de faturamento",
            "Comissões por barbeiro"
        ]
    }

@router.get("/", response_model=List[SaleResponse])
async def list_sales(
    status: Optional[str] = Query(None, description="Filtrar por status"),
    data_inicio: Optional[date] = Query(None, description="Data início"),
    data_fim: Optional[date] = Query(None, description="Data fim"),
    barbeiro: Optional[str] = Query(None, description="Filtrar por barbeiro"),
    forma_pagamento: Optional[str] = Query(None, description="Filtrar por forma de pagamento"),
    limit: int = Query(50, description="Limite de resultados"),
    offset: int = Query(0, description="Paginação"),
    current_user: User = Depends(get_current_active_user)
):
    """
    Listar todas as vendas com filtros opcionais
    """
    sales = mock_sales.copy()
    
    # Aplicar filtros
    if status:
        sales = [s for s in sales if s["status"] == status]
    
    if barbeiro:
        sales = [s for s in sales if barbeiro.lower() in s["barbeiro_nome"].lower()]
        
    if forma_pagamento:
        sales = [s for s in sales if s["forma_pagamento"] == forma_pagamento]
    
    # Paginação
    total = len(sales)
    sales = sales[offset:offset + limit]
    
    return sales

@router.get("/{sale_id}", response_model=SaleResponse)
async def get_sale(
    sale_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Buscar venda específica por ID
    """
    sale = next((s for s in mock_sales if s["id"] == sale_id), None)
    if not sale:
        raise HTTPException(status_code=404, detail="Venda não encontrada")
    
    return sale

@router.post("/", response_model=SaleResponse)
async def create_sale(
    sale_data: SaleCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Criar nova venda
    """
    # Calcular valores
    valor_bruto = sum(item.preco * item.quantidade for item in sale_data.itens)
    valor_final = valor_bruto - sale_data.desconto
    
    new_sale = {
        "id": str(len(mock_sales) + 1),
        "cliente_nome": sale_data.cliente_nome,
        "barbeiro_nome": sale_data.barbeiro_nome,
        "itens": [item.dict() for item in sale_data.itens],
        "valor_bruto": valor_bruto,
        "desconto": sale_data.desconto,
        "valor_final": valor_final,
        "forma_pagamento": sale_data.forma_pagamento,
        "status": "concluida",
        "data_criacao": datetime.now().isoformat(),
        "observacoes": sale_data.observacoes or ""
    }
    
    mock_sales.append(new_sale)
    return new_sale

@router.put("/{sale_id}", response_model=SaleResponse)
async def update_sale(
    sale_id: str,
    sale_update: SaleUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Atualizar venda existente
    """
    sale = next((s for s in mock_sales if s["id"] == sale_id), None)
    if not sale:
        raise HTTPException(status_code=404, detail="Venda não encontrada")
    
    # Atualizar campos fornecidos
    if sale_update.status is not None:
        sale["status"] = sale_update.status
    if sale_update.forma_pagamento is not None:
        sale["forma_pagamento"] = sale_update.forma_pagamento
    if sale_update.desconto is not None:
        sale["desconto"] = sale_update.desconto
        # Recalcular valor final
        sale["valor_final"] = sale["valor_bruto"] - sale["desconto"]
    if sale_update.observacoes is not None:
        sale["observacoes"] = sale_update.observacoes
    
    return sale

@router.delete("/{sale_id}")
async def delete_sale(
    sale_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Excluir venda (soft delete)
    """
    sale = next((s for s in mock_sales if s["id"] == sale_id), None)
    if not sale:
        raise HTTPException(status_code=404, detail="Venda não encontrada")
    
    # Soft delete - marcar como cancelada
    sale["status"] = "cancelada"
    
    return {"message": "Venda cancelada com sucesso", "sale_id": sale_id}

@router.get("/stats/dashboard")
async def get_sales_stats(
    data_inicio: Optional[date] = Query(None),
    data_fim: Optional[date] = Query(None),
    current_user: User = Depends(get_current_active_user)
):
    """
    Estatísticas de vendas para dashboard
    """
    sales = [s for s in mock_sales if s["status"] != "cancelada"]
    
    total_vendas = len(sales)
    vendas_concluidas = len([s for s in sales if s["status"] == "concluida"])
    vendas_pendentes = len([s for s in sales if s["status"] == "pendente"])
    
    receita_total = sum(s["valor_final"] for s in sales if s["status"] == "concluida")
    ticket_medio = receita_total / vendas_concluidas if vendas_concluidas > 0 else 0
    
    # Vendas por forma de pagamento
    formas_pagamento = {}
    for sale in sales:
        forma = sale["forma_pagamento"]
        if forma not in formas_pagamento:
            formas_pagamento[forma] = {"quantidade": 0, "valor": 0}
        formas_pagamento[forma]["quantidade"] += 1
        if sale["status"] == "concluida":
            formas_pagamento[forma]["valor"] += sale["valor_final"]
    
    # Top barbeiros
    barbeiros = {}
    for sale in sales:
        barbeiro = sale["barbeiro_nome"]
        if barbeiro not in barbeiros:
            barbeiros[barbeiro] = {"vendas": 0, "receita": 0}
        barbeiros[barbeiro]["vendas"] += 1
        if sale["status"] == "concluida":
            barbeiros[barbeiro]["receita"] += sale["valor_final"]
    
    return {
        "resumo": {
            "total_vendas": total_vendas,
            "vendas_concluidas": vendas_concluidas,
            "vendas_pendentes": vendas_pendentes,
            "receita_total": receita_total,
            "ticket_medio": ticket_medio
        },
        "formas_pagamento": formas_pagamento,
        "barbeiros": barbeiros,
        "periodo": {
            "data_inicio": data_inicio,
            "data_fim": data_fim
        }
    }

@router.get("/barbeiros/{barbeiro_id}/comissoes")
async def get_barber_commissions(
    barbeiro_id: str,
    mes: Optional[int] = Query(None, description="Mês (1-12)"),
    ano: Optional[int] = Query(None, description="Ano"),
    current_user: User = Depends(get_current_active_user)
):
    """
    Calcular comissões de um barbeiro específico
    """
    # Filtrar vendas do barbeiro
    barbeiro_sales = [s for s in mock_sales if s["barbeiro_nome"].lower().replace(" ", "") == barbeiro_id.lower()]
    
    total_vendas = len(barbeiro_sales)
    receita_bruta = sum(s["valor_bruto"] for s in barbeiro_sales if s["status"] == "concluida")
    receita_liquida = sum(s["valor_final"] for s in barbeiro_sales if s["status"] == "concluida")
    
    # Calcular comissão (exemplo: 40% sobre valor final)
    percentual_comissao = 0.40
    comissao_total = receita_liquida * percentual_comissao
    
    return {
        "barbeiro_id": barbeiro_id,
        "periodo": {"mes": mes, "ano": ano},
        "resumo": {
            "total_vendas": total_vendas,
            "receita_bruta": receita_bruta,
            "receita_liquida": receita_liquida,
            "percentual_comissao": percentual_comissao * 100,
            "comissao_total": comissao_total
        },
        "vendas": barbeiro_sales
    } 