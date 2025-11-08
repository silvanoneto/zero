# 🚀 Quickstart - Frontend DAOMitosis

Guia rápido para colocar o sistema de mitose rodando localmente em **5 minutos**.

---

## ✅ Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Wallet (MetaMask, WalletConnect, etc.)
- Contrato DAOMitosis deployado (testnet ou local)

---

## 📦 1. Instalação

```bash
cd frontend

# Instalar dependências
npm install

# Ou com yarn
yarn install
```

---

## ⚙️ 2. Configuração

Crie o arquivo `.env.local`:

```bash
# Copiar template
cp .env.example .env.local

# Editar com seus valores
nano .env.local
```

Adicione estas variáveis:

```bash
# Endereço do contrato DAOMitosis
NEXT_PUBLIC_DAO_MITOSIS_ADDRESS=0x...

# Chain ID (opcional - default: 31337 para localhost)
NEXT_PUBLIC_CHAIN_ID=31337

# RPC URL (opcional)
NEXT_PUBLIC_RPC_URL=http://localhost:8545
```

---

## 🎯 3. Rodar Localmente

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🧪 4. Testar Componentes

Vá para a página de demonstração:

```
http://localhost:3000/dao-mitosis
```

**O que você verá:**
- ✅ Status da DAO com contador de membros
- 🗳️ Interface de votação para mitose
- 🌳 Árvore genealógica de DAOs
- 📊 Informações sobre segurança

---

## 🔗 5. Conectar Wallet

1. Clique em "Connect Wallet" no canto superior
2. Escolha sua wallet (MetaMask, WalletConnect, etc.)
3. Aprove a conexão
4. Seus componentes agora carregarão dados reais da blockchain

---

## 📝 6. Usar os Componentes

### Importar

```typescript
import { 
  DAOStatusCard, 
  MitosisVoting, 
  DAOGenealogyTree 
} from '@/components/DAOMitosis';
```

### Usar na sua página

```tsx
export default function MyPage() {
  const daoId = 1n; // ID da sua DAO
  const contractAddress = process.env.NEXT_PUBLIC_DAO_MITOSIS_ADDRESS as `0x${string}`;

  return (
    <div>
      <h1>Minha DAO</h1>
      
      {/* Status da DAO */}
      <DAOStatusCard 
        daoId={daoId}
        daoMitosisAddress={contractAddress}
      />
      
      {/* Votação de Mitose */}
      <MitosisVoting
        daoId={daoId}
        daoMitosisAddress={contractAddress}
      />
      
      {/* Árvore Genealógica */}
      <DAOGenealogyTree
        daoId={daoId}
        daoMitosisAddress={contractAddress}
      />
    </div>
  );
}
```

---

## 🛠️ 7. Desenvolvimento

### Estrutura dos Componentes

```
frontend/src/
├── app/
│   ├── dao-mitosis/
│   │   └── page.tsx          # Página de demonstração
│   └── layout.tsx             # Layout principal
├── components/
│   └── DAOMitosis/
│       ├── DAOStatusCard.tsx  # Card de status
│       ├── MitosisVoting.tsx  # Interface de votação
│       ├── DAOGenealogyTree.tsx # Árvore genealógica
│       ├── index.ts           # Exports
│       └── README.md          # Documentação
└── lib/
    └── wagmi.ts               # Configuração Web3
```

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar produção localmente
npm run start

# Linting
npm run lint

# Type checking
npm run type-check
```

---

## 🧪 8. Testar com Rede Local

### Se você tem Anvil/Hardhat rodando:

```bash
# Em outro terminal, rode o node local
cd ../contracts
make anvil  # ou npx hardhat node

# Deploy os contratos
make deploy-local

# Copie o endereço do DAOMitosis para .env.local
```

### Configure a wallet para rede local:

- **Network**: Localhost
- **RPC URL**: http://localhost:8545
- **Chain ID**: 31337
- **Currency**: ETH

---

## 📊 9. Dados de Teste

Para popular dados de teste:

```bash
cd ../contracts

# Criar DAO de teste com 450 membros
forge script script/CreateTestDAO.s.sol --rpc-url localhost

# Adicionar membros
forge script script/AddMembers.s.sol --rpc-url localhost

# Iniciar votação de mitose
forge script script/InitiateMitosis.s.sol --rpc-url localhost
```

---

## 🐛 Troubleshooting

### Problema: "Contract não encontrado"

**Solução:**
1. Verifique o endereço no `.env.local`
2. Confirme que está na rede correta
3. Verifique se o contrato foi deployado

### Problema: "Wallet não conecta"

**Solução:**
1. Limpe o cache da wallet
2. Verifique se a rede está configurada
3. Tente outra wallet

### Problema: "Componentes não carregam dados"

**Solução:**
1. Abra o console do navegador (F12)
2. Veja erros de RPC
3. Verifique se `daoId` existe
4. Confirme que está conectado à wallet

### Problema: "Erro de build"

**Solução:**
```bash
# Limpar cache
rm -rf .next
rm -rf node_modules

# Reinstalar
npm install

# Build novamente
npm run build
```

---

## 🚀 Deploy para Produção

### Vercel (Recomendado)

```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Configurar env vars no dashboard:
# - NEXT_PUBLIC_DAO_MITOSIS_ADDRESS
# - NEXT_PUBLIC_CHAIN_ID
```

### Outras plataformas

- **Netlify**: `npm run build && netlify deploy`
- **AWS Amplify**: Conecte o repositório
- **Railway**: Conecte via GitHub

---

## 📚 Recursos Adicionais

- **Documentação Completa**: [README.md](./src/components/DAOMitosis/README.md)
- **Smart Contracts**: [../contracts/README.md](../contracts/README.md)
- **Artigo 5º-C**: [ARTIGO_5C_IMPLEMENTATION.md](../contracts/ARTIGO_4B_IMPLEMENTATION.md)
- **Wagmi Docs**: https://wagmi.sh
- **Next.js Docs**: https://nextjs.org/docs

---

## 💡 Dicas

### Performance

- Use `React.memo()` para componentes que não mudam
- Implemente `useMemo()` para cálculos pesados
- Considere server components para dados estáticos

### UX

- Adicione skeleton loaders
- Mostre feedback de transações
- Implemente error boundaries

### Segurança

- Nunca commit `.env.local`
- Valide inputs do usuário
- Use HTTPS em produção

---

## ✅ Checklist de Produção

Antes de ir para produção:

- [ ] Contratos auditados
- [ ] Testes E2E passando
- [ ] Performance otimizada (Lighthouse > 90)
- [ ] SEO configurado
- [ ] Analytics implementado
- [ ] Error tracking (Sentry, etc.)
- [ ] Backup de dados
- [ ] Documentação completa
- [ ] Monitoramento configurado

---

## 🎉 Pronto!

Você agora tem um sistema completo de mitose rodando localmente.

**Próximos passos:**
1. Explore os componentes
2. Customize as cores/temas
3. Adicione suas próprias features
4. Deploy para produção

**Precisa de ajuda?**
- Abra uma issue no GitHub
- Consulte a documentação
- Veja os exemplos no código

---

**Construído com ❤️ para a Revolução Cibernética**
