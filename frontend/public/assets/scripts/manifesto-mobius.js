/**
 * 🌀 MANIFESTO MÖBIUS - Visualização Integrada
 * 
 * Integra a Fita de Möbius no manifesto, representando:
 * - Tese → Antítese → Síntese (loop infinito)
 * - Os 3 loops do Nhandereko (micro, macro, meta)
 * - Temporalidade não-linear (passado/presente/futuro)
 */

class ManifestoMobius {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('❌ Canvas não encontrado:', canvasId);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.options = {
            width: options.width || window.innerWidth,
            height: options.height || 400,
            segments: options.segments || 100,
            radius: options.radius || 120,
            stripWidth: options.stripWidth || 50,
            rotationSpeed: options.rotationSpeed || 0.003,
            backgroundColor: options.backgroundColor || 'transparent',
            showLabels: options.showLabels !== false,
            ...options
        };

        // Estado
        this.rotation = 0;
        this.autoRotate = true;
        this.currentPhase = 'tese'; // tese, antitese, sintese
        this.phaseColors = {
            tese: { primary: '#dc2626', secondary: '#ef4444' },      // Vermelho (Tese)
            antitese: { primary: '#059669', secondary: '#10b981' },  // Verde (Antítese)
            sintese: { primary: '#2563eb', secondary: '#3b82f6' }    // Azul (Síntese)
        };

        // Pontos de navegação (seções do manifesto)
        this.navigationPoints = [
            { id: 'intro-agencia', label: 'Você está no Loop', phase: 'tese', angle: 0 },
            { id: 'abertura', label: 'Fim da Ilusão Atomística', phase: 'tese', angle: Math.PI / 3 },
            { id: 'ontologia', label: 'Ontologia Relacional', phase: 'tese', angle: 2 * Math.PI / 3 },
            { id: 'primeira-ordem', label: 'Controle (1ª Ordem)', phase: 'antitese', angle: Math.PI },
            { id: 'segunda-ordem', label: 'Observador Observado', phase: 'antitese', angle: 4 * Math.PI / 3 },
            { id: 'etica-praxis', label: 'Ética e Práxis', phase: 'sintese', angle: 5 * Math.PI / 3 },
            { id: 'projeto-urgente', label: 'Projeto Urgente', phase: 'sintese', angle: 2 * Math.PI }
        ];

        this.hoveredPoint = null;
        this.mouseX = 0;
        this.mouseY = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        if (this.options.interactive !== false) {
            this.setupEventListeners();
        }

        this.animate();
        console.log('🌀 Manifesto Möbius inicializado');
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
        // Handler para mousemove - recalcula rect a cada movimento
        this.canvas.addEventListener('mousemove', (e) => {
            // IMPORTANTE: Recalcular rect a cada evento para suportar resize da janela
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;

            // Detectar hover sobre pontos de navegação
            this.hoveredPoint = this.getPointAtMouse(this.mouseX, this.mouseY);
            this.canvas.style.cursor = this.hoveredPoint ? 'pointer' : 'default';
        });

        // Handler para click - também recalcula rect
        this.canvas.addEventListener('click', (e) => {
            if (this.hoveredPoint) {
                this.navigateToSection(this.hoveredPoint.id);
            }
        });

        // Pausar/retomar rotação ao passar o mouse
        this.canvas.addEventListener('mouseenter', () => {
            this.autoRotate = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.autoRotate = true;
            this.hoveredPoint = null;
        });
    }

    getPointAtMouse(mx, my) {
        const centerX = this.options.width / 2;
        const centerY = this.options.height / 2;

        // Raio de detecção aumentado para melhor UX
        const detectionRadius = 25;

        for (const point of this.navigationPoints) {
            const angle = point.angle + this.rotation;
            const x = centerX + Math.cos(angle) * this.options.radius;
            const y = centerY + Math.sin(angle) * this.options.radius;

            const distance = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
            if (distance < detectionRadius) {
                return point;
            }
        }

        return null;
    }

    navigateToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Animação de destaque
            element.style.transition = 'all 0.3s ease';
            element.style.transform = 'scale(1.02)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 300);
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.options.width, this.options.height);

        if (this.autoRotate) {
            this.rotation += this.options.rotationSpeed;
        }

        this.drawMobius();
        this.drawNavigationPoints();
        this.drawPhaseLabels();

        if (this.hoveredPoint) {
            this.drawHoverInfo();
        }

        requestAnimationFrame(() => this.animate());
    }

    drawMobius() {
        const centerX = this.options.width / 2;
        const centerY = this.options.height / 2;
        const { segments, radius, stripWidth } = this.options;

        for (let i = 0; i < segments; i++) {
            const t = (i / segments) * Math.PI * 2;
            const nextT = ((i + 1) / segments) * Math.PI * 2;

            // Determinar fase baseada no ângulo
            const normalizedT = ((t + this.rotation) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
            let phase;
            if (normalizedT < Math.PI * 2 / 3) {
                phase = 'tese';
            } else if (normalizedT < Math.PI * 4 / 3) {
                phase = 'antitese';
            } else {
                phase = 'sintese';
            }

            const colors = this.phaseColors[phase];

            // Calcular posição e torção da fita
            const x = centerX + Math.cos(t + this.rotation) * radius;
            const y = centerY + Math.sin(t + this.rotation) * radius;

            const twist = t / 2; // Möbius twist
            const perpX = -Math.sin(t + this.rotation);
            const perpY = Math.cos(t + this.rotation);

            const width = stripWidth * Math.cos(twist);
            const x1 = x + perpX * width;
            const y1 = y + perpY * width;
            const x2 = x - perpX * width;
            const y2 = y - perpY * width;

            // Desenhar segmento
            this.ctx.strokeStyle = colors.primary;
            this.ctx.lineWidth = 3;
            this.ctx.globalAlpha = 0.6 + 0.4 * Math.abs(Math.cos(twist));

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }

        this.ctx.globalAlpha = 1;
    }

    drawNavigationPoints() {
        const centerX = this.options.width / 2;
        const centerY = this.options.height / 2;

        for (const point of this.navigationPoints) {
            const angle = point.angle + this.rotation;
            const x = centerX + Math.cos(angle) * this.options.radius;
            const y = centerY + Math.sin(angle) * this.options.radius;

            const colors = this.phaseColors[point.phase];
            const isHovered = this.hoveredPoint === point;
            const pointSize = isHovered ? 12 : 7; // Aumentado de 10:6 para 12:7

            // Área de hover visual (círculo transparente)
            if (isHovered) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, 25, 0, Math.PI * 2);
                this.ctx.fillStyle = `${colors.primary}22`; // Transparente
                this.ctx.fill();
            }

            // Glow effect
            if (isHovered) {
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = colors.primary;
            }

            // Desenhar ponto
            this.ctx.fillStyle = colors.primary;
            this.ctx.beginPath();
            this.ctx.arc(x, y, pointSize, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.shadowBlur = 0;

            // Label
            if (isHovered && this.options.showLabels) {
                this.ctx.font = 'bold 14px Inter, sans-serif';
                this.ctx.fillStyle = '#ffffff';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(point.label, x, y - 20);
            }
        }
    }

    drawPhaseLabels() {
        if (!this.options.showLabels) return;

        const centerX = this.options.width / 2;
        const centerY = this.options.height / 2;
        const labelRadius = this.options.radius + 80;

        const phases = [
            { name: 'TESE', angle: Math.PI / 3, color: '#dc2626' },      // Vermelho
            { name: 'ANTÍTESE', angle: Math.PI, color: '#059669' },      // Verde
            { name: 'SÍNTESE', angle: 5 * Math.PI / 3, color: '#2563eb' } // Azul
        ];

        this.ctx.font = 'bold 12px Inter, sans-serif';
        this.ctx.textAlign = 'center';

        for (const phase of phases) {
            const angle = phase.angle + this.rotation;
            const x = centerX + Math.cos(angle) * labelRadius;
            const y = centerY + Math.sin(angle) * labelRadius;

            this.ctx.fillStyle = phase.color;
            this.ctx.globalAlpha = 0.8;
            this.ctx.fillText(phase.name, x, y);
        }

        this.ctx.globalAlpha = 1;
    }

    drawHoverInfo() {
        if (!this.hoveredPoint) return;

        const padding = 10;
        const text = this.hoveredPoint.label;

        this.ctx.font = '14px Inter, sans-serif';
        const metrics = this.ctx.measureText(text);
        const boxWidth = metrics.width + padding * 2;
        const boxHeight = 30;

        const x = this.mouseX + 15;
        const y = this.mouseY - 15;

        // Caixa de fundo
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
        this.ctx.strokeStyle = this.phaseColors[this.hoveredPoint.phase].primary;
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.roundRect(x, y - boxHeight, boxWidth, boxHeight, 8);
        this.ctx.fill();
        this.ctx.stroke();

        // Texto
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(text, x + padding, y - boxHeight / 2 + 5);
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('mobius-canvas');
    if (canvas) {
        window.manifestoMobius = new ManifestoMobius('mobius-canvas', {
            width: Math.min(window.innerWidth - 40, 800),
            height: 400,
            showLabels: true,
            interactive: true
        });
    }
});
