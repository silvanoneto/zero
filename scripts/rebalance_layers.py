#!/usr/bin/env python3
"""
Rebalances layer distribution by intelligently reassigning concepts
"""
import json
import time
from pathlib import Path
from collections import Counter

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def load_history():
    """Carrega histórico de movimentos recentes"""
    history_file = Path("assets/rebalance_history.json")
    try:
        with open(history_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_history(new_moves):
    """Salva histórico mantendo últimas 200 movimentações"""
    history_file = Path("assets/rebalance_history.json")
    history = load_history()
    
    # Adiciona timestamp aos novos movimentos
    timestamp = int(time.time())
    for move in new_moves:
        move['timestamp'] = timestamp
    
    # Adiciona e mantém apenas últimas 200
    history.extend(new_moves)
    history = history[-200:]
    
    with open(history_file, 'w', encoding='utf-8') as f:
        json.dump(history, f, ensure_ascii=False, indent=2)

def was_recently_moved(concept_id, from_layer, to_layer, history):
    """Verifica se movimento reverso ocorreu recentemente (últimas 2 execuções = ~80 movimentos)"""
    recent = history[-80:] if len(history) > 80 else history
    
    for move in reversed(recent):
        # Bloqueia movimento reverso (A→B se recentemente B→A)
        if move['id'] == concept_id and move['from'] == to_layer and move['to'] == from_layer:
            return True
    
    return False

def infer_level_from_concept(concept, relations):
    """Infere o nível (0-3) baseado na ontologia relacional do conceito"""
    concept_id = concept['id']
    
    # Palavras-chave que indicam níveis de abstração/concretude
    level_indicators = {
        0: ['universal', 'fundamental', 'princípio', 'categoria', 'essência', 'estrutura', 'base'],
        1: ['teoria', 'sistema', 'modelo', 'conceitual', 'abstrato', 'paradigma', 'framework'],
        2: ['aplicação', 'metodologia', 'técnica', 'processo', 'dinâmica', 'mecanismo'],
        3: ['concreto', 'específico', 'caso', 'exemplo', 'implementação', 'prática', 'experiência']
    }
    
    desc = concept.get('description', '').lower()
    name = concept.get('name', '').lower()
    
    # Score por nível baseado em keywords
    level_scores = {}
    for level, keywords in level_indicators.items():
        level_scores[level] = sum(1 for kw in keywords if kw in desc or kw in name)
    
    # Analisa relações para inferir nível
    # Conceitos que fundamentam outros → nível mais baixo (0-1)
    # Conceitos fundamentados por muitos → nível mais alto (2-3)
    fundamenta_count = sum(1 for r in relations if r['from'] == concept_id and 'fundament' in r['name'])
    fundamentado_count = sum(1 for r in relations if r['to'] == concept_id and 'fundament' in r['name'])
    
    if fundamenta_count > fundamentado_count * 2:
        level_scores[0] = level_scores.get(0, 0) + 3
        level_scores[1] = level_scores.get(1, 0) + 1
    elif fundamentado_count > fundamenta_count * 2:
        level_scores[2] = level_scores.get(2, 0) + 1
        level_scores[3] = level_scores.get(3, 0) + 3
    
    # Retorna nível com maior score (padrão: 1 se empate)
    if not level_scores or all(v == 0 for v in level_scores.values()):
        return 1
    return max(level_scores.items(), key=lambda x: x[1])[0]

def analyze_concept_for_layer(concept, relations):
    """Suggest possible layers for a concept based on its description and connections"""
    desc = concept.get('description', '').lower()
    name = concept.get('name', '').lower()
    
    # Keywords for each dimension
    dimension_keywords = {
        'ontologica': ['ontologia', 'ser', 'existência', 'realidade', 'fenômeno', 'matéria', 'natureza'],
        'epistemica': ['conhecimento', 'epistemologia', 'saber', 'cognição', 'método', 'ciência'],
        'etica': ['ética', 'moral', 'justiça', 'valor', 'bem', 'responsabilidade', 'cuidado'],
        'politica': ['política', 'poder', 'estado', 'governo', 'democracia', 'resistência', 'luta'],
        'pratica': ['prática', 'ação', 'fazer', 'praxis', 'agir', 'método', 'técnica'],
        'temporal': ['tempo', 'temporal', 'duração', 'devir', 'mudança', 'processo', 'história'],
        'ecologica': ['ecologia', 'ambiente', 'natureza', 'ecosistema', 'clima', 'terra', 'planeta'],
        'fundacional': ['fundamento', 'base', 'princípio', 'origem', 'raiz', 'fundação']
    }
    
    # Infere o nível ideal baseado na ontologia
    ideal_level = infer_level_from_concept(concept, relations)
    
    scores = {}
    # Score dimensions com níveis diferenciados
    for dimension, keywords in dimension_keywords.items():
        base_score = sum(1 for kw in keywords if kw in desc or kw in name)
        
        # Distribui scores com preferência pelo nível inferido
        for level in range(4):
            layer = f"{dimension}-{level}"
            if level == ideal_level:
                scores[layer] = base_score * 2  # Dobra o score para o nível ideal
            elif abs(level - ideal_level) == 1:
                scores[layer] = base_score * 1.5  # Níveis adjacentes têm score intermediário
            else:
                scores[layer] = base_score * 0.5  # Níveis distantes têm score reduzido
    
    return scores

def main():
    assets_dir = Path(__file__).parent.parent / 'assets'
    concepts_file = assets_dir / 'concepts.json'
    relations_file = assets_dir / 'relations.json'
    
    print("⚖️  REBALANCEAMENTO DE CAMADAS")
    print("=" * 70)
    
    # Load data
    concepts = load_json(concepts_file)
    relations = load_json(relations_file)
    history = load_history()  # Carrega histórico de movimentos
    
    # Current distribution
    current_dist = Counter(c['layer'] for c in concepts)
    total = len(concepts)
    num_layers = len(current_dist)  # Actual number of layers
    target = total // num_layers  # Equal distribution across all layers
    
    print(f"\n📊 DISTRIBUIÇÃO ATUAL:")
    for layer, count in sorted(current_dist.items(), key=lambda x: -x[1]):
        diff = count - target
        status = "✅" if abs(diff) < target * 0.3 else ("⚠️ " if diff > 0 else "📉")
        print(f"   {status} {layer:15s} {count:3d} ({count/total*100:5.1f}%) diff: {diff:+4d}")
    
    print(f"\n🎯 Alvo ideal: {target} conceitos/camada")
    print(f"   Razão atual: {max(current_dist.values()) / min(current_dist.values()):.2f}x")
    
    # Identify layers to rebalance
    # Prioriza as camadas mais extremas
    # LIMIARES ULTRA-AGRESSIVOS para otimização máxima
    over = {k: v for k, v in current_dist.items() if v > target * 1.1}  # Só 10% acima
    under = {k: v for k, v in current_dist.items() if v < target * 0.9}  # Só 10% abaixo
    
    # Ordena por desvio (maior primeiro)
    over = dict(sorted(over.items(), key=lambda x: -x[1]))
    under = dict(sorted(under.items(), key=lambda x: x[1]))
    
    print(f"\n🔄 PLANO DE REBALANCEAMENTO:")
    print(f"   Sobre-representadas: {list(over.keys())}")
    print(f"   Sub-representadas: {list(under.keys())}")
    
    # Rebalance
    changes = []
    moved_concepts = set()  # Rastreia conceitos já movidos nesta execução
    
    for concept in concepts:
        current_layer = concept['layer']
        concept_id = concept['id']
        
        # Evita mover o mesmo conceito múltiplas vezes
        if concept_id in moved_concepts:
            continue
        
        # Only consider concepts from over-represented layers
        if current_layer not in over:
            continue
            
        # Get layer scores based on content and ontological relations
        scores = analyze_concept_for_layer(concept, relations)
        
        # Find best alternative layer that's under-represented
        # Prefer layers with similar dimension when possible
        current_dim = current_layer.rsplit('-', 1)[0]
        best_alt = None
        best_score = scores.get(current_layer, 0)
        
        # Try to find alternatives with score >= 50% of current (more flexible)
        for alt_layer in under.keys():
            # Verifica se este movimento é um reverso recente (BLOQUEIO DE PING-PONG)
            if was_recently_moved(concept_id, current_layer, alt_layer, history):
                continue  # Pula este candidato
            
            alt_dim = alt_layer.rsplit('-', 1)[0]
            score = scores.get(alt_layer, 0)
            
            # Bonus for staying in same dimension (helps avoid ping-pong)
            if alt_dim == current_dim:
                score = score * 1.5
            
            if score >= best_score * 0.5:  # At least 50% as good (was 80%)
                if best_alt is None or score > scores.get(best_alt, 0):
                    best_alt = alt_layer
        
        if best_alt:
            # More aggressive balance check
            if current_dist[current_layer] - 1 >= target * 0.8 and current_dist[best_alt] + 1 <= target * 1.2:
                changes.append({
                    'concept': concept,
                    'from': current_layer,
                    'to': best_alt,
                    'score': scores[best_alt]
                })
                moved_concepts.add(concept_id)  # Marca como movido
    
    # Sort by score and limit changes
    changes.sort(key=lambda x: x['score'], reverse=True)
    
    # Apply changes gradually to avoid over-correction
    # Aumenta limite para 40 movimentos para acelerar convergência
    max_moves = min(len(changes), 40)
    applied = 0
    
    print(f"\n📝 MUDANÇAS PROPOSTAS (top {max_moves}):")
    
    for i, change in enumerate(changes[:max_moves]):
        concept = change['concept']
        from_layer = change['from']
        to_layer = change['to']
        
        # Update the concept
        concept['layer'] = to_layer
        
        # Update counters
        current_dist[from_layer] -= 1
        current_dist[to_layer] += 1
        
        applied += 1
        print(f"   {i+1:2d}. {concept['name']:50s} {from_layer} → {to_layer}")
        
        # Stop if we've balanced enough
        if all(target * 0.7 <= count <= target * 1.3 for count in current_dist.values()):
            print(f"\n✅ Equilíbrio alcançado após {applied} mudanças!")
            break
    
    print(f"\n📊 NOVA DISTRIBUIÇÃO:")
    for layer, count in sorted(current_dist.items(), key=lambda x: -x[1]):
        diff = count - target
        status = "✅" if abs(diff) < target * 0.3 else ("⚠️ " if diff > 0 else "📉")
        print(f"   {status} {layer:15s} {count:3d} ({count/total*100:5.1f}%) diff: {diff:+4d}")
    
    new_ratio = max(current_dist.values()) / min(current_dist.values())
    print(f"\n   Razão nova: {new_ratio:.2f}x")
    
    if new_ratio < 2.0:
        print("   ✅ BALANCEAMENTO BOM")
    elif new_ratio < 3.0:
        print("   ⚠️  BALANCEAMENTO ACEITÁVEL")
    else:
        print("   ❌ AINDA DESBALANCEADO")
    
    # Save
    if applied > 0:
        print(f"\n💾 Salvando {applied} mudanças...")
        save_json(concepts_file, concepts)
        print(f"   ✅ Conceitos atualizados")
        
        # Salva histórico de movimentos para prevenir oscilação
        history_moves = [
            {'id': change['concept']['id'], 'from': change['from'], 'to': change['to']}
            for change in changes[:max_moves]
        ]
        save_history(history_moves)
        print(f"   ✅ Histórico atualizado ({len(history_moves)} movimentos)")
    else:
        print("\n⚠️  Nenhuma mudança aplicada")
    
    print("\n" + "=" * 70)
    print("✨ Rebalanceamento concluído!")
    print("\n💡 Execute 'make balance-check' para verificar resultado")

if __name__ == '__main__':
    main()
