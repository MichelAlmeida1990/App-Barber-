# 💈 **GERENCIADOR DE BARBEARIA - SISTEMA COMPLETO**

![Logo](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![Tecnologia](https://img.shields.io/badge/Stack-100%25%20Gratuita-green)
![IA](https://img.shields.io/badge/IA-Integrada-blue)

Sistema completo de gestão para barbearias com IA integrada, automações inteligentes e ferramentas avançadas de marketing.

---

## 🎯 **CARACTERÍSTICAS PRINCIPAIS**

✅ **Agendamento Online 24/7** com IA  
✅ **Gestão Completa de Clientes** e histórico  
✅ **Sistema POS** com múltiplas formas de pagamento  
✅ **Estoque Inteligente** com alertas automáticos  
✅ **Comissões Automáticas** para barbeiros  
✅ **Marketing Automatizado** com segmentação  
✅ **Analytics Avançados** com previsões  
✅ **Lista de Espera Dinâmica**  
✅ **Notificações SMS/WhatsApp**  
✅ **Integração Redes Sociais**  

---

## 🏗️ **ARQUITETURA DO SISTEMA**

```
├── 🔥 Backend (FastAPI + Python)
├── ⚛️ Frontend (Next.js + React)
├── 🗃️ Database (Supabase PostgreSQL)
├── 🤖 AI Engine (Ollama + OpenAI)
├── 💾 Cache (Upstash Redis)
├── 📱 Notifications (Twilio + EmailJS)
└── ☁️ Deploy (Railway + Vercel)
```

---

## 🛠️ **STACK TECNOLÓGICA (100% GRATUITA)**

### **Backend**
- **FastAPI** - Framework Python moderno e rápido
- **SQLAlchemy** - ORM para PostgreSQL
- **Pydantic** - Validação e serialização
- **Celery** - Tasks assíncronas
- **Redis** - Cache e sessions

### **Frontend**
- **Next.js 14** - React framework com SSR
- **TailwindCSS** - Estilização utility-first
- **shadcn/ui** - Componentes modernos
- **Zustand** - Gerenciamento de estado
- **React Query** - Cache e sincronização

### **Database & Auth**
- **Supabase** - PostgreSQL gerenciado + Auth
- **Prisma** - ORM moderno para TypeScript
- **Row Level Security** - Segurança de dados

### **IA & Automação**
- **Ollama** - IA local gratuita
- **OpenAI API** - Backup para IA
- **LangChain** - Framework para IA
- **Pinecone** - Vector database (tier gratuito)

### **Deploy & Monitoramento**
- **Vercel** - Deploy frontend
- **Railway** - Deploy backend
- **Uptime Robot** - Monitoramento
- **Sentry** - Error tracking

---

## 📁 **ESTRUTURA DO PROJETO**

```
barbershop-manager/
├── 📁 backend/                    # API FastAPI
│   ├── 📁 app/
│   │   ├── 📁 api/               # Rotas da API
│   │   ├── 📁 core/              # Configurações
│   │   ├── 📁 models/            # Modelos SQLAlchemy
│   │   ├── 📁 services/          # Lógica de negócio
│   │   ├── 📁 ai/                # Módulos de IA
│   │   └── 📁 utils/             # Utilitários
│   ├── requirements.txt
│   └── Dockerfile
├── 📁 frontend/                   # App Next.js
│   ├── 📁 src/
│   │   ├── 📁 app/               # App Router Next.js 14
│   │   ├── 📁 components/        # Componentes React
│   │   ├── 📁 hooks/             # Custom hooks
│   │   ├── 📁 lib/               # Utilitários
│   │   └── 📁 stores/            # Zustand stores
│   ├── package.json
│   └── next.config.js
├── 📁 database/                   # Scripts SQL
│   ├── 📁 migrations/
│   └── 📁 seeds/
├── 📁 docs/                       # Documentação
└── 📁 scripts/                    # Scripts automação
```

---

## 🚀 **INSTALAÇÃO RÁPIDA**

### **1. Clonar Repositório**
```bash
git clone https://github.com/seu-usuario/barbershop-manager.git
cd barbershop-manager
```

### **2. Setup Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Configurar variáveis no .env
uvicorn app.main:app --reload
```

### **3. Setup Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Configurar variáveis no .env.local
npm run dev
```

### **4. Setup Database**
```bash
# Criar conta gratuita no Supabase
# Executar migrations
python manage.py migrate
```

---

## 🔧 **CONFIGURAÇÃO**

### **Variáveis de Ambiente**

#### **Backend (.env)**
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://localhost:6379

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...

# IA
OPENAI_API_KEY=sk-...
OLLAMA_HOST=http://localhost:11434

# Notifications
TWILIO_SID=AC...
TWILIO_TOKEN=...
EMAILJS_SERVICE_ID=...

# Security
SECRET_KEY=sua-chave-secreta
```

#### **Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 📊 **FUNCIONALIDADES DETALHADAS**

### **📅 Agendamento Inteligente**
- Calendário interativo com disponibilidade em tempo real
- IA sugere melhores horários baseado em histórico
- Reagendamento automático de cancelamentos
- Lista de espera com priorização inteligente
- Sincronização com Google Calendar

### **👥 Gestão de Clientes**
- Perfil completo com histórico de serviços
- Preferências e observações personalizadas
- Segmentação automática para marketing
- Importação de dados em massa
- Sistema de fidelidade integrado

### **💰 Sistema POS Avançado**
- Interface touch-friendly para tablets
- Múltiplas formas de pagamento (PIX, cartão, dinheiro)
- Cálculo automático de comissões
- Gestão de gorjetas digitais
- Emissão de recibos e NFCe

### **📦 Controle de Estoque**
- Alertas automáticos de produtos em falta
- Previsão de demanda com IA
- Integração com fornecedores
- Controle de validade de produtos
- Relatórios de movimentação

### **📈 Analytics e Relatórios**
- Dashboard executivo em tempo real
- Métricas de performance por barbeiro
- Análise de lucratividade por serviço
- Previsões de faturamento
- Exportação para Excel/PDF

### **🤖 Automações com IA**
- Chatbot para agendamentos 24/7
- Lembretes automáticos personalizados
- Campanhas de marketing segmentadas
- Análise de sentimento em reviews
- Otimização automática de preços

---

## 🎨 **INTERFACE**

### **Design System**
- **Material Design 3** com cores da marca
- **Modo escuro/claro** automático
- **Responsivo** para mobile, tablet e desktop
- **PWA** para instalação como app
- **Acessibilidade** WCAG 2.1 AA

### **Temas Disponíveis**
- 🌟 **Barbershop Classic** (preto/dourado)
- 🔥 **Modern Red** (vermelho/cinza)
- 💙 **Ocean Blue** (azul/branco)
- 🌱 **Nature Green** (verde/madeira)

---

## 🔐 **SEGURANÇA**

- **Autenticação** JWT + refresh tokens
- **Autorização** baseada em roles (Admin/Barbeiro/Cliente)
- **HTTPS** obrigatório em produção
- **Rate limiting** para APIs
- **Criptografia** de dados sensíveis
- **Backup** automático diário
- **LGPD** compliance total

---

## 📱 **MOBILE**

### **PWA Features**
- Instalação como app nativo
- Funcionamento offline limitado
- Push notifications
- Camera para fotos de cortes
- Geolocalização para check-in

### **Apps Nativos** (Roadmap)
- iOS App Store
- Google Play Store
- Sincronização em tempo real

---

## 🌐 **INTEGRAÇÕES**

### **Redes Sociais**
- **Instagram** - Agendamento via DM
- **Facebook** - Botão agendar na página
- **WhatsApp** - Bot para atendimento
- **Google My Business** - Sincronização de horários

### **Pagamentos**
- **PIX** - Integração Banco do Brasil
- **Stripe** - Cartões internacionais
- **PagSeguro** - Cartões nacionais
- **Stone** - Maquininhas

### **Marketplace**
- **Google Reserve** - Aparece nas buscas
- **Agendor** - Sincronização de leads
- **RD Station** - Automação de marketing

---

## 🤝 **CONTRIBUIÇÃO**

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 **LICENÇA**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🆘 **SUPORTE**

- 📧 **Email:** suporte@barbershop-manager.com
- 💬 **Discord:** [Comunidade Barbershop Manager](https://discord.gg/barbershop)
- 📚 **Documentação:** [docs.barbershop-manager.com](https://docs.barbershop-manager.com)
- 🐛 **Issues:** [GitHub Issues](https://github.com/seu-usuario/barbershop-manager/issues)

---

## 🏆 **ROADMAP**

- [x] **v1.0** - MVP com funcionalidades básicas
- [x] **v1.1** - Sistema de IA básico
- [ ] **v1.2** - Integrações redes sociais
- [ ] **v1.3** - Apps mobile nativos
- [ ] **v1.4** - Marketplace de produtos
- [ ] **v2.0** - Multi-unidades e franquias

---

**⭐ Se este projeto te ajudou, deixe uma estrela no GitHub!**

---

*Desenvolvido com ❤️ para a comunidade de barbeiros brasileiros* 