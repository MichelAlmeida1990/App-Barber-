# 🚀 GUIA COMPLETO DE DEPLOY - APP BARBEARIA

## 📋 ÍNDICE
1. [Preparação](#preparação)
2. [Deploy do Backend (Render)](#deploy-backend-render)
3. [Deploy do Frontend (Vercel)](#deploy-frontend-vercel)
4. [Configuração Final](#configuração-final)
5. [Testes Pós-Deploy](#testes)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 PREPARAÇÃO

### ✅ Pré-requisitos
- [x] Código enviado para GitHub ✅
- [x] Conta no GitHub criada ✅
- [ ] Conta no Render.com
- [ ] Conta no Vercel.com

**Repositório:** https://github.com/MichelAlmeida1990/App-Barber-.git

---

## 🔧 DEPLOY BACKEND (RENDER)

### PASSO 1: Criar conta no Render

1. Acesse: https://render.com
2. Clique em **"Get Started"** ou **"Sign Up"**
3. Escolha: **"Sign in with GitHub"** (recomendado)
4. Autorize o Render a acessar seus repositórios

---

### PASSO 2: Criar PostgreSQL Database

**IMPORTANTE:** Crie o banco ANTES do Web Service!

1. No Dashboard do Render, clique em **"New +"** (canto superior direito)
2. Selecione **"PostgreSQL"**

3. **Preencha os campos:**
   - **Name:** `barbershop-db` (ou qualquer nome que preferir)
   - **Database:** `barbershop` (nome do banco de dados)
   - **User:** (deixe o padrão ou escolha um)
   - **Region:** `Oregon (US West)` (ou mais próximo do Brasil: `Ohio (US East)`)
   - **PostgreSQL Version:** `16` (ou a mais recente)
   - **Instance Type:** **FREE** (para começar)

4. Clique em **"Create Database"**

5. **AGUARDE** cerca de 2-5 minutos até o banco estar pronto
   - Status mudará de "Creating" para "Available"

6. **COPIE A CONNECTION STRING:**
   - Na página do banco, vá até **"Connections"**
   - Copie a **"Internal Database URL"** (começa com `postgresql://`)
   - **SALVE** em um bloco de notas temporariamente!
   
   ✅ **SUA URL DO BANCO:**
   ```
   postgresql://barbershop_90l1_user:VzmrsrUHC6KWHXRLguFSPuHRbT8evSAW@dpg-d501ahbe5dus73apakcg-a/barbershop_90l1
   ```

---

### PASSO 3: Criar Web Service (Backend)

1. Volte ao Dashboard, clique em **"New +"**
2. Selecione **"Web Service"**

3. **Conectar Repositório:**
   - Se aparecer lista de repos, selecione: **"App-Barber-"**
   - Se NÃO aparecer, clique em **"Configure account"** → Autorize o acesso

4. **Preencha as configurações:**

   **Basic Info:**
   - **Name:** `barbershop-backend` (será sua URL: barbershop-backend.onrender.com)
   - **Region:** `Oregon (US West)` (mesmo do banco de dados!)
   - **Branch:** `main`
   - **Root Directory:** `backend` ⚠️ **IMPORTANTE!**
   
   **Environment:**
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   
   **Instance Type:**
   - Selecione **"Free"** (USD 0/mês)

5. Clique em **"Advanced"** para adicionar variáveis de ambiente

---

### PASSO 4: Configurar Variáveis de Ambiente (Backend)

Ainda na criação do Web Service, role até **"Environment Variables"**

**Adicione as seguintes variáveis (clique em "Add Environment Variable" para cada uma):**

```plaintext
DATABASE_URL
postgresql://barbershop_90l1_user:VzmrsrUHC6KWHXRLguFSPuHRbT8evSAW@dpg-d501ahbe5dus73apakcg-a/barbershop_90l1
✅ (URL do seu banco já configurada acima)

SECRET_KEY
minha-chave-super-secreta-de-producao-2024
(Ou gere uma: https://djecrety.ir/)

ENVIRONMENT
production

FRONTEND_URL
https://seu-app.vercel.app
(Por enquanto deixe assim, atualizaremos depois)

GOOGLE_CLIENT_ID
seu-google-client-id-aqui
(Se tiver Google OAuth configurado)

GOOGLE_CLIENT_SECRET
seu-google-client-secret-aqui
(Se tiver Google OAuth configurado)
```

6. Clique em **"Create Web Service"**

---

### PASSO 5: Aguardar Deploy do Backend

1. O Render começará a fazer o build automaticamente
2. Você verá os logs em tempo real
3. **Aguarde 5-10 minutos** para o primeiro deploy

**O que você verá nos logs:**
```
Installing dependencies...
Collecting fastapi
Collecting uvicorn
...
Build successful!
Starting server...
INFO:     Uvicorn running on http://0.0.0.0:10000
```

4. Quando aparecer **"Live"** com bolinha verde ✅ = PRONTO!

5. **Copie a URL do seu backend:**
   - Exemplo: `https://barbershop-backend.onrender.com`
   - **SALVE** para usar no frontend!

---

### PASSO 6: Testar o Backend

Abra no navegador:

**Teste 1:** Verificar se está rodando
```
https://barbershop-backend.onrender.com/
```
Deve retornar: `{"message": "Bem-vindo ao Barbershop Manager API"}`

**Teste 2:** Verificar documentação da API
```
https://barbershop-backend.onrender.com/docs
```
Deve abrir a interface Swagger com todos os endpoints

**Teste 3:** Health Check
```
https://barbershop-backend.onrender.com/health
```
Deve retornar: `{"status": "healthy"}`

✅ **Se todos os testes passarem, seu backend está ONLINE!**

---

## 🌐 DEPLOY FRONTEND (VERCEL)

### PASSO 1: Criar conta no Vercel

1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Escolha: **"Continue with GitHub"** (recomendado)
4. Autorize o Vercel a acessar seus repositórios

---

### PASSO 2: Importar Projeto

1. No Dashboard da Vercel, clique em **"Add New..."** → **"Project"**

2. Na lista de repositórios, encontre: **"App-Barber-"**
   - Se não aparecer, clique em **"Adjust GitHub App Permissions"**
   - Autorize o acesso ao repositório

3. Clique em **"Import"** no repositório "App-Barber-"

---

### PASSO 3: Configurar Projeto

**Configure Build & Development Settings:**

1. **Framework Preset:** `Next.js` (detectado automaticamente)

2. **Root Directory:** 
   - Clique em **"Edit"**
   - Digite: `frontend`
   - Clique em **"Continue"**

3. **Build Command:** (deixe padrão)
   ```
   npm run build
   ```

4. **Output Directory:** (deixe padrão)
   ```
   .next
   ```

5. **Install Command:** (deixe padrão)
   ```
   npm install
   ```

---

### PASSO 4: Adicionar Variáveis de Ambiente (Frontend)

**ANTES de clicar em "Deploy", adicione as variáveis:**

1. Expanda a seção **"Environment Variables"**

2. Adicione as seguintes variáveis:

   **Variável 1:**
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://barbershop-backend.onrender.com
   ```
   (Cole a URL do seu backend do Render)
   
   **Variável 2:**
   ```
   Name: NEXT_PUBLIC_GOOGLE_CLIENT_ID
   Value: seu-google-client-id.apps.googleusercontent.com
   ```
   (Somente se tiver Google OAuth configurado)

3. Marque todos os ambientes: **Production, Preview, Development**

---

### PASSO 5: Fazer Deploy

1. Clique em **"Deploy"**

2. **Aguarde 3-5 minutos** enquanto a Vercel:
   - Clona o repositório
   - Instala dependências
   - Faz o build do Next.js
   - Publica o site

3. Você verá uma animação de confetes 🎉 quando terminar!

4. Clique em **"Continue to Dashboard"**

---

### PASSO 6: Obter URL do Frontend

1. No Dashboard do projeto, você verá:
   ```
   https://app-barber-xxx.vercel.app
   ```
   (Cada deploy tem uma URL única)

2. **Copie esta URL completa!**

3. Você pode customizar o domínio depois em **Settings → Domains**

---

## 🔄 CONFIGURAÇÃO FINAL

### PASSO 1: Atualizar CORS no Backend

1. Volte ao **Render Dashboard**
2. Acesse seu Web Service **"barbershop-backend"**
3. Vá em **"Environment"**
4. Edite a variável **FRONTEND_URL**:
   ```
   FRONTEND_URL=https://app-barber-xxx.vercel.app
   ```
   (Cole a URL do Vercel que você copiou)

5. Clique em **"Save Changes"**
6. O Render fará **redeploy automaticamente** (aguarde 2-3 min)

---

### PASSO 2: Atualizar URL da API no Frontend (se necessário)

Se você mudou a URL do backend depois do deploy do frontend:

1. Volte ao **Vercel Dashboard**
2. Acesse seu projeto
3. Vá em **Settings → Environment Variables**
4. Edite **NEXT_PUBLIC_API_URL** com a URL correta
5. Clique em **Save**
6. Vá em **Deployments** → Clique nos 3 pontos do último deploy → **Redeploy**

---

## ✅ TESTES PÓS-DEPLOY

### 1. Testar Frontend

Acesse: `https://app-barber-xxx.vercel.app`

**Checklist:**
- [ ] Página inicial carrega
- [ ] CSS está aplicado corretamente
- [ ] Não há erros no console (F12)

---

### 2. Testar Integração Backend + Frontend

**Teste Login Admin:**
1. Acesse: `https://app-barber-xxx.vercel.app/admin/login`
2. Tente fazer login com:
   - Email: `admin@barbershop.com`
   - Senha: `admin123`

**Se der erro 401 ou "Credenciais inválidas":**
- É porque o admin não existe no banco de produção ainda
- Vá para o próximo passo!

---

### PASSO 3: Criar Usuário Admin no Banco de Produção

**Opção A: Via API (mais fácil)**

1. Acesse: `https://barbershop-backend.onrender.com/docs`
2. Expanda **POST /api/v1/auth/create-test-data**
3. Clique em **"Try it out"**
4. Clique em **"Execute"**
5. Deve retornar: `{"message": "Dados de teste criados com sucesso"}`

**Opção B: Via SQL no Render**

1. No Render, acesse seu banco **"barbershop-db"**
2. Vá em **"Connect"** → **"External Connection"**
3. Copie as credenciais
4. Use um cliente SQL (DBeaver, pgAdmin) para conectar
5. Execute:
```sql
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@barbershop.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PqcCH5yPiFFW', -- senha: admin123
  'Administrador',
  'ADMIN',
  true
);
```

---

### PASSO 4: Testar Tudo Novamente

**Teste completo:**

1. ✅ Login Admin funciona
2. ✅ Login Barbeiro funciona
3. ✅ Login Cliente funciona
4. ✅ Criar agendamento funciona
5. ✅ Dashboards carregam
6. ✅ Google OAuth funciona (se configurado)

---

## 🎉 DEPLOY CONCLUÍDO!

### 🌐 Suas URLs Finais:

**Frontend (Vercel):**
```
https://app-barber-xxx.vercel.app
```

**Backend (Render):**
```
https://barbershop-backend.onrender.com
```

**API Docs:**
```
https://barbershop-backend.onrender.com/docs
```

---

## 📊 MONITORAMENTO

### Render (Backend)

1. **Ver Logs:**
   - Dashboard → Seu serviço → Aba "Logs"
   - Logs em tempo real de tudo que acontece

2. **Métricas:**
   - Aba "Metrics"
   - CPU, Memória, Requests

3. **Redeploy Manual:**
   - Canto superior direito → "Manual Deploy" → "Deploy latest commit"

### Vercel (Frontend)

1. **Ver Logs:**
   - Dashboard → Projeto → Aba "Functions"
   - Logs de cada requisição

2. **Analytics:** (plano Pro)
   - Web Vitals, Performance

3. **Redeploy Manual:**
   - Aba "Deployments" → 3 pontos → "Redeploy"

---

## 🐛 TROUBLESHOOTING

### ❌ "Application failed to respond"

**Problema:** Backend não está respondendo

**Solução:**
1. Verificar logs no Render
2. Confirmar que `Start Command` está correto:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
3. Verificar se DATABASE_URL está correto

---

### ❌ "Module not found" ou "Import Error"

**Problema:** Dependência faltando

**Solução:**
1. Verificar se `requirements.txt` está na pasta `backend`
2. Adicionar dependência faltante
3. Commit e push:
   ```bash
   git add .
   git commit -m "Fix: adicionar dependência"
   git push
   ```
4. Render faz redeploy automático

---

### ❌ Frontend carrega mas não conecta ao backend

**Problema:** CORS ou URL errada

**Solução:**
1. Verificar `FRONTEND_URL` no Render
2. Verificar `NEXT_PUBLIC_API_URL` na Vercel
3. Verificar console do navegador (F12) para erros
4. Verificar se backend está online: abrir `/health`

---

### ❌ "Database connection failed"

**Problema:** Backend não conecta ao banco

**Solução:**
1. Verificar se o PostgreSQL está "Available" no Render
2. Verificar se `DATABASE_URL` está correta (copiar novamente)
3. Confirmar que backend e banco estão na mesma região

---

### ❌ Google OAuth não funciona

**Problema:** Redirect URI não autorizada

**Solução:**
1. Acessar: https://console.cloud.google.com
2. Credentials → OAuth 2.0 Client IDs → Editar
3. Adicionar URLs autorizadas:
   ```
   https://app-barber-xxx.vercel.app
   https://app-barber-xxx.vercel.app/auth/google/callback
   ```
4. Salvar

---

## 🔐 SEGURANÇA PÓS-DEPLOY

### ✅ Checklist de Segurança:

- [ ] SECRET_KEY é única e forte
- [ ] DATABASE_URL não está exposta publicamente
- [ ] CORS configurado apenas para domínios permitidos
- [ ] Google OAuth credenciais protegidas
- [ ] .env e .env.local no .gitignore
- [ ] Senhas dos usuários são hash bcrypt

---

## 🚀 PRÓXIMOS PASSOS

### Melhorias Recomendadas:

1. **Domínio Próprio:**
   - Comprar domínio (ex: `meubarbershop.com`)
   - Configurar na Vercel: Settings → Domains

2. **Monitoramento:**
   - Configurar alertas no Render para downtime
   - Configurar Vercel Analytics

3. **Backup do Banco:**
   - Render Free: backups automáticos limitados
   - Considerar upgrade para backup diário

4. **Performance:**
   - Configurar CDN (Vercel faz automaticamente)
   - Otimizar imagens com Next.js Image

5. **Correções de Código:**
   - Revisar `TECH_DEBT.md`
   - Corrigir warnings de linting
   - Adicionar testes automatizados

---

## 📞 SUPORTE

**Documentação Oficial:**
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- Next.js: https://nextjs.org/docs
- FastAPI: https://fastapi.tiangolo.com

**Comunidades:**
- Discord do Render
- Discord do Vercel
- Stack Overflow

---

## 🎯 RESUMO RÁPIDO

```bash
# 1. Código no GitHub
git push origin main ✅

# 2. Render - Criar PostgreSQL Database
Nome: barbershop-db ✅

# 3. Render - Criar Web Service
Root: backend/
Build: pip install -r requirements.txt
Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Env: DATABASE_URL, SECRET_KEY, ENVIRONMENT, FRONTEND_URL ✅

# 4. Vercel - Import Project
Root: frontend/
Env: NEXT_PUBLIC_API_URL ✅

# 5. Atualizar FRONTEND_URL no Render ✅

# 6. Criar admin no banco ✅

# 7. Testar tudo ✅
```

---

**🎉 PARABÉNS! SEU APP ESTÁ NO AR!** 🎉

Frontend: https://seu-app.vercel.app  
Backend: https://seu-backend.onrender.com  
API Docs: https://seu-backend.onrender.com/docs

---

**Data do Deploy:** ${new Date().toLocaleDateString('pt-BR')}  
**Autor:** Sistema de Deploy Automatizado  
**Projeto:** Barbershop Manager - Sistema Completo

