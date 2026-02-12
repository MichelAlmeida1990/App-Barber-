# Instruções para Adicionar o Logo

## Onde colocar o logo:

1. Coloque a imagem do logo da **BARBEARIA DO DUDÃO** no seguinte caminho:
   ```
   frontend/public/images/logo-dudao.png
   ```

2. **Formato recomendado:**
   - PNG com fundo transparente
   - Tamanho: 512x512 pixels (ou proporcional)
   - Resolução: alta qualidade

3. **Nome do arquivo:**
   - O arquivo DEVE se chamar: `logo-dudao.png`
   - Se você tiver outro formato (JPG, SVG, etc), converta para PNG ou atualize o caminho no código

## Onde o logo será exibido:

- ✅ Sidebar do Admin (expandido e colapsado)
- ✅ Header mobile do Admin
- ✅ Pode ser adicionado em outras páginas conforme necessário

## Fallback:

Se o logo não carregar, o sistema mostrará automaticamente um ícone de barber pole como fallback.

## Atualizar caminho do logo:

Se você quiser usar outro nome de arquivo ou formato, edite:
- `frontend/src/components/Sidebar.tsx` (linhas ~90-110)
- Procure por: `src="/images/logo-dudao.png"`

