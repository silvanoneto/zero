'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Tipos do Web Vitals
type Metric = {
  name: 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'INP'
  value: number
  id: string
  rating: 'good' | 'needs-improvement' | 'poor'
}

export function WebVitals() {
  const pathname = usePathname()

  useEffect(() => {
    // Importar web-vitals dinamicamente
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      // Função para enviar métricas ao backend
      const sendToAnalytics = (metric: Metric) => {
        // Enviar para /api/metrics
        fetch('/api/metrics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: metric.name,
            value: metric.value,
            id: metric.id,
            rating: metric.rating,
            page: pathname,
          }),
        }).catch((error) => {
          console.error('Error sending metric:', error)
        })

        // Log no console em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Web Vital] ${metric.name}:`, {
            value: metric.value,
            rating: metric.rating,
            page: pathname,
          })
        }
      }

      // Registrar todos os Web Vitals (FID foi depreciado, substituído por INP)
      onCLS(sendToAnalytics)
      onFCP(sendToAnalytics)
      onLCP(sendToAnalytics)
      onTTFB(sendToAnalytics)
      onINP(sendToAnalytics)
    })
  }, [pathname])

  return null
}

// Hook customizado para tracking manual
export function useWebVitals() {
  const pathname = usePathname()

  const trackCustomMetric = (name: string, value: number) => {
    fetch('/api/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        value,
        page: pathname,
      }),
    }).catch((error) => {
      console.error('Error tracking custom metric:', error)
    })
  }

  return { trackCustomMetric }
}
