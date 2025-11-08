# 🚀 Teste Rápido P2P - Browser ↔ Backend

## ✅ Pré-requisitos (COMPLETO)

- [x] Backend rodando: http://localhost:8080
- [x] Frontend rodando: http://localhost:3001
- [x] Componente P2PStatus adicionado à página principal

---

## 📋 Teste 1: Visualizar Componente P2P

### Passos:
1. Abrir http://localhost:3001 no browser
2. Scroll down até encontrar o card **"Rede P2P"**
3. Observar status de conexão

### ✅ Resultado Esperado:
- Card "Rede P2P" visível abaixo de "Voting Stats"
- Indicador de status:
  - 🟡 "Conectando..." (primeiros segundos)
  - 🟢 "Conectado" (após inicializar)
- Grid mostrando: Peers, Mensagens, Propostas, Votos

### ❌ Se falhar:
```bash
# Verificar console do browser (F12)
# Procurar por mensagens do P2PClient:
# - "🚀 Initializing P2P client..."
# - "✅ P2P client initialized"
```

---

## 📋 Teste 2: Verificar Conexão Backend

### Passos:
1. Abrir DevTools (F12) → Console
2. Procurar mensagens de log:
   ```
   🚀 Initializing P2P client...
   📡 Fetching gateway address from API...
   ✅ Gateway address: /ip4/127.0.0.1/tcp/56674/ws/p2p/12D3KooW...
   🔗 Connecting to gateway: /ip4/127.0.0.1/tcp/56674/ws/p2p/12D3KooW...
   ✅ Connected to gateway!
   ```

3. Verificar no terminal do backend novas linhas:
   ```
   🔗 New peer connected: 12D3KooW... (browser)
   ```

### ✅ Resultado Esperado:
- Browser conectou ao gateway WebSocket
- Backend detectou novo peer
- Card P2P mostra "Peers: 1"

### ❌ Se falhar:
```bash
# Terminal do backend
curl http://localhost:8080/api/p2p/status | jq '.data.peers'

# Deve mostrar:
# { "total": 1, "connected": 1, "list": ["12D3KooW..."] }

# Se total = 0, verificar firewall ou porta WebSocket
```

---

## 📋 Teste 3: Publicar Proposta via Console

### Passos:
1. No console do browser (F12), executar:
```javascript
// Acessar o cliente P2P do componente
const testProposal = {
  id: 'test-console-' + Date.now(),
  title: 'Proposta de Teste via Console',
  description: 'Testando publicação P2P',
  proposer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  timestamp: Date.now()
}

// Se o componente estiver montado, pode usar:
// window.p2pClient.publishProposal(testProposal)

// Ou criar uma função helper na página
console.log('📝 Enviando proposta...', testProposal)
```

2. Observar console do browser
3. Observar terminal do backend

### ✅ Resultado Esperado:

**Browser Console:**
```
📝 Publishing proposal: test-console-...
✅ Proposal published successfully
```

**Backend Terminal:**
```
📝 Received proposal message
   Proposal: test-console-... - Proposta de Teste via Console
```

**UI (Card P2P):**
- "Mensagens" incrementa de 0 → 1
- "Propostas" incrementa de 0 → 1
- Seção "Mensagens Recentes" mostra proposta (se detalhes expandidos)

---

## 📋 Teste 4: Verificar Métricas API

### Passos:
```bash
# Terminal
curl -s http://localhost:8080/api/p2p/metrics | jq .
```

### ✅ Resultado Esperado:
```json
{
  "success": true,
  "metrics": {
    "uptime": 214051,
    "messagesReceived": 1,
    "messagesSent": 0,
    "proposalsProcessed": 1,
    "votesProcessed": 0,
    "peersDiscovered": 2
  }
}
```

**Verificar:**
- `messagesReceived` > 0
- `proposalsProcessed` > 0
- `peersDiscovered` >= 2 (backend IPFS + browser)

---

## 📋 Teste 5: Clique nos Botões do UI

### Passos:
1. No card P2P, clicar **"▶ Detalhes"**
2. Verificar seções expandidas:
   - ✅ "Seu Peer ID" (completo)
   - ✅ Botão "📋 Copiar" funciona
   - ✅ "Métricas de Rede" mostra contadores
   - ✅ "Mensagens Recentes" (se houver mensagens)

3. Clicar **"Desconectar"**
4. Observar:
   - Status muda para 🔴 "Desconectado"
   - Peers volta para 0

5. Clicar **"Conectar"**
6. Observar:
   - Status muda para 🟡 "Conectando..."
   - Depois muda para 🟢 "Conectado"
   - Peers volta para 1

---

## 🎯 Resumo: Teste Passou?

### Checklist Mínimo:
- [ ] Card P2P renderizou na página
- [ ] Status conectou (🟢 "Conectado")
- [ ] Peer count = 1
- [ ] Console mostra logs de inicialização
- [ ] Backend detectou peer do browser
- [ ] Métricas da API incrementam

### Se TUDO passou:
✅ **P2P Stack funcionando!** 

**Próximo passo:** Integrar com componentes CreateProposal e Vote

### Se FALHOU:
❌ Abrir issue com:
- Screenshots do console do browser
- Logs do terminal backend
- Output de `curl http://localhost:8080/api/p2p/status`

---

## 🐛 Troubleshooting Rápido

### Problema: "Failed to initialize P2P client"
**Solução:**
```bash
# Verificar dependências instaladas
cd frontend
npm ls libp2p helia @chainsafe/libp2p-gossipsub

# Se faltando, instalar:
npm install libp2p helia @chainsafe/libp2p-gossipsub \
  @libp2p/websockets @chainsafe/libp2p-noise \
  @chainsafe/libp2p-yamux @libp2p/identify
```

### Problema: "No WebSocket address found"
**Solução:**
```bash
# Backend não está expondo WebSocket
# Verificar logs do backend ao iniciar:
# Deve mostrar: "Listening on /ip4/127.0.0.1/tcp/XXXX/ws"

# Reiniciar backend:
cd helia-gateway
npm start
```

### Problema: Card P2P não aparece
**Solução:**
```javascript
// Verificar se componente foi importado corretamente
// frontend/src/app/page.tsx deve ter:
import P2PStatus from '@/components/P2PStatus';

// E no JSX:
<div className="mb-8">
  <P2PStatus />
</div>
```

### Problema: "Conectando..." infinito
**Solução:**
- Verificar firewall não está bloqueando porta WebSocket
- Verificar se backend está rodando
- Verificar se porta 8080 responde: `curl http://localhost:8080/health`
- Reiniciar browser e limpar cache

---

## 📊 Logs Esperados

### Browser Console (sucesso):
```
🚀 Initializing P2P client...
📡 Fetching gateway address from API...
✅ Gateway address: /ip4/127.0.0.1/tcp/56674/ws/p2p/12D3KooWNAGjdRyYwPxjN6Z9ndULqxXkzvGbmGLr5AQR4Xnvab8S
🔗 Connecting to gateway: /ip4/127.0.0.1/tcp/56674/ws/p2p/12D3KooWNAGjdRyYwPxjN6Z9ndULqxXkzvGbmGLr5AQR4Xnvab8S
✅ Connected to gateway!
📡 Subscribed to all topics
✅ P2P client initialized
   Peer ID: 12D3KooW...
```

### Backend Terminal (sucesso):
```
[P2PNodeManager] New peer connected: 12D3KooW... (browser)
[P2PNodeManager] Total peers: 1
```

---

## ⏭️ Próximos Testes

Após este teste básico passar:
1. ✅ **Teste Cross-Tab** - Abrir 2 abas, verificar comunicação
2. ✅ **Teste Stress** - Publicar 100 mensagens seguidas
3. ✅ **Teste Integração** - Criar proposta real via UI e verificar propagação P2P

**Documentação completa:** `tests/p2p-connectivity.test.md`
