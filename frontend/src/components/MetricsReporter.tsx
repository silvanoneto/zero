'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Função para enviar métricas ao endpoint
async function sendMetric(metric: {
  name: string
  value: number
  page: string
}) {
  try {
    await fetch('/api/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    })
  } catch (error) {
    // Silenciosamente falhar - não queremos afetar a UX
    console.debug('Failed to send metric:', error)
  }
}

export function MetricsReporter() {
  const pathname = usePathname()

  useEffect(() => {
    // Usar web-vitals para capturar métricas reais
    import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      onCLS((metric) => {
        sendMetric({
          name: 'CLS',
          value: metric.value,
          page: pathname,
        })
      })

      onFCP((metric) => {
        sendMetric({
          name: 'FCP',
          value: metric.value,
          page: pathname,
        })
      })

      // INP (Interaction to Next Paint) substituiu FID
      onINP((metric) => {
        sendMetric({
          name: 'FID', // Manter como FID para compatibilidade com backend
          value: metric.value,
          page: pathname,
        })
      })

      onLCP((metric) => {
        sendMetric({
          name: 'LCP',
          value: metric.value,
          page: pathname,
        })
      })

      onTTFB((metric) => {
        sendMetric({
          name: 'TTFB',
          value: metric.value,
          page: pathname,
        })
      })
    })
  }, [pathname])

  // Este componente não renderiza nada
  return null
}
