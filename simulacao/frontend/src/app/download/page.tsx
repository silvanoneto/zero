'use client'

import BookLayout from '@/components/BookLayout'
import { useState } from 'react'
import { Download, FileText, Globe, BookOpen, Star, Share2, GitFork, Code } from 'lucide-react'

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
      <h3 className="font-semibold text-base sm:text-lg mb-4">Conteúdo</h3>
      <a href="#download" className="block py-2 text-sm sm:text-base hover:text-purple-400 transition-colors">
        📥 Download
      </a>
      <a href="#formats" className="block py-2 text-sm sm:text-base hover:text-purple-400 transition-colors">
        📚 Formatos
      </a>
      <a href="#contents" className="block py-2 text-sm sm:text-base hover:text-purple-400 transition-colors">
        📖 Conteúdo
      </a>
      <a href="#license" className="block py-2 text-sm sm:text-base hover:text-purple-400 transition-colors">
        ⚖️ Licença
      </a>
      <a href="#support" className="block py-2 text-sm sm:text-base hover:text-purple-400 transition-colors">
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
      {/* Download Card */}
      <section id="download" className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-2xl p-6 sm:p-8 md:p-12 my-6 sm:my-8 text-center">
        <div className="text-5xl sm:text-6xl md:text-7xl mb-4 animate-bounce">📚</div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          A Revolução Cibernética
        </h2>
        <p className="text-base sm:text-lg md:text-xl mb-3 sm:mb-4 opacity-80">
          Livro completo com manifesto, teoria e 58 imagens
        </p>
        <p className="text-sm sm:text-base md:text-lg mb-6 opacity-70">
          Formato EPUB • 119 MB • Creative Commons BY-NC-SA 4.0
        </p>
        
        <button
          className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg md:text-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          onClick={handleDownload}
          disabled={downloadStarted}
        >
          {downloadStarted ? (
            <>
              <span className="animate-spin">⏳</span>
              <span className="hidden xs:inline">Preparando Download...</span>
              <span className="xs:hidden">Preparando...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Download EPUB</span>
            </>
          )}
        </button>

        {downloadStarted && (
          <div className="mt-4 sm:mt-6 w-full max-w-md mx-auto">
            <div className="h-2 bg-purple-500/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <p className="text-xs sm:text-sm mt-4 sm:mt-6 opacity-60">
          💾 119 MB • ⏱️ ~2 minutos em conexão média
        </p>
      </section>

      {/* Formats Section */}
      <section id="formats" className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-purple-400">
          📚 Formatos Disponíveis
        </h2>

        {/* EPUB Format */}
        <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-xl p-4 sm:p-6 mb-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0">📖</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-purple-400">
                EPUB (Recomendado)
              </h3>
              <p className="mb-3 opacity-80 text-sm sm:text-base">
                Formato universal para e-readers. Compatível com Calibre, Apple Books, 
                Google Play Books, Kindle (via conversão) e todos os leitores modernos.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs sm:text-sm">
                  ✓ Reflowable
                </span>
                <span className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs sm:text-sm">
                  ✓ 58 Imagens HD
                </span>
                <span className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs sm:text-sm">
                  ✓ Índice Navegável
                </span>
                <span className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs sm:text-sm">
                  ✓ Metadados
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Format - Coming Soon */}
        <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-xl p-4 sm:p-6 mb-4 opacity-60">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0">📄</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">PDF (Em breve)</h3>
              <p className="opacity-80 text-sm sm:text-base">
                Versão impressa com layout fixo e numeração de páginas.
              </p>
            </div>
          </div>
        </div>

        {/* HTML Format - Coming Soon */}
        <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-xl p-4 sm:p-6 opacity-60">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0">🌐</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">HTML (Em breve)</h3>
              <p className="opacity-80 text-sm sm:text-base">
                Versão web interativa com busca e navegação rizomática.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contents Section */}
      <section id="contents" className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-purple-400">
          📖 O que você vai encontrar
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-green-500/10 border-l-4 border-green-500 p-4 sm:p-6 rounded-lg">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">📜 Manifesto</h3>
            <p className="opacity-80 text-sm sm:text-base">
              A Morte do Eu Individual e o Nascimento do Eu Coletivo
            </p>
          </div>

          <div className="bg-green-500/10 border-l-4 border-green-500 p-4 sm:p-6 rounded-lg">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">⚖️ Cybersyn 2.0</h3>
            <p className="opacity-80 text-sm sm:text-base">
              Protocolo biomimético de governança descentralizada
            </p>
          </div>

          <div className="bg-green-500/10 border-l-4 border-green-500 p-4 sm:p-6 rounded-lg">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">🧬 DAOs & Mitose</h3>
            <p className="opacity-80 text-sm sm:text-base">
              Organizações adaptativas baseadas no Número de Dunbar
            </p>
          </div>

          <div className="bg-green-500/10 border-l-4 border-green-500 p-4 sm:p-6 rounded-lg">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">💰 Economia P2P</h3>
            <p className="opacity-80 text-sm sm:text-base">
              RBU, moeda soberana e tokens de atenção
            </p>
          </div>

          <div className="bg-green-500/10 border-l-4 border-green-500 p-4 sm:p-6 rounded-lg">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">🔐 Smart Contracts</h3>
            <p className="opacity-80 text-sm sm:text-base">
              Implementação técnica em Solidity
            </p>
          </div>

          <div className="bg-green-500/10 border-l-4 border-green-500 p-4 sm:p-6 rounded-lg">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">🎨 58 Imagens</h3>
            <p className="opacity-80 text-sm sm:text-base">
              Ilustrações conceituais em alta resolução
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-purple-500/10 border-2 border-purple-500/30 rounded-xl">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">📊 Estatísticas</h3>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-400">12</div>
              <div className="opacity-70 text-xs sm:text-sm md:text-base">Artigos Constitucionais</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-400">8</div>
              <div className="opacity-70 text-xs sm:text-sm md:text-base">Smart Contracts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-400">58</div>
              <div className="opacity-70 text-xs sm:text-sm md:text-base">Imagens HD</div>
            </div>
          </div>
        </div>
      </section>

      {/* License Section */}
      <section id="license" className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-purple-400">
          ⚖️ Licença
        </h2>
        <div className="p-4 sm:p-6 bg-blue-500/10 border-2 border-blue-500/30 rounded-xl">
          <h3 className="text-lg sm:text-xl font-semibold mb-3">
            Creative Commons BY-NC-SA 4.0
          </h3>
          <p className="mb-4 opacity-80 text-sm sm:text-base">
            Esta obra está licenciada sob uma Licença Creative Commons 
            Atribuição-NãoComercial-CompartilhaIgual 4.0 Internacional.
          </p>
          <ul className="space-y-2 text-sm sm:text-base">
            <li className="flex items-start gap-2">
              <span className="text-green-400 flex-shrink-0">✓</span>
              <span><strong>Compartilhar:</strong> Copie e redistribua em qualquer meio</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 flex-shrink-0">✓</span>
              <span><strong>Adaptar:</strong> Remixe, transforme e crie a partir do material</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 flex-shrink-0">⚠</span>
              <span><strong>Atribuição:</strong> Você deve dar o crédito apropriado</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 flex-shrink-0">⚠</span>
              <span><strong>Não Comercial:</strong> Não pode usar para fins comerciais</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 flex-shrink-0">⚠</span>
              <span><strong>CompartilhaIgual:</strong> Distribuições devem usar mesma licença</span>
            </li>
          </ul>
          <p className="mt-4 text-xs sm:text-sm opacity-60">
            Para mais informações:{' '}
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 break-all"
            >
              creativecommons.org/licenses/by-nc-sa/4.0/
            </a>
          </p>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-purple-400">
          💜 Apoie o Projeto
        </h2>
        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-xl">
          <p className="text-sm sm:text-base md:text-lg mb-4">
            A Revolução Cibernética é um projeto open-source e gratuito. 
            Se você acredita nessa visão, considere:
          </p>
          <div className="space-y-3 text-sm sm:text-base">
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl flex-shrink-0">⭐</span>
              <span>Star no GitHub para dar visibilidade</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl flex-shrink-0">🔗</span>
              <span>Compartilhar nas redes sociais</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl flex-shrink-0">💬</span>
              <span>Participar das discussões e contribuir com ideias</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl flex-shrink-0">🔧</span>
              <span>Contribuir com código e melhorias</span>
            </div>
          </div>
          <div className="mt-6 flex gap-3 sm:gap-4 justify-center flex-wrap">
            <a
              href="https://github.com/silvanoneto/zero"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors font-semibold text-sm sm:text-base"
            >
              <Star className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Star on GitHub</span>
              <span className="xs:hidden">Star</span>
            </a>
            <a
              href="https://twitter.com/share?text=A%20Revolu%C3%A7%C3%A3o%20Ciborn%C3%A9tica&url=https://obestafera.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors font-semibold text-sm sm:text-base"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Compartilhar</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 pt-6 border-t border-purple-500/30 text-center text-xs sm:text-sm opacity-70">
        <p className="mb-2">A Revolução Cibernética</p>
        <p className="flex flex-wrap justify-center gap-2">
          <a href="/manifesto" className="text-purple-400 hover:text-pink-400">
            Manifesto
          </a>
          <span>•</span>
          <a href="/constituicao-2-0" className="text-purple-400 hover:text-pink-400">
            Cybersyn 2.0
          </a>
          <span>•</span>
          <a href="/contracts" className="text-purple-400 hover:text-pink-400">
            Smart Contracts
          </a>
        </p>
      </footer>
    </BookLayout>
  )
}
