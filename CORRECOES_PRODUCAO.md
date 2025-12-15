# ✅ CORREÇÕES PARA PRODUÇÃO

## 📋 RESUMO

Este documento lista todas as correções feitas para garantir que o ambiente local seja um **espelho exato** da produção.

---

## 🔧 CORREÇÕES APLICADAS

### 1. **Banco de Dados - SQLite → PostgreSQL** ✅

**Problema:**
- Código estava usando SQLite hardcoded em vez de ler `DATABASE_URL` da variável de ambiente
- Em produção, o PostgreSQL estava configurado mas não era usado

**Correção:**
- `backend/app/core/database.py`: Agora lê `DATABASE_URL` da variável de ambiente
- `backend/app/core/config.py`: Força leitura de `DATABASE_URL` via `os.getenv()`
- Criação automática de barbearia padrão (ID=1) no startup
- Criação automática de usuário admin se não existir

**Arquivos modificados:**
- `backend/app/core/database.py`
- `backend/app/core/config.py`
- `backend/app/main.py`

---

### 2. **URLs Hardcoded - localhost → Variáveis de Ambiente** ✅

**Problema:**
- Múltiplos arquivos tinham URLs hardcoded (`http://localhost:8000`)
- Em produção, essas URLs não funcionariam

**Correção:**
- Criado `frontend/src/lib/api.ts` com configuração centralizada
- Substituídas todas as URLs hardcoded por `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'`
- Script `fix-urls.js` criado para automatizar a correção

**Arquivos corrigidos:**
- `frontend/src/app/client/login/page.tsx`
- `frontend/src/app/barber/login/page.tsx`
- `frontend/src/app/admin/login/page.tsx`
- `frontend/src/app/client/dashboard/page.tsx`
- `frontend/src/app/barber/dashboard/page.tsx`
- `frontend/src/app/barber/schedule/page.tsx`
- `frontend/src/app/barber/blocks/page.tsx`
- `frontend/src/app/barber/commissions/page.tsx`
- `frontend/src/app/admin/page.tsx`
- `frontend/src/app/admin/commissions/page.tsx`
- `frontend/src/app/admin/retention/page.tsx`
- `frontend/src/components/booking/BookingWizard.tsx`
- `frontend/src/hooks/useAdminAuth.ts`
- `frontend/src/app/auth/google/callback/page.tsx`

---

### 3. **Inicialização Automática do Banco** ✅

**Problema:**
- Banco de dados em produção estava vazio
- Faltava barbearia padrão (ID=1) necessária para criar clientes

**Correção:**
- `init_database()` agora cria automaticamente:
  - Usuário admin padrão (se não existir)
  - Barbearia padrão com ID=1 (se não existir)
  - Horários de funcionamento padrão

**Arquivos modificados:**
- `backend/app/core/database.py`
- `backend/app/main.py`

---

### 4. **Google OAuth - Melhorias de Erro** ✅

**Correção:**
- Validação de configurações antes de usar
- Mensagens de erro mais específicas
- Logs detalhados para debug

**Arquivos modificados:**
- `backend/app/api/auth.py`
- `frontend/src/app/auth/google/callback/page.tsx`

---

## 📝 VARIÁVEIS DE AMBIENTE NECESSÁRIAS

### **Backend (Render):**
```env
DATABASE_URL=postgresql://...
SECRET_KEY=...
ENVIRONMENT=production
FRONTEND_URL=https://app-barber-iota.vercel.app
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### **Frontend (Vercel):**
```env
NEXT_PUBLIC_API_URL=https://barbershop-backend-lh2m.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

### **Backend:**
- [x] `DATABASE_URL` lido da variável de ambiente
- [x] Barbearia padrão criada automaticamente
- [x] Usuário admin criado automaticamente
- [x] CORS configurado para produção
- [x] Logs de debug adicionados

### **Frontend:**
- [x] Todas as URLs hardcoded substituídas
- [x] `NEXT_PUBLIC_API_URL` usado em todos os lugares
- [x] Fallback para localhost em desenvolvimento

### **Google OAuth:**
- [x] `FRONTEND_URL` configurado no Render
- [x] `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` configurados
- [x] URLs configuradas no Google Cloud Console

---

## 🚀 PRÓXIMOS PASSOS

1. **Verificar variáveis de ambiente no Render:**
   - Dashboard → Web Service → Environment
   - Confirmar que todas estão configuradas

2. **Verificar variáveis de ambiente na Vercel:**
   - Dashboard → Projeto → Settings → Environment Variables
   - Confirmar `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

3. **Testar em produção:**
   - Login com Google
   - Login normal
   - Criação de agendamentos
   - Dashboard do barbeiro
   - Dashboard do cliente

---

## 📊 RESULTADO

Agora o ambiente **local é um espelho exato da produção**:
- ✅ Mesmo banco de dados (PostgreSQL)
- ✅ Mesmas variáveis de ambiente
- ✅ Mesmas URLs (via variáveis)
- ✅ Mesma inicialização automática

**Data:** 15/12/2025

