# Fix: Dashboard Next.js no Grafana não recebia métricas

## 🐛 Problema
O dashboard "Next.js - Performance Dashboard" no Grafana não estava exibindo dados porque:

1. **Job name incorreto no Prometheus**: Dashboard esperava `job="nextjs"` mas Prometheus tinha `job="frontend"`
2. **Target incorreto**: Prometheus tentava conectar em `constituicao-frontend:3000` mas o container se chama `revolucao-cibernetica-app:3000`
3. **Métricas HTTP não instrumentadas**: Endpoint `/api/metrics` existia mas não recebia dados de requisições HTTP
4. **Web Vitals não reportadas**: Métricas de performance do lado do cliente não eram enviadas

## ✅ Soluções Implementadas

### 1. Corrigido Prometheus Target (monitoring/prometheus.yml)
```yaml
# Antes:
- job_name: 'frontend'
  static_configs:
    - targets: ['constituicao-frontend:3000']

# Depois:
- job_name: 'nextjs'
  static_configs:
    - targets: ['revolucao-cibernetica-app:3000']
```

### 2. Criado Middleware para Instrumentação (frontend/src/middleware.ts)
- Adiciona headers de timing em todas as requisições
- Permite rastreamento de performance
- Configurado para não processar assets estáticos

### 3. Habilitado Instrumentation Hook (frontend/next.config.mjs)
```javascript
experimental: {
  instrumentationHook: true,
  // ...
}
```

### 4. Criado Instrumentation File (frontend/src/instrumentation.ts)
- Hook para instrumentação server-side
- Intercepta fetch requests
- Registra erros e performance

### 5. Criado MetricsReporter Component (frontend/src/components/MetricsReporter.tsx)
- Captura Web Vitals em tempo real (LCP, FID/INP, CLS, FCP, TTFB)
- Envia métricas para `/api/metrics` via POST
- Integrado no layout principal

### 6. Adicionado ao Layout Principal (frontend/src/app/layout.tsx)
```tsx
<Providers>
  <WalletPersistence />
  <MetricsReporter />  {/* ← NOVO */}
  {children}
</Providers>
```

## 📊 Métricas Disponíveis Agora

### Métricas Server-Side (Node.js)
- `process_cpu_*` - CPU usage
- `process_memory_*` - Memory usage  
- `nodejs_eventloop_*` - Event loop performance
- `nodejs_gc_*` - Garbage collection
- `http_requests_total` - Total HTTP requests *(será instrumentado)*
- `http_request_duration_seconds` - Request duration histogram *(será instrumentado)*

### Métricas Client-Side (Web Vitals)
- `web_vitals_lcp_seconds` - Largest Contentful Paint
- `web_vitals_fid_seconds` - First Input Delay (INP)
- `web_vitals_cls_score` - Cumulative Layout Shift
- `web_vitals_fcp_seconds` - First Contentful Paint
- `web_vitals_ttfb_seconds` - Time to First Byte

### Métricas de Negócio
- `page_views_total` - Page views por rota
- `active_users_current` - Usuários ativos

## 🔍 Como Verificar

### 1. Verificar se Prometheus está coletando
```bash
# Ver targets ativos
curl -s 'http://localhost:9090/api/v1/targets' | \
  jq '.data.activeTargets[] | select(.labels.job == "nextjs")'

# Verificar métricas disponíveis
curl -s http://localhost:3000/api/metrics | head -50
```

### 2. Testar coleta de métricas
```bash
# Gerar tráfego
for i in {1..10}; do curl -s http://localhost:3000/ > /dev/null; done

# Ver métricas no Prometheus (aguardar ~30s)
curl -s 'http://localhost:9090/api/v1/query?query=process_cpu_user_seconds_total' | \
  jq '.data.result[] | select(.metric.job == "nextjs")'
```

### 3. Acessar Grafana
1. Abrir https://grafana.revolucao-cibernetica.local
2. Login: `admin` / `admin` (ou conforme .env)
3. Ir em Dashboards → Next.js - Performance Dashboard
4. Métricas devem aparecer após alguns minutos de coleta

## 🚀 Próximos Passos

### Instrumentação HTTP Completa
Criar um wrapper para registrar TODAS as requisições HTTP:

```typescript
// frontend/src/lib/metrics.ts
import { httpRequestsTotal, httpRequestDuration } from './metrics-definitions'

export function recordHttpRequest(
  method: string,
  route: string,
  statusCode: number,
  durationSeconds: number
) {
  httpRequestsTotal.inc({ method, route, status_code: statusCode })
  httpRequestDuration.observe(
    { method, route, status_code: statusCode },
    durationSeconds
  )
}
```

### Integrar com API Routes
```typescript
// frontend/src/app/api/example/route.ts
import { recordHttpRequest } from '@/lib/metrics'

export async function GET(request: Request) {
  const start = Date.now()
  try {
    // ... lógica da API
    const response = NextResponse.json({ data })
    recordHttpRequest('GET', '/api/example', 200, (Date.now() - start) / 1000)
    return response
  } catch (error) {
    recordHttpRequest('GET', '/api/example', 500, (Date.now() - start) / 1000)
    throw error
  }
}
```

### Adicionar Alertas (monitoring/alerts.yml)
```yaml
- alert: HighErrorRate
  expr: |
    rate(http_request_errors_total{job="nextjs"}[5m]) > 0.05
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Taxa de erros alta no Next.js"

- alert: SlowResponseTime
  expr: |
    histogram_quantile(0.95, 
      rate(http_request_duration_seconds_bucket{job="nextjs"}[5m])
    ) > 2
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "95th percentile de tempo de resposta > 2s"
```

## 📚 Referências
- [Prometheus Client for Node.js](https://github.com/siimon/prom-client)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
- [Web Vitals](https://web.dev/vitals/)
- [Grafana Dashboard Best Practices](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/)
