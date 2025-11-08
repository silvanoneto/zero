const formatos = {
    epub: {
        arquivo: 'docs/revolucao_cibernetica.epub',
        tamanho: '7.9 MB',
        icone: '📚',
        nome: 'EPUB',
        descricao: 'Formato universal para e-books'
    },
    pdf: {
        arquivo: 'docs/revolucao_cibernetica.pdf',
        tamanho: '8.0 MB',
        icone: '📄',
        nome: 'PDF',
        descricao: 'Documento PDF completo com imagens'
    },
    xml: {
        arquivo: 'docs/revolucao_cibernetica.min.xml',
        tamanho: '2.0 MB',
        icone: '🤖',
        nome: 'XML',
        descricao: 'Dados estruturados para agentes de IA'
    },
    jsonl: {
        arquivo: 'docs/revolucao_cibernetica.jsonl',
        tamanho: '3.2 MB',
        icone: '⚡',
        nome: 'JSONL',
        descricao: 'JSON Lines otimizado para LLMs e streaming'
    }
};

// Detectar formato do parâmetro GET
const urlParams = new URLSearchParams(window.location.search);
const formatoParam = urlParams.get('formato') || 'epub';
const formato = formatos[formatoParam] || formatos.epub;

// Atualizar página com informações do formato
window.addEventListener('DOMContentLoaded', function () {
    // Atualizar título da página
    const titleElement = document.querySelector('.download-title');
    if (titleElement) {
        titleElement.textContent = `A Revolução Cibernética`;
    }

    // Atualizar subtítulo
    const subtitleElement = document.querySelector('.download-subtitle');
    if (subtitleElement) {
        if (formatoParam === 'pdf') {
            subtitleElement.textContent = 'Baixe o livro completo em formato PDF com todos os estilos e imagens preservados';
        } else if (formatoParam === 'xml') {
            subtitleElement.textContent = 'Baixe o conteúdo estruturado em XML para processamento por IA, RAG, embeddings e análise semântica';
        } else if (formatoParam === 'jsonl') {
            subtitleElement.textContent = 'Baixe em formato JSONL (JSON Lines) otimizado para streaming, embeddings, RAG e fine-tuning de LLMs';
        } else {
            subtitleElement.textContent = 'Baixe o livro completo em formato EPUB para ler offline em qualquer dispositivo';
        }
    }

    // Atualizar ícone
    document.querySelector('.download-icon').textContent = formato.icone;

    // Atualizar botão
    const btnText = document.querySelector('.download-button span:last-child');
    if (btnText) {
        btnText.textContent = `Baixar ${formato.nome}`;
    }

    // Atualizar info de tamanho (primeiro .info-value)
    const tamanhoElements = document.querySelectorAll('.info-value');
    if (tamanhoElements[0]) {
        tamanhoElements[0].textContent = formato.tamanho;
    }

    // Atualizar info de formato (último .info-value)
    if (tamanhoElements[3]) {
        if (formatoParam === 'pdf') {
            tamanhoElements[3].textContent = 'PDF';
        } else if (formatoParam === 'xml') {
            tamanhoElements[3].textContent = 'XML';
        } else if (formatoParam === 'jsonl') {
            tamanhoElements[3].textContent = 'JSONL';
        } else {
            tamanhoElements[3].textContent = 'EPUB 3.0';
        }
    }

    // Atualizar meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.content = `Baixe A Revolução Cibernética em formato ${formato.nome}. ${formato.descricao}.`;
    }

    // Atualizar features list conforme formato
    const featuresList = document.querySelector('.features-list ul');
    if (featuresList && formatoParam === 'xml') {
        featuresList.innerHTML = `
                    <li>Estrutura hierárquica completa (50 seções)</li>
                    <li>1.907 parágrafos indexados e numerados</li>
                    <li>~500 conceitos-chave extraídos automaticamente</li>
                    <li>Glossário com 8 conceitos fundamentais</li>
                    <li>8 orientações para processamento por IA</li>
                    <li>4 temas principais com palavras-chave</li>
                    <li>Ideal para RAG, embeddings e análise semântica</li>
                    <li>Compatível com todos os parsers XML padrão</li>
                `;

        // Atualizar título da features list
        const featuresTitle = document.querySelector('.features-list h3');
        if (featuresTitle) {
            featuresTitle.textContent = '🤖 Dados Estruturados:';
        }

        // Atualizar info de imagens
        if (tamanhoElements[1]) {
            tamanhoElements[1].textContent = 'Não incluídas';
        }
    } else if (featuresList && formatoParam === 'jsonl') {
        featuresList.innerHTML = `
                    <li>5.122 parágrafos como chunks individuais</li>
                    <li>Streaming-friendly: processa linha a linha</li>
                    <li>Cada linha = 1 objeto JSON completo e independente</li>
                    <li>~40% menos tokens que XML (otimizado)</li>
                    <li>Metadados: section_id, concepts, word_count</li>
                    <li>Compatível: OpenAI, LangChain, Pinecone, Weaviate</li>
                    <li>Ideal para: Embeddings, RAG, Fine-tuning</li>
                    <li>Parsing ultra-rápido e baixo uso de memória</li>
                `;

        // Atualizar título da features list
        const featuresTitle = document.querySelector('.features-list h3');
        if (featuresTitle) {
            featuresTitle.textContent = '⚡ JSON Lines (JSONL):';
        }

        // Atualizar info de imagens
        if (tamanhoElements[1]) {
            tamanhoElements[1].textContent = 'Não incluídas';
        }
    } else if (featuresList && formatoParam !== 'xml' && formatoParam !== 'jsonl') {
        // Restaurar lista original para EPUB e PDF (se necessário)
        const featuresTitle = document.querySelector('.features-list h3');
        if (featuresTitle && featuresTitle.textContent !== '✨ O que está incluído:') {
            featuresTitle.textContent = '✨ O que está incluído:';
        }
    }
});

// Variáveis do captcha visual - suporte para múltiplas formas
let captchaShapes = [];  // Array para armazenar todas as formas (círculos, quadrados, triângulos, estrelas)
let clickedOrder = [];
let canvas, ctx;
let currentChallengeType = '';
let canvasScale = 1;
let isMobile = false;
let animationFrameId = null; // Para controlar a animação
let isAnimating = false; // Flag para controlar se a animação está ativa
let lastFrameTime = 0; // Para controle de FPS no mobile
let frameCount = 0; // Contador de frames para mudanças aleatórias
let isCanvasBlocked = false; // Flag para bloquear interação durante retry

// 🌟 PONTO DE LUZ/ESCURIDÃO INVISÍVEL - Sistema de iluminação caótica
let lightPoint = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 150, // Raio de influência
    maxOpacity: 1.0, // Opacidade máxima (no centro do efeito)
    minOpacity: 0.3, // Opacidade mínima (fora do efeito)
    // Sistema de inversão luz/escuridão
    isLight: true,        // true = luz (mais opaco perto), false = escuridão (menos opaco perto)
    nextToggle: 0,        // Frame da próxima inversão
    minInterval: 200,     // Mínimo de frames entre inversões (3.3 seg a 60fps)
    maxInterval: 500,     // Máximo de frames entre inversões (8.3 seg a 60fps)
    // Sistema de fade suave entre luz/escuridão
    currentIntensity: 1.0,  // 1.0 = luz completa, -1.0 = escuridão completa, 0.0 = neutro
    targetIntensity: 1.0,   // Alvo da intensidade
    fadeSpeed: 0.03         // Velocidade do fade (mais lento que fundo)
};

// 🎨 SISTEMA DE INVERSÃO CAÓTICA DE CORES
let colorChaos = {
    enabled: true,
    globalPhase: 0,        // Fase global para sincronização parcial
    phaseSpeed: 0.02,      // Velocidade da fase global
    // Estado do fundo do canvas
    background: {
        isInverted: false, // ⚪ PADRÃO: modo claro (fundo transparente/branco)
        nextToggle: 0,       // Frame da próxima inversão
        minInterval: 180,    // Mínimo de frames entre inversões (3 seg a 60fps)
        maxInterval: 480,    // Máximo de frames entre inversões (8 seg a 60fps)
        // Sistema de fade suave
        currentOpacity: 0,   // Opacidade atual da camada preta (0 = claro, 1 = escuro)
        targetOpacity: 0,    // Opacidade alvo
        fadeSpeed: 0.05      // Velocidade do fade (0.05 = ~20 frames para completar)
    }
};

// 🌐 SISTEMA DE PERSPECTIVA ESFÉRICA CAÓTICA (Fisheye ⇄ Globo)
let sphericalView = {
    enabled: true,
    // NOVO SISTEMA: -1 a +1
    // -1.0 = Fisheye 100%
    //  0.0 = Espaço plano (sem distorção)
    // +1.0 = Globe 100%
    currentBlend: -1.0,      // Valor atual da transição
    targetBlend: -1.0,       // Valor alvo da transição
    blendSpeed: 0.008,       // Velocidade de transição (0.8% por frame)
    nextModeChange: 300,     // Próxima mudança de modo
    minInterval: 300,        // 5 segundos mínimo
    maxInterval: 900,        // 15 segundos máximo
    // Parâmetros fisheye
    fisheyeStrength: 0.8,    // Intensidade da distorção (0-1)
    viewRotation: 0,         // Rotação da visão (radianos)
    viewRotationSpeed: 0.002, // Velocidade de rotação suave
    // Parâmetros globe
    globeRadius: 125,        // Raio do globo imaginário (metade do canvas)
    centerDeadzone: 0.15     // Zona central onde formas desaparecem (15% do raio)
};

// Sistema de timeout adaptativo para botão "Gerar novo desafio"
let lastRegenerateTime = 0; // Timestamp do último clique
let regenerateTimeout = 0; // Timeout atual em segundos
let regenerateTimeoutId = null; // ID do timeout ativo
let regenerateClickHistory = []; // Histórico de cliques para análise

// 🔐 SISTEMA DE COOKIES ANTI-BURLA
const COOKIE_NAME = 'captcha_regenerate_lock';
const COOKIE_HISTORY = 'captcha_history';

// Função simples de "criptografia" (ofuscação)
function encodeLockData(timestamp, timeout) {
    const data = `${timestamp}|${timeout}|${Math.random().toString(36).substring(7)}`;
    return btoa(data); // Base64
}

function decodeLockData(encoded) {
    try {
        const decoded = atob(encoded);
        const [timestamp, timeout] = decoded.split('|');
        return {
            timestamp: parseInt(timestamp) || 0,
            timeout: parseInt(timeout) || 0
        };
    } catch {
        return null;
    }
}

// Salvar estado no cookie
function saveLockToCookie(timestamp, timeout) {
    const encoded = encodeLockData(timestamp, timeout);
    const expires = new Date(Date.now() + 3600000).toUTCString(); // 1 hora
    document.cookie = `${COOKIE_NAME}=${encoded}; expires=${expires}; path=/; SameSite=Strict`;
    console.log('🍪 Lock salvo em cookie');
}

// Carregar estado do cookie
function loadLockFromCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === COOKIE_NAME) {
            const data = decodeLockData(value);
            if (data) {
                console.log('🍪 Lock carregado do cookie:', data);
                return data;
            }
        }
    }
    return null;
}

// Salvar histórico de cliques
function saveHistoryToCookie(history) {
    const encoded = btoa(JSON.stringify(history));
    const expires = new Date(Date.now() + 3600000).toUTCString();
    document.cookie = `${COOKIE_HISTORY}=${encoded}; expires=${expires}; path=/; SameSite=Strict`;
}

// Carregar histórico do cookie
function loadHistoryFromCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === COOKIE_HISTORY) {
            try {
                return JSON.parse(atob(value));
            } catch {
                return [];
            }
        }
    }
    return [];
}

// Limpar cookies
function clearLockCookies() {
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${COOKIE_HISTORY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    console.log('🍪 Cookies limpos');
}

function initCanvas() {
    console.log('🎨 initCanvas() chamado');
    canvas = document.getElementById('captchaCanvas');
    if (!canvas) {
        console.error('❌ Canvas não encontrado!');
        return false;
    }

    ctx = canvas.getContext('2d');
    console.log('✅ Contexto 2d obtido:', !!ctx);

    // Detectar mobile
    isMobile = window.innerWidth <= 640 || 'ontouchstart' in window;

    // Ajustar tamanho do canvas para mobile
    if (isMobile) {
        const containerWidth = Math.min(window.innerWidth - 60, 350);
        canvasScale = containerWidth / 350;
        canvas.width = containerWidth;
        canvas.height = Math.floor(250 * canvasScale);
    } else {
        canvas.width = 350;
        canvas.height = 250;
        canvasScale = 1;
    }

    // Event listeners para click e touch
    canvas.removeEventListener('click', handleCanvasClick);
    canvas.removeEventListener('touchstart', handleCanvasTouch);

    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchstart', handleCanvasTouch, { passive: false });

    // � CRIAR BOTÃO DE MÉTRICAS (canto inferior direito do canvas)
    createMetricsButton();

    // �🛡️ PROTEÇÃO: Impedir fechar modal clicando fora durante bloqueio
    const overlay = document.getElementById('captchaOverlay');
    if (overlay) {
        overlay.removeEventListener('click', handleOverlayClick);
        overlay.addEventListener('click', handleOverlayClick);
    }

    console.log('✅ initCanvas() completo');
    return true;
}

// 📊 SISTEMA DE MÉTRICAS EM TEMPO REAL
let metricsVisible = false;
let metricsPanel = null;
let metricsButton = null;

function createMetricsButton() {
    // Criar botão sempre que houver canvas (habilitar em entry.html e download)
    if (!canvas) {
        console.log('📊 Botão de métricas desabilitado (canvas não inicializado)');
        return;
    }

    // Se estiver na página entry.html, não criar botão flutuante (já existe na caixa de desafio)
    const isEntryPage = window.location.pathname.includes('entry.html');
    if (isEntryPage && document.getElementById('metricsButtonInBox')) {
        console.log('📊 Usando botão de métricas integrado na caixa de desafio');
        // Criar painel de métricas mesmo sem o botão flutuante
        createMetricsPanel();
        // Criar controles guaiamum
        if (!document.querySelector('.guaiamum-controls')) {
            const gu = document.createElement('div');
            gu.className = 'guaiamum-controls';
            gu.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); display:flex; gap:6px; z-index:1000;';

            const directions = [
                { d: 'left', label: '🦞' },
                { d: 'front', label: '↖' },
                { d: 'center', label: '•' },
                { d: 'back', label: '↘' },
                { d: 'right', label: '🦀' }
            ];

            directions.forEach(cfg => {
                const b = document.createElement('button');
                b.className = `guaiamum-btn guaiamum-${cfg.d}`;
                b.title = `Guaiamum: ${cfg.d}`;
                b.innerHTML = cfg.label;
                b.style.cssText = 'width:36px;height:36px;border-radius:8px;border:1px solid rgba(139,92,246,0.4);background:rgba(0,0,0,0.6);color:#fff;cursor:pointer;';
                b.addEventListener('click', () => setGuaiamumPerspective(cfg.d));
                gu.appendChild(b);
            });

            document.body.appendChild(gu);
        }
        return;
    }

    // Verificar se já existe
    if (document.getElementById('metricsButton')) return;

    // Criar botão
    metricsButton = document.createElement('button');
    metricsButton.id = 'metricsButton';
    metricsButton.innerHTML = '📊';
    metricsButton.title = 'Mostrar/Ocultar Métricas';
    metricsButton.style.cssText = `
        position: absolute;
        bottom: 10px;
        right: 10px;
        width: 40px;
        height: 40px;
        border: 2px solid rgba(139, 92, 246, 0.5);
        background: rgba(0, 0, 0, 0.7);
        color: #8b5cf6;
        font-size: 20px;
        border-radius: 8px;
        cursor: pointer;
        z-index: 1000;
        transition: all 0.4s ease;
        backdrop-filter: blur(10px);
    `;

    // Hover effect
    metricsButton.addEventListener('mouseenter', () => {
        metricsButton.style.background = 'rgba(139, 92, 246, 0.2)';
        metricsButton.style.transform = 'scale(1.1)';
    });

    metricsButton.addEventListener('mouseleave', () => {
        metricsButton.style.background = 'rgba(0, 0, 0, 0.7)';
        metricsButton.style.transform = 'scale(1)';
    });

    metricsButton.addEventListener('click', toggleMetrics);

    // Adicionar ao container do canvas
    const canvasContainer = canvas.parentElement;
    canvasContainer.style.position = 'relative';
    canvasContainer.appendChild(metricsButton);

    // 🦀 Criar controles Guaiamum (perspectivas) no centro do topo
    // Apenas criar se não existir
    if (!document.querySelector('.guaiamum-controls')) {
        const gu = document.createElement('div');
        gu.className = 'guaiamum-controls';
        gu.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); display:flex; gap:6px; z-index:1000;';

        const directions = [
            { d: 'left', label: '🦞' },
            { d: 'front', label: '↖' },
            { d: 'center', label: '•' },
            { d: 'back', label: '↘' },
            { d: 'right', label: '🦀' }
        ];

        directions.forEach(cfg => {
            const b = document.createElement('button');
            b.className = `guaiamum-btn guaiamum-${cfg.d}`;
            b.title = `Guaiamum: ${cfg.d}`;
            b.innerHTML = cfg.label;
            b.style.cssText = 'width:36px;height:36px;border-radius:8px;border:1px solid rgba(139,92,246,0.4);background:rgba(0,0,0,0.6);color:#fff;cursor:pointer;';
            b.addEventListener('click', () => setGuaiamumPerspective(cfg.d));
            gu.appendChild(b);
        });

        canvasContainer.appendChild(gu);
    }

    // Criar painel de métricas (inicialmente oculto)
    createMetricsPanel();
}

function createMetricsPanel() {
    // Criar overlay de fundo escuro
    const overlay = document.createElement('div');
    overlay.id = 'metricsOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(8px);
        z-index: 9999;
        display: none;
    `;
    overlay.addEventListener('click', toggleMetrics);
    document.body.appendChild(overlay);

    // Criar painel de métricas
    metricsPanel = document.createElement('div');
    metricsPanel.id = 'metricsPanel';
    metricsPanel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        background: rgba(0, 0, 0, 0.95);
        border: 2px solid rgba(139, 92, 246, 0.5);
        border-radius: 12px;
        padding: 20px;
        padding-top: 50px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: #10b981;
        overflow-y: auto;
        z-index: 10000;
        display: none;
        backdrop-filter: blur(15px);
        transition: background 0.4s ease, color 0.4s ease, border-color 0.4s ease;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
    `;

    // Adicionar botão de fechar
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        width: 30px;
        height: 30px;
        border: none;
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        border-radius: 6px;
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(239, 68, 68, 0.4)';
        closeBtn.style.transform = 'scale(1.1)';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(239, 68, 68, 0.2)';
        closeBtn.style.transform = 'scale(1)';
    });
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMetrics();
    });
    metricsPanel.appendChild(closeBtn);

    document.body.appendChild(metricsPanel);
}

function toggleMetrics() {
    metricsVisible = !metricsVisible;
    const overlay = document.getElementById('metricsOverlay');
    
    metricsPanel.style.display = metricsVisible ? 'block' : 'none';
    if (overlay) {
        overlay.style.display = metricsVisible ? 'block' : 'none';
    }
    
    // Atualizar botão de métricas se existir
    if (metricsButton) {
        metricsButton.innerHTML = metricsVisible ? '📉' : '📊';
    }
    
    // Atualizar botão dentro da caixa se existir
    const metricsButtonInBox = document.getElementById('metricsButtonInBox');
    if (metricsButtonInBox) {
        metricsButtonInBox.innerHTML = metricsVisible ? '📉 Fechar' : '📊 Estatísticas';
    }

    if (metricsVisible) {
        updateMetricsPanel();
    }
}

/**
 * 🦀 GUAIAMUM: Define perspectiva baseado na anatomia funcional do caranguejo
 * 
 * ANATOMIA FUNCIONAL:
 * - Patas Posteriores (back): Longas, robustas → Locomoção rápida → Globe (+1.0) Futuro/Síntese
 * - Patas Anteriores (front): Curtas, equilíbrio → Assistência visual → Fisheye (-1.0) Passado/Expansão
 * - Garra Maior (left): Defesa, competição → Reflexão/Input → Rotação para trás
 * - Garra Menor (right): Manipulação, alimentação → Ação/Output → Rotação para frente
 * - Centro: Sensores de vibração → Equilíbrio plano → 0.0 Presente
 * 
 * @param {string} direction - 'left', 'front', 'center', 'back', 'right'
 */
function setGuaiamumPerspective(direction) {
    // Remove estado ativo de todos os botões
    document.querySelectorAll('.guaiamum-btn').forEach(btn => btn.classList.remove('active'));

    // Define nova perspectiva baseada na anatomia funcional
    switch (direction) {
        case 'front': // 🦵 Patas Anteriores → Equilíbrio Visual (Fisheye)
            sphericalView.targetBlend = -1.0;
            sphericalView.nextModeChange = frameCount + 99999; // Pausa automação
            document.querySelector('.guaiamum-front')?.classList.add('active');
            console.log('🦀 GUAIAMUM [Patas Anteriores]: Equilíbrio Visual → Fisheye (-1.0) | Expansão/Passado');
            break;

        case 'center': // 🎯 Centro → Sensores de Vibração (Plano)
            sphericalView.targetBlend = 0.0;
            sphericalView.nextModeChange = frameCount + 99999;
            document.querySelector('.guaiamum-center')?.classList.add('active');
            console.log('🦀 GUAIAMUM [Centro Sensorial]: Detecção de Vibrações → Plano (0.0) | Equilíbrio/Presente');
            break;

        case 'back': // 🦵 Patas Posteriores → Locomoção Rápida (Globe)
            sphericalView.targetBlend = 1.0;
            sphericalView.nextModeChange = frameCount + 99999;
            document.querySelector('.guaiamum-back')?.classList.add('active');
            console.log('🦀 GUAIAMUM [Patas Posteriores]: Locomoção Rápida → Globe (+1.0) | Síntese/Futuro');
            break;

        case 'left': // 🦞 Garra Maior → Defesa/Competição (Reflexão)
            // Garra Maior: Defesa contra predadores, competição entre machos
            sphericalView.viewRotation -= Math.PI / 4; // Rotaciona -45° (volta ao passado)
            document.querySelector('.guaiamum-left')?.classList.add('active');
            console.log('🦀 GUAIAMUM [Garra Maior]: Defesa/Competição → Rotação -45° | Reflexão sobre Passado (lateralidade futura)');
            break;

        case 'right': // 🦞 Garra Menor → Manipulação/Alimentação (Ação)
            // Garra Menor: Manipulação de alimentos, organismos pequenos
            sphericalView.viewRotation += Math.PI / 4; // Rotaciona +45° (avança ao futuro)
            document.querySelector('.guaiamum-right')?.classList.add('active');
            console.log('🦀 GUAIAMUM [Garra Menor]: Manipulação/Alimentação → Rotação +45° | Ação sobre Futuro (lateralidade futura)');
            break;

        default:
            console.warn('🦀 GUAIAMUM: Direção desconhecida:', direction);
    }

    // Atualiza painel de métricas se visível
    if (metricsVisible) {
        updateMetricsPanel();
    }
}

function updateMetricsPanel() {
    if (!metricsVisible || !metricsPanel) return;

    // 🎨 Detectar modo de cor baseado no fundo
    const backgroundBrightness = colorChaos.enabled
        ? 1.0 - colorChaos.background.currentOpacity
        : 1.0;
    const isDarkBackground = backgroundBrightness < 0.5;

    // Cores dinâmicas baseadas no modo
    const colors = isDarkBackground ? {
        // 🌙 MODO ESCURO: Cores escuras para fundo claro
        title: '#8b5cf6',
        section: '#f59e0b',
        value: '#3b82f6',
        highlight: '#ec4899',
        success: '#059669',
        warning: '#dc2626',
        info: '#6366f1',
        border: '#8b5cf6',
        text: '#1a1a1a'
    } : {
        // ☀️ MODO CLARO: Cores claras para fundo escuro
        title: '#a78bfa',
        section: '#fbbf24',
        value: '#60a5fa',
        highlight: '#f472b6',
        success: '#10b981',
        warning: '#ef4444',
        info: '#818cf8',
        border: '#a78bfa',
        text: '#10b981'
    };

    let html = `<div style="color: ${colors.title}; font-weight: bold; margin-bottom: 10px; font-size: 13px;">⚛️ MÉTRICAS TERNÁRIAS EM TEMPO REAL</div>`;

    // ⚛️ FILOSOFIA TERNÁRIA: Visualização do sistema -1, 0, +1
    html += `<div style="color: ${colors.section}; margin-bottom: 8px;">⚛️ FILOSOFIA TERNÁRIA:</div>`;
    html += `<div style="margin-left: 10px; font-size: 11px;">`;
    html += `<div style="display: flex; align-items: center; margin-bottom: 4px;">`;
    html += `<span style="color: ${colors.warning};">-1</span> ← `;
    html += `<span style="color: ${colors.success};">0</span> → `;
    html += `<span style="color: ${colors.info};">+1</span>`;
    html += `</div>`;
    html += `<div style="opacity: 0.8; font-size: 10px;">`;
    html += `<span style="color: ${colors.warning};">Passado</span> ⇄ `;
    html += `<span style="color: ${colors.success};">Presente</span> ⇄ `;
    html += `<span style="color: ${colors.info};">Futuro</span><br>`;
    html += `<span style="color: ${colors.warning};">Backfeed</span> ⇄ `;
    html += `<span style="color: ${colors.success};">Momento</span> ⇄ `;
    html += `<span style="color: ${colors.info};">Feedback</span>`;
    html += `</div>`;
    html += `</div>`;

    // Métricas globais
    html += `<div style="color: ${colors.section}; margin-top: 10px; margin-bottom: 8px;">🌐 SISTEMA GLOBAL:</div>`;
    html += `<div style="margin-left: 10px;">`;
    html += `Frame: <span style="color: ${colors.value};">${frameCount}</span><br>`;
    html += `Formas: <span style="color: ${colors.value};">${captchaShapes.length}</span><br>`;
    html += `Desafio: <span style="color: ${colors.highlight};">${currentChallengeType}</span><br>`;
    html += `Slow Motion: <span style="color: ${isDirectionBasedChallenge(currentChallengeType) ? colors.success : '#6b7280'}">${isDirectionBasedChallenge(currentChallengeType) ? 'ATIVO' : 'inativo'}</span><br>`;
    html += `</div>`;

    // ⚛️ ESTATÍSTICAS DO CAOS TERNÁRIO
    if (captchaShapes.length > 0) {
        const avgChaos = captchaShapes.reduce((sum, s) => sum + s.chaosLevel, 0) / captchaShapes.length;
        const minChaos = Math.min(...captchaShapes.map(s => s.chaosLevel));
        const maxChaos = Math.max(...captchaShapes.map(s => s.chaosLevel));

        // Contar formas em cada região
        const expansionCount = captchaShapes.filter(s => s.chaosLevel < -0.3).length;
        const equilibriumCount = captchaShapes.filter(s => Math.abs(s.chaosLevel) <= 0.3).length;
        const synthesisCount = captchaShapes.filter(s => s.chaosLevel > 0.3).length;

        html += `<div style="color: ${colors.section}; margin-top: 10px; margin-bottom: 8px;">⚛️ DISTRIBUIÇÃO DO CAOS:</div>`;
        html += `<div style="margin-left: 10px; font-size: 11px;">`;
        html += `Média: <span style="color: ${avgChaos < -0.3 ? colors.warning : avgChaos > 0.3 ? colors.info : colors.success}">${avgChaos.toFixed(2)}</span><br>`;
        html += `Range: <span style="color: ${colors.warning};">${minChaos.toFixed(2)}</span> a <span style="color: ${colors.info};">${maxChaos.toFixed(2)}</span><br>`;
        html += `<div style="margin-top: 4px;">`;
        html += `<span style="color: ${colors.warning};">−</span> Expansão: ${expansionCount} `;
        html += `<span style="color: ${colors.success};">0</span> Equilíbrio: ${equilibriumCount} `;
        html += `<span style="color: ${colors.info};">+</span> Síntese: ${synthesisCount}`;
        html += `</div>`;
        html += `</div>`;
    }

    // Ponto de luz/escuridão
    html += `<div style="color: ${colors.section}; margin-top: 10px; margin-bottom: 8px;">💡 LUZ/ESCURIDÃO:</div>`;
    html += `<div style="margin-left: 10px;">`;
    html += `Posição: (${Math.round(lightPoint.x)}, ${Math.round(lightPoint.y)})<br>`;
    html += `Intensidade: <span style="color: ${lightPoint.currentIntensity > 0 ? colors.section : colors.info}">${lightPoint.currentIntensity.toFixed(2)}</span> ${lightPoint.currentIntensity > 0 ? '💡' : '🌑'}<br>`;
    html += `Velocidade: (${lightPoint.vx.toFixed(2)}, ${lightPoint.vy.toFixed(2)})<br>`;
    html += `</div>`;

    // Perspectiva esférica - Sistema ternário de transição
    html += `<div style="color: ${colors.section}; margin-top: 10px; margin-bottom: 8px;">🌐 PERSPECTIVA TERNÁRIA:</div>`;
    html += `<div style="margin-left: 10px;">`;
    // Determinar modo baseado no blend (-1 → 0 → +1)
    let modeLabel = 'Plano';
    let modeColor = colors.success;
    let modeSymbol = '0';
    if (sphericalView.currentBlend <= -0.5) {
        modeLabel = 'Fisheye';
        modeColor = colors.warning;
        modeSymbol = '-1';
    } else if (sphericalView.currentBlend >= 0.5) {
        modeLabel = 'Globe';
        modeColor = colors.info;
        modeSymbol = '+1';
    }
    html += `Modo: <span style="color: ${modeColor};">${modeLabel} (${modeSymbol})</span><br>`;
    html += `Blend: <span style="color: ${modeColor};">${sphericalView.currentBlend.toFixed(3)}</span><br>`;
    html += `<div style="font-size: 10px; opacity: 0.7;">`;
    html += `<span style="color: ${colors.warning};">-1 Fisheye</span> ⇄ `;
    html += `<span style="color: ${colors.success};">0 Plano</span> ⇄ `;
    html += `<span style="color: ${colors.info};">+1 Globe</span>`;
    html += `</div>`;
    html += `Rotação: <span style="color: ${colors.title};">${(sphericalView.viewRotation * 180 / Math.PI).toFixed(1)}°</span><br>`;
    html += `</div>`;

    // ⚛️ SELEÇÃO INTELIGENTE: Uma forma de cada extremo do espectro ternário
    // Encontrar a forma mais próxima de cada valor característico: -1, 0, +1
    const selectedShapes = [];

    if (captchaShapes.length > 0) {
        // 1. Forma mais próxima de -1 (Expansão Máxima - bordas)
        const closestToMinusOne = captchaShapes.reduce((closest, shape) => {
            const distToMinusOne = Math.abs(shape.chaosLevel - (-1.0));
            const closestDist = Math.abs(closest.chaosLevel - (-1.0));
            return distToMinusOne < closestDist ? shape : closest;
        });
        selectedShapes.push({ shape: closestToMinusOne, label: 'Expansão (-1)' });

        // 2. Forma mais próxima de 0 (Equilíbrio - meio)
        const closestToZero = captchaShapes.reduce((closest, shape) => {
            const distToZero = Math.abs(shape.chaosLevel);
            const closestDist = Math.abs(closest.chaosLevel);
            return distToZero < closestDist ? shape : closest;
        });
        // Evitar duplicata se a mesma forma for mais próxima de -1 e 0
        if (closestToZero !== closestToMinusOne) {
            selectedShapes.push({ shape: closestToZero, label: 'Equilíbrio (0)' });
        }

        // 3. Forma mais próxima de +1 (Síntese Máxima - centro)
        const closestToPlusOne = captchaShapes.reduce((closest, shape) => {
            const distToPlusOne = Math.abs(shape.chaosLevel - 1.0);
            const closestDist = Math.abs(closest.chaosLevel - 1.0);
            return distToPlusOne < closestDist ? shape : closest;
        });
        // Evitar duplicatas
        if (closestToPlusOne !== closestToMinusOne && closestToPlusOne !== closestToZero) {
            selectedShapes.push({ shape: closestToPlusOne, label: 'Síntese (+1)' });
        }
    }

    // Métricas das formas selecionadas (representantes dos 3 extremos ternários)
    html += `<div style="color: ${colors.section}; margin-top: 10px; margin-bottom: 8px;">🔷 CAOS TERNÁRIO DAS FORMAS:</div>`;
    html += `<div style="font-size: 10px; opacity: 0.7; margin-left: 10px; margin-bottom: 6px;">`;
    html += `Mostrando os 3 extremos: <span style="color: ${colors.warning};">-1</span>, `;
    html += `<span style="color: ${colors.success};">0</span>, `;
    html += `<span style="color: ${colors.info};">+1</span>`;
    html += `</div>`;

    selectedShapes.forEach((item, i) => {
        const shape = item.shape;
        // 🌀 SISTEMA TERNÁRIO: -1 (bordas/expansão) ← 0 (equilíbrio) → +1 (centro/síntese)
        const chaosValue = shape.chaosLevel.toFixed(2);
        const absChaos = Math.abs(shape.chaosLevel);
        const chaosPercent = (absChaos * 100).toFixed(0);

        // Determinar label e cor baseado no valor
        let chaosLabel = '';
        let chaosSymbol = '';
        let chaosColor = colors.success;

        if (shape.chaosLevel < -0.7) {
            chaosLabel = 'Expansão Máxima';
            chaosSymbol = '−−';
            chaosColor = colors.warning;
        } else if (shape.chaosLevel < -0.3) {
            chaosLabel = 'Expansão';
            chaosSymbol = '−';
            chaosColor = colors.warning;
        } else if (Math.abs(shape.chaosLevel) < 0.3) {
            chaosLabel = 'Equilíbrio';
            chaosSymbol = '0';
            chaosColor = colors.success;
        } else if (shape.chaosLevel < 0.7) {
            chaosLabel = 'Síntese';
            chaosSymbol = '+';
            chaosColor = colors.info;
        } else {
            chaosLabel = 'Síntese Máxima';
            chaosSymbol = '++';
            chaosColor = colors.info;
        }

        html += `<div style="margin-left: 10px; margin-bottom: 8px; border-left: 2px solid ${colors.border}; padding-left: 8px;">`;
        html += `<span style="color: ${colors.title};">⚛️ ${item.label}</span><br>`;
        html += `Tipo: ${shape.type || 'circle'} | Cor: <span style="color: ${shape.color}">${shape.color}</span><br>`;
        html += `Pos: (${Math.round(shape.x)}, ${Math.round(shape.y)})<br>`;
        html += `Vel: (${shape.vx.toFixed(2)}, ${shape.vy.toFixed(2)})<br>`;
        html += `Z-index: <span style="color: ${colors.success};">${shape.zIndex}</span> → <span style="color: ${colors.success};">${Math.round(shape.targetZ)}</span><br>`;

        // ⚛️ BARRA VISUAL DO ESPECTRO TERNÁRIO
        html += `<div style="margin-top: 4px; margin-bottom: 4px;">`;
        html += `<div style="font-size: 10px; opacity: 0.7; margin-bottom: 2px;">`;
        html += `<span style="color: ${colors.warning};">-1</span> `;
        html += `<span style="color: ${colors.success};">0</span> `;
        html += `<span style="color: ${colors.info};">+1</span>`;
        html += `</div>`;
        // Barra de progresso do caos
        const barWidth = 100; // pixels
        const position = ((shape.chaosLevel + 1) / 2) * barWidth; // Mapear de [-1,1] para [0,100]
        html += `<div style="position: relative; width: ${barWidth}px; height: 8px; background: linear-gradient(to right, ${colors.warning}, ${colors.success}, ${colors.info}); border-radius: 4px; overflow: hidden;">`;
        html += `<div style="position: absolute; left: ${position}px; top: 0; width: 3px; height: 8px; background: white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`;
        html += `</div>`;
        html += `</div>`;

        html += `Caos: <span style="color: ${chaosColor}; font-weight: bold;">${chaosSymbol} ${chaosValue}</span> `;
        html += `<span style="opacity: 0.7;">(${chaosPercent}% | ${chaosLabel})</span><br>`;
        html += `Rotação: ${shape.rotationSpeed.toFixed(3)} rad/f<br>`;
        html += `</div>`;
    });

    metricsPanel.innerHTML = html;

    // Atualizar a cada frame se visível
    if (metricsVisible) {
        requestAnimationFrame(updateMetricsPanel);
    }
}

// Handler para cliques no overlay (fora do modal)
function handleOverlayClick(event) {
    // Se clicou diretamente no overlay (não no modal)
    if (event.target.id === 'captchaOverlay') {
        if (isCanvasBlocked) {
            console.warn('🚫 Modal bloqueado - não é possível fechar clicando fora');
            event.stopPropagation();
            event.preventDefault();
            return;
        }
        // Se não estiver bloqueado, fecha normalmente
        closeCaptcha();
    }
}

// 🎨 SISTEMA DE CONTRASTE ADAPTATIVO PARA UI
function updateUIContrast() {
    // Calcular luminosidade do fundo baseado na opacidade da camada preta
    const backgroundBrightness = colorChaos.enabled
        ? 1.0 - colorChaos.background.currentOpacity  // 1.0 = claro, 0.0 = escuro
        : 1.0; // Padrão claro quando caos desabilitado

    // Detectar se está em modo escuro (quando opacidade > 0.5)
    const isDarkBackground = backgroundBrightness < 0.5;

    // Selecionar elementos da UI
    const challengeBox = document.querySelector('.challenge-box');
    const challengeError = document.querySelector('.challenge-error');

    if (challengeBox) {
        if (isDarkBackground) {
            // 🌙 MODO ESCURO: Caixa clara com texto escuro
            challengeBox.style.background = `rgba(255, 255, 255, ${0.85 + backgroundBrightness * 0.1})`;
            challengeBox.style.color = '#1a1a1a';

            // Título
            const title = challengeBox.querySelector('h2');
            if (title) title.style.color = '#8b5cf6';

            // Texto
            const text = challengeBox.querySelector('p');
            if (text) text.style.color = '#4a5568';

            // Strong elements
            challengeBox.querySelectorAll('strong').forEach(el => {
                el.style.color = '#8b5cf6';
            });

            // Botão regenerar
            const regenBtn = challengeBox.querySelector('.challenge-regenerate button');
            if (regenBtn) {
                regenBtn.style.background = 'rgba(139, 92, 246, 0.15)';
                regenBtn.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                regenBtn.style.color = '#8b5cf6';
            }
        } else {
            // ☀️ MODO CLARO: Caixa escura com texto claro (padrão)
            challengeBox.style.background = `rgba(0, 0, 0, ${0.85 - backgroundBrightness * 0.1})`;
            challengeBox.style.color = '#e5e7eb';

            // Título
            const title = challengeBox.querySelector('h2');
            if (title) title.style.color = '#a78bfa';

            // Texto
            const text = challengeBox.querySelector('p');
            if (text) text.style.color = '#d1d5db';

            // Strong elements
            challengeBox.querySelectorAll('strong').forEach(el => {
                el.style.color = '#a78bfa';
            });

            // Botão regenerar
            const regenBtn = challengeBox.querySelector('.challenge-regenerate button');
            if (regenBtn) {
                regenBtn.style.background = 'rgba(139, 92, 246, 0.1)';
                regenBtn.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                regenBtn.style.color = '#a78bfa';
            }
        }
    }

    // Ajustar caixa de erro também
    if (challengeError) {
        if (isDarkBackground) {
            challengeError.style.background = 'rgba(254, 226, 226, 0.9)'; // Fundo claro vermelho
            challengeError.style.borderColor = 'rgba(239, 68, 68, 0.5)';
            challengeError.style.color = '#dc2626'; // Vermelho escuro
        } else {
            challengeError.style.background = 'rgba(239, 68, 68, 0.1)'; // Fundo escuro vermelho
            challengeError.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            challengeError.style.color = '#ef4444'; // Vermelho claro
        }
    }

    // 📊 Ajustar painel de métricas
    const metricsPanel = document.getElementById('metricsPanel');
    if (metricsPanel) {
        if (isDarkBackground) {
            // 🌙 MODO ESCURO: Painel claro
            metricsPanel.style.background = 'rgba(255, 255, 255, 0.95)';
            metricsPanel.style.borderColor = 'rgba(139, 92, 246, 0.6)';
            metricsPanel.style.color = '#1a1a1a';

            // Atualizar cores inline do HTML das métricas
            if (metricsVisible && metricsPanel.innerHTML) {
                // As cores serão atualizadas na próxima chamada de updateMetricsPanel
                // que já roda a cada frame
            }
        } else {
            // ☀️ MODO CLARO: Painel escuro (padrão)
            metricsPanel.style.background = 'rgba(0, 0, 0, 0.95)';
            metricsPanel.style.borderColor = 'rgba(139, 92, 246, 0.5)';
            metricsPanel.style.color = '#10b981';
        }
    }

    // 🎯 Ajustar botão de métricas
    const metricsButton = document.getElementById('metricsButton');
    if (metricsButton) {
        if (isDarkBackground) {
            // 🌙 MODO ESCURO: Botão claro
            metricsButton.style.background = 'rgba(255, 255, 255, 0.9)';
            metricsButton.style.borderColor = 'rgba(139, 92, 246, 0.6)';
            metricsButton.style.color = '#8b5cf6';
        } else {
            // ☀️ MODO CLARO: Botão escuro (padrão)
            metricsButton.style.background = 'rgba(0, 0, 0, 0.7)';
            metricsButton.style.borderColor = 'rgba(139, 92, 246, 0.5)';
            metricsButton.style.color = '#8b5cf6';
        }
    }
}

// 🎨 FUNÇÃO AUXILIAR: Obter cor adaptativa para números
function getAdaptiveTextColor() {
    // Calcular luminosidade do fundo baseado na opacidade da camada preta
    const backgroundBrightness = colorChaos.enabled
        ? 1.0 - colorChaos.background.currentOpacity  // 1.0 = claro, 0.0 = escuro
        : 1.0; // Padrão claro quando caos desabilitado

    // Detectar se está em modo escuro (quando opacidade > 0.5)
    const isDarkBackground = backgroundBrightness < 0.5;

    // Retornar cor apropriada
    return isDarkBackground ? '#1a1a1a' : '#ffffff'; // Escuro em fundo claro, branco em fundo escuro
}

// Função para gerar velocidade aleatória para as formas
function getRandomVelocity() {
    // Velocidade base ajustada para mobile e desktop
    // Mobile usa velocidade menor para melhor performance
    const baseSpeed = isMobile ? 0.25 : 0.7;

    // Variação aleatória entre 60% e 140% da velocidade base
    // Isso garante que não seja nem muito lento (mínimo 60%) nem muito rápido (máximo 140%)
    const speedVariation = 0.6 + Math.random() * 0.8; // Range: 0.6 a 1.4
    const speed = baseSpeed * speedVariation * canvasScale;

    // Ângulo aleatório (qualquer direção)
    const angle = Math.random() * Math.PI * 2;

    return {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed
    };
}

// Função para gerar velocidade de rotação aleatória
function getRandomRotation() {
    // Velocidade de rotação base (em radianos por frame)
    const baseRotationSpeed = 0.02; // ~1 grau por frame

    // Variação entre 50% e 150% da velocidade base
    const speedVariation = 0.5 + Math.random();
    const rotationSpeed = baseRotationSpeed * speedVariation;

    // 50% de chance de girar no sentido horário ou anti-horário
    const direction = Math.random() < 0.5 ? 1 : -1;

    return rotationSpeed * direction;
}

// Função helper para adicionar forma com velocidade e rotação
function addShape(shapeData, speedMultiplier = 1.0) {
    const velocity = getRandomVelocity();
    const rotation = getRandomRotation();

    // Aplicar multiplicador de velocidade (para testes espaciais usar 0.15-0.2)
    captchaShapes.push({
        ...shapeData,
        vx: velocity.vx * speedMultiplier,
        vy: velocity.vy * speedMultiplier,
        rotation: 0, // Ângulo atual de rotação
        rotationSpeed: rotation * speedMultiplier, // Rotação também reduzida
        // 🎨 Propriedades de inversão caótica de cores (única por forma)
        colorInversion: {
            isInverted: false,
            nextToggle: Math.floor(120 + Math.random() * 360), // 2-8 seg inicial
            minInterval: 90 + Math.floor(Math.random() * 90),  // 1.5-3 seg entre inversões
            maxInterval: 240 + Math.floor(Math.random() * 360), // 4-10 seg entre inversões
            baseColor: shapeData.color // Armazenar cor original
        },
        // 📊 Z-index caótico para controlar ordem de renderização (com fade suave)
        zIndex: Math.floor(Math.random() * 100), // Z-index atual (usado para renderização)
        currentZ: Math.random() * 100,            // Z-index interpolado (float, usado para cálculos)
        targetZ: Math.random() * 100,             // Z-index alvo para interpolação
        zFadeSpeed: 0.02,                         // Velocidade do fade Z (2% por frame)
        nextZIndexChange: Math.floor(150 + Math.random() * 300), // Próxima mudança em 2.5-7.5 seg
        zIndexChangeInterval: { min: 150, max: 450 }, // Intervalo entre mudanças
        // 🔄 Propriedades para colisões suaves
        targetX: shapeData.x,                     // Posição X alvo (para interpolação)
        targetY: shapeData.y,                     // Posição Y alvo (para interpolação)
        collisionFadeSpeed: 0.15,                 // Velocidade de separação suave (15% por frame)
        // 🌪️ Propriedades de entropia do sistema fechado
        chaosLevel: 0,                            // Nível de caos atual (0-1, calculado por frame)
        baseRotationSpeed: rotation * speedMultiplier, // Velocidade de rotação base (sem caos)
        baseVx: velocity.vx * speedMultiplier,    // Velocidade X base (sem caos)
        baseVy: velocity.vy * speedMultiplier     // Velocidade Y base (sem caos)
    });
}


// FUNÇÕES AUXILIARES PARA VARIAÇÃO DE CORES E FORMAS

// Paleta de cores vibrantes (sem cinza, sem preto)
function getRandomColor() {
    const vibrantColors = [
        '#ef4444', '#dc2626', // Vermelhos
        '#f97316', '#fb923c', // Laranjas
        '#eab308', '#fbbf24', // Amarelos
        '#84cc16', '#10b981', '#059669', // Verdes
        '#06b6d4', '#0ea5e9', // Cianos
        '#3b82f6', '#2563eb', // Azuis
        '#6366f1', '#8b5cf6', '#a855f7', '#7c3aed', // Roxos/Violetas
        '#ec4899', '#f43f5e', // Rosas
        '#14b8a6', '#0d9488', // Turquesas
        '#f59e0b', // Âmbar
    ];
    return vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
}

// Gerar múltiplas cores diferentes (sem repetição)
function getRandomColors(count) {
    const vibrantColors = [
        '#ef4444', '#dc2626', '#f97316', '#fb923c', '#eab308', '#fbbf24',
        '#84cc16', '#10b981', '#059669', '#06b6d4', '#0ea5e9', '#3b82f6',
        '#2563eb', '#6366f1', '#8b5cf6', '#a855f7', '#7c3aed', '#ec4899',
        '#f43f5e', '#14b8a6', '#0d9488', '#f59e0b',
    ];

    // Embaralhar e pegar as primeiras 'count' cores
    const shuffled = [...vibrantColors].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// 🎨 INVERSÃO DE COR RGB (converte #RRGGBB em cor invertida)
function invertColor(hex) {
    // Remove # se presente
    hex = hex.replace('#', '');

    // Converte hex para RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Inverte cada canal (255 - valor)
    const invR = (255 - r).toString(16).padStart(2, '0');
    const invG = (255 - g).toString(16).padStart(2, '0');
    const invB = (255 - b).toString(16).padStart(2, '0');

    return `#${invR}${invG}${invB}`;
}

// Gerar tipo de forma aleatório
function getRandomShapeType() {
    const shapes = ['circle', 'square', 'triangle', 'star'];
    return shapes[Math.floor(Math.random() * shapes.length)];
}

// Gerar múltiplos tipos de formas (pode ter repetição)
function getRandomShapeTypes(count) {
    const shapes = ['circle', 'square', 'triangle', 'star'];
    return Array.from({ length: count }, () =>
        shapes[Math.floor(Math.random() * shapes.length)]
    );
}

// Gerar tamanho aleatório dentro de um range
function getRandomRadius(minRadius, maxRadius) {
    return Math.floor(minRadius + Math.random() * (maxRadius - minRadius));
}

// Gerar múltiplos tamanhos variados
function getRandomRadii(count, minRadius, maxRadius) {
    return Array.from({ length: count }, () =>
        getRandomRadius(minRadius, maxRadius)
    );
}


// Função para atualizar posições das formas (animação)
function updateShapesPosition() {
    if (!isAnimating || !canvas || !ctx) {
        console.log('⚠️ Animação interrompida - canvas não disponível');
        stopAnimation();
        return;
    }

    // Throttle de FPS no mobile para melhor performance
    // Desktop: 60 FPS, Mobile: 30 FPS
    const now = performance.now();
    const targetFrameTime = isMobile ? 33 : 16; // 30 FPS mobile, 60 FPS desktop

    if (now - lastFrameTime < targetFrameTime) {
        animationFrameId = requestAnimationFrame(updateShapesPosition);
        return;
    }

    lastFrameTime = now;

    // Incrementar contador de frames
    frameCount++;

    try {
        captchaShapes.forEach(shape => {
            // 🌪️ CALCULAR NÍVEL DE CAOS BASEADO NA DISTÂNCIA DAS BORDAS (sistema fechado)
            shape.chaosLevel = calculateChaosLevel(shape.x, shape.y, canvas.width, canvas.height);

            // 🎯 SLOW MOTION em testes de direção (reduz movimento/rotação/caos)
            const isSlowMotion = isDirectionBasedChallenge(currentChallengeType);
            const slowMotionFactor = isSlowMotion ? 0.3 : 1.0; // 30% da velocidade normal

            // 🌀 CAOS É MÁXIMO NOS EXTREMOS (bordas E centro)
            // chaosLevel: -1 (bordas) → 0 (equilíbrio) → +1 (centro)
            // Caos absoluto: 0 (equilíbrio) → 1 (extremos)
            const absChaos = Math.abs(shape.chaosLevel);

            // Aplicar caos à velocidade (extremos = mais caos = movimento mais errático)
            const chaosMultiplier = 1.0 + (absChaos * 1.5); // 1.0x (equilíbrio) a 2.5x (extremos)
            shape.vx = shape.baseVx * chaosMultiplier * slowMotionFactor;
            shape.vy = shape.baseVy * chaosMultiplier * slowMotionFactor;

            // Aplicar caos à rotação (extremos = mais caos = rotação mais rápida)
            const rotationChaosMultiplier = 1.0 + (absChaos * 2.0); // 1.0x a 3.0x
            shape.rotationSpeed = shape.baseRotationSpeed * rotationChaosMultiplier * slowMotionFactor;

            // Atualizar posição base
            shape.x += shape.vx;
            shape.y += shape.vy;

            // 🔄 INTERPOLAÇÃO SUAVE DE POSIÇÃO (para colisões suaves)
            // Inicializar targetX/targetY se não existirem
            if (shape.targetX === undefined) shape.targetX = shape.x;
            if (shape.targetY === undefined) shape.targetY = shape.y;

            // Interpolar posição atual em direção à posição alvo
            if (Math.abs(shape.x - shape.targetX) > 0.1 || Math.abs(shape.y - shape.targetY) > 0.1) {
                const diffX = shape.targetX - shape.x;
                const diffY = shape.targetY - shape.y;

                // Aplicar interpolação
                shape.x += diffX * shape.collisionFadeSpeed;
                shape.y += diffY * shape.collisionFadeSpeed;

                // Snap quando muito próximo (evitar oscilação infinita)
                if (Math.abs(diffX) < 0.1) shape.x = shape.targetX;
                if (Math.abs(diffY) < 0.1) shape.y = shape.targetY;
            } else {
                // Quando já chegou na posição alvo, sincronizar target com posição atual
                shape.targetX = shape.x;
                shape.targetY = shape.y;
            }

            // Atualizar rotação
            if (shape.rotationSpeed !== undefined) {
                shape.rotation = (shape.rotation || 0) + shape.rotationSpeed;
                // Normalizar ângulo entre 0 e 2π
                shape.rotation = shape.rotation % (Math.PI * 2);
            }

            // NOVA FUNCIONALIDADE: Mudanças aleatórias de direção (movimento orgânico)
            // Cada forma muda de direção em intervalos ÚNICOS e DESSINCRONIZADOS
            if (!shape.nextDirectionChange) {
                // Intervalo variável entre 90-300 frames (1.5-5 seg a 60fps)
                // Cada forma tem seu próprio timing aleatório
                const minFrames = 90 + Math.floor(Math.random() * 60);   // 90-150
                const maxFrames = 180 + Math.floor(Math.random() * 120); // 180-300
                const interval = minFrames + Math.floor(Math.random() * (maxFrames - minFrames));
                shape.nextDirectionChange = frameCount + interval;
            }

            if (frameCount >= shape.nextDirectionChange) {
                // 🌪️ Mudança de direção influenciada pelo caos absoluto
                // Extremos (bordas E centro) = mudanças mais bruscas
                const absChaos = Math.abs(shape.chaosLevel);
                const chaosAngleMultiplier = 1.0 + absChaos; // 1.0x a 2.0x
                const angleChange = (Math.random() - 0.5) * 0.5 * chaosAngleMultiplier; // ±14° a ±28°
                const currentSpeed = Math.sqrt(shape.vx ** 2 + shape.vy ** 2);
                const currentAngle = Math.atan2(shape.vy, shape.vx);
                const newAngle = currentAngle + angleChange;

                // Atualizar velocidades base (sem multiplicador de caos)
                const baseSpeed = Math.sqrt(shape.baseVx ** 2 + shape.baseVy ** 2);
                shape.baseVx = Math.cos(newAngle) * baseSpeed;
                shape.baseVy = Math.sin(newAngle) * baseSpeed;

                // Recalcular velocidades com caos
                const chaosMultiplier = 1.0 + (absChaos * 1.5);
                shape.vx = shape.baseVx * chaosMultiplier;
                shape.vy = shape.baseVy * chaosMultiplier;

                // Chance de inverter rotação aumenta com caos absoluto
                const flipChance = 0.3 + (absChaos * 0.3); // 30% a 60%
                if (Math.random() < flipChance && shape.rotationSpeed !== undefined) {
                    shape.baseRotationSpeed = -shape.baseRotationSpeed;
                }

                // Chance de mudar velocidade de rotação aumenta com caos absoluto
                const changeChance = 0.2 + (absChaos * 0.3); // 20% a 50%
                if (Math.random() < changeChance && shape.rotationSpeed !== undefined) {
                    const rotationChange = 0.8 + Math.random() * 0.4; // 80% a 120%
                    shape.baseRotationSpeed *= rotationChange;
                    // Limitar velocidade de rotação
                    const maxRotationSpeed = isMobile ? 0.03 : 0.04;
                    shape.baseRotationSpeed = Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, shape.baseRotationSpeed));
                }

                // Agendar próxima mudança com intervalo ÚNICO para esta forma
                const minFrames = 90 + Math.floor(Math.random() * 60);   // 90-150
                const maxFrames = 180 + Math.floor(Math.random() * 120); // 180-300
                const interval = minFrames + Math.floor(Math.random() * (maxFrames - minFrames));
                shape.nextDirectionChange = frameCount + interval;
            }

            // Verificar colisão com bordas e inverter direção
            const maxSize = shape.radius * 2; // Considerando o tamanho da forma

            if (shape.x - maxSize / 2 <= 0 || shape.x + maxSize / 2 >= canvas.width) {
                shape.vx = -shape.vx;
                // Ajustar posição para evitar que fique preso na borda
                shape.x = Math.max(maxSize / 2, Math.min(canvas.width - maxSize / 2, shape.x));

                // Ao bater na borda, pequena chance de mudar rotação também
                if (Math.random() < 0.4 && shape.rotationSpeed !== undefined) {
                    shape.rotationSpeed = -shape.rotationSpeed;
                }
            }

            if (shape.y - maxSize / 2 <= 0 || shape.y + maxSize / 2 >= canvas.height) {
                shape.vy = -shape.vy;
                // Ajustar posição para evitar que fique preso na borda
                shape.y = Math.max(maxSize / 2, Math.min(canvas.height - maxSize / 2, shape.y));

                // Ao bater na borda, pequena chance de mudar rotação também
                if (Math.random() < 0.4 && shape.rotationSpeed !== undefined) {
                    shape.rotationSpeed = -shape.rotationSpeed;
                }
            }

            // 🎨 INVERSÃO CAÓTICA DE COR (individual por forma, dessincronizada)
            // BLOQUEADA em desafios que dependem de cores específicas
            if (colorChaos.enabled && shape.colorInversion && !shape.clicked && !isColorBasedChallenge(currentChallengeType)) {
                // Verificar se é hora de inverter a cor desta forma
                if (frameCount >= shape.colorInversion.nextToggle) {
                    // Toggle do estado de inversão
                    shape.colorInversion.isInverted = !shape.colorInversion.isInverted;

                    // Aplicar ou remover inversão
                    if (shape.colorInversion.isInverted) {
                        shape.color = invertColor(shape.colorInversion.baseColor);
                    } else {
                        shape.color = shape.colorInversion.baseColor;
                    }

                    // 🌪️ Intervalo de próxima inversão reduzido pelo caos absoluto (extremos = mais rápido)
                    const absChaos = Math.abs(shape.chaosLevel);
                    const chaosTimeReduction = 1.0 - (absChaos * 0.5); // 1.0x a 0.5x
                    const interval = shape.colorInversion.minInterval +
                        Math.floor(Math.random() * (shape.colorInversion.maxInterval - shape.colorInversion.minInterval));
                    shape.colorInversion.nextToggle = frameCount + Math.floor(interval * chaosTimeReduction);
                }
            }

            // 📊 MUDANÇA CAÓTICA DE Z-INDEX (com transição suave)
            if (frameCount >= shape.nextZIndexChange) {
                // Definir novo z-index alvo aleatório
                shape.targetZ = Math.random() * 100;

                // 🌪️ Intervalo de próxima mudança reduzido pelo caos absoluto (extremos = mais rápido)
                const absChaos = Math.abs(shape.chaosLevel);
                const chaosTimeReduction = 1.0 - (absChaos * 0.5); // 1.0x a 0.5x
                const interval = shape.zIndexChangeInterval.min +
                    Math.floor(Math.random() * (shape.zIndexChangeInterval.max - shape.zIndexChangeInterval.min));
                shape.nextZIndexChange = frameCount + Math.floor(interval * chaosTimeReduction);
            }

            // 🌫️ INTERPOLAR Z-INDEX SUAVEMENTE (velocidade afetada pelo caos e slow motion)
            if (shape.currentZ !== shape.targetZ) {
                const diff = shape.targetZ - shape.currentZ;
                // 🌪️ Caos aumenta velocidade de transição (extremos = mais rápido)
                const absChaos = Math.abs(shape.chaosLevel);
                const chaosFadeMultiplier = 1.0 + (absChaos * 2.0); // 1.0x a 3.0x
                // 🎯 Slow motion reduz velocidade em testes de direção
                const effectiveFadeSpeed = shape.zFadeSpeed * chaosFadeMultiplier * slowMotionFactor;

                if (Math.abs(diff) < effectiveFadeSpeed) {
                    // Próximo do alvo, snap para o valor exato
                    shape.currentZ = shape.targetZ;
                } else {
                    // Interpolar suavemente
                    shape.currentZ += diff * effectiveFadeSpeed;
                }

                // Atualizar zIndex inteiro (usado para ordenação)
                shape.zIndex = Math.floor(shape.currentZ);
            }
        });

        // 🔄 DETECÇÃO E RESOLUÇÃO DE COLISÕES ENTRE FORMAS (com profundidade)
        for (let i = 0; i < captchaShapes.length; i++) {
            for (let j = i + 1; j < captchaShapes.length; j++) {
                const shape1 = captchaShapes[i];
                const shape2 = captchaShapes[j];

                // 📊 VERIFICAR PROFUNDIDADE (z-index) - só colidem se estiverem na mesma camada
                const z1 = shape1.zIndex !== undefined ? shape1.zIndex : 50;
                const z2 = shape2.zIndex !== undefined ? shape2.zIndex : 50;
                const zDifference = Math.abs(z1 - z2);

                // Se estão em camadas muito diferentes (>20 de diferença), não colidem
                if (zDifference > 20) continue;

                // Calcular distância entre centros
                const dx = shape2.x - shape1.x;
                const dy = shape2.y - shape1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Soma dos raios (considera tamanho das formas)
                const minDistance = shape1.radius + shape2.radius;

                // Se estão colidindo
                if (distance < minDistance && distance > 0) {
                    // Normalizar vetor de direção
                    const nx = dx / distance;
                    const ny = dy / distance;

                    // Calcular overlap
                    const overlap = minDistance - distance;

                    // 🔄 COLISÃO SUAVE: definir posições alvo ao invés de mover instantaneamente
                    const separation = overlap * 0.5;
                    shape1.targetX = shape1.x - nx * separation;
                    shape1.targetY = shape1.y - ny * separation;
                    shape2.targetX = shape2.x + nx * separation;
                    shape2.targetY = shape2.y + ny * separation;

                    // Trocar velocidades (colisão elástica simplificada)
                    const tempVx = shape1.vx;
                    const tempVy = shape1.vy;
                    shape1.vx = shape2.vx;
                    shape1.vy = shape2.vy;
                    shape2.vx = tempVx;
                    shape2.vy = tempVy;

                    // Pequena chance de inverter rotação também
                    if (Math.random() < 0.3) {
                        shape1.rotationSpeed = -shape1.rotationSpeed;
                        shape2.rotationSpeed = -shape2.rotationSpeed;
                    }
                }
            }
        }

        // 🎨 INVERSÃO CAÓTICA DO FUNDO DO CANVAS (dessincronizada das formas)
        if (colorChaos.enabled && frameCount >= colorChaos.background.nextToggle) {
            // Toggle do estado de inversão do fundo
            colorChaos.background.isInverted = !colorChaos.background.isInverted;

            // Definir opacidade alvo baseada no estado
            colorChaos.background.targetOpacity = colorChaos.background.isInverted ? 1.0 : 0.0;

            // Agendar próxima inversão do fundo
            const interval = colorChaos.background.minInterval +
                Math.floor(Math.random() * (colorChaos.background.maxInterval - colorChaos.background.minInterval));
            colorChaos.background.nextToggle = frameCount + interval;

            console.log(`🎨 Fundo ${colorChaos.background.isInverted ? 'escurecendo' : 'clareando'} | Próxima inversão em ${interval} frames`);
        }

        // 🌫️ FADE SUAVE DO FUNDO (interpolação linear)
        if (colorChaos.background.currentOpacity !== colorChaos.background.targetOpacity) {
            const diff = colorChaos.background.targetOpacity - colorChaos.background.currentOpacity;

            if (Math.abs(diff) < colorChaos.background.fadeSpeed) {
                // Próximo da meta, snap para o valor exato
                colorChaos.background.currentOpacity = colorChaos.background.targetOpacity;
            } else {
                // Interpolar suavemente
                colorChaos.background.currentOpacity += diff * colorChaos.background.fadeSpeed;
            }
        }

        // 🌟 ATUALIZAR PONTO DE LUZ INVISÍVEL
        // Movimento suave e contínuo
        lightPoint.x += lightPoint.vx;
        lightPoint.y += lightPoint.vy;

        // Mudança aleatória de direção a cada 120-240 frames
        if (!lightPoint.nextDirectionChange) {
            lightPoint.nextDirectionChange = frameCount + 120 + Math.floor(Math.random() * 120);
        }

        if (frameCount >= lightPoint.nextDirectionChange) {
            const angleChange = (Math.random() - 0.5) * 0.6; // ±0.3 radianos (~±17 graus)
            const currentSpeed = Math.sqrt(lightPoint.vx ** 2 + lightPoint.vy ** 2);
            const currentAngle = Math.atan2(lightPoint.vy, lightPoint.vx);
            const newAngle = currentAngle + angleChange;

            lightPoint.vx = Math.cos(newAngle) * currentSpeed;
            lightPoint.vy = Math.sin(newAngle) * currentSpeed;

            // Próxima mudança
            lightPoint.nextDirectionChange = frameCount + 120 + Math.floor(Math.random() * 120);
        }

        // Colisão do ponto de luz com bordas (com bounce suave)
        if (lightPoint.x <= 0 || lightPoint.x >= canvas.width) {
            lightPoint.vx = -lightPoint.vx;
            lightPoint.x = Math.max(0, Math.min(canvas.width, lightPoint.x));
        }

        if (lightPoint.y <= 0 || lightPoint.y >= canvas.height) {
            lightPoint.vy = -lightPoint.vy;
            lightPoint.y = Math.max(0, Math.min(canvas.height, lightPoint.y));
        }

        // 💡⚫ INVERSÃO CAÓTICA LUZ/ESCURIDÃO (dessincronizada do fundo)
        if (frameCount >= lightPoint.nextToggle) {
            // Toggle entre luz e escuridão
            lightPoint.isLight = !lightPoint.isLight;

            // Definir intensidade alvo
            lightPoint.targetIntensity = lightPoint.isLight ? 1.0 : -1.0;

            // Agendar próxima inversão
            const interval = lightPoint.minInterval +
                Math.floor(Math.random() * (lightPoint.maxInterval - lightPoint.minInterval));
            lightPoint.nextToggle = frameCount + interval;

            console.log(`💡 Ponto ${lightPoint.isLight ? 'iluminando' : 'escurecendo'} | Próxima inversão em ${interval} frames`);
        }

        // 🌫️ FADE SUAVE DA INTENSIDADE (interpolação linear)
        if (lightPoint.currentIntensity !== lightPoint.targetIntensity) {
            const diff = lightPoint.targetIntensity - lightPoint.currentIntensity;

            if (Math.abs(diff) < lightPoint.fadeSpeed) {
                lightPoint.currentIntensity = lightPoint.targetIntensity;
            } else {
                lightPoint.currentIntensity += diff * lightPoint.fadeSpeed;
            }
        }

        // 🌐 SISTEMA DE PERSPECTIVA ESFÉRICA CAÓTICA (Transição -1 a +1)
        if (sphericalView.enabled) {
            // 🎯 Slow motion em testes de direção (reduz velocidade de transições)
            const isSlowMotion = isDirectionBasedChallenge(currentChallengeType);
            const perspectiveSlowMotion = isSlowMotion ? 0.2 : 1.0; // 20% da velocidade

            // Alternar entre estados (-1 → 0 → +1 → 0 → -1)
            if (frameCount >= sphericalView.nextModeChange) {
                // Ciclo de transições:
                // -1.0 (Fisheye) → 0.0 (Plano) → +1.0 (Globe) → 0.0 (Plano) → -1.0 (Fisheye)

                if (sphericalView.currentBlend <= -0.9) {
                    // De Fisheye para Plano
                    sphericalView.targetBlend = 0.0;
                } else if (Math.abs(sphericalView.currentBlend) < 0.1 && sphericalView.targetBlend >= 0) {
                    // De Plano para Globe
                    sphericalView.targetBlend = 1.0;
                } else if (sphericalView.currentBlend >= 0.9) {
                    // De Globe para Plano
                    sphericalView.targetBlend = 0.0;
                } else if (Math.abs(sphericalView.currentBlend) < 0.1 && sphericalView.targetBlend <= 0) {
                    // De Plano para Fisheye
                    sphericalView.targetBlend = -1.0;
                }

                // Agendar próxima mudança
                const interval = sphericalView.minInterval +
                    Math.floor(Math.random() * (sphericalView.maxInterval - sphericalView.minInterval));
                sphericalView.nextModeChange = frameCount + interval;

                const modeName = sphericalView.targetBlend < -0.5 ? 'Fisheye' :
                    sphericalView.targetBlend > 0.5 ? 'Globe' : 'Plano';
                console.log(`🌐 Perspectiva mudando para ${modeName} (blend → ${sphericalView.targetBlend.toFixed(2)}) em ${interval} frames`);
            }

            // Interpolar blend suavemente (com slow motion)
            if (Math.abs(sphericalView.currentBlend - sphericalView.targetBlend) > 0.001) {
                const diff = sphericalView.targetBlend - sphericalView.currentBlend;
                const effectiveBlendSpeed = sphericalView.blendSpeed * perspectiveSlowMotion;
                if (Math.abs(diff) < effectiveBlendSpeed) {
                    sphericalView.currentBlend = sphericalView.targetBlend;
                } else {
                    sphericalView.currentBlend += diff > 0 ? effectiveBlendSpeed : -effectiveBlendSpeed;
                }
            }

            // Rotação suave da visão fisheye (com slow motion)
            sphericalView.viewRotation += sphericalView.viewRotationSpeed * perspectiveSlowMotion;
            if (sphericalView.viewRotation > Math.PI * 2) {
                sphericalView.viewRotation -= Math.PI * 2;
            }
        }

        // 🎨 Atualizar contraste da UI baseado no fundo
        updateUIContrast();

        // Redesenhar canvas
        drawCircles();

        // Continuar animação
        animationFrameId = requestAnimationFrame(updateShapesPosition);
    } catch (error) {
        console.error('❌ Erro na animação:', error);
        stopAnimation();
    }
}

// Função para iniciar animação
function startAnimation() {
    if (isAnimating) return;
    isAnimating = true;
    console.log('🎬 Animação iniciada');
    updateShapesPosition();
}

// Função para parar animação
function stopAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    isAnimating = false;
    console.log('⏸️ Animação pausada');
}

function getRandomChallengeType() {
    const challenges = [
        'size-ascending',      // Menor para maior
        'size-descending',     // Maior para menor
        'color-sequence',      // Sequência de cores
        'position-left',       // Da esquerda para direita
        'odd-circles',         // Apenas círculos tracejados
        'position-top',        // De cima para baixo
        'rainbow-order',       // Ordem do arco-íris
        'avoid-color',         // Evitar uma cor específica
        'only-borders',        // Apenas círculos com borda
        'diagonal-pattern',    // Padrão diagonal
        'concentric-rings',    // Anéis concêntricos
        'connect-dots',        // Conectar pontos numerados
        'shape-squares',       // Apenas quadrados roxos
        'shape-triangles',     // Apenas triângulos roxos
        'shape-stars',         // Apenas estrelas roxas
        'shape-mix-order',     // Círculo → Quadrado → Triângulo → Estrela
        'color-blue-shapes',   // Apenas formas azuis
        'color-green-shapes',  // Apenas formas verdes
        'color-pink-shapes',   // Apenas formas rosas
        'color-orange-shapes', // Apenas formas laranjas
        'shape-color-match',   // Quadrados verdes
        'rainbow-shapes',      // Formas em ordem de cores do arco-íris
        'same-color-different-shapes' // Todas as formas roxas
    ];
    return challenges[Math.floor(Math.random() * challenges.length)];
}

// 🎨 Verificar se o desafio atual é baseado em cores (não deve inverter cores das formas)
function isColorBasedChallenge(challengeType) {
    const colorChallenges = [
        'color-sequence',         // Sequência de cores específicas
        'rainbow-order',          // Ordem do arco-íris
        'avoid-color',            // Evitar cor vermelha
        'color-blue-shapes',      // Apenas formas azuis
        'color-green-shapes',     // Apenas formas verdes
        'color-pink-shapes',      // Apenas formas rosas
        'color-orange-shapes',    // Apenas formas laranjas
        'shape-color-match',      // Quadrados verdes (cor importa)
        'rainbow-shapes',         // Formas em ordem de arco-íris
        'same-color-different-shapes' // Todas roxas (cor importa)
    ];
    return colorChallenges.includes(challengeType);
}

// 🎯 Verificar se o desafio atual é baseado em direção/movimento (slow motion)
function isDirectionBasedChallenge(challengeType) {
    const directionChallenges = [
        'position-left',      // Da esquerda para direita
        'position-top',       // De cima para baixo
        'diagonal-pattern',   // Padrão diagonal
        'concentric-rings',   // Anéis concêntricos (movimento radial)
        'connect-dots'        // Conectar pontos (movimento linear)
    ];
    return directionChallenges.includes(challengeType);
}

function getChallengeInstruction(type) {
    const instructions = {
        'size-ascending': 'Clique nos <strong>círculos roxos</strong> em ordem crescente de tamanho.<br>(do menor para o maior)',
        'size-descending': 'Clique nos <strong>círculos roxos</strong> em ordem decrescente de tamanho.<br>(do maior para o menor)',
        'color-sequence': 'Clique nos círculos seguindo esta ordem de cores:<br><strong>Roxo → Rosa → Verde → Laranja → Azul</strong>',
        'position-left': 'Clique nos <strong>círculos roxos</strong> da esquerda para a direita.<br>(ordem horizontal)',
        'odd-circles': 'Clique apenas nos <strong>círculos roxos</strong> que têm bordas tracejadas.',
        'position-top': 'Clique nos <strong>círculos roxos</strong> de cima para baixo.<br>(ordem vertical)',
        'rainbow-order': 'Clique seguindo as cores do arco-íris:<br><strong>Vermelho → Laranja → Amarelo → Verde → Azul</strong>',
        'avoid-color': 'Clique em todos os círculos <strong>EXCETO</strong> os vermelhos.<br>(4 círculos no total)',
        'only-borders': 'Clique apenas nos círculos que têm <strong>borda dupla</strong>.<br>(3 círculos)',
        'diagonal-pattern': 'Clique nos <strong>círculos roxos</strong> seguindo a diagonal:<br>do canto superior esquerdo ao inferior direito',
        'concentric-rings': 'Clique nos círculos do <strong>centro para fora</strong>.<br>(do menor raio ao maior raio)',
        'connect-dots': 'Clique nos círculos numerados em ordem crescente:<br><strong>1 → 2 → 3 → 4 → 5</strong>',
        'shape-squares': 'Clique apenas nos <strong>quadrados roxos</strong>.<br>(ignore outras formas)',
        'shape-triangles': 'Clique apenas nos <strong>triângulos roxos</strong>.<br>(ignore outras formas)',
        'shape-stars': 'Clique apenas nas <strong>estrelas roxas</strong>.<br>(ignore outras formas)',
        'shape-mix-order': 'Clique nas formas nesta ordem:<br><strong>Círculo → Quadrado → Triângulo → Estrela</strong>',
        'color-blue-shapes': 'Clique apenas nas formas <strong>azuis</strong>.<br>(ignore outras cores)',
        'color-green-shapes': 'Clique apenas nas formas <strong>verdes</strong>.<br>(ignore outras cores)',
        'color-pink-shapes': 'Clique apenas nas formas <strong>rosas</strong>.<br>(ignore outras cores)',
        'color-orange-shapes': 'Clique apenas nas formas <strong>laranjas</strong>.<br>(ignore outras cores)',
        'shape-color-match': 'Clique nos <strong>quadrados verdes</strong>.<br>(forma E cor devem coincidir)',
        'rainbow-shapes': 'Clique nas formas seguindo o arco-íris:<br><strong>Vermelho → Laranja → Verde → Azul</strong>',
        'same-color-different-shapes': 'Clique em todas as formas <strong>roxas</strong>.<br>(formas diferentes, mesma cor)',
        'rotating-shapes': 'Clique nas formas que estão <strong>rotacionando</strong>.<br>(ignore as formas estáticas)',
        'shape-count': 'Clique em todas as formas <strong>roxas</strong>.<br>(conte quantas existem)'
    };
    return instructions[type] || 'Clique nos <strong>elementos roxos</strong> em ordem crescente de tamanho.<br>(do menor para o maior)';
}

function generateVisualCaptcha() {
    console.log('🎲 generateVisualCaptcha() iniciado');
    if (!ctx) {
        console.error('❌ Ctx não definido!');
        return;
    }

    // Limpar canvas
    console.log('🧹 Limpando canvas...');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset
    captchaShapes = [];
    clickedOrder = [];

    // 🌟 Inicializar ponto de luz/escuridão invisível
    lightPoint.x = canvas.width / 2;
    lightPoint.y = canvas.height / 2;
    // Velocidade aleatória inicial
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 1.5; // 1-2.5 pixels por frame
    lightPoint.vx = Math.cos(angle) * speed;
    lightPoint.vy = Math.sin(angle) * speed;
    // Inicializar sistema de inversão luz/escuridão
    lightPoint.isLight = true;               // 💡 Começa como luz
    lightPoint.currentIntensity = 1.0;       // 💡 Intensidade inicial (luz completa)
    lightPoint.targetIntensity = 1.0;        // 💡 Alvo inicial (luz completa)
    lightPoint.nextToggle = frameCount +
        lightPoint.minInterval +
        Math.floor(Math.random() * (lightPoint.maxInterval - lightPoint.minInterval));
    console.log('💡 Ponto de luz/escuridão inicializado em:', lightPoint.x.toFixed(1), lightPoint.y.toFixed(1));

    // 🎨 Inicializar sistema de inversão caótica de fundo (PADRÃO: modo claro)
    colorChaos.background.isInverted = false; // ⚪ Sempre começa em modo claro
    colorChaos.background.currentOpacity = 0; // ⚪ Opacidade inicial (transparente)
    colorChaos.background.targetOpacity = 0;  // ⚪ Alvo inicial (transparente)
    colorChaos.background.nextToggle = frameCount +
        colorChaos.background.minInterval +
        Math.floor(Math.random() * (colorChaos.background.maxInterval - colorChaos.background.minInterval));
    console.log('🎨 Sistema de inversão de cores inicializado (modo claro)');

    // Escolher tipo de desafio aleatório
    currentChallengeType = getRandomChallengeType();
    console.log('🎯 Tipo de desafio:', currentChallengeType);

    // 🎨 IMPORTANTE: Se desafio é baseado em cores, resetar todas as inversões
    if (isColorBasedChallenge(currentChallengeType)) {
        console.log('⚠️ Desafio baseado em cores detectado - inversão de formas DESABILITADA');
        // Formas não terão inversão ativa durante este desafio
        // O background ainda pode inverter para adicionar caos visual
    }

    // Atualizar instrução (suporta tanto classe quanto ID)
    let instruction = document.querySelector('.captcha-instruction');
    if (!instruction) {
        instruction = document.getElementById('captchaInstruction');
    }
    if (instruction) {
        instruction.innerHTML = getChallengeInstruction(currentChallengeType);
        console.log('📝 Instrução atualizada:', currentChallengeType);
    } else {
        console.warn('⚠️ Elemento de instrução não encontrado');
    }

    // Gerar desafio específico
    console.log('🏗️ Gerando desafio específico...');
    switch (currentChallengeType) {
        case 'size-ascending':
        case 'size-descending':
            generateSizeChallenge();
            break;
        case 'color-sequence':
            generateColorChallenge();
            break;
        case 'position-left':
            generatePositionChallenge();
            break;
        case 'odd-circles':
            generateOddCirclesChallenge();
            break;
        case 'position-top':
            generatePositionTopChallenge();
            break;
        case 'rainbow-order':
            generateRainbowChallenge();
            break;
        case 'avoid-color':
            generateAvoidColorChallenge();
            break;
        case 'only-borders':
            generateBordersChallenge();
            break;
        case 'diagonal-pattern':
            generateDiagonalChallenge();
            break;
        case 'concentric-rings':
            generateConcentricRingsChallenge();
            break;
        case 'connect-dots':
            generateConnectDotsChallenge();
            break;
        case 'shape-squares':
            generateShapeSquaresChallenge();
            break;
        case 'shape-triangles':
            generateShapeTrianglesChallenge();
            break;
        case 'shape-stars':
            generateShapeStarsChallenge();
            break;
        case 'shape-mix-order':
            generateShapeMixOrderChallenge();
            break;
        case 'color-blue-shapes':
            generateColorShapesChallenge('#3b82f6'); // Azul
            break;
        case 'color-green-shapes':
            generateColorShapesChallenge('#10b981'); // Verde
            break;
        case 'color-pink-shapes':
            generateColorShapesChallenge('#ec4899'); // Rosa
            break;
        case 'color-orange-shapes':
            generateColorShapesChallenge('#f97316'); // Laranja
            break;
        case 'shape-color-match':
            generateShapeColorMatchChallenge();
            break;
        case 'rainbow-shapes':
            generateRainbowShapesChallenge();
            break;
        case 'same-color-different-shapes':
            generateSameColorDifferentShapesChallenge();
            break;
        default:
            // Para desafios não implementados, usar desafio de tamanho
            generateSizeChallenge();
            break;
    }

    console.log('🎨 Desenhando formas... Total:', captchaShapes.length);
    drawCircles();

    // Iniciar animação das formas (corrigido - loops com limitador)
    startAnimation();

    console.log('✅ generateVisualCaptcha() completo');
}

// Função auxiliar para gerar posição segura (evita loop infinito)
function findSafePosition(usedPositions, radius) {
    const maxAttempts = 100;
    let attempts = 0;
    let x, y, tooClose;

    do {
        tooClose = false;
        x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
        y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

        for (let pos of usedPositions) {
            const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
            const minDistance = (pos.radius + radius + 15) * canvasScale;
            if (distance < minDistance) {
                tooClose = true;
                break;
            }
        }

        attempts++;
        if (attempts >= maxAttempts) {
            console.warn('⚠️ Máximo de tentativas atingido, usando última posição');
            break; // Força saída
        }
    } while (tooClose);

    return { x, y };
}

function generateSizeChallenge() {
    const baseSizes = isMobile ? [18, 26, 34, 42, 50] : [15, 22, 30, 38, 46];
    const sizes = baseSizes.map(s => Math.floor(s * canvasScale));
    const usedPositions = [];

    // Embaralhar tamanhos
    sizes.sort(() => Math.random() - 0.5);

    // VARIAÇÃO: Cores e formas diferentes para cada círculo
    const colors = getRandomColors(5);
    const shapeTypes = getRandomShapeTypes(5);

    for (let i = 0; i < 5; i++) {
        // Usar função helper segura
        const pos = findSafePosition(usedPositions, sizes[i]);
        usedPositions.push({ x: pos.x, y: pos.y, radius: sizes[i] });

        addShape({
            x: pos.x,
            y: pos.y,
            radius: sizes[i],
            type: shapeTypes[i],      // Forma variada
            color: colors[i],          // Cor variada
            clicked: false,
            clickOrder: -1
        });
    }

    // Adicionar distratores com cores e formas variadas
    addDistractors(usedPositions, 3);
}

function generateColorChallenge() {
    const colors = [
        { color: '#8b5cf6', name: 'Roxo' },      // 0
        { color: '#ec4899', name: 'Rosa' },      // 1
        { color: '#10b981', name: 'Verde' },     // 2
        { color: '#f97316', name: 'Laranja' },   // 3
        { color: '#3b82f6', name: 'Azul' }       // 4
    ];

    const usedPositions = [];
    const radius = Math.floor((isMobile ? 32 : 28) * canvasScale);

    for (let i = 0; i < 5; i++) {
        let x, y, tooClose;

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                const minDistance = (radius * 2 + 15) * canvasScale;
                if (distance < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y, radius });

        addShape({
            x: x,
            y: y,
            radius: radius,
            color: colors[i].color,
            colorIndex: i,
            clicked: false,
            clickOrder: -1
        });
    }

    // Adicionar distratores cinzas
    addDistractors(usedPositions, 2);
}

function generatePositionChallenge() {
    const baseSizes = isMobile ? [24, 30, 36, 42, 34] : [20, 25, 30, 35, 28];
    const sizes = baseSizes.map(s => Math.floor(s * canvasScale));
    const usedPositions = [];

    sizes.sort(() => Math.random() - 0.5);

    for (let i = 0; i < 5; i++) {
        let x, y, tooClose;

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                const minDistance = (pos.radius + sizes[i] + 15) * canvasScale;
                if (distance < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y, radius: sizes[i] });

        // Testes espaciais: velocidade MUITO reduzida (15% do normal)
        addShape({
            x: x,
            y: y,
            radius: sizes[i],
            color: '#8b5cf6',
            clicked: false,
            clickOrder: -1
        }, 0.15); // 85% mais lento!
    }

    addDistractors(usedPositions, 3);
}

function generateOddCirclesChallenge() {
    const usedPositions = [];
    const radius = Math.floor((isMobile ? 32 : 28) * canvasScale);

    // 3 círculos com borda tracejada (corretos)
    for (let i = 0; i < 3; i++) {
        let x, y, tooClose;

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                const minDistance = (radius * 2 + 15) * canvasScale;
                if (distance < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y, radius });

        addShape({
            x: x,
            y: y,
            radius: radius,
            color: '#8b5cf6',
            dashed: true,
            clicked: false,
            clickOrder: -1
        });
    }

    // 3 círculos roxos sólidos (incorretos - são distratores especiais)
    for (let i = 0; i < 3; i++) {
        let x, y, tooClose;

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                const minDistance = (radius * 2 + 15) * canvasScale;
                if (distance < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y, radius });

        addShape({
            x: x,
            y: y,
            radius: radius,
            color: '#8b5cf6',
            dashed: false,
            isDistractor: true,
            clicked: false
        });
    }

    // Adicionar distratores normais
    addDistractors(usedPositions, 2);
}

function addDistractors(usedPositions, count) {
    // Paleta EXPANDIDA de cores vibrantes e variadas (NUNCA cinza!)
    const distractorColors = [
        '#ef4444', // Vermelho vivo
        '#dc2626', // Vermelho escuro
        '#f97316', // Laranja
        '#fb923c', // Laranja claro
        '#eab308', // Amarelo ouro
        '#fbbf24', // Amarelo brilhante
        '#84cc16', // Lima
        '#10b981', // Verde esmeralda
        '#059669', // Verde escuro
        '#06b6d4', // Ciano
        '#0ea5e9', // Azul céu
        '#3b82f6', // Azul royal
        '#2563eb', // Azul escuro
        '#6366f1', // Índigo
        '#8b5cf6', // Roxo
        '#a855f7', // Roxo vibrante
        '#7c3aed', // Violeta
        '#ec4899', // Rosa pink
        '#f43f5e', // Rosa profundo
        '#14b8a6', // Turquesa
        '#0d9488', // Verde-azulado
        '#f59e0b', // Âmbar
    ];

    // Embaralhar cores para máxima variedade
    const shuffledColors = [...distractorColors].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
        const radius = Math.floor((Math.random() * 25 + 15) * canvasScale);

        // Usar função helper segura
        const pos = findSafePosition(usedPositions, radius);
        usedPositions.push({ x: pos.x, y: pos.y, radius });

        // Escolher cor única da paleta embaralhada (evita repetição próxima)
        const color = shuffledColors[i % shuffledColors.length];

        addShape({
            x: pos.x,
            y: pos.y,
            radius: radius,
            color: color,
            isDistractor: true,
            clicked: false
        });
    }
}

// NOVOS TIPOS DE CAPTCHA

function generatePositionTopChallenge() {
    const usedPositions = [];
    const radius = Math.floor((isMobile ? 32 : 28) * canvasScale);

    // 5 círculos roxos em posições aleatórias
    for (let i = 0; i < 5; i++) {
        let x, y, tooClose;

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                const minDistance = (radius * 2 + 15) * canvasScale;
                if (distance < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y, radius });

        // Testes espaciais: velocidade MUITO reduzida (15% do normal)
        addShape({
            x: x,
            y: y,
            radius: radius,
            color: '#8b5cf6',
            clicked: false,
            clickOrder: -1
        }, 0.15); // 85% mais lento!
    }

    addDistractors(usedPositions, 3);
}

function generateRainbowChallenge() {
    const colors = [
        { color: '#ef4444', name: 'Vermelho' },   // 0
        { color: '#f97316', name: 'Laranja' },    // 1
        { color: '#eab308', name: 'Amarelo' },    // 2
        { color: '#10b981', name: 'Verde' },      // 3
        { color: '#3b82f6', name: 'Azul' }        // 4
    ];

    const usedPositions = [];
    const radius = Math.floor((isMobile ? 32 : 28) * canvasScale);

    for (let i = 0; i < 5; i++) {
        let x, y, tooClose;

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                const minDistance = (radius * 2 + 15) * canvasScale;
                if (distance < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y, radius });

        addShape({
            x: x,
            y: y,
            radius: radius,
            color: colors[i].color,
            colorIndex: i,
            clicked: false,
            clickOrder: -1
        });
    }

    addDistractors(usedPositions, 2);
}

function generateAvoidColorChallenge() {
    const usedPositions = [];
    const radius = Math.floor((isMobile ? 32 : 28) * canvasScale);

    // 4 círculos seguros (verde, azul, roxo, rosa)
    const safeColors = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

    for (let i = 0; i < 4; i++) {
        let x, y, tooClose;

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                const minDistance = (radius * 2 + 15) * canvasScale;
                if (distance < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y, radius });

        addShape({
            x: x,
            y: y,
            radius: radius,
            color: safeColors[i],
            isSafe: true,
            clicked: false,
            clickOrder: -1
        });
    }

    // 3 círculos vermelhos (perigosos - não clicar)
    for (let i = 0; i < 3; i++) {
        let x, y, tooClose;

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                const minDistance = (radius * 2 + 15) * canvasScale;
                if (distance < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y, radius });

        addShape({
            x: x,
            y: y,
            radius: radius,
            color: '#ef4444',
            isDangerous: true,
            clicked: false
        });
    }
}

function generateBordersChallenge() {
    const usedPositions = [];
    const radius = Math.floor((isMobile ? 32 : 28) * canvasScale);

    // 3 círculos com borda dupla (corretos)
    for (let i = 0; i < 3; i++) {
        let x, y, tooClose;

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                const minDistance = (radius * 2 + 15) * canvasScale;
                if (distance < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y, radius });

        addShape({
            x: x,
            y: y,
            radius: radius,
            color: '#8b5cf6',
            doubleBorder: true,
            clicked: false,
            clickOrder: -1
        });
    }

    // 4 círculos normais (sem borda dupla)
    for (let i = 0; i < 4; i++) {
        let x, y, tooClose;

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                const minDistance = (radius * 2 + 15) * canvasScale;
                if (distance < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y, radius });

        addShape({
            x: x,
            y: y,
            radius: radius,
            color: '#8b5cf6',
            doubleBorder: false,
            isDistractor: true,
            clicked: false
        });
    }
}

function generateDiagonalChallenge() {
    const usedPositions = [];
    const radius = Math.floor((isMobile ? 30 : 26) * canvasScale);

    // 5 círculos roxos em posições diagonais
    for (let i = 0; i < 5; i++) {
        // Distribuir ao longo da diagonal
        const t = (i + 0.5) / 5; // 0.1, 0.3, 0.5, 0.7, 0.9
        const baseX = t * canvas.width;
        const baseY = t * canvas.height;

        // Adicionar pequena variação aleatória
        const offsetX = (Math.random() - 0.5) * 30 * canvasScale;
        const offsetY = (Math.random() - 0.5) * 30 * canvasScale;

        const x = Math.max(radius + 10, Math.min(canvas.width - radius - 10, baseX + offsetX));
        const y = Math.max(radius + 10, Math.min(canvas.height - radius - 10, baseY + offsetY));

        usedPositions.push({ x, y, radius });

        addShape({
            x: x,
            y: y,
            radius: radius,
            color: '#8b5cf6',
            diagonalOrder: i,
            clicked: false,
            clickOrder: -1
        });
    }

    addDistractors(usedPositions, 3);
}

function generateConcentricRingsChallenge() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const usedPositions = [];

    // 5 círculos em diferentes distâncias do centro
    const radii = [20, 30, 40, 50, 60].map(r => Math.floor(r * canvasScale));
    const distances = [25, 45, 65, 85, 105].map(d => Math.floor(d * canvasScale));

    for (let i = 0; i < 5; i++) {
        // Posição em anel ao redor do centro
        const angle = Math.random() * Math.PI * 2;
        const x = centerX + Math.cos(angle) * distances[i];
        const y = centerY + Math.sin(angle) * distances[i];

        usedPositions.push({ x, y, radius: radii[i] });

        addShape({
            x: x,
            y: y,
            radius: radii[i],
            color: '#8b5cf6',
            distanceFromCenter: distances[i],
            clicked: false,
            clickOrder: -1
        });
    }

    addDistractors(usedPositions, 2);
}

function generateConnectDotsChallenge() {
    const usedPositions = [];
    const radius = Math.floor((isMobile ? 32 : 28) * canvasScale);

    // 5 círculos numerados
    for (let i = 0; i < 5; i++) {
        let x, y, tooClose;

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                const minDistance = (radius * 2 + 20) * canvasScale;
                if (distance < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y, radius });

        addShape({
            x: x,
            y: y,
            radius: radius,
            color: '#8b5cf6',
            number: i + 1,
            clicked: false,
            clickOrder: -1
        });
    }

    addDistractors(usedPositions, 2);
}

// Desafio: Clicar apenas em quadrados
function generateShapeSquaresChallenge() {
    const usedPositions = [];
    const radius = Math.floor((isMobile ? 30 : 26) * canvasScale);
    const shapes = ['square', 'circle', 'triangle', 'star'];

    // 3 quadrados roxos (alvos)
    for (let i = 0; i < 3; i++) {
        let x, y, tooClose;
        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (distance < (radius * 2 + 25) * canvasScale) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y });
        addShape({
            x, y, radius,
            type: 'square',
            color: '#8b5cf6',
            clicked: false,
            clickOrder: -1
        });
    }

    // 4 distratores de outras formas
    for (let i = 0; i < 4; i++) {
        let x, y, tooClose;
        const otherShapes = shapes.filter(s => s !== 'square');
        const shapeType = otherShapes[Math.floor(Math.random() * otherShapes.length)];

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (distance < (radius * 2 + 25) * canvasScale) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y });
        addShape({
            x, y, radius,
            type: shapeType,
            color: '#9ca3af',
            clicked: false,
            clickOrder: -1
        });
    }
}

// Desafio: Clicar apenas em triângulos
function generateShapeTrianglesChallenge() {
    const usedPositions = [];
    const radius = Math.floor((isMobile ? 30 : 26) * canvasScale);
    const shapes = ['square', 'circle', 'triangle', 'star'];

    // 3 triângulos roxos (alvos)
    for (let i = 0; i < 3; i++) {
        let x, y, tooClose;
        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (distance < (radius * 2 + 25) * canvasScale) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y });
        addShape({
            x, y, radius,
            type: 'triangle',
            color: '#8b5cf6',
            clicked: false,
            clickOrder: -1
        });
    }

    // 4 distratores
    for (let i = 0; i < 4; i++) {
        let x, y, tooClose;
        const otherShapes = shapes.filter(s => s !== 'triangle');
        const shapeType = otherShapes[Math.floor(Math.random() * otherShapes.length)];

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (distance < (radius * 2 + 25) * canvasScale) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y });
        addShape({
            x, y, radius,
            type: shapeType,
            color: '#9ca3af',
            clicked: false,
            clickOrder: -1
        });
    }
}

// Desafio: Clicar apenas em estrelas
function generateShapeStarsChallenge() {
    const usedPositions = [];
    const radius = Math.floor((isMobile ? 30 : 26) * canvasScale);
    const shapes = ['square', 'circle', 'triangle', 'star'];

    // 3 estrelas roxas (alvos)
    for (let i = 0; i < 3; i++) {
        let x, y, tooClose;
        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (distance < (radius * 2 + 25) * canvasScale) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y });
        addShape({
            x, y, radius,
            type: 'star',
            color: '#8b5cf6',
            clicked: false,
            clickOrder: -1
        });
    }

    // 4 distratores
    for (let i = 0; i < 4; i++) {
        let x, y, tooClose;
        const otherShapes = shapes.filter(s => s !== 'star');
        const shapeType = otherShapes[Math.floor(Math.random() * otherShapes.length)];

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (distance < (radius * 2 + 25) * canvasScale) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y });
        addShape({
            x, y, radius,
            type: shapeType,
            color: '#9ca3af',
            clicked: false,
            clickOrder: -1
        });
    }
}

// Desafio: Clicar em ordem - Círculo → Quadrado → Triângulo → Estrela
function generateShapeMixOrderChallenge() {
    const usedPositions = [];
    const radius = Math.floor((isMobile ? 32 : 28) * canvasScale);
    const orderedShapes = ['circle', 'square', 'triangle', 'star'];

    for (let i = 0; i < 4; i++) {
        let x, y, tooClose;
        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (distance < (radius * 2 + 25) * canvasScale) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y });
        addShape({
            x, y, radius,
            type: orderedShapes[i],
            color: '#8b5cf6',
            clicked: false,
            clickOrder: -1
        });
    }

    // 2 distratores cinzas
    for (let i = 0; i < 2; i++) {
        let x, y, tooClose;
        const shapeType = orderedShapes[Math.floor(Math.random() * orderedShapes.length)];

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (distance < (radius * 2 + 25) * canvasScale) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y });
        addShape({
            x, y, radius,
            type: shapeType,
            color: '#9ca3af',
            clicked: false,
            clickOrder: -1
        });
    }
}

// Desafio: Clicar apenas em formas de uma cor específica
function generateColorShapesChallenge(targetColor) {
    const usedPositions = [];
    const shapes = ['circle', 'square', 'triangle', 'star'];

    // VARIAÇÃO: Tamanhos variados para todas as formas
    const minRadius = Math.floor((isMobile ? 22 : 18) * canvasScale);
    const maxRadius = Math.floor((isMobile ? 38 : 34) * canvasScale);

    // Paleta MUITO expandida de cores vibrantes (NUNCA cinza!)
    const allColors = [
        '#ef4444', '#dc2626', '#f97316', '#fb923c', '#eab308', '#fbbf24',
        '#84cc16', '#10b981', '#059669', '#06b6d4', '#0ea5e9', '#3b82f6',
        '#2563eb', '#6366f1', '#8b5cf6', '#a855f7', '#7c3aed', '#ec4899',
        '#f43f5e', '#14b8a6', '#0d9488', '#f59e0b',
    ];

    // 3 formas da cor alvo (formas E tamanhos variados)
    for (let i = 0; i < 3; i++) {
        let x, y, tooClose;
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        const radius = getRandomRadius(minRadius, maxRadius); // Tamanho aleatório

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (distance < (radius + pos.radius + 15) * canvasScale) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y, radius });
        addShape({
            x, y, radius,
            type: shapeType,
            color: targetColor,
            clicked: false,
            clickOrder: -1
        });
    }

    // 4 distratores de outras cores (cores E tamanhos variados)
    const otherColors = allColors.filter(c => c !== targetColor);
    const shuffledColors = [...otherColors].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 4; i++) {
        let x, y, tooClose;
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        const radius = getRandomRadius(minRadius, maxRadius); // Tamanho aleatório
        const distractorColor = shuffledColors[i % shuffledColors.length];

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (distance < (radius + pos.radius + 15) * canvasScale) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y, radius });
        addShape({
            x, y, radius,
            type: shapeType,
            color: distractorColor,
            clicked: false,
            clickOrder: -1,
            isDistractor: true
        });
    }
}

// Desafio: Quadrados verdes especificamente
function generateShapeColorMatchChallenge() {
    const usedPositions = [];
    const radius = Math.floor((isMobile ? 30 : 26) * canvasScale);
    const shapes = ['circle', 'square', 'triangle', 'star'];

    // 3 quadrados verdes (alvo)
    for (let i = 0; i < 3; i++) {
        let x, y, tooClose;
        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (distance < (radius * 2 + 25) * canvasScale) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y });
        addShape({
            x, y, radius,
            type: 'square',
            color: '#10b981', // Verde
            clicked: false,
            clickOrder: -1
        });
    }

    // Distratores: quadrados de outras cores e formas verdes
    const distractors = [
        { type: 'square', color: '#8b5cf6' },  // Quadrado roxo
        { type: 'square', color: '#3b82f6' },  // Quadrado azul
        { type: 'circle', color: '#10b981' },  // Círculo verde
        { type: 'triangle', color: '#10b981' } // Triângulo verde
    ];

    for (let i = 0; i < 4; i++) {
        let x, y, tooClose;
        const distractor = distractors[i];

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (distance < (radius * 2 + 25) * canvasScale) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y });
        addShape({
            x, y, radius,
            type: distractor.type,
            color: distractor.color,
            clicked: false,
            clickOrder: -1,
            isDistractor: true
        });
    }
}

// Desafio: Formas em ordem de cores do arco-íris
function generateRainbowShapesChallenge() {
    const usedPositions = [];
    const radius = Math.floor((isMobile ? 32 : 28) * canvasScale);
    const shapes = ['circle', 'square', 'triangle', 'star'];
    const rainbowColors = ['#ef4444', '#f97316', '#10b981', '#3b82f6']; // Vermelho, Laranja, Verde, Azul

    for (let i = 0; i < 4; i++) {
        let x, y, tooClose;
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (distance < (radius * 2 + 25) * canvasScale) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y });
        addShape({
            x, y, radius,
            type: shapeType,
            color: rainbowColors[i],
            colorOrder: i,
            clicked: false,
            clickOrder: -1
        });
    }

    // 2 distratores
    for (let i = 0; i < 2; i++) {
        let x, y, tooClose;
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (distance < (radius * 2 + 25) * canvasScale) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y });
        addShape({
            x, y, radius,
            type: shapeType,
            color: '#9ca3af',
            clicked: false,
            clickOrder: -1,
            isDistractor: true
        });
    }
}

// Desafio: Todas as formas roxas (formas diferentes, mesma cor)
function generateSameColorDifferentShapesChallenge() {
    const usedPositions = [];
    const radius = Math.floor((isMobile ? 30 : 26) * canvasScale);
    const shapes = ['circle', 'square', 'triangle', 'star'];
    const purpleColor = '#8b5cf6';

    // 4 formas roxas diferentes
    for (let i = 0; i < 4; i++) {
        let x, y, tooClose;
        const shapeType = shapes[i]; // Uma de cada tipo

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (distance < (radius * 2 + 25) * canvasScale) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y });
        addShape({
            x, y, radius,
            type: shapeType,
            color: purpleColor,
            clicked: false,
            clickOrder: -1
        });
    }

    // 3 distratores de cores diferentes
    const otherColors = ['#3b82f6', '#10b981', '#ec4899']; // Azul, Verde, Rosa
    for (let i = 0; i < 3; i++) {
        let x, y, tooClose;
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];

        let attempts = 0;
        const maxAttempts = 100;
        do {
            tooClose = false;
            x = Math.random() * (canvas.width - 100 * canvasScale) + 50 * canvasScale;
            y = Math.random() * (canvas.height - 100 * canvasScale) + 50 * canvasScale;

            for (let pos of usedPositions) {
                const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (distance < (radius * 2 + 25) * canvasScale) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⚠️ Loop limit reached");
                break;
            }

        } while (tooClose);

        usedPositions.push({ x, y });
        addShape({
            x, y, radius,
            type: shapeType,
            color: otherColors[i],
            clicked: false,
            clickOrder: -1,
            isDistractor: true
        });
    }
}

// 🌐 FUNÇÕES DE TRANSFORMAÇÃO DE PERSPECTIVA ESFÉRICA

/**
 * Aplica transformação fisheye (olho de peixe)
 * @param {number} x - Coordenada X original
 * @param {number} y - Coordenada Y original
 * @param {number} centerX - Centro X da distorção
 * @param {number} centerY - Centro Y da distorção
 * @param {number} strength - Força da distorção (0-1)
 * @param {number} rotation - Rotação da visão em radianos
 * @returns {object} - {x, y, scale} transformados
 */
function applyFisheyeTransform(x, y, centerX, centerY, strength, rotation) {
    // Deslocar para origem
    let dx = x - centerX;
    let dy = y - centerY;

    // Aplicar rotação da visão
    if (rotation !== 0) {
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const rotX = dx * cos - dy * sin;
        const rotY = dx * sin + dy * cos;
        dx = rotX;
        dy = rotY;
    }

    // Calcular distância do centro
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

    if (distance < 0.001) {
        return { x, y, scale: 1.0 };
    }

    // Normalizar distância (0-1)
    const normalizedDist = Math.min(distance / maxDist, 1.0);

    // Aplicar distorção fisheye (quadrática)
    const distortion = Math.pow(normalizedDist, 1.0 - strength * 0.5);
    const newDistance = distortion * maxDist;

    // Calcular nova posição
    const ratio = newDistance / distance;
    const newX = centerX + dx * ratio;
    const newY = centerY + dy * ratio;

    // Escala baseada na distorção (periferia fica maior)
    const scale = 0.7 + (normalizedDist * 0.6 * strength);

    return { x: newX, y: newY, scale };
}

/**
 * Aplica transformação de globo (superfície esférica)
 * @param {number} x - Coordenada X original
 * @param {number} y - Coordenada Y original
 * @param {number} centerX - Centro X do globo
 * @param {number} centerY - Centro Y do globo
 * @param {number} globeRadius - Raio do globo
 * @param {number} deadzone - Zona central de desaparecimento (0-1)
 * @returns {object} - {x, y, scale, opacity} transformados
 */
function applyGlobeTransform(x, y, centerX, centerY, globeRadius, deadzone) {
    // Deslocar para origem
    const dx = x - centerX;
    const dy = y - centerY;

    // Calcular distância do centro (normalizada)
    const distance = Math.sqrt(dx * dx + dy * dy);
    const normalizedDist = Math.min(distance / globeRadius, 1.0);

    // Zona morta central (formas desaparecem)
    if (normalizedDist < deadzone) {
        const deadzoneOpacity = normalizedDist / deadzone;
        const deadzoneScale = 0.1 + (0.9 * deadzoneOpacity);
        return {
            x,
            y,
            scale: deadzoneScale,
            opacity: deadzoneOpacity * 0.3
        };
    }

    // Simular profundidade esférica:
    // Centro = infinito (pequeno, transparente)
    // Periferia = perto (grande, opaco)
    const depthFactor = (normalizedDist - deadzone) / (1.0 - deadzone);

    // Escala: cresce do centro para fora
    const scale = 0.3 + (depthFactor * 0.9);

    // Opacidade: aumenta do centro para fora
    const opacity = 0.3 + (depthFactor * 0.7);

    // Posição mantida (sem distorção espacial no modo globe)
    return { x, y, scale, opacity };
}

/**
 * Mescla duas transformações com interpolação
 */
function blendTransforms(transform1, transform2, blend) {
    return {
        x: transform1.x * (1 - blend) + transform2.x * blend,
        y: transform1.y * (1 - blend) + transform2.y * blend,
        scale: transform1.scale * (1 - blend) + transform2.scale * blend,
        opacity: (transform1.opacity || 1.0) * (1 - blend) + (transform2.opacity || 1.0) * blend
    };
}

/**
 * � Aplica distorção espacial a um ponto (para distorcer formas geometricamente)
 * @param {number} px - Posição X do ponto relativo à forma
 * @param {number} py - Posição Y do ponto relativo à forma  
 * @param {number} centerX - Centro X da forma
 * @param {number} centerY - Centro Y da forma
 * @param {number} canvasCenterX - Centro X do canvas
 * @param {number} canvasCenterY - Centro Y do canvas
 * @returns {object} - {x, y} ponto distorcido
 */
function applyPointDistortion(px, py, centerX, centerY, canvasCenterX, canvasCenterY) {
    if (!sphericalView.enabled || Math.abs(sphericalView.currentBlend) < 0.01) {
        return { x: px, y: py };
    }

    // Calcular offset do ponto em relação ao centro da forma
    const offsetX = px - centerX;
    const offsetY = py - centerY;

    // Aplicar transformação fisheye ao ponto
    const fisheyePoint = applyFisheyeTransform(
        px, py,
        canvasCenterX, canvasCenterY,
        sphericalView.fisheyeStrength,
        sphericalView.viewRotation
    );

    // Aplicar transformação globe ao ponto
    const globePoint = applyGlobeTransform(
        px, py,
        canvasCenterX, canvasCenterY,
        sphericalView.globeRadius,
        sphericalView.centerDeadzone
    );

    // Mesclar transformações com sistema estendido
    const blended = blendTransformsExtended(px, py, fisheyePoint, globePoint, sphericalView.currentBlend);

    return { x: blended.x, y: blended.y };
}

/**
 * 🌈 Mescla transformações com sistema estendido (-1 a +1)
 * -1.0 = 100% Fisheye
 *  0.0 = 100% Plano (sem distorção)
 * +1.0 = 100% Globe
 * @param {number} origX - X original (sem distorção)
 * @param {number} origY - Y original (sem distorção)
 * @param {object} fisheyeTransform - Transformação fisheye {x, y, scale, opacity}
 * @param {object} globeTransform - Transformação globe {x, y, scale, opacity}
 * @param {number} blend - Valor de -1.0 a +1.0
 * @returns {object} - {x, y, scale, opacity} mesclado
 */
function blendTransformsExtended(origX, origY, fisheyeTransform, globeTransform, blend) {
    if (blend < 0) {
        // Transição Fisheye (-1) → Plano (0)
        // blend = -1.0 → 100% fisheye
        // blend = -0.5 → 50% fisheye, 50% plano
        // blend = 0.0 → 100% plano
        const t = (blend + 1.0); // Normalizar de [-1,0] para [0,1]
        return {
            x: fisheyeTransform.x * (1 - t) + origX * t,
            y: fisheyeTransform.y * (1 - t) + origY * t,
            scale: fisheyeTransform.scale * (1 - t) + 1.0 * t,
            opacity: fisheyeTransform.opacity * (1 - t) + 1.0 * t
        };
    } else {
        // Transição Plano (0) → Globe (+1)
        // blend = 0.0 → 100% plano
        // blend = +0.5 → 50% plano, 50% globe
        // blend = +1.0 → 100% globe
        const t = blend; // Já está normalizado [0,1]
        return {
            x: origX * (1 - t) + globeTransform.x * t,
            y: origY * (1 - t) + globeTransform.y * t,
            scale: 1.0 * (1 - t) + globeTransform.scale * t,
            opacity: 1.0 * (1 - t) + globeTransform.opacity * t
        };
    }
}

/**
 * �🌪️ Calcula o nível de caos baseado na distância das bordas do sistema fechado
 * Bordas = ordem (baixo caos)
 * Centro = caos máximo (entropia máxima)
 * @param {number} x - Posição X da forma
 * @param {number} y - Posição Y da forma
 * @param {number} canvasWidth - Largura do canvas
 * @param {number} canvasHeight - Altura do canvas
 * @returns {number} - Nível de caos (0.0 = bordas/ordem, 1.0 = centro/caos máximo)
 */
function calculateChaosLevel(x, y, canvasWidth, canvasHeight) {
    // Calcular distâncias normalizadas das bordas (0-1)
    const distFromLeft = x / canvasWidth;
    const distFromRight = (canvasWidth - x) / canvasWidth;
    const distFromTop = y / canvasHeight;
    const distFromBottom = (canvasHeight - y) / canvasHeight;

    // Menor distância até qualquer borda (normalizada)
    const minDistToBorder = Math.min(distFromLeft, distFromRight, distFromTop, distFromBottom);

    // 🌀 NOVO SISTEMA: -1 (bordas/expansão) ← 0 (equilíbrio) → +1 (centro/síntese)
    // Normalizar minDistToBorder (0 a 0.5) para escala (-1 a +1)
    // Bordas (minDist ≈ 0) → chaos = -1 (expansão/limites da natureza)
    // Centro (minDist ≈ 0.5) → chaos = +1 (síntese/colisões)
    // Meio-termo (minDist ≈ 0.25) → chaos = 0 (equilíbrio)

    // Mapear [0, 0.5] para [-1, +1]
    const normalizedDist = minDistToBorder * 2.0; // [0, 1]
    const chaosLevel = (normalizedDist * 2.0) - 1.0; // [-1, +1]

    // Aplicar curva não-linear para enfatizar extremos
    // Valores próximos de 0 (equilíbrio) são menos influenciados
    const sign = Math.sign(chaosLevel);
    const absValue = Math.abs(chaosLevel);
    return sign * Math.pow(absValue, 1.3); // Expoente > 1 enfatiza extremos
}


function drawCircles() {
    if (!canvas || !ctx) {
        console.error('❌ Canvas ou contexto não disponível');
        return;
    }

    try {
        // 🎨 LIMPAR CANVAS (sempre começa transparente)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 🌫️ APLICAR CAMADA DE FUNDO PRETA COM FADE SUAVE
        if (colorChaos.enabled && colorChaos.background.currentOpacity > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${colorChaos.background.currentOpacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 📊 ORDENAR FORMAS POR Z-INDEX (menor = desenhado primeiro = atrás)
        const sortedShapes = [...captchaShapes].sort((a, b) => {
            // Se não tem zIndex, considera como 50 (meio)
            const zIndexA = a.zIndex !== undefined ? a.zIndex : 50;
            const zIndexB = b.zIndex !== undefined ? b.zIndex : 50;
            return zIndexA - zIndexB;
        });

        // Desenhar todas as formas (em ordem de z-index)
        sortedShapes.forEach((shape, idx) => {
            // Salvar estado do contexto

            // 🌐 APLICAR TRANSFORMAÇÃO ESFÉRICA (Sistema -1 a +1: Fisheye ⇄ Plano ⇄ Globe)
            let transformedX = shape.x;
            let transformedY = shape.y;
            let sphericalScale = 1.0;
            let sphericalOpacity = 1.0;

            const blend = sphericalView.currentBlend;

            if (sphericalView.enabled && Math.abs(blend) > 0.01) {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;

                // Transformação Fisheye
                const fisheyeTransform = applyFisheyeTransform(
                    shape.x,
                    shape.y,
                    centerX,
                    centerY,
                    sphericalView.fisheyeStrength,
                    sphericalView.viewRotation
                );

                // Transformação Globe
                const globeTransform = applyGlobeTransform(
                    shape.x,
                    shape.y,
                    centerX,
                    centerY,
                    sphericalView.globeRadius,
                    sphericalView.centerDeadzone
                );

                // Mesclar transformações com sistema estendido -1 a +1
                const blended = blendTransformsExtended(
                    shape.x, shape.y,
                    fisheyeTransform,
                    globeTransform,
                    blend
                );

                transformedX = blended.x;
                transformedY = blended.y;
                sphericalScale = blended.scale;
                sphericalOpacity = blended.opacity;
            }

            ctx.save();

            // 📏 CALCULAR ESCALA 3D BASEADA EM Z-INDEX (perspectiva de profundidade)
            const zValue = shape.currentZ !== undefined ? shape.currentZ : 50;
            // Normalizar z-index: 0 = fundo (longe), 100 = frente (perto)
            const depthFactor = zValue / 100; // 0.0 a 1.0

            // Escala baseada em profundidade:
            // z=0 (fundo): 0.5x (50% do tamanho) - mais longe
            // z=50 (meio): 0.75x (75% do tamanho) - médio
            // z=100 (frente): 1.0x (100% do tamanho) - mais perto
            const minScale = 0.5;  // Escala mínima (fundo)
            const maxScale = 1.0;  // Escala máxima (frente)
            const scale3D = minScale + (maxScale - minScale) * depthFactor;

            // Opacidade base por profundidade:
            // z=0: 0.6 (mais transparente/longe)
            // z=100: 1.0 (mais opaco/perto)
            const minDepthOpacity = 0.6;
            const maxDepthOpacity = 1.0;
            const depthOpacity = minDepthOpacity + (maxDepthOpacity - minDepthOpacity) * depthFactor;

            // �💡⚫ CALCULAR OPACIDADE BASEADA NA DISTÂNCIA E INTENSIDADE (LUZ/ESCURIDÃO)
            const dx = shape.x - lightPoint.x;
            const dy = shape.y - lightPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Calcular fator de distância normalizado (0 = no centro, 1 = na borda do raio)
            let distanceFactor;
            if (distance <= lightPoint.radius) {
                distanceFactor = distance / lightPoint.radius;
            } else {
                distanceFactor = 1.0; // Fora do raio
            }

            // Calcular opacidade baseada na intensidade atual (luz/escuridão)
            let opacity;

            if (lightPoint.currentIntensity > 0) {
                // MODO LUZ (positivo): perto = mais opaco, longe = menos opaco
                const lightStrength = lightPoint.currentIntensity; // 0.0 a 1.0
                opacity = lightPoint.maxOpacity - (lightPoint.maxOpacity - lightPoint.minOpacity) * distanceFactor * lightStrength;
            } else if (lightPoint.currentIntensity < 0) {
                // MODO ESCURIDÃO (negativo): perto = menos opaco, longe = mais opaco (INVERTIDO)
                const darknessStrength = Math.abs(lightPoint.currentIntensity); // 0.0 a 1.0
                opacity = lightPoint.minOpacity + (lightPoint.maxOpacity - lightPoint.minOpacity) * distanceFactor * darknessStrength;
            } else {
                // NEUTRO (0.0): sem efeito, opacidade constante
                opacity = (lightPoint.maxOpacity + lightPoint.minOpacity) / 2;
            }

            // Garantir que opacidade está no range válido
            // 🎭 COMBINAR OPACIDADE: profundidade × luz/escuridão × esférica
            const finalOpacity = opacity * depthOpacity * sphericalOpacity;
            ctx.globalAlpha = finalOpacity;

            // Aplicar rotação se a forma tiver (usando posição transformada)
            if (shape.rotation !== undefined && shape.rotation !== 0) {
                ctx.translate(transformedX, transformedY);
                ctx.rotate(shape.rotation);
                ctx.translate(-transformedX, -transformedY);
            }

            ctx.beginPath();

            // Definir cores
            if (shape.clicked) {
                ctx.fillStyle = '#10b981'; // Verde quando clicado
                ctx.strokeStyle = '#059669';
            } else {
                ctx.fillStyle = shape.color || '#8b5cf6';
                ctx.strokeStyle = shape.color === '#9ca3af' ? '#6b7280' :
                    (shape.color ? getDarkerShade(shape.color) : '#7c3aed');
            }

            // 📦 APLICAR ESCALA FINAL: 3D × Esférica
            const finalScale = scale3D * sphericalScale;
            const scaledRadius = shape.radius * finalScale;

            // Centro do canvas para distorção de pontos
            const canvasCenterX = canvas.width / 2;
            const canvasCenterY = canvas.height / 2;

            // Desenhar forma baseada no tipo (com distorção de pontos)
            const shapeType = shape.type || 'circle';

            switch (shapeType) {
                case 'circle':
                    // 🌀 CÍRCULO COM DISTORÇÃO: dividir em segmentos e distorcer cada ponto
                    if (sphericalView.enabled && Math.abs(sphericalView.currentBlend) > 0.1) {
                        const segments = 32; // Número de segmentos para aproximar círculo distorcido
                        for (let i = 0; i <= segments; i++) {
                            const angle = (i / segments) * Math.PI * 2;
                            const px = transformedX + Math.cos(angle) * scaledRadius;
                            const py = transformedY + Math.sin(angle) * scaledRadius;

                            // Aplicar distorção ao ponto
                            const distorted = applyPointDistortion(
                                px, py,
                                transformedX, transformedY,
                                canvasCenterX, canvasCenterY
                            );

                            if (i === 0) {
                                ctx.moveTo(distorted.x, distorted.y);
                            } else {
                                ctx.lineTo(distorted.x, distorted.y);
                            }
                        }
                        ctx.closePath();
                    } else {
                        // Círculo normal sem distorção
                        ctx.arc(transformedX, transformedY, scaledRadius, 0, Math.PI * 2);
                    }
                    break;

                case 'square':
                    const squareSize = scaledRadius * 1.6;

                    // 🌀 QUADRADO COM DISTORÇÃO: distorcer cada vértice
                    if (sphericalView.enabled && Math.abs(sphericalView.currentBlend) > 0.1) {
                        const corners = [
                            { x: transformedX - squareSize / 2, y: transformedY - squareSize / 2 }, // Top-left
                            { x: transformedX + squareSize / 2, y: transformedY - squareSize / 2 }, // Top-right
                            { x: transformedX + squareSize / 2, y: transformedY + squareSize / 2 }, // Bottom-right
                            { x: transformedX - squareSize / 2, y: transformedY + squareSize / 2 }  // Bottom-left
                        ];

                        corners.forEach((corner, i) => {
                            const distorted = applyPointDistortion(
                                corner.x, corner.y,
                                transformedX, transformedY,
                                canvasCenterX, canvasCenterY
                            );

                            if (i === 0) {
                                ctx.moveTo(distorted.x, distorted.y);
                            } else {
                                ctx.lineTo(distorted.x, distorted.y);
                            }
                        });
                        ctx.closePath();
                    } else {
                        // Quadrado normal sem distorção
                        ctx.rect(transformedX - squareSize / 2, transformedY - squareSize / 2, squareSize, squareSize);
                    }
                    break;

                case 'triangle':
                    const triHeight = scaledRadius * 1.8;
                    const triBase = scaledRadius * 1.6;

                    // 🌀 TRIÂNGULO COM DISTORÇÃO: distorcer cada vértice
                    if (sphericalView.enabled && Math.abs(sphericalView.currentBlend) > 0.1) {
                        const vertices = [
                            { x: transformedX, y: transformedY - triHeight / 2 },                    // Top
                            { x: transformedX - triBase / 2, y: transformedY + triHeight / 2 },        // Bottom-left
                            { x: transformedX + triBase / 2, y: transformedY + triHeight / 2 }         // Bottom-right
                        ];

                        vertices.forEach((vertex, i) => {
                            const distorted = applyPointDistortion(
                                vertex.x, vertex.y,
                                transformedX, transformedY,
                                canvasCenterX, canvasCenterY
                            );

                            if (i === 0) {
                                ctx.moveTo(distorted.x, distorted.y);
                            } else {
                                ctx.lineTo(distorted.x, distorted.y);
                            }
                        });
                        ctx.closePath();
                    } else {
                        // Triângulo normal sem distorção
                        ctx.moveTo(transformedX, transformedY - triHeight / 2);
                        ctx.lineTo(transformedX - triBase / 2, transformedY + triHeight / 2);
                        ctx.lineTo(transformedX + triBase / 2, transformedY + triHeight / 2);
                        ctx.closePath();
                    }
                    break;

                case 'star':
                    // 🌀 ESTRELA COM DISTORÇÃO: distorcer cada ponta
                    if (sphericalView.enabled && Math.abs(sphericalView.currentBlend) > 0.1) {
                        const outerRadius = scaledRadius * 1.3;
                        const innerRadius = scaledRadius * 0.6;
                        const spikes = 5;
                        let rot = Math.PI / 2 * 3;
                        const step = Math.PI / spikes;

                        // Primeiro ponto (topo)
                        let firstPoint = applyPointDistortion(
                            transformedX, transformedY - outerRadius,
                            transformedX, transformedY,
                            canvasCenterX, canvasCenterY
                        );
                        ctx.moveTo(firstPoint.x, firstPoint.y);

                        // Desenhar cada ponta da estrela distorcida
                        for (let i = 0; i < spikes; i++) {
                            // Ponta externa
                            let px = transformedX + Math.cos(rot) * outerRadius;
                            let py = transformedY + Math.sin(rot) * outerRadius;
                            let distorted = applyPointDistortion(
                                px, py,
                                transformedX, transformedY,
                                canvasCenterX, canvasCenterY
                            );
                            ctx.lineTo(distorted.x, distorted.y);
                            rot += step;

                            // Ponta interna
                            px = transformedX + Math.cos(rot) * innerRadius;
                            py = transformedY + Math.sin(rot) * innerRadius;
                            distorted = applyPointDistortion(
                                px, py,
                                transformedX, transformedY,
                                canvasCenterX, canvasCenterY
                            );
                            ctx.lineTo(distorted.x, distorted.y);
                            rot += step;
                        }

                        ctx.lineTo(firstPoint.x, firstPoint.y);
                        ctx.closePath();
                    } else {
                        // Estrela normal sem distorção
                        drawStar(ctx, transformedX, transformedY, 5, scaledRadius * 1.3, scaledRadius * 0.6);
                    }
                    break;
            }

            // Configurar borda
            if (shape.dashed) {
                const dashSize = Math.floor((isMobile ? 6 : 5) * canvasScale);
                ctx.setLineDash([dashSize, dashSize]);
            } else {
                ctx.setLineDash([]);
            }

            // 🌑 APLICAR SOMBRA BASEADA EM PROFUNDIDADE (formas mais perto têm sombra mais forte)
            if (!shape.clicked) {
                const shadowBlur = 5 + (15 * depthFactor); // 5-20px blur
                const shadowOpacity = 0.2 + (0.3 * depthFactor); // 0.2-0.5 opacity
                ctx.shadowColor = `rgba(0, 0, 0, ${shadowOpacity})`;
                ctx.shadowBlur = shadowBlur;
                ctx.shadowOffsetX = 3 * depthFactor; // 0-3px offset
                ctx.shadowOffsetY = 3 * depthFactor;
            }

            ctx.lineWidth = Math.max(2, Math.floor(3 * canvasScale));
            ctx.fill();
            ctx.stroke();

            // Resetar sombra
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // Borda dupla para desafio only-borders
            if (shape.doubleBorder && !shape.clicked) {
                ctx.beginPath();
                if (shapeType === 'circle') {
                    ctx.arc(transformedX, transformedY, scaledRadius + 5 * canvasScale, 0, Math.PI * 2);
                }
                ctx.strokeStyle = shape.color;
                ctx.lineWidth = Math.max(1, Math.floor(2 * canvasScale));
                ctx.stroke();
            }

            // Resetar dash
            ctx.setLineDash([]);

            // Mostrar número da forma (para connect-dots)
            if (shape.number && !shape.clicked) {
                ctx.fillStyle = getAdaptiveTextColor();
                const fontSize = Math.floor((isMobile ? 20 : 18) * canvasScale);
                ctx.font = `bold ${fontSize}px Inter`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(shape.number, transformedX, transformedY);
            }

            // Mostrar número da ordem se clicado
            if (shape.clicked && shape.clickOrder >= 0) {
                ctx.fillStyle = getAdaptiveTextColor();
                const fontSize = Math.floor((isMobile ? 18 : 16) * canvasScale);
                ctx.font = `bold ${fontSize}px Inter`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(shape.clickOrder + 1, transformedX, transformedY);
            }

            // Restaurar estado do contexto (após aplicar rotação)
            ctx.restore();
        });
    } catch (error) {
        console.error('❌ Erro ao desenhar formas:', error);
        stopAnimation();
    }
}

// Função auxiliar para desenhar estrelas
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
}

function getDarkerShade(color) {
    const shades = {
        '#8b5cf6': '#7c3aed',
        '#ec4899': '#db2777',
        '#10b981': '#059669',
        '#f97316': '#ea580c',
        '#3b82f6': '#2563eb',
        '#ef4444': '#dc2626',  // Vermelho
        '#eab308': '#ca8a04'   // Amarelo
    };
    return shades[color] || color;
}

function handleCanvasClick(event) {
    // Verificar se canvas está bloqueado
    if (isCanvasBlocked) {
        console.log('🚫 Canvas bloqueado - clique ignorado');
        return;
    }

    const rect = canvas.getBoundingClientRect();

    // Calcular coordenadas considerando o scaling do canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    processCircleClick(x, y);
}

function handleCanvasTouch(event) {
    // Verificar se canvas está bloqueado
    if (isCanvasBlocked) {
        console.log('🚫 Canvas bloqueado - toque ignorado');
        event.preventDefault();
        return;
    }

    event.preventDefault(); // Prevenir scroll e zoom

    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0] || event.changedTouches[0];

    // Calcular coordenadas considerando o scaling do canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    processCircleClick(x, y);
}

function processCircleClick(x, y) {
    // Última camada de segurança: verificar bloqueio
    if (isCanvasBlocked) {
        console.log('🚫 processCircleClick bloqueado - ignorando');
        return;
    }

    // Calcular centro do canvas para transformações
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Verificar qual forma foi clicada (considerando transformações esféricas)
    for (let i = captchaShapes.length - 1; i >= 0; i--) {
        const shape = captchaShapes[i];
        const shapeType = shape.type || 'circle';

        // Aplicar transformações esféricas para obter posição visual da forma
        let visualX = shape.x;
        let visualY = shape.y;
        let visualScale = 1.0;

        if (sphericalView.enabled && Math.abs(sphericalView.currentBlend) > 0.01) {
            // Mesma lógica do drawCircles
            const fisheyeTransform = applyFisheyeTransform(
                shape.x, shape.y, centerX, centerY,
                sphericalView.fisheyeStrength, sphericalView.viewRotation
            );
            const globeTransform = applyGlobeTransform(
                shape.x, shape.y, centerX, centerY,
                sphericalView.globeRadius, sphericalView.centerDeadzone
            );
            const blended = blendTransformsExtended(shape.x, shape.y, fisheyeTransform, globeTransform, sphericalView.currentBlend);

            visualX = blended.x;
            visualY = blended.y;
            visualScale = blended.scale;
        }

        // Aplicar escala 3D
        const zValue = shape.currentZ !== undefined ? shape.currentZ : 50;
        const depthFactor = zValue / 100;
        const scale3D = 0.5 + (0.5 * depthFactor);
        const finalScale = scale3D * visualScale;

        let isInside = false;

        // Verificar se o clique está dentro da forma (usando posição e escala transformadas)
        switch (shapeType) {
            case 'circle':
                const distance = Math.sqrt((x - visualX) ** 2 + (y - visualY) ** 2);
                const touchRadius = (isMobile ? shape.radius + 10 : shape.radius) * finalScale;
                isInside = distance <= touchRadius;
                break;

            case 'square':
                const squareSize = shape.radius * 1.6 * finalScale;
                const halfSize = squareSize / 2;
                const buffer = isMobile ? 10 : 5;
                isInside = (x >= visualX - halfSize - buffer && x <= visualX + halfSize + buffer &&
                    y >= visualY - halfSize - buffer && y <= visualY + halfSize + buffer);
                break;

            case 'triangle':
                // Aproximação simples: verificar se está dentro do círculo que contém o triângulo
                const triDist = Math.sqrt((x - visualX) ** 2 + (y - visualY) ** 2);
                const triRadius = (isMobile ? shape.radius * 1.8 + 10 : shape.radius * 1.8) * finalScale;
                isInside = triDist <= triRadius;
                break;

            case 'star':
                // Aproximação: verificar se está dentro do círculo externo da estrela
                const starDist = Math.sqrt((x - visualX) ** 2 + (y - visualY) ** 2);
                const starRadius = (isMobile ? shape.radius * 1.3 + 10 : shape.radius * 1.3) * finalScale;
                isInside = starDist <= starRadius;
                break;
        }

        if (isInside) {
            // Verificar se é distrator cinza
            if (shape.isDistractor && shape.color === '#9ca3af') {
                showCaptchaError('❌ Não clique nos elementos cinzas!');
                return;
            }

            // Para desafios de formas específicas, verificar o tipo
            if (currentChallengeType === 'shape-squares' && shape.type !== 'square') {
                showCaptchaError('❌ Clique apenas nos quadrados roxos!');
                return;
            }
            if (currentChallengeType === 'shape-triangles' && shape.type !== 'triangle') {
                showCaptchaError('❌ Clique apenas nos triângulos roxos!');
                return;
            }
            if (currentChallengeType === 'shape-stars' && shape.type !== 'star') {
                showCaptchaError('❌ Clique apenas nas estrelas roxas!');
                return;
            }

            // Para desafios de cor específica
            if (currentChallengeType === 'color-blue-shapes' && shape.color !== '#3b82f6') {
                showCaptchaError('❌ Clique apenas nas formas azuis!');
                return;
            }
            if (currentChallengeType === 'color-green-shapes' && shape.color !== '#10b981') {
                showCaptchaError('❌ Clique apenas nas formas verdes!');
                return;
            }
            if (currentChallengeType === 'color-pink-shapes' && shape.color !== '#ec4899') {
                showCaptchaError('❌ Clique apenas nas formas rosas!');
                return;
            }
            if (currentChallengeType === 'color-orange-shapes' && shape.color !== '#f97316') {
                showCaptchaError('❌ Clique apenas nas formas laranjas!');
                return;
            }

            // Para desafio de forma E cor específicas
            if (currentChallengeType === 'shape-color-match' && (shape.type !== 'square' || shape.color !== '#10b981')) {
                showCaptchaError('❌ Clique apenas nos quadrados verdes!');
                return;
            }

            // Para desafio same-color-different-shapes
            if (currentChallengeType === 'same-color-different-shapes' && shape.color !== '#8b5cf6') {
                showCaptchaError('❌ Clique apenas nas formas roxas!');
                return;
            }

            // Para desafio avoid-color, verificar se clicou em círculo vermelho
            if (currentChallengeType === 'avoid-color' && shape.isDangerous) {
                showCaptchaError('❌ Não clique nos círculos vermelhos!');
                setTimeout(() => regenerateCaptcha(), 1500);
                return;
            }

            // Para desafio odd-circles, verificar se clicou em círculo sólido
            if (currentChallengeType === 'odd-circles' && shape.isDistractor) {
                showCaptchaError('❌ Clique apenas nos círculos com bordas tracejadas!');
                setTimeout(() => regenerateCaptcha(), 1500);
                return;
            }

            // Para desafio only-borders, verificar se clicou em círculo sem borda dupla
            if (currentChallengeType === 'only-borders' && shape.isDistractor) {
                showCaptchaError('❌ Clique apenas nos círculos com borda dupla!');
                setTimeout(() => regenerateCaptcha(), 1500);
                return;
            }

            if (!shape.clicked) {
                shape.clicked = true;
                shape.clickOrder = clickedOrder.length;
                clickedOrder.push(i);
                drawCircles();

                // Verificar quantos elementos devem ser clicados
                const targetCount = getTargetClickCount();
                const validShapes = captchaShapes.filter(c => !c.isDistractor || (c.isDistractor && c.color !== '#9ca3af'));
                const clickedValidShapes = validShapes.filter(c => c.clicked);

                if (clickedValidShapes.length === targetCount) {
                    // Verificar automaticamente
                    setTimeout(() => verifyCaptcha(), 300);
                }
            }
            break;
        }
    }
}

function getTargetClickCount() {
    switch (currentChallengeType) {
        case 'odd-circles':
        case 'only-borders':
        case 'shape-squares':
        case 'shape-triangles':
        case 'shape-stars':
        case 'color-blue-shapes':
        case 'color-green-shapes':
        case 'color-pink-shapes':
        case 'color-orange-shapes':
        case 'shape-color-match':
            return 3;
        case 'avoid-color':
        case 'shape-mix-order':
        case 'rainbow-shapes':
        case 'same-color-different-shapes':
            return 4;
        default:
            return 5;
    }
}

function verifyCaptcha() {
    let isCorrect = false;

    switch (currentChallengeType) {
        case 'size-ascending':
            isCorrect = verifySizeAscending();
            break;
        case 'size-descending':
            isCorrect = verifySizeDescending();
            break;
        case 'color-sequence':
            isCorrect = verifyColorSequence();
            break;
        case 'position-left':
            isCorrect = verifyPositionLeft();
            break;
        case 'odd-circles':
            isCorrect = verifyOddCircles();
            break;
        case 'position-top':
            isCorrect = verifyPositionTop();
            break;
        case 'rainbow-order':
            isCorrect = verifyRainbowOrder();
            break;
        case 'avoid-color':
            isCorrect = verifyAvoidColor();
            break;
        case 'only-borders':
            isCorrect = verifyOnlyBorders();
            break;
        case 'diagonal-pattern':
            isCorrect = verifyDiagonalPattern();
            break;
        case 'concentric-rings':
            isCorrect = verifyConcentricRings();
            break;
        case 'connect-dots':
            isCorrect = verifyConnectDots();
            break;
        case 'shape-squares':
            isCorrect = verifyShapeSquares();
            break;
        case 'shape-triangles':
            isCorrect = verifyShapeTriangles();
            break;
        case 'shape-stars':
            isCorrect = verifyShapeStars();
            break;
        case 'shape-mix-order':
            isCorrect = verifyShapeMixOrder();
            break;
        case 'color-blue-shapes':
            isCorrect = verifyColorShapes('#3b82f6', 'azuis');
            break;
        case 'color-green-shapes':
            isCorrect = verifyColorShapes('#10b981', 'verdes');
            break;
        case 'color-pink-shapes':
            isCorrect = verifyColorShapes('#ec4899', 'rosas');
            break;
        case 'color-orange-shapes':
            isCorrect = verifyColorShapes('#f97316', 'laranjas');
            break;
        case 'shape-color-match':
            isCorrect = verifyShapeColorMatch();
            break;
        case 'rainbow-shapes':
            isCorrect = verifyRainbowShapes();
            break;
        case 'same-color-different-shapes':
            isCorrect = verifySameColorDifferentShapes();
            break;
    }

    if (isCorrect) {
        // Sucesso! Resetar timeout (recompensar comportamento correto)
        resetRegenerateTimeout();
        closeCaptcha();
        performDownload();
    } else {
        // Bloquear canvas e mostrar contador ternário (-1→0→+1)
        blockCaptchaCanvas();

        // Resetar após 1.5s
        setTimeout(() => {
            unblockCaptchaCanvas();
            regenerateCaptcha();
        }, 1500);
    }
}

// ⚛️ FUNÇÃO: Converter decimal (-1 a +1) para ternário balanceado
// Representa feedback/backfeed: - (passado), 0 (presente), + (futuro)
function decimalToBalancedTernary(value, digits = 8) {
    // Normalizar valor para [0, 1] → mapear para range ternário
    const normalized = (value + 1.0) / 2.0; // -1→0, 0→0.5, +1→1

    // Calcular valor ternário máximo para n dígitos
    // Em ternário balanceado: máximo = (3^n - 1) / 2
    const maxTernary = (Math.pow(3, digits) - 1) / 2;

    // Mapear valor normalizado para range ternário: [-maxTernary, +maxTernary]
    const ternaryValue = Math.round((normalized * 2.0 - 1.0) * maxTernary);

    // Converter para ternário balanceado (base -1, 0, +1)
    let remaining = ternaryValue;
    const trits = [];

    for (let i = 0; i < digits; i++) {
        const trit = ((remaining % 3) + 3) % 3;

        if (trit === 0) {
            trits.push('0');
        } else if (trit === 1) {
            trits.push('+');
            remaining = Math.floor(remaining / 3);
        } else { // trit === 2
            trits.push('-');
            remaining = Math.floor(remaining / 3) + 1;
        }
    }

    // Reverter array para ordem correta (mais significativo primeiro)
    return trits.reverse().join('');
}

// Função para bloquear canvas com overlay e contador ternário
function blockCaptchaCanvas(durationSeconds = 1.5) {
    const overlay = document.getElementById('captchaBlockOverlay');
    const counter = document.getElementById('binaryCounter');
    const canvas = document.getElementById('captchaCanvas');
    const modalOverlay = document.getElementById('modalBlockOverlay');
    const cancelBtn = document.querySelector('.captcha-btn-cancel');

    if (!overlay || !counter || !canvas) return;

    // ATIVAR FLAG DE BLOQUEIO
    isCanvasBlocked = true;

    // Parar animação das formas
    stopAnimation();

    // Desabilitar eventos do canvas
    canvas.style.pointerEvents = 'none';
    canvas.style.touchAction = 'none';

    // 🔒 DESABILITAR BOTÃO CANCELAR
    if (cancelBtn) {
        cancelBtn.disabled = true;
        cancelBtn.style.opacity = '0.5';
        cancelBtn.style.cursor = 'not-allowed';
    }

    // 🔒 BLOQUEAR MODAL INTEIRO
    if (modalOverlay) {
        modalOverlay.classList.add('active');
    }

    // Mostrar overlay
    overlay.classList.add('active');

    // ⚛️ SISTEMA TERNÁRIO (-1, 0, +1) - Passado, Presente, Futuro
    // Calcular parâmetros do contador baseado na duração
    const durationMs = durationSeconds * 1000;
    const updateInterval = 50; // Atualizar a cada 50ms
    const totalSteps = Math.floor(durationMs / updateInterval);

    // Contador vai de -1.0 (passado/bloqueado) até +1.0 (futuro/livre)
    const startValue = -1.0;
    const endValue = 1.0;
    const increment = (endValue - startValue) / totalSteps;

    let currentValue = startValue;

    const interval = setInterval(() => {
        currentValue += increment;

        // Converter para representação ternária balanceada de 8 dígitos
        // Cada posição pode ser: - (negativo), 0 (zero), + (positivo)
        const ternary = decimalToBalancedTernary(currentValue, 8);
        counter.textContent = ternary;

        if (currentValue >= endValue) {
            counter.textContent = '++++++++'; // Garantir que termine em ++++++++
            clearInterval(interval);
        }
    }, updateInterval);

    console.log(`🔒 Canvas E MODAL bloqueados por ${durationSeconds}s - contador ternário (-1→0→+1) sincronizado`);
}

// Função para desbloquear canvas
function unblockCaptchaCanvas() {
    const overlay = document.getElementById('captchaBlockOverlay');
    const canvas = document.getElementById('captchaCanvas');
    const modalOverlay = document.getElementById('modalBlockOverlay');
    const cancelBtn = document.querySelector('.captcha-btn-cancel');

    if (!overlay || !canvas) return;

    // Remover overlay
    overlay.classList.remove('active');

    // 🔓 REABILITAR BOTÃO CANCELAR
    if (cancelBtn) {
        cancelBtn.disabled = false;
        cancelBtn.style.opacity = '1';
        cancelBtn.style.cursor = 'pointer';
    }

    // 🔓 DESBLOQUEAR MODAL INTEIRO
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
    }

    // Reabilitar eventos do canvas
    canvas.style.pointerEvents = 'auto';
    canvas.style.touchAction = 'none';

    // DESATIVAR FLAG DE BLOQUEIO
    isCanvasBlocked = false;

    console.log('🔓 Canvas E MODAL desbloqueados');
}

function verifySizeAscending() {
    const validCircles = captchaShapes.filter(c => !c.isDistractor || c.color !== '#9ca3af');
    const clickedCircles = validCircles
        .filter(c => c.clicked)
        .sort((a, b) => a.clickOrder - b.clickOrder);

    if (clickedCircles.length !== 5) {
        showCaptchaError('❌ Clique em todos os 5 círculos roxos!');
        return false;
    }

    for (let i = 0; i < clickedCircles.length - 1; i++) {
        if (clickedCircles[i].radius > clickedCircles[i + 1].radius) {
            showCaptchaError('❌ Ordem incorreta! Do menor para o maior.');
            return false;
        }
    }

    return true;
}

function verifySizeDescending() {
    const validCircles = captchaShapes.filter(c => !c.isDistractor || c.color !== '#9ca3af');
    const clickedCircles = validCircles
        .filter(c => c.clicked)
        .sort((a, b) => a.clickOrder - b.clickOrder);

    if (clickedCircles.length !== 5) {
        showCaptchaError('❌ Clique em todos os 5 círculos roxos!');
        return false;
    }

    for (let i = 0; i < clickedCircles.length - 1; i++) {
        if (clickedCircles[i].radius < clickedCircles[i + 1].radius) {
            showCaptchaError('❌ Ordem incorreta! Do maior para o menor.');
            return false;
        }
    }

    return true;
}

function verifyColorSequence() {
    const clickedCircles = captchaShapes
        .filter(c => c.clicked && c.colorIndex !== undefined)
        .sort((a, b) => a.clickOrder - b.clickOrder);

    if (clickedCircles.length !== 5) {
        showCaptchaError('❌ Clique em todos os 5 círculos coloridos!');
        return false;
    }

    // Verificar se a ordem está correta: 0, 1, 2, 3, 4
    for (let i = 0; i < 5; i++) {
        if (clickedCircles[i].colorIndex !== i) {
            showCaptchaError('❌ Sequência incorreta! Siga: Roxo → Rosa → Verde → Laranja → Azul');
            return false;
        }
    }

    return true;
}

function verifyPositionLeft() {
    const validCircles = captchaShapes.filter(c => !c.isDistractor || c.color !== '#9ca3af');
    const clickedCircles = validCircles
        .filter(c => c.clicked)
        .sort((a, b) => a.clickOrder - b.clickOrder);

    if (clickedCircles.length !== 5) {
        showCaptchaError('❌ Clique em todos os 5 círculos roxos!');
        return false;
    }

    // Verificar se clicou da esquerda para direita (ordem crescente de x)
    for (let i = 0; i < clickedCircles.length - 1; i++) {
        if (clickedCircles[i].x > clickedCircles[i + 1].x) {
            showCaptchaError('❌ Ordem incorreta! Clique da esquerda para a direita.');
            return false;
        }
    }

    return true;
}

function verifyOddCircles() {
    const dashedCircles = captchaShapes.filter(c => c.dashed);
    const clickedDashed = dashedCircles.filter(c => c.clicked);

    if (clickedDashed.length !== 3) {
        showCaptchaError('❌ Clique nos 3 círculos com bordas tracejadas!');
        return false;
    }

    return true;
}

function verifyPositionTop() {
    const validCircles = captchaShapes.filter(c => !c.isDistractor || c.color !== '#9ca3af');
    const clickedCircles = validCircles
        .filter(c => c.clicked)
        .sort((a, b) => a.clickOrder - b.clickOrder);

    if (clickedCircles.length !== 5) {
        showCaptchaError('❌ Clique em todos os 5 círculos roxos!');
        return false;
    }

    // Verificar se a ordem está correta (de cima para baixo)
    for (let i = 0; i < clickedCircles.length - 1; i++) {
        if (clickedCircles[i].y > clickedCircles[i + 1].y) {
            showCaptchaError('❌ Ordem incorreta! De cima para baixo.');
            return false;
        }
    }

    return true;
}

function verifyRainbowOrder() {
    const clickedCircles = captchaShapes
        .filter(c => c.clicked && c.colorIndex !== undefined)
        .sort((a, b) => a.clickOrder - b.clickOrder);

    if (clickedCircles.length !== 5) {
        showCaptchaError('❌ Clique em todos os 5 círculos coloridos!');
        return false;
    }

    // Verificar se a ordem está correta: Vermelho(0) → Laranja(1) → Amarelo(2) → Verde(3) → Azul(4)
    for (let i = 0; i < 5; i++) {
        if (clickedCircles[i].colorIndex !== i) {
            showCaptchaError('❌ Sequência incorreta! Siga: Vermelho → Laranja → Amarelo → Verde → Azul');
            return false;
        }
    }

    return true;
}

function verifyAvoidColor() {
    const safeCircles = captchaShapes.filter(c => c.isSafe);
    const clickedSafe = safeCircles.filter(c => c.clicked);
    const clickedDangerous = captchaShapes.filter(c => c.isDangerous && c.clicked);

    if (clickedDangerous.length > 0) {
        showCaptchaError('❌ Você clicou em círculos vermelhos!');
        return false;
    }

    if (clickedSafe.length !== 4) {
        showCaptchaError('❌ Clique nos 4 círculos não-vermelhos!');
        return false;
    }

    return true;
}

function verifyOnlyBorders() {
    const borderCircles = captchaShapes.filter(c => c.doubleBorder);
    const clickedBorders = borderCircles.filter(c => c.clicked);

    if (clickedBorders.length !== 3) {
        showCaptchaError('❌ Clique nos 3 círculos com borda dupla!');
        return false;
    }

    return true;
}

function verifyDiagonalPattern() {
    const validCircles = captchaShapes.filter(c => !c.isDistractor || c.color !== '#9ca3af');
    const clickedCircles = validCircles
        .filter(c => c.clicked)
        .sort((a, b) => a.clickOrder - b.clickOrder);

    if (clickedCircles.length !== 5) {
        showCaptchaError('❌ Clique em todos os 5 círculos roxos!');
        return false;
    }

    // Verificar se seguiu a diagonal (x e y devem aumentar)
    for (let i = 0; i < clickedCircles.length - 1; i++) {
        const current = clickedCircles[i];
        const next = clickedCircles[i + 1];

        // Permitir margem de erro de 40 pixels para a diagonal
        const expectedX = current.x + (canvas.width / 5);
        const expectedY = current.y + (canvas.height / 5);

        if (next.x < current.x - 20 || next.y < current.y - 20) {
            showCaptchaError('❌ Ordem incorreta! Siga a diagonal do canto superior esquerdo ao inferior direito.');
            return false;
        }
    }

    return true;
}

function verifyConcentricRings() {
    const validCircles = captchaShapes.filter(c => !c.isDistractor || c.color !== '#9ca3af');
    const clickedCircles = validCircles
        .filter(c => c.clicked)
        .sort((a, b) => a.clickOrder - b.clickOrder);

    if (clickedCircles.length !== 5) {
        showCaptchaError('❌ Clique em todos os 5 círculos roxos!');
        return false;
    }

    // Verificar se foi do centro para fora (distâncias crescentes)
    for (let i = 0; i < clickedCircles.length - 1; i++) {
        if (clickedCircles[i].distanceFromCenter > clickedCircles[i + 1].distanceFromCenter) {
            showCaptchaError('❌ Ordem incorreta! Clique do centro para fora.');
            return false;
        }
    }

    return true;
}

function verifyConnectDots() {
    const validCircles = captchaShapes.filter(c => !c.isDistractor || c.color !== '#9ca3af');
    const clickedCircles = validCircles
        .filter(c => c.clicked)
        .sort((a, b) => a.clickOrder - b.clickOrder);

    if (clickedCircles.length !== 5) {
        showCaptchaError('❌ Clique em todos os 5 círculos numerados!');
        return false;
    }

    // Verificar se seguiu a ordem numérica (1, 2, 3, 4, 5)
    for (let i = 0; i < 5; i++) {
        if (clickedCircles[i].number !== i + 1) {
            showCaptchaError('❌ Ordem incorreta! Siga os números: 1 → 2 → 3 → 4 → 5');
            return false;
        }
    }

    return true;
}

function verifyShapeSquares() {
    const squares = captchaShapes.filter(c => c.type === 'square' && c.color === '#8b5cf6');
    const clickedSquares = squares.filter(c => c.clicked);

    if (clickedSquares.length !== 3) {
        showCaptchaError('❌ Clique em todos os 3 quadrados roxos!');
        return false;
    }

    // Verificar se clicou em algo que não é quadrado roxo
    const clickedShapes = captchaShapes.filter(c => c.clicked);
    for (let shape of clickedShapes) {
        if (shape.type !== 'square' || shape.color !== '#8b5cf6') {
            showCaptchaError('❌ Clique APENAS nos quadrados roxos!');
            return false;
        }
    }

    return true;
}

function verifyShapeTriangles() {
    const triangles = captchaShapes.filter(c => c.type === 'triangle' && c.color === '#8b5cf6');
    const clickedTriangles = triangles.filter(c => c.clicked);

    if (clickedTriangles.length !== 3) {
        showCaptchaError('❌ Clique em todos os 3 triângulos roxos!');
        return false;
    }

    // Verificar se clicou em algo que não é triângulo roxo
    const clickedShapes = captchaShapes.filter(c => c.clicked);
    for (let shape of clickedShapes) {
        if (shape.type !== 'triangle' || shape.color !== '#8b5cf6') {
            showCaptchaError('❌ Clique APENAS nos triângulos roxos!');
            return false;
        }
    }

    return true;
}

function verifyShapeStars() {
    const stars = captchaShapes.filter(c => c.type === 'star' && c.color === '#8b5cf6');
    const clickedStars = stars.filter(c => c.clicked);

    if (clickedStars.length !== 3) {
        showCaptchaError('❌ Clique em todas as 3 estrelas roxas!');
        return false;
    }

    // Verificar se clicou em algo que não é estrela roxa
    const clickedShapes = captchaShapes.filter(c => c.clicked);
    for (let shape of clickedShapes) {
        if (shape.type !== 'star' || shape.color !== '#8b5cf6') {
            showCaptchaError('❌ Clique APENAS nas estrelas roxas!');
            return false;
        }
    }

    return true;
}

function verifyShapeMixOrder() {
    const validShapes = captchaShapes.filter(c => c.color === '#8b5cf6');
    const clickedShapes = validShapes
        .filter(c => c.clicked)
        .sort((a, b) => a.clickOrder - b.clickOrder);

    if (clickedShapes.length !== 4) {
        showCaptchaError('❌ Clique nas 4 formas roxas na ordem correta!');
        return false;
    }

    // Verificar ordem: círculo → quadrado → triângulo → estrela
    const expectedOrder = ['circle', 'square', 'triangle', 'star'];
    for (let i = 0; i < 4; i++) {
        if (clickedShapes[i].type !== expectedOrder[i]) {
            showCaptchaError('❌ Ordem incorreta! Siga: Círculo → Quadrado → Triângulo → Estrela');
            return false;
        }
    }

    return true;
}

function verifyColorShapes(targetColor, colorName) {
    const colorShapes = captchaShapes.filter(c => c.color === targetColor);
    const clickedColorShapes = colorShapes.filter(c => c.clicked);

    if (clickedColorShapes.length !== 3) {
        showCaptchaError(`❌ Clique em todas as 3 formas ${colorName}!`);
        return false;
    }

    // Verificar se clicou em algo da cor errada
    const clickedShapes = captchaShapes.filter(c => c.clicked);
    for (let shape of clickedShapes) {
        if (shape.color !== targetColor) {
            showCaptchaError(`❌ Clique APENAS nas formas ${colorName}!`);
            return false;
        }
    }

    return true;
}

function verifyShapeColorMatch() {
    const greenSquares = captchaShapes.filter(c => c.type === 'square' && c.color === '#10b981');
    const clickedGreenSquares = greenSquares.filter(c => c.clicked);

    if (clickedGreenSquares.length !== 3) {
        showCaptchaError('❌ Clique em todos os 3 quadrados verdes!');
        return false;
    }

    // Verificar se clicou em algo que não é quadrado verde
    const clickedShapes = captchaShapes.filter(c => c.clicked);
    for (let shape of clickedShapes) {
        if (shape.type !== 'square' || shape.color !== '#10b981') {
            showCaptchaError('❌ Clique APENAS nos quadrados verdes!');
            return false;
        }
    }

    return true;
}

function verifyRainbowShapes() {
    const rainbowShapes = captchaShapes.filter(c => c.colorOrder !== undefined);
    const clickedShapes = rainbowShapes
        .filter(c => c.clicked)
        .sort((a, b) => a.clickOrder - b.clickOrder);

    if (clickedShapes.length !== 4) {
        showCaptchaError('❌ Clique nas 4 formas coloridas na ordem correta!');
        return false;
    }

    // Verificar ordem: Vermelho → Laranja → Verde → Azul (colorOrder: 0, 1, 2, 3)
    for (let i = 0; i < 4; i++) {
        if (clickedShapes[i].colorOrder !== i) {
            showCaptchaError('❌ Ordem incorreta! Siga: Vermelho → Laranja → Verde → Azul');
            return false;
        }
    }

    return true;
}

function verifySameColorDifferentShapes() {
    const purpleShapes = captchaShapes.filter(c => c.color === '#8b5cf6');
    const clickedPurpleShapes = purpleShapes.filter(c => c.clicked);

    if (clickedPurpleShapes.length !== 4) {
        showCaptchaError('❌ Clique em todas as 4 formas roxas!');
        return false;
    }

    // Verificar se clicou em algo que não é roxo
    const clickedShapes = captchaShapes.filter(c => c.clicked);
    for (let shape of clickedShapes) {
        if (shape.color !== '#8b5cf6') {
            showCaptchaError('❌ Clique APENAS nas formas roxas!');
            return false;
        }
    }

    return true;
}

function showCaptchaError(message) {
    const error = document.getElementById('captchaError');
    error.textContent = message;
    error.classList.add('active');

    setTimeout(() => {
        error.classList.remove('active');
    }, 2000);
}

function regenerateCaptcha() {
    const now = Date.now();
    const btn = document.querySelector('.captcha-refresh-btn');

    // Verificar se está em timeout
    if (regenerateTimeoutId !== null) {
        console.log('⏳ Timeout ativo, ignorando clique');
        return;
    }

    // Calcular delay desde último clique
    const timeSinceLastClick = lastRegenerateTime === 0 ? Infinity : (now - lastRegenerateTime) / 1000;

    // Adicionar ao histórico de cliques
    regenerateClickHistory.push(now);
    // Manter apenas últimos 10 cliques
    if (regenerateClickHistory.length > 10) {
        regenerateClickHistory.shift();
    }

    // SISTEMA DE PENALIDADE ADAPTATIVA
    // Quanto menor o delay, maior a penalidade
    let newTimeout = 0;

    if (timeSinceLastClick < 2) {
        // Clique muito rápido (< 2s) - penalidade severa
        newTimeout = Math.min(regenerateTimeout + 15, 60); // +15s, máx 60s
        console.warn('🚨 Clique muito rápido! Penalidade: +15s');
    } else if (timeSinceLastClick < 5) {
        // Clique rápido (< 5s) - penalidade moderada
        newTimeout = Math.min(regenerateTimeout + 8, 60); // +8s, máx 60s
        console.warn('⚠️ Clique rápido! Penalidade: +8s');
    } else if (timeSinceLastClick < 10) {
        // Clique normal (< 10s) - penalidade leve
        newTimeout = Math.min(regenerateTimeout + 3, 60); // +3s, máx 60s
        console.log('⏱️ Clique normal. Penalidade: +3s');
    } else {
        // Clique após pausa (> 10s) - reduzir timeout gradualmente
        newTimeout = Math.max(regenerateTimeout - 5, 2); // -5s, mín 2s
        console.log('✅ Pausa detectada. Reduzindo timeout: -5s');
    }

    regenerateTimeout = newTimeout;
    lastRegenerateTime = now;

    // 🍪 SALVAR ESTADO EM COOKIES
    saveLockToCookie(now, regenerateTimeout);
    saveHistoryToCookie(regenerateClickHistory);

    // Determinar duração do bloqueio
    // Se há timeout, usar o tempo do timeout, senão usar 1.5s padrão
    const blockDuration = regenerateTimeout > 0 ? regenerateTimeout : 1.5;

    // 🔒 BLOQUEAR CANVAS COM OVERLAY (sincronizado com timeout)
    blockCaptchaCanvas(blockDuration);

    // Aplicar timeout se necessário
    if (regenerateTimeout > 0) {
        btn.disabled = true;
        btn.textContent = `⏳ Aguarde ${regenerateTimeout}s`;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';

        // Contador visual
        let remaining = regenerateTimeout;
        regenerateTimeoutId = setInterval(() => {
            remaining--;
            if (remaining > 0) {
                btn.textContent = `⏳ Aguarde ${remaining}s`;
            } else {
                // Liberar botão
                clearInterval(regenerateTimeoutId);
                regenerateTimeoutId = null;
                btn.disabled = false;
                btn.textContent = '🔄 Gerar novo desafio';
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                console.log('✅ Timeout finalizado, botão liberado');
            }
        }, 1000);
    }

    // Limpar erro
    const error = document.getElementById('captchaError');
    error.classList.remove('active');

    // Parar animação atual
    stopAnimation();

    // Limpar completamente
    captchaShapes = [];
    clickedOrder = [];

    // IMPORTANTE: Resetar frameCount para evitar overflow e sincronização
    frameCount = 0;

    // Aguardar duração do bloqueio antes de gerar novo desafio
    setTimeout(() => {
        // 🔓 DESBLOQUEAR CANVAS
        unblockCaptchaCanvas();

        // Gerar novo desafio (que vai iniciar nova animação)
        generateVisualCaptcha();

        console.log(`🔄 Captcha regenerado. Próximo timeout: ${regenerateTimeout}s`);
    }, blockDuration * 1000); // Converter para milissegundos
}

function showCaptcha() {
    console.log('🔍 showCaptcha() iniciado');
    const overlay = document.getElementById('captchaOverlay');
    console.log('📦 Overlay encontrado:', !!overlay);

    // 🍪 CARREGAR ESTADO DOS COOKIES
    const savedLock = loadLockFromCookie();
    const savedHistory = loadHistoryFromCookie();

    if (savedLock) {
        // Verificar se lock ainda é válido
        const now = Date.now();
        const timeSinceLock = (now - savedLock.timestamp) / 1000;
        const remainingTimeout = Math.max(0, savedLock.timeout - timeSinceLock);

        if (remainingTimeout > 0) {
            console.warn('🍪 Lock encontrado no cookie! Timeout restante:', remainingTimeout.toFixed(1) + 's');
            lastRegenerateTime = savedLock.timestamp;
            regenerateTimeout = Math.ceil(remainingTimeout);
        } else {
            clearLockCookies();
        }
    }

    if (savedHistory.length > 0) {
        // Restaurar histórico (últimas 10 entradas)
        regenerateClickHistory = savedHistory.slice(-10);
        console.log('🍪 Histórico restaurado:', regenerateClickHistory.length, 'entradas');
    }

    // Inicializar canvas - SEMPRE reinicializar para garantir
    console.log('🎨 Inicializando canvas...');
    const canvasInit = initCanvas();
    if (!canvasInit || !ctx) {
        console.error('❌ Falha ao inicializar canvas!');
        alert('Erro ao carregar captcha. Por favor, recarregue a página.');
        return;
    }

    // Limpar estado
    console.log('🧹 Limpando estado...');
    captchaShapes = [];
    clickedOrder = [];

    // Resetar frameCount
    frameCount = 0;

    // Gerar novo captcha
    console.log('🎲 Gerando captcha visual...');
    generateVisualCaptcha();

    // Limpar erro
    const error = document.getElementById('captchaError');
    if (error) error.classList.remove('active');

    // Mostrar modal
    console.log('👀 Mostrando overlay...');
    overlay.classList.add('active');
    console.log('✅ showCaptcha() completo');
}

function closeCaptcha() {
    // 🚫 BLOQUEAR fechamento durante contagem
    if (isCanvasBlocked) {
        console.warn('🚫 Modal bloqueado - não é possível fechar durante contagem');
        return;
    }

    const overlay = document.getElementById('captchaOverlay');
    overlay.classList.remove('active');

    // Parar animação
    stopAnimation();

    // Limpar estado
    captchaShapes = [];
    clickedOrder = [];

    // Resetar timeout ao fechar (não penalizar usuário que desistiu)
    resetRegenerateTimeout();
}

// Função para resetar o sistema de timeout
function resetRegenerateTimeout() {
    if (regenerateTimeoutId !== null) {
        clearInterval(regenerateTimeoutId);
        regenerateTimeoutId = null;
    }

    regenerateTimeout = 0;
    lastRegenerateTime = 0;
    regenerateClickHistory = [];

    // 🍪 LIMPAR COOKIES
    clearLockCookies();

    // Restaurar botão ao estado normal
    const btn = document.querySelector('.captcha-refresh-btn');
    if (btn) {
        btn.disabled = false;
        btn.textContent = '🔄 Gerar novo desafio';
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    }

    console.log('🔄 Timeout resetado e cookies limpos');
}

function performDownload() {
    console.log('Iniciando download:', formato.nome, '→', formato.arquivo);

    // Download direto para todos os formatos
    const link = document.createElement('a');
    link.href = formato.arquivo;
    link.download = formato.arquivo.split('/').pop();
    link.style.display = 'none';

    // Para forçar download no navegador
    link.setAttribute('download', formato.arquivo.split('/').pop());

    document.body.appendChild(link);
    console.log('Download iniciado:', link.download);

    try {
        link.click();
        // Mostrar notificação de sucesso
        showDownloadNotification();
    } catch (error) {
        console.error('Erro ao iniciar download:', error);
        alert(`Erro ao baixar o arquivo ${formato.nome}.\nPor favor, tente novamente ou acesse diretamente: ${formato.arquivo}`);
    } finally {
        // Limpar após um pequeno delay
        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);
    }
}

function showDownloadNotification() {
    // Notificação de download
    const notification = document.createElement('div');
    notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 350px;
            `;
    notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span style="font-size: 1.5rem;">${formato.icone}</span>
                    <div>
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">Download iniciado!</div>
                        <div style="font-size: 0.85rem; opacity: 0.9;">
                            ${formato.nome} • ${formato.tamanho}
                        </div>
                    </div>
                </div>
            `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function downloadEPUB() {
    console.log('🎯 downloadEPUB() chamada');
    try {
        // Mostrar captcha antes de fazer download
        console.log('📝 Chamando showCaptcha()...');
        showCaptcha();
        console.log('✅ showCaptcha() executado');
    } catch (error) {
        console.error('❌ Erro em downloadEPUB():', error);
        alert('Erro ao abrir captcha: ' + error.message);
    }
}

// Inicializar quando página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOMContentLoaded - Inicializando...');

    // Tentar inicializar canvas (pode falhar se modal estiver hidden)
    const canvasInitResult = initCanvas();
    if (!canvasInitResult) {
        console.log('⚠️ Canvas não inicializado no load (será inicializado ao abrir modal)');
    }

    // Fechar captcha ao clicar fora do modal
    const overlay = document.getElementById('captchaOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeCaptcha();
            }
        });
    }

    // Reinicializar canvas ao redimensionar janela
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (canvas && document.getElementById('captchaOverlay').classList.contains('active')) {
                initCanvas();
                regenerateCaptcha();
            }
        }, 250);
    });

    console.log('✅ Inicialização completa');
});

// Animações CSS
const style = document.createElement('style');
style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
document.head.appendChild(style);

// ===================================
// FUNÇÕES PARA CAPTCHA DE ENTRADA
// ===================================

// Variáveis globais para captcha de entrada
let entryCanvas, entryCtx;
let entryCaptchaShapes = [];
let entryClickedOrder = [];
let entryCurrentChallengeType = '';
let entryIsCanvasBlocked = false;
// Contador de tentativas fracassadas da entrada (persistido em cookie)
const COOKIE_ENTRY_ATTEMPTS = 'entry_failed_attempts';

function setCookie(name, value, days = 365) {
    try {
        const expires = new Date(Date.now() + days * 86400000).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(String(value))}; expires=${expires}; path=/; SameSite=Strict`;
    } catch (e) {
        console.warn('⚠️ setCookie falhou', e);
    }
}

function getCookie(name) {
    try {
        const cookies = document.cookie.split(';').map(c => c.trim());
        for (let c of cookies) {
            if (!c) continue;
            const [k, ...rest] = c.split('=');
            if (k === name) return decodeURIComponent(rest.join('='));
        }
    } catch (e) {
        console.warn('⚠️ getCookie falhou', e);
    }
    return null;
}

function getEntryFailedAttempts() {
    const v = parseInt(getCookie(COOKIE_ENTRY_ATTEMPTS) || '0', 10);
    return isNaN(v) ? 0 : v;
}

function incrementEntryFailedAttempts() {
    const next = getEntryFailedAttempts() + 1;
    setCookie(COOKIE_ENTRY_ATTEMPTS, String(next), 365);
    updateEntryAttemptsIndicator(next);
    return next;
}

function resetEntryFailedAttempts() {
    // remover cookie definindo expirada
    try {
        document.cookie = `${COOKIE_ENTRY_ATTEMPTS}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } catch { }
    updateEntryAttemptsIndicator(0);
}

function updateEntryAttemptsIndicator(count) {
    try {
        const el = document.getElementById('entryAttemptsIndicator');
        if (!el) return;
        el.textContent = `Tentativas: ${count}`;
        // Visual hint for debug: add a class when attempts > 0
        if (count > 0) el.classList.add('has-attempts'); else el.classList.remove('has-attempts');
    } catch (e) { /* ignore */ }
}

function initEntryCaptcha() {
    console.log('🎨 initEntryCaptcha() chamado');
    entryCanvas = document.getElementById('entryCaptchaCanvas') || document.getElementById('captchaCanvas');
    if (!entryCanvas) {
        console.error('❌ Canvas de entrada não encontrado!');
        return false;
    }
    console.log('✓ Canvas encontrado:', entryCanvas.id);

    entryCtx = entryCanvas.getContext('2d');
    if (!entryCtx) {
        console.error('❌ Contexto 2D não disponível');
        return false;
    }

    // Detectar mobile
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Event listeners
    entryCanvas.removeEventListener('click', handleEntryCaptchaClick);
    entryCanvas.removeEventListener('touchstart', handleEntryCaptchaTouchstart);

    entryCanvas.addEventListener('click', handleEntryCaptchaClick);
    entryCanvas.addEventListener('touchstart', handleEntryCaptchaTouchstart, { passive: false });

    // Gerar captcha inicial
    generateEntryCaptcha();

    console.log('✅ initEntryCaptcha() completo');
    return true;
}

function generateEntryCaptcha(forcedType) {
    console.log('🎲 generateEntryCaptcha() iniciado - timestamp:', Date.now());

    // Verificar se canvas e contexto estão disponíveis
    if (!entryCanvas || !entryCtx) {
        console.error('❌ Canvas ou contexto não disponível');

        // Tentar obter referências novamente sem chamar initEntryCaptcha (evitar loop)
        entryCanvas = document.getElementById('entryCaptchaCanvas') || document.getElementById('captchaCanvas');
        if (entryCanvas) {
            entryCtx = entryCanvas.getContext('2d');
            console.log('✅ Canvas recuperado:', entryCanvas.id);
        }

        if (!entryCanvas || !entryCtx) {
            console.error('❌ Não foi possível recuperar canvas - abortando');
            return;
        }
    }

    console.log('✓ Canvas OK:', entryCanvas.id, 'Dimensões:', entryCanvas.width, 'x', entryCanvas.height);

    // Limpar
    entryCaptchaShapes = [];
    entryClickedOrder = [];
    entryCtx.clearRect(0, 0, entryCanvas.width, entryCanvas.height);

    console.log('✓ Canvas limpo - gerando novo desafio...');

    // Escolher tipo de desafio — se a chamada fornecer um tipo explícito, usá-lo,
    // caso contrário escolher aleatoriamente (compatibilidade com chamadas existentes)
    if (typeof forcedType === 'string' && forcedType.length) {
        entryCurrentChallengeType = forcedType;
    } else {
        entryCurrentChallengeType = getRandomChallengeType();
    }
    console.log('🎯 Tipo de desafio entrada:', entryCurrentChallengeType);

    // Atualizar instrução (suporta múltiplos IDs para compatibilidade)
    let instruction = document.getElementById('entryCaptchaInstruction');
    if (!instruction) {
        instruction = document.getElementById('captchaInstruction');
    }
    if (instruction) {
        instruction.innerHTML = getChallengeInstruction(entryCurrentChallengeType);
        console.log('📝 Instrução de entrada atualizada:', entryCurrentChallengeType);
    } else {
        console.warn('⚠️ Elemento de instrução de entrada não encontrado');
    }

    // Salvar contexto atual do download (se existir)
    const tempCanvas = typeof canvas !== 'undefined' ? canvas : null;
    const tempCtx = typeof ctx !== 'undefined' ? ctx : null;
    const tempShapes = typeof captchaShapes !== 'undefined' ? captchaShapes : [];
    const tempType = typeof currentChallengeType !== 'undefined' ? currentChallengeType : null;
    const tempScale = typeof canvasScale !== 'undefined' ? canvasScale : 1;
    const tempMobile = typeof isMobile !== 'undefined' ? isMobile : false;

    // Configurar contexto temporário para entrada
    canvas = entryCanvas;
    ctx = entryCtx;
    captchaShapes = [];
    currentChallengeType = entryCurrentChallengeType;
    // Canvas de entrada usa dimensões reais (fullscreen)
    canvasScale = 1;
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    console.log('📐 Dimensões do canvas de entrada:', entryCanvas.width, 'x', entryCanvas.height);

    // Gerar desafio usando as funções existentes
    switch (entryCurrentChallengeType) {
        case 'size-ascending':
        case 'size-descending':
            generateSizeChallenge();
            break;
        case 'color-sequence':
            generateColorChallenge();
            break;
        case 'position-left':
            generatePositionChallenge();
            break;
        case 'odd-circles':
            generateOddCirclesChallenge();
            break;
        case 'position-top':
            generatePositionTopChallenge();
            break;
        case 'rainbow-order':
            generateRainbowChallenge();
            break;
        case 'avoid-color':
            generateAvoidColorChallenge();
            break;
        case 'diagonal-pattern':
            generateDiagonalChallenge();
            break;
        case 'concentric-rings':
            generateConcentricRingsChallenge();
            break;
        case 'connect-dots':
            generateConnectDotsChallenge();
            break;
        case 'shape-squares':
            generateShapeSquaresChallenge();
            break;
        case 'shape-triangles':
            generateShapeTrianglesChallenge();
            break;
        case 'shape-stars':
            generateShapeStarsChallenge();
            break;
        case 'shape-mix-order':
            generateShapeMixOrderChallenge();
            break;
        case 'color-blue-shapes':
            generateColorShapesChallenge('#3b82f6');
            break;
        case 'color-green-shapes':
            generateColorShapesChallenge('#10b981');
            break;
        case 'color-pink-shapes':
            generateColorShapesChallenge('#ec4899');
            break;
        case 'color-orange-shapes':
            generateColorShapesChallenge('#f97316');
            break;
        case 'shape-color-match':
            generateShapeColorMatchChallenge();
            break;
        case 'rainbow-shapes':
            generateRainbowShapesChallenge();
            break;
        case 'same-color-different-shapes':
            generateSameColorDifferentShapesChallenge();
            break;
        default:
            generateSizeChallenge();
            break;
    }

    // Copiar shapes gerados para entrada
    entryCaptchaShapes = [...captchaShapes];

    // Restaurar contexto do download
    canvas = tempCanvas;
    ctx = tempCtx;
    captchaShapes = tempShapes;
    currentChallengeType = tempType;
    canvasScale = tempScale;
    isMobile = tempMobile;

    console.log('🎨 Desenhando entrada... Total:', entryCaptchaShapes.length);
    drawEntryCaptcha();
    console.log('✅ generateEntryCaptcha() COMPLETO - timestamp:', Date.now());
}

function drawEntryCaptcha() {
    console.log('🖌️ drawEntryCaptcha() iniciado - shapes:', entryCaptchaShapes.length);
    entryCtx.clearRect(0, 0, entryCanvas.width, entryCanvas.height);

    // Desenhar cada forma manualmente (baseado em drawCircles)
    entryCaptchaShapes.forEach((shape, idx) => {
        entryCtx.save();

        // Aplicar rotação se necessário
        if (shape.rotation !== undefined && shape.rotation !== 0) {
            entryCtx.translate(shape.x, shape.y);
            entryCtx.rotate(shape.rotation);
            entryCtx.translate(-shape.x, -shape.y);
        }

        entryCtx.beginPath();

        // Definir cores
        if (shape.clicked) {
            entryCtx.fillStyle = '#10b981'; // Verde quando clicado
            entryCtx.strokeStyle = '#059669';
        } else {
            entryCtx.fillStyle = shape.color || '#8b5cf6';
            entryCtx.strokeStyle = shape.color === '#9ca3af' ? '#6b7280' :
                (shape.color ? getDarkerShade(shape.color) : '#7c3aed');
        }

        // Desenhar forma baseada no tipo
        const shapeType = shape.type || 'circle';

        switch (shapeType) {
            case 'circle':
                entryCtx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
                break;

            case 'square':
                const squareSize = shape.radius * 1.6;
                entryCtx.rect(shape.x - squareSize / 2, shape.y - squareSize / 2, squareSize, squareSize);
                break;

            case 'triangle':
                const triHeight = shape.radius * 1.8;
                const triBase = shape.radius * 1.6;
                entryCtx.moveTo(shape.x, shape.y - triHeight / 2);
                entryCtx.lineTo(shape.x - triBase / 2, shape.y + triHeight / 2);
                entryCtx.lineTo(shape.x + triBase / 2, shape.y + triHeight / 2);
                entryCtx.closePath();
                break;

            case 'star':
                drawStar(entryCtx, shape.x, shape.y, 5, shape.radius * 1.3, shape.radius * 0.6);
                break;
        }

        // Configurar borda
        if (shape.dashed) {
            entryCtx.setLineDash([5, 5]);
        } else {
            entryCtx.setLineDash([]);
        }

        entryCtx.lineWidth = 3;
        entryCtx.fill();
        entryCtx.stroke();

        // Borda dupla
        if (shape.doubleBorder && !shape.clicked) {
            entryCtx.beginPath();
            if (shapeType === 'circle') {
                entryCtx.arc(shape.x, shape.y, shape.radius + 5, 0, Math.PI * 2);
            }
            entryCtx.strokeStyle = shape.color;
            entryCtx.lineWidth = 2;
            entryCtx.stroke();
        }

        // Resetar dash
        entryCtx.setLineDash([]);

        // Mostrar número (connect-dots)
        if (shape.number && !shape.clicked) {
            entryCtx.fillStyle = getAdaptiveTextColor();
            entryCtx.font = 'bold 18px Inter';
            entryCtx.textAlign = 'center';
            entryCtx.textBaseline = 'middle';
            entryCtx.fillText(shape.number, shape.x, shape.y);
        }

        // Mostrar ordem de clique
        if (shape.clicked && shape.clickOrder !== undefined) {
            entryCtx.fillStyle = getAdaptiveTextColor();
            entryCtx.font = 'bold 16px Inter';
            entryCtx.textAlign = 'center';
            entryCtx.textBaseline = 'middle';
            entryCtx.fillText(shape.clickOrder + 1, shape.x, shape.y);
        }

        entryCtx.restore();
    });

    console.log('✅ drawEntryCaptcha() COMPLETO - desenhadas', entryCaptchaShapes.length, 'formas');
}

function handleEntryCaptchaClick(event) {
    if (entryIsCanvasBlocked) {
        console.log('🚫 Canvas bloqueado - clique ignorado');
        return;
    }

    const rect = entryCanvas.getBoundingClientRect();
    const scaleX = entryCanvas.width / rect.width;
    const scaleY = entryCanvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    processEntryCaptchaClick(x, y);
}

function handleEntryCaptchaTouchstart(event) {
    if (entryIsCanvasBlocked) {
        console.log('🚫 Canvas bloqueado - toque ignorado');
        event.preventDefault();
        return;
    }

    event.preventDefault();

    const rect = entryCanvas.getBoundingClientRect();
    const touch = event.touches[0];
    const scaleX = entryCanvas.width / rect.width;
    const scaleY = entryCanvas.height / rect.height;

    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    processEntryCaptchaClick(x, y);
}

function processEntryCaptchaClick(x, y) {
    // Verificar qual forma foi clicada
    for (let i = entryCaptchaShapes.length - 1; i >= 0; i--) {
        const shape = entryCaptchaShapes[i];
        const shapeType = shape.type || 'circle';
        let isInside = false;

        // Verificar se o clique está dentro da forma (mesma lógica do download)
        switch (shapeType) {
            case 'circle':
                const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
                const touchRadius = shape.radius + 10; // Buffer para mobile
                isInside = distance <= touchRadius;
                break;

            case 'square':
                const squareSize = shape.radius * 1.6;
                const halfSize = squareSize / 2;
                const buffer = 10;
                isInside = (x >= shape.x - halfSize - buffer && x <= shape.x + halfSize + buffer &&
                    y >= shape.y - halfSize - buffer && y <= shape.y + halfSize + buffer);
                break;

            case 'triangle':
                const triDist = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
                const triRadius = shape.radius * 1.8 + 10;
                isInside = triDist <= triRadius;
                break;

            case 'star':
                const starDist = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
                const starRadius = shape.radius * 1.3 + 10;
                isInside = starDist <= starRadius;
                break;
        }

        if (isInside) {
            // Verificar se é distrator cinza
            if (shape.isDistractor && shape.color === '#9ca3af') {
                showEntryCaptchaError();
                return;
            }

            // Validações por tipo de desafio
            if (entryCurrentChallengeType === 'shape-squares' && shape.type !== 'square') {
                showEntryCaptchaError();
                return;
            }
            if (entryCurrentChallengeType === 'shape-triangles' && shape.type !== 'triangle') {
                showEntryCaptchaError();
                return;
            }
            if (entryCurrentChallengeType === 'shape-stars' && shape.type !== 'star') {
                showEntryCaptchaError();
                return;
            }
            if (entryCurrentChallengeType === 'color-blue-shapes' && shape.color !== '#3b82f6') {
                showEntryCaptchaError();
                return;
            }
            if (entryCurrentChallengeType === 'color-green-shapes' && shape.color !== '#10b981') {
                showEntryCaptchaError();
                return;
            }
            if (entryCurrentChallengeType === 'color-pink-shapes' && shape.color !== '#ec4899') {
                showEntryCaptchaError();
                return;
            }
            if (entryCurrentChallengeType === 'color-orange-shapes' && shape.color !== '#f97316') {
                showEntryCaptchaError();
                return;
            }
            if (entryCurrentChallengeType === 'shape-color-match' && (shape.type !== 'square' || shape.color !== '#10b981')) {
                showEntryCaptchaError();
                return;
            }
            if (entryCurrentChallengeType === 'same-color-different-shapes' && shape.color !== '#8b5cf6') {
                showEntryCaptchaError();
                return;
            }
            if (entryCurrentChallengeType === 'avoid-color' && shape.isDangerous) {
                showEntryCaptchaError();
                blockEntryCaptcha(1.5);
                setTimeout(() => {
                    unblockEntryCaptcha();
                    generateEntryCaptcha();
                }, 1500);
                return;
            }
            if (entryCurrentChallengeType === 'odd-circles' && shape.isDistractor) {
                showEntryCaptchaError();
                blockEntryCaptcha(1.5);
                setTimeout(() => {
                    unblockEntryCaptcha();
                    generateEntryCaptcha();
                }, 1500);
                return;
            }
            if (entryCurrentChallengeType === 'only-borders' && shape.isDistractor) {
                showEntryCaptchaError();
                blockEntryCaptcha(1.5);
                setTimeout(() => {
                    unblockEntryCaptcha();
                    generateEntryCaptcha();
                }, 1500);
                return;
            }

            if (!shape.clicked) {
                shape.clicked = true;
                shape.clickOrder = entryClickedOrder.length; // Adicionar ordem de clique
                entryClickedOrder.push(shape);
                drawEntryCaptcha();

                // Determinar quantas formas devem ser clicadas baseado no tipo de desafio
                let targetCount;
                switch (entryCurrentChallengeType) {
                    case 'odd-circles':
                    case 'only-borders':
                    case 'shape-squares':
                    case 'shape-triangles':
                    case 'shape-stars':
                    case 'color-blue-shapes':
                    case 'color-green-shapes':
                    case 'color-pink-shapes':
                    case 'color-orange-shapes':
                    case 'shape-color-match':
                        targetCount = 3;
                        break;
                    case 'avoid-color':
                    case 'shape-mix-order':
                    case 'rainbow-shapes':
                    case 'same-color-different-shapes':
                        targetCount = 4;
                        break;
                    default:
                        targetCount = 5;
                        break;
                }

                // Verificar automaticamente após clicar no número correto
                if (entryClickedOrder.length === targetCount) {
                    setTimeout(verifyEntryCaptcha, 300);
                }
            }
            break;
        }
    }
}

function verifyEntryCaptcha() {
    console.log('🔍 Verificando captcha de entrada...');

    let isCorrect = false;

    try {
        // Usar as mesmas funções de verificação do download
        const tempShapes = captchaShapes;
        const tempClickedOrder = clickedOrder;
        const tempType = currentChallengeType;

        // Temporariamente usar arrays de entrada
        captchaShapes = entryCaptchaShapes;
        clickedOrder = entryClickedOrder.map(shape => entryCaptchaShapes.indexOf(shape));
        currentChallengeType = entryCurrentChallengeType;

        console.log('📊 Verificando tipo:', entryCurrentChallengeType, 'cliques:', clickedOrder);

        // Verificar usando as funções existentes
        switch (entryCurrentChallengeType) {
            case 'size-ascending':
                isCorrect = verifySizeAscending();
                break;
            case 'size-descending':
                isCorrect = verifySizeDescending();
                break;
            case 'color-sequence':
                isCorrect = verifyColorSequence();
                break;
            case 'position-left':
                isCorrect = verifyPositionLeft();
                break;
            case 'odd-circles':
                isCorrect = verifyOddCircles();
                break;
            case 'position-top':
                isCorrect = verifyPositionTop();
                break;
            case 'rainbow-order':
                isCorrect = verifyRainbowOrder();
                break;
            case 'avoid-color':
                isCorrect = verifyAvoidColor();
                break;
            case 'only-borders':
                isCorrect = verifyOnlyBorders();
                break;
            case 'diagonal-pattern':
                isCorrect = verifyDiagonalPattern();
                break;
            case 'concentric-rings':
                isCorrect = verifyConcentricRings();
                break;
            case 'connect-dots':
                isCorrect = verifyConnectDots();
                break;
            case 'shape-squares':
                isCorrect = verifyShapeSquares();
                break;
            case 'shape-triangles':
                isCorrect = verifyShapeTriangles();
                break;
            case 'shape-stars':
                isCorrect = verifyShapeStars();
                break;
            case 'shape-mix-order':
                isCorrect = verifyShapeMixOrder();
                break;
            case 'color-blue-shapes':
                isCorrect = verifyColorShapes('#3b82f6', 'azuis');
                break;
            case 'color-green-shapes':
                isCorrect = verifyColorShapes('#10b981', 'verdes');
                break;
            case 'color-pink-shapes':
                isCorrect = verifyColorShapes('#ec4899', 'rosas');
                break;
            case 'color-orange-shapes':
                isCorrect = verifyColorShapes('#f97316', 'laranjas');
                break;
            case 'shape-color-match':
                isCorrect = verifyShapeColorMatch();
                break;
            case 'rainbow-shapes':
                isCorrect = verifyRainbowShapes();
                break;
            case 'same-color-different-shapes':
                isCorrect = verifySameColorDifferentShapes();
                break;
        }

        // Restaurar
        captchaShapes = tempShapes;
        clickedOrder = tempClickedOrder;
        currentChallengeType = tempType;

        if (isCorrect) {
            // Sucesso!
            sessionStorage.setItem('entry_captcha_passed', 'true');
            // Resetar contador de tentativas ao atingir sucesso
            resetEntryFailedAttempts();
            document.getElementById('entryCaptchaOverlay').classList.remove('active');
            console.log('✅ Captcha de entrada verificado com sucesso!');
            return true;
        } else {
            // Erro
            showEntryCaptchaError();

            // Incrementar contador de tentativas falhas e calcular duração adaptativa
            const attempts = incrementEntryFailedAttempts();
            // Regra: cada falha adiciona +1.5s, começando em 1.5s; cap em 120s para segurança
            const adaptiveDuration = Math.min(1.5 + (attempts - 1) * 1.5, 120);
            console.warn(`🔒 Falha na tentativa de entrada (#${attempts}) - bloqueando por ${adaptiveDuration}s`);

            // Bloquear usando duração adaptativa; o fluxo de desbloqueio/reload é tratado por blockEntryCaptcha
            blockEntryCaptcha(adaptiveDuration);

            return false;
        }

    } catch (error) {
        console.error('❌ Erro ao verificar captcha:', error);
        showEntryCaptchaError();
        return false;
    }
}

function showEntryCaptchaError() {
    const error = document.getElementById('entryCaptchaError');
    error.classList.add('active');

    setTimeout(() => {
        error.classList.remove('active');
    }, 2000);
}

function blockEntryCaptcha(durationSeconds = 1.5) {
    const overlay = document.getElementById('entryCaptchaBlockOverlay');
    const counter = document.getElementById('entryBinaryCounter');
    const modalOverlay = document.getElementById('entryModalBlockOverlay');

    if (!overlay || !counter) return;

    entryIsCanvasBlocked = true;

    if (modalOverlay) {
        modalOverlay.classList.add('active');
    }

    // Garantir que o overlay ocupe toda a tela (forçar fullscreen)
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    // Remover transform definido por CSS que centralizava como caixa — causa deslocamento para canto
    overlay.style.transform = 'none';
    overlay.style.minWidth = '0';
    // Tornar os arredores totalmente transparentes (sem fundo, borda ou sombra)
    overlay.style.background = 'transparent';
    overlay.style.border = 'none';
    overlay.style.boxShadow = 'none';
    overlay.style.backdropFilter = 'none';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '99999';
    overlay.classList.add('active');

    // Estilizar contador para destaque fullscreen
    counter.style.fontFamily = "'JetBrains Mono', monospace";
    counter.style.fontSize = '48px';
    counter.style.letterSpacing = '0.35em';
    counter.style.color = '#10b981';
    counter.style.textAlign = 'center';
    // Transitions: transform, opacity, color and background-color for smooth toggling
    counter.style.transition = 'transform 120ms ease, opacity 80ms linear, color 120ms ease, background-color 800ms ease';
    // Inicial background (escuro) e padding para melhor leitura
    counter.style.backgroundColor = '#000';
    counter.style.padding = '12px 20px';
    counter.style.borderRadius = '8px';
    // Tornar o texto em baixo (submessage) branco e arredores transparentes
    try {
        const sub = overlay.querySelector('.captcha-block-submessage');
        if (sub) {
            sub.style.color = '#ffffff';
            // garantir fundo transparente no redor
            sub.style.background = 'transparent';
            sub.style.padding = '4px 8px';
        }
    } catch (e) { /* ignore */ }

    // ⚛️ SISTEMA TERNÁRIO (-1, 0, +1) - Passado, Presente, Futuro
    const durationMs = durationSeconds * 1000;
    const updateInterval = 50;
    const totalSteps = Math.floor(durationMs / updateInterval);

    // Contador vai de -1.0 (passado/bloqueado) até +1.0 (futuro/livre)
    const startValue = -1.0;
    const endValue = 1.0;
    const increment = (endValue - startValue) / totalSteps;

    let currentValue = startValue;

    // Glitch helpers
    const glitchTimeouts = [];
    let lastRendered = '';
    const glitchChars = ['@', '#', '%', '$', '&', '*', '+', '-', '~', '0', '1', '░', '▒', '▓'];

    // Background toggle (smooth alternation between black and white)
    let bgToggle = false;
    const bgInterval = setInterval(() => {
        try {
            bgToggle = !bgToggle;
            if (bgToggle) {
                counter.style.backgroundColor = '#fff';
                counter.style.color = '#0f172a';
                counter.style.textShadow = 'none';
            } else {
                counter.style.backgroundColor = '#000';
                counter.style.color = '#10b981';
                counter.style.textShadow = '0 0 10px rgba(16,185,129,0.5)';
            }
        } catch (e) { /* ignore */ }
    }, 800 + Math.floor(Math.random() * 400));

    function makeGlitch(s) {
        // Replace a few characters randomly to simulate glitch
        const arr = s.split('');
        const count = Math.max(1, Math.floor(arr.length * 0.25));
        for (let i = 0; i < count; i++) {
            const idx = Math.floor(Math.random() * arr.length);
            arr[idx] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }
        return arr.join('');
    }

    const interval = setInterval(() => {
        currentValue += increment;

        // Converter para representação ternária balanceada de 8 dígitos
        const ternary = decimalToBalancedTernary(currentValue, 8);
        lastRendered = ternary;
        counter.textContent = lastRendered;

        // Aleatoriamente disparar um pequeno 'glitch' visual
        if (Math.random() < 0.12) {
            const g = makeGlitch(lastRendered);
            counter.textContent = g;
            // transform + color flicker
            counter.style.transform = `translate(${(Math.random() - 0.5) * 8}px, ${(Math.random() - 0.5) * 6}px) skew(${(Math.random() - 0.5) * 6}deg)`;
            counter.style.color = ['#10b981', '#ec4899', '#f59e0b'][Math.floor(Math.random() * 3)];

            const t = setTimeout(() => {
                counter.textContent = lastRendered;
                counter.style.transform = '';
                counter.style.color = '#10b981';
            }, 80 + Math.floor(Math.random() * 220));
            glitchTimeouts.push(t);
        }

        if (currentValue >= endValue) {
            counter.textContent = '++++++++';
            clearInterval(interval);
            // limpar glitches pendentes
            while (glitchTimeouts.length) clearTimeout(glitchTimeouts.pop());
            // parar alternância de fundo e restaurar estilos
            try { clearInterval(bgInterval); } catch (e) { }
            try {
                counter.style.backgroundColor = '';
                counter.style.color = '#10b981';
                counter.style.textShadow = '0 0 10px rgba(16,185,129,0.5)';
            } catch (e) { }

            // Ao finalizar a contagem ternária, desbloquear e recarregar a página
            try {
                unblockEntryCaptcha();
            } catch (e) {
                console.warn('⚠️ Erro ao tentar desbloquear entrada antes de reload:', e);
            }

            // Pequeno delay para garantir que o DOM reflita o desbloqueio antes do reload
            setTimeout(() => {
                console.log('↻ Recarregando página após bloqueio ternário completar');
                try {
                    window.location.reload();
                } catch (e) {
                    try { location.reload(); } catch (e2) { console.warn('❌ reload falhou:', e2); }
                }
            }, 120);
        }
    }, updateInterval);

    console.log(`🔒 Captcha de entrada bloqueado por ${durationSeconds}s - contador ternário (-1→0→+1)`);
}

function unblockEntryCaptcha() {
    const overlay = document.getElementById('entryCaptchaBlockOverlay');
    const modalOverlay = document.getElementById('entryModalBlockOverlay');

    if (overlay) {
        overlay.classList.remove('active');
    }

    if (modalOverlay) {
        modalOverlay.classList.remove('active');
    }

    entryIsCanvasBlocked = false;

    console.log('🔓 Captcha de entrada desbloqueado');
}

function regenerateEntryCaptcha() {
    if (entryIsCanvasBlocked) {
        console.warn('🚫 Captcha bloqueado - não é possível regenerar');
        return;
    }

    console.log('🔄 Regenerando captcha de entrada...');
    blockEntryCaptcha(1.5);

    setTimeout(() => {
        console.log('⏰ Timeout completado - gerando novo captcha');
        unblockEntryCaptcha();

        // Limpar estado anterior
        entryCaptchaShapes = [];
        entryClickedOrder = [];

        // Regenerar tudo do zero
        generateEntryCaptcha();
    }, 1600); // Extra 100ms para garantir
}

// Helper para embaralhar array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Expor funções de entrada no escopo global para uso no HTML
window.initEntryCaptcha = initEntryCaptcha;
window.generateEntryCaptcha = generateEntryCaptcha;
window.verifyEntryCaptcha = verifyEntryCaptcha;
window.regenerateEntryCaptcha = regenerateEntryCaptcha;
// Função auxiliar para TDD/UI: alterar desafio de entrada e regenerar o canvas
function changeEntryChallenge(type) {
    console.log('🔁 changeEntryChallenge() chamado com:', type);
    try {
        // Atualizar o tipo de desafio de entrada explicitamente
        entryCurrentChallengeType = type;
    } catch (e) {
        // Se não existir entryCurrentChallengeType, atualizar currentChallengeType como fallback
        console.warn('⚠️ entryCurrentChallengeType não definido, usando currentChallengeType como fallback');
        try { currentChallengeType = type; } catch (e2) { }
    }

    // Chamar a geração do captcha de entrada (preferir window-level para permitir spies/mocks)
    if (typeof window !== 'undefined' && typeof window.generateEntryCaptcha === 'function') {
        // Passar o tipo explicitamente para que a geração use o desafio solicitado
        window.generateEntryCaptcha(type);
        return;
    }

    if (typeof generateEntryCaptcha === 'function') {
        generateEntryCaptcha(type);
        return;
    }

    // Fallback: chamar a geração visual genérica (window preferido)
    if (typeof window !== 'undefined' && typeof window.generateVisualCaptcha === 'function') {
        window.generateVisualCaptcha();
        return;
    }

    if (typeof generateVisualCaptcha === 'function') {
        generateVisualCaptcha();
        return;
    }

    console.error('❌ Nenhuma função de geração de captcha encontrada para regenerar o desafio');
}

// Expor para uso no HTML/JS
window.changeEntryChallenge = changeEntryChallenge;

// Auto-inicializar captcha de entrada se o overlay estiver presente
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOMContentLoaded - Verificando captcha de entrada...');

    const entryOverlay = document.getElementById('entryCaptchaOverlay');
    if (!entryOverlay) {
        console.log('ℹ️ Sem overlay de entrada nesta página');
        return;
    }

    // Verificar se já passou pelo captcha
    const entryCaptchaPassed = sessionStorage.getItem('entry_captcha_passed');

    if (entryCaptchaPassed === 'true') {
        console.log('✅ Captcha de entrada já foi completado - ocultando');
        entryOverlay.classList.remove('active');
    } else {
        console.log('🔒 Captcha de entrada necessário - inicializando');
        entryOverlay.classList.add('active');

        // Aguardar um pouco para garantir que DOM está pronto
        setTimeout(() => {
            initEntryCaptcha();
        }, 100);
    }

    // Prevenir fechamento do modal de entrada sem completar
    entryOverlay.addEventListener('click', (e) => {
        if (e.target === entryOverlay && !entryIsCanvasBlocked) {
            console.warn('⚠️ Captcha de entrada deve ser completado para acessar o conteúdo');
        }
    });
});
