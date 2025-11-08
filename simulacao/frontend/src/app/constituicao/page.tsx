import BookLayout from '@/components/BookLayout';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Constituição Viva da Federação Digital do Brasil',
  description:
    'Protocolo descentralizado de governança baseado em cibernética de terceira ordem, blockchain e democracia digital.',
  openGraph: {
    title: 'Constituição Viva da Federação Digital',
    description:
      'Protocolo descentralizado de governança baseado em cibernética e blockchain',
    type: 'article',
    locale: 'pt_BR',
  },
};

export default function ConstituicaoPage() {
  return (
    <BookLayout
      title="Constituição Viva da Federação Digital"
      description="Protocolo Descentralizado de Governança Cibernética"
      sidebarContent={
        <nav className="sidebar-nav" aria-label="Navegação da constituição">
          <a href="#preambulo">📜 Preâmbulo</a>
          <a href="#principios">⚖️ Princípios Fundamentais</a>
          <a href="#direitos">👤 Direitos e Deveres</a>
          <a href="#governanca">🏛️ Governança</a>
          <a href="#smart-contracts">⚡ Smart Contracts</a>
          
          <div style={{ padding: '0.5rem 0', margin: '0.5rem 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
          
          <Link href="/constituicao-2-0" style={{ color: '#10b981', fontWeight: 'bold' }}>
            🌿 Versão 2.0 (Biomimética)
          </Link>
          <Link href="/contracts" style={{ color: '#8b5cf6' }}>
            📄 Implementação Solidity
          </Link>
          <Link href="/zec-simulator" style={{ color: '#f59e0b' }}>
            🧪 Simulador ZEC
          </Link>
        </nav>
      }
    >
      <section id="preambulo">
        <h2>Preâmbulo</h2>
        <p>
          Nós, cidadãos da era digital, reunidos em rede descentralizada,
          invocando os princípios da cibernética de segunda e terceira ordem,
          estabelecemos esta Constituição Viva como protocolo fundamental de
          nossa organização coletiva.
        </p>
        <p>
          Esta não é uma constituição estática, gravada em pedra. É um
          organismo vivo, capaz de evoluir através de processos democráticos
          mediados por smart contracts e governança on-chain.
        </p>
      </section>

      <section id="principios">
        <h2>Princípios Fundamentais</h2>
        
        <h3>Artigo 1º — Soberania Digital</h3>
        <p>
          Todo cidadão tem direito inalienável à soberania sobre seus dados,
          identidade digital e recursos criptográficos. Nenhuma entidade
          centralizada pode confiscar, censurar ou controlar esses ativos sem
          processo democrático transparente.
        </p>

        <h3>Artigo 2º — Governança Descentralizada</h3>
        <p>
          O poder emana do povo e é exercido através de protocolos
          transparentes, auditáveis e democráticos. Toda decisão de impacto
          coletivo deve ser submetida a votação on-chain com quorum mínimo.
        </p>

        <h3>Artigo 3º — Transparência Radical</h3>
        <p>
          Todas as operações de governança, alocação de recursos e tomada de
          decisões devem ser registradas em blockchain público, garantindo
          auditabilidade perpétua e accountability coletiva.
        </p>
      </section>

      <section id="direitos">
        <h2>Direitos e Deveres Digitais</h2>
        
        <h3>Artigo 4º — Direito à Privacidade</h3>
        <p>
          Todo cidadão tem direito à privacidade através de criptografia
          ponta-a-ponta, zero-knowledge proofs e tecnologias de preservação de
          privacidade. A privacidade não é privilégio, é direito fundamental.
        </p>

        <h3>Artigo 5º — Dever de Participação</h3>
        <p>
          Com os direitos vêm deveres. Todo cidadão deve participar ativamente
          dos processos de governança, contribuindo com seu conhecimento e voto
          nas decisões coletivas.
        </p>
      </section>

      <section id="governanca">
        <h2>Sistema de Governança</h2>
        
        <h3>Artigo 6º — Votação Híbrida</h3>
        <p>
          O sistema adota quatro tipos de votação conforme a natureza da
          proposta:
        </p>
        <ul>
          <li><strong>Linear:</strong> 1 token = 1 voto (procedimentos simples)</li>
          <li><strong>Quadrática:</strong> √tokens = votos (alocação de recursos)</li>
          <li><strong>Logarítmica:</strong> log₂(tokens) = votos (decisões técnicas)</li>
          <li><strong>Consenso:</strong> 1 pessoa = 1 voto (questões éticas)</li>
        </ul>

        <h3>Artigo 7º — Organizações Autônomas Descentralizadas</h3>
        <p>
          Toda organização pode se estruturar como DAO, com regras codificadas
          em smart contracts, treasury compartilhado e processos decisórios
          transparentes.
        </p>
      </section>

      <section id="smart-contracts">
        <h2>Implementação em Smart Contracts</h2>
        <p>
          Esta constituição não é apenas texto - é código executável. Cada
          artigo corresponde a um ou mais smart contracts na blockchain,
          garantindo que os princípios aqui estabelecidos sejam
          tecnologicamente garantidos.
        </p>
        <div style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.1))',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid rgba(139,92,246,0.3)',
          marginTop: '1rem'
        }}>
          <p style={{ margin: 0 }}>
            <strong>📄 Ver implementação completa:</strong>{' '}
            <Link href="/contracts" style={{ color: '#8b5cf6', textDecoration: 'underline' }}>
              Smart Contracts em Solidity
            </Link>
          </p>
        </div>
      </section>

      <section>
        <h2>Próximos Passos</h2>
        <p>
          Esta constituição é apenas o começo. Convidamos todos a participar de
          sua evolução através de propostas de melhoria (BIPs - Blockchain
          Improvement Proposals) e votação democrática.
        </p>
      </section>
    </BookLayout>
  );
}
