/**
 * 🌌 MANIFESTO BACKGROUND - Canvas Filosófico Interativo
 * 
 * Sistema de partículas representando:
 * - Interconexão (partículas conectadas)
 * - Emergência (padrões coletivos)
 * - Segunda ordem (sistema se auto-observa)
 */

class ManifestoBackground {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('❌ Canvas não encontrado:', canvasId);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.options = {
            particleCount: options.particleCount || 80,
            connectionDistance: options.connectionDistance || 150,
            particleSpeed: options.particleSpeed || 0.3,
            mouseRadius: options.mouseRadius || 200,
            colors: options.colors || {
                particles: ['#3b82f6', '#ec4899', '#8b5cf6', '#f59e0b'],
                connections: 'rgba(139, 92, 246, 0.2)'
            },
            ...options
        };

        this.particles = [];
        this.mouse = { x: null, y: null };
        this.animationId = null;

        this.init();
    }

    init() {
        this.resize();
        this.createParticles();

        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        this.animate();
        console.log('🌌 Manifesto Background inicializado');
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];

        for (let i = 0; i < this.options.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.options.particleSpeed,
                vy: (Math.random() - 0.5) * this.options.particleSpeed,
                radius: Math.random() * 2 + 1,
                color: this.options.colors.particles[
                    Math.floor(Math.random() * this.options.colors.particles.length)
                ],
                baseX: null,
                baseY: null
            });
        }

        // Armazenar posições base para efeito de retorno
        this.particles.forEach(p => {
            p.baseX = p.x;
            p.baseY = p.y;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Atualizar e desenhar partículas
        this.particles.forEach(particle => {
            this.updateParticle(particle);
            this.drawParticle(particle);
        });

        // Desenhar conexões
        this.drawConnections();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    updateParticle(particle) {
        // Movimento base
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce nas bordas
        if (particle.x < 0 || particle.x > this.canvas.width) {
            particle.vx *= -1;
        }
        if (particle.y < 0 || particle.y > this.canvas.height) {
            particle.vy *= -1;
        }

        // Interação com mouse
        if (this.mouse.x !== null && this.mouse.y !== null) {
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.options.mouseRadius) {
                const force = (this.options.mouseRadius - distance) / this.options.mouseRadius;
                const angle = Math.atan2(dy, dx);

                particle.x -= Math.cos(angle) * force * 3;
                particle.y -= Math.sin(angle) * force * 3;
            }
        }

        // Suave retorno à posição base quando mouse não está presente
        if (this.mouse.x === null && particle.baseX !== null) {
            const dx = particle.baseX - particle.x;
            const dy = particle.baseY - particle.y;
            particle.x += dx * 0.01;
            particle.y += dy * 0.01;
        }
    }

    drawParticle(particle) {
        this.ctx.fillStyle = particle.color;
        this.ctx.globalAlpha = 0.6;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.options.connectionDistance) {
                    const opacity = 1 - (distance / this.options.connectionDistance);

                    this.ctx.strokeStyle = this.options.colors.connections;
                    this.ctx.globalAlpha = opacity * 0.5;
                    this.ctx.lineWidth = 1;

                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }

        this.ctx.globalAlpha = 1;
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', this.resize);
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('manifesto-background');
    if (canvas) {
        window.manifestoBackground = new ManifestoBackground('manifesto-background', {
            particleCount: 60,
            connectionDistance: 120,
            particleSpeed: 0.2,
            mouseRadius: 150
        });
    }
});
