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

validate: ## Valida integridade da ontologia (conceitos + relações)
	@echo "🔍 Validando ontologia CRIOS..."
	@python3 scripts/update_ontology.py

fix-relations: ## Corrige relações quebradas após mesclas
	@echo "🔧 Corrigindo relações..."
	@python3 scripts/fix_relations.py

ontology: validate ## Alias para validate

balance-check: ## Analisa balanceamento das camadas ontológicas
	@python3 scripts/analyze_balance.py

stats: ## Mostra estatísticas detalhadas da ontologia
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "📊 ESTATÍSTICAS COMPLETAS DA ONTOLOGIA CRIOS"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "📚 VOLUMETRIA GERAL"
	@echo "  • Conceitos:              $$(cat assets/concepts.json | jq 'length')"
	@echo "  • Relações:               $$(cat assets/relations.json | jq 'length')"
	@echo "  • Referências:            $$(cat assets/referencias.json | jq 'length')"
	@echo "  • Tipos de relação:       $$(cat assets/relations.json | jq -r '.[].name' | sort -u | wc -l | xargs)"
	@echo ""
	@echo "🎯 DISTRIBUIÇÃO POR CAMADA"
	@cat assets/concepts.json | jq -r '.[] | .layer' | sort | uniq -c | sort -rn | awk '{printf "  • %-20s %3d conceitos\n", $$2":", $$1}'
	@echo ""
	@echo "🔗 CONECTIVIDADE"
	@echo "  • Média de conexões:      $$(cat assets/concepts.json | jq '[.[] | .connections | length] | add / length | floor')"
	@echo "  • Conceito mais conectado: $$(cat assets/concepts.json | jq -r 'max_by(.connections | length) | "\(.name) (\(.connections | length) conexões)"')"
	@echo "  • Conceito menos conectado: $$(cat assets/concepts.json | jq -r 'min_by(.connections | length) | "\(.name) (\(.connections | length) conexões)"')"
	@echo ""
	@echo "🌐 TOP 10 HUBS (conceitos mais conectados)"
	@cat assets/concepts.json | jq -r '.[] | "\(.connections | length):\(.name)"' | sort -rn | head -10 | awk -F: '{printf "  %2d. %-40s %2d conexões\n", NR, $$2, $$1}'
	@echo ""
	@echo "📉 CONCEITOS SUB-CONECTADOS (≤ 3 conexões)"
	@cat assets/concepts.json | jq -r '.[] | select(.connections | length <= 3) | "\(.connections | length):\(.name)"' | sort -n | wc -l | xargs -I {} echo "  • Total: {} conceitos"
	@echo ""
	@echo "🔀 TOP 10 TIPOS DE RELAÇÃO MAIS USADOS"
	@cat assets/relations.json | jq -r '.[].name' | sort | uniq -c | sort -rn | head -10 | awk '{printf "  %2d. %-35s %3d usos\n", NR, $$2, $$1}'
	@echo ""
	@echo "📖 REFERÊNCIAS POR CATEGORIA"
	@cat assets/referencias.json | jq -r '.[] | .categoria // "sem-categoria"' | sort | uniq -c | sort -rn | awk '{printf "  • %-20s %3d referências\n", $$2":", $$1}'
	@echo ""
	@echo "📅 LINHA DO TEMPO DAS REFERÊNCIAS"
	@echo "  • Mais antiga:  $$(cat assets/referencias.json | jq -r 'min_by(.ano) | "\(.autor) (\(.ano)) - \(.titulo[0:50])"')"
	@echo "  • Mais recente: $$(cat assets/referencias.json | jq -r 'max_by(.ano) | "\(.autor) (\(.ano)) - \(.titulo[0:50])"')"
	@echo ""
	@echo "🎨 DENSIDADE DO RIZOMA"
	@echo "  • Densidade teórica:      $$(cat assets/concepts.json assets/relations.json | jq -s 'def density: (.[1] | length) / ((.[0] | length) * ((.[0] | length) - 1)); density * 100 | floor' | xargs -I {} echo "{}%")"
	@echo "  • Relações/Conceito:      $$(cat assets/concepts.json assets/relations.json | jq -s '(.[1] | length) / (.[0] | length) | floor')"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "✨ Use 'make stats-full' para análise completa com gráficos"
	@echo "✨ Use 'make balance-check' para verificar balanceamento de camadas"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

stats-quick: ## Estatísticas resumidas (visualização rápida)
	@echo "📊 Rizoma: $$(cat assets/concepts.json | jq 'length') conceitos, $$(cat assets/relations.json | jq 'length') relações, $$(cat assets/referencias.json | jq 'length') referências"
	@cat assets/concepts.json | jq -r '.[] | .layer' | sort | uniq -c | sort -rn | awk '{printf "   • %s: %d\n", $$2, $$1}'

stats-full: ## Análise completa com distribuições e correlações
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "📊 ANÁLISE COMPLETA DA ONTOLOGIA CRIOS"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@make stats
	@echo ""
	@echo "📊 DISTRIBUIÇÃO DE CONECTIVIDADE"
	@cat assets/concepts.json | jq -r '[.[] | .connections | length] | group_by(.) | map({conexoes: .[0], conceitos: length}) | .[] | "\(.conexoes):\(.conceitos)"' | sort -t: -k1 -n | awk -F: '{printf "  • %2d conexões: %3d conceitos ", $$1, $$2; for(i=0;i<$$2/2;i++) printf "█"; printf "\n"}'
	@echo ""
	@echo "🌍 DIVERSIDADE GEOGRÁFICA/CULTURAL"
	@echo "  • Conceitos budistas:     $$(cat assets/concepts.json | jq '[.[] | select(.id | test("anatman|sunyata|pratityasamutpada"))] | length')"
	@echo "  • Conceitos taoistas:     $$(cat assets/concepts.json | jq '[.[] | select(.id | test("dao|wu-wei|yin-yang"))] | length')"
	@echo "  • Conceitos confucianos:  $$(cat assets/concepts.json | jq '[.[] | select(.id | test("ren|li-confuciano"))] | length')"
	@echo "  • Conceitos africanos:    $$(cat assets/concepts.json | jq '[.[] | select(.id | test("ubuntu|sankofa|ujamaa"))] | length')"
	@echo "  • Conceitos indígenas:    $$(cat assets/concepts.json | jq '[.[] | select(.id | test("indigena|mana|groundednormativity"))] | length')"
	@echo ""
	@echo "🔬 ANÁLISE DE QUALIDADE"
	@echo "  • Conceitos isolados (0 conexões): $$(cat assets/concepts.json | jq '[.[] | select((.connections | length) == 0)] | length')"
	@echo "  • Conceitos frágeis (1-2 conexões): $$(cat assets/concepts.json | jq '[.[] | select((.connections | length) <= 2 and (.connections | length) > 0)] | length')"
	@echo "  • Conceitos bem conectados (≥5):    $$(cat assets/concepts.json | jq '[.[] | select((.connections | length) >= 5)] | length')"
	@echo "  • Super-hubs (≥10 conexões):        $$(cat assets/concepts.json | jq '[.[] | select((.connections | length) >= 10)] | length')"
	@echo ""
	@echo "📚 COBERTURA BIBLIOGRÁFICA"
	@echo "  • Conceitos com referências:  $$(cat assets/referencias.json | jq '[.[] | select(.conceitos != null) | .conceitos[]] | unique | length')"
	@echo "  • Conceitos sem referências:  $$(cat assets/concepts.json assets/referencias.json | jq -s '(.[0] | map(.id)) - ([.[1][] | select(.conceitos != null) | .conceitos[]] | unique) | length')"
	@echo "  • Média refs/conceito:        $$(cat assets/referencias.json | jq '[.[] | select(.conceitos != null) | .conceitos | length] | if length > 0 then add / length | floor else 0 end')"
	@echo ""
	@echo "⚖️ BALANCEAMENTO ENTRE CAMADAS"
	@cat assets/concepts.json | jq -r '.[] | .layer' | sort | uniq -c | sort -rn | awk 'BEGIN {max=0} {if($$1>max) max=$$1} {printf "  • %-20s %3d conceitos ", $$2":", $$1; bar=int($$1*30/max); for(i=0;i<bar;i++) printf "█"; printf "\n"}'
	@python3 -c "import json; from collections import Counter; \
	with open('assets/concepts.json', 'r', encoding='utf-8') as f: concepts = json.load(f); \
	counts = list(Counter(c['layer'] for c in concepts).values()); \
	ratio = max(counts) / min(counts); \
	status = '✅ BOM' if ratio < 3 else '⚠️  MODERADO' if ratio < 5 else '❌ CRÍTICO'; \
	print(f'  Razão max/min: {ratio:.2f}x {status}')"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

lint: ## Verifica código TypeScript (quando configurado)
	@echo "🔍 Verificando código..."
	npm run build -- --noEmit

format: ## Formata código (quando configurado)
	@echo "✨ Formatando código..."
	@echo "ℹ️  Prettier não configurado ainda"

test: ## Executa testes (quando configurados)
	@echo "🧪 Executando testes..."
	@echo "ℹ️  Testes não configurados ainda"

server-status: ## Mostra status do servidor
	@lsof -ti:$(PORT) > /dev/null 2>&1 && echo "✅ Servidor rodando na porta $(PORT)" || echo "❌ Servidor não está rodando"

logs: ## Mostra logs do servidor de desenvolvimento
	@test -f .dev-server.log && tail -f .dev-server.log || echo "ℹ️  Nenhum log disponível"

# Comandos Git
push: ## Commit e push das mudanças
	@echo "📤 Enviando mudanças..."
	git add .
	git commit -m "Update: ontologia validada e corrigida" || true
	git push

status: ## Status do git e estatísticas da ontologia
	@echo "📊 Status Git:"
	@git status -s
	@echo ""
	@make stats
