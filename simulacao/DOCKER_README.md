# 🐳 Docker Setup - Cybersyn 2.0

Este guia explica como executar a stack completa da Cybersyn 2.0 usando Docker Compose.

## 📋 Pré-requisitos

- Docker Engine 20.10+
- Docker Compose v2.0+
- 4GB RAM disponível (mínimo)
- 10GB de espaço em disco

## 🚀 Início Rápido

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar conforme necessário
nano .env
```

### 2. Iniciar Serviços

#### Desenvolvimento (recomendado para começar)
```bash
make dev
# ou
docker-compose --profile dev up -d
```

#### Produção
```bash
make prod
# ou
docker-compose --profile prod up -d
```

#### Todos os Serviços (incluindo nó P2P adicional)
```bash
make all
# ou
docker-compose --profile all up -d
```

## 📊 Serviços Disponíveis

| Serviço | Porta | Profile | Descrição |
|---------|-------|---------|-----------|
| Frontend | 3000 | dev, prod, all | Interface Next.js |
| Helia Gateway | 8080 | dev, prod, all | Gateway P2P principal |
| Helia Peer 2 | 8082 | dev, all | Segundo nó P2P (testes) |
| IPFS Node | 5001, 8081 | dev, prod, all | Armazenamento distribuído |
| Graph Node | 8000, 8030 | dev, prod, all | Indexador blockchain |
| PostgreSQL | 5432 | dev, prod, all | Banco de dados |

## 🛠️ Comandos Úteis

### Via Makefile (Recomendado)

```bash
# Ver todos os comandos disponíveis
make help

# Build de imagens
make build

# Ver logs
make logs          # Últimas 100 linhas
make logs-f        # Seguir em tempo real
make logs-service SERVICE=frontend  # Logs específicos

# Verificar saúde
make health

# Ver status
make ps

# Reiniciar
make restart

# Parar
make down

# Limpeza completa (remove volumes)
make clean-all
```

### Via Docker Compose

```bash
# Iniciar
docker-compose --profile dev up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Rebuild de um serviço
docker-compose build frontend

# Ver status
docker-compose ps
```

## 🏥 Health Checks

Todos os serviços têm health checks configurados. Verificar status:

```bash
# Via Makefile
make health

# Via script
./scripts/health-check.sh

# Manualmente
docker ps --format "table {{.Names}}\t{{.Status}}"
```

## 📝 Logs

### Configuração de Logging

Os logs são rotacionados automaticamente:
- **Logs padrão**: 10MB por arquivo, 3 arquivos
- **Logs verbosos** (Helia/Graph): 20MB por arquivo, 5 arquivos
- Compressão automática habilitada

### Acessar Logs

```bash
# Todos os serviços
docker-compose logs

# Serviço específico
docker-compose logs frontend

# Seguir em tempo real
docker-compose logs -f helia-gateway

# Últimas N linhas
docker-compose logs --tail=50 graph-node
```

## 🔧 Troubleshooting

### Serviço não inicia

1. Verificar logs:
   ```bash
   make logs-service SERVICE=nome-do-servico
   ```

2. Verificar health check:
   ```bash
   make health
   ```

3. Reiniciar serviço específico:
   ```bash
   docker-compose restart nome-do-servico
   ```

### Problemas com volumes

```bash
# Parar tudo e remover volumes
make clean-all

# Ou manualmente
docker-compose down -v
docker volume prune
```

### Porta já em uso

Editar `docker-compose.yml` ou `.env` para mudar as portas:

```yaml
ports:
  - "3001:3000"  # Muda porta externa para 3001
```

### Build falha

```bash
# Rebuild sem cache
docker-compose build --no-cache

# Rebuild serviço específico
docker-compose build --no-cache frontend
```

## 📦 Volumes

Dados persistentes são armazenados em volumes Docker:

- `ipfs-data`: Dados do IPFS
- `postgres-data`: Banco de dados
- `helia-p2p-data`: Estado do nó P2P principal
- `helia-p2p-data-peer2`: Estado do nó P2P secundário

### Backup

```bash
# Via Makefile
make backup

# Manualmente
docker run --rm -v revolucao-cibernetica_ipfs-data:/data \
  -v $(pwd)/backups:/backup alpine \
  tar czf /backup/ipfs-backup.tar.gz -C /data .
```

### Restaurar

```bash
docker run --rm -v revolucao-cibernetica_ipfs-data:/data \
  -v $(pwd)/backups:/backup alpine \
  tar xzf /backup/ipfs-backup.tar.gz -C /data
```

## 🌐 URLs de Acesso

Após iniciar os serviços:

- **Frontend**: http://localhost:3000
- **Helia Gateway**: http://localhost:8080
- **Helia Peer 2**: http://localhost:8082 (apenas profile `dev` ou `all`)
- **IPFS Gateway**: http://localhost:8081
- **IPFS API**: http://localhost:5001/webui
- **Graph Node**: http://localhost:8000
- **Graph Metrics**: http://localhost:8040/metrics
- **PostgreSQL**: localhost:5432

## 🔒 Segurança

### Produção

Para produção, **sempre**:

1. Mudar senha do PostgreSQL em `.env`:
   ```env
   POSTGRES_PASSWORD=sua-senha-forte-aqui
   ```

2. Não expor portas desnecessárias

3. Usar secrets do Docker:
   ```yaml
   secrets:
     postgres_password:
       file: ./secrets/postgres_password.txt
   ```

4. Configurar firewall apropriado

5. Usar HTTPS/TLS para APIs externas

## 📈 Monitoramento

### Estatísticas de Recursos

```bash
# Via Makefile
make stats

# Manualmente
docker stats
```

### Métricas do Graph Node

O Graph Node expõe métricas Prometheus em:
```
http://localhost:8040/metrics
```

Integre com Prometheus/Grafana para dashboards.

## 🔄 Atualizações

### Atualizar Imagens

```bash
# Parar serviços
make down

# Pull de novas imagens
docker-compose pull

# Rebuild custom images
make build

# Reiniciar
make dev
```

### Atualizar Código

```bash
# Rebuild apenas o que mudou
docker-compose up -d --build

# Ou serviço específico
docker-compose up -d --build frontend
```

## 🤝 Desenvolvimento

### Hot Reload

Para desenvolvimento com hot reload, monte o código como volume:

```yaml
services:
  frontend:
    volumes:
      - ./frontend:/app
      - /app/node_modules
```

### Debug

```bash
# Entrar no container
make shell SERVICE=frontend

# Ou
docker exec -it constituicao-frontend sh

# Ver variáveis de ambiente
docker exec constituicao-frontend env
```

## 📚 Mais Informações

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Next.js Docker](https://nextjs.org/docs/deployment#docker-image)
- [IPFS Docker](https://docs.ipfs.tech/install/run-ipfs-inside-docker/)
- [The Graph Docker](https://thegraph.com/docs/en/deploying/deploying-a-subgraph-to-hosted/)

---

**Problemas?** Abra uma issue ou consulte `make help` para mais comandos.
