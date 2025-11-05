import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Importar métricas (em produção, essas seriam importadas de um módulo compartilhado)
// Como estamos no middleware edge, precisamos de uma abordagem diferente
// Vamos usar headers customizados para passar informações para a API route

export function middleware(request: NextRequest) {
  const startTime = Date.now()
  
  // Criar resposta
  const response = NextResponse.next()
  
  // Adicionar headers de timing
  response.headers.set('X-Request-Start', startTime.toString())
  response.headers.set('X-Request-Path', request.nextUrl.pathname)
  
  // Adicionar CORS headers se necessário
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  
  return response
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
