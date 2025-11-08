# Grafana Dashboards & Prometheus Alerts - Guia Completo

> **Revolução Cibernética** - Observabilidade e Alertas

## 📊 Dashboards Criados

### 1. **Next.js Performance Dashboard** (`nextjs-dashboard.json`)

**UID**: `nextjs-perf`  
**Tags**: nextjs, web-vitals, performance

#### Painéis:
- **HTTP Request Rate**: Taxa de requisições por método e rota
- **Response Time (p95)**: Tempo de resposta no percentil 95
- **HTTP Status Codes**: Distribuição de códigos de status (2xx, 3xx, 4xx, 5xx)
- **LCP (Largest Contentful Paint)**: Métrica Core Web Vital
- **CLS (Cumulative Layout Shift)**: Métrica Core Web Vital
- **Page Views by Route**: Visualizações de página por rota

#### Métricas Utilizadas:
```promql
# Request Rate
rate(http_requests_total{job="nextjs"}[5m])

# Response Time p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="nextjs"}[5m]))

# Status Codes
sum by(status_code) (rate(http_requests_total{job="nextjs"}[5m]))

# Web Vitals
web_vitals_lcp{job="nextjs"}
web_vitals_cls{job="nextjs"}

# Page Views
rate(page_views_total{job="nextjs"}[5m])
```

#### Thresholds:
- ✅ **LCP < 2.5s** (Good)  
- ⚠️ **LCP 2.5-4s** (Needs Improvement)  
- ❌ **LCP > 4s** (Poor)

- ✅ **CLS < 0.1** (Good)  
- ⚠️ **CLS 0.1-0.25** (Needs Improvement)  
- ❌ **CLS > 0.25** (Poor)

---

### 2. **System Overview Dashboard** (`system-overview.json`)

**UID**: `system-overview`  
**Tags**: system, node-exporter, infrastructure

#### Painéis:
- **CPU Usage**: Gauge geral + timeline por core
- **Memory Usage**: Gauge geral + timeline de usado vs disponível
- **Disk Usage**: Gauge de uso do disco raiz
- **Services Status**: Contagem de serviços up/down
- **Network Traffic**: Rx/Tx por interface
- **Disk I/O**: Reads/Writes por dispositivo

#### Métricas Utilizadas:
```promql
# CPU Usage
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory Usage
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# Disk Usage
(1 - (node_filesystem_avail_bytes{mountpoint="/",fstype!="rootfs"} / node_filesystem_size_bytes{mountpoint="/",fstype!="rootfs"})) * 100

# Services Status
count(up{job=~".*"} == 1)
count(up{job=~".*"} == 0)

# Network
rate(node_network_receive_bytes_total{device!="lo"}[5m])
rate(node_network_transmit_bytes_total{device!="lo"}[5m])

# Disk I/O
rate(node_disk_reads_completed_total[5m])
rate(node_disk_writes_completed_total[5m])
```

#### Thresholds:
- ✅ **CPU < 70%** (Good)  
- ⚠️ **CPU 70-85%** (Warning)  
- ❌ **CPU > 85%** (Critical)

- ✅ **Memory < 80%** (Good)  
- ⚠️ **Memory 80-90%** (Warning)  
- ❌ **Memory > 90%** (Critical)

- ✅ **Disk < 80%** (Good)  
- ⚠️ **Disk 80-90%** (Warning)  
- ❌ **Disk > 90%** (Critical)

---

### 3. **Traefik Dashboard** (`traefik-dashboard.json`)

**UID**: `traefik-dash`  
**Tags**: traefik, reverse-proxy, http  
**Based on**: Grafana Dashboard #17346

#### Painéis:
- **Total Requests by EntryPoint**: web, websecure
- **Request Duration (p95)**: Latência do proxy
- **HTTP Status Codes**: Distribuição de respostas
- **Requests by Service**: Tráfego por backend
- **Services Status**: Health dos backends
- **Open Connections by Service**: Conexões ativas

#### Métricas Utilizadas:
```promql
# Request Rate
rate(traefik_entrypoint_requests_total[5m])

# Latency p95
histogram_quantile(0.95, rate(traefik_entrypoint_request_duration_seconds_bucket[5m]))

# Status Codes
sum by(code) (rate(traefik_entrypoint_requests_total[5m]))

# Service Requests
sum by(service) (rate(traefik_service_requests_total[5m]))

# Service Health
traefik_service_server_up

# Connections
traefik_service_open_connections
```

---

## 🚨 Alertas Configurados

### Arquivo: `/monitoring/alerts.yml`

### **Grupo: system_alerts**

#### 1. HighCPUUsage
- **Condição**: CPU > 80% por 5 minutos
- **Severidade**: Warning
- **Ação**: Investigar processos, considerar scaling

#### 2. CriticalCPUUsage
- **Condição**: CPU > 95% por 2 minutos
- **Severidade**: Critical
- **Ação**: Ação imediata necessária

#### 3. HighMemoryUsage
- **Condição**: Memory > 85% por 5 minutos
- **Severidade**: Warning
- **Ação**: Verificar memory leaks, considerar mais RAM

#### 4. CriticalMemoryUsage
- **Condição**: Memory > 95% por 2 minutos
- **Severidade**: Critical
- **Ação**: Reiniciar serviços ou adicionar RAM urgentemente

#### 5. HighDiskUsage
- **Condição**: Disk > 85% por 5 minutos
- **Severidade**: Warning
- **Ação**: Limpar arquivos temporários, logs antigos

#### 6. CriticalDiskUsage
- **Condição**: Disk > 95% por 2 minutos
- **Severidade**: Critical
- **Ação**: Liberar espaço urgentemente

---

### **Grupo: application_alerts**

#### 7. HighHTTPErrorRate
- **Condição**: HTTP 5xx > 10/min por 5 minutos
- **Severidade**: Warning
- **Ação**: Verificar logs da aplicação

#### 8. CriticalHTTPErrorRate
- **Condição**: HTTP 5xx > 50/min por 2 minutos
- **Severidade**: Critical
- **Ação**: Investigar falha crítica

#### 9. HighResponseTime
- **Condição**: p95 > 1s por 5 minutos
- **Severidade**: Warning
- **Ação**: Otimizar queries, caching

#### 10. CriticalResponseTime
- **Condição**: p95 > 3s por 2 minutos
- **Severidade**: Critical
- **Ação**: Investigar gargalo

#### 11. PoorLCP
- **Condição**: LCP > 4s por 5 minutos
- **Severidade**: Warning
- **Ação**: Otimizar carregamento de imagens/fontes

#### 12. PoorCLS
- **Condição**: CLS > 0.25 por 5 minutos
- **Severidade**: Warning
- **Ação**: Fixar layout shifts

---

### **Grupo: service_alerts**

#### 13. ServiceDown
- **Condição**: up == 0 por 1 minuto
- **Severidade**: Critical
- **Ação**: Reiniciar serviço

#### 14. ContainerRestarting
- **Condição**: Restarts > 0 em 15min
- **Severidade**: Warning
- **Ação**: Verificar logs, aumentar recursos

#### 15. ContainerHighMemory
- **Condição**: Container memory > 90% do limit
- **Severidade**: Warning
- **Ação**: Aumentar memory limit

---

### **Grupo: ssl_certificate_alerts**

#### 16. SSLCertificateExpiringSoon
- **Condição**: Certificado expira em < 30 dias
- **Severidade**: Warning
- **Ação**: Renovar certificado

#### 17. SSLCertificateExpiring
- **Condição**: Certificado expira em < 7 dias
- **Severidade**: Critical
- **Ação**: Renovar certificado urgentemente

---

## 🚀 Como Usar

### Acessar Grafana

```bash
# Via porta direta
http://localhost:3001

# Via Traefik (com SSL)
https://grafana.revolucao-cibernetica.local

# Login padrão
User: admin
Password: admin
```

### Importar Dashboards

Os dashboards são carregados automaticamente via provisioning!

Localização: `/var/lib/grafana/dashboards/`

Se precisar importar manualmente:
1. Grafana → Dashboards → Import
2. Upload JSON file
3. Selecionar datasource: Prometheus

### Visualizar Alertas no Prometheus

```bash
# Acessar Prometheus
http://localhost:9090

# Ou via Traefik
https://prometheus.revolucao-cibernetica.local

# Ir para: Alerts
```

Alertas ficam em 3 estados:
- **Inactive** (verde): Condição não atingida
- **Pending** (amarelo): Condição atingida, aguardando `for` duration
- **Firing** (vermelho): Alerta disparado!

---

## 📈 Métricas Personalizadas

### Adicionar Nova Métrica no Next.js

```typescript
// Em qualquer página/API route
import { register } from 'prom-client';

// Criar métrica
const myCounter = new Counter({
  name: 'my_custom_metric_total',
  help: 'Description of my metric',
  labelNames: ['label1', 'label2'],
});

// Incrementar
myCounter.inc({ label1: 'value1', label2: 'value2' });

// Expor em /api/metrics (já configurado!)
```

### Adicionar Query no Dashboard

1. Editar dashboard no Grafana
2. Add Panel
3. PromQL query:
   ```promql
   rate(my_custom_metric_total[5m])
   ```
4. Save Dashboard

---

## 🔔 Configurar Notificações

### Slack

```yaml
# monitoring/alertmanager.yml (criar)
receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#alerts'
        title: 'Alert: {{ .GroupLabels.alertname }}'
        text: '{{ .CommonAnnotations.description }}'
```

### Email

```yaml
receivers:
  - name: 'email'
    email_configs:
      - to: 'admin@revolucao-cibernetica.org'
        from: 'alertmanager@revolucao-cibernetica.org'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'your-email@gmail.com'
        auth_password: 'app-password'
```

### PagerDuty, Discord, Telegram

Documentação: https://prometheus.io/docs/alerting/latest/configuration/

---

## 🧪 Testar Alertas

```bash
# Forçar CPU alto (cuidado!)
stress --cpu 8 --timeout 300s

# Forçar memória alta
stress --vm 2 --vm-bytes 4G --timeout 60s

# Simular erro 500
curl -X POST https://revolucao-cibernetica.local/api/test-error

# Verificar alertas
curl http://localhost:9090/api/v1/alerts
```

---

## 📚 Referências

- **Prometheus**: https://prometheus.io/docs/
- **Grafana**: https://grafana.com/docs/
- **PromQL**: https://prometheus.io/docs/prometheus/latest/querying/basics/
- **Web Vitals**: https://web.dev/vitals/
- **Traefik Metrics**: https://doc.traefik.io/traefik/observability/metrics/prometheus/

---

**Status**: ✅ Dashboards e Alertas Configurados  
**Próximos Passos**: Configurar Alertmanager para notificações  
**Desenvolvido por**: Revolução Cibernética 🚀
