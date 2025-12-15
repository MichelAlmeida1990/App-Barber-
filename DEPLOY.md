# 🚀 GUIA DE DEPLOY - APP BARBEARIA

## ✅ STATUS: PRONTO PARA DEPLOY

**Data:** 15 de Dezembro de 2025  
**Build:** ✅ Sucesso (Frontend)  
**Testes:** ✅ Backend testado  
**Documentação:** ✅ Completa

---

## 📦 RESUMO DO PROJETO

### Frontend (Next.js 15)
- **Framework:** Next.js 15.3.5
- **Páginas:** 21 rotas geradas
- **Build Size:** ~101 KB (shared JS)
- **Deploy:** Vercel

### Backend (FastAPI)
- **Framework:** FastAPI + SQLAlchemy
- **Database:** PostgreSQL
- **Deploy:** Render
- **Port:** 8000

---

## 🎯 DEPLOY DO BACKEND (RENDER)

### 1. Preparar Repositório Git

```bash
cd backend
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/MichelAlmeida1990/App-Barber-Backend.git
git push -u origin main
```

### 2. Configurar no Render

1. **Acesse:** https://render.com
2. **New +** → **Web Service**
3. **Connect Repository:** Selecione o repositório do backend
4. **Configurações:**
   - **Name:** `barbershop-backend`
   - **Environment:** `Python 3`
   - **Build Command:** `./build.sh`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free (ou superior)

### 3. Variáveis de Ambiente (Render)

Adicione no painel do Render:

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=seu-secret-key-super-seguro-aqui
ENVIRONMENT=production
FRONTEND_URL=https://seu-app.vercel.app
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

### 4. Criar Banco de Dados PostgreSQL no Render

1. **New +** → **PostgreSQL**
2. **Name:** `barbershop_db`
3. **Copiar** a `DATABASE_URL` gerada
4. **Adicionar** como variável de ambiente no Web Service

### 5. Deploy

- O Render fará deploy automático quando você fizer push
- **URL gerada:** `https://barbershop-backend.onrender.com`
- **Health Check:** `https://barbershop-backend.onrender.com/health`

---

## 🌐 DEPLOY DO FRONTEND (VERCEL)

### 1. Preparar Repositório Git

```bash
cd frontend
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin https://github.com/MichelAlmeida1990/App-Barber-Frontend.git
git push -u origin main
```

### 2. Configurar no Vercel

1. **Acesse:** https://vercel.com
2. **Import Project**
3. **Connect Git Repository:** Selecione o repositório do frontend
4. **Configurações:**
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build` (padrão)
   - **Output Directory:** `.next` (padrão)
   - **Install Command:** `npm install` (padrão)

### 3. Variáveis de Ambiente (Vercel)

Adicione no painel da Vercel:

```env
NEXT_PUBLIC_API_URL=https://barbershop-backend.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-google-client-id
```

### 4. Deploy

- Vercel fará deploy automático
- **URL gerada:** `https://seu-app.vercel.app`
- **Preview:** Cada PR gera preview automático

---

## 🔄 ATUALIZAR CORS NO BACKEND

Após obter a URL da Vercel, atualize `backend/app/main.py`:

```python
# Atualizar origins
origins = [
    "http://localhost:3000",
    "https://seu-app.vercel.app",  # ← Adicionar URL da Vercel
]
```

Commit e push para atualizar.

---

## ✅ CHECKLIST PÓS-DEPLOY

### Backend (Render)
- [ ] Deploy concluído sem erros
- [ ] Health check responde: `/health`
- [ ] Banco de dados conectado
- [ ] Endpoint raiz responde: `/`
- [ ] API docs acessível: `/docs`
- [ ] Criar dados de teste via `/api/v1/auth/create-test-data` (POST)
- [ ] Criar usuário admin via script

### Frontend (Vercel)
- [ ] Deploy concluído sem erros
- [ ] Homepage carrega corretamente
- [ ] Login de cliente funciona
- [ ] Login de barbeiro funciona
- [ ] Login de admin funciona
- [ ] Google OAuth funciona
- [ ] Agendamentos funcionam

### Integrações
- [ ] Frontend se comunica com backend
- [ ] CORS configurado corretamente
- [ ] Google OAuth configurado
- [ ] Redirecionamentos funcionando

---

## 🔧 COMANDOS ÚTEIS

### Criar Admin no Backend

```bash
# Conectar ao PostgreSQL do Render e executar:
python -c "
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from app.models.enums import UserRole

db = SessionLocal()
admin = User(
    email='admin@barbershop.com',
    password_hash=get_password_hash('admin123'),
    full_name='Administrador',
    role=UserRole.ADMIN,
    is_active=True
)
db.add(admin)
db.commit()
print('Admin criado!')
"
```

### Logs no Render

```bash
# No painel do Render → Logs
# Ou via CLI:
render logs -s barbershop-backend
```

### Rebuild Forçado

```bash
# Render
Manual Deploy → Clear build cache & deploy

# Vercel
Deployments → Redeploy
```

---

## 📊 ESTRUTURA DE ARQUIVOS DE DEPLOY

### Backend
```
backend/
├── render.yaml          # Configuração Render
├── build.sh            # Script de build
├── Procfile            # Comando de start
├── runtime.txt         # Python 3.11.6
└── requirements.txt    # Dependências
```

### Frontend
```
frontend/
├── vercel.json         # Configuração Vercel
├── next.config.ts      # Config Next.js
└── .env.local          # Variáveis locais (não commitar)
```

---

## 🐛 TROUBLESHOOTING

### "Module not found" no Backend
```bash
# Verificar requirements.txt
# Fazer rebuild limpo no Render
```

### "Failed to fetch" no Frontend
```bash
# Verificar NEXT_PUBLIC_API_URL
# Verificar CORS no backend
# Verificar se backend está online
```

### "Database connection failed"
```bash
# Verificar DATABASE_URL no Render
# Verificar se PostgreSQL está ativo
# Verificar credenciais
```

### Build falha no Vercel
```bash
# Verificar se todas dependências estão no package.json
# Verificar se há erros de TypeScript (já ignorados no config)
# Ver logs de build no Vercel
```

---

## 🔐 SEGURANÇA PÓS-DEPLOY

1. **Trocar SECRET_KEY** para valor único e seguro
2. **Configurar Google OAuth** com URLs de produção
3. **Ativar HTTPS** (automático em Render e Vercel)
4. **Limitar CORS** apenas para domínios necessários
5. **Monitorar logs** regularmente

---

## 📈 MONITORAMENTO

### Render
- Dashboard → Metrics
- CPU, Memory, Response Time
- Error Rate

### Vercel
- Analytics (plano Pro)
- Web Vitals
- Visitor insights

---

## 🎉 DEPLOY CONCLUÍDO!

Após seguir todos os passos:

1. ✅ Backend rodando no Render
2. ✅ Frontend rodando na Vercel
3. ✅ Banco de dados PostgreSQL configurado
4. ✅ Google OAuth funcionando
5. ✅ Sistema completo em produção!

**URLs Finais:**
- Frontend: `https://seu-app.vercel.app`
- Backend: `https://barbershop-backend.onrender.com`
- API Docs: `https://barbershop-backend.onrender.com/docs`

---

## 📞 SUPORTE

Para dúvidas ou problemas:
1. Consultar logs no Render/Vercel
2. Revisar `TECH_DEBT.md` para melhorias futuras
3. Verificar documentação oficial:
   - Render: https://render.com/docs
   - Vercel: https://vercel.com/docs
   - Next.js: https://nextjs.org/docs

---

**✨ Projeto pronto para uso em produção!**

