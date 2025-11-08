# Custom Connect Button - Menu de Conexão Melhorado

## 🎯 Visão Geral

O **CustomConnectButton** é uma versão melhorada do botão de conexão padrão do RainbowKit, com funcionalidades expandidas para suporte multi-chain e visualização de recursos de segurança.

## ✨ Funcionalidades

### 1. **Estado Desconectado**
Quando o usuário não está conectado:
- Botão gradiente atrativo (azul → roxo)
- Ícone de carteira
- Texto "Conectar Carteira"
- Efeito hover com escala e sombra
- Abre modal padrão do RainbowKit

### 2. **Estado Conectado - Botão Principal**
Quando conectado, o botão mostra:

#### **Indicador de Chain**
- Ponto pulsante colorido na cor da chain
- Nome curto da chain (ETH, MATIC, BNB, etc.)
- Borde esquerdo colorido (4px)

#### **Endereço da Carteira**
- Formato truncado: `0x1234...5678`
- Ícone de carteira
- Fonte monospace para clareza

#### **Separador Visual**
- Linha vertical entre chain e endereço

#### **Ícone Dropdown**
- Chevron que rotaciona quando menu abre

### 3. **Menu Dropdown Expandido**

#### **🟢 Seção de Status (Topo)**
- Badge "Conectado" com ícone de check verde
- Badge "Testnet" se aplicável (amarelo com ⚠️)
- Endereço completo da carteira
- Botão de copiar endereço
- Background gradiente verde claro

#### **🌐 Seção de Rede**
- Ícone da rede colorido em caixa
- Nome completo da chain
- Chain ID
- Símbolo da moeda nativa
- Badge "EIP-1559 ✓" se suportado
- **Botão "Trocar de Rede"**
  - Expande ChainSelector integrado
  - Permite trocar de rede sem fechar menu

#### **🌍 Seção Multi-Chain**
- Emoji de globo 🌐
- Destaque: "19 redes blockchain"
- Lista de exemplos: Ethereum, Polygon, BSC, etc.
- Background azul claro

#### **🔒 Seção de Recursos de Segurança**
- Lista com indicadores visuais (pontos verdes)
- Prova de Vida ativa
- Multi-Wallet (até 5 carteiras)
- Detecção de fraude em tempo real
- Token SOB vinculado

#### **🚪 Seção de Ações (Rodapé)**
- Botão "Desconectar Carteira" (vermelho)
- Ícone de logout
- Hover effect vermelho claro

## 🎨 Design System

### Cores por Estado
```tsx
// Conectado - Verde
from-green-50 to-emerald-50 (light)
from-green-900/20 to-emerald-900/20 (dark)

// Testnet - Amarelo
bg-yellow-100 dark:bg-yellow-900/30
text-yellow-800 dark:text-yellow-200

// Info - Azul
bg-blue-50/50 dark:bg-blue-900/10

// Perigo - Vermelho
text-red-600 dark:text-red-400
hover:bg-red-50 dark:hover:bg-red-900/20
```

### Bordas e Sombras
```tsx
// Botão principal
border-2 border-gray-200 dark:border-gray-700
border-left: 4px solid {chainColor}

// Menu dropdown
border border-gray-200 dark:border-gray-700
shadow-xl
```

### Transições
```tsx
// Rotação do chevron
transform rotate-180
transition-transform

// Hover effects
transition-all duration-200
transform hover:scale-105
```

## 📝 Uso

### Importar e Usar
```tsx
import { CustomConnectButton } from '@/components/CustomConnectButton';

export default function MyPage() {
  return (
    <header>
      <CustomConnectButton />
    </header>
  );
}
```

### Substituir ConnectButton Padrão
```tsx
// Antes
import { ConnectButton } from '@rainbow-me/rainbowkit';
<ConnectButton />

// Depois
import { CustomConnectButton } from '@/components/CustomConnectButton';
<CustomConnectButton />
```

## 🔧 Componentes Internos Usados

### 1. **ChainSelector (Integrado)**
```tsx
{showChainSelector && (
  <div className="mt-3">
    <ChainSelector compact={true} />
  </div>
)}
```

### 2. **Hooks do Wagmi**
```tsx
const { address, isConnected } = useAccount();
const { disconnect } = useDisconnect();
const chainId = useChainId();
```

### 3. **Funções de Chain Config**
```tsx
const metadata = getChainMetadata(chainId);
const chainColor = getChainColor(chainId);
const chainName = getChainName(chainId);
const isTestnetChain = isTestnet(chainId);
```

### 4. **ConnectButton.Custom (RainbowKit)**
```tsx
<ConnectButton.Custom>
  {({ openConnectModal }) => (
    <button onClick={openConnectModal}>
      Conectar Carteira
    </button>
  )}
</ConnectButton.Custom>
```

## 💡 Funcionalidades Especiais

### 1. **Cópia de Endereço**
```tsx
const copyAddress = () => {
  if (address) {
    navigator.clipboard.writeText(address);
  }
};
```

### 2. **Formatação de Endereço**
```tsx
const formatAddress = (addr: string) => {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};
// Resultado: 0x1234...5678
```

### 3. **Toggle do ChainSelector**
```tsx
const [showChainSelector, setShowChainSelector] = useState(false);

<button onClick={() => setShowChainSelector(!showChainSelector)}>
  Trocar de Rede
</button>
```

### 4. **Backdrop para Fechar Menu**
```tsx
{isMenuOpen && (
  <div 
    className="fixed inset-0 z-40" 
    onClick={() => setIsMenuOpen(false)}
  />
)}
```

## 📊 Informações Exibidas

### Estado Desconectado
| Elemento | Valor |
|----------|-------|
| Texto | "Conectar Carteira" |
| Ícone | Wallet |
| Ação | Abrir modal RainbowKit |

### Estado Conectado - Botão
| Elemento | Valor | Exemplo |
|----------|-------|---------|
| Chain | Nome curto | ETH, MATIC, BNB |
| Endereço | Truncado | 0x1234...5678 |
| Cor | Da chain | #627EEA (Ethereum) |

### Estado Conectado - Menu
| Seção | Informações |
|-------|-------------|
| Status | Conectado, Endereço completo, Testnet? |
| Rede | Nome, ID, Moeda, EIP-1559, Botão trocar |
| Multi-Chain | 19 redes, Lista de exemplos |
| Segurança | 4 recursos ativos |
| Ação | Desconectar |

## 🎯 Vantagens Sobre ConnectButton Padrão

### 1. **Informações de Contexto**
- ✅ Mostra chain atual sempre visível
- ✅ Indicador visual colorido por chain
- ✅ Badge testnet quando aplicável

### 2. **Funcionalidade Expandida**
- ✅ Trocar de rede sem sair do menu
- ✅ Copiar endereço com um clique
- ✅ Ver recursos de segurança ativos

### 3. **Educação do Usuário**
- ✅ Explica suporte multi-chain (19 redes)
- ✅ Lista recursos de segurança disponíveis
- ✅ Mostra informações técnicas (Chain ID, EIP-1559)

### 4. **UX Melhorada**
- ✅ Feedback visual rico
- ✅ Animações suaves
- ✅ Dark mode completo
- ✅ Layout responsivo

## 🔄 Fluxo de Interação

```
1. Usuário vê botão "Conectar Carteira"
   ↓
2. Clica e abre modal RainbowKit
   ↓
3. Conecta carteira (MetaMask, WalletConnect, etc.)
   ↓
4. Botão muda para mostrar Chain + Endereço
   ↓
5. Usuário clica no botão conectado
   ↓
6. Menu dropdown abre com todas informações
   ↓
7. Opções disponíveis:
   - Copiar endereço
   - Trocar de rede
   - Ver recursos de segurança
   - Desconectar
```

## 🎨 Customização

### Cores do Gradiente (Botão Desconectado)
```tsx
// Alterar cores
className="bg-gradient-to-r from-blue-600 to-purple-600 
           hover:from-blue-700 hover:to-purple-700"

// Exemplo alternativo: Verde
className="bg-gradient-to-r from-green-600 to-emerald-600 
           hover:from-green-700 hover:to-emerald-700"
```

### Tamanho do Menu
```tsx
// Alterar largura
className="w-80" // Padrão

// Opções
className="w-64"  // Mais estreito
className="w-96"  // Mais largo
```

### Recursos de Segurança
```tsx
// Adicionar novo recurso
<div className="flex items-center gap-2 text-xs">
  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
  <span>Seu novo recurso aqui</span>
</div>
```

## 📱 Responsividade

O componente é totalmente responsivo:
- **Desktop**: Menu completo com 320px de largura
- **Tablet**: Mantém funcionalidade completa
- **Mobile**: Pode ajustar largura com `max-w-[calc(100vw-2rem)]`

## 🚀 Performance

- ✅ Lazy loading do ChainSelector (só renderiza quando aberto)
- ✅ Uso de backdrop para fechar (ao invés de listeners globais)
- ✅ Componentes leves (sem dependências pesadas)
- ✅ CSS classes otimizadas do Tailwind

## 🔒 Segurança

- ✅ Não armazena private keys
- ✅ Usa hooks seguros do wagmi
- ✅ Clipboard API nativa do browser
- ✅ Integração com RainbowKit (auditado)

## 📚 Dependências

```json
{
  "@rainbow-me/rainbowkit": "^2.2.9",
  "wagmi": "^2.19.2",
  "lucide-react": "^0.552.0"
}
```

## 🎯 Próximas Melhorias

- [ ] Toast de confirmação ao copiar endereço
- [ ] Histórico de chains recentemente usadas
- [ ] Balance da moeda nativa exibido
- [ ] Link para explorador de blockchain
- [ ] QR code do endereço
- [ ] Modo apenas leitura (view-only)

---

**Desenvolvido para**: Revolução Cibernética  
**Última atualização**: 2024  
**Compatibilidade**: React 18+, Next.js 15+, RainbowKit 2+
