#!/usr/bin/env python3
"""
Script para propor novas relações entre conceitos baseado em análise semântica.
Foca em conectar conceitos isolados e sub-conectados.
"""

import json
from collections import defaultdict
import re

def load_data():
    with open('assets/concepts.json', 'r', encoding='utf-8') as f:
        concepts = json.load(f)
    with open('assets/relations.json', 'r', encoding='utf-8') as f:
        relations = json.load(f)
    return concepts, relations

def analyze_connectivity(concepts, relations):
    """Analisa conectividade dos conceitos"""
    concept_index = {c['id']: c for c in concepts}
    connection_count = defaultdict(int)
    existing_pairs = set()
    
    for rel in relations:
        connection_count[rel['from']] += 1
        connection_count[rel['to']] += 1
        pair = tuple(sorted([rel['from'], rel['to']]))
        existing_pairs.add(pair)
    
    return concept_index, connection_count, existing_pairs

def find_semantic_matches(concept, all_concepts, existing_pairs, concept_index):
    """Encontra matches semânticos para um conceito"""
    proposals = []
    cid = concept['id']
    layer = concept['layer']
    name = concept['name'].lower()
    desc = concept.get('description', '').lower()
    
    # Palavras-chave do conceito
    keywords = set(re.findall(r'\w+', name + ' ' + desc))
    
    for other in all_concepts:
        if other['id'] == cid:
            continue
        
        # Verificar se relação já existe
        pair = tuple(sorted([cid, other['id']]))
        if pair in existing_pairs:
            continue
        
        other_name = other['name'].lower()
        other_desc = other.get('description', '').lower()
        other_keywords = set(re.findall(r'\w+', other_name + ' ' + other_desc))
        
        # Calcular similaridade
        common = keywords & other_keywords
        if len(common) < 2:  # Requer pelo menos 2 palavras em comum
            continue
        
        score = len(common) / max(len(keywords), len(other_keywords))
        
        # Relações conceituais específicas
        relation_type, relation_desc = infer_relation_type(
            concept, other, common, concept_index
        )
        
        if relation_type:
            proposals.append({
                'from': cid,
                'to': other['id'],
                'name': relation_type,
                'description': relation_desc,
                'score': score,
                'common_words': list(common)
            })
    
    return sorted(proposals, key=lambda x: x['score'], reverse=True)

def infer_relation_type(concept, other, common_words, concept_index):
    """Infere tipo de relação baseado em padrões semânticos"""
    c_name = concept['name'].lower()
    c_layer = concept['layer']
    o_name = other['name'].lower()
    o_layer = other['layer']
    
    # Relações fundacionais
    if c_layer == 'fundacional' and o_layer != 'fundacional':
        return 'fundamenta', f"{concept['name']} fornece fundamento filosófico para {other['name']}"
    
    if o_layer == 'fundacional' and c_layer != 'fundacional':
        return 'fundamenta-se em', f"{concept['name']} encontra fundamento em {other['name']}"
    
    # Relações epistemológicas
    if 'epistem' in c_name or 'conhecimento' in c_name:
        if 'prática' in o_name or o_layer == 'pratica':
            return 'orienta', f"{concept['name']} orienta a prática de {other['name']}"
    
    # Relações políticas
    if c_layer == 'politica' and o_layer == 'pratica':
        return 'materializa-se em', f"{concept['name']} se materializa na prática de {other['name']}"
    
    if 'poder' in common_words or 'político' in common_words:
        return 'articula-se com', f"{concept['name']} articula poder com {other['name']}"
    
    # Relações temporais
    if c_layer == 'temporal' or o_layer == 'temporal':
        return 'temporaliza', f"{concept['name']} temporaliza {other['name']}"
    
    # Relações ecológicas
    if c_layer == 'ecologica' or o_layer == 'ecologica':
        if 'material' in common_words or 'corpo' in common_words:
            return 'co-constitui', f"{concept['name']} co-constitui materialmente {other['name']}"
    
    # Relações éticas
    if c_layer == 'etica':
        if o_layer == 'pratica':
            return 'regula', f"{concept['name']} estabelece parâmetros éticos para {other['name']}"
        elif o_layer == 'politica':
            return 'tensiona', f"{concept['name']} tensiona eticamente {other['name']}"
    
    # Relações ontológicas
    if c_layer == 'ontologica':
        return 'constitui', f"{concept['name']} constitui ontologicamente {other['name']}"
    
    # Relação genérica baseada em palavras comuns
    if 'rede' in common_words or 'relação' in common_words:
        return 'conecta-se com', f"{concept['name']} conecta-se relacionalmente com {other['name']}"
    
    if 'transform' in ' '.join(common_words):
        return 'transforma', f"{concept['name']} transforma {other['name']}"
    
    # Default
    return 'relaciona-se com', f"{concept['name']} relaciona-se com {other['name']}"

def main():
    concepts, relations = load_data()
    
    # Carregar propostas anteriores para não duplicar
    try:
        with open('assets/new_relations_proposals.json', 'r', encoding='utf-8') as f:
            previous_proposals = json.load(f)
        print(f"📋 Propostas anteriores carregadas: {len(previous_proposals)}")
    except FileNotFoundError:
        previous_proposals = []
    
    concept_index, connection_count, existing_pairs = analyze_connectivity(concepts, relations)
    
    # Adicionar propostas anteriores ao conjunto de pares existentes
    for rel in previous_proposals:
        connection_count[rel['from']] += 1
        connection_count[rel['to']] += 1
        pair = tuple(sorted([rel['from'], rel['to']]))
        existing_pairs.add(pair)
    
    print("🔍 BUSCANDO NOVAS RELAÇÕES SEMÂNTICAS (RODADA 3)...\n")
    
    # Focar em conceitos com menos de 12 conexões (threshold aumentado novamente)
    underconnected = [c for c in concepts if connection_count[c['id']] < 12]
    
    print(f"Analisando {len(underconnected)} conceitos sub-conectados...")
    print(f"Pares existentes: {len(existing_pairs)}\n")
    
    new_relations = []
    
    for concept in underconnected:
        proposals = find_semantic_matches(concept, concepts, existing_pairs, concept_index)
        
        if proposals:
            # Pegar top 3-5 relações mais relevantes
            top = proposals[:min(5, len(proposals))]
            
            print(f"\n📌 {concept['name']} ({concept['layer']}) - {connection_count[concept['id']]} conexões atuais")
            print(f"   Propondo {len(top)} novas relações:")
            
            for p in top:
                target = concept_index[p['to']]
                print(f"   → {p['name']:20s} {target['name']:40s} ({target['layer']})")
                print(f"      Score: {p['score']:.2f} | Palavras: {', '.join(p['common_words'][:5])}")
                
                new_relations.append({
                    'from': p['from'],
                    'to': p['to'],
                    'name': p['name'],
                    'description': p['description']
                })
                
                # Adicionar aos pares existentes para evitar duplicatas nas próximas iterações
                pair = tuple(sorted([p['from'], p['to']]))
                existing_pairs.add(pair)
    
    print(f"\n\n📊 RESUMO:")
    print(f"   Novas relações propostas: {len(new_relations)}")
    print(f"   Conceitos analisados: {len(underconnected)}")
    
    if new_relations:
        # Salvar propostas
        with open('assets/new_relations_proposals.json', 'w', encoding='utf-8') as f:
            json.dump(new_relations, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ Propostas salvas em: assets/new_relations_proposals.json")
        print(f"\n   Para aplicar: python3 scripts/apply_new_relations.py")
    
if __name__ == '__main__':
    main()
