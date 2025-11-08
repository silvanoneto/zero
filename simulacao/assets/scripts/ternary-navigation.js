/**
 * ============================================
 * SISTEMA DE NAVEGAÇÃO TERNÁRIA
 * Revolução Cibernética - Ontologia Executável
 * ============================================
 * 
 * Gerencia transição entre 3 camadas de conteúdo:
 * -1 (Passado) | 0 (Presente) | +1 (Futuro)
 * 
 * Este sistema performa a temporalidade ternária:
 * O presente não é um ponto - é a TENSÃO entre extremos.
 */

// Estado global
let currentLayer = 0; // -1 (passado), 0 (presente), +1 (futuro)
let isTransitioning = false; // Controle de bloqueio durante transições

/**
 * Mudar camada ativa
 * @param {number} newLayer - Nova camada (-1, 0, ou +1)
 */
function switchLayer(newLayer) {
    // Bloquear se já está em transição
    if (isTransitioning) {
        console.warn('⏸️ Transição em andamento - clique bloqueado');
        return;
    }

    // Validar
    if (newLayer < -1 || newLayer > 1) {
        console.error('❌ Layer inválida:', newLayer);
        return;
    }

    // Se já está na camada solicitada, ignorar
    if (newLayer === currentLayer) {
        console.log('✋ Já está na camada', newLayer);
        return;
    }

    // Ativar bloqueio
    isTransitioning = true;
    showTransitionOverlay();
    console.log(`🔄 Mudando camada: ${currentLayer} → ${newLayer}`);

    // Ocultar camada atual
    const currentSection = document.querySelector(`.layer[data-ternary="${currentLayer}"]`);
    if (currentSection) {
        currentSection.style.display = 'none';
        currentSection.style.visibility = 'hidden';
        currentSection.classList.remove('active');
        console.log(`👻 Ocultando camada ${currentLayer}`);
    }

    // Mostrar nova camada
    const newSection = document.querySelector(`.layer[data-ternary="${newLayer}"]`);
    if (newSection) {
        newSection.style.display = 'block';
        newSection.style.visibility = 'visible';
        newSection.style.opacity = '1';
        newSection.classList.add('active');
        console.log(`✨ Mostrando camada ${newLayer}`);

        // Scroll suave para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.error(`❌ Seção não encontrada para camada ${newLayer}`);
    }

    // Atualizar botões
    document.querySelectorAll('.guaiamum-nav button').forEach(btn => {
        const state = parseInt(btn.dataset.state);
        if (state === newLayer) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        }
    });

    // Atualizar estado do body
    document.body.dataset.currentState = newLayer;
    currentLayer = newLayer;

    // Sincronizar canvas com camada temporal
    syncCanvasWithLayer(newLayer);

    // Atualizar hash da URL
    const hashMap = { '-1': '#past', '0': '#present', '1': '#future' };
    history.pushState(null, '', hashMap[newLayer]);

    console.log(`✅ Camada ternária ativa: ${newLayer}`);

    // Desbloquear após animação (800ms para transição visual completar)
    setTimeout(() => {
        isTransitioning = false;
        hideTransitionOverlay();
        console.log('🔓 Transição concluída - cliques desbloqueados');
    }, 800);
}

/**
 * Mostrar overlay de bloqueio durante transição
 */
function showTransitionOverlay() {
    let overlay = document.getElementById('ternary-transition-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'ternary-transition-overlay';
        overlay.className = 'ternary-transition-overlay';
        document.body.appendChild(overlay);
    }
    overlay.classList.add('active');
}

/**
 * Ocultar overlay de bloqueio
 */
function hideTransitionOverlay() {
    const overlay = document.getElementById('ternary-transition-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

/**
 * Sincronizar canvas com camada temporal
 * Ajusta animação, velocidade e cor do canvas baseado na camada ativa
 * @param {number} layer - Camada atual (-1, 0, ou +1)
 */
function syncCanvasWithLayer(layer) {
    console.log(`🎨 Sincronizando canvas com camada ${layer}`);

    const canvas = document.getElementById('philosophy-canvas');
    if (!canvas) {
        console.warn('⚠️ Canvas não encontrado para sincronização');
        return;
    }

    // Atualizar opacidade baseado na camada
    const opacityMap = {
        '-1': '0.35', // Passado: mais visível (memória)
        '0': '0.25',  // Presente: padrão
        '1': '0.20'   // Futuro: mais sutil (incerteza)
    };

    canvas.style.opacity = opacityMap[layer] || '0.25';
    canvas.style.transition = 'opacity 0.8s ease';

    // Sincronizar com sphericalView se disponível
    if (typeof sphericalView !== 'undefined' && sphericalView) {
        sphericalView.targetBlend = layer;
        console.log(`🌐 sphericalView.targetBlend = ${layer}`);
    }

    // Sincronizar velocidade das formas se disponível
    if (typeof shapes !== 'undefined' && Array.isArray(shapes)) {
        shapes.forEach(shape => {
            // Passado: movimento mais lento (memória é estável)
            // Presente: velocidade normal
            // Futuro: movimento mais rápido (incerteza é dinâmica)
            const speedMultiplier = layer === -1 ? 0.7 : (layer === 1 ? 1.3 : 1.0);

            if (shape.vx) shape.vx *= speedMultiplier;
            if (shape.vy) shape.vy *= speedMultiplier;
        });
        console.log(`⚡ Velocidade das formas ajustada: ${layer === -1 ? '70%' : (layer === 1 ? '130%' : '100%')}`);
    }

    // Ajustar filtro de cor do canvas via CSS
    const filterMap = {
        '-1': 'hue-rotate(-10deg) saturate(0.9)', // Passado: tons avermelhados
        '0': 'none',                                // Presente: normal
        '1': 'hue-rotate(10deg) saturate(1.1)'    // Futuro: tons azulados
    };

    canvas.style.filter = filterMap[layer] || 'none';

    console.log(`✅ Canvas sincronizado com camada ${layer}`);
}

/**
 * Demonstrar Insight #1: Ontologia Executável
 * "Não representamos a realidade relacional - SOMOS a realidade relacional em execução."
 */
function demonstrateOntology() {
    console.log('🎭 Demonstração: Ontologia Executável');

    alert(
        '🎭 Demonstração: Ontologia Executável\n\n' +
        'Observe o canvas ao fundo:\n\n' +
        '• Cada forma não tem "essência" fixa\n' +
        '• Sua identidade emerge das RELAÇÕES:\n' +
        '  ◦ Posição no espectro do caos (-1 a +1)\n' +
        '  ◦ Velocidade relativa\n' +
        '  ◦ Interações com outras formas\n\n' +
        'Isso é ontologia EXECUTÁVEL - não representação!\n' +
        'O canvas vai ficar mais visível por 3 segundos...'
    );

    // Destacar canvas temporariamente
    const canvas = document.getElementById('philosophy-canvas');
    if (canvas) {
        const originalOpacity = canvas.style.opacity || '0.25';
        canvas.style.opacity = '0.8';
        canvas.style.transition = 'opacity 0.5s ease';

        console.log('✨ Canvas destacado');

        setTimeout(() => {
            canvas.style.opacity = originalOpacity;
            console.log('👻 Canvas voltou ao normal');
        }, 3000);
    } else {
        console.warn('⚠️ Canvas não encontrado');
    }
}

/**
 * Demonstrar Insight #2: Temporalidade Ternária
 * "O presente não é um ponto entre passado e futuro - é a tensão dinâmica onde ambos coexistem."
 */
function demonstrateTemporality() {
    console.log('⏳ Demonstração: Temporalidade Ternária');

    alert(
        '⏳ Demonstração: Temporalidade Ternária\n\n' +
        'Use os botões Guaiamum no topo:\n\n' +
        '🦀 ⬆️  Passado (-1)\n' +
        '  → Genealogia intelectual\n' +
        '  → Raízes do projeto\n\n' +
        '☯️  Presente (0)\n' +
        '  → Manifesto (você está aqui)\n' +
        '  → Tensão entre extremos\n\n' +
        '🦀 ⬇️  Futuro (+1)\n' +
        '  → Próximas expansões\n' +
        '  → Possibilidades abertas\n\n' +
        'O presente não é um ponto - é a TENSÃO!\n' +
        'Observe os botões piscando...'
    );

    // Piscar botões sequencialmente
    const buttons = document.querySelectorAll('.guaiamum-nav button');
    buttons.forEach((btn, i) => {
        setTimeout(() => {
            btn.style.transform = 'scale(1.2)';
            btn.style.transition = 'transform 0.3s ease';

            setTimeout(() => {
                btn.style.transform = '';
            }, 300);
        }, i * 400);
    });

    console.log('✨ Animação de temporalidade executada');
}

/**
 * Demonstrar Insight #3: Crítica Performativa
 * "A melhor crítica da automação é um sistema que celebra o caos humano."
 */
function demonstrateCritique() {
    console.log('🤖 Demonstração: Crítica Performativa');

    const response = confirm(
        '🤖 Demonstração: Crítica Performativa\n\n' +
        'Este site tem um CAPTCHA anti-algorítmico:\n\n' +
        '✅ HUMANOS passam facilmente\n' +
        '  → Reconhecemos caos intuitivamente\n' +
        '  → Não seguimos padrões previsíveis\n\n' +
        '❌ BOTS falham consistentemente\n' +
        '  → Movimento caótico é imprevisível\n' +
        '  → Extremos do espectro confundem ML\n\n' +
        'Isso é crítica PERFORMATIVA:\n' +
        'O sistema executa sua própria filosofia!\n\n' +
        'Quer testar o CAPTCHA agora?'
    );

    if (response) {
        console.log('🚀 Redirecionando para página de download...');
        window.location.href = 'download.html';
    } else {
        console.log('👍 Usuário optou por não testar agora');
    }
}

/**
 * Inicializar canvas background
 * Reutiliza a lógica do captcha.js sem interatividade
 */
function initializePhilosophyCanvas() {
    const canvas = document.getElementById('philosophy-canvas');
    if (!canvas) {
        console.warn('⚠️ Canvas #philosophy-canvas não encontrado');
        return;
    }

    console.log('🎨 Inicializando canvas filosófico...');

    // Configurar dimensões
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('❌ Não foi possível obter contexto 2d do canvas');
        return;
    }

    // Detectar mobile
    const isMobile = window.innerWidth <= 768;
    const shapeCount = isMobile ? 5 : 8;

    // Criar formas simples (se captcha.js não estiver disponível)
    if (typeof shapes === 'undefined') {
        console.log('📦 Criando sistema de formas simplificado...');

        const simpleShapes = [];
        for (let i = 0; i < shapeCount; i++) {
            simpleShapes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: 20 + Math.random() * 30,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                chaos: Math.random() * 2 - 1
            });
        }

        // Loop de animação simplificado
        function animate() {
            ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            simpleShapes.forEach(shape => {
                // Atualizar posição
                shape.x += shape.vx;
                shape.y += shape.vy;

                // Bounce nas bordas
                if (shape.x < 0 || shape.x > canvas.width) shape.vx *= -1;
                if (shape.y < 0 || shape.y > canvas.height) shape.vy *= -1;

                // Desenhar
                ctx.fillStyle = shape.color;
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.arc(shape.x, shape.y, shape.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            requestAnimationFrame(animate);
        }

        animate();
        console.log('✅ Canvas simplificado iniciado');
    } else {
        console.log('✅ Usando sistema completo do captcha.js');
    }

    // Redimensionar canvas ao mudar janela
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

/**
 * Inicialização do sistema
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌀 Inicializando Sistema de Navegação Ternária...');

    // Verificar se elementos essenciais existem
    const layersExist = document.querySelectorAll('.layer').length > 0;
    const buttonsExist = document.querySelectorAll('.guaiamum-nav button').length > 0;

    if (!layersExist) {
        console.error('❌ Nenhuma camada (.layer) encontrada!');
        return;
    }

    if (!buttonsExist) {
        console.error('❌ Nenhum botão Guaiamum encontrado!');
        return;
    }

    // Vincular botões Guaiamum
    document.querySelectorAll('.guaiamum-nav button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const state = parseInt(e.currentTarget.dataset.state);
            if (!isNaN(state)) {
                switchLayer(state);
            } else {
                console.error('❌ Estado inválido no botão:', e.currentTarget);
            }
        });

        // Acessibilidade: suporte a teclado
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.currentTarget.click();
            }
        });
    });

    console.log('✅ Botões Guaiamum vinculados');

    // Verificar hash na URL
    const hash = window.location.hash;
    let initialLayer = 0;

    if (hash === '#past') {
        initialLayer = -1;
    } else if (hash === '#future') {
        initialLayer = 1;
    } else if (hash === '#present' || hash === '') {
        initialLayer = 0;
    }

    // Inicializar na camada apropriada
    switchLayer(initialLayer);

    // Inicializar canvas background
    setTimeout(() => {
        initializePhilosophyCanvas();
    }, 100);

    // Navegação via teclas de seta (acessibilidade)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && currentLayer > -1) {
            switchLayer(currentLayer - 1);
        } else if (e.key === 'ArrowRight' && currentLayer < 1) {
            switchLayer(currentLayer + 1);
        }
    });

    console.log('✅ Navegação por teclado habilitada');

    // Expor funções globalmente para uso em HTML
    window.switchLayer = switchLayer;
    window.demonstrateOntology = demonstrateOntology;
    window.demonstrateTemporality = demonstrateTemporality;
    window.demonstrateCritique = demonstrateCritique;

    console.log('🌀 Sistema de navegação ternária inicializado com sucesso!');
    console.log(`📍 Camada inicial: ${initialLayer}`);
});

/**
 * Gerenciar navegação do navegador (back/forward)
 */
window.addEventListener('popstate', () => {
    const hash = window.location.hash;
    let targetLayer = 0;

    if (hash === '#past') targetLayer = -1;
    else if (hash === '#future') targetLayer = 1;
    else targetLayer = 0;

    if (targetLayer !== currentLayer) {
        switchLayer(targetLayer);
    }
});

// Meta-observação: Log de performance
if (performance && performance.mark) {
    performance.mark('ternary-navigation-loaded');
    console.log('📊 Performance mark: ternary-navigation-loaded');
}
