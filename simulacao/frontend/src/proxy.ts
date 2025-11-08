import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { httpRequestsTotal, httpRequestDuration } from './app/api/metrics/route'

export function proxy(request: NextRequest) {
  const start = Date.now()
  const { pathname, search } = request.nextUrl
  const method = request.method
  
  // Criar resposta
  const response = NextResponse.next()
  
  // Calcular duração após resposta
  const duration = (Date.now() - start) / 1000 // converter para segundos
  const status = response.status.toString()
  
  // Registrar métricas
  try {
    httpRequestsTotal.inc({
      method,
      route: pathname,
      status_code: status,
    })
    
    httpRequestDuration.observe(
      {
        method,
        route: pathname,
        status_code: status,
      },
      duration
    )
  } catch (error) {
    console.error('Error recording metrics in proxy:', error)
  }
  
  return response
}

// Configurar rotas que o proxy deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/metrics (avoid recursive metrics)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/metrics|_next/static|_next/image|favicon.ico).*)',
  ],
}
