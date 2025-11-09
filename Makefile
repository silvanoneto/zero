.PHONY: help install build watch dev clean test lint format

# Variáveis
PORT := 8000
DIST_DIR := dist
SRC_DIR := src

help: ## Mostra esta mensagem de ajuda
	@echo "📦 Rizoma - Comandos disponíveis:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Instala dependências do projeto
	@echo "📦 Instalando dependências..."
	npm install

build: ## Compila TypeScript para JavaScript
	@echo "🔨 Compilando TypeScript..."
	npm run build

watch: ## Observa mudanças e recompila automaticamente
	@echo "👀 Observando mudanças em $(SRC_DIR)..."
	npm run watch

dev: ## Inicia ambiente de desenvolvimento (watch + live reload)
	@echo "🚀 Iniciando desenvolvimento em http://localhost:$(PORT) (live reload ativado)"
	@lsof -ti:$(PORT) | xargs kill -9 2>/dev/null || true
	@lsof -ti:3001 | xargs kill -9 2>/dev/null || true
	npm run dev

clean: ## Remove arquivos compilados
	@echo "🧹 Limpando arquivos compilados..."
	rm -rf $(DIST_DIR)
	@echo "✅ Limpeza concluída"

clean-all: clean ## Remove dist/ e node_modules/
	@echo "🧹 Removendo node_modules..."
	rm -rf node_modules
	@echo "✅ Limpeza completa"

rebuild: clean install build ## Limpa, reinstala e compila tudo

server: ## Inicia apenas o servidor HTTP (sem watch)
	@echo "🌐 Servidor HTTP em http://localhost:$(PORT)"
	python3 -m http.server $(PORT)

stop: ## Para servidor rodando na porta $(PORT)
	@lsof -ti:$(PORT) | xargs kill -9 2>/dev/null && echo "✅ Servidor parado" || echo "ℹ️  Nenhum servidor ativo"

lint: ## Verifica código TypeScript (quando configurado)
	@echo "🔍 Verificando código..."
	npm run build -- --noEmit

format: ## Formata código (quando configurado)
	@echo "✨ Formatando código..."
	@echo "ℹ️  Prettier não configurado ainda"

test: ## Executa testes (quando configurados)
	@echo "🧪 Executando testes..."
	@echo "ℹ️  Testes não configurados ainda"

status: ## Mostra status do servidor
	@lsof -ti:$(PORT) > /dev/null 2>&1 && echo "✅ Servidor rodando na porta $(PORT)" || echo "❌ Servidor não está rodando"

logs: ## Mostra logs do servidor de desenvolvimento
	@test -f .dev-server.log && tail -f .dev-server.log || echo "ℹ️  Nenhum log disponível"
