# 📚 Índice da Documentação - Revolução Cibernética

Guia completo de toda a documentação do projeto.

---

## 🎯 Por Onde Começar?

### 👶 Sou Novo no Projeto
1. **[README.md principal](./README.md)** - Visão geral do projeto
2. **[frontend/QUICKSTART.md](./frontend/QUICKSTART.md)** - Rodar em 5 minutos
3. **[SISTEMA_COMPLETO.md](./SISTEMA_COMPLETO.md)** - O que foi construído

### 👨‍💻 Quero Desenvolver
1. **[frontend/QUICKSTART.md](./frontend/QUICKSTART.md)** - Setup rápido
2. **[CHEAT_SHEET.md](./CHEAT_SHEET.md)** - Comandos úteis
3. **[frontend/src/components/DAOMitosis/README.md](./frontend/src/components/DAOMitosis/README.md)** - Componentes

### 🚀 Vou Fazer Deploy
1. **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Checklist completo
2. **[contracts/README.md](./contracts/README.md)** - Deploy de contratos
3. **[frontend/.env.example](./frontend/.env.example)** - Configuração

### 🏛️ Quero Entender a Teoria
1. **[docs/SINTESE_COMPLETA_REVOLUCAO_CIBERNETICA.md](./docs/SINTESE_COMPLETA_REVOLUCAO_CIBERNETICA.md)** - Visão completa
2. **[contracts/ARTIGO_4B_IMPLEMENTATION.md](./contracts/ARTIGO_4B_IMPLEMENTATION.md)** - Artigo 5º-C
3. **[manifesto.html](./manifesto.html)** - Manifesto

---

## 📂 Estrutura da Documentação

### 📋 Documentação Geral (Raiz)

#### Guias de Início
- **[README.md](./README.md)** - Introdução ao projeto
- **[QUICKSTART.md](./frontend/QUICKSTART.md)** - Setup em 5 minutos
- **[CHEAT_SHEET.md](./CHEAT_SHEET.md)** - Comandos rápidos

#### Status do Projeto
- **[SISTEMA_COMPLETO.md](./SISTEMA_COMPLETO.md)** - Status completo da implementação
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Checklist de deploy
- **[task.md](./task.md)** - Tarefas pendentes

#### Conceitos e Teoria
- **[manifesto.html](./manifesto.html)** - Manifesto da Revolução
- **[constituicao.html](./constituicao.html)** - Cybersyn 2.0
- **[lei.md](./lei.md)** - Framework legal

---

### 🔧 Documentação de Contratos (/contracts)

#### Guias Principais
- **[README.md](./contracts/README.md)** - Overview dos contratos
- **[QUICKSTART.md](./contracts/QUICKSTART.md)** - Setup rápido de contratos
- **[Makefile](./contracts/Makefile)** - Comandos disponíveis

#### Implementações (BIPs)
- **[BIP-0001: Attention Tokens](./docs/BIP-0001-attention-tokens.md)**
- **[BIP-0002: Mitosis](./docs/BIP-0002-mitosis.md)**
- **[BIP-0003: Sovereign Currency](./docs/BIP-0003-sovereign-currency.md)**
- **[BIP-0004: Proof of Life](./docs/BIP-0004-proof-of-life.md)**
- **[BIP-0005: Multi-Wallet Recovery](./docs/BIP-0005-multi-wallet-recovery.md)**
- **[BIP-0006: Fraud Detection](./docs/BIP-0006-fraud-detection.md)**
- **[BIP-0007: Wallet Recovery](./docs/BIP-0007-wallet-recovery.md)**
- **[BIP-0008: Sovereign Wallet](./docs/BIP-0008-sovereign-wallet.md)**

#### Artigo 5º-C (Sistema de Mitose)
- **[ARTIGO_4B_IMPLEMENTATION.md](./contracts/ARTIGO_4B_IMPLEMENTATION.md)** - Implementação completa
- **[INTEGRATION_COMPLETE.md](./contracts/INTEGRATION_COMPLETE.md)** - Integrações
- **[INTEGRATION_SUMMARY.md](./contracts/INTEGRATION_SUMMARY.md)** - Resumo

#### Guias Específicos
- **[WALLET_TOKEN_BINDING.md](./contracts/WALLET_TOKEN_BINDING.md)** - Binding de tokens
- **[QUICKSTART_WALLET_BINDING.md](./contracts/QUICKSTART_WALLET_BINDING.md)** - Setup rápido
- **[CONSTITUTIONAL_IMPLEMENTATION_GAP.md](./docs/CONSTITUTIONAL_IMPLEMENTATION_GAP.md)** - Gaps

#### Changelogs
- **[CHANGELOG.md](./contracts/CHANGELOG.md)** - Histórico de mudanças

---

### 🎨 Documentação de Frontend (/frontend)

#### Guias de Setup
- **[README.md](./frontend/README.md)** - Overview do frontend
- **[QUICKSTART.md](./frontend/QUICKSTART.md)** - Rodar em 5 minutos ⚡
- **[.env.example](./frontend/.env.example)** - Template de configuração
- **[VISUAL_GUIDE.md](./frontend/VISUAL_GUIDE.md)** - Guia visual da UI

#### Componentes
- **[src/components/DAOMitosis/README.md](./frontend/src/components/DAOMitosis/README.md)** - Componentes de mitose
  - DAOStatusCard - Card de status
  - MitosisVoting - Interface de votação
  - DAOGenealogyTree - Árvore genealógica
  - Página demo completa

#### Código Fonte
```
frontend/src/
├── app/
│   ├── dao-mitosis/
│   │   └── page.tsx          # Página de demonstração
│   └── layout.tsx             # Layout principal
├── components/
│   └── DAOMitosis/
│       ├── DAOStatusCard.tsx  # 220 linhas
│       ├── MitosisVoting.tsx  # 340 linhas
│       ├── DAOGenealogyTree.tsx # 280 linhas
│       ├── index.ts           # Exports
│       └── README.md          # Documentação
└── lib/
    └── wagmi.ts               # Config Web3
```

---

### 📖 Documentação Conceitual (/docs)

#### Arquitetura
- **[ARCHITECTURE_DIAGRAM.md](./docs/ARCHITECTURE_DIAGRAM.md)** - Diagramas de arquitetura
- **[P2P_DISTRIBUTED_ARCHITECTURE.md](./docs/P2P_DISTRIBUTED_ARCHITECTURE.md)** - Arquitetura P2P
- **[P2P_MIGRATION_COMPLETE.md](./docs/P2P_MIGRATION_COMPLETE.md)** - Migração P2P

#### Estratégia e Metodologia
- **[ESTRATEGIA_METODOLOGICA_TESE_ANTITESE.md](./docs/ESTRATEGIA_METODOLOGICA_TESE_ANTITESE.md)**
- **[META_OBSERVACAO_LOOPS.md](./docs/META_OBSERVACAO_LOOPS.md)**
- **[LATERALIDADE_CANVAS_CIBERNETICO.md](./docs/LATERALIDADE_CANVAS_CIBERNETICO.md)**

#### Sínteses e Análises
- **[SINTESE_COMPLETA_REVOLUCAO_CIBERNETICA.md](./docs/SINTESE_COMPLETA_REVOLUCAO_CIBERNETICA.md)** - Visão completa
- **[SINTESE_EXPANDIDA_BESTA_FERA.md](./docs/SINTESE_EXPANDIDA_BESTA_FERA.md)** - Análise expandida
- **[FEEDBACK_SINTESE_PARA_MANIFESTO.md](./docs/FEEDBACK_SINTESE_PARA_MANIFESTO.md)** - Feedback

#### Guias Técnicos
- **[XML_GUIDE.md](./docs/XML_GUIDE.md)** - Guia de XML
- **[EXPORT.md](./docs/EXPORT.md)** - Exportação de dados
- **[CLEAN_CHAPTER_GUIDE.md](./docs/CLEAN_CHAPTER_GUIDE.md)** - Limpeza de capítulos

#### Deploy e Configuração
- **[GITHUB_PAGES_DEPLOY.md](./docs/GITHUB_PAGES_DEPLOY.md)** - Deploy no GitHub Pages
- **[SETUP_GITHUB_PAGES_SUMMARY.md](./docs/SETUP_GITHUB_PAGES_SUMMARY.md)** - Resumo
- **[DEPLOY_CHECKLIST.md](./docs/DEPLOY_CHECKLIST.md)** - Checklist

#### Guias de Usuário
- **[GUIA_RECUPERACAO_USUARIO.md](./docs/GUIA_RECUPERACAO_USUARIO.md)** - Recuperação de conta
- **[SOVEREIGN_WALLET_GUIDE.md](./docs/SOVEREIGN_WALLET_GUIDE.md)** - Guia de wallet

#### Anatomia e Estrutura
- **[GUAIAMUM_ANATOMIA_FUNCIONAL.md](./docs/GUAIAMUM_ANATOMIA_FUNCIONAL.md)** - Estrutura funcional

#### Mensagens e Comunicação
- **[MENSAGEM_BESTA_FERA.md](./docs/MENSAGEM_BESTA_FERA.md)** - Análise simbólica
- **[COMMIT_MESSAGE.md](./docs/COMMIT_MESSAGE.md)** - Padrões de commit

#### Dados e Grafos
- **[rizoma-revolucao-cibernetica.md](./docs/rizoma-revolucao-cibernetica.md)** - Estrutura rizomática
- **[rizoma-revolucao-cibernetica.json](./docs/rizoma-revolucao-cibernetica.json)** - Dados do grafo
- **[rizoma-revolucao-cibernetica.graphml](./docs/rizoma-revolucao-cibernetica.graphml)** - GraphML
- **[rizoma-nodes.csv](./docs/rizoma-nodes.csv)** - Nós do grafo
- **[rizoma-edges.csv](./docs/rizoma-edges.csv)** - Arestas do grafo

#### Formatos de Exportação
- **[revolucao_cibernetica.xml](./docs/revolucao_cibernetica.xml)** - XML completo
- **[revolucao_cibernetica.min.xml](./docs/revolucao_cibernetica.min.xml)** - XML minificado
- **[revolucao_cibernetica.jsonl](./docs/revolucao_cibernetica.jsonl)** - JSONL
- **[revolucao_cibernetica.epub](./docs/revolucao_cibernetica.epub)** - E-book

---

## 🔍 Busca por Tópico

### Smart Contracts
- **Mitose**: [ARTIGO_4B_IMPLEMENTATION.md](./contracts/ARTIGO_4B_IMPLEMENTATION.md)
- **Votação**: [FederationVoting.sol](./contracts/FederationVoting.sol)
- **Tokens**: [GovernanceToken.sol](./contracts/GovernanceToken.sol)
- **Prova de Vida**: [ProofOfLife.sol](./contracts/ProofOfLife.sol)
- **Multi-Wallet**: [MultiWalletIdentity.sol](./contracts/MultiWalletIdentity.sol)
- **Recuperação**: [WalletRecovery.sol](./contracts/WalletRecovery.sol)
- **Fraude**: [FraudDetection.sol](./contracts/FraudDetection.sol)
- **Redundância**: [OrganizationalRedundancy.sol](./contracts/OrganizationalRedundancy.sol)
- **Moeda**: [SovereignCurrency.sol](./contracts/SovereignCurrency.sol)
- **Carteira**: [SovereignWallet.sol](./contracts/SovereignWallet.sol)

### Interfaces
- **IDAOMitosis**: [interfaces/IDAOMitosis.sol](./contracts/interfaces/IDAOMitosis.sol)
- **IGovernanceToken**: [GovernanceToken.sol](./contracts/GovernanceToken.sol)
- **ISovereignInterfaces**: [ISovereignInterfaces.sol](./contracts/ISovereignInterfaces.sol)

### Testes
- **Mitose**: [DAOMitosis.t.sol](./contracts/test/DAOMitosis.t.sol)
- **Segurança**: [DAOMitosisSecurity.t.sol](./contracts/test/DAOMitosisSecurity.t.sol)
- **Integração FV**: [Integration.FederationVoting.DAOMitosis.t.sol](./contracts/test/Integration.FederationVoting.DAOMitosis.t.sol)
- **Integração GT**: [Integration.DAOMitosis.GovernanceToken.t.sol](./contracts/test/Integration.DAOMitosis.GovernanceToken.t.sol)

### Frontend
- **Status**: [DAOStatusCard.tsx](./frontend/src/components/DAOMitosis/DAOStatusCard.tsx)
- **Votação**: [MitosisVoting.tsx](./frontend/src/components/DAOMitosis/MitosisVoting.tsx)
- **Genealogia**: [DAOGenealogyTree.tsx](./frontend/src/components/DAOMitosis/DAOGenealogyTree.tsx)
- **Demo**: [page.tsx](./frontend/src/app/dao-mitosis/page.tsx)

### Configuração
- **Env Frontend**: [.env.example](./frontend/.env.example)
- **Config Foundry**: [foundry.toml](./contracts/foundry.toml)
- **Remappings**: [remappings.txt](./contracts/remappings.txt)
- **Makefile**: [Makefile](./contracts/Makefile)

---

## 📊 Documentação por Tipo

### 🚀 Quickstarts (Comece Aqui!)
1. **[frontend/QUICKSTART.md](./frontend/QUICKSTART.md)** ⚡ - Frontend em 5min
2. **[contracts/QUICKSTART.md](./contracts/QUICKSTART.md)** - Contratos
3. **[contracts/QUICKSTART_WALLET_BINDING.md](./contracts/QUICKSTART_WALLET_BINDING.md)** - Wallet binding

### 📖 READMEs (Visão Geral)
1. **[README.md](./README.md)** - Principal
2. **[frontend/README.md](./frontend/README.md)** - Frontend
3. **[contracts/README.md](./contracts/README.md)** - Contratos
4. **[frontend/src/components/DAOMitosis/README.md](./frontend/src/components/DAOMitosis/README.md)** - Componentes

### ✅ Checklists (Validação)
1. **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Deploy completo
2. **[docs/DEPLOY_CHECKLIST.md](./docs/DEPLOY_CHECKLIST.md)** - Deploy GitHub Pages

### 🎨 Guias Visuais
1. **[frontend/VISUAL_GUIDE.md](./frontend/VISUAL_GUIDE.md)** - UI/UX
2. **[docs/ARCHITECTURE_DIAGRAM.md](./docs/ARCHITECTURE_DIAGRAM.md)** - Arquitetura

### 📚 Documentação Técnica
1. **[SISTEMA_COMPLETO.md](./SISTEMA_COMPLETO.md)** - Status completo
2. **[contracts/ARTIGO_4B_IMPLEMENTATION.md](./contracts/ARTIGO_4B_IMPLEMENTATION.md)** - Mitose
3. **[contracts/INTEGRATION_COMPLETE.md](./contracts/INTEGRATION_COMPLETE.md)** - Integrações
4. **[CHEAT_SHEET.md](./CHEAT_SHEET.md)** - Comandos

### 🔧 Configuração
1. **[frontend/.env.example](./frontend/.env.example)** - Env vars
2. **[contracts/foundry.toml](./contracts/foundry.toml)** - Foundry config
3. **[contracts/remappings.txt](./contracts/remappings.txt)** - Imports

### 📝 Changelogs
1. **[contracts/CHANGELOG.md](./contracts/CHANGELOG.md)** - Histórico de contratos

---

## 🎯 Fluxos de Uso

### Fluxo 1: Primeiro Contato
```
README.md
    ↓
frontend/QUICKSTART.md
    ↓
localhost:3000/dao-mitosis
    ↓
SISTEMA_COMPLETO.md
```

### Fluxo 2: Desenvolvimento Frontend
```
frontend/QUICKSTART.md
    ↓
frontend/.env.example
    ↓
frontend/src/components/DAOMitosis/README.md
    ↓
npm run dev
    ↓
CHEAT_SHEET.md (referência)
```

### Fluxo 3: Desenvolvimento Contratos
```
contracts/README.md
    ↓
contracts/ARTIGO_4B_IMPLEMENTATION.md
    ↓
make test
    ↓
CHEAT_SHEET.md (referência)
```

### Fluxo 4: Deploy Completo
```
DEPLOYMENT_CHECKLIST.md
    ↓
make deploy-sepolia
    ↓
frontend/.env.local (configure)
    ↓
vercel --prod
    ↓
✅ Monitoramento
```

---

## 🗂️ Documentação por Responsabilidade

### Para Product Owners
- [README.md](./README.md)
- [SISTEMA_COMPLETO.md](./SISTEMA_COMPLETO.md)
- [docs/SINTESE_COMPLETA_REVOLUCAO_CIBERNETICA.md](./docs/SINTESE_COMPLETA_REVOLUCAO_CIBERNETICA.md)

### Para Desenvolvedores Frontend
- [frontend/QUICKSTART.md](./frontend/QUICKSTART.md)
- [frontend/src/components/DAOMitosis/README.md](./frontend/src/components/DAOMitosis/README.md)
- [frontend/VISUAL_GUIDE.md](./frontend/VISUAL_GUIDE.md)

### Para Desenvolvedores Smart Contracts
- [contracts/README.md](./contracts/README.md)
- [contracts/ARTIGO_4B_IMPLEMENTATION.md](./contracts/ARTIGO_4B_IMPLEMENTATION.md)
- [contracts/INTEGRATION_COMPLETE.md](./contracts/INTEGRATION_COMPLETE.md)

### Para DevOps
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- [CHEAT_SHEET.md](./CHEAT_SHEET.md)
- [frontend/.env.example](./frontend/.env.example)

### Para QA/Testers
- [SISTEMA_COMPLETO.md](./SISTEMA_COMPLETO.md)
- [frontend/VISUAL_GUIDE.md](./frontend/VISUAL_GUIDE.md)
- [contracts/test/](./contracts/test/)

### Para Usuários Finais
- [manifesto.html](./manifesto.html)
- [constituicao.html](./constituicao.html)
- [docs/GUIA_RECUPERACAO_USUARIO.md](./docs/GUIA_RECUPERACAO_USUARIO.md)

---

## 🔗 Links Externos Importantes

### Frameworks e Ferramentas
- **Foundry Book**: https://book.getfoundry.sh/
- **wagmi Docs**: https://wagmi.sh/
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **OpenZeppelin**: https://docs.openzeppelin.com/

### Exploradores de Blockchain
- **Etherscan**: https://etherscan.io/
- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **Polygonscan**: https://polygonscan.com/

### Serviços
- **Vercel**: https://vercel.com/
- **Infura**: https://infura.io/
- **Alchemy**: https://www.alchemy.com/
- **WalletConnect**: https://cloud.walletconnect.com/

---

## 📈 Status dos Documentos

### ✅ Completo e Atualizado
- [x] SISTEMA_COMPLETO.md
- [x] frontend/QUICKSTART.md
- [x] frontend/src/components/DAOMitosis/README.md
- [x] DEPLOYMENT_CHECKLIST.md
- [x] CHEAT_SHEET.md
- [x] frontend/VISUAL_GUIDE.md
- [x] frontend/.env.example
- [x] contracts/ARTIGO_4B_IMPLEMENTATION.md
- [x] contracts/INTEGRATION_COMPLETE.md

### 🔄 Precisa Atualização
- [ ] README.md principal (adicionar link para novos docs)
- [ ] frontend/README.md (adicionar seção mitose)
- [ ] contracts/README.md (adicionar referências)

### ⏳ Para Criar
- [ ] CONTRIBUTING.md (guia de contribuição)
- [ ] CODE_OF_CONDUCT.md (código de conduta)
- [ ] SECURITY.md (política de segurança)
- [ ] LICENSE.md (licença do projeto)

---

## 💡 Como Usar Este Índice

### Busca por Palavra-Chave
Use `Ctrl+F` (ou `Cmd+F` no Mac) para buscar:
- Nome de arquivo
- Tecnologia (Foundry, React, etc.)
- Conceito (mitose, votação, etc.)
- Tipo de documento (README, QUICKSTART, etc.)

### Navegação por Contexto
1. **Se você é novo**: Comece em "Por Onde Começar?"
2. **Se busca algo específico**: Use "Busca por Tópico"
3. **Se quer entender estrutura**: Veja "Estrutura da Documentação"
4. **Se vai fazer algo**: Use "Fluxos de Uso"

### Contribuindo para o Índice
Ao adicionar novos documentos:
1. Adicione-os na seção apropriada
2. Atualize "Status dos Documentos"
3. Crie links cruzados se relevante
4. Atualize data de modificação no rodapé

---

## 🆘 Não Encontrou o que Procura?

1. Tente buscar no código: `grep -r "sua busca" .`
2. Veja issues no GitHub
3. Pergunte no Discord/Telegram
4. Abra uma issue para melhorar esta documentação

---

**Última Atualização**: 2024
**Versão do Índice**: 1.0.0
**Responsável**: Tech Lead

---

**📌 Bookmark este arquivo! É seu mapa do projeto.**
