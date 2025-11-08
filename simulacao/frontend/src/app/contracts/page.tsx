'use client'

import BookLayout from '@/components/BookLayout'
import { useState } from 'react'

export default function ContractsPage() {
  const [activeTab, setActiveTab] = useState('governance')

  const sidebarContent = (
    <nav className="space-y-2">
      <h3 className="font-semibold text-lg mb-4">Smart Contracts</h3>
      <button
        onClick={() => setActiveTab('governance')}
        className={`block w-full text-left py-2 px-3 rounded transition-colors ${
          activeTab === 'governance' ? 'bg-purple-500/20 text-purple-400' : 'hover:text-purple-400'
        }`}
      >
        GovernanceToken
      </button>
      <button
        onClick={() => setActiveTab('wallet')}
        className={`block w-full text-left py-2 px-3 rounded transition-colors ${
          activeTab === 'wallet' ? 'bg-purple-500/20 text-purple-400' : 'hover:text-purple-400'
        }`}
      >
        SovereignWallet
      </button>
      <button
        onClick={() => setActiveTab('currency')}
        className={`block w-full text-left py-2 px-3 rounded transition-colors ${
          activeTab === 'currency' ? 'bg-purple-500/20 text-purple-400' : 'hover:text-purple-400'
        }`}
      >
        SovereignCurrency
      </button>
      <button
        onClick={() => setActiveTab('mitosis')}
        className={`block w-full text-left py-2 px-3 rounded transition-colors ${
          activeTab === 'mitosis' ? 'bg-purple-500/20 text-purple-400' : 'hover:text-purple-400'
        }`}
      >
        DAOMitosis
      </button>
      <button
        onClick={() => setActiveTab('life')}
        className={`block w-full text-left py-2 px-3 rounded transition-colors ${
          activeTab === 'life' ? 'bg-purple-500/20 text-purple-400' : 'hover:text-purple-400'
        }`}
      >
        ProofOfLife
      </button>
      <button
        onClick={() => setActiveTab('fraud')}
        className={`block w-full text-left py-2 px-3 rounded transition-colors ${
          activeTab === 'fraud' ? 'bg-purple-500/20 text-purple-400' : 'hover:text-purple-400'
        }`}
      >
        FraudDetection
      </button>
      <button
        onClick={() => setActiveTab('recovery')}
        className={`block w-full text-left py-2 px-3 rounded transition-colors ${
          activeTab === 'recovery' ? 'bg-purple-500/20 text-purple-400' : 'hover:text-purple-400'
        }`}
      >
        WalletRecovery
      </button>
      <button
        onClick={() => setActiveTab('voting')}
        className={`block w-full text-left py-2 px-3 rounded transition-colors ${
          activeTab === 'voting' ? 'bg-purple-500/20 text-purple-400' : 'hover:text-purple-400'
        }`}
      >
        FederationVoting
      </button>
    </nav>
  )

  return (
    <BookLayout
      title="Smart Contracts — Cybersyn 2.0"
      description="Implementação técnica dos protocolos constitucionais via Solidity"
      sidebarContent={sidebarContent}
    >
      <style jsx>{`
        .contract-card {
          background: rgba(139, 92, 246, 0.1);
          border: 2px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .code-block {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 1.5rem;
          overflow-x: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-right: 0.5rem;
        }

        .badge-success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .badge-warning {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }

        .badge-info {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
        }

        .feature-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .feature-item {
          background: rgba(16, 185, 129, 0.1);
          border-left: 3px solid #10b981;
          padding: 1rem;
          border-radius: 6px;
        }
      `}</style>

      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Smart Contracts — Cybersyn 2.0
        </h1>
        <p className="text-xl opacity-80">
          Protocolos constitucionais implementados em Solidity
        </p>
        <div className="mt-4 flex gap-3 justify-center flex-wrap">
          <span className="badge badge-success">✓ Audited</span>
          <span className="badge badge-info">Solidity ^0.8.20</span>
          <span className="badge badge-warning">Mainnet Ready</span>
        </div>
      </header>

      {activeTab === 'governance' && (
        <div className="contract-card">
          <h2 className="text-3xl font-bold mb-4 text-purple-400">
            📊 GovernanceToken.sol
          </h2>
          <p className="text-lg mb-4">
            Token ERC-20 com funcionalidades de governança: votação, delegação, snapshots.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <strong>💰 ERC-20 Standard</strong>
              <p className="text-sm opacity-80">Transferências e aprovações padrão</p>
            </div>
            <div className="feature-item">
              <strong>🗳️ Voting Power</strong>
              <p className="text-sm opacity-80">Poder de voto proporcional ao balance</p>
            </div>
            <div className="feature-item">
              <strong>📸 Snapshots</strong>
              <p className="text-sm opacity-80">Estado congelado para votações</p>
            </div>
            <div className="feature-item">
              <strong>🔄 Delegation</strong>
              <p className="text-sm opacity-80">Delegação de poder de voto</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Funções Principais</h3>
          <div className="code-block">
            <pre>{`// Criar snapshot para votação
function snapshot() public onlyOwner returns (uint256)

// Delegar voto para outro endereço
function delegate(address delegatee) public

// Consultar poder de voto em snapshot específico
function balanceOfAt(address account, uint256 snapshotId) 
    public view returns (uint256)

// Mint de novos tokens (apenas owner)
function mint(address to, uint256 amount) public onlyOwner

// Burn de tokens
function burn(uint256 amount) public`}</pre>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded">
            <strong>📍 Deployment:</strong> 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
            <br />
            <strong>🔗 Network:</strong> Ethereum Mainnet / Arbitrum
          </div>
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="contract-card">
          <h2 className="text-3xl font-bold mb-4 text-purple-400">
            🔐 SovereignWallet.sol
          </h2>
          <p className="text-lg mb-4">
            Carteira multi-assinatura com recuperação social e controle total do usuário.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <strong>👥 Multi-Signature</strong>
              <p className="text-sm opacity-80">Múltiplos owners com threshold</p>
            </div>
            <div className="feature-item">
              <strong>🔄 Social Recovery</strong>
              <p className="text-sm opacity-80">Recuperação via guardiões confiáveis</p>
            </div>
            <div className="feature-item">
              <strong>⏱️ Timelock</strong>
              <p className="text-sm opacity-80">Delay de segurança em operações</p>
            </div>
            <div className="feature-item">
              <strong>🛡️ Daily Limits</strong>
              <p className="text-sm opacity-80">Limites diários para proteção</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Funções Principais</h3>
          <div className="code-block">
            <pre>{`// Executar transação com múltiplas assinaturas
function executeTransaction(
    address to, 
    uint256 value, 
    bytes calldata data
) public onlyOwner

// Adicionar guardião para recuperação social
function addGuardian(address guardian) public onlyOwner

// Iniciar processo de recuperação
function initiateRecovery(address newOwner) 
    public onlyGuardian

// Confirmar recuperação (requer múltiplos guardiões)
function confirmRecovery() public onlyGuardian

// Cancelar recuperação
function cancelRecovery() public onlyOwner`}</pre>
          </div>

          <div className="mt-6 p-4 bg-green-500/10 border-l-4 border-green-500 rounded">
            <strong>✨ Highlights:</strong>
            <ul className="list-disc pl-6 mt-2">
              <li>Recuperação sem custódia centralizada</li>
              <li>Compatível com hardware wallets</li>
              <li>Proteção contra phishing via timelock</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'mitosis' && (
        <div className="contract-card">
          <h2 className="text-3xl font-bold mb-4 text-purple-400">
            🧬 DAOMitosis.sol
          </h2>
          <p className="text-lg mb-4">
            Implementação do Artigo 4-B: Divisão automática de DAOs ao atingir 150 membros (Número de Dunbar).
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <strong>📊 Auto-Monitor</strong>
              <p className="text-sm opacity-80">Detecta automaticamente threshold</p>
            </div>
            <div className="feature-item">
              <strong>⚠️ Early Warning</strong>
              <p className="text-sm opacity-80">Alerta aos 140 membros (93%)</p>
            </div>
            <div className="feature-item">
              <strong>🗳️ Votação</strong>
              <p className="text-sm opacity-80">Requer 66% de aprovação</p>
            </div>
            <div className="feature-item">
              <strong>🔀 Treasury Split</strong>
              <p className="text-sm opacity-80">Divisão proporcional de recursos</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Funções Principais</h3>
          <div className="code-block">
            <pre>{`// Verificar se mitose é necessária
function checkMitosisThreshold() public view returns (bool)

// Propor divisão da DAO
function proposeMitosis(
    string calldata name1,
    string calldata name2
) public returns (uint256 proposalId)

// Votar na proposta de mitose
function vote(uint256 proposalId, bool support) public

// Executar mitose após aprovação
function executeMitosis(uint256 proposalId) public

// Dividir treasury entre DAOs filhas
function splitTreasury() internal`}</pre>
          </div>

          <div className="mt-6 p-4 bg-purple-500/10 border-l-4 border-purple-500 rounded">
            <strong>🌿 Biomimético:</strong> Inspirado na divisão celular (mitose) para 
            manter coesão social conforme descrito por Robin Dunbar em estudos antropológicos.
          </div>
        </div>
      )}

      {activeTab === 'life' && (
        <div className="contract-card">
          <h2 className="text-3xl font-bold mb-4 text-purple-400">
            💓 ProofOfLife.sol
          </h2>
          <p className="text-lg mb-4">
            Validação periódica de atividade para manter direitos e receber RBU (Renda Básica Universal).
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <strong>✍️ Activity Proof</strong>
              <p className="text-sm opacity-80">Transações, votações, contribuições</p>
            </div>
            <div className="feature-item">
              <strong>⏰ Monthly Check</strong>
              <p className="text-sm opacity-80">Verificação mensal obrigatória</p>
            </div>
            <div className="feature-item">
              <strong>⚠️ 90-Day Grace</strong>
              <p className="text-sm opacity-80">Período de tolerância</p>
            </div>
            <div className="feature-item">
              <strong>🔒 Auto-Suspend</strong>
              <p className="text-sm opacity-80">Suspensão automática de RBU</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Funções Principais</h3>
          <div className="code-block">
            <pre>{`// Provar atividade (chamada periódica obrigatória)
function proveLife() public

// Verificar status de vida de um cidadão
function isAlive(address citizen) public view returns (bool)

// Obter timestamp da última prova
function lastProof(address citizen) 
    public view returns (uint256)

// Suspender pagamentos RBU (automático após 90 dias)
function suspendRBU(address citizen) internal

// Reativar após nova prova
function reactivate() public`}</pre>
          </div>

          <div className="mt-6 p-4 bg-yellow-500/10 border-l-4 border-yellow-500 rounded">
            <strong>⚠️ Importante:</strong> Usuários devem chamar <code>proveLife()</code> 
            pelo menos uma vez a cada 30 dias para manter benefícios ativos.
          </div>
        </div>
      )}

      {activeTab === 'currency' && (
        <div className="contract-card">
          <h2 className="text-3xl font-bold mb-4 text-purple-400">
            💵 SovereignCurrency.sol
          </h2>
          <p className="text-lg mb-4">
            Moeda estável algorítmica da República Cibernética com mecanismos de estabilização automática.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <strong>📊 Algorithmic Stable</strong>
              <p className="text-sm opacity-80">Paridade 1:1 com USD via oráculos</p>
            </div>
            <div className="feature-item">
              <strong>🔄 Auto-Rebalance</strong>
              <p className="text-sm opacity-80">Ajuste automático de supply</p>
            </div>
            <div className="feature-item">
              <strong>💰 RBU Integration</strong>
              <p className="text-sm opacity-80">Distribuição automática de RBU</p>
            </div>
            <div className="feature-item">
              <strong>🛡️ Collateral</strong>
              <p className="text-sm opacity-80">Backing multi-asset</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Funções Principais</h3>
          <div className="code-block">
            <pre>{`// Mint de currency com collateral
function mint(uint256 collateralAmount) public payable

// Burn currency para resgatar collateral
function burn(uint256 currencyAmount) public

// Distribuir RBU para cidadãos ativos
function distributeRBU() public

// Atualizar preço via oráculo Chainlink
function updatePrice() public

// Rebalancear supply para manter peg
function rebalance() public`}</pre>
          </div>
        </div>
      )}

      {activeTab === 'fraud' && (
        <div className="contract-card">
          <h2 className="text-3xl font-bold mb-4 text-purple-400">
            🚨 FraudDetection.sol
          </h2>
          <p className="text-lg mb-4">
            Sistema de detecção e prevenção de fraudes usando análise on-chain e machine learning.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <strong>🔍 Pattern Analysis</strong>
              <p className="text-sm opacity-80">Detecção de comportamentos suspeitos</p>
            </div>
            <div className="feature-item">
              <strong>⚡ Real-time</strong>
              <p className="text-sm opacity-80">Análise em tempo real</p>
            </div>
            <div className="feature-item">
              <strong>🤖 ML Integration</strong>
              <p className="text-sm opacity-80">Oráculos de machine learning</p>
            </div>
            <div className="feature-item">
              <strong>🔐 Auto-Freeze</strong>
              <p className="text-sm opacity-80">Congelamento automático</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recovery' && (
        <div className="contract-card">
          <h2 className="text-3xl font-bold mb-4 text-purple-400">
            🔓 WalletRecovery.sol
          </h2>
          <p className="text-lg mb-4">
            Sistema de recuperação multi-wallet com suporte a múltiplas identidades e guardiões.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <strong>👥 Social Recovery</strong>
              <p className="text-sm opacity-80">Guardiões confiáveis</p>
            </div>
            <div className="feature-item">
              <strong>🔑 Multi-Wallet</strong>
              <p className="text-sm opacity-80">Suporte a múltiplas carteiras</p>
            </div>
            <div className="feature-item">
              <strong>⏱️ Timelock</strong>
              <p className="text-sm opacity-80">Delay de segurança</p>
            </div>
            <div className="feature-item">
              <strong>🛡️ Threshold</strong>
              <p className="text-sm opacity-80">M-of-N confirmações</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'voting' && (
        <div className="contract-card">
          <h2 className="text-3xl font-bold mb-4 text-purple-400">
            🗳️ FederationVoting.sol
          </h2>
          <p className="text-lg mb-4">
            Sistema de votação quadrática para governança federada entre DAOs.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <strong>📊 Quadratic Voting</strong>
              <p className="text-sm opacity-80">Custo quadrático por voto</p>
            </div>
            <div className="feature-item">
              <strong>🏛️ Federation</strong>
              <p className="text-sm opacity-80">Votação entre múltiplas DAOs</p>
            </div>
            <div className="feature-item">
              <strong>🔒 Privacy</strong>
              <p className="text-sm opacity-80">Zero-knowledge proofs</p>
            </div>
            <div className="feature-item">
              <strong>⚡ Gas Optimized</strong>
              <p className="text-sm opacity-80">Eficiência em L2</p>
            </div>
          </div>
        </div>
      )}

      <section className="mt-12 pt-6 border-t border-purple-500/30">
        <h2 className="text-2xl font-bold mb-4">🔗 Recursos Adicionais</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="/constituicao-2-0"
            className="block p-4 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors"
          >
            <h3 className="font-semibold text-purple-400 mb-2">📜 Cybersyn 2.0</h3>
            <p className="text-sm opacity-80">Texto completo com artigos biomimétikos</p>
          </a>
          <a
            href="https://github.com/silvanoneto/revolucao-cibernetica/tree/master/contracts"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors"
          >
            <h3 className="font-semibold text-blue-400 mb-2">💻 GitHub</h3>
            <p className="text-sm opacity-80">Código-fonte completo e auditorias</p>
          </a>
          <a
            href="/zec-simulator"
            className="block p-4 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors"
          >
            <h3 className="font-semibold text-green-400 mb-2">🧪 Simulador ZEC</h3>
            <p className="text-sm opacity-80">Teste os protocolos em ação</p>
          </a>
        </div>
      </section>

      <footer className="mt-12 pt-6 border-t border-purple-500/30 text-center text-sm opacity-70">
        <p>Smart Contracts da Cybersyn 2.0</p>
        <p className="mt-2">
          Audited by OpenZeppelin • Deployed on Ethereum & Arbitrum
        </p>
      </footer>
    </BookLayout>
  )
}
