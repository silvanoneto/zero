import { NextResponse } from 'next/server'
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client'

// Coletar métricas padrão do Node.js (CPU, memória, etc)
collectDefaultMetrics({ register })

// Contador de requisições HTTP
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
})

// Histograma de duração das requisições
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
})

// Contador de erros
export const httpRequestErrors = new Counter({
  name: 'http_request_errors_total',
  help: 'Total de erros HTTP',
  labelNames: ['method', 'route', 'error_type'],
  registers: [register],
})

// Gauge para Web Vitals
import { Gauge } from 'prom-client'

export const webVitalsLCP = new Gauge({
  name: 'web_vitals_lcp_seconds',
  help: 'Largest Contentful Paint (LCP)',
  labelNames: ['page'],
  registers: [register],
})

export const webVitalsFID = new Gauge({
  name: 'web_vitals_fid_seconds',
  help: 'First Input Delay (FID)',
  labelNames: ['page'],
  registers: [register],
})

export const webVitalsCLS = new Gauge({
  name: 'web_vitals_cls_score',
  help: 'Cumulative Layout Shift (CLS)',
  labelNames: ['page'],
  registers: [register],
})

export const webVitalsFCP = new Gauge({
  name: 'web_vitals_fcp_seconds',
  help: 'First Contentful Paint (FCP)',
  labelNames: ['page'],
  registers: [register],
})

export const webVitalsTTFB = new Gauge({
  name: 'web_vitals_ttfb_seconds',
  help: 'Time to First Byte (TTFB)',
  labelNames: ['page'],
  registers: [register],
})

// Contador de page views
export const pageViews = new Counter({
  name: 'page_views_total',
  help: 'Total de visualizações de página',
  labelNames: ['page', 'referrer'],
  registers: [register],
})

// Gauge de usuários ativos
export const activeUsers = new Gauge({
  name: 'active_users_current',
  help: 'Número de usuários ativos atualmente',
  registers: [register],
})

// GET /api/metrics - Endpoint para Prometheus
export async function GET() {
  try {
    const metrics = await register.metrics()
    
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': register.contentType,
      },
    })
  } catch (error) {
    console.error('Error collecting metrics:', error)
    return NextResponse.json(
      { error: 'Failed to collect metrics' },
      { status: 500 }
    )
  }
}

// POST /api/metrics - Endpoint para receber Web Vitals do cliente
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, value, page } = body

    // Converter milissegundos para segundos (padrão Prometheus)
    const valueInSeconds = value / 1000

    switch (name) {
      case 'LCP':
        webVitalsLCP.set({ page }, valueInSeconds)
        break
      case 'FID':
        webVitalsFID.set({ page }, valueInSeconds)
        break
      case 'CLS':
        webVitalsCLS.set({ page }, value) // CLS já é um score, não tempo
        break
      case 'FCP':
        webVitalsFCP.set({ page }, valueInSeconds)
        break
      case 'TTFB':
        webVitalsTTFB.set({ page }, valueInSeconds)
        break
      default:
        console.warn(`Unknown metric: ${name}`)
    }

    // Incrementar page view se for primeira métrica
    if (name === 'TTFB') {
      const referrer = request.headers.get('referer') || 'direct'
      pageViews.inc({ page, referrer })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing metrics:', error)
    return NextResponse.json(
      { error: 'Failed to process metrics' },
      { status: 500 }
    )
  }
}
