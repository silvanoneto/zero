#!/bin/bash

# Script para iniciar desenvolvimento do Rizoma
# Inicia TypeScript watch + Browser-sync com live reload

echo "🚀 Iniciando ambiente de desenvolvimento..."
echo ""
echo "📦 TypeScript: Compilando e observando mudanças"
echo "🌐 Servidor: http://localhost:8000"
echo "🔄 Live Reload: Ativado (browser atualiza automaticamente)"
echo ""
echo "Para parar: Ctrl+C"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Limpar processos anteriores
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null  # Browser-sync UI

# Executar npm dev (TypeScript watch + Browser-sync)
npm run dev
