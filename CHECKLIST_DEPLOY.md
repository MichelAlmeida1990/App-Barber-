# ✅ CHECKLIST RÁPIDO DE DEPLOY

Use este checklist enquanto faz o deploy seguindo o `GUIA_DEPLOY_COMPLETO.md`

---

## 📋 PRÉ-DEPLOY
- [x] Código funcionando localmente
- [x] Build testado e passou
- [x] Código enviado para GitHub
- [ ] Conta criada no Render.com
- [ ] Conta criada no Vercel.com

---

## 🔧 RENDER (BACKEND)

### 1. PostgreSQL Database
- [x] Acessei render.com
- [x] New + → PostgreSQL
- [x] Nome: `barbershop_90l1`
- [x] Region: Oregon ou Ohio
- [x] Instance: FREE
- [x] Create Database
- [x] ⏰ Aguardei status "Available"
- [x] 📋 Copiei "Internal Database URL"
- [x] 💾 URL salva: `postgresql://barbershop_90l1_user:...@dpg-d501ahbe5dus73apakcg-a/barbershop_90l1`

---

### 2. Web Service (Backend)
- [ ] New + → Web Service
- [ ] Conectei repositório: App-Barber-
- [ ] **Name:** `barbershop-backend`
- [ ] **Region:** Mesma do banco!
- [ ] **Root Directory:** `backend`
- [ ] **Runtime:** Python 3
- [ ] **Build Command:** `pip install -r requirements.txt`
- [ ] **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] **Instance Type:** Free

---

### 3. Environment Variables (Backend)
- [ ] `DATABASE_URL` = `postgresql://barbershop_90l1_user:VzmrsrUHC6KWHXRLguFSPuHRbT8evSAW@dpg-d501ahbe5dus73apakcg-a/barbershop_90l1`
- [ ] `SECRET_KEY` = (gerar em https://djecrety.ir/)
- [ ] `ENVIRONMENT` = `production`
- [ ] `FRONTEND_URL` = `https://seu-app.vercel.app` (atualizar depois)
- [ ] `GOOGLE_CLIENT_ID` = (se tiver)
- [ ] `GOOGLE_CLIENT_SECRET` = (se tiver)
- [ ] Create Web Service

---

### 4. Aguardar Deploy Backend
- [ ] ⏰ Aguardei 5-10 minutos
- [ ] Status: "Live" com bolinha verde
- [ ] 📋 Copiei URL: `https://barbershop-backend.onrender.com`
- [ ] Testei: `/` retorna mensagem de boas-vindas
- [ ] Testei: `/docs` abre Swagger
- [ ] Testei: `/health` retorna "healthy"

---

## 🌐 VERCEL (FRONTEND)

### 1. Criar Conta e Importar
- [ ] Acessei vercel.com
- [ ] Sign Up with GitHub
- [ ] Add New → Project
- [ ] Importei: App-Barber-

---

### 2. Configurar Projeto
- [ ] Framework: Next.js (auto-detectado)
- [ ] **Root Directory:** `frontend` ⚠️
- [ ] Build Command: `npm run build` (padrão)
- [ ] Output Directory: `.next` (padrão)

---

### 3. Environment Variables (Frontend)
- [ ] `NEXT_PUBLIC_API_URL` = (URL do backend do Render)
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = (se tiver)
- [ ] Ambientes: Production, Preview, Development (todos marcados)

---

### 4. Deploy Frontend
- [ ] Deploy
- [ ] ⏰ Aguardei 3-5 minutos
- [ ] 🎉 Viu os confetes!
- [ ] 📋 Copiei URL: `https://app-barber-xxx.vercel.app`
- [ ] Testei: Página inicial carrega
- [ ] Testei: CSS aparece corretamente

---

## 🔄 CONFIGURAÇÃO FINAL

### 1. Atualizar CORS Backend
- [ ] Voltei ao Render
- [ ] Service → Environment
- [ ] Editei `FRONTEND_URL` com URL da Vercel
- [ ] Save Changes
- [ ] ⏰ Aguardei redeploy (2-3 min)

---

### 2. Criar Usuário Admin
- [ ] Acessei: `https://backend.onrender.com/docs`
- [ ] POST `/api/v1/auth/create-test-data`
- [ ] Try it out → Execute
- [ ] Retornou: "Dados de teste criados com sucesso"

---

## ✅ TESTES FINAIS

### Frontend
- [ ] Página inicial carrega sem erros
- [ ] CSS/Tailwind funcionando
- [ ] Console sem erros (F12)

### Backend
- [ ] API responde: `/health`
- [ ] Docs funcionam: `/docs`
- [ ] Banco conectado

### Integrações
- [ ] Login Admin: `admin@barbershop.com` / `admin123`
- [ ] Login Barbeiro: `barbeiro1@email.com` / `senha123`
- [ ] Login Cliente: `cliente1@email.com` / `senha123`
- [ ] Criar agendamento funciona
- [ ] Dashboards carregam corretamente
- [ ] Google OAuth (se configurado)

---

## 🎉 DEPLOY CONCLUÍDO!

### 📝 Anote suas URLs:

**Frontend:**
```
https://______________________.vercel.app
```

**Backend:**
```
https://______________________.onrender.com
```

**API Docs:**
```
https://______________________.onrender.com/docs
```

---

## 🐛 SE ALGO DEU ERRADO:

### Backend não está respondendo
- [ ] Verifiquei logs no Render
- [ ] Confirmei Start Command correto
- [ ] Verifiquei DATABASE_URL

### Frontend não conecta ao backend
- [ ] Verifiquei NEXT_PUBLIC_API_URL na Vercel
- [ ] Verifiquei FRONTEND_URL no Render
- [ ] Verifiquei console do navegador (F12)
- [ ] Confirmei que backend está online

### Database connection failed
- [ ] Banco está "Available" no Render
- [ ] DATABASE_URL está correta
- [ ] Backend e banco na mesma região

### Module not found
- [ ] requirements.txt existe em backend/
- [ ] package.json existe em frontend/
- [ ] Fiz git push das mudanças

---

## 📞 PRECISA DE AJUDA?

Consulte: `GUIA_DEPLOY_COMPLETO.md` para instruções detalhadas

**Links Úteis:**
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Gerar SECRET_KEY: https://djecrety.ir/

---

**Data:** ________________  
**Status:** ⬜ Em progresso  |  ✅ Concluído  |  ❌ Com problemas

**Notas:**
_______________________________________________________
_______________________________________________________
_______________________________________________________

