# ⚡ Cheat Sheet - Comandos Rápidos

Referência rápida de comandos para desenvolvimento e deploy.

---

## 🔧 Setup Inicial

```bash
# Clone e setup
git clone https://github.com/seu-usuario/revolucao-cibernetica.git
cd revolucao-cibernetica

# Setup frontend
cd frontend
npm install
cp .env.example .env.local
# Edite .env.local com seus valores
npm run dev

# Setup contracts
cd ../contracts
forge install
make test
```

---

## 🧪 Testes

### Smart Contracts

```bash
cd contracts

# Todos os testes
make test

# Com verbosity
forge test -vvv

# Teste específico
forge test --match-test testMitosisBasicFlow

# Com coverage
forge coverage

# Com gas report
forge test --gas-report
```

### Frontend

```bash
cd frontend

# Linting
npm run lint

# Type checking
npm run type-check

# Build test
npm run build

# Rodar build localmente
npm run start
```

---

## 🚀 Desenvolvimento

### Blockchain Local

```bash
cd contracts

# Iniciar Anvil (terminal 1)
make anvil

# Deploy contratos (terminal 2)
make deploy-local

# Ver logs
forge script script/Deploy.s.sol --rpc-url localhost --broadcast -vvvv
```

### Frontend Dev Server

```bash
cd frontend

# Dev server com hot reload
npm run dev

# Dev server em porta específica
npm run dev -- -p 3001

# Dev server com logs detalhados
npm run dev -- --turbo
```

---

## 📝 Criar Dados de Teste

```bash
cd contracts

# Criar DAO de teste
forge script script/CreateTestDAO.s.sol --rpc-url localhost --broadcast

# Adicionar membros
forge script script/AddMembers.s.sol --rpc-url localhost --broadcast

# Iniciar votação
forge script script/InitiateMitosis.s.sol --rpc-url localhost --broadcast

# Executar mitose
forge script script/ExecuteMitosis.s.sol --rpc-url localhost --broadcast
```

---

## 🔍 Debugging

### Smart Contracts

```bash
# Debug transação específica
forge debug <tx_hash> --rpc-url localhost

# Trace de execução
forge run <tx_hash> --rpc-url localhost --trace

# Ver storage de contrato
cast storage <contract_address> --rpc-url localhost

# Ver código de contrato
cast code <contract_address> --rpc-url localhost
```

### Frontend

```bash
# Console do navegador
# Abra DevTools (F12) e veja:
# - Console para erros JS
# - Network para chamadas RPC
# - Application para localStorage

# Build com debug info
npm run build -- --debug

# Analyze bundle size
npm run analyze
```

---

## 📊 Consultas Blockchain

```bash
# Balance de uma conta
cast balance <address> --rpc-url localhost

# Ver transação
cast tx <tx_hash> --rpc-url localhost

# Ver block
cast block latest --rpc-url localhost

# Call read-only function
cast call <contract> "getDAO(uint256)" 1 --rpc-url localhost

# Send transaction
cast send <contract> "vote(uint256,uint8)" 1 0 --rpc-url localhost --private-key <key>
```

---

## 🌐 Deploy

### Testnet (Sepolia)

```bash
cd contracts

# Deploy
make deploy-sepolia

# Verify
forge verify-contract <address> DAOMitosis \
  --chain sepolia \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Configure frontend
cd ../frontend
# Adicione em .env.local:
# NEXT_PUBLIC_DAO_MITOSIS_ADDRESS=0x...
# NEXT_PUBLIC_CHAIN_ID=11155111
```

### Frontend (Vercel)

```bash
cd frontend

# Install CLI
npm i -g vercel

# Deploy preview
vercel

# Deploy production
vercel --prod

# Ver logs
vercel logs <deployment_url>

# Configurar env vars
vercel env add NEXT_PUBLIC_DAO_MITOSIS_ADDRESS
```

---

## 🛠️ Manutenção

### Git

```bash
# Criar feature branch
git checkout -b feature/nova-funcionalidade

# Commit seguindo padrão
git commit -m "feat: adiciona nova funcionalidade X"
# Tipos: feat, fix, docs, style, refactor, test, chore

# Push
git push origin feature/nova-funcionalidade

# Merge main
git checkout main
git pull
git merge feature/nova-funcionalidade
```

### Limpar Cache

```bash
# Frontend
cd frontend
rm -rf .next node_modules
npm install

# Contracts
cd contracts
forge clean
rm -rf cache out lib
forge install
```

### Atualizar Dependências

```bash
# Frontend
cd frontend
npm update
npm audit fix

# Contracts
cd contracts
forge update
```

---

## 📦 Build para Produção

### Frontend

```bash
cd frontend

# Build otimizado
npm run build

# Test build
npm run start

# Deploy
vercel --prod
```

### Contracts

```bash
cd contracts

# Build otimizado
forge build --optimize --optimizer-runs 200

# Verificar gas
forge test --gas-report

# Flatten para verificação
forge flatten src/DAOMitosis.sol > DAOMitosis_flat.sol
```

---

## 🔒 Segurança

### Audit Commands

```bash
# Slither analysis
slither src/DAOMitosis.sol

# Mythril analysis
myth analyze src/DAOMitosis.sol

# Echidna fuzzing
echidna-test src/DAOMitosis.sol --contract DAOMitosis
```

### Access Control

```bash
# Ver owner de contrato
cast call <contract> "owner()(address)" --rpc-url localhost

# Transferir ownership
cast send <contract> "transferOwnership(address)" <new_owner> \
  --rpc-url localhost \
  --private-key <key>

# Grant role
cast send <contract> "grantRole(bytes32,address)" <role> <account> \
  --rpc-url localhost \
  --private-key <key>
```

---

## 📈 Monitoramento

### Logs

```bash
# Contracts - watch events
cast logs --from-block 0 --address <contract> --rpc-url localhost

# Frontend - Vercel logs
vercel logs --follow

# Sistema - watch files
watch -n 1 'cast block latest --rpc-url localhost'
```

### Métricas

```bash
# Gas usado por função
forge test --gas-report

# Bundle size
npm run analyze

# Performance
lighthouse <url> --view
```

---

## 🧰 Utilitários

### Conversões

```bash
# Wei to ETH
cast --to-unit 1000000000000000000 eth

# ETH to Wei
cast --from-unit 1 eth

# Hex to Dec
cast --to-dec 0xff

# Dec to Hex
cast --to-hex 255
```

### Encode/Decode

```bash
# Encode function call
cast calldata "vote(uint256,uint8)" 1 0

# Decode function return
cast abi-decode "getDAO(uint256)(uint256,uint256)" <return_data>

# Keccak256 hash
cast keccak "Hello World"
```

### Generate

```bash
# Gerar wallet
cast wallet new

# Gerar private key de mnemonic
cast wallet private-key --mnemonic "your mnemonic here"

# Assinar mensagem
cast wallet sign "message" --private-key <key>
```

---

## 🎯 Workflows Comuns

### 1. Adicionar Nova Feature

```bash
# 1. Branch
git checkout -b feature/minha-feature

# 2. Desenvolver
# ... código ...

# 3. Testar
cd contracts && make test
cd frontend && npm run lint && npm run build

# 4. Commit
git add .
git commit -m "feat: adiciona minha feature"

# 5. Push e PR
git push origin feature/minha-feature
# Abrir PR no GitHub
```

### 2. Deploy Full Stack

```bash
# 1. Deploy contracts em testnet
cd contracts
make deploy-sepolia
# Copiar endereços dos contratos

# 2. Configurar frontend
cd ../frontend
# Adicionar endereços em .env.local

# 3. Testar localmente
npm run build
npm run start

# 4. Deploy frontend
vercel --prod
# Adicionar env vars no dashboard

# 5. Verificar
# Abrir app e testar todas as funcionalidades
```

### 3. Debug de Issue

```bash
# 1. Reproduzir localmente
make anvil  # terminal 1
make deploy-local  # terminal 2
npm run dev  # terminal 3

# 2. Verificar logs
# - Console do navegador (F12)
# - Terminal do anvil
# - Logs do Next.js

# 3. Testar fix
# Editar código
# Salvar (hot reload)
# Verificar novamente

# 4. Commit fix
git commit -m "fix: corrige issue #123"
git push
```

---

## 📚 Links Rápidos

- **Forge Docs**: https://book.getfoundry.sh/
- **wagmi Docs**: https://wagmi.sh/
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **OpenZeppelin**: https://docs.openzeppelin.com/
- **Etherscan Sepolia**: https://sepolia.etherscan.io/
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 🆘 Ajuda Rápida

### Erro: "Contract not found"
```bash
# Verificar se contrato foi deployado
cast code <address> --rpc-url localhost

# Verificar configuração
cat .env.local | grep ADDRESS
```

### Erro: "Transaction reverted"
```bash
# Ver motivo do revert
cast call <contract> <function> <args> --rpc-url localhost

# Debug transação
forge debug <tx_hash> --rpc-url localhost
```

### Erro: "Nonce too high"
```bash
# Reset nonce do Anvil
anvil --reset
```

### Erro: "Module not found"
```bash
# Reinstalar dependências
rm -rf node_modules
npm install
```

---

## 💡 Dicas de Produtividade

### Aliases Úteis (adicione no ~/.zshrc)

```bash
# Contratos
alias ft="forge test"
alias ftv="forge test -vvv"
alias fb="forge build"
alias fc="forge clean"

# Frontend
alias nrd="npm run dev"
alias nrb="npm run build"
alias nrl="npm run lint"

# Git
alias gs="git status"
alias ga="git add ."
alias gc="git commit -m"
alias gp="git push"
alias gl="git log --oneline --graph --all"

# Atalhos de navegação
alias rev="cd ~/Documents/revolucao-cibernetica"
alias revc="cd ~/Documents/revolucao-cibernetica/contracts"
alias revf="cd ~/Documents/revolucao-cibernetica/frontend"
```

### VS Code Snippets

Adicione em `.vscode/snippets.json`:

```json
{
  "Foundry Test": {
    "prefix": "ftest",
    "body": [
      "function test${1:Name}() public {",
      "    $2",
      "    assertEq($3, $4);",
      "}"
    ]
  },
  "React Component": {
    "prefix": "rcomp",
    "body": [
      "export function ${1:Component}() {",
      "  return (",
      "    <div>",
      "      $2",
      "    </div>",
      "  );",
      "}"
    ]
  }
}
```

---

**Salve este arquivo e tenha sempre à mão! 📌**
