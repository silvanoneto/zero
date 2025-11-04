'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useCanvasBackground } from '@/hooks/useCanvasBackground';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useMobileMenu } from '@/hooks/useMobileMenu';

interface BookLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  sidebarContent?: ReactNode;
}

export default function BookLayout({
  children,
  title,
  description,
  sidebarContent,
}: BookLayoutProps) {
  const canvasRef = useCanvasBackground({
    particleCount: 60,
    connectionDistance: 120,
    particleSpeed: 0.2,
    mouseRadius: 150,
  });
  const scrollProgress = useReadingProgress();
  const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu, close: closeMobileMenu } = useMobileMenu();

  return (
    <>
      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        id="manifesto-background"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />

      {/* Skip to content */}
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>

      {/* Reading Progress Bar */}
      <div
        id="reading-progress"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${scrollProgress}%`,
          height: '3px',
          background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
          zIndex: 9999,
          transition: 'width 0.1s ease',
        }}
      />

      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={toggleMobileMenu}
        aria-label="Abrir menu de navegação"
      >
        <span className="menu-icon-prism" aria-hidden="true">
          △
        </span>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <button
          className="mobile-overlay"
          onClick={closeMobileMenu}
          aria-label="Fechar menu"
        />
      )}

      <div className="main-container">
        {/* Main Content */}
        <main id="main-content" className="content-container" role="main">
          <article itemScope itemType="http://schema.org/Article">
            <meta itemProp="author" content="O Besta Fera" />
            <meta itemProp="inLanguage" content="pt-BR" />

            <header className="header">
              <h1>{title}</h1>
              {description && <p className="subtitle">{description}</p>}
            </header>

            <div itemProp="articleBody">{children}</div>
          </article>
        </main>

        {/* Sidebar */}
        <aside
          className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}
          id="sidebar"
        >
          <div className="sidebar-header">
            <div className="sidebar-title">Revolução Cibernética</div>
          </div>

          <div style={{ margin: '1rem 0', padding: '0 1rem' }}>
            <div
              style={{
                height: '1px',
                background:
                  'linear-gradient(90deg, transparent, var(--border), transparent)',
              }}
            />
          </div>

          {/* Common Navigation */}
          <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
            <Link
              href="/"
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                background:
                  'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.1))',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: '8px',
                color: 'var(--text)',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s',
              }}
            >
              🏠 Página Inicial
            </Link>
          </div>

          <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
            <Link
              href="/manifesto"
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                background:
                  'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(251,146,60,0.1))',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                color: 'var(--text)',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s',
              }}
            >
              🔥 Manifesto
            </Link>
          </div>

          <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
            <Link
              href="/constituicao"
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                background:
                  'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(147,51,234,0.1))',
                border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: '8px',
                color: 'var(--text)',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s',
              }}
            >
              📜 Constituição
            </Link>
          </div>

          {/* Custom Sidebar Content */}
          {sidebarContent}

          {/* Footer */}
          <div
            style={{
              marginTop: 'auto',
              padding: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <a
              href="https://github.com/silvanoneto"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                opacity: 0.7,
                transition: 'opacity 0.3s',
              }}
            >
              <span>⚡ Feito por O Besta Fera</span>
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
