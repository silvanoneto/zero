/**
 * 🌉 BRIDGE: Integração Möbius ↔ Rizoma
 * 
 * Conecta a Fita de Möbius (navegação macro) com o Rizoma (navegação micro)
 * Permite explorar conceitos relacionados ao clicar em pontos da fita
 */

// Mapeamento de capítulos para conceitos do rizoma
const chapterConceptsMap = {
    'cap-0': {
        concepts: ['rizoma', 'navegacao-rizomatica', 'temporalidade', 'fita-mobius'],
        readingTime: '5 min',
        difficulty: 'iniciante',
        description: 'Aprenda a navegar neste livro não-linear'
    },
    'cap-1': {
        concepts: ['marxismo', 'mais-valia', 'mercadoria', 'trabalho'],
        readingTime: '15 min',
        difficulty: 'iniciante',
        description: 'Fundamentos da crítica marxista ao capitalismo'
    },
    'cap-2': {
        concepts: ['cibernetica', 'feedback', 'segunda-ordem', 'autopoiese'],
        readingTime: '15 min',
        difficulty: 'intermediário',
        description: 'Ciência do controle e comunicação em sistemas'
    },
    'cap-3': {
        concepts: ['capitalismo-digital', 'plataformas', 'extracao-dados'],
        readingTime: '12 min',
        difficulty: 'intermediário',
        description: 'Como o capitalismo se reorganiza no digital'
    },
    'cap-4': {
        concepts: ['economia-politica', 'centro-periferia', 'dependencia', 'superexploracao', 
                   'cepal', 'furtado', 'marini', 'cybersyn', 'ogas', 'calculo-socialista',
                   'hayek', 'glushkov', 'planejamento-cibernetico', 'soberania-tecnologica',
                   'neocolonialismo-digital', 'extrativismo-dados'],
        readingTime: '20 min',
        difficulty: 'intermediário',
        description: 'Teoria da Dependência, planejamento cibernético e neocolonialismo digital'
    },
    'cap-5': {
        concepts: ['subsuncao-formal', 'subsuncao-real', 'composicao-organica-capital', 'queda-taxa-lucro', 'general-intellect', 'capital-constante', 'capital-variavel', 'contratendencias', 'critica-capital', 'dialética', 'materialismo'],
        readingTime: '18 min',
        difficulty: 'avançado',
        description: 'Marx e a crítica da economia política: subsunção do trabalho, composição orgânica do capital, queda tendencial da taxa de lucro e o conceito revolucionário de General Intellect'
    },
    'cap-6': {
        concepts: ['feedback-positivo', 'feedback-negativo', 'variedade-requisita', 'autopoiese', 'fechamento-operacional', 'cibernetica-primeira-ordem', 'cibernetica-segunda-ordem', 'acoplamento-estrutural', 'recursividade', 'emergencia', 'modelo-sistema-viavel', 'vsm', 'stafford-beer', 'cybersyn', 'escalada-simetrica', 'patologias-ciberneticas', 'bateson', 'maturana', 'varela', 'ashby', 'von-foerster', 'sistemas-complexos', 'comunicacao', 'controle-cibernetico'],
        readingTime: '25 min',
        difficulty: 'avançado',
        description: 'Cibernética aplicada à sociedade: feedback, Lei da Variedade Requisita, autopoiese, acoplamento estrutural, VSM e patologias sistêmicas'
    },
    'cap-7': {
        concepts: ['tecnologia', 'automacao', 'trabalho-digital'],
        readingTime: '10 min',
        difficulty: 'intermediário',
        description: 'Tecnologia sob perspectiva marxista'
    },
    'cap-8': {
        concepts: ['trabalho-imaterial', 'cognitariado', 'precarizacao'],
        readingTime: '12 min',
        difficulty: 'intermediário',
        description: 'Transformações do trabalho na era digital'
    },
    'cap-9': {
        concepts: ['pos-operaismo', 'trabalho-vivo', 'general-intellect'],
        readingTime: '15 min',
        difficulty: 'avançado',
        description: 'Teoria crítica italiana sobre trabalho cognitivo'
    },
    'cap-10': {
        concepts: ['critica-valor', 'forma-mercadoria', 'fetichismo'],
        readingTime: '15 min',
        difficulty: 'avançado',
        description: 'Crítica radical da forma-valor'
    },
    'cap-11': {
        concepts: ['sintese-informacional', 'dados', 'informacao'],
        readingTime: '12 min',
        difficulty: 'intermediário',
        description: 'Síntese entre materialismo e informação'
    },
    'cap-12': {
        concepts: ['ciberfeminismo', 'genero', 'tecnofeminismo'],
        readingTime: '10 min',
        difficulty: 'intermediário',
        description: 'Feminismo e tecnologia digital'
    },
    'cap-13': {
        concepts: ['plataformas', 'monopolio-digital', 'big-tech'],
        readingTime: '12 min',
        difficulty: 'iniciante',
        description: 'Economia de plataformas e big tech'
    },
    'cap-14': {
        concepts: ['vigilancia', 'panoptico', 'privacidade'],
        readingTime: '12 min',
        difficulty: 'iniciante',
        description: 'Capitalismo de vigilância e controle'
    },
    'cap-15': {
        concepts: ['algoritmos', 'viés-algoritmico', 'caixa-preta'],
        readingTime: '10 min',
        difficulty: 'intermediário',
        description: 'Poder e opacidade dos algoritmos'
    },
    'cap-16': {
        concepts: ['uberizacao', 'gig-economy', 'trabalho-plataforma'],
        readingTime: '12 min',
        difficulty: 'iniciante',
        description: 'Precarização através de aplicativos'
    },
    'cap-17': {
        concepts: ['inteligencia-artificial', 'automacao-cognitiva', 'desemprego-tecnologico'],
        readingTime: '15 min',
        difficulty: 'intermediário',
        description: 'IA e o futuro do trabalho'
    },
    'cap-18': {
        concepts: ['criptomoedas', 'blockchain', 'financeirizacao'],
        readingTime: '10 min',
        difficulty: 'intermediário',
        description: 'Crítica às criptomoedas e blockchain'
    },
    'cap-19': {
        concepts: ['nfts', 'escassez-artificial', 'especulacao'],
        readingTime: '8 min',
        difficulty: 'iniciante',
        description: 'NFTs e mercantilização digital'
    },
    'cap-20': {
        concepts: ['geopolitica-digital', 'soberania-dados', 'guerra-hibrida'],
        readingTime: '15 min',
        difficulty: 'avançado',
        description: 'Geopolítica da tecnologia digital'
    },
    'cap-21': {
        concepts: ['dependencia-tecnologica', 'colonialismo-digital', 'brasil'],
        readingTime: '12 min',
        difficulty: 'intermediário',
        description: 'Brasil na divisão internacional digital'
    },
    'cap-22': {
        concepts: ['necropolitica', 'biopolitica', 'morte-algoritmica'],
        readingTime: '15 min',
        difficulty: 'avançado',
        description: 'Política da morte algorítmica'
    },
    'cap-23': {
        concepts: ['resistencia-digital', 'hacktivismo', 'contra-hegemonia'],
        readingTime: '10 min',
        difficulty: 'intermediário',
        description: 'Formas de resistência digital'
    },
    'cap-24': {
        concepts: ['cybersyn', 'planejamento-democratico', 'socialismo-cibernetico'],
        readingTime: '15 min',
        difficulty: 'intermediário',
        description: 'Experimento chileno de socialismo cibernético'
    },
    'cap-25': {
        concepts: ['commons-digitais', 'bens-comuns', 'procomum'],
        readingTime: '10 min',
        difficulty: 'intermediário',
        description: 'Alternativas aos bens privados e estatais'
    },
    'cap-26': {
        concepts: ['cooperativismo', 'autogestao', 'economia-solidaria'],
        readingTime: '12 min',
        difficulty: 'iniciante',
        description: 'Cooperativas como alternativa'
    },
    'cap-27': {
        concepts: ['software-livre', 'codigo-aberto', 'copyleft'],
        readingTime: '10 min',
        difficulty: 'iniciante',
        description: 'Software livre e cultura hacker'
    },
    'cap-28': {
        concepts: ['democracia-digital', 'participacao', 'transparencia'],
        readingTime: '12 min',
        difficulty: 'intermediário',
        description: 'Democracia na era digital'
    },
    'cap-29': {
        concepts: ['comunicacao', 'ontologia-relacional', 'linguagem'],
        readingTime: '15 min',
        difficulty: 'avançado',
        description: 'Comunicação e ser na era informacional'
    },
    'cap-30': {
        concepts: ['salto-dialetico', 'síntese', 'superacao'],
        readingTime: '10 min',
        difficulty: 'avançado',
        description: 'Movimento dialético de superação'
    },
    'cap-31': {
        concepts: ['ultra-racionalismo', 'critica-razao', 'saberes-indigenas'],
        readingTime: '12 min',
        difficulty: 'avançado',
        description: 'Crítica ao racionalismo ocidental'
    },
    'cap-32': {
        concepts: ['projeto-politico', 'praxis', 'acao-coletiva'],
        readingTime: '10 min',
        difficulty: 'intermediário',
        description: 'Construção de projeto político'
    },
    'manifesto': {
        concepts: ['eu-coletivo', 'manifesto-politico', 'agencia-loops'],
        readingTime: '20 min',
        difficulty: 'iniciante',
        description: 'Da morte do eu individual ao nascimento do eu coletivo'
    },
    'nhandereko': {
        concepts: ['nhandereko', 'epistemologia-guarani', 'ontologia-executavel'],
        readingTime: '15 min',
        difficulty: 'intermediário',
        description: 'Sistema baseado em epistemologia guarani'
    }
};

/**
 * Obter metadados de um capítulo
 */
function getChapterMetadata(chapterId) {
    return chapterConceptsMap[chapterId] || null;
}

/**
 * Abrir rizoma com conceitos de um capítulo
 */
function openRizomaForChapter(chapterId) {
    const metadata = getChapterMetadata(chapterId);

    if (!metadata || !metadata.concepts || metadata.concepts.length === 0) {
        console.warn('⚠️ Nenhum conceito mapeado para:', chapterId);
        // Fallback: abrir rizoma geral
        if (typeof window.openRizoma === 'function') {
            window.openRizoma();
        }
        return;
    }

    // Abrir rizoma com primeiro conceito (mais relevante)
    const primaryConcept = metadata.concepts[0];
    console.log('🌀 Abrindo rizoma para capítulo:', chapterId, '→ conceito:', primaryConcept);

    if (typeof window.openRizoma === 'function') {
        window.openRizoma(primaryConcept);
    } else {
        console.error('❌ Função openRizoma não disponível');
    }
}

/**
 * Adicionar tooltip com conceitos ao passar mouse em ponto da Möbius
 */
function enhanceMobiusTooltip(originalDrawFunction) {
    return function () {
        // Chamar função original
        originalDrawFunction.call(this);

        // Adicionar informações extras se hover
        if (this.hoveredPoint) {
            const metadata = getChapterMetadata(this.hoveredPoint.id);
            if (metadata) {
                const ctx = this.ctx;
                const x = this.mouseX;
                const y = this.mouseY - 120; // Acima do tooltip padrão

                // Background do tooltip extra
                ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
                ctx.fillRect(x - 100, y, 200, 80);

                // Borda
                ctx.strokeStyle = this.layerColors[this.hoveredPoint.layer].primary;
                ctx.lineWidth = 2;
                ctx.strokeRect(x - 100, y, 200, 80);

                // Texto
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Inter, sans-serif';
                ctx.textAlign = 'center';

                ctx.fillText(`⏱️ ${metadata.readingTime}`, x, y + 20);
                ctx.fillText(`📊 ${metadata.difficulty}`, x, y + 40);
                ctx.fillText('🌀 Clique duplo: Rizoma', x, y + 60);
            }
        }
    };
}

/**
 * Interceptar clique duplo na Möbius para abrir rizoma
 */
function setupMobiusDoubleClick(mobiusInstance) {
    let lastClickTime = 0;
    const doubleClickThreshold = 300; // ms

    const canvas = mobiusInstance.canvas;

    canvas.addEventListener('click', (e) => {
        const currentTime = Date.now();
        const timeSinceLastClick = currentTime - lastClickTime;

        if (timeSinceLastClick < doubleClickThreshold && mobiusInstance.hoveredPoint) {
            // Clique duplo detectado
            e.preventDefault();
            e.stopPropagation();
            openRizomaForChapter(mobiusInstance.hoveredPoint.id);
        }

        lastClickTime = currentTime;
    });
}

/**
 * Inicializar integração
 */
function initMobiusRizomaBridge() {
    console.log('🌉 Inicializando ponte Möbius ↔ Rizoma...');

    // Aguardar ambos os sistemas estarem prontos
    const checkAndInit = () => {
        if (typeof window.indexMobius !== 'undefined' && typeof window.openRizoma === 'function') {
            console.log('✅ Sistemas detectados, ativando integração...');

            // Setup double-click handler
            setupMobiusDoubleClick(window.indexMobius);

            // Enhance tooltip (opcional - pode causar problemas)
            // if (window.indexMobius.drawHoverTooltip) {
            //     window.indexMobius.drawHoverTooltip = enhanceMobiusTooltip(
            //         window.indexMobius.drawHoverTooltip
            //     );
            // }

            console.log('✅ Ponte Möbius ↔ Rizoma ativada!');
            console.log('💡 Clique duplo em pontos da Möbius para abrir conceitos no Rizoma');
        } else {
            // Retry em 500ms
            setTimeout(checkAndInit, 500);
        }
    };

    checkAndInit();
}

// Expor funções globalmente
window.getChapterMetadata = getChapterMetadata;
window.openRizomaForChapter = openRizomaForChapter;

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobiusRizomaBridge);
} else {
    initMobiusRizomaBridge();
}

console.log('🌉 Módulo de integração Möbius ↔ Rizoma carregado');
