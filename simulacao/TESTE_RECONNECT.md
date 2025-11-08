# 🧪 Guia de Teste - Persistência de Carteira

## 🎯 O Problema

A conexão da carteira não estava sendo mantida após reload da página, mesmo com os dados salvos no localStorage.

## ✅ Solução Implementada

### 1. **WalletAutoReconnect** (NOVO)
- Componente adicional que força reconexão ao montar
- Verifica localStorage para evidências de conexão prévia
- Chama `reconnect()` do wagmi explicitamente
- Delay de 250ms para garantir que DOM está pronto

### 2. **Logs de Debug Melhorados**
- WalletPersistence: mostra estado inicial e mudanças
- CustomConnectButton: rastreia estados de conexão
- WalletAutoReconnect: mostra tentativas de reconexão

### 3. **Configuração Wagmi Aprimorada**
- `multiInjectedProviderDiscovery: true` - detecta múltiplos providers
- `reconnectOnMount: true` no WagmiProvider
- Storage key consistente

## 📝 Como Testar

### Teste 1: Reconexão com MetaMask

1. **Abra o console do navegador** (F12)
2. **Conecte sua MetaMask**
3. **Procure no console:**
   ```
   ✅ Wallet conectada e salva: { connector: 'injected', address: '0x...' }
   ```
4. **Recarregue a página** (F5)
5. **Observe no console:**
   ```
   🔌 WalletPersistence montado
   💾 Storage no mount: { hasWagmiStorage: true, ... }
   🔄 AutoReconnect: Verificando storage...
   🔄 AutoReconnect: Tentando reconectar...
   ✅ AutoReconnect: Reconexão iniciada
   🔗 Wallet State Update: { isConnected: true, ... }
   ```

### Teste 2: Verificar Botão de Conexão

1. **Conecte a carteira**
2. **Observe o botão**: deve mostrar `[Hardhat • 0x1234...5678]`
3. **Recarregue a página**
4. **Observe o botão**:
   - Primeiro: `[Reconectando... 🔄]` (0,5-2s)
   - Depois: `[Hardhat • 0x1234...5678]`

### Teste 3: Debug Tool

1. **Clique no ícone 🔍** (canto inferior direito)
2. **Verifique:**
   - Status: deve mostrar "connected" ou "reconnecting"
   - Wagmi Storage: deve ter dados (não vazio)
   - Was Connected: deve ser "true"
   - Last Connector: deve mostrar o connector usado

### Teste 4: Limpar e Reconectar

1. **Conecte a carteira**
2. **Abra o Debug Tool (🔍)**
3. **Clique em "Limpar Storage e Recarregar"**
4. **Página recarrega sem carteira**
5. **Conecte novamente**
6. **Recarregue a página**
7. **Deve reconectar automaticamente**

## 🔍 Logs Esperados

### No primeiro carregamento (sem conexão prévia):
```
🔌 WalletPersistence montado
💾 Storage no mount: { hasWagmiStorage: false, ... }
🔄 AutoReconnect: Verificando storage...
ℹ️ AutoReconnect: Sem dados de conexão prévia
```

### Após conectar:
```
✅ Wallet conectada e salva: { connector: 'injected', address: '0x1234...5678', status: 'connected' }
🔗 Wallet State Update: { isConnected: true, connector: 'injected', ... }
```

### No reload (com conexão prévia):
```
🔌 WalletPersistence montado
💾 Storage no mount: { hasWagmiStorage: true, wagmiStoragePreview: '{"state":{...' }
🔄 AutoReconnect: Verificando storage...
🔄 AutoReconnect: Tentando reconectar...
✅ AutoReconnect: Reconexão iniciada
🔘 CustomConnectButton state: { isConnected: false, isConnecting: false, wagmiIsReconnecting: true, ... }
🔘 CustomConnectButton state: { isConnected: true, isConnecting: false, wagmiIsReconnecting: false, ... }
🔗 Wallet State Update: { isConnected: true, connector: 'injected', address: '0x1234...5678', status: 'connected' }
```

## ❌ Troubleshooting

### Problema: Ainda não reconecta

**Soluções:**

1. **Limpe o cache do navegador**
   ```
   Chrome: Ctrl+Shift+Del → Limpar dados de cache
   ```

2. **Verifique o console** - procure por erros
   - Erros de provider não encontrado
   - Erros de permissão

3. **Teste com MetaMask**
   - Certifique-se que está desbloqueada
   - Tente desconectar e reconectar manualmente

4. **Use o Debug Tool**
   - Clique em 🔍
   - Verifique "Wagmi Storage" - deve ter dados
   - Clique em "Limpar Storage e Recarregar"
   - Reconecte manualmente
   - Teste novamente

### Problema: Botão mostra "Conectar" mas está conectado

Isso pode acontecer durante desenvolvimento se hot-reload ocorrer. Solução:
1. Recarregue a página manualmente (F5)
2. Ou desconecte e reconecte

### Problema: Console mostra muitos logs

Isso é normal em desenvolvimento. Os logs são apenas para debug e não aparecem em produção.

## 🚀 Próximos Passos

Se ainda não funcionar após estes testes:

1. **Abra uma issue** com:
   - Screenshot do console
   - Connector usado (MetaMask, WalletConnect, etc.)
   - Navegador e versão
   - Logs completos do console

2. **Teste alternativo**: use WalletConnect
   - Pode ter melhor suporte de reconexão
   - Mais estável cross-browser

3. **Fallback manual**: 
   - Se a auto-reconexão falhar
   - Pelo menos mostra "Reconectando..." ao invés de "Conectar"
   - Usuário entende que precisa clicar

## 📦 Arquivos Modificados

```
frontend/src/
├── app/
│   ├── layout.tsx                      # WalletAutoReconnect adicionado
│   └── providers.tsx                   # multiInjectedProviderDiscovery
├── components/
│   ├── CustomConnectButton.tsx         # Logs de debug
│   ├── WalletPersistence.tsx           # Logs melhorados
│   ├── WalletAutoReconnect.tsx         # NOVO - Força reconexão
│   └── WalletDebug.tsx                 # Ferramenta de debug
```

## ✨ Resultado Esperado

- ✅ Carteira reconecta automaticamente
- ✅ Botão mostra estado correto
- ✅ Feedback visual claro
- ✅ Logs detalhados para debug
- ✅ Ferramenta de debug disponível
