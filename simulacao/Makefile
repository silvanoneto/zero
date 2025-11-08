# Cybersyn 2.0 - Makefile
# Simplifica comandos Docker Compose comuns

.PHONY: help dev prod all build up down restart logs clean health monitoring

# Variáveis
COMPOSE = docker-compose
COMPOSE_FILES = -f docker-compose.yml -f docker-compose.traefik.yml -f docker-compose.monitoring.yml
COMPOSE_MONITORING = docker-compose -f docker-compose.monitoring.yml
PROFILE_DEV = --profile dev
PROFILE_PROD = --profile prod
PROFILE_ALL = --profile all
PROFILE_MONITORING = --profile monitoring

# Ajuda padrão
help:
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "  Cybersyn 2.0 - Docker Compose Commands"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "📋 Comandos disponíveis:"
	@echo ""
	@echo "  make dev          - Iniciar ambiente de desenvolvimento"
	@echo "  make prod         - Iniciar ambiente de produção"
	@echo "  make all          - Iniciar todos os serviços (incluindo peer2)"
	@echo "  make all-services - Iniciar TODOS os serviços (app + traefik + monitoring)"
	@echo ""
	@echo "  🔍 MONITORAMENTO:"
	@echo "  make monitoring       - Iniciar stack de observabilidade"
	@echo "  make monitoring-down  - Parar stack de observabilidade"
	@echo "  make monitoring-logs  - Ver logs do monitoramento"
	@echo "  make grafana          - Abrir Grafana no navegador"
	@echo "  make prometheus       - Abrir Prometheus no navegador"
	@echo ""
	@echo "  make build        - Build de todas as imagens"
	@echo "  make build-dev    - Build apenas para desenvolvimento"
	@echo "  make build-prod   - Build apenas para produção"
	@echo ""
	@echo "  make up           - Iniciar serviços (profile padrão: dev)"
	@echo "  make down         - Parar todos os serviços"
	@echo "  make restart      - Reiniciar serviços"
	@echo ""
	@echo "  make logs         - Ver logs de todos os serviços"
	@echo "  make logs-f       - Seguir logs em tempo real"
	@echo "  make logs-service SERVICE=nome - Ver logs de um serviço específico"
	@echo ""
	@echo "  make health       - Verificar status de saúde dos serviços"
	@echo "  make ps           - Listar serviços em execução"
	@echo ""
	@echo "  make clean        - Parar e remover containers"
	@echo "  make clean-all    - Parar, remover containers e volumes (⚠️  RESET)"
	@echo ""
	@echo "  make pg-reset     - Reset apenas do volume PostgreSQL"
	@echo "  make pg-upgrade   - Upgrade PostgreSQL 14 → 16 (com backup)"
	@echo ""
	@echo "  make shell SERVICE=nome - Abrir shell em um container"
	@echo "  make config       - Validar configuração do docker-compose"
	@echo "  make backup       - Criar backup dos volumes"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Ambiente de desenvolvimento
dev:
	@echo "🚀 Iniciando ambiente de desenvolvimento..."
	$(COMPOSE) $(PROFILE_DEV) up -d
	@echo "✅ Ambiente de desenvolvimento iniciado!"
	@echo "📊 Frontend: http://localhost:3000"
	@echo "🌐 Helia Gateway: http://localhost:8080"
	@echo "� Helia Peer 2: http://localhost:8082"
	@echo ""
	@echo "ℹ️  Graph Node não iniciado (use 'make all' para incluir)"

# Ambiente de produção
prod:
	@echo "🚀 Iniciando ambiente de produção..."
	$(COMPOSE) $(PROFILE_PROD) up -d
	@echo "✅ Ambiente de produção iniciado!"
	@echo "📊 Frontend: http://localhost:3000"
	@echo "🌐 Helia Gateway: http://localhost:8080"
	@echo "📈 Graph Node: http://localhost:8000"
	@echo "🗄️  PostgreSQL: localhost:5432"

# Todos os serviços
all:
	@echo "🚀 Iniciando todos os serviços..."
	$(COMPOSE) $(PROFILE_ALL) up -d
	@echo "✅ Todos os serviços iniciados!"
	@echo "📊 Frontend: http://localhost:3000"
	@echo "🌐 Helia Gateway: http://localhost:8080"
	@echo "🔄 Helia Peer 2: http://localhost:8082"
	@echo "📈 Graph Node: http://localhost:8000"
	@echo "🗄️  PostgreSQL: localhost:5432"

# Todos os serviços incluindo Traefik e Monitoring
all-services:
	@echo "🚀 Iniciando TODOS os serviços (app + traefik + monitoring)..."
	$(COMPOSE) $(COMPOSE_FILES) $(PROFILE_ALL) up -d --remove-orphans
	@echo ""
	@echo "✅ Todos os serviços iniciados!"
	@echo ""
	@echo "📱 APLICAÇÃO:"
	@echo "   Frontend: https://revolucao-cibernetica.local"
	@echo "   IPFS Gateway: https://ipfs.revolucao-cibernetica.local"
	@echo ""
	@echo "🔐 REVERSE PROXY:"
	@echo "   Traefik Dashboard: https://traefik.revolucao-cibernetica.local"
	@echo "   Credenciais: admin / revolucao"
	@echo ""
	@echo "📊 MONITORAMENTO:"
	@echo "   Grafana: https://grafana.revolucao-cibernetica.local (admin/admin)"
	@echo "   Prometheus: https://prometheus.revolucao-cibernetica.local (admin/revolucao)"
	@echo ""
	@echo "💡 DICA: Adicione no /etc/hosts:"
	@echo "   127.0.0.1 revolucao-cibernetica.local ipfs.revolucao-cibernetica.local"
	@echo "   127.0.0.1 traefik.revolucao-cibernetica.local grafana.revolucao-cibernetica.local"
	@echo "   127.0.0.1 prometheus.revolucao-cibernetica.local"

# Build
build:
	@echo "🔨 Building todas as imagens..."
	$(COMPOSE) build

build-dev:
	@echo "🔨 Building imagens de desenvolvimento..."
	$(COMPOSE) $(PROFILE_DEV) build

build-prod:
	@echo "🔨 Building imagens de produção..."
	$(COMPOSE) $(PROFILE_PROD) build

# Comandos básicos
up:
	$(COMPOSE) $(PROFILE_DEV) up -d

down:
	@echo "⏹️  Parando todos os serviços..."
	$(COMPOSE) $(COMPOSE_FILES) down --remove-orphans
	@echo "✅ Serviços parados!"

down-all:
	@echo "⏹️  Parando TODOS os serviços (incluindo órfãos)..."
	$(COMPOSE) $(COMPOSE_FILES) down --remove-orphans
	@echo "✅ Todos os serviços parados!"

restart:
	@echo "🔄 Reiniciando serviços..."
	$(COMPOSE) restart
	@echo "✅ Serviços reiniciados!"

# Logs
logs:
	$(COMPOSE) logs --tail=100

logs-f:
	$(COMPOSE) logs -f

logs-service:
	@if [ -z "$(SERVICE)" ]; then \
		echo "❌ Erro: especifique SERVICE=nome"; \
		exit 1; \
	fi
	$(COMPOSE) logs -f $(SERVICE)

# Health check
health:
	@echo "🏥 Verificando saúde dos serviços..."
	@for container in $$(docker ps --filter "name=constituicao-*" --format "{{.Names}}"); do \
		health=$$(docker inspect --format='{{.State.Health.Status}}' $$container 2>/dev/null || echo "no health check"); \
		if [ "$$health" = "healthy" ]; then \
			echo "✅ $$container: healthy"; \
		elif [ "$$health" = "no health check" ]; then \
			echo "⚪ $$container: no health check"; \
		else \
			echo "❌ $$container: $$health"; \
		fi; \
	done

# Status
ps:
	$(COMPOSE) ps

# Limpeza
clean:
	@echo "🧹 Limpando containers..."
	$(COMPOSE) down
	@echo "✅ Containers removidos!"

clean-all:
	@echo "⚠️  ATENÇÃO: Isso irá remover containers E volumes!"
	@echo -n "Tem certeza? [y/N] "; \
	read -r REPLY; \
	if [ "$$REPLY" = "y" ] || [ "$$REPLY" = "Y" ]; then \
		$(COMPOSE) down -v; \
		echo "✅ Containers e volumes removidos!"; \
	else \
		echo "❌ Operação cancelada."; \
	fi

# Utilitários
shell:
	@if [ -z "$(SERVICE)" ]; then \
		echo "❌ Erro: especifique SERVICE=nome"; \
		exit 1; \
	fi
	docker exec -it constituicao-$(SERVICE) sh

config:
	@echo "🔍 Validando configuração..."
	$(COMPOSE) config --quiet && echo "✅ Configuração válida!" || echo "❌ Erro na configuração!"

# Comandos específicos
frontend-build:
	@echo "🔨 Building frontend..."
	$(COMPOSE) build frontend

helia-build:
	@echo "🔨 Building helia-gateway..."
	$(COMPOSE) build helia-gateway

# Monitoramento
stats:
	docker stats $$(docker ps --filter "name=constituicao-*" --format "{{.Names}}")

# Backup de volumes
backup:
	@echo "💾 Criando backup dos volumes..."
	@mkdir -p backups
	@docker run --rm -v revolucao-cibernetica_ipfs-data:/data -v $$(pwd)/backups:/backup alpine tar czf /backup/ipfs-data-$$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
	@docker run --rm -v revolucao-cibernetica_postgres-data:/data -v $$(pwd)/backups:/backup alpine tar czf /backup/postgres-data-$$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
	@echo "✅ Backup concluído em ./backups/"

# Upgrade do PostgreSQL (14 → 16)
pg-upgrade:
	@echo "🔄 Upgrade do PostgreSQL 14 → 16"
	@echo ""
	@echo "⚠️  Este comando irá:"
	@echo "   1. Fazer backup do banco atual"
	@echo "   2. Exportar dados via pg_dump"
	@echo "   3. Remover volume antigo"
	@echo "   4. Criar novo volume com PostgreSQL 16"
	@echo "   5. Restaurar dados"
	@echo ""
	@echo -n "Continuar? [y/N] "; \
	read -r REPLY; \
	if [ "$$REPLY" = "y" ] || [ "$$REPLY" = "Y" ]; then \
		./scripts/postgres-upgrade.sh; \
	else \
		echo "❌ Operação cancelada."; \
	fi

# Reset apenas do PostgreSQL
pg-reset:
	@echo "⚠️  Isso irá remover APENAS o volume do PostgreSQL!"
	@echo -n "Tem certeza? [y/N] "; \
	read -r REPLY; \
	if [ "$$REPLY" = "y" ] || [ "$$REPLY" = "Y" ]; then \
		docker-compose stop postgres graph-node; \
		docker volume rm revolucao-cibernetica_postgres-data || true; \
		echo "✅ Volume do PostgreSQL removido! Execute 'make dev' para recriar."; \
	else \
		echo "❌ Operação cancelada."; \
	fi

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔍 COMANDOS DE MONITORAMENTO
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Iniciar stack de observabilidade
monitoring:
	@echo "🚀 Iniciando stack de monitoramento..."
	@echo "   - Prometheus (métricas): http://localhost:9090"
	@echo "   - Grafana (dashboards): http://localhost:3001"
	@echo "   - Loki (logs): http://localhost:3100"
	@echo ""
	$(COMPOSE_MONITORING) $(PROFILE_MONITORING) up -d
	@echo ""
	@echo "✅ Stack de monitoramento iniciada!"
	@echo "   Usuário Grafana: admin"
	@echo "   Senha Grafana: admin (mude após primeiro login)"

# Parar monitoramento
monitoring-down:
	@echo "🛑 Parando stack de monitoramento..."
	$(COMPOSE_MONITORING) down

# Logs do monitoramento
monitoring-logs:
	$(COMPOSE_MONITORING) logs -f

# Abrir Grafana no navegador
grafana:
	@echo "🎨 Abrindo Grafana..."
	@open http://localhost:3001 || xdg-open http://localhost:3001 || echo "Acesse: http://localhost:3001"

# Abrir Prometheus no navegador
prometheus:
	@echo "📊 Abrindo Prometheus..."
	@open http://localhost:9090 || xdg-open http://localhost:9090 || echo "Acesse: http://localhost:9090"

# Iniciar tudo (app + monitoramento)
full-stack: dev monitoring
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "  🎉 Stack completo iniciado!"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "📱 Aplicação:"
	@echo "   Frontend: http://localhost:3000"
	@echo "   IPFS Gateway: http://localhost:8080"
	@echo "   Helia Gateway: http://localhost:3002"
	@echo ""
	@echo "🔍 Observabilidade:"
	@echo "   Grafana: http://localhost:3001 (admin/admin)"
	@echo "   Prometheus: http://localhost:9090"
	@echo "   Loki: http://localhost:3100"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Parar tudo
full-stack-down: down monitoring-down
	@echo "✅ Stack completo parado!"

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔒 TRAEFIK REVERSE PROXY
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPOSE_TRAEFIK = docker-compose -f docker-compose.traefik.yml

# Iniciar Traefik
traefik:
	@echo "🚀 Iniciando Traefik reverse proxy..."
	@echo ""
	@echo "⚠️  Certifique-se de adicionar ao /etc/hosts:"
	@echo "   127.0.0.1 revolucao-cibernetica.local"
	@echo "   127.0.0.1 www.revolucao-cibernetica.local"
	@echo "   127.0.0.1 traefik.revolucao-cibernetica.local"
	@echo "   127.0.0.1 grafana.revolucao-cibernetica.local"
	@echo "   127.0.0.1 prometheus.revolucao-cibernetica.local"
	@echo "   127.0.0.1 ipfs.revolucao-cibernetica.local"
	@echo "   127.0.0.1 whoami.revolucao-cibernetica.local"
	@echo ""
	$(COMPOSE_TRAEFIK) up -d
	@echo ""
	@echo "✅ Traefik iniciado!"
	@echo ""
	@echo "🌐 URLs disponíveis:"
	@echo ""
	@echo "   📊 Dashboard (HTTP): http://localhost:8090"
	@echo "   📊 Dashboard (HTTPS): https://traefik.revolucao-cibernetica.local"
	@echo ""
	@echo "   🌐 Frontend: https://revolucao-cibernetica.local"
	@echo "   📈 Grafana: https://grafana.revolucao-cibernetica.local"
	@echo "   📊 Prometheus: https://prometheus.revolucao-cibernetica.local"
	@echo "   🔗 IPFS Gateway: https://ipfs.revolucao-cibernetica.local"
	@echo "   🧪 Test Service: https://whoami.revolucao-cibernetica.local"
	@echo ""
	@echo "🔐 Dashboard login: admin / revolucao"

# Parar Traefik
traefik-down:
	@echo "🛑 Parando Traefik..."
	$(COMPOSE_TRAEFIK) down

# Logs do Traefik
traefik-logs:
	$(COMPOSE_TRAEFIK) logs -f traefik

# Status dos certificados SSL
traefik-certs:
	@echo "📜 Certificados Let's Encrypt:"
	@cat traefik/letsencrypt/acme.json 2>/dev/null | python3 -m json.tool || echo "Nenhum certificado encontrado ainda"

# Adicionar domínios ao /etc/hosts (requer sudo)
traefik-hosts:
	@echo "🔧 Adicionando domínios ao /etc/hosts..."
	@echo ""
	@echo "127.0.0.1 revolucao-cibernetica.local www.revolucao-cibernetica.local" | sudo tee -a /etc/hosts
	@echo "127.0.0.1 traefik.revolucao-cibernetica.local" | sudo tee -a /etc/hosts
	@echo "127.0.0.1 grafana.revolucao-cibernetica.local" | sudo tee -a /etc/hosts
	@echo "127.0.0.1 prometheus.revolucao-cibernetica.local" | sudo tee -a /etc/hosts
	@echo "127.0.0.1 ipfs.revolucao-cibernetica.local" | sudo tee -a /etc/hosts
	@echo "127.0.0.1 whoami.revolucao-cibernetica.local" | sudo tee -a /etc/hosts
	@echo ""
	@echo "✅ Domínios adicionados!"
