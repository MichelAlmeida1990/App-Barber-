#!/bin/bash
# Script de build para Render

echo "🔨 Iniciando build do backend..."

# Instalar dependências
echo "📦 Instalando dependências..."
pip install -r requirements.txt

# Executar migrações (se houver)
# echo "🗄️ Executando migrações..."
# alembic upgrade head

echo "✅ Build concluído com sucesso!"



