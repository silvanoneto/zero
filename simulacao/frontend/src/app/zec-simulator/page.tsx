'use client';

import { useState } from 'react';

export default function ZECSimulatorPage() {
  const [duration, setDuration] = useState(10);
  const [rbu, setRBU] = useState(50);
  const [volatility, setVolatility] = useState(15);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [events, setEvents] = useState<string[]>([]);

  const runSimulation = () => {
    setIsRunning(true);
    setEvents([]);
    
    const newEvents: string[] = [];
    const controlData = { gdp: 100, unemployment: 8, inequality: 45, satisfaction: 55 };
    const expData = { gdp: 100, unemployment: 8, inequality: 45, satisfaction: 55 };

    // Simulate over time
    for (let year = 1; year <= duration; year++) {
      // Control region (traditional economy)
      controlData.gdp += Math.random() * 3 - 1;
      controlData.unemployment += Math.random() * 2 - 1;
      controlData.inequality += Math.random() * 2;
      controlData.satisfaction -= Math.random() * 3;

      // Experimental region (with RBU)
      const rbuEffect = rbu / 100;
      expData.gdp += Math.random() * 4 + rbuEffect;
      expData.unemployment -= Math.random() * 3 * rbuEffect;
      expData.inequality -= Math.random() * 4 * rbuEffect;
      expData.satisfaction += Math.random() * 5 * rbuEffect;

      // Random events
      if (Math.random() > 0.7) {
        const eventTypes = [
          { msg: `Ano ${year}: ZEC implementa novo projeto de inovação social`, positive: true },
          { msg: `Ano ${year}: Região controle sofre com crise econômica`, positive: false },
          { msg: `Ano ${year}: RBU estimula empreendedorismo local na ZEC`, positive: true },
        ];
        const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        newEvents.push(event.msg);
      }
    }

    setEvents(newEvents);
    setResults({ control: controlData, experimental: expData, rbuPercent: rbu });
    setIsRunning(false);
  };

  return (
    <div style={{
      fontFamily: 'Inter, system-ui, sans-serif',
      background: '#0a0a0f',
      color: '#e0e0e0',
      padding: '2rem',
      minHeight: '100vh',
      lineHeight: 1.6
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            background: 'linear-gradient(135deg, #06b6d4, #10b981)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            Simulador ZEC
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
            Zona Experimental Cibernética
          </p>
        </header>

        <div style={{
          background: '#1a1a2e',
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          border: '1px solid #2d2d44'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#06b6d4' }}>
              Duração da Simulação: <span style={{ float: 'right', color: '#10b981', fontWeight: 'bold' }}>{duration} anos</span>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#06b6d4' }}>
              Renda Básica Universal: <span style={{ float: 'right', color: '#10b981', fontWeight: 'bold' }}>{rbu}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={rbu}
              onChange={(e) => setRBU(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#06b6d4' }}>
              Volatilidade Econômica: <span style={{ float: 'right', color: '#10b981', fontWeight: 'bold' }}>{volatility}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={volatility}
              onChange={(e) => setVolatility(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <button
            onClick={runSimulation}
            disabled={isRunning}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #06b6d4, #10b981)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              opacity: isRunning ? 0.6 : 1,
              transition: 'all 0.3s'
            }}
          >
            {isRunning ? '🔄 Simulando...' : '▶️ Iniciar Simulação'}
          </button>
        </div>

        {results && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: '#1a1a2e',
                padding: '2rem',
                borderRadius: '12px',
                border: '2px solid #f59e0b'
              }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                  🏛️ Região Controle
                </h2>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>PIB per capita</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${results.control.gdp.toFixed(0)}k</div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>Desemprego</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{results.control.unemployment.toFixed(1)}%</div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>Índice Gini</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{results.control.inequality.toFixed(0)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>Satisfação</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{results.control.satisfaction.toFixed(0)}%</div>
                </div>
              </div>

              <div style={{
                background: '#1a1a2e',
                padding: '2rem',
                borderRadius: '12px',
                border: '2px solid #10b981',
                boxShadow: '0 0 30px rgba(16,185,129,0.2)'
              }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                  🧪 ZEC Experimental
                </h2>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>PIB per capita</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>${results.experimental.gdp.toFixed(0)}k</div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>Desemprego</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{results.experimental.unemployment.toFixed(1)}%</div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>Índice Gini</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{results.experimental.inequality.toFixed(0)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>Satisfação</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{results.experimental.satisfaction.toFixed(0)}%</div>
                </div>
              </div>
            </div>

            {events.length > 0 && (
              <div style={{
                background: '#1a1a2e',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid #2d2d44',
                marginBottom: '2rem',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                <h3 style={{ marginBottom: '1rem', color: '#06b6d4' }}>📰 Eventos da Simulação</h3>
                {events.map((event, i) => (
                  <div key={i} style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderLeft: '4px solid #06b6d4',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '4px'
                  }}>
                    {event}
                  </div>
                ))}
              </div>
            )}

            <div style={{
              background: '#1a1a2e',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #2d2d44',
              textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#10b981' }}>
                ✅ Resultado da ZEC
              </h2>
              <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                Com <strong style={{ color: '#10b981' }}>{rbu}% de RBU</strong>, a ZEC demonstrou:
              </p>
              <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', lineHeight: 2 }}>
                <li>🚀 PIB {((results.experimental.gdp - results.control.gdp) / results.control.gdp * 100).toFixed(1)}% superior</li>
                <li>💼 Desemprego {((results.control.unemployment - results.experimental.unemployment) / results.control.unemployment * 100).toFixed(1)}% menor</li>
                <li>⚖️ Desigualdade {((results.control.inequality - results.experimental.inequality) / results.control.inequality * 100).toFixed(1)}% menor</li>
                <li>😊 Satisfação {((results.experimental.satisfaction - results.control.satisfaction) / results.control.satisfaction * 100).toFixed(1)}% maior</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
