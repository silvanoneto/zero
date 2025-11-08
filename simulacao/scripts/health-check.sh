#!/bin/bash
# Health Check Script para Cybersyn 2.0
# Monitora a saúde de todos os containers

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Cybersyn 2.0 - Health Check Monitor${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Função para verificar saúde
check_health() {
    local container=$1
    local service=$2
    
    if ! docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
        echo -e "${RED}❌ ${service}: Container não está rodando${NC}"
        return 1
    fi
    
    health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no healthcheck")
    
    case $health in
        "healthy")
            echo -e "${GREEN}✅ ${service}: Saudável${NC}"
            return 0
            ;;
        "unhealthy")
            echo -e "${RED}❌ ${service}: Não saudável${NC}"
            # Mostrar últimos logs
            echo -e "${YELLOW}   Últimos logs:${NC}"
            docker logs --tail 5 "$container" 2>&1 | sed 's/^/   /'
            return 1
            ;;
        "starting")
            echo -e "${YELLOW}⏳ ${service}: Iniciando...${NC}"
            return 2
            ;;
        "no healthcheck")
            status=$(docker inspect --format='{{.State.Status}}' "$container")
            if [ "$status" = "running" ]; then
                echo -e "${BLUE}⚪ ${service}: Rodando (sem health check)${NC}"
                return 0
            else
                echo -e "${RED}❌ ${service}: ${status}${NC}"
                return 1
            fi
            ;;
        *)
            echo -e "${YELLOW}⚠️  ${service}: Status desconhecido (${health})${NC}"
            return 2
            ;;
    esac
}

# Verificar cada serviço
all_healthy=true

check_health "constituicao-ipfs" "IPFS Node" || all_healthy=false
check_health "constituicao-postgres" "PostgreSQL" || all_healthy=false
check_health "constituicao-helia-gateway" "Helia Gateway" || all_healthy=false
check_health "constituicao-graph-node" "Graph Node" || all_healthy=false
check_health "constituicao-frontend" "Frontend" || all_healthy=false

# Verificar peer2 se existir
if docker ps --format "{{.Names}}" | grep -q "constituicao-helia-gateway-peer2"; then
    check_health "constituicao-helia-gateway-peer2" "Helia Gateway Peer 2" || all_healthy=false
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Mostrar estatísticas de recursos
echo -e "${BLUE}📊 Uso de Recursos:${NC}"
echo ""
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" \
    $(docker ps --filter "name=constituicao-*" --format "{{.Names}}")

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Mostrar URLs de acesso
echo -e "${BLUE}🌐 URLs de Acesso:${NC}"
echo ""
echo -e "  Frontend:          ${GREEN}http://localhost:3000${NC}"
echo -e "  Helia Gateway:     ${GREEN}http://localhost:8080${NC}"
echo -e "  Graph Node:        ${GREEN}http://localhost:8000${NC}"
echo -e "  IPFS Gateway:      ${GREEN}http://localhost:8081${NC}"
echo -e "  IPFS API:          ${GREEN}http://localhost:5001${NC}"
echo -e "  Graph Metrics:     ${GREEN}http://localhost:8040${NC}"
echo ""

# Status final
if $all_healthy; then
    echo -e "${GREEN}✅ Todos os serviços estão saudáveis!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Alguns serviços apresentam problemas. Execute 'make logs' para mais detalhes.${NC}"
    exit 1
fi
