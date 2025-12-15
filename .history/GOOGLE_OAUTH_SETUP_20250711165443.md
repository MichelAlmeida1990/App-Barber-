# 🚀 Configuração do Login com Google - Barbershop Manager

## ✅ O que foi implementado

Foi adicionado login com Google OAuth para **clientes** na página de login client:

### 🔧 **Backend** (FastAPI)
- ✅ Endpoint `/api/v1/auth/google-login` 
- ✅ Validação de tokens JWT do Google
- ✅ Criação automática de contas para novos usuários
- ✅ Campos adicionados ao modelo User: `google_id`, `picture_url`
- ✅ Verificação de segurança do `client_id`

### 🎨 **Frontend** (Next.js)
- ✅ Componente `GoogleLoginButton` 
- ✅ Integração na página `/client/login`
- ✅ Botão "Entrar com Google" só aparece no login (não no registro)
- ✅ Redirecionamento automático para dashboard do cliente

---

## 🔑 Configuração do Google OAuth

### **Passo 1: Criar Projeto no Google Cloud Console**

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Vá para **APIs & Services** > **Credentials**
4. Clique **+ CREATE CREDENTIALS** > **OAuth client ID**
5. Se for a primeira vez, configure a **OAuth consent screen**:
   - User Type: **External**
   - App name: **Barbershop Manager**
   - User support email: seu email
   - Authorized domains: `localhost`
   - Developer contact: seu email

### **Passo 2: Configurar OAuth Client ID**

1. Application type: **Web application**
2. Name: **Barbershop Manager Client**
3. Authorized JavaScript origins:
   ```
   http://localhost:3000
   http://localhost:3001
   ```
4. Authorized redirect URIs:
   ```
   http://localhost:3000/auth/google/callback
   http://localhost:3001/auth/google/callback
   ```
5. Clique **CREATE**
6. **Copie o Client ID** gerado

### **Passo 3: Configurar Variáveis de Ambiente**

#### **Frontend** (`frontend/.env.local`):
```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8002

# Environment
NODE_ENV=development
```

#### **Backend** (`backend/.env`):
```env
# Adicionar ao arquivo existente
GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
```

---

## 🚀 Como Testar

### **1. Iniciar os Serviços**

**Backend:**
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8002 --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### **2. Testar o Login**

1. Acesse: http://localhost:3000/client/login
2. Você verá o botão **"Entrar com Google"**
3. Clique no botão
4. Uma popup do Google irá abrir
5. Faça login com sua conta Google
6. Será redirecionado automaticamente para `/client/dashboard`

### **3. Verificar se Funcionou**

- ✅ Nova conta criada automaticamente com `role: "client"`
- ✅ `google_id` e `picture_url` salvos no banco
- ✅ Token JWT gerado normalmente
- ✅ Acesso completo ao sistema como cliente

---

## 🔍 Troubleshooting

### **Erro: "Token Google inválido"**
- Verificar se o `NEXT_PUBLIC_GOOGLE_CLIENT_ID` está correto
- Verificar se o domínio está autorizado no Google Cloud Console

### **Erro: "CORS blocked"**
- Verificar se `http://localhost:3000` está nas **Authorized JavaScript origins**

### **Erro: "Token não pertence a esta aplicação"**
- Verificar se `GOOGLE_CLIENT_ID` no backend é igual ao frontend
- Verificar se não tem espaços extras nas variáveis de ambiente

### **Botão não aparece**
- Verificar se você está na página de **login** (não registro)
- Verificar se o arquivo `.env.local` foi criado corretamente
- Reiniciar o servidor frontend: `npm run dev`

---

## 🎯 Funcionalidades

### **Para Clientes:**
- ✅ Login instantâneo com conta Google
- ✅ Não precisa criar senha
- ✅ Foto do perfil importada automaticamente
- ✅ Email verificado automaticamente
- ✅ Acesso completo ao sistema de agendamentos

### **Segurança:**
- ✅ Tokens validados pelo Google
- ✅ Verificação de `client_id`
- ✅ Usuarios sempre criados como `role: "client"`
- ✅ Não permite barbeiros via Google OAuth

---

## 📱 Próximos Passos (Opcional)

1. **Produção**: Configurar domínio real no Google Cloud Console
2. **Mobile**: Adicionar suporte para React Native
3. **Outros Providers**: Facebook, Apple, GitHub
4. **Admin Panel**: Gerenciar contas OAuth

---

**🎉 Pronto! Seus clientes agora podem fazer login com Google em 1 clique!** 