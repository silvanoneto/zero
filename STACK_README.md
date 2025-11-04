# 🌐 Revolução Cibernética - Stack Completa

**Sistema unificado de governança descentralizada com observabilidade integrada**

## 🚀 Quick Start

### Desenvolvimento (básico):
```bash
cp .env.example .env    # Configure variáveis
make dev                # Inicia frontend + IPFS + Helia
```
Acesse: http://localhost:3000

### Com Monitoramento (recomendado):
```bash
make full-stack         # App + Prometheus + Grafana + Loki
```
Acesse:
- **App**: http://localhost:3000
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

## 📱 Páginas Disponíveis

### ✅ Migradas para Next.js:
- 🏠 `/` - Página inicial (em progresso)
- 🔥 `/manifesto` - Manifesto do Eu Coletivo
- 📜 `/constituicao` - Constituição Viva 1.0
- 🔐 `/entry` - Verificação captcha
- 🧪 `/zec-simulator` - Simulador ZEC
- 🗳️ `/federation-voting` - Sistema de votação
- 🧬 `/dao-mitosis` - Sistema de mitose

### 📋 TODO (HTMLs a migrar):
- `/constituicao-2-0` - Versão biomimética
- `/constituicao-completa` - Texto completo interativo
- `/contracts` - Smart contracts Solidity
- `/download` - Download do livro

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    🌐 Frontend (Next.js 16)                 │
│              React 19 + TypeScript + Tailwind               │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐  ┌──────▼────────┐
│ 📦 IPFS Kubo │  │ 🔗 Helia P2P  │
│  Gateway     │  │   Gateway      │
└──────────────┘  └────────────────┘
        │                 │
        └────────┬────────┘
                 │
        ┌────────▼───────────────────────────────┐
        │   🔍 Stack de Observabilidade          │
        ├────────────────────────────────────────┤
        │  Prometheus  │  Grafana  │  Loki       │
        │  (Métricas)  │  (Dashb.) │  (Logs)     │
        └────────────────────────────────────────┘
```

## 📊 Monitoramento

### Serviços Incluídos:

| Serviço | Porta | Função |
|---------|-------|--------|
| **Prometheus** | 9090 | Coleta de métricas |
| **Grafana** | 3001 | Visualização & dashboards |
| **Loki** | 3100 | Agregação de logs |
| **Promtail** | - | Coleta de logs Docker |
| **Node Exporter** | 9100 | Métricas do sistema |
| **cAdvisor** | 8080 | Métricas de containers |

### Métricas Coletadas:

**Frontend (Next.js)**:
- HTTP request rate & latency
- Error rate por rota
- Cache performance
- Web Vitals (LCP, FID, CLS) *

**IPFS/Helia**:
- Peers conectados
- Bandwidth usage
- Blocos armazenados
- DHT operations

**Sistema**:
- CPU, RAM, Disco, Rede
- Container resource usage
- Health check status

_* Requer implementação da API `/api/metrics`_

## 🛠️ Comandos Make

### Aplicação:
```bash
make dev          # Desenvolvimento (IPFS + Helia + Frontend)
make prod         # Produção (+ PostgreSQL + Graph Node)
make all          # Todos os serviços incluindo experimentais
```

### Monitoramento:
```bash
make monitoring       # Inicia Prometheus + Grafana + Loki
make monitoring-down  # Para stack de observabilidade
make full-stack       # App + Monitoramento (tudo junto)
make grafana          # Abre Grafana no navegador
make prometheus       # Abre Prometheus no navegador
```

### Manutenção:
```bash
make logs         # Ver logs de todos os serviços
make health       # Status de saúde dos containers
make ps           # Listar containers em execução
make clean        # Parar e remover containers
make backup       # Criar backup dos volumes
```

## 🔧 Configuração

### Variáveis de Ambiente (.env):

```bash
# Frontend
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545

# IPFS
IPFS_PROFILE=server

# Helia Gateway
HELIA_PORT=8080
HELIA_LOG_LEVEL=info

# Monitoramento
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin
LOKI_PORT=3100
```

Veja `.env.example` para lista completa.

## 📈 Dashboards Grafana

### Provisionados automaticamente:
- **Overview Geral** - Status de todos os serviços
- **Next.js Performance** - Latência, cache, rotas
- **IPFS/Helia** - Peers, bandwidth, storage
- **Logs Consolidados** - Busca full-text em logs
- **System Metrics** - CPU, RAM, disco, rede

### Criar custom dashboards:
1. Acesse http://localhost:3001
2. Login: admin/admin
3. Create → Dashboard
4. Adicione painéis com PromQL queries
5. Exporte JSON e salve em `monitoring/grafana/dashboards/`

## 🔒 Segurança

### ⚠️ Antes de deploy em produção:

1. **Mudar senhas**:
```bash
# .env
GRAFANA_PASSWORD=senha-forte-aqui
POSTGRES_PASSWORD=outra-senha-forte
```

2. **Configurar firewall**:
```bash
# Permitir apenas frontend
ufw allow 3000/tcp
# Bloquear acesso direto ao monitoramento
ufw deny 9090/tcp
ufw deny 3001/tcp
```

3. **Adicionar SSL com Traefik**:
```bash
# TODO: Implementar docker-compose.traefik.yml
make traefik  # Reverse proxy com Let's Encrypt
```

4. **Autenticação**:
- Adicione basic auth no Prometheus
- Configure OAuth no Grafana
- Use API keys para métricas

## 🧪 Testes

### Verificar health:
```bash
make health
```

### Verificar métricas:
```bash
# Prometheus targets
curl http://localhost:9090/api/v1/targets

# IPFS metrics
curl http://localhost:5001/debug/metrics/prometheus

# Frontend (quando implementado)
curl http://localhost:3000/api/metrics
```

### Logs em tempo real:
```bash
make logs-f
# ou específico:
make logs-service SERVICE=frontend
```

## 📚 Documentação Detalhada

- 📖 [DOCKER_README.md](DOCKER_README.md) - Docker Compose profiles e configuração
- 🔍 [monitoring/README.md](monitoring/README.md) - Stack de observabilidade completa
- 🚀 [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) - Status da unificação frontend
- ✅ [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Checklist para produção

## 🗺️ Roadmap

### ✅ Fase 1: Infraestrutura (Concluída)
- [x] Next.js 16 upgrade
- [x] Docker Compose modernizado
- [x] Health checks funcionais
- [x] Stack de monitoramento

### 🔄 Fase 2: Migração Frontend (Em Progresso)
- [x] BookLayout component
- [x] Páginas: manifesto, constituicao, entry, zec-simulator
- [ ] Páginas: constituicao-2-0, contracts, download
- [ ] Migrar scripts JS para React hooks
- [ ] Canvas backgrounds como componentes

### 📋 Fase 3: Observabilidade
- [x] Prometheus + Grafana + Loki
- [ ] Implementar `/api/metrics` no Next.js
- [ ] Dashboards customizados
- [ ] Alertas configurados
- [ ] Web Vitals tracking

### 🔜 Fase 4: Produção
- [ ] Traefik reverse proxy
- [ ] SSL/TLS automático (Let's Encrypt)
- [ ] CI/CD com GitHub Actions
- [ ] Backup automatizado
- [ ] Alta disponibilidade (Kubernetes/Swarm)

## 🤝 Contribuindo

### Setup development:
```bash
git clone https://github.com/silvanoneto/revolucao-cibernetica.git
cd revolucao-cibernetica
cp .env.example .env
make full-stack
```

### Estrutura de branches:
- `master` - Produção estável
- `develop` - Desenvolvimento ativo
- `feature/*` - Novas funcionalidades
- `hotfix/*` - Correções urgentes

### Workflow:
1. Fork do repositório
2. Crie feature branch
3. Commits semânticos
4. Testes passando
5. Pull request para `develop`

## 📜 Licença

**Creative Commons BY-SA 4.0**

Este projeto é software livre e cultura livre. Você pode:
- ✅ Copiar e redistribuir
- ✅ Adaptar e remixar
- ✅ Uso comercial

Desde que:
- 📝 Dê crédito apropriado
- 🔄 Compartilhe com mesma licença
- 🔓 Indique mudanças feitas

## 🆘 Suporte

### Issues comuns:

**Container não inicia?**
```bash
make logs SERVICE=nome-do-container
docker inspect nome-do-container
```

**PostgreSQL volume corrompido?**
```bash
make pg-reset  # Remove e recria volume
```

**Porta já em uso?**
```bash
lsof -i :3000  # Descobre processo usando porta
# Ou mude a porta no .env
FRONTEND_PORT=3001
```

**Métricas não aparecem no Grafana?**
1. Verifique datasources: Configuration → Data Sources
2. Teste conexão com Prometheus
3. Verifique se há dados no range de tempo selecionado

### Comunidade:
- 💬 Discord: [link]
- 🐦 Twitter: [@obesta fera]
- 📧 Email: contato@obestafera.com

---

**Made with 🔥 by O Besta Fera**  
*Revolução Cibernética - Onde teoria se torna práxis*
