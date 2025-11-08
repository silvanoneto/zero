# 🔗 Guia de Persistência da Carteira

## Problema Resolvido

A conexão da carteira agora deve persistir após recarregar a página graças às seguintes melhorias:

### ✅ Mudanças Implementadas

1. **Storage Persistente** (`providers.tsx`)
   - Adicionado `createStorage` com `localStorage`
   - Configurado fallback para `cookieStorage` em SSR
   - Estado da carteira agora é salvo localmente

2. **Reconexão Automática** (`WalletPersistence.tsx`)
   - Componente que monitora estado da conexão
   - Tenta reconectar automaticamente após reload
   - Logs de debug em modo desenvolvimento

3. **QueryClient Otimizado**
   - Cache de 24 horas para queries
   - Modo offline-first
   - Sem refetch automático ao focar janela

4. **WagmiProvider Configurado**
   - `reconnectOnMount={true}` habilitado
   - Cadeia inicial definida (`hardhat` para dev)

## 🧪 Como Testar

### 1. Limpar Estado Anterior (Primeira Vez)
```javascript
// No console do navegador (F12):
localStorage.clear();
location.reload();
```

### 2. Conectar Carteira
1. Clique no botão "Connect Wallet"
2. Selecione sua carteira (MetaMask, WalletConnect, etc.)
3. Aprove a conexão
4. Verifique se o endereço aparece

### 3. Recarregar Página
1. Pressione F5 ou Cmd+R (Mac)
2. Aguarde 1-2 segundos
3. A carteira deve reconectar automaticamente
4. ✅ Endereço deve aparecer novamente

## 🔍 Debug: Se Ainda Não Funcionar

### Verificar localStorage
```javascript
// No console do navegador:
console.log('Wagmi State:', localStorage.getItem('wagmi.store'));
console.log('WalletConnect:', localStorage.getItem('wc@2:client'));
console.log('All Keys:', Object.keys(localStorage));
```

### Verificar Logs
Abra o console (F12) e procure por:
```
🔗 Wallet State: { isConnected: true, isReconnecting: false, ... }
```

### Possíveis Causas de Falha

#### 1. **localStorage Desabilitado**
Alguns navegadores/extensões bloqueiam localStorage em modo privado.

**Solução:**
- Use modo normal (não privado/anônimo)
- Desabilite extensões de privacidade temporariamente

#### 2. **Service Worker Conflitante**
Service workers antigos podem interferir.

**Solução:**
```javascript
// No console:
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
  location.reload();
});
```

#### 3. **Cache do Navegador**
Cache antigo pode conter versão bugada.

**Solução:**
- Pressione Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows/Linux)
- Ou vá em: Ferramentas → Limpar Dados de Navegação → Imagens e Arquivos em Cache

#### 4. **Conflito de Domínio**
Se estiver usando `localhost` E `revolucao-cibernetica.local`, o localStorage pode não ser compartilhado.

**Solução:**
- Use sempre o mesmo domínio
- Ou limpe localStorage em ambos

#### 5. **Erro de Rede P2P**
Se o backend P2P não estiver respondendo, a reconexão pode falhar silenciosamente.

**Solução:**
```bash
# Verificar se o backend está rodando:
docker ps | grep helia-gateway
docker logs constituicao-helia-gateway --tail 50
```

## 🛠️ Diagnóstico Avançado

### Script de Debug Completo
Cole no console do navegador:

```javascript
// 1. Estado do Wagmi
console.group('🔗 Wagmi State');
const wagmiState = localStorage.getItem('wagmi.store');
if (wagmiState) {
  try {
    console.log(JSON.parse(wagmiState));
  } catch (e) {
    console.error('Failed to parse:', wagmiState);
  }
} else {
  console.warn('No wagmi.store found');
}
console.groupEnd();

// 2. Estado do WalletConnect
console.group('🌐 WalletConnect State');
Object.keys(localStorage)
  .filter(key => key.startsWith('wc@2:'))
  .forEach(key => {
    console.log(key, localStorage.getItem(key));
  });
console.groupEnd();

// 3. Service Workers
console.group('⚙️ Service Workers');
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Active:', regs.length);
  regs.forEach(reg => console.log(reg));
});
console.groupEnd();

// 4. Network State
console.group('📡 Network');
console.log('Online:', navigator.onLine);
console.log('Connection:', navigator.connection);
console.groupEnd();
```

### Forçar Reconexão Manual
```javascript
// No console, após a página carregar:
window.wagmi.reconnect();
```

## 📝 Notas Técnicas

### Por que pode não funcionar imediatamente?

1. **Cache do navegador** contém versão antiga sem persistência
2. **Service worker** ativo está servindo arquivos antigos
3. **localStorage** não foi populado ainda (primeira conexão)
4. **Timing** - reconexão pode levar 1-2 segundos

### O que acontece no reload?

```
1. Página carrega
2. WagmiProvider inicializa com storage
3. WalletPersistence monta
4. Verifica se há conexão no localStorage
5. Se encontrar, tenta reconectar (100ms delay)
6. Carteira restaura conexão automaticamente
```

### Limitações Conhecidas

- **WalletConnect** pode pedir nova assinatura se a sessão expirou (padrão: 7 dias)
- **MetaMask** pode pedir confirmação se o site não está nos "Connected Sites"
- **Mobile wallets** podem desconectar se o app for fechado

## 🚀 Melhorias Futuras

Possíveis adições se o problema persistir:

1. **Session Restore Toast**
   ```tsx
   if (isReconnecting) {
     return <Toast>Reconectando carteira...</Toast>
   }
   ```

2. **Reconnect Button**
   ```tsx
   if (!isConnected && wasConnected) {
     return <Button onClick={reconnect}>Reconectar</Button>
   }
   ```

3. **Persistent Connection Modal**
   ```tsx
   <RainbowKitProvider 
     reconnectOnMount
     autoConnect
     persistRecentConnectors
   />
   ```

## 📞 Suporte

Se o problema persistir após todas essas verificações:

1. Abra uma issue no GitHub com:
   - Output do script de debug
   - Logs do console (F12)
   - Carteira usada
   - Browser/versão
   - Passos para reproduzir

2. Ou tente carteira diferente para isolar o problema:
   - MetaMask geralmente funciona melhor
   - WalletConnect requer app mobile aberto
   - Coinbase Wallet tem seu próprio storage
