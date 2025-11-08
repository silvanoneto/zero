#!/bin/bash

# Script para servir CRIO localmente
# Uso: ./servir.sh

echo "🎯 Iniciando servidor CRIO em http://localhost:8000"
echo "📖 Abra http://localhost:8000 no navegador"
echo "⌨️  Pressione Ctrl+C para parar"
echo ""

# Tentar python3 primeiro, depois python
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
else
    echo "❌ Python não encontrado. Instale Python para usar este servidor."
    exit 1
fi
