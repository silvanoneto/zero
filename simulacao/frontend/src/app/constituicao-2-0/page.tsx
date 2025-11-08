'use client'

import BookLayout from '@/components/BookLayout'
import { useState } from 'react'

export default function Constituicao20Page() {
  const [activeArticles, setActiveArticles] = useState<Set<string>>(new Set())

  const toggleArticle = (id: string) => {
    const newActive = new Set(activeArticles)
    if (newActive.has(id)) {
      newActive.delete(id)
    } else {
      newActive.add(id)
    }
    setActiveArticles(newActive)
  }

  const sidebarContent = (
    <nav className="space-y-2">
      <h3 className="font-semibold text-lg mb-4">Navegação</h3>
      <a href="#preambulo" className="block py-2 hover:text-purple-400 transition-colors">
        Preâmbulo
      </a>
      <a href="#toc" className="block py-2 hover:text-purple-400 transition-colors">
        Índice
      </a>
      <a href="#titulo-i" className="block py-2 hover:text-purple-400 transition-colors">
        I - Princípios Fundamentais
      </a>
      <a href="#titulo-ii" className="block py-2 hover:text-purple-400 transition-colors">
        II - Direitos e Deveres
      </a>
      <a href="#titulo-iii" className="block py-2 hover:text-purple-400 transition-colors">
        III - Organizações Autônomas
      </a>
      <a href="#titulo-iv" className="block py-2 hover:text-purple-400 transition-colors">
        IV - Governança Cibernética
      </a>
      <a href="#titulo-v" className="block py-2 hover:text-purple-400 transition-colors">
        V - Sistema Econômico
      </a>
      <a href="#titulo-vi" className="block py-2 hover:text-purple-400 transition-colors">
        VI - Ordem Social
      </a>
      <a href="#disposicoes" className="block py-2 hover:text-purple-400 transition-colors">
        Disposições Finais
      </a>
      <a href="#apendices" className="block py-2 hover:text-purple-400 transition-colors">
        Apêndices Técnicos
      </a>
    </nav>
  )

  return (
    <BookLayout
      title="Cybersyn 2.0 — Texto Completo Interativo"
      description="Versão completa e interativa da Cybersyn 2.0 com artigos biomiméticamente organizados"
      sidebarContent={sidebarContent}
    >
      <style jsx>{`
        .bio-article {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
          border-left: 4px solid #10b981;
          padding: 2rem;
          margin: 2rem 0;
          border-radius: 8px;
        }

        .bio-badge {
          display: inline-block;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-left: 0.5rem;
          box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
        }

        .article-header {
          font-size: 1.5rem;
          color: #8b5cf6;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .collapsible {
          cursor: pointer;
          user-select: none;
          transition: opacity 0.2s;
        }

        .collapsible:hover {
          opacity: 0.8;
        }

        .content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .content.active {
          max-height: 5000px;
        }

        .toc {
          background: rgba(139, 92, 246, 0.1);
          padding: 2rem;
          border-radius: 12px;
          margin: 2rem 0;
          border: 2px solid rgba(139, 92, 246, 0.3);
        }

        .toc a {
          display: block;
          padding: 0.5rem 0;
          color: #8b5cf6;
          text-decoration: none;
          transition: all 0.2s;
        }

        .toc a:hover {
          padding-left: 1rem;
          color: #ec4899;
        }

        .appendix {
          background: rgba(59, 130, 246, 0.1);
          padding: 2rem;
          border-radius: 12px;
          margin: 2rem 0;
          border: 2px solid rgba(59, 130, 246, 0.3);
        }
      `}</style>

      <section id="preambulo" className="mb-8">
        <h2 className="text-3xl font-bold mb-4 text-purple-400">Preâmbulo</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg leading-relaxed mb-4">
            Nós, o povo digital interconectado, reconhecendo a obsolescência das estruturas 
            hierárquicas herdadas do século XX e a emergência de uma nova ordem cibernética 
            baseada em princípios biomimétikos, promulgamos esta Cybersyn 2.0 para estabelecer:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Uma federação descentralizada de Organizações Autônomas Descentralizadas (DAOs)</li>
            <li>Um sistema econômico baseado em Renda Básica Universal (RBU) e moeda soberana</li>
            <li>Mecanismos de governança adaptativa inspirados em sistemas biológicos</li>
            <li>Proteção dos direitos digitais fundamentais</li>
            <li>Transparência radical através de blockchain e tecnologias P2P</li>
          </ul>
        </div>
      </section>

      <section id="toc" className="toc mb-8">
        <h2 className="text-2xl font-bold mb-4">Índice</h2>
        <div className="grid md:grid-cols-2 gap-2">
          <a href="#titulo-i">Título I — Princípios Fundamentais (Art. 1-10)</a>
          <a href="#titulo-ii">Título II — Direitos e Deveres Fundamentais (Art. 11-30)</a>
          <a href="#titulo-iii">Título III — Organizações Autônomas (Art. 31-50)</a>
          <a href="#titulo-iv">Título IV — Governança Cibernética (Art. 51-70)</a>
          <a href="#titulo-v">Título V — Sistema Econômico (Art. 71-90)</a>
          <a href="#titulo-vi">Título VI — Ordem Social (Art. 91-110)</a>
          <a href="#disposicoes">Disposições Finais (Art. 111-120)</a>
          <a href="#apendices">Apêndices Técnicos</a>
        </div>
      </section>

      <section id="titulo-i" className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-purple-400">
          Título I — Princípios Fundamentais
        </h2>

        <article className="bio-article">
          <div
            className="collapsible article-header"
            onClick={() => toggleArticle('art1')}
          >
            <span className={activeArticles.has('art1') ? 'rotate-90 inline-block' : 'inline-block'}>▶</span> 
            Artigo 1º — Soberania Digital
            <span className="bio-badge">Biomimético</span>
          </div>
          <div className={`content ${activeArticles.has('art1') ? 'active' : ''}`}>
            <p className="mb-2">
              <strong>Caput:</strong> A soberania digital é exercida pelo povo através de 
              mecanismos descentralizados de governança, sendo inalienável e indivisível.
            </p>
            <p className="mb-2">
              <strong>§1º</strong> Todo poder emana do povo e por ele é exercido diretamente 
              através de protocolos blockchain validados por consenso distribuído.
            </p>
            <p className="mb-2">
              <strong>§2º</strong> A soberania se manifesta através de:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Identidade digital auto-soberana (Self-Sovereign Identity)</li>
              <li>Participação em DAOs federadas</li>
              <li>Votação direta em propostas de governança</li>
              <li>Controle de chaves criptográficas pessoais</li>
            </ul>
          </div>
        </article>

        <article className="bio-article">
          <div
            className="collapsible article-header"
            onClick={() => toggleArticle('art2')}
          >
            <span className={activeArticles.has('art2') ? 'rotate-90 inline-block' : 'inline-block'}>▶</span>
            Artigo 2º — Separação de Protocolos
          </div>
          <div className={`content ${activeArticles.has('art2') ? 'active' : ''}`}>
            <p className="mb-2">
              <strong>Caput:</strong> São protocolos independentes e harmônicos entre si:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Protocolo Legislativo:</strong> DAOs de propostas e votação</li>
              <li><strong>Protocolo Executivo:</strong> Smart contracts de implementação</li>
              <li><strong>Protocolo Judicial:</strong> Oráculos de arbitragem descentralizada</li>
            </ul>
            <p className="mt-2">
              <strong>Parágrafo único:</strong> Nenhum protocolo pode interferir nas funções 
              essenciais de outro, exceto através de mecanismos de checkpoint constitucionais.
            </p>
          </div>
        </article>

        <article className="bio-article">
          <div
            className="collapsible article-header"
            onClick={() => toggleArticle('art3')}
          >
            <span className={activeArticles.has('art3') ? 'rotate-90 inline-block' : 'inline-block'}>▶</span>
            Artigo 3º — Objetivos Fundamentais
            <span className="bio-badge">Biomimético</span>
          </div>
          <div className={`content ${activeArticles.has('art3') ? 'active' : ''}`}>
            <p className="mb-2">
              <strong>Caput:</strong> Constituem objetivos fundamentais da República Cibernética:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Construir uma sociedade livre, justa e solidária baseada em código aberto</li>
              <li>Garantir Renda Básica Universal (RBU) para todos os cidadãos digitais</li>
              <li>Erradicar a pobreza informacional e reduzir desigualdades digitais</li>
              <li>Promover o bem comum através de algoritmos de otimização coletiva</li>
              <li>Implementar sistemas de governança adaptativa biomimética</li>
            </ul>
          </div>
        </article>

        <article className="bio-article">
          <div
            className="collapsible article-header"
            onClick={() => toggleArticle('art4')}
          >
            <span className={activeArticles.has('art4') ? 'rotate-90 inline-block' : 'inline-block'}>▶</span>
            Artigo 4º — Princípios da Federação Digital
          </div>
          <div className={`content ${activeArticles.has('art4') ? 'active' : ''}`}>
            <p className="mb-2">
              <strong>Caput:</strong> A República Cibernética rege-se nas suas relações 
              internacionais pelos seguintes princípios:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Interoperabilidade de protocolos</li>
              <li>Autodeterminação das DAOs</li>
              <li>Não intervenção em smart contracts alheios</li>
              <li>Cooperação entre blockchains</li>
              <li>Defesa da privacidade criptográfica</li>
              <li>Solução pacífica de conflitos via oráculos</li>
            </ul>
          </div>
        </article>

        <article className="bio-article">
          <div
            className="collapsible article-header"
            onClick={() => toggleArticle('art4b')}
          >
            <span className={activeArticles.has('art4b') ? 'rotate-90 inline-block' : 'inline-block'}>▶</span>
            Artigo 4-B — Mitose Organizacional (DAO Mitosis)
            <span className="bio-badge">Biomimético</span>
          </div>
          <div className={`content ${activeArticles.has('art4b') ? 'active' : ''}`}>
            <p className="mb-2">
              <strong>Caput:</strong> Toda organização que atinja 150 membros (Número de Dunbar) 
              deve iniciar processo de mitose organizacional para preservar coesão social e 
              eficiência decisória.
            </p>
            <p className="mb-2">
              <strong>§1º</strong> O processo de mitose é automatizado via smart contract 
              DAOMitosis.sol, que:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Monitora continuamente o número de membros ativos</li>
              <li>Alerta quando 140 membros são atingidos (threshold 93%)</li>
              <li>Ativa votação compulsória ao atingir 150 membros</li>
              <li>Executa divisão após aprovação de 66% dos membros</li>
            </ul>
            <p className="mb-2 mt-2">
              <strong>§2º</strong> A divisão preserva:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Proporção de recursos (treasury split)</li>
              <li>Direitos de governança dos membros</li>
              <li>Histórico de contribuições (via merkle proofs)</li>
              <li>Interoperabilidade entre DAOs-filhas</li>
            </ul>
          </div>
        </article>
      </section>

      <section id="titulo-ii" className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-purple-400">
          Título II — Direitos e Deveres Fundamentais
        </h2>

        <article className="bio-article">
          <div
            className="collapsible article-header"
            onClick={() => toggleArticle('art11')}
          >
            <span className={activeArticles.has('art11') ? 'rotate-90 inline-block' : 'inline-block'}>▶</span>
            Artigo 11 — Direitos Digitais Fundamentais
          </div>
          <div className={`content ${activeArticles.has('art11') ? 'active' : ''}`}>
            <p className="mb-2">
              <strong>Caput:</strong> São direitos fundamentais de todo cidadão digital:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Privacidade Criptográfica:</strong> Direito a comunicação zero-knowledge</li>
              <li><strong>Auto-Soberania:</strong> Controle total sobre identidade e dados</li>
              <li><strong>Renda Básica Universal:</strong> Garantia de subsistência digital</li>
              <li><strong>Acesso Igualitário:</strong> Conexão universal à rede</li>
              <li><strong>Liberdade de Código:</strong> Direito a criar e executar algoritmos</li>
              <li><strong>Governança Participativa:</strong> Voto direto em decisões coletivas</li>
            </ul>
          </div>
        </article>

        <article className="bio-article">
          <div
            className="collapsible article-header"
            onClick={() => toggleArticle('art12')}
          >
            <span className={activeArticles.has('art12') ? 'rotate-90 inline-block' : 'inline-block'}>▶</span>
            Artigo 12 — Proof of Life
            <span className="bio-badge">Biomimético</span>
          </div>
          <div className={`content ${activeArticles.has('art12') ? 'active' : ''}`}>
            <p className="mb-2">
              <strong>Caput:</strong> Todo cidadão digital deve provar atividade periódica 
              (Proof of Life) para manter direitos ativos e receber RBU.
            </p>
            <p className="mb-2">
              <strong>§1º</strong> Mecanismos de prova aceitos:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Transação assinada com chave privada (mínimo mensal)</li>
              <li>Participação em votação de governança</li>
              <li>Contribuição validada em DAO</li>
              <li>Interação com smart contracts do ecossistema</li>
            </ul>
            <p className="mb-2 mt-2">
              <strong>§2º</strong> Falha em provar vida por 90 dias resulta em:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Suspensão de pagamentos de RBU</li>
              <li>Congelamento temporário de direitos de voto</li>
              <li>Ativação de protocolo de recuperação de wallet</li>
            </ul>
          </div>
        </article>
      </section>

      <section id="titulo-iii" className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-purple-400">
          Título III — Organizações Autônomas Descentralizadas
        </h2>

        <article className="bio-article">
          <div
            className="collapsible article-header"
            onClick={() => toggleArticle('art31')}
          >
            <span className={activeArticles.has('art31') ? 'rotate-90 inline-block' : 'inline-block'}>▶</span>
            Artigo 31 — Natureza das DAOs
          </div>
          <div className={`content ${activeArticles.has('art31') ? 'active' : ''}`}>
            <p className="mb-2">
              <strong>Caput:</strong> As Organizações Autônomas Descentralizadas (DAOs) são 
              entidades jurídicas autônomas regidas por smart contracts imutáveis.
            </p>
            <p className="mb-2">
              <strong>§1º</strong> Características essenciais:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Governança descentralizada via tokens</li>
              <li>Treasury gerida por multisig ou timelock</li>
              <li>Regras codificadas em Solidity auditado</li>
              <li>Transparência total de operações on-chain</li>
            </ul>
          </div>
        </article>
      </section>

      <section id="apendices" className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-purple-400">Apêndices Técnicos</h2>

        <div className="appendix">
          <h3 className="text-xl font-semibold mb-4">Apêndice A — Smart Contracts Core</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>SovereignWallet.sol:</strong> Carteira multi-assinatura com recuperação social</li>
            <li><strong>GovernanceToken.sol:</strong> ERC-20 com snapshot voting</li>
            <li><strong>DAOMitosis.sol:</strong> Processo automatizado de divisão organizacional</li>
            <li><strong>ProofOfLife.sol:</strong> Validação de atividade para RBU</li>
            <li><strong>SovereignCurrency.sol:</strong> Moeda estável algorítmica</li>
          </ul>
          <p className="mt-4">
            <a 
              href="/contracts" 
              className="text-purple-400 hover:text-pink-400 font-semibold"
            >
              → Ver implementação completa dos contratos
            </a>
          </p>
        </div>

        <div className="appendix">
          <h3 className="text-xl font-semibold mb-4">Apêndice B — Arquitetura de Rede</h3>
          <p className="mb-2">Stack tecnológico:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Camada 1:</strong> Ethereum (segurança)</li>
            <li><strong>Camada 2:</strong> Arbitrum/Optimism (escalabilidade)</li>
            <li><strong>Storage:</strong> IPFS/Arweave (dados permanentes)</li>
            <li><strong>Oracles:</strong> Chainlink (dados externos)</li>
            <li><strong>Indexing:</strong> The Graph (queries eficientes)</li>
          </ul>
        </div>

        <div className="appendix">
          <h3 className="text-xl font-semibold mb-4">Apêndice C — Métricas de Governança</h3>
          <p className="mb-2">Indicadores biomimétikos de saúde organizacional:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Coesão Social:</strong> Dunbar Ratio (membros/150)</li>
            <li><strong>Participação:</strong> Voting turnout médio</li>
            <li><strong>Descentralização:</strong> Gini coefficient de tokens</li>
            <li><strong>Resiliência:</strong> Número de nós validadores</li>
            <li><strong>Adaptabilidade:</strong> Taxa de aprovação de propostas</li>
          </ul>
        </div>
      </section>

      <footer className="mt-12 pt-6 border-t border-purple-500/30 text-center text-sm opacity-70">
        <p>
          Cybersyn 2.0 — Versão Biomimética Completa
        </p>
        <p className="mt-2">
          Implementada via smart contracts auditados e open-source
        </p>
        <p className="mt-2">
          <a href="/contracts" className="text-purple-400 hover:text-pink-400">
            Ver Contratos
          </a>
          {' • '}
          <a href="/constituicao" className="text-purple-400 hover:text-pink-400">
            Versão Resumida
          </a>
          {' • '}
          <a href="/zec-simulator" className="text-purple-400 hover:text-pink-400">
            Simulador ZEC
          </a>
        </p>
      </footer>
    </BookLayout>
  )
}
