/**
 * RIZOMA - Visualização Tridimensional de Conceitos Relacionais
 * 
 * Usa Three.js para criar um grafo 3D interativo onde os conceitos
 * flutuam em uma esfera, evitando colisões através da terceira dimensão.
 */

// ============================================================================
// TEMA (SINCRONIZADO COM INDEX.HTML)
// ============================================================================

// Aplicar tema salvo do localStorage (mesma chave que index.html)
const savedTheme = localStorage.getItem('crio-theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
}

// ============================================================================
// DADOS DO RIZOMA
// ============================================================================

// Conceitos serão carregados do arquivo JSON
let concepts = [];

// ============================================================================
// VARIÁVEIS GLOBAIS
// ============================================================================

let scene, camera, renderer, raycaster, mouse;
let nodes = [];
let lines = [];
let selectedNode = null;
let hoveredNode = null;
let isAnimating = true;
let showAllConnections = false;
let autoRotate = true;
let viewMode = '3d'; // '3d' or 'cards'
let animationSpeed = 1.0; // Velocidade da animação
let rotationSpeed = 0.001; // Velocidade de rotação
let selectedCards = new Set(); // Conjunto de cards/nós selecionados (seleção múltipla)
// Gerar direção aleatória normalizada
const randomAngle = Math.random() * Math.PI * 2;
let rotationDirection = { x: Math.cos(randomAngle), z: Math.sin(randomAngle) }; // Direção aleatória de rotação
let rotationAngle = 0; // Ângulo atual de rotação
let cameraLookAtTarget = null; // Ponto onde a câmera está olhando (null = centro)
let pulseIntensity = 1.0; // Intensidade do pulso
let userInteracting = false; // Flag para saber se usuário está interagindo
let autoRotateTimeout = null; // Timer para retomar rotação automática
let labelsVisible = true; // Controle de visibilidade de labels para otimização
let lastAnimationTime = 0; // Para throttling de animações
let frameCount = 0; // Contador de frames para otimização
let performanceMode = false; // Modo de performance reduzida
let fpsHistory = []; // Histórico de FPS para auto-ajuste
let lastFPSCheck = 0;

// Detectar tema claro/escuro
const isLightTheme = () => document.body.classList.contains('light-theme');
const getGlowColor = () => isLightTheme() ? 0x1a1a1a : 0xffffff;

// Detectar dispositivo fraco automaticamente
if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
    performanceMode = true;
    console.log('Performance mode enabled (low-end device detected)');
}

const infoPanel = document.getElementById('info-panel');
const loading = document.getElementById('loading');
const container = document.getElementById('container');
const cardsContainer = document.getElementById('cards-container');
const cardsGrid = document.getElementById('cards-grid');
const searchContainer = document.getElementById('search-container');
const searchInput = document.getElementById('search-input');
const instructions = document.getElementById('instructions');
const statusIndicator = document.getElementById('status-indicator');
const speedValue = document.getElementById('speed-value');
const rotationValue = document.getElementById('rotation-value');
const pulseValue = document.getElementById('pulse-value');

// ============================================================================
// CARREGAMENTO DE DADOS
// ============================================================================

async function loadConcepts() {
    try {
        const response = await fetch('concepts.json');
        const data = await response.json();
        
        // Converter strings hexadecimais para números
        concepts = data.map(concept => ({
            ...concept,
            color: parseInt(concept.color, 16)
        }));
        
        console.log(`${concepts.length} conceitos carregados de concepts.json`);
    } catch (error) {
        console.error('Erro ao carregar concepts.json:', error);
        loading.innerHTML = '<p style="color: #ff0066;">Erro ao carregar conceitos. Verifique o arquivo concepts.json</p>';
    }
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

async function init() {
    // Carregar conceitos primeiro
    await loadConcepts();
    
    if (concepts.length === 0) {
        console.error('Nenhum conceito carregado. Abortando inicialização.');
        return;
    }
    // Scene com cores baseadas no tema
    const isLight = document.body.classList.contains('light-theme');
    const bgColor = isLight ? 0xf0f0f0 : 0x0a0a0a;
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.Fog(bgColor, 500, 1500);

    // Camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        2000
    );
    camera.position.z = 600;

    // Renderer com otimizações
    renderer = new THREE.WebGLRenderer({ 
        antialias: window.innerWidth > 768, // Antialiasing apenas em desktop
        alpha: false,
        powerPreference: "high-performance",
        stencil: false, // Desabilita stencil buffer (não usado)
        depth: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Limita pixel ratio para melhor performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.2; // Exposição alta para cores vibrantes
    document.getElementById('container').appendChild(renderer.domElement);

    // Raycaster para detecção de cliques
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Criar nós em distribuição esférica
    createNodes();
    
    // Criar conexões
    createConnections();
    
    // Atualizar cores das linhas baseado no tema atual
    updateLineColors();

    // Adicionar luzes (ajustadas conforme tema)
    const ambientLight = new THREE.AmbientLight(isLight ? 0x404050 : 0x0a0a10, isLight ? 0.2 : 0.05);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x8080ff, 0.3);
    pointLight1.position.set(300, 300, 300);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff8080, 0.3);
    pointLight2.position.set(-300, -300, 300);
    scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0x80ff80, 0.3);
    pointLight3.position.set(0, 300, -300);
    scene.add(pointLight3);

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    window.addEventListener('keydown', onKeyDown);

    // Event listeners para busca
    searchInput.addEventListener('input', handleSearch);

    // Controles de câmera (arrastar)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    renderer.domElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        userInteracting = true;
        document.body.classList.add('grabbing');
        
        // Pausar auto-rotação temporariamente
        if (autoRotateTimeout) clearTimeout(autoRotateTimeout);
    });

    renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            camera.position.x += deltaX * 0.5;
            camera.position.y -= deltaY * 0.5;
            camera.lookAt(scene.position);
        }
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    renderer.domElement.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.classList.remove('grabbing');
        
        // Retomar auto-rotação após 3 segundos de inatividade
        if (autoRotate) {
            autoRotateTimeout = setTimeout(() => {
                userInteracting = false;
            }, 3000);
        }
    });
    
    // Double click: focar no nó
    renderer.domElement.addEventListener('dblclick', () => {
        if (hoveredNode) {
            focusOnNode(hoveredNode);
        }
    });

    // Zoom com scroll
    renderer.domElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSpeed = e.deltaY * 0.5;
        camera.position.z += zoomSpeed;
        camera.position.z = Math.max(200, Math.min(1000, camera.position.z));
        
        // Pausar rotação durante zoom
        if (autoRotate && Math.abs(zoomSpeed) > 1) {
            userInteracting = true;
            if (autoRotateTimeout) clearTimeout(autoRotateTimeout);
            autoRotateTimeout = setTimeout(() => {
                userInteracting = false;
            }, 2000);
        }
    }, { passive: false });
    
    // Suporte para toque em dispositivos móveis
    let touchStartDistance = 0;
    let touchStartCameraZ = 0;
    
    renderer.domElement.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            // Pinch to zoom
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            touchStartDistance = Math.sqrt(dx * dx + dy * dy);
            touchStartCameraZ = camera.position.z;
        } else if (e.touches.length === 1) {
            // Single touch = drag
            previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            isDragging = true;
            userInteracting = true;
        }
    });
    
    renderer.domElement.addEventListener('touchmove', (e) => {
        e.preventDefault();
        
        if (e.touches.length === 2) {
            // Pinch zoom
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const scale = distance / touchStartDistance;
            camera.position.z = touchStartCameraZ / scale;
            camera.position.z = Math.max(200, Math.min(1000, camera.position.z));
        } else if (e.touches.length === 1 && isDragging) {
            // Drag
            const deltaX = e.touches[0].clientX - previousMousePosition.x;
            const deltaY = e.touches[0].clientY - previousMousePosition.y;
            
            camera.position.x += deltaX * 0.5;
            camera.position.y -= deltaY * 0.5;
            camera.lookAt(scene.position);
            
            previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    }, { passive: false });
    
    renderer.domElement.addEventListener('touchend', () => {
        isDragging = false;
        
        if (autoRotate) {
            autoRotateTimeout = setTimeout(() => {
                userInteracting = false;
            }, 3000);
        }
    });

    // Criar cards
    renderCards();
    
    // Event listeners dos controles
    const btnCards = document.getElementById('btn-cards');
    const btnSpeed = document.getElementById('btn-speed');
    const btnHelp = document.getElementById('btn-help');
    
    if (btnCards) btnCards.addEventListener('click', toggleViewMode);
    if (btnSpeed) btnSpeed.addEventListener('click', toggleSpeedMenu);
    if (btnHelp) btnHelp.addEventListener('click', toggleHelp);
    
    // Event listener da busca
    searchInput.addEventListener('input', handleSearch);
    
    // Event listeners da legenda
    setupLegendListeners();

    loading.style.display = 'none';
    animate();
    
    // Processar hash da URL para seleção automática
    checkUrlHashAndFocus();
}

/**
 * Check URL hash and focus on concept if present
 */
function checkUrlHashAndFocus() {
    const hash = window.location.hash.substring(1); // Remove '#'
    if (hash) {
        // Aguardar um pouco para garantir que os nós foram criados
        setTimeout(() => {
            const targetNode = nodes.find(node => node.userData.id === hash);
            if (targetNode) {
                focusOnNode(targetNode);
                showNotification(`Focando em: ${targetNode.userData.name}`);
            }
        }, 500);
    }
}

// Listen for hash changes (when navigating back/forward)
window.addEventListener('hashchange', checkUrlHashAndFocus);

// ============================================================================
// CRIAÇÃO DE NÓS
// ============================================================================

function createNodes() {
    const radius = 300; // Raio da esfera de distribuição
    
    // Geometria compartilhada para todas as esferas (grande otimização!)
    const sharedGeometry = new THREE.SphereGeometry(20, 32, 32); // Reduz de 64 para 32 segmentos

    concepts.forEach((concept, i) => {
        // Distribuição Fibonacci Sphere para evitar aglomeração
        const phi = Math.acos(1 - 2 * (i + 0.5) / concepts.length);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        // Ajustar cores baseado no tema
        const isDark = !isLightTheme();
        const nodeColor = isDark ? concept.color : concept.color; // Manter cor base
        const emissiveIntensity = isDark ? 0.3 : -0.5; // Negativo para escurecer no modo claro
        const lightIntensity = isDark ? 0.1 : -0.05; // Luz negativa escurece
        
        // Usar geometria compartilhada
        const material = new THREE.MeshPhysicalMaterial({
            color: nodeColor,
            emissive: nodeColor,
            emissiveIntensity: emissiveIntensity, // Brilho invertido no modo claro
            metalness: 0.4,
            roughness: 0.01,
            transparent: true,
            opacity: 1.0, // Totalmente opaco
            transmission: 0.4, // Refração de vidro moderada
            thickness: 1.0, // Espessura do vidro aumentada
            ior: 1.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            envMapIntensity: 2.5,
            side: THREE.DoubleSide
        });

        const sphere = new THREE.Mesh(sharedGeometry, material);
        sphere.position.set(x, y, z);
        
        // Dados customizados
        sphere.userData = {
            ...concept,
            originalColor: concept.color,
            originalEmissive: 0.3
        };

        scene.add(sphere);
        nodes.push(sphere);
        
        // Adicionar luz interna para efeito de bola de vidro iluminada (ou escurecida no modo claro)
        const innerLight = new THREE.PointLight(nodeColor, lightIntensity, 80);
        innerLight.position.copy(sphere.position);
        scene.add(innerLight);
        
        // Guardar referência à luz para animações futuras
        sphere.userData.innerLight = innerLight;

        // Adicionar label (sprite de texto)
        createLabel(concept.name, sphere);
    });
}

// ============================================================================
// CRIAÇÃO DE LABELS
// ============================================================================

function createLabel(text, node) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Configurar fonte primeiro para medir texto
    context.font = 'Bold 40px Arial';
    
    // Quebrar texto em múltiplas linhas se necessário
    const words = text.split(' ');
    let line1, line2;
    
    // Tentar ajustar as linhas para melhor visualização
    if (words.length <= 2) {
        line1 = text;
        line2 = '';
    } else if (words.length === 3) {
        line1 = words.slice(0, 2).join(' ');
        line2 = words[2];
    } else {
        // 4 ou mais palavras: dividir ao meio
        const mid = Math.ceil(words.length / 2);
        line1 = words.slice(0, mid).join(' ');
        line2 = words.slice(mid).join(' ');
    }
    
    // Medir largura necessária
    const line1Width = context.measureText(line1).width;
    const line2Width = line2 ? context.measureText(line2).width : 0;
    const maxWidth = Math.max(line1Width, line2Width);
    
    // Ajustar tamanho do canvas com padding (reduzido para otimização)
    canvas.width = Math.max(256, Math.min(512, maxWidth + 60)); // Limita tamanho máximo
    canvas.height = line2 ? 120 : 70; // Reduz altura
    
    // Redesenhar com novo tamanho
    const fontSize = canvas.width < 300 ? 32 : 36; // Fonte adaptativa
    context.font = `Bold ${fontSize}px Arial`;
    context.fillStyle = 'rgba(0, 0, 0, 0.75)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Adicionar borda sutil
    context.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    context.lineWidth = 2;
    context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    if (line2) {
        context.fillText(line1, canvas.width / 2, canvas.height * 0.35);
        context.fillText(line2, canvas.width / 2, canvas.height * 0.65);
    } else {
        context.fillText(line1, canvas.width / 2, canvas.height / 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter; // Otimiza renderização
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false; // Desabilita mipmaps para performance
    
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        depthTest: true,
        depthWrite: false // Otimização para transparência
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    
    // Ajustar escala proporcionalmente ao tamanho do canvas (reduzido)
    const scale = canvas.width / 512 * 80; // Reduz de 100 para 80
    sprite.scale.set(scale, scale * (canvas.height / canvas.width), 1);
    sprite.position.copy(node.position);
    sprite.position.y += 30; // Reduz de 35 para 30

    scene.add(sprite);
    node.userData.label = sprite;
}

// ============================================================================
// CRIAÇÃO DE CONEXÕES
// ============================================================================

function createConnections() {
    // Usar geometria compartilhada para linhas (otimização de memória)
    const lineGeometryCache = new Map();
    
    concepts.forEach((concept) => {
        const sourceNode = nodes.find(n => n.userData.id === concept.id);
        
        concept.connections.forEach((connId) => {
            const targetNode = nodes.find(n => n.userData.id === connId);
            
            if (sourceNode && targetNode && concept.id < connId) {
                // Criar linha como feixe de luz (ou escuridão no modo claro)
                const isDark = !isLightTheme();
                const lineOpacity = isDark ? (showAllConnections ? 0.8 : 0.5) : (showAllConnections ? 0.9 : 0.7);
                
                const material = new THREE.LineBasicMaterial({
                    color: concept.color,
                    transparent: true,
                    opacity: lineOpacity,
                    linewidth: 1,
                    blending: isLightTheme() ? THREE.NormalBlending : THREE.AdditiveBlending
                });

                const geometry = new THREE.BufferGeometry().setFromPoints([
                    sourceNode.position,
                    targetNode.position
                ]);

                const line = new THREE.Line(geometry, material);
                line.userData = {
                    source: sourceNode,
                    target: targetNode
                };

                scene.add(line);
                lines.push(line);
                
                // Adicionar um segundo feixe mais fino (brilhante no escuro, escuro no claro)
                const glowOpacity = isDark ? (showAllConnections ? 0.6 : 0.4) : (showAllConnections ? 0.8 : 0.6);
                
                const glowMaterial = new THREE.LineBasicMaterial({
                    color: getGlowColor(),
                    transparent: true,
                    opacity: glowOpacity,
                    linewidth: 1,
                    blending: isLightTheme() ? THREE.NormalBlending : THREE.AdditiveBlending
                });
                
                const glowLine = new THREE.Line(geometry.clone(), glowMaterial);
                glowLine.userData = {
                    source: sourceNode,
                    target: targetNode,
                    isGlow: true
                };
                
                scene.add(glowLine);
                lines.push(glowLine);
            }
        });
    });
}

// Função para atualizar cores das linhas quando tema muda
function updateLineColors() {
    const glowColor = getGlowColor();
    const useNormalBlending = isLightTheme();
    
    lines.forEach(line => {
        if (line.userData.isGlow) {
            line.material.color.setHex(glowColor);
            line.material.blending = useNormalBlending ? THREE.NormalBlending : THREE.AdditiveBlending;
        } else {
            line.material.blending = useNormalBlending ? THREE.NormalBlending : THREE.AdditiveBlending;
        }
        line.material.needsUpdate = true;
    });
}

// ============================================================================
// ANIMAÇÃO
// ============================================================================

function animate() {
    requestAnimationFrame(animate);

    if (isAnimating) {
        const currentTime = Date.now();
        const deltaTime = currentTime - lastAnimationTime;
        const time = currentTime * 0.001 * animationSpeed; // Pre-calcula tempo
        
        // Calcular FPS e auto-ajustar performance
        if (currentTime - lastFPSCheck > 1000) { // A cada segundo
            const fps = deltaTime > 0 ? 1000 / deltaTime : 60;
            fpsHistory.push(fps);
            if (fpsHistory.length > 10) fpsHistory.shift();
            
            const avgFPS = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
            
            // Auto-enable performance mode se FPS < 30
            if (avgFPS < 30 && !performanceMode) {
                performanceMode = true;
                console.log('Auto-enabled performance mode (low FPS detected:', avgFPS.toFixed(1), ')');
            }
            
            lastFPSCheck = currentTime;
        }
        
        frameCount++;
        
        // Modo performance: reduzir FPS de animações secundárias
        const skipFrame = performanceMode ? frameCount % 3 === 0 : frameCount % 2 === 0;
        
        // Rotação suave automática com direção aleatória
        // Só rotacionar se não houver nó selecionado
        if (autoRotate && !userInteracting && !selectedNode) {
            rotationAngle += rotationSpeed;
            camera.position.x = (Math.cos(rotationAngle) * rotationDirection.x - Math.sin(rotationAngle) * rotationDirection.z) * 600;
            camera.position.z = (Math.sin(rotationAngle) * rotationDirection.x + Math.cos(rotationAngle) * rotationDirection.z) * 600;
            camera.lookAt(scene.position);
        } else if (selectedNode && cameraLookAtTarget) {
            // Se há nó selecionado, manter câmera olhando para ele
            camera.lookAt(cameraLookAtTarget);
        }

        // Pré-calcular valores de pulso que são reutilizados
        const basePulse = Math.sin(time) * 0.1 * pulseIntensity;
        
        // Animação de pulso nos nós
        nodes.forEach((node, i) => {
            const pulse = basePulse + 0.9;
            node.scale.setScalar(pulse);
            
            // Só atualizar emissive se não for nó especial
            if (node !== selectedNode && node !== hoveredNode) {
                node.material.emissiveIntensity = 0.3 + pulse * 0.15 * pulseIntensity;
            }
            
            // Animar luz interna - apenas a cada N frames
            if (skipFrame && node.userData.innerLight) {
                node.userData.innerLight.intensity = 0.1 + pulse * 0.1 * pulseIntensity;
            }
        });
        
        // Animação de pulso nas linhas - SIMPLIFICADA (todas pulsam junto)
        // Não aplicar pulso se há seleção múltipla ativa
        if (skipFrame && pulseIntensity > 0 && selectedCards.size === 0) { // Só animar se pulso não está em 0 e sem seleção ativa
            const lightPulse = Math.sin(time * 2) * 0.15 * pulseIntensity + 0.85;
            
            // Usar o mesmo pulso para todas (muito mais rápido)
            const coloredOpacity = (showAllConnections ? 0.8 : 0.5) * lightPulse;
            const glowOpacity = (showAllConnections ? 0.6 : 0.4) * lightPulse * 1.5;
            
            lines.forEach(line => {
                // Em modo performance, skip metade das linhas aleatoriamente
                if (performanceMode && Math.random() > 0.5) return;
                
                line.material.opacity = line.userData.isGlow ? glowOpacity : coloredOpacity;
            });
        }
        
        // LOD (Level of Detail) - checar apenas a cada 30 frames (~500ms)
        if (frameCount % 30 === 0) {
            const cameraDistance = camera.position.length();
            const shouldShowLabels = cameraDistance < 800;
            if (shouldShowLabels !== labelsVisible) {
                labelsVisible = shouldShowLabels;
                nodes.forEach(node => {
                    if (node.userData.label) {
                        node.userData.label.visible = labelsVisible;
                    }
                });
            }
        }

        // Atualizar linhas (só quando necessário)
        if (hoveredNode !== null || selectedNode !== null || showAllConnections) {
            updateLines();
        }
        
        lastAnimationTime = currentTime;
    }

    // Só renderizar se estiver no modo 3D
    if (viewMode === '3d') {
        renderer.render(scene, camera);
    }
}

function updateLines() {
    // Se há seleção múltipla ativa, não atualizar aqui (já controlado em focusOnNode)
    if (selectedCards.size > 0) {
        return;
    }
    
    // Cache de nós ativos para evitar comparações repetidas
    const activeNodes = new Set();
    if (hoveredNode) activeNodes.add(hoveredNode);
    if (selectedNode) activeNodes.add(selectedNode);
    
    // Se não há nós ativos e showAllConnections está off, não fazer nada
    if (activeNodes.size === 0 && !showAllConnections) {
        return;
    }
    
    lines.forEach(line => {
        const isActive = showAllConnections ||
                        activeNodes.has(line.userData.source) ||
                        activeNodes.has(line.userData.target);

        if (isActive) {
            // Linhas ativas brilham muito mais
            if (!line.userData.isGlow) {
                line.material.opacity = 0.9;
            } else {
                line.material.opacity = 0.7;
            }
        }
        // As linhas inativas já têm sua opacidade controlada pela animação de pulso
    });
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    // Ignorar eventos se não estiver no modo 3D
    if (viewMode !== '3d') return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes);

    // Reset hover anterior
    if (hoveredNode && hoveredNode !== selectedNode) {
        hoveredNode.material.emissiveIntensity = 0.3;
        hoveredNode.scale.setScalar(1);
        if (hoveredNode.userData.innerLight) {
            hoveredNode.userData.innerLight.intensity = 0.1;
        }
    }

    if (intersects.length > 0) {
        hoveredNode = intersects[0].object;
        hoveredNode.material.emissiveIntensity = 1.5; // Brilho moderado no hover
        hoveredNode.scale.setScalar(1.2);
        if (hoveredNode.userData.innerLight) {
            hoveredNode.userData.innerLight.intensity = 1.0;
        }
        renderer.domElement.style.cursor = 'pointer';
        
        // Não atualizar info panel no hover - apenas quando selecionado
        // updateInfoPanel(hoveredNode.userData);
    } else {
        hoveredNode = null;
        renderer.domElement.style.cursor = 'grab';
        // Info panel permanece visível se houver nó selecionado
        if (!selectedNode) {
            infoPanel.classList.remove('visible');
        }
    }
}

function onClick(event) {
    // Ignorar eventos se não estiver no modo 3D
    if (viewMode !== '3d') return;
    
    // Ignorar cliques na bottom bar
    const controls = document.getElementById('controls');
    if (controls && controls.contains(event.target)) return;
    
    if (hoveredNode) {
        // Sempre chamar focusOnNode - ele gerencia a seleção múltipla internamente
        focusOnNode(hoveredNode);
    } else {
        // Clicou no vazio - desmarcar tudo
        if (selectedCards.size > 0 || selectedNode) {
            // Resetar todos os nós selecionados
            nodes.forEach(n => {
                n.material.emissiveIntensity = 0.3;
                if (n.userData.innerLight) {
                    n.userData.innerLight.intensity = 0.1;
                }
                n.scale.setScalar(1);
                resetConnectedNodes(n);
            });
            
            selectedNode = null;
            resetConnectionFilter();
            infoPanel.classList.remove('visible');
            
            // Recalcular rotationAngle
            const currentRadius = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z);
            if (currentRadius > 0) {
                const currentX = camera.position.x / currentRadius;
                const currentZ = camera.position.z / currentRadius;
                rotationAngle = Math.atan2(
                    currentZ * rotationDirection.x - currentX * rotationDirection.z,
                    currentX * rotationDirection.x + currentZ * rotationDirection.z
                );
            }
            
            // Retomar rotação automática
            cameraLookAtTarget = null;
            userInteracting = false;
            autoRotate = true;
            
            showNotification('Seleção removida');
        }
    }
}

function onKeyDown(event) {
    // Ignorar comandos se estiver digitando na busca
    if (document.activeElement === searchInput) {
        return;
    }
    
    // Ignorar se Ctrl, Cmd/Meta ou Alt estiverem pressionados (atalhos do sistema)
    if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
    }
    
    // Espaço: pausar/retomar
    if (event.code === 'Space') {
        event.preventDefault();
        toggleAnimation();
    }
    
    // ESC: Resetar seleção
    if (event.code === 'Escape') {
        event.preventDefault();
        if (selectedCards.size > 0 || selectedNode) {
            // Resetar todos os nós selecionados
            nodes.forEach(n => {
                n.material.emissiveIntensity = 0.3;
                if (n.userData.innerLight) {
                    n.userData.innerLight.intensity = 0.1;
                }
                n.scale.setScalar(1);
                resetConnectedNodes(n);
            });
            
            selectedNode = null;
            resetConnectionFilter();
            infoPanel.classList.remove('visible');
            
            // Recalcular rotationAngle
            const currentRadius = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z);
            if (currentRadius > 0) {
                const currentX = camera.position.x / currentRadius;
                const currentZ = camera.position.z / currentRadius;
                rotationAngle = Math.atan2(
                    currentZ * rotationDirection.x - currentX * rotationDirection.z,
                    currentX * rotationDirection.x + currentZ * rotationDirection.z
                );
            }
            
            // Retomar rotação automática
            cameraLookAtTarget = null;
            userInteracting = false;
            autoRotate = true;
            
            showNotification('Seleção resetada');
        }
    }
    
    // R: Resetar visão
    if (event.code === 'KeyR') {
        event.preventDefault();
        resetView();
    }
    
    // V: Alternar modo de visualização
    if (event.code === 'KeyV') {
        event.preventDefault();
        toggleViewMode();
    }
    
    // H: Mostrar/esconder ajuda
    if (event.code === 'KeyH') {
        event.preventDefault();
        toggleHelp();
    }
    
    // Teclas numéricas 1-9 e 0: Focar em conceitos específicos
    const numKeys = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'];
    const numpadKeys = ['Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad7', 'Numpad8', 'Numpad9', 'Numpad0'];
    
    if (numKeys.includes(event.code) || numpadKeys.includes(event.code)) {
        event.preventDefault();
        
        // Extrair o número (1-9, 0 = 10)
        const keyNum = event.code.replace('Digit', '').replace('Numpad', '');
        const index = keyNum === '0' ? 9 : parseInt(keyNum) - 1;
        
        if (index < nodes.length) {
            focusOnNode(nodes[index]);
        } else {
            showNotification(`Conceito ${index + 1} não existe`);
        }
    }
    
    // Tab: Focar no próximo nó conectado
    if (event.code === 'Tab' && !event.shiftKey) {
        event.preventDefault();
        
        if (selectedNode) {
            // Navegar entre nós conectados ao nó atual
            const connections = selectedNode.userData.connections || [];
            if (connections.length > 0) {
                // Encontrar próximo nó conectado
                const connectedNodes = connections.map(id => nodes.find(n => n.userData.id === id)).filter(n => n);
                if (connectedNodes.length > 0) {
                    // Ciclar entre os nós conectados
                    const lastFocusedId = selectedNode.userData.lastFocusedConnection || null;
                    let nextNode;
                    
                    if (lastFocusedId) {
                        const lastIndex = connectedNodes.findIndex(n => n.userData.id === lastFocusedId);
                        const nextIndex = (lastIndex + 1) % connectedNodes.length;
                        nextNode = connectedNodes[nextIndex];
                    } else {
                        nextNode = connectedNodes[0];
                    }
                    
                    selectedNode.userData.lastFocusedConnection = nextNode.userData.id;
                    focusOnNode(nextNode);
                }
            }
        } else {
            // Se nenhum nó está selecionado, focar no primeiro
            focusOnNode(nodes[0]);
        }
    }
    
    // Shift+Tab: Focar no nó conectado anterior
    if (event.code === 'Tab' && event.shiftKey) {
        event.preventDefault();
        
        if (selectedNode) {
            // Navegar entre nós conectados ao nó atual (direção reversa)
            const connections = selectedNode.userData.connections || [];
            if (connections.length > 0) {
                const connectedNodes = connections.map(id => nodes.find(n => n.userData.id === id)).filter(n => n);
                if (connectedNodes.length > 0) {
                    const lastFocusedId = selectedNode.userData.lastFocusedConnection || null;
                    let prevNode;
                    
                    if (lastFocusedId) {
                        const lastIndex = connectedNodes.findIndex(n => n.userData.id === lastFocusedId);
                        const prevIndex = lastIndex <= 0 ? connectedNodes.length - 1 : lastIndex - 1;
                        prevNode = connectedNodes[prevIndex];
                    } else {
                        prevNode = connectedNodes[connectedNodes.length - 1];
                    }
                    
                    selectedNode.userData.lastFocusedConnection = prevNode.userData.id;
                    focusOnNode(prevNode);
                }
            }
        } else {
            // Se nenhum nó está selecionado, focar no último
            focusOnNode(nodes[nodes.length - 1]);
        }
    }
}

function updateInfoPanel(data) {
    if (!data) {
        infoPanel.classList.remove('visible');
        infoPanel.style.removeProperty('--info-color');
        return;
    }

    document.getElementById('concept-title').textContent = data.name;
    document.getElementById('concept-description').textContent = data.description;
    
    // Definir cor do card baseado na cor do conceito
    const colorHex = '#' + data.color.toString(16).padStart(6, '0');
    infoPanel.style.setProperty('--info-color', colorHex);
    
    const connectionsList = document.getElementById('concept-connections');
    const connectedNames = data.connections
        .map(id => concepts.find(c => c.id === id)?.name)
        .filter(Boolean);
    
    connectionsList.innerHTML = connectedNames.length > 0
        ? `<strong>Conectado a:</strong> ${connectedNames.join(' • ')}`
        : '';
    
    infoPanel.classList.add('visible');
}

// ============================================================================
// CONTROLES
// ============================================================================

function toggleAnimation() {
    isAnimating = !isAnimating;
    
    // Atualizar todos os botões de pause/play
    const allButtons = document.querySelectorAll('.control-btn');
    
    allButtons.forEach(b => {
        const icon = b.querySelector('.btn-icon');
        const text = b.querySelector('.btn-text');
        
        // Verificar se é o botão de animação pelo ícone
        if (icon && (icon.textContent === '⏸' || icon.textContent === '▶')) {
            icon.textContent = isAnimating ? '⏸' : '▶';
            text.textContent = isAnimating ? 'Pausar' : 'Animar';
            
            if (isAnimating) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        }
    });
    
    showNotification(isAnimating ? 'Animação retomada' : 'Animação pausada');
}

function resetView() {
    camera.position.set(0, 0, 600);
    camera.lookAt(scene.position);
    cameraLookAtTarget = null;
    autoRotate = true;
    userInteracting = false;
    isAnimating = true;
    animationSpeed = 1.0;
    rotationSpeed = 0.001;
    pulseIntensity = 1.0;
    
    if (selectedNode) {
        selectedNode.material.emissiveIntensity = 0.3;
        if (selectedNode.userData.innerLight) {
            selectedNode.userData.innerLight.intensity = 0.1;
        }
        selectedNode.scale.setScalar(1);
        // Resetar nós conectados
        resetConnectedNodes(selectedNode);
        selectedNode = null;
    }
    
    infoPanel.classList.remove('visible');
    updateStatusIndicator();
    showNotification('Visão resetada');
}

function updateStatusIndicator() {
    if (!speedValue || !rotationValue || !pulseValue) return;
    
    speedValue.textContent = animationSpeed.toFixed(1) + 'x';
    rotationValue.textContent = (rotationSpeed * 10000).toFixed(1);
    pulseValue.textContent = (pulseIntensity * 100).toFixed(0) + '%';
    
    // Mostrar indicador temporariamente
    statusIndicator.style.opacity = '1';
    
    setTimeout(() => {
        statusIndicator.style.opacity = '0';
    }, 3000);
}

// Propagar luz para nós conectados em múltiplos níveis
function propagateLightToConnected(sourceNode) {
    const processedIds = new Set([sourceNode.userData.id]);
    const level1Ids = new Set();
    const level2Ids = new Set();
    
    // Nível 1: Conexões diretas (mais brilhantes)
    const connectedIds = sourceNode.userData.connections || [];
    connectedIds.forEach(connId => {
        const connectedNode = nodes.find(n => n.userData.id === connId);
        if (connectedNode && connectedNode !== selectedNode) {
            level1Ids.add(connId);
            processedIds.add(connId);
            
            // Iluminar nós conectados diretamente com alta intensidade
            connectedNode.material.emissiveIntensity = 2.5;
            if (connectedNode.userData.innerLight) {
                connectedNode.userData.innerLight.intensity = 2.0;
            }
            connectedNode.scale.setScalar(1.15);
        }
    });
    
    // Nível 2: Conexões secundárias (médio brilho)
    level1Ids.forEach(level1Id => {
        const level1Node = nodes.find(n => n.userData.id === level1Id);
        if (!level1Node) return;
        
        const secondaryIds = level1Node.userData.connections || [];
        secondaryIds.forEach(secondId => {
            if (processedIds.has(secondId)) return; // Já processado
            
            const secondaryNode = nodes.find(n => n.userData.id === secondId);
            if (secondaryNode && secondaryNode !== selectedNode) {
                level2Ids.add(secondId);
                processedIds.add(secondId);
                
                secondaryNode.material.emissiveIntensity = 1.2;
                if (secondaryNode.userData.innerLight) {
                    secondaryNode.userData.innerLight.intensity = 0.8;
                }
                secondaryNode.scale.setScalar(1.08);
            }
        });
    });
    
    // Nível 3: Conexões terciárias (baixo brilho)
    level2Ids.forEach(level2Id => {
        const level2Node = nodes.find(n => n.userData.id === level2Id);
        if (!level2Node) return;
        
        const tertiaryIds = level2Node.userData.connections || [];
        tertiaryIds.forEach(thirdId => {
            if (processedIds.has(thirdId)) return; // Já processado
            
            const tertiaryNode = nodes.find(n => n.userData.id === thirdId);
            if (tertiaryNode && tertiaryNode !== selectedNode) {
                processedIds.add(thirdId);
                
                tertiaryNode.material.emissiveIntensity = 0.6;
                if (tertiaryNode.userData.innerLight) {
                    tertiaryNode.userData.innerLight.intensity = 0.4;
                }
                tertiaryNode.scale.setScalar(1.04);
            }
        });
    });
}

// Resetar nós conectados ao estado normal
function resetConnectedNodes(sourceNode) {
    // Resetar todos os nós para estado base
    nodes.forEach(node => {
        if (node !== selectedNode && node !== hoveredNode) {
            node.material.emissiveIntensity = 0.3;
            if (node.userData.innerLight) {
                node.userData.innerLight.intensity = 0.1;
            }
            node.scale.setScalar(1.0);
        }
    });
}

function focusOnNode(node) {
    if (!node) return;
    
    // Salvar ângulo atual antes de pausar rotação
    const currentRadius = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z);
    if (currentRadius > 0) {
        // Calcular o ângulo atual baseado na posição da câmera e direção de rotação
        const currentX = camera.position.x / currentRadius;
        const currentZ = camera.position.z / currentRadius;
        rotationAngle = Math.atan2(
            currentZ * rotationDirection.x - currentX * rotationDirection.z,
            currentX * rotationDirection.x + currentZ * rotationDirection.z
        );
    }
    
    // Pausar auto-rotação durante foco
    userInteracting = true;
    autoRotate = false;
    
    // Calcular posição ideal da câmera (frente ao nó, olhando para o centro)
    // O nó deve ficar no centro da tela
    const nodeWorldPosition = node.position.clone();
    
    // Vetor do centro (0,0,0) até o nó
    const directionFromCenter = nodeWorldPosition.clone().normalize();
    
    // Posicionar câmera no lado oposto do nó em relação ao centro
    // Isso faz o grafo "girar" para trazer o nó ao centro da visão
    const cameraDistance = 400; // Distância da câmera ao nó
    const targetCameraPosition = nodeWorldPosition.clone().add(
        directionFromCenter.multiplyScalar(cameraDistance)
    );
    
    const startPosition = camera.position.clone();
    const startLookAt = new THREE.Vector3(0, 0, 0);
    const targetLookAt = nodeWorldPosition.clone();
    
    const duration = 1500; // ms - animação mais suave
    const startTime = Date.now();
    
    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease in-out cubic para movimento mais suave
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        // Interpolar posição da câmera
        camera.position.lerpVectors(startPosition, targetCameraPosition, eased);
        
        // Interpolar ponto de observação (do centro para o nó)
        const currentLookAt = new THREE.Vector3().lerpVectors(startLookAt, targetLookAt, eased);
        camera.lookAt(currentLookAt);
        
        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        } else {
            // Animação completa - manter userInteracting = true para bloquear rotação
            // Salvar o ponto de foco da câmera
            cameraLookAtTarget = nodeWorldPosition.clone();
            
            // Verificar se o nó já está selecionado (múltipla seleção)
            const nodeId = node.userData.id;
            
            if (selectedCards.has(nodeId)) {
                // Desmarcar este nó
                selectedCards.delete(nodeId);
                node.material.emissiveIntensity = 0.3;
                if (node.userData.innerLight) {
                    node.userData.innerLight.intensity = 0.1;
                }
                node.scale.setScalar(1);
                
                // Se não há mais nós selecionados, resetar tudo
                if (selectedCards.size === 0) {
                    selectedNode = null;
                    resetConnectionFilter();
                    showNotification('Seleção removida - mostrando todos os nós');
                    return;
                }
                
                // Recalcular filtro com nós restantes
                const allConnectedIds = new Set();
                selectedCards.forEach(id => {
                    const concept = concepts.find(c => c.id === id);
                    if (concept) {
                        allConnectedIds.add(id);
                        (concept.connections || []).forEach(connId => allConnectedIds.add(connId));
                    }
                });
                
                // Aplicar filtro de opacidade
                nodes.forEach(n => {
                    if (allConnectedIds.has(n.userData.id)) {
                        n.material.opacity = 1.0;
                        if (n.userData.label) n.userData.label.material.opacity = 0.9;
                        
                        // Destacar nós ainda selecionados
                        if (selectedCards.has(n.userData.id)) {
                            n.material.emissiveIntensity = 5.0;
                            if (n.userData.innerLight) n.userData.innerLight.intensity = 4.0;
                            n.scale.setScalar(1.3);
                        }
                    } else {
                        n.material.opacity = 0.2;
                        if (n.userData.label) n.userData.label.material.opacity = 0.2;
                    }
                });
                
                // Atualizar linhas com destaque para conexões dos nós selecionados
                lines.forEach(line => {
                    const sourceId = line.userData.source.userData.id;
                    const targetId = line.userData.target.userData.id;
                    if (allConnectedIds.has(sourceId) && allConnectedIds.has(targetId)) {
                        line.visible = true;
                        
                        // Destacar linhas conectadas a nós selecionados
                        const sourceSelected = selectedCards.has(sourceId);
                        const targetSelected = selectedCards.has(targetId);
                        
                        if (sourceSelected || targetSelected) {
                            line.material.opacity = line.userData.isGlow ? 1.0 : 1.0;
                            line.material.emissiveIntensity = 2.0;
                        } else {
                            line.material.opacity = line.userData.isGlow ? 0.4 : 0.5;
                            line.material.emissiveIntensity = 0.5;
                        }
                    } else {
                        line.visible = false;
                    }
                });
                
                showNotification(`${selectedCards.size} nó(s) selecionado(s) - ${allConnectedIds.size} visíveis`);
                return;
            }
            
            // Adicionar nó à seleção múltipla
            selectedCards.add(nodeId);
            
            // Desselecionar nó anterior se não estiver na seleção múltipla
            if (selectedNode && !selectedCards.has(selectedNode.userData.id)) {
                selectedNode.material.emissiveIntensity = 0.3;
                if (selectedNode.userData.innerLight) {
                    selectedNode.userData.innerLight.intensity = 0.1;
                }
                selectedNode.scale.setScalar(1);
            }
            
            selectedNode = node;
            selectedNode.material.emissiveIntensity = 5.0;
            if (selectedNode.userData.innerLight) {
                selectedNode.userData.innerLight.intensity = 4.0;
            }
            selectedNode.scale.setScalar(1.3);
            
            // Calcular união de conexões de todos os nós selecionados
            const allConnectedIds = new Set();
            selectedCards.forEach(id => {
                const concept = concepts.find(c => c.id === id);
                if (concept) {
                    allConnectedIds.add(id);
                    (concept.connections || []).forEach(connId => allConnectedIds.add(connId));
                }
            });
            
            // Aplicar filtro de opacidade baseado na união
            nodes.forEach(n => {
                if (allConnectedIds.has(n.userData.id)) {
                    n.material.opacity = 1.0;
                    if (n.userData.label) n.userData.label.material.opacity = 0.9;
                    
                    // Destacar nós selecionados
                    if (selectedCards.has(n.userData.id)) {
                        n.material.emissiveIntensity = 5.0;
                        if (n.userData.innerLight) n.userData.innerLight.intensity = 4.0;
                        n.scale.setScalar(1.3);
                        propagateLightToConnected(n);
                    }
                } else {
                    n.material.opacity = 0.2;
                    if (n.userData.label) n.userData.label.material.opacity = 0.2;
                }
            });
            
            // Atualizar linhas com destaque especial para conexões diretas dos nós selecionados
            lines.forEach(line => {
                const sourceId = line.userData.source.userData.id;
                const targetId = line.userData.target.userData.id;
                
                // Verificar se a linha conecta nós visíveis
                if (allConnectedIds.has(sourceId) && allConnectedIds.has(targetId)) {
                    line.visible = true;
                    
                    // Destacar linhas que conectam diretamente nós selecionados
                    const sourceSelected = selectedCards.has(sourceId);
                    const targetSelected = selectedCards.has(targetId);
                    
                    if (sourceSelected || targetSelected) {
                        // Linha conectada a pelo menos um nó selecionado
                        line.material.opacity = line.userData.isGlow ? 1.0 : 1.0;
                        line.material.emissiveIntensity = 2.0; // Aumentar brilho
                    } else {
                        // Linha entre nós visíveis mas não selecionados
                        line.material.opacity = line.userData.isGlow ? 0.4 : 0.5;
                        line.material.emissiveIntensity = 0.5;
                    }
                } else {
                    line.visible = false;
                }
            });
            
            updateInfoPanel(node.userData);
            showNotification(`${selectedCards.size} nó(s) selecionado(s) - ${allConnectedIds.size} visíveis`);
        }
    }
    
    animateCamera();
}

function showNotification(message) {
    // Criar elemento de notificação se não existir
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--glass-bg);
            color: var(--connection);
            padding: 10px 20px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s, background-color 0.3s, color 0.3s, border-color 0.3s;
            pointer-events: none;
            border: 1px solid var(--connection);
            backdrop-filter: blur(25px) saturate(180%);
            -webkit-backdrop-filter: blur(25px) saturate(180%);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        `;
        document.body.appendChild(notification);
        
        // Adicionar estilos para tema claro
        const style = document.createElement('style');
        style.textContent = `
            body.light-theme #notification {
                background: var(--glass-bg) !important;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    notification.textContent = message;
    notification.style.opacity = '1';
    
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 2000);
}

/**
 * Filter nodes and cards by connections to selected node
 * In 3D mode: reduce opacity of unconnected nodes
 * In cards mode: filter to show only connected concepts
 */
function filterByConnections(node) {
    if (!node) return;
    
    const selectedId = node.userData.id;
    const connections = node.userData.connections || [];
    
    // Create set of connected IDs (including the selected node itself)
    const connectedIds = new Set([selectedId, ...connections]);
    
    // Save active filter
    activeConnectionFilter = node;
    
    if (viewMode === '3d') {
        // 3D mode: reduce opacity of unconnected nodes
        nodes.forEach(n => {
            if (connectedIds.has(n.userData.id)) {
                // Connected nodes: full opacity
                n.material.opacity = 1.0;
                if (n.userData.label) {
                    n.userData.label.material.opacity = 0.9;
                }
            } else {
                // Unconnected nodes: reduced opacity
                n.material.opacity = 0.2;
                if (n.userData.label) {
                    n.userData.label.material.opacity = 0.15;
                }
            }
        });
        
        // Filter lines: show only connections involving connected nodes
        lines.forEach(line => {
            const sourceId = line.userData.source.userData.id;
            const targetId = line.userData.target.userData.id;
            
            if (connectedIds.has(sourceId) && connectedIds.has(targetId)) {
                // Both nodes are in the connected set
                line.visible = true;
                line.material.opacity = line.userData.isGlow ? 0.6 : 0.8;
            } else {
                // At least one node is not connected
                line.visible = false;
            }
        });
        
        showNotification(`Filtrando por: ${node.userData.name} (${connectedIds.size} conceitos relacionados)`);
    } else if (viewMode === 'cards') {
        // Cards mode: filter cards to show only connected concepts
        const filteredConcepts = concepts.filter(c => connectedIds.has(c.id));
        renderCards(null, filteredConcepts);
    }
}

/**
 * Reset connection filter
 */
function resetConnectionFilter() {
    // Clear active filter and selected cards
    activeConnectionFilter = null;
    selectedCards.clear();
    
    // Reset all nodes to full opacity
    nodes.forEach(node => {
        node.material.opacity = 1.0;
        if (node.userData.label) {
            node.userData.label.material.opacity = 0.9;
        }
    });
    
    // Reset all lines to visible
    lines.forEach(line => {
        line.visible = true;
        line.material.opacity = line.userData.isGlow ? 0.6 : 0.8;
    });
    
    // Reset cards if in cards mode
    if (viewMode === 'cards') {
        renderCards(activeLayerFilter);
    }
}

function toggleLegend() {
    const legend = document.getElementById('legend');
    const toggle = document.getElementById('legend-toggle');
    const icon = toggle.querySelector('.btn-icon');
    
    if (legend.classList.contains('hidden')) {
        legend.classList.remove('hidden');
        if (icon) icon.textContent = '✕';
    } else {
        legend.classList.add('hidden');
        if (icon) icon.textContent = '⬚';
    }
}

// Filtro de camada ativo
let activeLayerFilter = null;
let activeConnectionFilter = null;

function setupLegendListeners() {
    const legendItems = document.querySelectorAll('.legend-item');
    
    legendItems.forEach(item => {
        item.addEventListener('click', () => {
            const layer = item.dataset.layer;
            
            // Toggle filter
            if (activeLayerFilter === layer) {
                // Desativar filtro
                activeLayerFilter = null;
                legendItems.forEach(i => i.style.opacity = '1');
                
                // Restaurar opacidade de todos os nós
                nodes.forEach(node => {
                    node.material.opacity = 1.0;
                    if (node.userData.label) {
                        node.userData.label.material.opacity = 0.9;
                    }
                });
                
                // Restaurar todas as linhas
                lines.forEach(line => {
                    line.visible = true;
                });
                
                // Re-renderizar cards sem filtro
                if (viewMode === 'cards') {
                    renderCards(null);
                }
                
                showNotification('Filtro removido');
            } else {
                // Ativar filtro
                activeLayerFilter = layer;
                
                // Destacar item selecionado
                legendItems.forEach(i => {
                    i.style.opacity = i.dataset.layer === layer ? '1' : '0.4';
                });
                
                // Filtrar nós
                nodes.forEach(node => {
                    if (node.userData.layer === layer) {
                        node.material.opacity = 1.0;
                        if (node.userData.label) {
                            node.userData.label.material.opacity = 0.9;
                        }
                    } else {
                        node.material.opacity = 0.15;
                        if (node.userData.label) {
                            node.userData.label.material.opacity = 0.2;
                        }
                    }
                });
                
                // Filtrar linhas (mostrar apenas conexões dentro da camada)
                lines.forEach(line => {
                    const sourceLayer = line.userData.source.userData.layer;
                    const targetLayer = line.userData.target.userData.layer;
                    
                    if (sourceLayer === layer && targetLayer === layer) {
                        line.visible = true;
                        line.material.opacity = line.userData.isGlow ? 0.6 : 0.8;
                    } else if (sourceLayer === layer || targetLayer === layer) {
                        line.visible = true;
                        line.material.opacity = line.userData.isGlow ? 0.2 : 0.3;
                    } else {
                        line.visible = false;
                    }
                });
                
                // Re-renderizar cards com filtro
                if (viewMode === 'cards') {
                    renderCards(layer);
                }
                
                // Contar conceitos na camada
                const count = nodes.filter(n => n.userData.layer === layer).length;
                const layerNames = {
                    'fundacional': 'Fundacional',
                    'ontologica': 'Ontológica',
                    'epistemologica': 'Epistemológica',
                    'politica': 'Política',
                    'indigena-comunitaria': 'Indígena-Comunitária',
                    'ecologica-material': 'Ecológica-Material',
                    'pratica-institucional': 'Prática-Institucional'
                };
                
                showNotification(`Camada: ${layerNames[layer]} (${count} conceitos)`);
            }
        });
    });
}

function toggleHelp() {
    let helpPanel = document.getElementById('help-panel');
    
    if (!helpPanel) {
        helpPanel = document.createElement('div');
        helpPanel.id = 'help-panel';
        helpPanel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--glass-bg);
            color: var(--connection);
            padding: 30px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            z-index: 10000;
            max-width: 600px;
            border: 2px solid var(--connection);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(30px) saturate(180%);
            -webkit-backdrop-filter: blur(30px) saturate(180%);
            transition: background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s;
        `;
        
        // Adicionar estilos para tema claro
        const style = document.createElement('style');
        style.textContent = `
            body.light-theme #help-panel {
                background: var(--glass-bg) !important;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
            }
            body.light-theme #help-panel h3 {
                color: var(--connection) !important;
            }
            body.light-theme #help-panel strong {
                color: inherit;
            }
        `;
        document.head.appendChild(style);
        
        // Detectar tipo de dispositivo
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                         window.innerWidth <= 768;
        
        if (isMobile) {
            // Controles para mobile/tablet
            helpPanel.innerHTML = `
                <h3 style="margin-top: 0; color: var(--connection);">📱 Controles do Rizoma (Mobile)</h3>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px 20px; line-height: 1.8; font-size: 13px; color: var(--emergence);">
                    <strong style="color: var(--hover);">NAVEGAÇÃO</strong><span></span>
                    <strong>Tocar</strong><span>Selecionar conceito (pausar rotação)</span>
                    <strong>Tocar novamente</strong><span>Desselecionar (retomar rotação)</span>
                    <strong>Arrastar (1 dedo)</strong><span>Mover câmera</span>
                    <strong>Pinça (2 dedos)</strong><span>Zoom in/out</span>
                    
                    <strong style="color: var(--connection); margin-top: 10px;">VISUALIZAÇÃO</strong><span></span>
                    <strong>Botão V</strong><span>Alternar entre modo 3D e Cards</span>
                    <strong>Botão R</strong><span>Resetar visão</span>
                    <strong>Botão H</strong><span>Mostrar/Esconder esta ajuda</span>
                </div>
                <p style="margin-bottom: 0; margin-top: 20px; text-align: center; opacity: 0.7; font-size: 12px; color: var(--emergence);">
                    💡 Toque duas vezes em um conceito selecionado para desselecioná-lo e retomar a rotação<br>
                    Toque em H novamente para fechar
                </p>
            `;
        } else {
            // Controles para desktop
            helpPanel.innerHTML = `
                <h3 style="margin-top: 0; color: var(--connection);">⌨️ Controles do Rizoma (Desktop)</h3>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px 20px; line-height: 1.8; font-size: 13px; color: var(--emergence);">
                    <strong style="color: var(--hover);">NAVEGAÇÃO</strong><span></span>
                    <strong>1-9, 0</strong><span>Focar nos conceitos 1-10 (girar grafo)</span>
                    <strong>Tab</strong><span>Próximo conceito conectado</span>
                    <strong>Shift+Tab</strong><span>Conceito conectado anterior</span>
                    <strong>Click</strong><span>Selecionar conceito (pausar rotação)</span>
                    <strong>Click novamente</strong><span>Desselecionar (retomar rotação)</span>
                    <strong>Arrastar</strong><span>Mover câmera manualmente</span>
                    <strong>Scroll</strong><span>Zoom in/out</span>
                    
                    <strong style="color: var(--pulse); margin-top: 10px;">VISUALIZAÇÃO</strong><span></span>
                    <strong>V</strong><span>Alternar entre modo 3D e Cards</span>
                    <strong>R</strong><span>Resetar visão e configurações</span>
                    <strong>H</strong><span>Mostrar/Esconder esta ajuda</span>
                </div>
                <p style="margin-bottom: 0; margin-top: 20px; text-align: center; opacity: 0.7; font-size: 12px; color: var(--emergence);">
                    💡 Clique duas vezes em um conceito selecionado para desselecioná-lo e retomar a rotação<br>
                    Pressione H novamente para fechar
                </p>
            `;
        }
        
        document.body.appendChild(helpPanel);
    } else {
        helpPanel.remove();
    }
}

function toggleSpeedMenu() {
    let speedMenu = document.getElementById('speed-menu');
    
    if (!speedMenu) {
        speedMenu = document.createElement('div');
        speedMenu.id = 'speed-menu';
        speedMenu.style.cssText = `
            position: fixed;
            bottom: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--glass-bg);
            border: 2px solid var(--connection);
            border-radius: 12px;
            padding: 20px;
            z-index: 10000;
            min-width: 320px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(30px) saturate(180%);
            -webkit-backdrop-filter: blur(30px) saturate(180%);
                transition: background-color 0.3s, border-color 0.3s, box-shadow 0.3s;
        `;
        
        // Adicionar estilos para tema claro
        const style = document.createElement('style');
        style.textContent = `
            body.light-theme #speed-menu {
                background: var(--glass-bg) !important;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
            }
            
            #speed-menu input[type="range"] {
                height: 6px;
                border-radius: 3px;
                background: rgba(255, 255, 255, 0.1);
                outline: none;
                -webkit-appearance: none;
            }
            
            body.light-theme #speed-menu input[type="range"] {
                background: rgba(10, 10, 10, 0.1);
            }
            
            #speed-menu input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: var(--connection);
                cursor: pointer;
                box-shadow: 0 0 10px var(--connection);
            }
            
            #speed-menu input[type="range"]::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: var(--connection);
                cursor: pointer;
                border: none;
                box-shadow: 0 0 10px var(--connection);
            }
            
            #speed-menu button {
                transition: all 0.2s ease;
            }
            
            #speed-menu button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 255, 136, 0.4);
            }
            
            body.light-theme #speed-menu button:hover {
                box-shadow: 0 4px 12px rgba(0, 170, 102, 0.4);
            }
        `;
        document.head.appendChild(style);
        
        speedMenu.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: var(--connection); font-size: 1.1rem;">⚡ Controles de Animação</h3>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; color: var(--emergence); font-size: 0.9rem;">
                    Velocidade: <span id="speed-display">${animationSpeed.toFixed(1)}x</span>
                </label>
                <input type="range" id="speed-slider" min="0.1" max="3.0" step="0.1" value="${animationSpeed}" 
                    style="width: 100%; accent-color: var(--connection);">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; color: var(--emergence); font-size: 0.9rem;">
                    Rotação: <span id="rotation-display">${(rotationSpeed * 10000).toFixed(1)}</span>
                </label>
                <input type="range" id="rotation-slider" min="0.1" max="5" step="0.1" value="${rotationSpeed * 10000}" 
                    style="width: 100%; accent-color: var(--connection);">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; color: var(--emergence); font-size: 0.9rem;">
                    Pulso: <span id="pulse-display">${(pulseIntensity * 100).toFixed(0)}%</span>
                </label>
                <input type="range" id="pulse-slider" min="0" max="2.0" step="0.1" value="${pulseIntensity}" 
                    style="width: 100%; accent-color: var(--connection);">
            </div>
            
            <button onclick="document.getElementById('speed-menu').remove()" 
                style="width: 100%; padding: 10px; background: var(--connection); border: none; border-radius: 8px; 
                color: var(--void); font-weight: bold; cursor: pointer; font-size: 0.9rem;">
                Fechar
            </button>
        `;
        
        document.body.appendChild(speedMenu);
        
        // Event listeners para os sliders
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            animationSpeed = parseFloat(e.target.value);
            document.getElementById('speed-display').textContent = animationSpeed.toFixed(1) + 'x';
            updateStatusIndicator();
        });
        
        document.getElementById('rotation-slider').addEventListener('input', (e) => {
            rotationSpeed = parseFloat(e.target.value) / 10000;
            document.getElementById('rotation-display').textContent = e.target.value;
            updateStatusIndicator();
        });
        
        document.getElementById('pulse-slider').addEventListener('input', (e) => {
            pulseIntensity = parseFloat(e.target.value);
            document.getElementById('pulse-display').textContent = (pulseIntensity * 100).toFixed(0) + '%';
            updateStatusIndicator();
        });
    } else {
        speedMenu.remove();
    }
}

// ============================================================================
// VISUALIZAÇÃO EM CARDS
// ============================================================================

function renderCards(layerFilter = null, filteredConcepts = null) {
    // Limpar grid
    cardsGrid.innerHTML = '';
    
    // Usar DocumentFragment para otimizar inserções no DOM
    const fragment = document.createDocumentFragment();
    
    // Cache de conceitos por ID para evitar múltiplas buscas
    const conceptsById = new Map(concepts.map(c => [c.id, c]));
    
    // Determinar conceitos a exibir
    let conceptsToShow;
    if (filteredConcepts) {
        // Usar conceitos filtrados por conexão
        conceptsToShow = filteredConcepts;
    } else if (layerFilter) {
        // Filtrar por camada
        conceptsToShow = concepts.filter(c => c.layer === layerFilter);
    } else {
        // Mostrar todos
        conceptsToShow = concepts;
    }
    
    conceptsToShow.forEach(concept => {
        const card = document.createElement('div');
        card.className = 'concept-card';
        card.style.setProperty('--card-color', '#' + concept.color.toString(16).padStart(6, '0'));
        
        // Buscar nomes de conexões usando o Map (O(1) vs O(n))
        const connectedNames = concept.connections
            .map(id => {
                const connected = conceptsById.get(id);
                return connected ? { id: connected.id, name: connected.name } : null;
            })
            .filter(Boolean);
        
        // Construir HTML de tags sem onclick inline (usar event delegation)
        const connectionTagsHTML = connectedNames
            .map(({ id, name }) => `<span class="connection-tag" data-scroll-to="${id}">${name}</span>`)
            .join('');
        
        card.innerHTML = `
            <h3>
                <span class="card-icon"></span>
                ${concept.name}
            </h3>
            <p>${concept.description}</p>
            <div class="card-connections">
                <strong>Conexões Rizomáticas:</strong>
                <div class="connection-tags">
                    ${connectionTagsHTML}
                </div>
            </div>
        `;
        
        // Adicionar dados ao dataset para busca eficiente
        card.dataset.conceptId = concept.id;
        card.dataset.conceptName = concept.name.toLowerCase();
        card.dataset.conceptDescription = concept.description.toLowerCase();
        
        // Adicionar ao fragment em vez de ao DOM diretamente
        fragment.appendChild(card);
    });
    
    // Inserir tudo de uma vez (1 reflow em vez de 33)
    cardsGrid.appendChild(fragment);
    
    // Event delegation: um listener para toda a grid
    cardsGrid.removeEventListener('click', handleCardClick); // Remove se já existir
    cardsGrid.addEventListener('click', handleCardClick);
}

// Handler otimizado com event delegation
function handleCardClick(e) {
    // Check se clicou em connection tag
    const connectionTag = e.target.closest('.connection-tag');
    if (connectionTag) {
        const targetId = connectionTag.dataset.scrollTo;
        scrollToCard(targetId);
        return;
    }
    
    // Check se clicou em card
    const card = e.target.closest('.concept-card');
    if (card) {
        highlightCard(card);
    }
}

function scrollToCard(conceptId) {
    const card = document.querySelector(`[data-concept-id="${conceptId}"]`);
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightCard(card);
    }
}

function highlightCard(card) {
    const conceptId = card.dataset.conceptId;
    
    // Verificar se o card clicado já está marcado
    if (selectedCards.has(conceptId)) {
        // Desmarcar este card específico
        selectedCards.delete(conceptId);
        card.classList.remove('highlighted');
        card.style.transform = '';
        card.style.borderColor = '';
        
        // Se não há mais cards selecionados, resetar tudo
        if (selectedCards.size === 0) {
            resetConnectionFilter();
            showNotification('Filtro removido - mostrando todos os conceitos');
            return;
        }
        
        // Caso contrário, recalcular filtro com os cards restantes
        const allConnectedIds = new Set();
        selectedCards.forEach(id => {
            const concept = concepts.find(c => c.id === id);
            if (concept) {
                allConnectedIds.add(id);
                (concept.connections || []).forEach(connId => allConnectedIds.add(connId));
            }
        });
        
        const filteredConcepts = concepts.filter(c => allConnectedIds.has(c.id));
        renderCards(null, filteredConcepts);
        
        // Re-aplicar highlights aos cards selecionados
        setTimeout(() => {
            selectedCards.forEach(id => {
                const cardToHighlight = document.querySelector(`[data-concept-id="${id}"]`);
                if (cardToHighlight) {
                    cardToHighlight.classList.add('highlighted');
                    cardToHighlight.style.transform = 'scale(1.02)';
                    cardToHighlight.style.borderColor = cardToHighlight.style.getPropertyValue('--card-color');
                }
            });
        }, 50);
        
        showNotification(`${selectedCards.size} conceito(s) selecionado(s) - ${filteredConcepts.length} disponíveis`);
        return;
    }
    
    // Adicionar novo card à seleção
    selectedCards.add(conceptId);
    
    // Calcular interseção de todas as conexões dos cards selecionados
    const allConnectedIds = new Set();
    selectedCards.forEach(id => {
        const concept = concepts.find(c => c.id === id);
        if (concept) {
            allConnectedIds.add(id);
            (concept.connections || []).forEach(connId => allConnectedIds.add(connId));
        }
    });
    
    const filteredConcepts = concepts.filter(c => allConnectedIds.has(c.id));
    
    // Re-renderizar cards com filtro
    renderCards(null, filteredConcepts);
    
    // Re-aplicar highlights após re-render
    setTimeout(() => {
        selectedCards.forEach(id => {
            const cardToHighlight = document.querySelector(`[data-concept-id="${id}"]`);
            if (cardToHighlight) {
                cardToHighlight.classList.add('highlighted');
                cardToHighlight.style.transform = 'scale(1.02)';
                cardToHighlight.style.borderColor = cardToHighlight.style.getPropertyValue('--card-color');
                
                // Scroll para o último adicionado
                if (id === conceptId) {
                    cardToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }, 50);
    
    const concept = concepts.find(c => c.id === conceptId);
    showNotification(`${selectedCards.size} conceito(s) selecionado(s) - ${filteredConcepts.length} disponíveis`);
}

// Debounce para otimizar busca em tempo real
let searchDebounceTimer;
function handleSearch(e) {
    // Limpar timer anterior
    clearTimeout(searchDebounceTimer);
    
    // Aguardar 150ms antes de executar busca
    searchDebounceTimer = setTimeout(() => {
        performSearch(e.target.value);
    }, 150);
}

function performSearch(value) {
    const searchTerm = value.toLowerCase().trim();
    const cards = document.querySelectorAll('.concept-card');
    const resultsDiv = document.getElementById('search-results');
    
    if (!searchTerm) {
        // Usar requestAnimationFrame para suavizar mudanças no DOM
        requestAnimationFrame(() => {
            cards.forEach(card => {
                card.style.display = '';
                card.style.opacity = '1';
            });
        });
        resultsDiv.textContent = '';
        return;
    }
    
    let visibleCount = 0;
    const updates = []; // Batch updates
    
    cards.forEach(card => {
        const name = card.dataset.conceptName;
        const description = card.dataset.conceptDescription;
        const matches = name.includes(searchTerm) || description.includes(searchTerm);
        
        if (matches) {
            updates.push({ card, display: '', opacity: '1' });
            visibleCount++;
        } else {
            updates.push({ card, display: 'none', opacity: '0' });
        }
    });
    
    // Aplicar todas as mudanças de uma vez
    requestAnimationFrame(() => {
        updates.forEach(({ card, display, opacity }) => {
            card.style.display = display;
            card.style.opacity = opacity;
        });
    });
    
    resultsDiv.textContent = visibleCount === 0 
        ? 'Nenhum conceito encontrado' 
        : `${visibleCount} conceito${visibleCount > 1 ? 's' : ''} encontrado${visibleCount > 1 ? 's' : ''}`;
}

// ============================================================================
// ALTERNÂNCIA DE MODO
// ============================================================================

function toggleViewMode() {
    const btnCards = document.getElementById('btn-cards');
    
    if (viewMode === '3d') {
        // Mudar para cards
        viewMode = 'cards';
        
        // Desativar completamente a renderização 3D
        isAnimating = false;
        
        // Ocultar container 3D
        container.classList.add('hidden');
        cardsContainer.classList.add('visible');
        searchContainer.classList.add('visible');
        instructions.style.display = 'none';
        infoPanel.classList.remove('visible');
        
        // Atualizar botão
        if (btnCards) {
            const icon = btnCards.querySelector('.btn-icon');
            const text = btnCards.querySelector('.btn-text');
            if (icon) icon.textContent = '◈';
            if (text) text.textContent = '3D';
        }
        
        // Desabilitar controles de 3D
        document.querySelectorAll('.control-btn').forEach(b => {
            const text = b.querySelector('.btn-text');
            if (text && (text.textContent.includes('Pausar') || 
                text.textContent.includes('Animar') || 
                text.textContent.includes('Conexões') ||
                text.textContent.includes('Velocidade') ||
                text.textContent.includes('Resetar'))) {
                b.style.opacity = '0.3';
                b.style.pointerEvents = 'none';
            }
        });
        
        showNotification('Modo Cards ativado - Renderização 3D pausada');
        
    } else {
        // Mudar para 3D
        viewMode = '3d';
        
        // Reativar renderização 3D
        isAnimating = true;
        
        // Mostrar container 3D
        container.classList.remove('hidden');
        cardsContainer.classList.remove('visible');
        searchContainer.classList.remove('visible');
        instructions.style.display = 'block';
        
        // Atualizar botão
        if (btnCards) {
            const icon = btnCards.querySelector('.btn-icon');
            const text = btnCards.querySelector('.btn-text');
            if (icon) icon.textContent = '⊞';
            if (text) text.textContent = 'Cards';
        }
        
        // Reabilitar controles de 3D
        document.querySelectorAll('.control-btn').forEach(b => {
            b.style.opacity = '';
            b.style.pointerEvents = '';
        });
        
        // Limpar busca ao voltar para 3D
        searchInput.value = '';
        if (typeof performSearch === 'function') {
            performSearch('');
        }
        
        showNotification('Modo 3D ativado');
    }
}

// ============================================================================
// INICIAR
// ============================================================================

window.addEventListener('load', init);
