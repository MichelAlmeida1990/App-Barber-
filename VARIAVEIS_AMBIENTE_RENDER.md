# 🔐 VARIÁVEIS DE AMBIENTE - RENDER (BACKEND)

## ⚠️ CONFIGURAÇÃO OBRIGATÓRIA

Configure estas variáveis no Render Dashboard → Seu Web Service → Settings → Environment:

---

## 📋 VARIÁVEIS NECESSÁRIAS:

### 1. **DATABASE_URL** ✅
```
postgresql://barbershop_90l1_user:VzmrsrUHC6KWHXRLguFSPuHRbT8evSAW@dpg-d501ahbe5dus73apakcg-a/barbershop_90l1
```

### 2. **SECRET_KEY** ✅
```
(Gerar em https://djecrety.ir/ - mínimo 32 caracteres)
```

### 3. **ENVIRONMENT** ✅
```
production
```

### 4. **FRONTEND_URL** ⚠️ **CRÍTICO - CONFIGURAR AGORA!**
```
https://app-barber-iota.vercel.app
```

### 5. **GOOGLE_CLIENT_ID** ⚠️ **CRÍTICO - CONFIGURAR AGORA!**
```
411190439185-648kbj8erbrq4kvcappp3ncspoeoam1t.apps.googleusercontent.com
```

### 6. **GOOGLE_CLIENT_SECRET** ⚠️ **CRÍTICO - CONFIGURAR AGORA!**
```
(Verificar no arquivo .env local - termina com TXLo)
```

---

## 🔧 COMO CONFIGURAR:

1. Acesse: https://dashboard.render.com
2. Vá em: **Seu Web Service** → **Settings** → **Environment**
3. Adicione/Edite cada variável acima
4. Clique em **Save Changes**
5. O Render fará redeploy automaticamente

---

## ⚠️ ERRO 500 - POSSÍVEIS CAUSAS:

Se você está recebendo erro 500 no endpoint `/api/v1/auth/google`, verifique:

1. ✅ `FRONTEND_URL` está configurado? (deve ser `https://app-barber-iota.vercel.app`)
2. ✅ `GOOGLE_CLIENT_ID` está configurado?
3. ✅ `GOOGLE_CLIENT_SECRET` está configurado?
4. ✅ O `redirect_uri` no Google Cloud Console corresponde a `https://app-barber-iota.vercel.app/auth/google/callback`?

---

## 📝 VERIFICAÇÃO:

Após configurar, teste novamente o login com Google. O erro deve mostrar uma mensagem mais específica se alguma variável estiver faltando.

---

**Última Atualização:** 15/12/2025








