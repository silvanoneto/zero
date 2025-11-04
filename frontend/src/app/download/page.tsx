'use client'

import BookLayout from '@/components/BookLayout'
import { useState } from 'react'

export default function DownloadPage() {
  const [downloadStarted, setDownloadStarted] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleDownload = () => {
    setDownloadStarted(true)
    
    // Simular progresso de download
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 10
      setProgress(currentProgress)
      
      if (currentProgress >= 100) {
        clearInterval(interval)
        // Iniciar download real
        const link = document.createElement('a')
        link.href = '/docs/revolucao_cibernetica.epub'
        link.download = 'revolucao_cibernetica.epub'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        setTimeout(() => {
          setDownloadStarted(false)
          setProgress(0)
        }, 2000)
      }
    }, 300)
  }

  const sidebarContent = (
    <nav className="space-y-2">
      <h3 className="font-semibold text-lg mb-4">Conteúdo</h3>
      <a href="#download" className="block py-2 hover:text-purple-400 transition-colors">
        📥 Download
      </a>
      <a href="#formats" className="block py-2 hover:text-purple-400 transition-colors">
        📚 Formatos
      </a>
      <a href="#contents" className="block py-2 hover:text-purple-400 transition-colors">
        📖 Conteúdo
      </a>
      <a href="#license" className="block py-2 hover:text-purple-400 transition-colors">
        ⚖️ Licença
      </a>
      <a href="#support" className="block py-2 hover:text-purple-400 transition-colors">
        💜 Apoie
      </a>
    </nav>
  )

  return (
    <BookLayout
      title="Download - A Revolução Cibernética"
      description="Baixe o livro completo em formato digital"
      sidebarContent={sidebarContent}
    >
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .download-icon {
          font-size: 4rem;
          animation: float 3s ease-in-out infinite;
        }

        .download-card {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
          border-radius: 16px;
          padding: 3rem;
          margin: 2rem 0;
          text-align: center;
          border: 2px solid rgba(139, 92, 246, 0.3);
        }

        .download-button {
          background: linear-gradient(90deg, rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.8));
          color: white;
          padding: 1.25rem 2.5rem;
          border: none;
          border-radius: 12px;
          font-size: 1.2rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
        }

        .download-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(139, 92, 246, 0.4);
        }

        .download-button:active {
          transform: translateY(0);
        }

        .download-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 1rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #ec4899);
          transition: width 0.3s ease;
        }

        .format-card {
          background: rgba(59, 130, 246, 0.1);
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1rem 0;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .feature-item {
          background: rgba(16, 185, 129, 0.1);
          border-left: 4px solid #10b981;
          padding: 1.5rem;
          border-radius: 8px;
        }
      `}</style>

      <section id="download" className="download-card">
        <div className="download-icon">📚</div>
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          A Revolução Cibernética
        </h2>
        <p className="text-xl mb-4 opacity-80">
          Livro completo com manifesto, teoria e 58 imagens
        </p>
        <p className="text-lg mb-6 opacity-70">
          Formato EPUB • 119 MB • Creative Commons BY-NC-SA 4.0
        </p>
        
        <button
          className="download-button"
          onClick={handleDownload}
          disabled={downloadStarted}
        >
          <span>{downloadStarted ? '⏳' : '⬇️'}</span>
          {downloadStarted ? 'Preparando Download...' : 'Download EPUB'}
        </button>

        {downloadStarted && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        <p className="text-sm mt-6 opacity-60">
          💾 119 MB • ⏱️ ~2 minutos em conexão média
        </p>
      </section>

      <section id="formats" className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-purple-400">📚 Formatos Disponíveis</h2>

        <div className="format-card">
          <div className="flex items-start gap-4">
            <div className="text-5xl">📖</div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold mb-2 text-purple-400">EPUB (Recomendado)</h3>
              <p className="mb-3 opacity-80">
                Formato universal para e-readers. Compatível com Calibre, Apple Books, 
                Google Play Books, Kindle (via conversão) e todos os leitores modernos.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  ✓ Reflowable
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  ✓ 58 Imagens HD
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  ✓ Índice Navegável
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  ✓ Metadados
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="format-card opacity-60">
          <div className="flex items-start gap-4">
            <div className="text-5xl">📄</div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold mb-2">PDF (Em breve)</h3>
              <p className="opacity-80">
                Versão impressa com layout fixo e numeração de páginas.
              </p>
            </div>
          </div>
        </div>

        <div className="format-card opacity-60">
          <div className="flex items-start gap-4">
            <div className="text-5xl">🌐</div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold mb-2">HTML (Em breve)</h3>
              <p className="opacity-80">
                Versão web interativa com busca e navegação rizomática.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contents" className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-purple-400">📖 O que você vai encontrar</h2>

        <div className="feature-grid">
          <div className="feature-item">
            <h3 className="text-xl font-semibold mb-2">📜 Manifesto</h3>
            <p className="opacity-80">
              A Morte do Eu Individual e o Nascimento do Eu Coletivo
            </p>
          </div>

          <div className="feature-item">
            <h3 className="text-xl font-semibold mb-2">⚖️ Cybersyn 2.0</h3>
            <p className="opacity-80">
              Protocolo biomimético de governança descentralizada
            </p>
          </div>

          <div className="feature-item">
            <h3 className="text-xl font-semibold mb-2">🧬 DAOs & Mitose</h3>
            <p className="opacity-80">
              Organizações adaptativas baseadas no Número de Dunbar
            </p>
          </div>

          <div className="feature-item">
            <h3 className="text-xl font-semibold mb-2">💰 Economia P2P</h3>
            <p className="opacity-80">
              RBU, moeda soberana e tokens de atenção
            </p>
          </div>

          <div className="feature-item">
            <h3 className="text-xl font-semibold mb-2">🔐 Smart Contracts</h3>
            <p className="opacity-80">
              Implementação técnica em Solidity
            </p>
          </div>

          <div className="feature-item">
            <h3 className="text-xl font-semibold mb-2">🎨 58 Imagens</h3>
            <p className="opacity-80">
              Ilustrações conceituais em alta resolução
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-purple-500/10 border-2 border-purple-500/30 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">📊 Estatísticas</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold text-purple-400">12</div>
              <div className="opacity-70">Artigos Constitucionais</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">8</div>
              <div className="opacity-70">Smart Contracts</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">58</div>
              <div className="opacity-70">Imagens HD</div>
            </div>
          </div>
        </div>
      </section>

      <section id="license" className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-purple-400">⚖️ Licença</h2>
        <div className="p-6 bg-blue-500/10 border-2 border-blue-500/30 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">
            Creative Commons BY-NC-SA 4.0
          </h3>
          <p className="mb-4 opacity-80">
            Esta obra está licenciada sob uma Licença Creative Commons 
            Atribuição-NãoComercial-CompartilhaIgual 4.0 Internacional.
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>Compartilhar:</strong> Copie e redistribua em qualquer meio</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>Adaptar:</strong> Remixe, transforme e crie a partir do material</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">⚠</span>
              <span><strong>Atribuição:</strong> Você deve dar o crédito apropriado</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">⚠</span>
              <span><strong>Não Comercial:</strong> Não pode usar para fins comerciais</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">⚠</span>
              <span><strong>CompartilhaIgual:</strong> Distribuições devem usar mesma licença</span>
            </li>
          </ul>
          <p className="mt-4 text-sm opacity-60">
            Para mais informações:{' '}
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              creativecommons.org/licenses/by-nc-sa/4.0/
            </a>
          </p>
        </div>
      </section>

      <section id="support" className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-purple-400">💜 Apoie o Projeto</h2>
        <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-lg">
          <p className="text-lg mb-4">
            A Revolução Cibernética é um projeto open-source e gratuito. 
            Se você acredita nessa visão, considere:
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⭐</span>
              <span>Star no GitHub para dar visibilidade</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔗</span>
              <span>Compartilhar nas redes sociais</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <span>Participar das discussões e contribuir com ideias</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔧</span>
              <span>Contribuir com código e melhorias</span>
            </div>
          </div>
          <div className="mt-6 flex gap-4 justify-center flex-wrap">
            <a
              href="https://github.com/silvanoneto/revolucao-cibernetica"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors font-semibold"
            >
              🌟 Star on GitHub
            </a>
            <a
              href="https://twitter.com/share?text=A%20Revolu%C3%A7%C3%A3o%20Ciborn%C3%A9tica&url=https://obestafera.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors font-semibold"
            >
              🐦 Compartilhar
            </a>
          </div>
        </div>
      </section>

      <footer className="mt-12 pt-6 border-t border-purple-500/30 text-center text-sm opacity-70">
        <p>A Revolução Cibernética</p>
        <p className="mt-2">
          <a href="/manifesto" className="text-purple-400 hover:text-pink-400">
            Manifesto
          </a>
          {' • '}
          <a href="/constituicao-2-0" className="text-purple-400 hover:text-pink-400">
            Cybersyn 2.0
          </a>
          {' • '}
          <a href="/contracts" className="text-purple-400 hover:text-pink-400">
            Smart Contracts
          </a>
        </p>
      </footer>
    </BookLayout>
  )
}
