#!/bin/bash

# Script para testar build de produção localmente antes do deploy
# Uso: ./test-gh-pages-build.sh

set -e

echo "🔍 Testando build para GitHub Pages..."
echo ""

# Verifica se está no diretório correto
if [ ! -d "frontend" ]; then
  echo "❌ Erro: Execute este script do diretório raiz do projeto"
  exit 1
fi

cd frontend

echo "📦 1. Instalando dependências..."
npm install

echo ""
echo "🏗️ 2. Criando build de produção (modo demo)..."
export NEXT_PUBLIC_DEMO_MODE=true
npm run build

echo ""
echo "✅ Build concluído com sucesso!"
echo ""
echo "📁 Arquivos gerados em: frontend/out/"
echo ""
echo "🌐 Para testar localmente, execute:"
echo "   cd frontend"
echo "   npx serve out -l 3000"
echo ""
echo "Depois acesse: http://localhost:3000"
