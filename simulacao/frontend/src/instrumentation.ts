// instrumentation.ts - Next.js Instrumentation API
// Este arquivo é executado quando o servidor Next.js inicia

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Apenas no servidor Node.js (não no Edge Runtime)
    const { register: prometheusRegister } = await import('prom-client')
    
    // Registrar hooks para instrumentação
    console.log('📊 Prometheus instrumentation registered')
    
    // Hook para interceptar fetch requests (Node.js 18+)
    if (typeof global.fetch === 'function') {
      const originalFetch = global.fetch
      global.fetch = async (...args) => {
        const startTime = Date.now()
        try {
          const response = await originalFetch(...args)
          const duration = (Date.now() - startTime) / 1000
          
          // Registrar métrica (se disponível)
          console.log(`Fetch: ${args[0]} - ${response.status} (${duration}s)`)
          
          return response
        } catch (error) {
          console.error(`Fetch error: ${args[0]}`, error)
          throw error
        }
      }
    }
  }
}

// Opcional: função para executar quando o servidor está pronto
export async function onRequestError(
  err: Error,
  request: {
    path: string
    method: string
  }
) {
  console.error(`❌ Request error: ${request.method} ${request.path}`, err)
}
