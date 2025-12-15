# 🧪 **ENDPOINTS PARA TESTE MANUAL**

## 🔗 **URLs Diretas - Cole no Navegador:**

### ✅ **ENDPOINTS BÁSICOS:**
- **Health:** http://127.0.0.1:8001/health
- **Root:** http://127.0.0.1:8001/
- **Docs:** http://127.0.0.1:8001/docs
- **ReDoc:** http://127.0.0.1:8001/redoc

### 🧪 **ENDPOINTS DE TESTE:**
- **🔐 Auth:** http://127.0.0.1:8001/api/v1/auth/test
- **📅 Agendamentos:** http://127.0.0.1:8001/api/v1/appointments/test
- **👥 Clientes:** http://127.0.0.1:8001/api/v1/clients/test
- **✂️ Barbeiros:** http://127.0.0.1:8001/api/v1/barbers/test
- **🛠️ Serviços:** http://127.0.0.1:8001/api/v1/services/test
- **📦 Produtos:** http://127.0.0.1:8001/api/v1/products/test
- **💰 Vendas:** http://127.0.0.1:8001/api/v1/sales/test
- **📊 Analytics:** http://127.0.0.1:8001/api/v1/analytics/test
- **🤖 IA:** http://127.0.0.1:8001/api/v1/ai/test

---

## 🚀 **COMANDOS PARA EXECUTAR:**

### **1. Ativar Ambiente e Executar API:**
```bash
.\venv\Scripts\Activate.ps1
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

### **2. Executar Testes (novo terminal):**
```bash
.\venv\Scripts\Activate.ps1
cd backend
python test_api_port8001.py
```

### **3. Testar com cURL:**
```bash
curl http://127.0.0.1:8001/health
curl http://127.0.0.1:8001/api/v1/auth/test
```

---

## 📱 **PRÓXIMOS TESTES AVANÇADOS:**

### **🔐 Teste de Autenticação:**
1. **Registrar usuário:** `POST /api/v1/auth/register`
2. **Fazer login:** `POST /api/v1/auth/login`
3. **Testar endpoints protegidos**

### **📊 Teste de Funcionalidades:**
1. **Listar agendamentos:** `GET /api/v1/appointments/`
2. **Criar cliente:** `POST /api/v1/clients/`
3. **Buscar barbeiros:** `GET /api/v1/barbers/`

---

## ⚡ **STATUS ATUAL:**
- ✅ **API Running:** http://127.0.0.1:8001
- ✅ **9 Módulos** funcionando
- ✅ **Documentação** acessível
- ✅ **Ambiente isolado** (venv)
- ✅ **Testes automatizados** rodando 