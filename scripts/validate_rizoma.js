/**
 * Script de Validação do Rizoma
 * Execute no console do navegador (F12)
 * 
 * Usage: copie e cole este código no console
 */

(function validateRizoma() {
    console.log('🔍 Iniciando validação do Rizoma...\n');
    
    const results = {
        passed: [],
        failed: [],
        warnings: []
    };
    
    function test(name, condition, critical = false) {
        if (condition) {
            results.passed.push(name);
            console.log(`✅ ${name}`);
        } else {
            if (critical) {
                results.failed.push(name);
                console.error(`❌ ${name}`);
            } else {
                results.warnings.push(name);
                console.warn(`⚠️  ${name}`);
            }
        }
    }
    
    // ========================================
    // TESTES DE CARREGAMENTO
    // ========================================
    console.log('\n📦 CARREGAMENTO\n');
    
    test('Scene existe', typeof scene !== 'undefined' && scene !== null, true);
    test('Camera existe', typeof camera !== 'undefined' && camera !== null, true);
    test('Renderer existe', typeof renderer !== 'undefined' && renderer !== null, true);
    test('Nodes carregados', typeof nodes !== 'undefined' && nodes.length > 0, true);
    test('Lines carregadas', typeof lines !== 'undefined' && lines.length > 0, true);
    test('Concepts carregados', typeof concepts !== 'undefined' && concepts.length === 727, true);
    test('Relations carregadas', typeof relations !== 'undefined' && relations.length > 0, true);
    
    // ========================================
    // TESTES DE FÍSICA
    // ========================================
    console.log('\n⚛️  FÍSICA\n');
    
    test('SPHERE_RADIUS = 300', typeof SPHERE_RADIUS !== 'undefined' && SPHERE_RADIUS === 300);
    test('MIN_HUB_RADIUS definido', typeof MIN_HUB_RADIUS !== 'undefined');
    test('MAX_HUB_RADIUS definido', typeof MAX_HUB_RADIUS !== 'undefined');
    test('Gravidade radial ativa', typeof applyRadialGravity === 'function');
    test('Spring forces ativas', typeof applyEdgeSpringForces === 'function');
    
    // ========================================
    // TESTES DE RENDERING
    // ========================================
    console.log('\n🎨 RENDERING\n');
    
    test('Tone mapping exposure = 1.0', renderer && renderer.toneMappingExposure === 1.0);
    test('Animação rodando', typeof isAnimating !== 'undefined' && isAnimating === true);
    test('OrbitControls ativo', typeof controls !== 'undefined' && controls !== null);
    
    // ========================================
    // TESTES DE COMANDOS CONSOLE
    // ========================================
    console.log('\n💻 COMANDOS CONSOLE\n');
    
    const rizomaObj = window.rizoma;
    test('rizoma object existe', typeof rizomaObj === 'object', true);
    test('rizoma.help()', typeof rizomaObj?.help === 'function');
    test('rizoma.info()', typeof rizomaObj?.info === 'function');
    test('rizoma.stats()', typeof rizomaObj?.stats === 'function');
    test('rizoma.goto()', typeof rizomaObj?.goto === 'function');
    test('rizoma.random()', typeof rizomaObj?.random === 'function');
    test('rizoma.findHub()', typeof rizomaObj?.findHub === 'function');
    test('rizoma.findBridge()', typeof rizomaObj?.findBridge === 'function');
    test('rizoma.reset()', typeof rizomaObj?.reset === 'function');
    test('rizoma.quantum()', typeof rizomaObj?.quantum === 'function');
    test('rizoma.topology()', typeof rizomaObj?.topology === 'function');
    test('rizoma.geometry()', typeof rizomaObj?.geometry === 'function');
    test('rizoma.gravity()', typeof rizomaObj?.gravity === 'function');
    
    // ========================================
    // TESTES DE TOPOLOGIA
    // ========================================
    console.log('\n🕸️  TOPOLOGIA\n');
    
    test('TopologyMetrics existe', typeof topologyMetrics !== 'undefined');
    test('Communities detectadas', typeof communityMap !== 'undefined');
    test('NetworkFlow calculado', typeof networkFlowMap !== 'undefined');
    
    // ========================================
    // TESTES DE PERFORMANCE
    // ========================================
    console.log('\n⚡ PERFORMANCE\n');
    
    const nodeCount = nodes?.length || 0;
    const lineCount = lines?.length || 0;
    test('Nós renderizados', nodeCount > 0 && nodeCount <= 1000);
    test('Linhas renderizadas', lineCount > 0 && lineCount <= 10000);
    test('Performance mode disponível', typeof performanceMode !== 'undefined');
    
    // ========================================
    // VALIDAÇÃO DE PROPRIEDADES DOS NÓS
    // ========================================
    console.log('\n🔮 PROPRIEDADES DOS NÓS\n');
    
    if (nodes && nodes.length > 0) {
        const sampleNode = nodes[0];
        test('Node tem userData', sampleNode.userData !== undefined);
        test('Node tem originalColor', sampleNode.userData.originalColor !== undefined);
        test('Node tem originalEmissive', sampleNode.userData.originalEmissive !== undefined);
        test('Node tem originalOpacity', sampleNode.userData.originalOpacity !== undefined);
        test('Node tem baseScale', sampleNode.userData.baseScale !== undefined);
        test('Node tem position', sampleNode.position !== undefined);
        test('Node tem material', sampleNode.material !== undefined);
    }
    
    // ========================================
    // RESUMO
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA VALIDAÇÃO\n');
    console.log(`✅ Passou: ${results.passed.length}`);
    console.log(`⚠️  Avisos: ${results.warnings.length}`);
    console.log(`❌ Falhou: ${results.failed.length}`);
    console.log('='.repeat(60));
    
    if (results.failed.length > 0) {
        console.log('\n❌ FALHAS CRÍTICAS:');
        results.failed.forEach(f => console.log(`   - ${f}`));
    }
    
    if (results.warnings.length > 0) {
        console.log('\n⚠️  AVISOS:');
        results.warnings.forEach(w => console.log(`   - ${w}`));
    }
    
    if (results.failed.length === 0) {
        console.log('\n🎉 VALIDAÇÃO COMPLETA! Sistema funcionando corretamente.');
        console.log('\n💡 Experimente:');
        console.log('   rizoma.help()    - Ver todos os comandos');
        console.log('   rizoma.stats()   - Ver estatísticas detalhadas');
        console.log('   rizoma.random()  - Ir para conceito aleatório');
    } else {
        console.log('\n⚠️  Sistema com problemas. Verifique as falhas acima.');
    }
    
    return {
        passed: results.passed.length,
        warnings: results.warnings.length,
        failed: results.failed.length,
        success: results.failed.length === 0
    };
})();
