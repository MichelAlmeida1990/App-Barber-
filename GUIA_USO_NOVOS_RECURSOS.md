# 📘 GUIA DE USO - NOVOS RECURSOS

## 🚫 Sistema de Bloqueio de Agenda

### Visão Geral
Permite que barbeiros bloqueiem períodos da agenda quando não estiverem disponíveis.

### Como Usar via API

#### 1. Bloquear Dia Inteiro

```bash
# Exemplo: Feriado
curl -X POST http://localhost:8000/api/v1/barber-blocks/ \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "block_date": "2025-12-25",
    "all_day": true,
    "reason": "Feriado - Natal",
    "notes": "Barbearia fechada"
  }'
```

#### 2. Bloquear Período Específico

```bash
# Exemplo: Almoço
curl -X POST http://localhost:8000/api/v1/barber-blocks/ \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "block_date": "2025-12-20",
    "all_day": false,
    "start_time": "2025-12-20T12:00:00",
    "end_time": "2025-12-20T14:00:00",
    "reason": "Horário de almoço",
    "notes": "Retorno às 14h"
  }'
```

#### 3. Listar Bloqueios

```bash
# Listar meus bloqueios (barbeiro)
curl http://localhost:8000/api/v1/barber-blocks/ \
  -H "Authorization: Bearer SEU_TOKEN"

# Listar bloqueios de um barbeiro específico (admin)
curl "http://localhost:8000/api/v1/barber-blocks/?barber_id=1" \
  -H "Authorization: Bearer SEU_TOKEN"

# Filtrar por período
curl "http://localhost:8000/api/v1/barber-blocks/?start_date=2025-12-01&end_date=2025-12-31" \
  -H "Authorization: Bearer SEU_TOKEN"
```

#### 4. Atualizar Bloqueio

```bash
curl -X PUT http://localhost:8000/api/v1/barber-blocks/1 \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Motivo atualizado",
    "is_active": true
  }'
```

#### 5. Remover Bloqueio

```bash
curl -X DELETE http://localhost:8000/api/v1/barber-blocks/1 \
  -H "Authorization: Bearer SEU_TOKEN"
```

#### 6. Verificar Disponibilidade (Público)

```bash
# Verificar se barbeiro está disponível
curl "http://localhost:8000/api/v1/barber-blocks/check-availability/1?check_date=2025-12-25"

# Verificar horário específico
curl "http://localhost:8000/api/v1/barber-blocks/check-availability/1?check_date=2025-12-20&start_time=12:00&end_time=13:00"
```

### Casos de Uso Comuns

#### Cenário 1: Férias do Barbeiro
```json
{
  "block_date": "2025-12-20",
  "all_day": true,
  "reason": "Férias",
  "notes": "Retorno dia 05/01"
}
```

#### Cenário 2: Compromisso Médico
```json
{
  "block_date": "2025-12-15",
  "all_day": false,
  "start_time": "2025-12-15T14:00:00",
  "end_time": "2025-12-15T16:00:00",
  "reason": "Consulta médica"
}
```

#### Cenário 3: Treinamento
```json
{
  "block_date": "2025-12-18",
  "all_day": false,
  "start_time": "2025-12-18T09:00:00",
  "end_time": "2025-12-18T12:00:00",
  "reason": "Treinamento de novos produtos"
}
```

---

## 📝 Sistema de Observações em Agendamentos

### Campos Disponíveis

#### 1. `client_notes` - Observações do Cliente
Preferências e requisições especiais do cliente.

**Exemplo:**
```json
{
  "client_notes": "Prefiro corte degradê alto, sem usar máquina 0"
}
```

#### 2. `barber_notes` - Observações do Barbeiro
Anotações técnicas sobre o atendimento.

**Exemplo:**
```json
{
  "barber_notes": "Cliente tem couro cabeludo sensível, usar produtos sem álcool. Prefere conversar durante o atendimento."
}
```

#### 3. `internal_notes` - Observações Internas
Notas administrativas ou especiais.

**Exemplo:**
```json
{
  "internal_notes": "Cliente VIP - prioridade no atendimento. Oferece gorjeta generosa."
}
```

### Como Usar

#### Ao Criar Agendamento
```bash
curl -X POST http://localhost:8000/api/v1/appointments/ \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "barber_id": 1,
    "service_ids": [1, 2],
    "appointment_date": "2025-12-20T10:00:00",
    "client_notes": "Prefiro corte militar",
    "barber_notes": "Cliente já foi atendido anteriormente"
  }'
```

#### Ao Atualizar Agendamento
```bash
curl -X PUT http://localhost:8000/api/v1/appointments/1 \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "barber_notes": "Cliente satisfeito com o resultado. Agendar retorno em 30 dias."
  }'
```

---

## 💰 Sistema de Comissões - Guia de Uso

### Geração Automática

#### Gerar Para Todos Agendamentos Concluídos
```bash
curl -X POST http://localhost:8000/api/v1/commissions/auto-generate \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta:**
```json
{
  "message": "Geradas 15 comissões automaticamente",
  "generated_count": 15,
  "generated_commissions": [
    {
      "appointment_id": 1,
      "barber_name": "Carlos Santos",
      "amount": 30.00
    }
  ]
}
```

#### Gerar Para Agendamento Específico
```bash
curl -X POST http://localhost:8000/api/v1/commissions/generate-for-appointment/1 \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Consultar Comissões

#### Comissões do Barbeiro
```bash
# Resumo mensal
curl http://localhost:8000/api/v1/commissions/barber/1/summary \
  -H "Authorization: Bearer SEU_TOKEN"

# Lista detalhada
curl http://localhost:8000/api/v1/commissions/barber/1 \
  -H "Authorization: Bearer SEU_TOKEN"

# Filtrar por período
curl "http://localhost:8000/api/v1/commissions/barber/1?start_date=2025-12-01&end_date=2025-12-31" \
  -H "Authorization: Bearer SEU_TOKEN"
```

#### Todas Comissões (Admin)
```bash
# Resumo geral
curl http://localhost:8000/api/v1/commissions/summary \
  -H "Authorization: Bearer SEU_TOKEN"

# Lista completa
curl http://localhost:8000/api/v1/commissions/all \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Criar Comissão Manual

```bash
curl -X POST http://localhost:8000/api/v1/commissions/create \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "barber_id": 1,
    "commission_type": "product",
    "amount": 25.00,
    "percentage": 25.0,
    "description": "Venda de produto - Pomada Premium",
    "date": "2025-12-14"
  }'
```

### Calcular Comissão

```bash
curl -X POST http://localhost:8000/api/v1/commissions/calculate-appointment \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": 1
  }'
```

**Resposta:**
```json
{
  "appointment_id": 1,
  "barber_id": 1,
  "barber_name": "Carlos Santos",
  "total_appointment_value": 100.00,
  "total_commission": 30.00,
  "commission_rate": 0.30,
  "commission_percentage": 30.0
}
```

---

## 🔄 Fluxo Completo de Uso

### Cenário: Barbeiro Marca Férias

1. **Criar Bloqueio de Agenda**
```bash
POST /api/v1/barber-blocks/
{
  "block_date": "2025-12-25",
  "all_day": true,
  "reason": "Férias"
}
```

2. **Clientes Tentam Agendar**
- Sistema verifica automaticamente bloqueios
- Retorna indisponibilidade para a data

3. **Barbeiro Retorna**
```bash
DELETE /api/v1/barber-blocks/1
```

### Cenário: Atendimento com Observações

1. **Cliente Agenda**
```bash
POST /api/v1/appointments/
{
  "client_notes": "Primeira vez na barbearia, quero um corte moderno"
}
```

2. **Barbeiro Atende e Adiciona Notas**
```bash
PUT /api/v1/appointments/1
{
  "barber_notes": "Cliente gostou do resultado. Tem cabelo ondulado, precisa de produtos específicos.",
  "status": "completed"
}
```

3. **Sistema Gera Comissão Automaticamente**
```bash
POST /api/v1/commissions/auto-generate
```

---

## 🎯 Boas Práticas

### Bloqueios de Agenda

✅ **Faça:**
- Crie bloqueios com antecedência
- Adicione motivo claro
- Use observações para detalhes
- Desative em vez de deletar (histórico)

❌ **Evite:**
- Bloqueios sem motivo
- Bloqueios de última hora sem aviso
- Deletar bloqueios antigos (use is_active=false)

### Observações

✅ **Faça:**
- Seja específico e objetivo
- Registre preferências importantes
- Atualize após cada atendimento
- Use client_notes para preferências
- Use barber_notes para técnicas

❌ **Evite:**
- Informações pessoais sensíveis
- Comentários negativos
- Informações redundantes

### Comissões

✅ **Faça:**
- Gere comissões periodicamente
- Verifique valores antes de finalizar
- Mantenha taxas documentadas
- Revise resumos mensais

❌ **Evite:**
- Gerar comissões duplicadas
- Alterar comissões já pagas
- Criar comissões sem appointment_id

---

## 🔍 Troubleshooting

### Bloqueio não está funcionando
```bash
# Verificar se bloqueio está ativo
GET /api/v1/barber-blocks/{id}

# Verificar disponibilidade
GET /api/v1/barber-blocks/check-availability/{barber_id}?check_date=YYYY-MM-DD
```

### Comissão não gerada
```bash
# Verificar status do agendamento (deve ser COMPLETED)
GET /api/v1/appointments/{id}

# Gerar manualmente
POST /api/v1/commissions/generate-for-appointment/{id}
```

### Observações não aparecem
```bash
# Verificar se foram salvas
GET /api/v1/appointments/{id}

# Verificar campos no response
```

---

## 📚 Recursos Adicionais

- **Documentação API:** http://127.0.0.1:8000/docs
- **Análise Completa:** `ANALISE_COMPLETA_PRODUCAO.md`
- **Resumo:** `RESUMO_IMPLEMENTACOES.md`
- **Verificação:** `python backend/verificar_sistema.py`

---

**Última Atualização:** 14/12/2025  
**Versão:** 1.0.0


