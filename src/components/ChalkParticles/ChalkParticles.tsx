import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  vx: number
  vy: number
  opacity: number
  color: string
}

const COLORS = [
  'rgba(245,240,232,',
  'rgba(245,215,110,',
  'rgba(135,206,235,',
]

const ChalkParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const particles = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    particles.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4 - 0.15,
      opacity: Math.random() * 0.45 + 0.05,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.current.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.opacity -= 0.0008
        if (p.opacity <= 0 || p.y < -10) {
          p.x = Math.random() * canvas.width
          p.y = canvas.height + 5
          p.opacity = Math.random() * 0.45 + 0.05
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.opacity})`
        ctx.fill()
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

export default ChalkParticles
