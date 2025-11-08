'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCanvasBackground } from '@/hooks/useCanvasBackground'
import { useCaptcha } from '@/hooks/useCaptcha'

export default function EntryPage() {
  const router = useRouter()
  const canvasRef = useCanvasBackground({
    particleCount: 80,
    connectionDistance: 150,
    particleSpeed: 0.3,
    mouseRadius: 200,
  })

  const {
    challenge,
    selectedAnswer,
    isCorrect,
    attempts,
    isVerified,
    selectAnswer,
    verifyAnswer,
  } = useCaptcha()

  // Redirect if already verified
  useEffect(() => {
    if (isVerified && isCorrect) {
      setTimeout(() => {
        router.push('/')
      }, 1500)
    }
  }, [isVerified, isCorrect, router])

  if (isVerified && !challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-pink-900">
        <canvas
          ref={canvasRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        <div className="text-center z-10 relative">
          <h1 className="text-4xl font-bold text-green-400 mb-4">✓ Acesso Liberado</h1>
          <p className="text-xl text-white opacity-80">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-black to-pink-900">
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <style jsx>{`
        @keyframes rainbowGlow {
          0%, 100% { border-color: #ff0080; box-shadow: 0 0 30px rgba(255, 0, 128, 0.5); }
          14% { border-color: #ff8800; box-shadow: 0 0 30px rgba(255, 136, 0, 0.5); }
          28% { border-color: #ffff00; box-shadow: 0 0 30px rgba(255, 255, 0, 0.5); }
          42% { border-color: #00ff00; box-shadow: 0 0 30px rgba(0, 255, 0, 0.5); }
          57% { border-color: #00ffff; box-shadow: 0 0 30px rgba(0, 255, 255, 0.5); }
          71% { border-color: #0080ff; box-shadow: 0 0 30px rgba(0, 128, 255, 0.5); }
          85% { border-color: #8000ff; box-shadow: 0 0 30px rgba(128, 0, 255, 0.5); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      <div className="relative z-10 max-w-2xl w-full">
        <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 border-4 border-transparent"
          style={{
            animation: 'rainbowGlow 8s infinite linear',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          }}
        >
          <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            🔐 Verificação de Entrada
          </h1>

          {challenge && (
            <>
              <div className="mb-6">
                <p className="text-lg text-white/90 text-center mb-4">
                  {challenge.question}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {challenge.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    disabled={isCorrect !== null}
                    className={`w-full p-4 rounded-lg text-left font-semibold transition-all ${
                      selectedAnswer === index
                        ? isCorrect === null
                          ? 'bg-purple-600 text-white border-2 border-purple-400'
                          : isCorrect
                          ? 'bg-green-600 text-white border-2 border-green-400'
                          : 'bg-red-600 text-white border-2 border-red-400'
                        : 'bg-gray-800 text-white/80 hover:bg-gray-700 border-2 border-gray-700'
                    } ${isCorrect === false && selectedAnswer === index ? 'animate-shake' : ''}`}
                    style={
                      isCorrect === false && selectedAnswer === index
                        ? { animation: 'shake 0.5s' }
                        : isCorrect && selectedAnswer === index
                        ? { animation: 'pulse 0.5s' }
                        : undefined
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>

              {isCorrect === false && (
                <div className="mb-4 p-4 bg-red-900/50 border-2 border-red-500 rounded-lg text-center">
                  <p className="text-red-200 font-semibold">
                    ❌ Resposta incorreta. Tente novamente!
                  </p>
                </div>
              )}

              {isCorrect === true && (
                <div className="mb-4 p-4 bg-green-900/50 border-2 border-green-500 rounded-lg text-center">
                  <p className="text-green-200 font-semibold">
                    ✅ Correto! Redirecionando...
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={verifyAnswer}
                  disabled={selectedAnswer === null || isCorrect !== null}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verificar Resposta
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-white/60 text-sm">
                  Tentativas: {attempts} • Bem-vindo à Revolução Cibernética
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
