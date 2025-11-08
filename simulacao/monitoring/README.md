# 🔍 Stack de Observabilidade - Revolução Cibernética

Este diretório contém a configuração completa de monitoramento e observabilidade para o projeto.

## 📊 Componentes

### **Prometheus** - Coleta de Métricas
- **Porta**: 9090
- **Função**: Coleta métricas de todos os serviços
- **Targets monitorados**:
  - Frontend Next.js (porta 3000)
  - IPFS Kubo (porta 5001)
  - Helia Gateway (porta 3002)
  - PostgreSQL (via exporter)
  - Graph Node (porta 8040)
  - Node Exporter (métricas do sistema)
  - cAdvisor (métricas de containers)

### **Grafana** - Visualização
- **Porta**: 3001
- **Usuário padrão**: admin
- **Senha padrão**: admin
- **Função**: Dashboards interativos e alertas
- **Datasources pré-configurados**:
  - Prometheus (métricas)
  - Loki (logs)

### **Loki** - Agregação de Logs
- **Porta**: 3100
- **Função**: Armazena e indexa logs de todos os containers
- **Retenção**: 31 dias
- **Integrado com**: Grafana para visualização

### **Promtail** - Coleta de Logs
- **Função**: Coleta logs dos containers Docker e envia para Loki
- **Configuração**: Detecta automaticamente todos os containers

### **Node Exporter** - Métricas do Sistema
- **Porta**: 9100
- **Função**: Métricas de CPU, memória, disco, rede do host

### **cAdvisor** - Métricas de Containers
- **Porta**: 8080
- **Função**: Métricas detalhadas de uso de recursos por container

## 🚀 Quick Start

### Iniciar apenas monitoramento:
```bash
make monitoring
```

### Iniciar app + monitoramento:
```bash
make full-stack
```

### Acessar interfaces:
```bash
make grafana      # Abre Grafana no navegador
make prometheus   # Abre Prometheus no navegador
```

### Parar monitoramento:
```bash
make monitoring-down
```

## 📈 Dashboards Disponíveis

### 1. **Overview Geral**
- Status de todos os serviços
- Uso de recursos (CPU, RAM, disco, rede)
- Taxa de requisições HTTP
- Latência de respostas

### 2. **Next.js Frontend**
- Requisições por rota
- Tempo de renderização
- Cache hits/misses
- Web Vitals (LCP, FID, CLS)

### 3. **IPFS & Helia**
- Peers conectados
- Conteúdo armazenado
- Taxa de upload/download
- DHT queries

### 4. **PostgreSQL**
- Queries por segundo
- Conexões ativas
- Cache hit rate
- Tamanho de tabelas

### 5. **Logs Consolidados**
- Pesquisa full-text em todos os logs
- Filtros por serviço, nível, timestamp
- Correlação de eventos

## 🛠️ Configuração

### Variáveis de Ambiente (.env)

```bash
# Prometheus
PROMETHEUS_PORT=9090

# Grafana
GRAFANA_PORT=3001
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin

# Loki
LOKI_PORT=3100

# Node Exporter
NODE_EXPORTER_PORT=9100

# cAdvisor
CADVISOR_PORT=8080
```

### Adicionar Novo Target ao Prometheus

Edite `monitoring/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'meu-servico'
    static_configs:
      - targets: ['nome-container:porta']
        labels:
          service: 'meu-servico'
    metrics_path: '/metrics'
    scrape_interval: 30s
```

### Customizar Dashboards

1. Crie/edite dashboards via Grafana UI
2. Exporte como JSON
3. Salve em `monitoring/grafana/dashboards/`
4. Dashboards são provisionados automaticamente

## 📊 Métricas Importantes

### **Frontend (Next.js)**
- `http_requests_total` - Total de requisições
- `http_request_duration_seconds` - Latência
- `nextjs_cache_hits` - Cache hits
- `web_vitals_lcp` - Largest Contentful Paint

### **IPFS**
- `ipfs_repo_size_bytes` - Tamanho do repositório
- `ipfs_bitswap_peers` - Peers conectados
- `ipfs_bitswap_blocks_sent` - Blocos enviados

### **Containers (cAdvisor)**
- `container_cpu_usage_seconds_total` - Uso de CPU
- `container_memory_usage_bytes` - Uso de memória
- `container_network_receive_bytes_total` - Rede recebida
- `container_network_transmit_bytes_total` - Rede enviada

### **Sistema (Node Exporter)**
- `node_cpu_seconds_total` - CPU do host
- `node_memory_MemAvailable_bytes` - Memória disponível
- `node_disk_read_bytes_total` - Leitura de disco
- `node_network_receive_bytes_total` - Rede do host

## 🔔 Alertas (opcional)

Crie alertas em `monitoring/alerts.yml`:

```yaml
groups:
  - name: app
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Alta taxa de erros detectada"
```

## 🧹 Manutenção

### Ver logs do monitoramento:
```bash
make monitoring-logs
```

### Limpar dados antigos:
```bash
docker-compose -f docker-compose.monitoring.yml down -v
```

### Backup de métricas:
```bash
docker run --rm -v revolucao-cibernetica_prometheus-data:/data \
  -v $(pwd)/backups:/backup alpine \
  tar czf /backup/prometheus-$(date +%Y%m%d).tar.gz -C /data .
```

## 📚 Recursos

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)

## 🆘 Troubleshooting

### Prometheus não coleta métricas:

1. Verifique se o endpoint `/metrics` está acessível:
```bash
curl http://localhost:3000/api/metrics
```

2. Verifique targets no Prometheus:
- Acesse http://localhost:9090/targets
- Verifique se os serviços estão "UP"

### Grafana não mostra dados:

1. Verifique datasources em Configuration → Data Sources
2. Teste a conexão com Prometheus
3. Verifique se há métricas no range de tempo selecionado

### Loki não recebe logs:

1. Verifique se Promtail está rodando:
```bash
docker ps | grep promtail
```

2. Verifique logs do Promtail:
```bash
docker logs constituicao-promtail
```

## 🔐 Segurança

### Em produção:

1. **Mude a senha do Grafana**:
```bash
docker exec -it constituicao-grafana \
  grafana-cli admin reset-admin-password novasenha
```

2. **Adicione autenticação ao Prometheus**:
Edite `monitoring/prometheus.yml` e adicione `basic_auth`.

3. **Use HTTPS**:
Configure Traefik (próxima seção) para SSL/TLS.

4. **Restrinja acesso por firewall**:
```bash
# Permitir apenas localhost
iptables -A INPUT -p tcp --dport 9090 -s 127.0.0.1 -j ACCEPT
iptables -A INPUT -p tcp --dport 9090 -j DROP
```

---

**Próximo passo**: Configure [Traefik](../traefik/README.md) para reverse proxy com SSL automático.
