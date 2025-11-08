# Traefik - Correção de Portas

## 🔍 Problema Identificado

**Erro Original**: `SSL_ERROR_RX_RECORD_TOO_LONG` ao acessar `https://traefik.revolucao-cibernetica.local:8080`

### Causas:
1. **Porta 8080 em conflito** com Helia Gateway
2. **Dashboard na porta 8080** não suportava HTTPS diretamente
3. **Porta 8888 em conflito** com cAdvisor

## ✅ Solução Implementada

### Porta do Dashboard Alterada: 8080 → 8090

```yaml
# docker-compose.traefik.yml
ports:
  - "80:80"      # HTTP
  - "443:443"    # HTTPS
  - "8090:8080"  # Dashboard (8090 externa, 8080 interna)
```

### Mapa de Portas do Sistema

| Serviço | Porta | Protocolo | URL |
|---------|-------|-----------|-----|
| **Traefik Dashboard** | 8090 | HTTP | http://localhost:8090 |
| **Traefik HTTP** | 80 | HTTP | http://localhost:80 (redireciona para 443) |
| **Traefik HTTPS** | 443 | HTTPS | https://revolucao-cibernetica.local |
| **Frontend** | 3000 | HTTP | http://localhost:3000 |
| **Grafana** | 3001 | HTTP | http://localhost:3001 |
| **Helia Gateway** | 8080 | HTTP | http://localhost:8080 |
| **Helia Peer 2** | 8082 | HTTP | http://localhost:8082 |
| **cAdvisor** | 8888 | HTTP | http://localhost:8888 |
| **Prometheus** | 9090 | HTTP | http://localhost:9090 |
| **Node Exporter** | 9100 | HTTP | http://localhost:9100 |
| **Loki** | 3100 | HTTP | http://localhost:3100 |
| **PostgreSQL** | 5432 | TCP | postgresql://localhost:5432 |

## 📊 Como Acessar o Dashboard

### Opção 1: Via HTTP Local (Recomendado para Dev)
```bash
open http://localhost:8090
# Login: admin / revolucao
```

### Opção 2: Via HTTPS com Domínio
```bash
open https://traefik.revolucao-cibernetica.local
# Login: admin / revolucao
```

⚠️ **Nota**: A opção HTTPS requer:
- Domínio configurado em `/etc/hosts`
- Certificado SSL válido (Let's Encrypt ou auto-assinado)
- Para desenvolvimento local, use HTTP na porta 8090

## 🔧 Comandos Úteis

```bash
# Iniciar Traefik
make traefik

# Ver logs
make traefik-logs

# Parar Traefik
make traefik-down

# Verificar status
docker ps --filter "name=traefik"

# Testar dashboard
curl http://localhost:8090/dashboard/

# Verificar rotas
curl http://localhost:8090/api/http/routers | jq
```

## 🚨 Troubleshooting

### Erro: "Port already allocated"
```bash
# Verificar qual serviço está usando a porta
lsof -i :8090
# ou
docker ps --filter "publish=8090"

# Parar serviço conflitante
docker stop <container-name>
```

### Erro: "SSL_ERROR_RX_RECORD_TOO_LONG"
- **Causa**: Tentando acessar porta HTTP via HTTPS
- **Solução**: Use `http://localhost:8090` (sem HTTPS)

### Dashboard não responde
```bash
# Ver logs do Traefik
docker logs traefik

# Verificar health check
docker inspect traefik | jq '.[0].State.Health'

# Recriar container
docker-compose -f docker-compose.traefik.yml up -d --force-recreate
```

## 📝 Arquivos Atualizados

1. **docker-compose.traefik.yml**
   - Porta 8090 mapeada para 8080 interna
   - Prometheus metrics na porta 8090

2. **Makefile**
   - URLs atualizadas: `http://localhost:8090`
   - Comandos `make traefik` e `make all-services` corrigidos

3. **TRAEFIK_GUIDE.md** (atualizar se necessário)
   - Documentação das novas portas

## ✅ Status

- ✅ Traefik rodando na porta 8090
- ✅ Dashboard acessível via HTTP
- ✅ HTTPS funcionando na porta 443
- ✅ Sem conflitos de porta
- ⚠️ Dashboard via HTTPS requer configuração adicional (opcional)

---

**Data**: 2025-11-03  
**Desenvolvido por**: Revolução Cibernética 🚀
