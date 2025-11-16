#!/usr/bin/env python3
"""
Aumenta conectividade de conceitos sub-conectados (≤5 conexões)
conectando-os semanticamente a conceitos relacionados.

Abordagem RIZOMÁTICA - sem hierarquia, apenas multiplicidade de conexões.
"""

import json
import random
from collections import defaultdict

def load_data():
    """Carrega conceitos e relações"""
    with open('assets/concepts.json', 'r', encoding='utf-8') as f:
        concepts = json.load(f)
    
    with open('assets/relations.json', 'r', encoding='utf-8') as f:
        relations = json.load(f)
    
    return concepts, relations

def save_data(concepts, relations):
    """Salva dados atualizados"""
    with open('assets/concepts.json', 'w', encoding='utf-8') as f:
        json.dump(concepts, f, ensure_ascii=False, indent=2)
    
    with open('assets/relations.json', 'w', encoding='utf-8') as f:
        json.dump(relations, f, ensure_ascii=False, indent=2)

def find_semantic_matches(concept, all_concepts, max_matches=5):
    """
    Encontra conceitos semanticamente relacionados baseado em:
    - Palavras-chave na descrição
    - Camada compartilhada
    - Conexões existentes (amigos de amigos)
    """
    matches = []
    concept_words = set(concept['description'].lower().split())
    
    # Amigos de amigos (conceitos conectados aos que já estão conectados)
    friends_of_friends = set()
    for conn_id in concept['connections']:
        conn_concept = next((c for c in all_concepts if c['id'] == conn_id), None)
        if conn_concept:
            friends_of_friends.update(conn_concept['connections'])
    
    friends_of_friends.discard(concept['id'])
    friends_of_friends -= set(concept['connections'])
    
    for other in all_concepts:
        if other['id'] == concept['id']:
            continue
        if other['id'] in concept['connections']:
            continue
            
        score = 0
        
        # 1. Amigos de amigos (forte indicador)
        if other['id'] in friends_of_friends:
            score += 10
        
        # 2. Mesma camada
        if other['layer'] == concept['layer']:
            score += 3
        
        # 3. Palavras em comum na descrição
        other_words = set(other['description'].lower().split())
        common_words = concept_words & other_words
        score += len(common_words) * 0.5
        
        # 4. Conceitos bem conectados são melhores (hubs)
        score += min(len(other['connections']) / 10, 2)
        
        if score > 2:
            matches.append((other, score))
    
    # Ordena por score e retorna os melhores
    matches.sort(key=lambda x: -x[1])
    return [m[0] for m in matches[:max_matches]]

def get_relation_type(concept1, concept2):
    """Determina tipo de relação baseado nas camadas"""
    same_layer = concept1['layer'] == concept2['layer']
    
    # Tipos de relação mais comuns e neutros
    if same_layer:
        types = [
            'relaciona-se',
            'articula-se',
            'conecta-se',
            'dialoga com',
            'ressoa com'
        ]
    else:
        types = [
            'relaciona-se',
            'atravessa',
            'conecta-se',
            'entrelaça-se',
            'articula-se'
        ]
    
    return random.choice(types)

def boost_connectivity(min_connections=6):
    """Aumenta conectividade de conceitos sub-conectados"""
    
    print("🔗 BOOST DE CONECTIVIDADE RIZOMÁTICA")
    print("=" * 70)
    
    concepts, relations = load_data()
    
    # Identificar conceitos sub-conectados
    low_conn = [c for c in concepts if len(c['connections']) <= 5]
    
    print(f"\n📊 Estado inicial:")
    print(f"   Conceitos com ≤5 conexões: {len(low_conn)}")
    print(f"   Total de relações: {len(relations)}")
    
    # Estatísticas por camada
    by_layer = defaultdict(list)
    for c in low_conn:
        by_layer[c['layer']].append(c)
    
    print(f"\n📋 Por camada:")
    for layer in sorted(by_layer.keys(), key=lambda x: -len(by_layer[x])):
        print(f"   {layer:15s} {len(by_layer[layer]):3d} conceitos")
    
    # Processar cada conceito sub-conectado
    new_relations = []
    concepts_dict = {c['id']: c for c in concepts}
    
    print(f"\n🌱 Criando novas conexões...")
    
    for concept in low_conn:
        current_conn = len(concept['connections'])
        needed = min_connections - current_conn
        
        if needed <= 0:
            continue
        
        # Encontrar matches semânticos
        matches = find_semantic_matches(concept, concepts, max_matches=needed * 2)
        
        added = 0
        for match in matches:
            if added >= needed:
                break
            
            # Criar relação bidirecional
            rel_type = get_relation_type(concept, match)
            
            # Adicionar relação de concept -> match
            new_relations.append({
                'from': concept['id'],
                'to': match['id'],
                'name': rel_type,
                'description': f'Conexão semântica estabelecida para balanceamento rizomático'
            })
            
            # Adicionar relação de match -> concept
            new_relations.append({
                'from': match['id'],
                'to': concept['id'],
                'name': rel_type,
                'description': f'Conexão semântica estabelecida para balanceamento rizomático'
            })
            
            # Atualizar connections
            if match['id'] not in concept['connections']:
                concept['connections'].append(match['id'])
            if concept['id'] not in match['connections']:
                match['connections'].append(concept['id'])
            
            added += 1
            
        if added > 0:
            print(f"   • {concept['name']:40s} {current_conn} → {len(concept['connections'])} (+{added})")
    
    # Adicionar novas relações
    relations.extend(new_relations)
    
    # Salvar
    save_data(concepts, relations)
    
    # Estatísticas finais
    final_low = len([c for c in concepts if len(c['connections']) <= 5])
    
    print(f"\n✅ RESULTADO:")
    print(f"   Novas relações criadas: {len(new_relations)}")
    print(f"   Conceitos com ≤5 conexões: {len(low_conn)} → {final_low}")
    print(f"   Total de relações: {len(relations) - len(new_relations)} → {len(relations)}")
    
    # Distribuição final
    conn_dist = defaultdict(int)
    for c in concepts:
        conn_dist[len(c['connections'])] += 1
    
    print(f"\n📊 Nova distribuição de conectividade:")
    for conn in sorted(conn_dist.keys()):
        count = conn_dist[conn]
        bar = '█' * (count // 5)
        print(f"   {conn:2d} conexões: {count:3d} {bar}")
    
    print("\n" + "=" * 70)

if __name__ == '__main__':
    boost_connectivity(min_connections=6)
