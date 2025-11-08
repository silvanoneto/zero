# 🚀 Configuração GitHub Pages - Resumo das Alterações

## 📋 Arquivos Modificados

### 1. `.github/workflows/gh-pages.yml`
- ✅ Adicionado build do frontend Next.js
- ✅ Configurado Node.js e instalação de dependências
- ✅ Build com `NEXT_PUBLIC_DEMO_MODE=true`
- ✅ Export estático do Next.js
- ✅ Cópia dos arquivos para `_site/`
- ✅ Adicionado `.nojekyll` para evitar processamento Jekyll
- ✅ Deploy automático no branch `gh-pages`

### 2. `frontend/next.config.mjs`
- ✅ Configurado `output: 'export'` para modo demo
- ✅ Adicionado `images: { unoptimized: true }`
- ✅ Mantido modo `standalone` para Docker quando não é demo

### 3. `frontend/package.json`
- ✅ Adicionado script `export` para build estático

### 4. `frontend/.env.local.example`
- ✅ Documentado `NEXT_PUBLIC_DEMO_MODE`
- ✅ Separado configurações demo vs produção

### 5. `frontend/.env.production`
- ✅ Criado com `NEXT_PUBLIC_DEMO_MODE=true` para GitHub Pages

## 📁 Arquivos Criados

### 1. `frontend/src/hooks/useLocalStorage.ts` ⭐
Implementação completa do adaptador de localStorage:

**Classes e Funções:**
- `useLocalStorage<T>()` - Hook React para localStorage seguro
- `LocalStorageAdapter` - Classe estática para gerenciar propostas
  - `saveProposal()` - Salva nova proposta
  - `getProposals()` - Lista todas as propostas
  - `getProposal(id)` - Busca proposta por ID
  - `updateProposal()` - Atualiza proposta existente
  - `addVote()` - Adiciona voto a uma proposta
  - `clearAll()` - Limpa todos os dados
  - `initializeDemoData()` - Carrega propostas de exemplo

**Interface:**
```typescript
interface StoredProposal {
  id: number;
  title: string;
  description: string;
  ipfsHash: string;
  proposer: string;
  voteType: string;
  startTime: number;
  endTime: number;
  votesFor: string;
  votesAgainst: string;
  totalVoters: number;
  state: 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXPIRED';
  tags?: { ... };
}
```

### 2. Modificações em Hooks Existentes

#### `frontend/src/hooks/useProposals.ts`
- ✅ Importa `LocalStorageAdapter`
- ✅ Detecta `DEMO_MODE` via variável de ambiente
- ✅ Usa localStorage quando em modo demo
- ✅ Mantém código original para modo produção
- ✅ Inicializa dados demo automaticamente

#### `frontend/src/hooks/useCreateProposal.ts`
- ✅ Importa `LocalStorageAdapter`
- ✅ Detecta `DEMO_MODE`
- ✅ Salva propostas no localStorage em modo demo
- ✅ Simula delay de transação (UX)
- ✅ Retorna status de sucesso/erro adequado

### 3. Documentação

#### `GITHUB_PAGES.md`
- Guia de acesso e uso da versão GitHub Pages
- Instruções para modo demo vs produção
- Troubleshooting e FAQ

#### `frontend/GITHUB_PAGES_DEPLOY.md`
- Documentação técnica detalhada
- Estrutura de dados
- Debug e desenvolvimento
- Como contribuir

#### `test-gh-pages-build.sh`
- Script para testar build localmente
- Valida ambiente antes do deploy

## 🎯 Como Funciona

### Fluxo de Deploy Automático

```
Push para main/master
    ↓
GitHub Actions detecta push
    ↓
Workflow gh-pages.yml executa
    ↓
Valida arquivos Python
    ↓
Instala deps do frontend
    ↓
Build Next.js (DEMO_MODE=true)
    ↓
Export para pasta 'out/'
    ↓
Copia para '_site/' com outros arquivos HTML
    ↓
Deploy no branch 'gh-pages'
    ↓
GitHub Pages serve o conteúdo
    ↓
Site disponível em minutos!
```

### Funcionamento do localStorage

```
Usuário acessa site
    ↓
useProposals detecta DEMO_MODE
    ↓
LocalStorageAdapter.initializeDemoData()
    ↓
Carrega ou cria propostas demo
    ↓
Salva em localStorage do navegador
    ↓
Interface exibe propostas
    ↓
Usuário pode criar novas propostas
    ↓
Salvas no localStorage
    ↓
Persistem entre sessões
```

## 🔧 Configuração Necessária no GitHub

1. **Ativar GitHub Pages**
   - Vá em Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `gh-pages` / `(root)`
   - Save

2. **Permissões do Workflow**
   - Settings → Actions → General
   - Workflow permissions: "Read and write permissions"
   - "Allow GitHub Actions to create and approve pull requests" ✓

## ✅ Testes Recomendados

### Antes do Push

```bash
# Testar build localmente
./test-gh-pages-build.sh

# Servir localmente
cd frontend
npx serve out -l 3000

# Testar em http://localhost:3000
```

### Após Deploy

1. ✅ Verificar workflow em Actions
2. ✅ Aguardar conclusão (~5 min)
3. ✅ Acessar URL do GitHub Pages
4. ✅ Testar criação de proposta
5. ✅ Verificar persistência (recarregar página)
6. ✅ Testar em navegador privado (dados limpos)

## 🎨 Propostas Demo Incluídas

1. **Sistema de Reputação Descentralizada**
   - Tipo: Quadratic Voting
   - Estado: ACTIVE
   - Votos: 15000 a favor, 3000 contra

2. **Alocar Recursos para Educação Digital**
   - Tipo: Linear Voting
   - Estado: ACTIVE
   - Votos: 25000 a favor, 5000 contra

3. **Estabelecer Código de Ética para IA**
   - Tipo: Consensus Voting
   - Estado: ACTIVE
   - Votos: 18000 a favor, 2000 contra

## 🚀 Próximos Passos

1. **Fazer Push e Deploy**
   ```bash
   git add .
   git commit -m "feat: GitHub Pages com localStorage demo"
   git push origin main
   ```

2. **Ativar GitHub Pages** (se não estiver ativo)
   - Settings → Pages → Configurar source

3. **Aguardar Deploy**
   - Actions → Ver progresso do workflow

4. **Testar Site**
   - Acessar URL do GitHub Pages
   - Testar funcionalidades

## 📊 Estatísticas

- **Arquivos criados:** 5
- **Arquivos modificados:** 4
- **Linhas de código:** ~500
- **Hooks adaptados:** 2
- **Propostas demo:** 3
- **Tempo estimado de deploy:** 5-10 min

## 🔗 Links Importantes

- **Workflow:** `.github/workflows/gh-pages.yml`
- **Storage Adapter:** `frontend/src/hooks/useLocalStorage.ts`
- **Config Next.js:** `frontend/next.config.mjs`
- **Docs:** `GITHUB_PAGES.md`, `frontend/GITHUB_PAGES_DEPLOY.md`

---

✨ **Tudo pronto para deploy!** Faça push e em alguns minutos seu site estará no ar com localStorage funcional.
