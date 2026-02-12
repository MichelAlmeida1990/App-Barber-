# 🔍 DEBUG RENDER - Passo a Passo

## ❌ PROBLEMA ATUAL:

Backend retorna erro 500 no login, indicando que **PostgreSQL não está conectando**.

---

## 📋 VERIFICAÇÕES NECESSÁRIAS:

### 1. VERIFICAR LOGS DO RENDER

1. Acesse: https://dashboard.render.com
2. Clique no seu **Web Service** (barbershop-backend)
3. Clique na aba **Logs**
4. Procure por estas mensagens:

#### ✅ Se estiver funcionando:
```
✅ Usando PostgreSQL
INFO: Application startup complete
🌐 CORS configurado para: ['http://localhost:3000', ..., 'https://app-barber-iota.vercel.app']
```

#### ❌ Se houver erro:
```
⚠️ Usando SQLite! Verifique se DATABASE_URL está configurado corretamente.
could not translate host name "dpg-..." to address
OperationalError: (psycopg2.OperationalError)
```

---

### 2. VERIFICAR DATABASE_URL COMPLETA

A URL do PostgreSQL **DEVE** ter este formato:

```
postgresql://USER:PASSWORD@HOST.REGIAO.render.com/DATABASE_NAME
                              ↑
                    ESTE DOMÍNIO É OBRIGATÓRIO!
```

#### ❌ INCORRETO (hostname interno - NÃO FUNCIONA):
```
postgresql://barbershop_90l1_user:...@dpg-d501ahbe5dus73apakcg-a/barbershop_90l1
```

#### ✅ CORRETO (hostname externo):
```
postgresql://barbershop_90l1_user:...@dpg-d501ahbe5dus73apakcg-a.oregon-postgres.render.com/barbershop_90l1
```

---

### 3. COMO PEGAR A URL CORRETA:

#### Método 1: Via Dashboard
1. Dashboard Render → **Databases** (menu lateral)
2. Clique no seu PostgreSQL database
3. Vá na aba **Connect**
4. Procure por **"External Connection String"**
5. Clique em **Copy** ou **Show**
6. Copie a URL completa

#### Método 2: Verificar região
1. Dashboard → Databases → Seu database
2. Veja **Region** (ex: Oregon, Ohio, Frankfurt...)
3. O hostname deve ser:
   - Oregon: `dpg-xxx.oregon-postgres.render.com`
   - Ohio: `dpg-xxx.ohio-postgres.render.com`
   - Frankfurt: `dpg-xxx.frankfurt-postgres.render.com`

---

### 4. ATUALIZAR NO WEB SERVICE:

1. Dashboard → **Web Services** → barbershop-backend
2. **Settings** → **Environment**
3. Clique em **"Edit"** ao lado de `DATABASE_URL`
4. Cole a **External Connection String completa**
5. Clique em **Save Changes**
6. **AGUARDE O REDEPLOY** (~2-3 minutos)

---

### 5. TESTAR NOVAMENTE:

Após o redeploy completar:

#### Teste 1: Health Check
```bash
curl https://barbershop-backend-lh2m.onrender.com/health
```
Deve retornar: `{"status":"healthy",...}`

#### Teste 2: Login
```bash
curl -X POST https://barbershop-backend-lh2m.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@barbershop.com","password":"admin123"}'
```
Deve retornar: `{"access_token":"eyJ...",...}`

---

## 🎯 AÇÕES AGORA:

1. [ ] Abrir Dashboard Render → Databases
2. [ ] Copiar **External Connection String**
3. [ ] Comparar com DATABASE_URL atual (Web Service → Environment)
4. [ ] Se diferente, atualizar DATABASE_URL
5. [ ] Aguardar redeploy automático
6. [ ] Verificar logs para mensagem "✅ Usando PostgreSQL"
7. [ ] Testar login novamente

---

## 📸 SCREENSHOT NECESSÁRIO:

Se possível, compartilhe screenshot de:
1. **Database → Connect → External Connection String** (pode ocultar senha)
2. **Logs** do Web Service mostrando mensagens de startup

---

## ⚡ DICA RÁPIDA:

A URL na sua screenshot mostra:
```
postgresql://barbershop_90l1_user:...@dpg-d501ahbe5dus73apakcg-a/barbershop_90l1
```

Se ela termina em `/barbershop_90l1` sem nada depois do hostname `dpg-d501ahbe5dus73apakcg-a`, então **está incompleta**!

Deve ser:
```
postgresql://barbershop_90l1_user:...@dpg-d501ahbe5dus73apakcg-a.REGIAO-postgres.render.com/barbershop_90l1
```

---

**Próximo passo:** Verifique a URL completa no painel de Databases!
