/**
 * 🐛 DEBUG HELPER - Möbius Mouse Detection
 * 
 * Adicione ao console do navegador para debugar detecção de mouse:
 * 
 * Para ativar debug visual:
 *   window.indexMobius.options.debug = true;
 * 
 * Para desativar:
 *   window.indexMobius.options.debug = false;
 * 
 * Para testar detecção manual:
 *   testMobiusDetection(300, 300);
 */

function testMobiusDetection(x, y) {
    if (!window.indexMobius) {
        console.error('❌ IndexMobius não encontrado. A página carregou completamente?');
        return;
    }

    const mobius = window.indexMobius;
    const point = mobius.getPointAtMouse(x, y);

    console.log('🎯 Teste de detecção em posição:', { x, y });
    console.log('📊 Configurações:', {
        width: mobius.options.width,
        height: mobius.options.height,
        radius: mobius.options.radius,
        rotation: mobius.rotation
    });

    if (point) {
        console.log('✅ Ponto detectado:', {
            id: point.id,
            label: point.label,
            layer: point.layer,
            angle: point.angle
        });
    } else {
        console.log('❌ Nenhum ponto detectado nesta posição');

        // Calcular ponto mais próximo
        const centerX = mobius.options.width / 2;
        const centerY = mobius.options.height / 2;

        let closest = null;
        let minDistance = Infinity;

        for (const pt of mobius.navigationPoints) {
            const angle = pt.angle + mobius.rotation;
            const px = centerX + Math.cos(angle) * mobius.options.radius;
            const py = centerY + Math.sin(angle) * mobius.options.radius;
            const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);

            if (distance < minDistance) {
                minDistance = distance;
                closest = { ...pt, calculatedX: px, calculatedY: py };
            }
        }

        console.log('🎯 Ponto mais próximo:', {
            id: closest.id,
            label: closest.label,
            distance: Math.round(minDistance),
            position: { x: Math.round(closest.calculatedX), y: Math.round(closest.calculatedY) }
        });
    }
}

function enableMobiusDebug() {
    if (!window.indexMobius) {
        console.error('❌ IndexMobius não encontrado');
        return;
    }

    window.indexMobius.options.debug = true;
    console.log('✅ Debug visual ativado - você verá um círculo vermelho no cursor');
}

function disableMobiusDebug() {
    if (!window.indexMobius) {
        console.error('❌ IndexMobius não encontrado');
        return;
    }

    window.indexMobius.options.debug = false;
    console.log('❌ Debug visual desativado');
}

function showMobiusInfo() {
    if (!window.indexMobius) {
        console.error('❌ IndexMobius não encontrado');
        return;
    }

    const mobius = window.indexMobius;

    console.log('📊 Informações do Möbius:');
    console.table({
        'Canvas Width': mobius.canvas.width,
        'Canvas Height': mobius.canvas.height,
        'Style Width': mobius.canvas.style.width,
        'Style Height': mobius.canvas.style.height,
        'Logical Width': mobius.options.width,
        'Logical Height': mobius.options.height,
        'Radius': mobius.options.radius,
        'Points': mobius.navigationPoints.length,
        'DPR': window.devicePixelRatio,
        'Auto Rotate': mobius.autoRotate,
        'Rotation': mobius.rotation.toFixed(4)
    });

    console.log('🎯 Pontos de navegação:', mobius.navigationPoints.length);
    console.log('🔴 Passado:', mobius.navigationPoints.filter(p => p.layer === 'passado').length);
    console.log('🟢 Presente:', mobius.navigationPoints.filter(p => p.layer === 'presente').length);
    console.log('🔵 Futuro:', mobius.navigationPoints.filter(p => p.layer === 'futuro').length);
}

// Expor funções globalmente para console
window.testMobiusDetection = testMobiusDetection;
window.enableMobiusDebug = enableMobiusDebug;
window.disableMobiusDebug = disableMobiusDebug;
window.showMobiusInfo = showMobiusInfo;

console.log(`
🐛 DEBUG HELPER CARREGADO

Funções disponíveis:
  • testMobiusDetection(x, y)  - Testar detecção em coordenadas
  • enableMobiusDebug()         - Ativar debug visual (círculo no cursor)
  • disableMobiusDebug()        - Desativar debug visual
  • showMobiusInfo()            - Mostrar informações do canvas

Exemplo de uso:
  > testMobiusDetection(300, 300)
  > enableMobiusDebug()
`);
