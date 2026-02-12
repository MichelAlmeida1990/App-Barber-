# 🎯 Guia: Serviços com Pausa (Progressiva + Corte Simultâneo)

## 📋 Visão Geral

Este sistema permite que barbeiros **pausem serviços químicos** (como progressiva) durante o tempo de espera do produto e **atendam outros clientes** no mesmo horário, otimizando a agenda e aumentando a produtividade.

## 🎬 Como Funciona

### 1. **Configuração do Serviço**

Ao criar/editar um serviço, você pode marcar:
- ✅ **"Serviço com pausa"** - Para serviços que requerem tempo de espera
- ⏱️ **Duração da pausa** - Ex: 60 minutos para progressiva
- 📝 **Descrição da pausa** - Ex: "Aguardar produto fazer efeito"

**Exemplo:**
- **Serviço:** Progressiva
- **Duração total:** 120 minutos
- **Tem pausa:** Sim
- **Duração da pausa:** 60 minutos
- **Descrição:** "Aplicação do produto → aguardar 60min → finalização"

### 2. **Fluxo de Atendimento**

#### **Etapa 1: Iniciar Serviço**
- Barbeiro inicia o atendimento
- Sistema registra `start_time`
- Status: `in_progress`

#### **Etapa 2: Pausar Serviço**
- Após aplicar o produto, barbeiro clica em **"Pausar"**
- Sistema registra `pause_time`
- Status muda para `paused`
- **✅ Agenda do barbeiro é liberada automaticamente**

#### **Etapa 3: Atender Outro Cliente (Durante a Pausa)**
- Barbeiro pode agendar/atender outros clientes normalmente
- O sistema **não bloqueia** a agenda durante a pausa
- Exemplo: Fazer um corte de 50 minutos enquanto a progressiva está em pausa

#### **Etapa 4: Retomar Serviço**
- Após o tempo de pausa, barbeiro clica em **"Retomar"**
- Sistema registra `resume_time`
- Status muda para `resumed`
- Agenda volta a ser bloqueada para este serviço

#### **Etapa 5: Finalizar Serviço**
- Barbeiro completa o serviço
- Sistema registra `end_time`
- Status: `completed`
- **✅ Ambos os serviços (progressiva + corte) são contabilizados no relatório**

## 📊 Exemplo Prático

### Cenário: Progressiva + Corte Simultâneo

**10:00** - Inicia Progressiva (Cliente A)
- Aplicação do produto
- Status: `in_progress`

**10:30** - Pausa Progressiva
- Produto aplicado, aguardando fazer efeito
- Status: `paused`
- **Agenda liberada!**

**10:35** - Inicia Corte (Cliente B)
- Barbeiro atende outro cliente
- Status do corte: `in_progress`

**11:15** - Finaliza Corte (Cliente B)
- Corte concluído
- Status: `completed`

**11:30** - Retoma Progressiva (Cliente A)
- Tempo de pausa completo
- Status: `resumed`

**12:00** - Finaliza Progressiva (Cliente A)
- Serviço completo
- Status: `completed`

### Resultado no Relatório:
- ✅ **2 serviços concluídos** pelo barbeiro
- ✅ **Progressiva:** 120 minutos (60min ativo + 60min pausa)
- ✅ **Corte:** 50 minutos
- ✅ **Total:** 2 serviços, 170 minutos de trabalho ativo

## 🛠️ Implementação Técnica

### Backend

#### Modelo `ServiceSession`
```python
- id
- appointment_id
- service_id
- barber_id
- client_id
- status (not_started, in_progress, paused, resumed, completed)
- start_time, pause_time, resume_time, end_time
- active_duration_minutes
- pause_duration_minutes
- total_duration_minutes
- has_pause
- expected_pause_minutes
```

#### Modelo `Service` (atualizado)
```python
- has_pause (Boolean)
- pause_duration_minutes (Integer)
- pause_description (Text)
```

### Frontend

#### Componente `ServicePauseManager`
- Botão "Pausar" - quando `can_be_paused = true`
- Botão "Retomar" - quando `can_be_resumed = true`
- Botão "Finalizar" - quando `can_be_completed = true`
- Exibe status e durações em tempo real

## 📱 Interface do Barbeiro

Na agenda do barbeiro, serviços com pausa aparecem com:

1. **Badge de Status:**
   - 🔵 Em Andamento
   - 🟡 Em Pausa
   - 🟢 Retomado
   - ⚪ Finalizado

2. **Informações:**
   - Tempo ativo decorrido
   - Tempo em pausa (se aplicável)
   - Cliente e serviço

3. **Ações Disponíveis:**
   - **Pausar** - Libera a agenda
   - **Retomar** - Continua o serviço
   - **Finalizar** - Encerra o serviço

## ✅ Benefícios

1. **📈 Aumento de Produtividade**
   - Barbeiro atende mais clientes no mesmo período
   - Aproveita tempo de espera de produtos químicos

2. **💰 Maior Receita**
   - Mais serviços realizados por dia
   - Melhor aproveitamento da agenda

3. **🎯 Organização**
   - Sistema registra tudo automaticamente
   - Relatórios precisos de serviços realizados

4. **⏰ Flexibilidade**
   - Barbeiro controla quando pausar/retomar
   - Agenda se adapta automaticamente

## 🔄 Verificação de Disponibilidade

O sistema de verificação de disponibilidade considera:
- ✅ Agendamentos confirmados
- ✅ Serviços em andamento (não pausados)
- ❌ **NÃO bloqueia** durante pausas ativas

## 📊 Relatórios

Os relatórios contabilizam:
- ✅ Todos os serviços concluídos
- ✅ Tempo ativo de trabalho (sem contar pausas)
- ✅ Número de serviços por barbeiro
- ✅ Receita gerada por serviço

## 🚀 Próximos Passos

1. ✅ Modelo `ServiceSession` criado
2. ✅ Campos de pausa adicionados ao `Service`
3. ✅ Formulário de serviço atualizado
4. ⏳ API endpoints para pausar/retomar/finalizar
5. ⏳ Integração na agenda do barbeiro
6. ⏳ Atualização de relatórios

## 💡 Dicas de Uso

1. **Configure corretamente** a duração da pausa ao criar o serviço
2. **Pause imediatamente** após aplicar o produto para liberar a agenda
3. **Use o tempo de pausa** para atender outros clientes
4. **Retome no tempo certo** para não atrasar o cliente
5. **Finalize sempre** para contabilizar no relatório

---

**Desenvolvido para otimizar a gestão de serviços químicos na barbearia!** ✂️💈




