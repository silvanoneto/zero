/**
 * 🌀 TRÊS LOOPS - Visualização Nhandereko
 * 
 * Visualização interativa dos três níveis de feedback loops:
 * Loop 1 (Micro): Microrresistências individuais
 * Loop 2 (Macro): Coalizão e organização coletiva
 * Loop 3 (Meta): Meta-observação e transformação sistêmica
 */

class TresLoops {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('❌ Container não encontrado:', containerId);
            return;
        }

        this.canvas = document.createElement('canvas');
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.options = {
            width: options.width || 600,
            height: options.height || 600,
            interactive: options.interactive !== false,
            showLabels: options.showLabels !== false,
            animationSpeed: options.animationSpeed || 0.002,
            ...options
        };

        // Estado
        this.time = 0;
        this.selectedLoop = null;
        this.hoveredLoop = null;
        this.mouseX = 0;
        this.mouseY = 0;

        // Definição dos loops (RGB TERNÁRIO)
        this.loops = [
            {
                id: 'loop1',
                name: 'Loop 1: Micro',
                description: 'Microrresistências',
                color: '#dc2626',  // Vermelho (Tese/Passado)
                radius: 80,
                particles: 12,
                details: [
                    'Ações individuais',
                    'Pequenas escolhas',
                    'Resistências cotidianas',
                    'Tempo: segundos a minutos'
                ]
            },
            {
                id: 'loop2',
                name: 'Loop 2: Macro',
                description: 'Coalizão Coletiva',
                color: '#059669',  // Verde (Antítese/Presente)
                radius: 140,
                particles: 18,
                details: [
                    'Organização coletiva',
                    'Movimentos sociais',
                    'Redes de solidariedade',
                    'Tempo: dias a meses'
                ]
            },
            {
                id: 'loop3',
                name: 'Loop 3: Meta',
                description: 'Meta-Observação',
                color: '#2563eb',  // Azul (Síntese/Futuro)
                radius: 200,
                particles: 24,
                details: [
                    'Transformação sistêmica',
                    'Mudança de paradigma',
                    'Nova consciência coletiva',
                    'Tempo: meses a anos'
                ]
            }
        ];

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        if (this.options.interactive) {
            this.setupEventListeners();
        }

        this.animate();
        console.log('🌀 Três Loops inicializado');
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.options.width * dpr;
        this.canvas.height = this.options.height * dpr;
        this.canvas.style.width = this.options.width + 'px';
        this.canvas.style.height = this.options.height + 'px';
        this.ctx.scale(dpr, dpr);
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;

            this.hoveredLoop = this.getLoopAtMouse(this.mouseX, this.mouseY);
            this.canvas.style.cursor = this.hoveredLoop ? 'pointer' : 'default';
        });

        this.canvas.addEventListener('click', () => {
            if (this.hoveredLoop) {
                this.selectedLoop = this.selectedLoop === this.hoveredLoop ? null : this.hoveredLoop;
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredLoop = null;
        });
    }

    getLoopAtMouse(mx, my) {
        const centerX = this.options.width / 2;
        const centerY = this.options.height / 2;
        const distance = Math.sqrt((mx - centerX) ** 2 + (my - centerY) ** 2);

        // Checar do maior para o menor
        for (let i = this.loops.length - 1; i >= 0; i--) {
            const loop = this.loops[i];
            const prevRadius = i > 0 ? this.loops[i - 1].radius : 0;

            if (distance >= prevRadius && distance <= loop.radius) {
                return loop;
            }
        }

        return null;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.options.width, this.options.height);

        this.time += this.options.animationSpeed;

        this.drawLoops();
        this.drawConnections();
        this.drawCenterLabel();

        if (this.selectedLoop) {
            this.drawLoopDetails(this.selectedLoop);
        }

        requestAnimationFrame(() => this.animate());
    }

    drawLoops() {
        const centerX = this.options.width / 2;
        const centerY = this.options.height / 2;

        for (let i = 0; i < this.loops.length; i++) {
            const loop = this.loops[i];
            const isHovered = this.hoveredLoop === loop;
            const isSelected = this.selectedLoop === loop;

            // Círculo do loop
            this.ctx.strokeStyle = loop.color;
            this.ctx.lineWidth = isSelected ? 4 : (isHovered ? 3 : 2);
            this.ctx.globalAlpha = isSelected ? 1 : (isHovered ? 0.8 : 0.5);

            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, loop.radius, 0, Math.PI * 2);
            this.ctx.stroke();

            // Partículas circulando
            const speed = (i + 1) * 0.3;
            for (let j = 0; j < loop.particles; j++) {
                const angle = (this.time * speed) + (j / loop.particles) * Math.PI * 2;
                const x = centerX + Math.cos(angle) * loop.radius;
                const y = centerY + Math.sin(angle) * loop.radius;

                this.ctx.fillStyle = loop.color;
                this.ctx.globalAlpha = 0.6;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // Label
            if (this.options.showLabels) {
                const labelAngle = -Math.PI / 4;
                const labelX = centerX + Math.cos(labelAngle) * (loop.radius + 25);
                const labelY = centerY + Math.sin(labelAngle) * (loop.radius + 25);

                this.ctx.fillStyle = loop.color;
                this.ctx.globalAlpha = 1;
                this.ctx.font = 'bold 12px Inter, sans-serif';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(loop.name, labelX, labelY);

                this.ctx.font = '10px Inter, sans-serif';
                this.ctx.globalAlpha = 0.7;
                this.ctx.fillText(loop.description, labelX, labelY + 15);
            }
        }

        this.ctx.globalAlpha = 1;
    }

    drawConnections() {
        const centerX = this.options.width / 2;
        const centerY = this.options.height / 2;

        // Linhas conectando os loops (feedback fractal)
        for (let i = 0; i < this.loops.length - 1; i++) {
            const loop1 = this.loops[i];
            const loop2 = this.loops[i + 1];

            const angle = this.time * 0.5;
            const x1 = centerX + Math.cos(angle) * loop1.radius;
            const y1 = centerY + Math.sin(angle) * loop1.radius;
            const x2 = centerX + Math.cos(angle) * loop2.radius;
            const y2 = centerY + Math.sin(angle) * loop2.radius;

            const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, loop1.color);
            gradient.addColorStop(1, loop2.color);

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 1;
            this.ctx.globalAlpha = 0.3;
            this.ctx.setLineDash([5, 5]);

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();

            this.ctx.setLineDash([]);
        }

        this.ctx.globalAlpha = 1;
    }

    drawCenterLabel() {
        const centerX = this.options.width / 2;
        const centerY = this.options.height / 2;

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('NHANDEREKO', centerX, centerY - 10);

        this.ctx.font = '11px Inter, sans-serif';
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillText('Nosso Modo de Ser', centerX, centerY + 10);
        this.ctx.globalAlpha = 1;
    }

    drawLoopDetails(loop) {
        const padding = 15;
        const lineHeight = 20;
        const boxWidth = 250;
        const boxHeight = padding * 2 + lineHeight * (loop.details.length + 1);

        const x = this.options.width - boxWidth - 20;
        const y = 20;

        // Caixa de fundo
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.95)';
        this.ctx.strokeStyle = loop.color;
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.roundRect(x, y, boxWidth, boxHeight, 12);
        this.ctx.fill();
        this.ctx.stroke();

        // Título
        this.ctx.fillStyle = loop.color;
        this.ctx.font = 'bold 14px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(loop.name, x + padding, y + padding + 12);

        // Detalhes
        this.ctx.fillStyle = '#e0e0e0';
        this.ctx.font = '12px Inter, sans-serif';

        loop.details.forEach((detail, i) => {
            this.ctx.fillText(
                '• ' + detail,
                x + padding,
                y + padding + lineHeight * (i + 2)
            );
        });

        // Instruções
        this.ctx.fillStyle = '#888';
        this.ctx.font = 'italic 10px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            'Clique novamente para fechar',
            x + boxWidth / 2,
            y + boxHeight + 15
        );
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('tres-loops-container');
    if (container) {
        window.tresLoops = new TresLoops('tres-loops-container', {
            width: Math.min(window.innerWidth - 40, 600),
            height: 600,
            showLabels: true,
            interactive: true
        });
    }
});
