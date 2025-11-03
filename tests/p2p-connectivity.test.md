# Testes de Conectividade P2P

## Setup

1. **Terminal 1 - Backend (Helia Gateway)**
```bash
cd helia-gateway
npm start
```

Aguardar mensagens:
- ✅ `libp2p initialized`
- ✅ `PeerID: 12D3KooW...`
- ✅ `P2P Node Manager initialized`
- ✅ `Server running on port 8080`

2. **Terminal 2 - Frontend (React)**
```bash
cd frontend
npm run dev
```

Aguardar: `Local: http://localhost:5173/`

3. **Browser**
- Abrir `http://localhost:5173`
- Abrir DevTools (Console)

---

## Checklist de Testes

### 1. Inicialização do Cliente P2P

**Objetivo:** Verificar que o cliente P2P no browser inicializa corretamente

**Passos:**
1. Abrir página com componente P2PStatus
2. Observar console do browser

**Esperado:**
```
[P2PClient] Initializing browser P2P node...
[P2PClient] WebSocket address: /ip4/127.0.0.1/tcp/8080/ws
[P2PClient] PeerID: 12D3KooW...
[P2PClient] Multiaddrs: [...]
[P2PClient] P2P Client initialized successfully
```

**Status:** [ ]

---

### 2. Conexão WebSocket Backend ↔ Frontend

**Objetivo:** Verificar conexão WebSocket entre browser e servidor

**Passos:**
1. No console do browser, verificar mensagens de conexão
2. No terminal do backend, verificar logs de novo peer

**Esperado no Browser:**
```
[P2PClient] Connected to peer: 12D3KooW... (servidor)
```

**Esperado no Backend:**
```
[P2PNodeManager] New peer connected: 12D3KooW... (browser)
```

**Status:** [ ]

---

### 3. Teste Manual - Publicar Proposta

**Objetivo:** Testar publicação de proposta do browser para rede

**Passos:**
```bash
# No console do browser
const { publishProposal } = useP2P()
await publishProposal({
  id: 'test-1',
  title: 'Proposta de Teste P2P',
  proposer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  timestamp: Date.now()
})
```

**Esperado no Browser:**
```
[P2PClient] Publishing proposal: test-1
[P2PClient] Proposal published successfully
```

**Esperado no Backend:**
```
[P2PNodeManager] Received proposal message
[P2PNodeManager] Proposal: test-1 - Proposta de Teste P2P
```

**Status:** [ ]

---

### 4. Teste Manual - Publicar Voto

**Objetivo:** Testar publicação de voto do browser para rede

**Passos:**
```bash
# No console do browser
const { publishVote } = useP2P()
await publishVote({
  proposalId: 'test-1',
  voter: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  vote: true,
  timestamp: Date.now()
})
```

**Esperado no Browser:**
```
[P2PClient] Publishing vote for proposal: test-1
[P2PClient] Vote published successfully
```

**Esperado no Backend:**
```
[P2PNodeManager] Received vote message
[P2PNodeManager] Vote on test-1: true
```

**Status:** [ ]

---

### 5. Teste API - Status P2P

**Objetivo:** Verificar API REST retorna peers conectados

**Passos:**
```bash
curl http://localhost:8080/api/p2p/status
```

**Esperado:**
```json
{
  "success": true,
  "data": {
    "status": "online",
    "peerId": "12D3KooW...",
    "peers": {
      "total": 1,
      "list": ["12D3KooW..."]
    },
    "services": {
      "helia": "enabled",
      "dht": "enabled",
      "pubsub": "enabled"
    }
  }
}
```

**Status:** [ ]

---

### 6. Teste API - Métricas

**Objetivo:** Verificar métricas refletem mensagens enviadas

**Passos:**
1. Publicar 1 proposta e 1 voto (testes 3 e 4)
2. Aguardar 2 segundos
3. Consultar métricas

```bash
curl http://localhost:8080/api/p2p/metrics
```

**Esperado:**
```json
{
  "success": true,
  "metrics": {
    "uptime": "...",
    "messagesReceived": 2,
    "messagesSent": 0,
    "proposalsProcessed": 1,
    "votesProcessed": 1,
    "peersDiscovered": 2
  }
}
```

**Status:** [ ]

---

### 7. Teste UI - Componente P2PStatus

**Objetivo:** Verificar que componente renderiza status corretamente

**Checklist:**
- [ ] Bolinha verde "Conectado" visível
- [ ] Peer count = 1 (backend)
- [ ] Mensagens recebidas incrementam ao publicar
- [ ] Propostas recebidas incrementam
- [ ] Votos recebidos incrementam
- [ ] Peer ID do browser exibido
- [ ] Botão "Copiar" peer ID funciona
- [ ] Seção "Mensagens Recentes" atualiza em tempo real
- [ ] Detalhes expandem/colapsam ao clicar

**Status:** [ ]

---

### 8. Teste Stress - Múltiplas Mensagens

**Objetivo:** Verificar rede P2P aguenta carga

**Passos:**
```javascript
// No console do browser
const { publishProposal } = useP2P()

for (let i = 0; i < 100; i++) {
  await publishProposal({
    id: `stress-${i}`,
    title: `Proposta Stress Test ${i}`,
    proposer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    timestamp: Date.now()
  })
}
```

**Esperado:**
- [ ] 100 mensagens publicadas sem erros
- [ ] Backend logs mostram 100 propostas recebidas
- [ ] Métricas: proposalsProcessed = 100
- [ ] UI não congela
- [ ] "Mensagens Recentes" atualiza dinamicamente

**Status:** [ ]

---

### 9. Teste Reconexão

**Objetivo:** Verificar resiliência da conexão P2P

**Passos:**
1. Clicar "Desconectar" no componente P2PStatus
2. Aguardar 2 segundos
3. Clicar "Conectar"

**Esperado:**
- [ ] Desconexão limpa (sem erros)
- [ ] Peer count volta a 0 no backend
- [ ] Reconexão bem-sucedida
- [ ] Peer count volta a 1 no backend
- [ ] Funcionalidades de publicação funcionam novamente

**Status:** [ ]

---

### 10. Teste Cross-Tab

**Objetivo:** Verificar comunicação entre múltiplas abas do browser

**Passos:**
1. Abrir `http://localhost:5173` em 2 abas
2. Na Aba 1, publicar proposta
3. Observar Aba 2

**Esperado:**
- [ ] Aba 1: Mensagem publicada com sucesso
- [ ] Aba 2: "Mensagens Recentes" mostra proposta da Aba 1
- [ ] Backend: 2 peers conectados
- [ ] API /api/p2p/status: `"total": 2`

**Status:** [ ]

---

## Troubleshooting

### Problema: "WebSocket connection failed"

**Possível Causa:** Backend não está rodando ou firewall bloqueando

**Solução:**
```bash
# Verificar backend rodando
lsof -i :8080

# Se porta ocupada, matar processo
lsof -ti:8080 | xargs kill -9

# Reiniciar backend
cd helia-gateway && npm start
```

---

### Problema: "No peers available to publish"

**Possível Causa:** Cliente browser não conectou ao backend

**Solução:**
1. Verificar logs do browser - deve mostrar "Connected to peer"
2. Verificar logs do backend - deve mostrar "New peer connected"
3. Verificar WebSocket address no código: `ws://localhost:8080/ws`
4. Aguardar 5-10 segundos após inicialização

---

### Problema: Métricas não incrementam

**Possível Causa:** Handlers de mensagens não registrados

**Solução:**
1. Verificar backend: `node-manager.js` chama `subscribeToTopic()` para cada tópico
2. Verificar browser: `p2p-client.ts` subscreve tópicos em `initialize()`
3. Verificar nomes dos tópicos match: `PUBSUB_TOPICS.PROPOSALS` deve ser igual no cliente e servidor

---

## Resumo de Sucesso

Teste passou se **TODOS** os itens abaixo forem ✅:

- [ ] 1. Cliente P2P inicializa no browser
- [ ] 2. WebSocket conecta backend ↔ frontend
- [ ] 3. Proposta publicada com sucesso
- [ ] 4. Voto publicado com sucesso
- [ ] 5. API /status retorna peers conectados
- [ ] 6. Métricas refletem mensagens enviadas
- [ ] 7. UI P2PStatus renderiza corretamente
- [ ] 8. Stress test 100 mensagens sem falhas
- [ ] 9. Desconexão/reconexão funciona
- [ ] 10. Cross-tab communication funciona

---

## Próximos Passos Após Testes

1. ✅ Testes passaram → Integrar com CreateProposal component (Task 5)
2. ✅ Testes passaram → Integrar com Vote component (Task 6)
3. ❌ Testes falharam → Debug com logs detalhados, verificar troubleshooting acima

---

## Logs de Teste

### Data: _______________
### Tester: _______________

```
[Insira logs relevantes aqui]
```

**Resultado Geral:** [ ] PASSOU  [ ] FALHOU  [ ] PARCIAL

**Notas:**
```
[Observações, bugs encontrados, sugestões de melhoria]
```
