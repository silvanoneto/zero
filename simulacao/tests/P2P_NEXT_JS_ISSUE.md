# ⚠️ Problema Encontrado: libp2p + Next.js Incompatibilidade

## 🔴 Erro Atual

```
⨯ node:stream
Module build failed: UnhandledSchemeError: Reading from "node:stream" is not handled by plugins
Webpack supports "data:" and "file:" URIs by default.
You may need an additional plugin to handle "node:" URIs.
```

## 🔍 Causa Raiz

**Helia e libp2p usam módulos Node.js nativos que não funcionam no browser**

O problema está no stack de imports:
```
src/components/P2PStatus.tsx
  → src/hooks/useP2P.ts
    → src/lib/p2p-client.ts
      → import { createHelia } from 'helia'
        → helia/dist/src/utils/libp2p-defaults.browser.js
          → @libp2p/http/dist/src/http.browser.js
            → @libp2p/http-utils/dist/src/stream-to-socket.js
              → import 'node:stream'  ❌ FALHA AQUI
```

Mesmo as versões "browser" do Helia tentam importar módulos Node.js.

---

## 🎯 Soluções Possíveis

### Opção 1: Import Dinâmico (Client-Side Only) ⭐ RECOMENDADO

**Estratégia:** Carregar P2P client apenas após renderização inicial (browser-only)

```typescript
// useP2P.ts - versão com lazy loading
export function useP2P(options) {
  const [client, setClient] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Carrega P2P client apenas no browser
    if (typeof window !== 'undefined') {
      import('./p2p-client')
        .then(({ P2PClient }) => {
          const p2pClient = new P2PClient()
          p2pClient.initialize()
          setClient(p2pClient)
          setIsLoading(false)
        })
        .catch(err => console.error('Failed to load P2P', err))
    }
  }, [])
  
  // ... resto do código
}
```

**Prós:**
- ✅ Compatível com Next.js SSR
- ✅ Não quebra build process
- ✅ P2P funciona no browser

**Contras:**
- ⚠️ Delay inicial para carregar módulo
- ⚠️ Estado assíncrono adicional

---

### Opção 2: Usar WebRTC DataChannel Diretamente

**Estratégia:** Implementar P2P mais simples sem libp2p/Helia

```typescript
// simple-p2p-client.ts
export class SimpleP2PClient {
  constructor() {
    this.connections = new Map()
    this.socket = new WebSocket('ws://localhost:8080')
  }
  
  async initialize() {
    // Conexão apenas via WebSocket para gateway
    // Não tenta P2P browser-to-browser
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.handleMessage(data)
    }
  }
  
  publishProposal(proposal) {
    this.socket.send(JSON.stringify({
      type: 'proposal:new',
      data: proposal
    }))
  }
}
```

**Prós:**
- ✅ Simples, sem dependências pesadas
- ✅ Funciona 100% com Next.js
- ✅ Menor bundle size

**Contras:**
- ❌ Não é "verdadeiro" P2P (sempre via servidor)
- ❌ Perde recursos avançados de libp2p

---

### Opção 3: Separar Frontend em Modo SPA

**Estratégia:** Criar build separado apenas para modo client-side

```javascript
// next.config.mjs
export default {
  output: 'export',  // Static export sem SSR
  // ... resto
}
```

**Prós:**
- ✅ P2P funciona sem restrições
- ✅ Pode usar Helia/libp2p diretamente

**Contras:**
- ❌ Perde SSR (Server-Side Rendering)
- ❌ Perde otimizações Next.js
- ❌ SEO pior

---

### Opção 4: API REST Simples (Fallback)

**Estratégia:** Usar apenas HTTP requests para backend P2P

```typescript
// p2p-api-client.ts
export class P2PAPIClient {
  async publishProposal(proposal) {
    const response = await fetch('/api/p2p/publish/proposal', {
      method: 'POST',
      body: JSON.stringify(proposal)
    })
    return response.json()
  }
  
  async subscribeToProposals(callback) {
    // EventSource (Server-Sent Events) ou WebSocket
    const eventSource = new EventSource('/api/p2p/stream/proposals')
    eventSource.onmessage = (event) => callback(JSON.parse(event.data))
  }
}
```

**Prós:**
- ✅ Funciona 100% com Next.js
- ✅ Sem complexidade de P2P no browser
- ✅ Simples de implementar

**Contras:**
- ❌ Não é P2P de verdade
- ❌ Sempre depende do servidor

---

## 🚀 Recomendação: Híbrido (Opção 1 + Opção 4)

### Implementação Progressiva

**Fase 1: API REST (Funcional Imediato)**
1. Usar `P2PAPIClient` com WebSocket para real-time
2. UI funciona 100%, sem erros de build
3. Backend P2P já está funcionando

**Fase 2: Lazy Load P2P (Melhor quando possível)**
1. Implementar dynamic import do `p2p-client.ts`
2. Se carregar: usa P2P direto
3. Se falhar: fallback para API REST

```typescript
// useP2P.ts - HÍBRIDO
export function useP2P() {
  const [mode, setMode] = useState<'api' | 'p2p' | 'loading'>('loading')
  
  useEffect(() => {
    // Tenta carregar P2P
    import('./p2p-client')
      .then(() => setMode('p2p'))
      .catch(() => setMode('api'))  // Fallback
  }, [])
  
  if (mode === 'p2p') {
    return useP2PDirect()  // usa libp2p
  } else {
    return useP2PAPI()  // usa REST API
  }
}
```

---

## 📋 Próximos Passos

### Imediato (Desbloquear Testes)
1. ✅ **Implementar P2PAPIClient** (WebSocket simples)
2. ✅ **Modificar useP2P para usar API**
3. ✅ **Testar UI funciona**
4. ✅ **Validar propagação de mensagens**

### Médio Prazo (Otimizar)
5. Implementar lazy loading do p2p-client
6. Adicionar feature flag: `NEXT_PUBLIC_ENABLE_BROWSER_P2P`
7. Testar em diferentes browsers

### Longo Prazo (Polir)
8. Implementar WebRTC DataChannel para browser-to-browser
9. Otimizar bundle size
10. Adicionar métricas de performance

---

## 🛠️ Implementação Imediata

Vou criar **P2PAPIClient** agora para desbloquear os testes:

### Arquivo: `frontend/src/lib/p2p-api-client.ts`

```typescript
/**
 * Cliente P2P via API REST (Fallback para Next.js)
 * Usa WebSocket para real-time e HTTP para publicação
 */
export class P2PAPIClient {
  constructor(apiUrl = 'http://localhost:8080') {
    this.apiUrl = apiUrl
    this.ws = null
    this.handlers = new Map()
  }
  
  async initialize() {
    // Conecta WebSocket para receber mensagens
    this.ws = new WebSocket(`ws://localhost:8080/api/p2p/subscribe`)
    this.ws.onmessage = (event) => this.handleMessage(JSON.parse(event.data))
  }
  
  async publishProposal(proposal) {
    return fetch(`${this.apiUrl}/api/p2p/publish/proposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposal)
    })
  }
  
  subscribe(topic, handler) {
    this.handlers.set(topic, handler)
    return () => this.handlers.delete(topic)
  }
  
  handleMessage(message) {
    const handler = this.handlers.get(message.topic)
    if (handler) handler(message.data)
  }
}
```

**Vantagens:**
- ✅ Funciona AGORA
- ✅ Sem problemas de webpack
- ✅ UI pode ser testada
- ✅ Backend P2P já funciona

**Próximo commit:** Implementar P2PAPIClient e atualizar useP2P

---

## 📊 Status

- ✅ Backend P2P funcionando
- ✅ API REST endpoints testados
- ❌ Frontend P2P com libp2p (bloqueado por webpack)
- ⏳ Frontend P2P via API (próximo passo)

**Decisão:** Implementar solução híbrida para desbloquear testes imediatamente.
