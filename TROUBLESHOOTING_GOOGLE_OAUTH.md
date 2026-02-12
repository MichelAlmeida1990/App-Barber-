# 🔧 TROUBLESHOOTING - GOOGLE OAUTH ERRO 400

## ⚠️ PROBLEMA: Erro 400 ao fazer login com Google em produção

---

## 🔍 CAUSAS COMUNS:

### 1. **Redirect URI não corresponde** (Mais Comum)

O `redirect_uri` usado no **frontend** (quando solicita o código) deve ser **EXATAMENTE** o mesmo usado no **backend** (quando troca o código por token).

**Frontend usa:**
```
https://app-barber-iota.vercel.app/auth/google/callback
```

**Backend usa:**
```
https://app-barber-iota.vercel.app/auth/google/callback
```

**✅ Verificar no Google Cloud Console:**

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Selecione seu OAuth 2.0 Client ID
3. Em **"Authorized redirect URIs"**, adicione/verifique:
   ```
   https://app-barber-iota.vercel.app/auth/google/callback
   ```
4. **IMPORTANTE:** Deve ser EXATAMENTE igual (sem barra no final, sem espaços)

---

### 2. **Variáveis de Ambiente não Configuradas**

Verifique no Render se estas variáveis estão configuradas:

```
FRONTEND_URL=https://app-barber-iota.vercel.app
GOOGLE_CLIENT_ID=411190439185-648kbj8erbrq4kvcappp3ncspoeoam1t.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=(seu-secret-aqui)
```

---

### 3. **Código de Autorização Expirado ou Inválido**

O código do Google expira rapidamente (alguns minutos). Se o usuário demorar muito entre autorizar e processar, o código pode expirar.

**Solução:** O código já foi melhorado para mostrar mensagens mais claras.

---

## 🔧 COMO VERIFICAR:

### Passo 1: Verificar Logs do Render

1. Acesse: https://dashboard.render.com
2. Vá em: **Seu Web Service** → **Logs**
3. Procure por: `[Google OAuth Error]`
4. Veja a mensagem de erro completa

### Passo 2: Verificar Google Cloud Console

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Selecione seu OAuth 2.0 Client ID
3. Verifique:
   - **Authorized JavaScript origins:**
     ```
     https://app-barber-iota.vercel.app
     ```
   - **Authorized redirect URIs:**
     ```
     https://app-barber-iota.vercel.app/auth/google/callback
     ```

### Passo 3: Testar no Console do Navegador

1. Abra o DevTools (F12)
2. Vá em **Console**
3. Tente fazer login com Google
4. Veja a mensagem de erro completa

---

## ✅ SOLUÇÃO PASSO A PASSO:

### 1. **Configurar Google Cloud Console:**

```
Authorized JavaScript origins:
https://app-barber-iota.vercel.app

Authorized redirect URIs:
https://app-barber-iota.vercel.app/auth/google/callback
```

### 2. **Verificar Variáveis no Render:**

```
FRONTEND_URL=https://app-barber-iota.vercel.app
GOOGLE_CLIENT_ID=411190439185-648kbj8erbrq4kvcappp3ncspoeoam1t.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=(seu-secret)
```

### 3. **Aguardar Redeploy:**

Após configurar, aguarde o Render fazer redeploy (2-3 minutos).

### 4. **Testar Novamente:**

Tente fazer login com Google. A mensagem de erro agora será mais específica.

---

## 📝 MENSAGENS DE ERRO ESPECÍFICAS:

### `redirect_uri_mismatch`
**Causa:** O redirect_uri não corresponde ao configurado no Google Cloud Console.

**Solução:** Adicione exatamente `https://app-barber-iota.vercel.app/auth/google/callback` no Google Cloud Console.

### `invalid_grant`
**Causa:** O código de autorização é inválido ou expirou.

**Solução:** Tente fazer login novamente. O código expira rapidamente.

### `invalid_client`
**Causa:** GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET incorretos.

**Solução:** Verifique as variáveis de ambiente no Render.

---

## 🔄 PRÓXIMOS PASSOS:

1. ✅ Configure o Google Cloud Console (redirect_uri)
2. ✅ Verifique variáveis no Render
3. ✅ Aguarde redeploy
4. ✅ Teste novamente
5. ✅ Veja os logs do Render para mensagens específicas

---

**Última Atualização:** 15/12/2025








