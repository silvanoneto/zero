import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  baseX: number
  baseY: number
}

interface CanvasBackgroundOptions {
  particleCount?: number
  connectionDistance?: number
  particleSpeed?: number
  mouseRadius?: number
  colors?: {
    particles: string[]
    connections: string
  }
}

export function useCanvasBackground(options: CanvasBackgroundOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: null as number | null, y: null as number | null })
  const animationIdRef = useRef<number | undefined>(undefined)

  const defaultOptions = {
    particleCount: 60,
    connectionDistance: 120,
    particleSpeed: 0.2,
    mouseRadius: 150,
    colors: {
      particles: ['#3b82f6', '#ec4899', '#8b5cf6', '#f59e0b'],
      connections: 'rgba(139, 92, 246, 0.2)',
    },
    ...options,
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Resize canvas
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      createParticles()
    }

    // Create particles
    const createParticles = () => {
      particlesRef.current = []

      for (let i = 0; i < defaultOptions.particleCount; i++) {
        const particle: Particle = {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * defaultOptions.particleSpeed,
          vy: (Math.random() - 0.5) * defaultOptions.particleSpeed,
          radius: Math.random() * 2 + 1,
          color:
            defaultOptions.colors.particles[
              Math.floor(Math.random() * defaultOptions.colors.particles.length)
            ],
          baseX: 0,
          baseY: 0,
        }
        particle.baseX = particle.x
        particle.baseY = particle.y
        particlesRef.current.push(particle)
      }
    }

    // Update particle
    const updateParticle = (particle: Particle) => {
      // Base movement
      particle.x += particle.vx
      particle.y += particle.vy

      // Bounce on edges
      if (particle.x < 0 || particle.x > canvas.width) {
        particle.vx *= -1
      }
      if (particle.y < 0 || particle.y > canvas.height) {
        particle.vy *= -1
      }

      // Mouse interaction
      if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < defaultOptions.mouseRadius) {
          const force = (defaultOptions.mouseRadius - distance) / defaultOptions.mouseRadius
          const angle = Math.atan2(dy, dx)

          particle.x -= Math.cos(angle) * force * 3
          particle.y -= Math.sin(angle) * force * 3
        }
      }

      // Return to base position when mouse is not present
      if (mouseRef.current.x === null) {
        const dx = particle.baseX - particle.x
        const dy = particle.baseY - particle.y
        particle.x += dx * 0.01
        particle.y += dy * 0.01
      }
    }

    // Draw particle
    const drawParticle = (particle: Particle) => {
      ctx.fillStyle = particle.color
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    // Draw connections
    const drawConnections = () => {
      const particles = particlesRef.current

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i]
          const p2 = particles[j]

          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < defaultOptions.connectionDistance) {
            const opacity = 1 - distance / defaultOptions.connectionDistance

            ctx.strokeStyle = defaultOptions.colors.connections
            ctx.globalAlpha = opacity * 0.5
            ctx.lineWidth = 1

            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        updateParticle(particle)
        drawParticle(particle)
      })

      // Draw connections
      drawConnections()

      animationIdRef.current = requestAnimationFrame(animate)
    }

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    // Mouse leave handler
    const handleMouseLeave = () => {
      mouseRef.current.x = null
      mouseRef.current.y = null
    }

    // Initialize
    resize()
    animate()

    // Event listeners
    window.addEventListener('resize', resize)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [defaultOptions.particleCount, defaultOptions.connectionDistance, defaultOptions.particleSpeed, defaultOptions.mouseRadius])

  return canvasRef
}
