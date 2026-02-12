# Como Abrir o Projeto no Cursor/VS Code

## Método 1: Abrir pelo arquivo de workspace (RECOMENDADO)

1. **Abra o Cursor ou VS Code**
2. **File → Open Workspace from File...** (ou `Ctrl+K Ctrl+O`)
3. **Navegue até:** `C:\Projetos\App barbearia\`
4. **Selecione:** `app-barbearia.code-workspace`
5. **Clique em "Open"**

Isso abrirá o projeto com 3 pastas:
- ✅ App Barbearia - Raiz (pasta completa)
- ✅ Frontend (Next.js)
- ✅ Backend (FastAPI)

## Método 2: Abrir pasta diretamente

1. **File → Open Folder...** (ou `Ctrl+K Ctrl+O`)
2. **Navegue até:** `C:\Projetos\App barbearia\`
3. **Selecione a pasta** e clique em "Select Folder"

## Método 3: Pelo terminal

```powershell
cd "C:\Projetos\App barbearia"
code .
```

Ou para Cursor:
```powershell
cd "C:\Projetos\App barbearia"
cursor .
```

## Se os arquivos ainda não aparecerem:

1. **Recarregue a janela:**
   - `Ctrl+Shift+P` → Digite "Reload Window" → Enter

2. **Verifique se há filtros ativos:**
   - No explorador de arquivos, verifique se há um ícone de filtro ativo
   - Clique nele para desativar

3. **Verifique configurações de arquivos ocultos:**
   - `Ctrl+Shift+P` → "Preferences: Open Settings (UI)"
   - Procure por "files.exclude" e verifique se não está ocultando arquivos importantes

4. **Limpe o cache do editor:**
   - Feche o Cursor/VS Code
   - Delete a pasta `.vscode` (se existir) em `C:\Projetos\App barbearia\.vscode`
   - Reabra o projeto

## Estrutura esperada:

```
C:\Projetos\App barbearia\
├── frontend\
│   ├── src\
│   │   ├── app\
│   │   ├── components\
│   │   └── ...
│   └── ...
├── backend\
│   └── ...
└── app-barbearia.code-workspace
```

## Dica:

Se você estava trabalhando no caminho antigo (`C:\Users\miche\OneDrive\...`), certifique-se de abrir o novo caminho (`C:\Projetos\App barbearia\`).



