#!/usr/bin/env python3
"""
Suaviza a distribuição de conectividade para aproximar de uma curva normal
Foco em redistribuir o pico excessivo em 6 conexões
"""
import json
import math
import random
from pathlib import Path
from collections import Counter

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def calculate_stats(connections):
    n = len(connections)
    mean = sum(connections) / n
    variance = sum((x - mean) ** 2 for x in connections) / n
    std_dev = math.sqrt(variance)
    skewness = sum((x - mean) ** 3 for x in connections) / (n * std_dev ** 3) if std_dev > 0 else 0
    kurtosis = sum((x - mean) ** 4 for x in connections) / (n * std_dev ** 4) - 3 if std_dev > 0 else 0
    return mean, std_dev, skewness, kurtosis

def score_normality(connections):
    n = len(connections)
    mean, std_dev, skewness, kurtosis = calculate_stats(connections)
    
    within_1sigma = sum(1 for x in connections if abs(x - mean) <= std_dev)
    within_2sigma = sum(1 for x in connections if abs(x - mean) <= 2 * std_dev)
    
    deviation_1sigma = abs(within_1sigma/n*100 - 68)
    deviation_2sigma = abs(within_2sigma/n*100 - 95)
    
    score = 100
    score -= min(deviation_1sigma * 2, 30)
    score -= min(deviation_2sigma * 1, 20)
    score -= min(abs(skewness) * 20, 20)
    score -= min(abs(kurtosis) * 10, 15)
    
    return score, mean, std_dev, skewness, kurtosis

def find_weak_connections(concept, all_concepts):
    """Encontra conexões que podem ser removidas (menos críticas)"""
    # Prioriza remover conexões com conceitos que já têm muitas conexões
    conn_counts = {c['id']: len(c['connections']) for c in all_concepts}
    
    weak_connections = []
    for conn_id in concept['connections']:
        if conn_counts.get(conn_id, 0) >= 10:  # O outro conceito é bem conectado
            weak_connections.append(conn_id)
    
    return weak_connections if weak_connections else concept['connections'][:1]

def find_good_connections(concept, all_concepts, max_results=3):
    """Encontra bons candidatos para novas conexões"""
    current_layer = concept['layer']
    current_connections = set(concept['connections'])
    
    candidates = []
    for other in all_concepts:
        if other['id'] == concept['id'] or other['id'] in current_connections:
            continue
        
        # Preferir mesma camada ou camadas relacionadas
        layer_bonus = 2 if other['layer'] == current_layer else 0
        
        # Preferir conceitos com conectividade moderada
        conn_count = len(other['connections'])
        if 6 <= conn_count <= 9:
            conn_bonus = 1
        else:
            conn_bonus = 0
        
        score = layer_bonus + conn_bonus
        candidates.append((score, other))
    
    candidates.sort(key=lambda x: (-x[0], random.random()))
    return [c[1] for c in candidates[:max_results]]

def main():
    assets_dir = Path(__file__).parent.parent / 'assets'
    concepts_file = assets_dir / 'concepts.json'
    relations_file = assets_dir / 'relations.json'
    
    print("🎨 SUAVIZAÇÃO DA DISTRIBUIÇÃO DE CONECTIVIDADE")
    print("=" * 70)
    
    # Load data
    concepts = load_json(concepts_file)
    relations = load_json(relations_file)
    
    # Current state
    connections = [len(c['connections']) for c in concepts]
    dist = Counter(connections)
    score_before, mean_before, std_before, skew_before, kurt_before = score_normality(connections)
    
    print(f"\n📊 ESTADO ATUAL:")
    print(f"   Score normalidade: {score_before:.0f}/100")
    print(f"   Média: {mean_before:.2f}, σ: {std_before:.2f}")
    print(f"   Skewness: {skew_before:.3f}, Kurtosis: {kurt_before:.3f}")
    print(f"   Pico em 6 conexões: {dist[6]} ({dist[6]/len(concepts)*100:.1f}%)")
    
    # Strategy: reduce peak at 6, increase diversity at 5, 7, 8
    target_6_pct = 0.25  # Aim for 25% instead of 46%
    target_6 = int(len(concepts) * target_6_pct)
    excess_6 = dist[6] - target_6
    
    print(f"\n🎯 OBJETIVO:")
    print(f"   Reduzir conceitos com 6 conexões: {dist[6]} → ~{target_6}")
    print(f"   Excesso a redistribuir: {excess_6}")
    print(f"   Meta: 40% ir para 5, 60% ir para 7-8")
    
    # Build concept index
    concepts_by_id = {c['id']: c for c in concepts}
    concepts_by_conn = {}
    for c in concepts:
        n = len(c['connections'])
        if n not in concepts_by_conn:
            concepts_by_conn[n] = []
        concepts_by_conn[n].append(c)
    
    # Phase 1: Remove some connections from concepts with 6
    to_reduce = int(excess_6 * 0.4)  # 40% go down to 5
    reduced = 0
    
    print(f"\n🔽 FASE 1: Reduzir {to_reduce} conceitos de 6→5 conexões")
    
    candidates_6 = concepts_by_conn.get(6, [])[:]
    random.shuffle(candidates_6)
    
    for concept in candidates_6[:to_reduce]:
        weak_conns = find_weak_connections(concept, concepts)
        if weak_conns:
            to_remove = weak_conns[0]
            concept['connections'].remove(to_remove)
            
            # Remove from other concept too
            if to_remove in concepts_by_id:
                other = concepts_by_id[to_remove]
                if concept['id'] in other['connections']:
                    other['connections'].remove(concept['id'])
            
            # Remove relations
            relations[:] = [r for r in relations if not (
                (r['from'] == concept['id'] and r['to'] == to_remove) or
                (r['from'] == to_remove and r['to'] == concept['id'])
            )]
            
            reduced += 1
            if reduced % 20 == 0:
                print(f"   • Processados: {reduced} conceitos")
    
    print(f"   ✅ Reduzidos: {reduced} conceitos")
    
    # Phase 2: Add connections to concepts with 6 to move them to 7-8
    to_increase = int(excess_6 * 0.6)  # 60% go up to 7-8
    increased = 0
    
    print(f"\n🔼 FASE 2: Aumentar {to_increase} conceitos de 6→7-8 conexões")
    
    # Refresh list after phase 1
    concepts_by_conn_new = {}
    for c in concepts:
        n = len(c['connections'])
        if n not in concepts_by_conn_new:
            concepts_by_conn_new[n] = []
        concepts_by_conn_new[n].append(c)
    
    candidates_6_new = concepts_by_conn_new.get(6, [])[:]
    random.shuffle(candidates_6_new)
    
    for concept in candidates_6_new[:to_increase]:
        target_conn_count = 7 if random.random() < 0.6 else 8
        to_add = target_conn_count - len(concept['connections'])
        
        new_connections = find_good_connections(concept, concepts, max_results=to_add)
        
        for other in new_connections[:to_add]:
            # Add bidirectional connection
            if other['id'] not in concept['connections']:
                concept['connections'].append(other['id'])
                other['connections'].append(concept['id'])
                
                # Add relation
                relations.append({
                    'from': concept['id'],
                    'to': other['id'],
                    'name': 'relaciona-se com',
                    'description': f"{concept['name']} relaciona-se com {other['name']}"
                })
                
                increased += 1
        
        if increased % 20 == 0:
            print(f"   • Processados: {increased} novas conexões")
    
    print(f"   ✅ Adicionados: {increased} conexões")
    
    # Final state
    connections_new = [len(c['connections']) for c in concepts]
    dist_new = Counter(connections_new)
    score_after, mean_after, std_after, skew_after, kurt_after = score_normality(connections_new)
    
    print(f"\n📊 RESULTADO:")
    print(f"   Score normalidade: {score_before:.0f} → {score_after:.0f}")
    print(f"   Média: {mean_before:.2f} → {mean_after:.2f}")
    print(f"   Desvio padrão: {std_before:.2f} → {std_after:.2f}")
    print(f"   Skewness: {skew_before:.3f} → {skew_after:.3f}")
    print(f"   Kurtosis: {kurt_before:.3f} → {kurt_after:.3f}")
    print(f"\n   Conceitos com 6 conexões: {dist[6]} → {dist_new[6]} ({dist_new[6]/len(concepts)*100:.1f}%)")
    
    if score_after > score_before:
        print(f"\n   ✅ MELHORIA: +{score_after - score_before:.0f} pontos")
    else:
        print(f"\n   ⚠️  Score diminuiu {score_before - score_after:.0f} pontos")
    
    # Save
    print(f"\n💾 Salvando mudanças...")
    save_json(concepts_file, concepts)
    save_json(relations_file, relations)
    print(f"   ✅ Arquivos atualizados")
    
    print("\n" + "=" * 70)
    print("✨ Suavização concluída!")
    print("\n💡 Execute 'make stats-full' para ver nova distribuição")

if __name__ == '__main__':
    main()
