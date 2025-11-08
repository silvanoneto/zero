import { useEffect, useState } from 'react'

interface CaptchaChallenge {
  question: string
  options: string[]
  correctAnswer: number
}

const challenges: CaptchaChallenge[] = [
  {
    question: 'Qual é o número de Dunbar (limite cognitivo de relações sociais estáveis)?',
    options: ['50', '150', '500', '1000'],
    correctAnswer: 1,
  },
  {
    question: 'O que significa DAO?',
    options: [
      'Data Access Object',
      'Decentralized Autonomous Organization',
      'Digital Art Online',
      'Database Administration Office',
    ],
    correctAnswer: 1,
  },
  {
    question: 'Qual destes NÃO é um princípio da Cybersyn 2.0?',
    options: [
      'Soberania Digital',
      'Mitose Organizacional',
      'Centralização Hierárquica',
      'Proof of Life',
    ],
    correctAnswer: 2,
  },
  {
    question: 'O que é RBU?',
    options: [
      'Rede Básica Universal',
      'Renda Básica Universal',
      'Recurso Blockchain Único',
      'Registro Biométrico Unificado',
    ],
    correctAnswer: 1,
  },
  {
    question: 'Qual protocolo é usado para storage descentralizado no projeto?',
    options: ['HTTP', 'FTP', 'IPFS', 'SMTP'],
    correctAnswer: 2,
  },
  {
    question: 'O que acontece quando uma DAO atinge 150 membros?',
    options: [
      'Ela é dissolvida',
      'Ela sofre mitose (divisão)',
      'Ela para de aceitar membros',
      'Nada muda',
    ],
    correctAnswer: 1,
  },
  {
    question: 'Qual linguagem é usada para smart contracts neste projeto?',
    options: ['JavaScript', 'Python', 'Solidity', 'Rust'],
    correctAnswer: 2,
  },
  {
    question: 'O que é Proof of Life?',
    options: [
      'Prova de identidade biométrica',
      'Validação periódica de atividade do cidadão',
      'Certificado de nascimento digital',
      'Token de autenticação',
    ],
    correctAnswer: 1,
  },
]

export function useCaptcha() {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [isVerified, setIsVerified] = useState(false)

  // Generate random challenge
  const generateChallenge = () => {
    const randomIndex = Math.floor(Math.random() * challenges.length)
    setChallenge(challenges[randomIndex])
    setSelectedAnswer(null)
    setIsCorrect(null)
  }

  // Initialize with random challenge
  useEffect(() => {
    // Check if already verified in session
    const verified = sessionStorage.getItem('captcha_verified')
    if (verified === 'true') {
      setIsVerified(true)
    } else {
      generateChallenge()
    }
  }, [])

  // Verify answer
  const verifyAnswer = () => {
    if (selectedAnswer === null || !challenge) return

    const correct = selectedAnswer === challenge.correctAnswer
    setIsCorrect(correct)
    setAttempts((prev) => prev + 1)

    if (correct) {
      setIsVerified(true)
      sessionStorage.setItem('captcha_verified', 'true')
      
      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    } else {
      // Generate new challenge after wrong answer
      setTimeout(() => {
        generateChallenge()
      }, 1500)
    }
  }

  // Select answer
  const selectAnswer = (index: number) => {
    if (isCorrect !== null) return // Prevent changing after verification
    setSelectedAnswer(index)
  }

  // Reset captcha
  const reset = () => {
    generateChallenge()
    setAttempts(0)
    setIsVerified(false)
    sessionStorage.removeItem('captcha_verified')
  }

  return {
    challenge,
    selectedAnswer,
    isCorrect,
    attempts,
    isVerified,
    selectAnswer,
    verifyAnswer,
    reset,
  }
}
