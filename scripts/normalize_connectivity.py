#!/usr/bin/env python3
"""
Script de normalização da distribuição de conectividade
Ajusta conexões para aproximar distribuição gaussiana (normal)
"""

import json
import statistics
import random
from collections import defaultdict
from pathlib import Path

# Caminhos
BASE_DIR = Path(__file__).parent.parent
CONCEPTS_FILE = BASE_DIR / 'assets' / 'concepts.json'
RELATIONS_FILE = BASE_DIR / 'assets' / 'relations.json'


def load_json(filepath):
    """Carrega arquivo JSON com encoding UTF-8"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(filepath, data):
    """Salva arquivo JSON com encoding UTF-8 e formatação"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_concept_by_id(concept_id, concepts):
    """Retorna conceito por ID"""
    for c in concepts:
        if c['id'] == concept_id:
            return c
    return None


def analyze_distribution(concepts):
    """Analisa distribuição de conectividade"""
    degrees = [len(c['connections']) for c in concepts]
    mean = statistics.mean(degrees)
    stdev = statistics.stdev(degrees)
    
    return {
        'mean': mean,
        'median': statistics.median(degrees),
        'stdev': stdev,
        'min': min(degrees),
        'max': max(degrees),
        'range_1sigma': (mean - stdev, mean + stdev),
        'range_2sigma': (mean - 2*stdev, mean + 2*stdev)
    }


def classify_concepts(concepts, stats):
    """Classifica conceitos por nível de conectividade"""
    under_connected = []
    normal_connected = []
    over_connected = []
    
    for c in concepts:
        degree = len(c['connections'])
        if degree < stats['range_1sigma'][0]:
            under_connected.append(c)
        elif degree > stats['range_1sigma'][1]:
            over_connected.append(c)
        else:
            normal_connected.append(c)
    
    return {
        'under': sorted(under_connected, key=lambda x: len(x['connections'])),
        'normal': normal_connected,
        'over': sorted(over_connected, key=lambda x: -len(x['connections']))
    }


def find_compatible_connections(concept, concepts, stats, max_suggestions=10):
    """
    Encontra conceitos compatíveis para novas conexões
    Critérios:
    - Mesma camada ou camadas adjacentes
    - Não já conectados
    - Preferência por conceitos sub-conectados ou normais
    """
    same_layer = concept.get('layer')
    current_connections = set(concept['connections'])
    current_id = concept['id']
    
    # Camadas adjacentes lógicas
    layer_adjacency = {
        'fundacional': ['ontologica', 'temporal'],
        'ontologica': ['fundacional', 'epistemica', 'ecologica'],
        'epistemica': ['ontologica', 'politica', 'etica'],
        'politica': ['epistemica', 'pratica', 'etica'],
        'etica': ['epistemica', 'politica', 'pratica'],
        'temporal': ['fundacional', 'ontologica', 'pratica'],
        'ecologica': ['ontologica', 'pratica', 'etica'],
        'pratica': ['politica', 'etica', 'temporal', 'ecologica']
    }
    
    compatible_layers = [same_layer] + layer_adjacency.get(same_layer, [])
    
    candidates = []
    for c in concepts:
        if c['id'] == current_id:
            continue
        if c['id'] in current_connections:
            continue
        
        # Preferência por mesma camada
        layer_score = 2 if c.get('layer') == same_layer else 1 if c.get('layer') in compatible_layers else 0.5
        
        # Preferência por conceitos sub-conectados
        degree = len(c['connections'])
        if degree < stats['range_1sigma'][0]:
            connectivity_score = 3  # Sub-conectado (prioridade alta)
        elif degree <= stats['range_1sigma'][1]:
            connectivity_score = 2  # Normal
        else:
            connectivity_score = 1  # Sobre-conectado (baixa prioridade)
        
        score = layer_score * connectivity_score
        candidates.append((c, score))
    
    # Ordena por score e retorna top N
    candidates.sort(key=lambda x: -x[1])
    return [c for c, score in candidates[:max_suggestions]]


def suggest_verb_for_connection(from_concept, to_concept):
    """Sugere verbo apropriado baseado nas camadas"""
    from_layer = from_concept.get('layer', 'desconhecida')
    to_layer = to_concept.get('layer', 'desconhecida')
    
    # Mapeamento de verbos por camada
    layer_verbs = {
        'fundacional': ['fundamenta-se em', 'emerge de', 'sustenta-se em', 'condiciona'],
        'ontologica': ['constitui', 'articula-se com', 'entrelaça-se com', 'co-constitui'],
        'epistemica': ['conhece através de', 'aprende de', 'questiona', 'dialoga com'],
        'politica': ['mobiliza', 'articula-se politicamente com', 'resiste a', 'organiza-se em'],
        'etica': ['cuida de', 'responsabiliza-se por', 'orienta-se eticamente por', 'respeita'],
        'temporal': ['desdobra-se em', 'temporaliza-se em', 'evolui para', 'atualiza'],
        'ecologica': ['simbiosa com', 'co-habita', 'flui em', 'entrelaça-se ecologicamente com'],
        'pratica': ['pratica', 'implementa', 'performa', 'efetiva-se em']
    }
    
    # Mesma camada - usa verbo da camada
    if from_layer == to_layer and from_layer in layer_verbs:
        return random.choice(layer_verbs[from_layer])
    
    # Camadas diferentes - verbo da camada de origem
    if from_layer in layer_verbs:
        return random.choice(layer_verbs[from_layer])
    
    # Fallback
    return 'relaciona-se com'


def create_new_relation(from_concept, to_concept, relations):
    """Cria nova relação entre conceitos"""
    verb = suggest_verb_for_connection(from_concept, to_concept)
    
    relation = {
        'from': from_concept['id'],
        'to': to_concept['id'],
        'name': verb,
        'description': f"{from_concept['name']} {verb} {to_concept['name']}"
    }
    
    return relation


def normalize_connectivity(concepts, relations, target_additions=100, dry_run=False):
    """
    Normaliza distribuição de conectividade
    Adiciona conexões estratégicas para aproximar distribuição normal
    """
    print("🎯 NORMALIZAÇÃO DA DISTRIBUIÇÃO DE CONECTIVIDADE")
    print("=" * 70)
    
    # Analisa distribuição atual
    stats_before = analyze_distribution(concepts)
    classified = classify_concepts(concepts, stats_before)
    
    print(f"\n📊 ESTADO ATUAL:")
    print(f"   μ (média):     {stats_before['mean']:.2f}")
    print(f"   σ (desvio):    {stats_before['stdev']:.2f}")
    print(f"   Faixa ±1σ:     {stats_before['range_1sigma'][0]:.1f} - {stats_before['range_1sigma'][1]:.1f}")
    print(f"\n   Sub-conectados:    {len(classified['under']):3d} ({len(classified['under'])/len(concepts)*100:4.1f}%)")
    print(f"   Bem conectados:    {len(classified['normal']):3d} ({len(classified['normal'])/len(concepts)*100:4.1f}%)")
    print(f"   Sobre-conectados:  {len(classified['over']):3d} ({len(classified['over'])/len(concepts)*100:4.1f}%)")
    
    # Prioriza conceitos mais sub-conectados
    concepts_to_enhance = classified['under'][:target_additions]
    
    print(f"\n🔄 PLANEJAMENTO:")
    print(f"   Conceitos a melhorar: {len(concepts_to_enhance)}")
    print(f"   Conexões a adicionar: ~{target_additions * 2} (bidirecional)")
    
    if dry_run:
        print(f"\n⚠️  MODO DRY-RUN: Simulando mudanças...")
    
    # Cria novas conexões
    new_relations = []
    connections_added = defaultdict(int)
    
    for concept in concepts_to_enhance:
        # Determina quantas conexões adicionar
        current_degree = len(concept['connections'])
        target_degree = int(stats_before['mean'])
        additions_needed = max(1, target_degree - current_degree)
        
        # Encontra candidatos compatíveis
        candidates = find_compatible_connections(concept, concepts, stats_before, 
                                                 max_suggestions=additions_needed * 2)
        
        added = 0
        for candidate in candidates[:additions_needed]:
            # Cria relação bidirecional
            rel1 = create_new_relation(concept, candidate, relations)
            rel2 = create_new_relation(candidate, concept, relations)
            
            new_relations.append(rel1)
            new_relations.append(rel2)
            
            # Atualiza conexões nos conceitos (em memória)
            if candidate['id'] not in concept['connections']:
                concept['connections'].append(candidate['id'])
            if concept['id'] not in candidate['connections']:
                candidate['connections'].append(concept['id'])
            
            connections_added[concept['id']] += 1
            connections_added[candidate['id']] += 1
            added += 1
        
        if added > 0 and len(new_relations) % 20 == 0:
            print(f"   • Processados: {len(connections_added)} conceitos, {len(new_relations)} relações criadas")
    
    print(f"\n✅ Processamento concluído:")
    print(f"   • Conceitos melhorados: {len(connections_added)}")
    print(f"   • Novas relações: {len(new_relations)}")
    
    # Analisa nova distribuição
    stats_after = analyze_distribution(concepts)
    classified_after = classify_concepts(concepts, stats_after)
    
    print(f"\n📊 ESTADO APÓS NORMALIZAÇÃO:")
    print(f"   μ (média):     {stats_after['mean']:.2f} (antes: {stats_before['mean']:.2f})")
    print(f"   σ (desvio):    {stats_after['stdev']:.2f} (antes: {stats_before['stdev']:.2f})")
    print(f"\n   Sub-conectados:    {len(classified_after['under']):3d} ({len(classified_after['under'])/len(concepts)*100:4.1f}%) - antes: {len(classified['under'])}")
    print(f"   Bem conectados:    {len(classified_after['normal']):3d} ({len(classified_after['normal'])/len(concepts)*100:4.1f}%) - antes: {len(classified['normal'])}")
    print(f"   Sobre-conectados:  {len(classified_after['over']):3d} ({len(classified_after['over'])/len(concepts)*100:4.1f}%) - antes: {len(classified['over'])}")
    
    # Conformidade com normal
    in_1sigma = len(classified_after['normal']) / len(concepts) * 100
    improvement = in_1sigma - (len(classified['normal']) / len(concepts) * 100)
    
    print(f"\n📐 CONFORMIDADE COM NORMAL:")
    print(f"   Dentro de ±1σ: {in_1sigma:.1f}% (ideal: 68%, melhoria: +{improvement:.1f}%)")
    
    if abs(in_1sigma - 68) < 5:
        print(f"   ✅ EXCELENTE conformidade alcançada!")
    elif abs(in_1sigma - 68) < 10:
        print(f"   ✅ BOA conformidade alcançada")
    else:
        print(f"   ⚠️  Conformidade melhorou, mas ainda pode ser otimizada")
    
    # Salva ou simula
    if not dry_run:
        print(f"\n💾 Salvando mudanças...")
        save_json(CONCEPTS_FILE, concepts)
        
        # Adiciona novas relações
        all_relations = relations + new_relations
        save_json(RELATIONS_FILE, all_relations)
        
        print(f"   ✅ Conceitos atualizados: {CONCEPTS_FILE}")
        print(f"   ✅ Relações atualizadas: {RELATIONS_FILE}")
    else:
        print(f"\n⚠️  DRY-RUN: Nenhuma mudança foi salva")
        print(f"   Execute sem --dry-run para aplicar mudanças")
    
    return {
        'before': stats_before,
        'after': stats_after,
        'new_relations': len(new_relations),
        'concepts_enhanced': len(connections_added)
    }


def main():
    """Função principal"""
    import sys
    
    # Opções de linha de comando
    dry_run = '--dry-run' in sys.argv
    target = 100
    
    for arg in sys.argv:
        if arg.startswith('--target='):
            target = int(arg.split('=')[1])
    
    print("🔧 NORMALIZAÇÃO DE CONECTIVIDADE DA ONTOLOGIA CRIOS")
    print("=" * 70)
    
    if dry_run:
        print("\n⚠️  MODO SIMULAÇÃO - Nenhuma mudança será salva")
    
    # Carrega dados
    print("\n📂 Carregando dados...")
    concepts = load_json(CONCEPTS_FILE)
    relations = load_json(RELATIONS_FILE)
    
    print(f"   • {len(concepts)} conceitos")
    print(f"   • {len(relations)} relações")
    
    # Normaliza
    result = normalize_connectivity(concepts, relations, target_additions=target, dry_run=dry_run)
    
    print("\n" + "=" * 70)
    if not dry_run:
        print("✨ Normalização concluída com sucesso!")
        print("\n💡 Execute 'make validate' para verificar integridade")
        print("💡 Execute 'make stats-full' para ver nova distribuição")
    else:
        print("✨ Simulação concluída!")
        print("\n💡 Execute sem --dry-run para aplicar mudanças")


if __name__ == '__main__':
    main()
