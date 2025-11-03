#!/bin/sh
# Startup script - Executa seed e inicia servidor

echo "🚀 Iniciando Helia Gateway..."
echo ""

# Executar seed
echo "📦 Executando seed do sistema..."
node src/seed/index.js

# Verificar se seed foi bem-sucedido
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Seed concluído com sucesso!"
    echo ""
else
    echo ""
    echo "⚠️  Seed falhou, mas continuando com inicialização..."
    echo ""
fi

# Iniciar servidor
echo "🌐 Iniciando servidor HTTP..."
exec node src/index.js
