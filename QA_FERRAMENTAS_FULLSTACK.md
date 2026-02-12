# QA - Ferramentas Fullstack (Frontend + Backend)

Este documento lista ferramentas e extensoes recomendadas para QA em projetos fullstack, com foco em fluxo do usuario, API, dados e observabilidade.

## 1) Ferramentas essenciais por camada

### Frontend
- DevTools do navegador (Console/Network/Performance): captura erros JS, falhas de rede, CORS, payloads e tempos.
- ESLint: detecta erros de codigo e padroes que geram bugs.
- Lighthouse (no Chrome DevTools): checa performance, acessibilidade e boas praticas.

### Backend
- Swagger/OpenAPI: valida contratos e respostas de API sem depender do frontend.
- cURL ou HTTPie: smoke test rapido de endpoints.
- Logs do servidor: identifica excecoes, valida regras e tempo de resposta.

### Integracao
- Postman/Insomnia/Thunder Client: colecoes de requests com ambientes e variaveis.
- Contratos de API: documentacao + exemplos para evitar regressao.

## 2) Extensoes VS Code recomendadas

### Basicas para QA
- REST Client (humao.rest-client): requests HTTP direto em arquivos .http.
- Thunder Client (rangav.vscode-thunder-client): Postman dentro do VS Code.
- Error Lens (usernamehw.errorlens): destaca erros e warnings inline.
- ESLint (dbaeumer.vscode-eslint): qualidade de codigo no frontend.
- GitLens (eamodio.gitlens): contexto de mudancas e autoria.

### Opcional, mas util
- YAML (redhat.vscode-yaml): config e pipelines.
- Docker (ms-azuretools.vscode-docker): testes em container.

## 3) Jira: o que faz e alternativas

### O que o Jira faz
- Gerencia tarefas, bugs, epicos e sprints.
- Define workflow (To Do, In Progress, Done) com aprovacoes.
- Centraliza evidencias, comentarios e rastreio de releases.
- Integra com repositorios, CI/CD e relatorios de time.

### Alternativas equivalentes
- GitHub Issues + Projects: nativo do repositorio, bom para times pequenos/medios.
- Linear: rapido e simples, otimo para squads.
- YouTrack: forte em workflows e automacao.
- Azure DevOps Boards: bom para quem ja usa Azure DevOps.
- Trello: leve, sem muito controle de workflow.

### No VS Code
- Extensao oficial: Jira and Bitbucket (atlassian.atlascode)
  - Permite ver issues, criar branches e atualizar status sem sair do editor.

## 4) Checklist rapido de uso em QA

1) Smoke test (subir app + abrir pagina inicial).
2) Fluxos criticos (login, agendamento, clientes, vendas).
3) Verificar Console/Network para erros.
4) Validar API (Swagger ou Thunder Client).
5) Registrar defeitos com passos claros e evidencias.

## 5) Proximo passo

Quando quiser, iniciamos os testes no projeto local com este roteiro.
