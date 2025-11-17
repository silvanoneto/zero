#!/usr/bin/env python3
"""
Categoriza conceitos em subcamadas SEMANTICAMENTE:
- 0: Geral (conceitos abstratos, teóricos, fundamentos)
- 1: Relacional (conexões, vínculos, redes, interdependências)
- 2: Prática (aplicação, ação, institucional, métodos)
- 3: Mista (conceitos híbridos, transversais, integrados)
"""

import json

def categorize_concept(concept, layer):
    """Categoriza conceito baseado em análise semântica"""
    name = concept['name'].lower()
    desc = concept['description'].lower()
    text = f"{name} {desc}"
    
    # Palavras-chave para cada categoria
    pratica_keywords = ['prática', 'prátic', 'ação', 'fazer', 'aplicação', 'institucional', 
                        'pedagógica', 'educação', 'ensino', 'método', 'técnica', 'ferramenta',
                        'política', 'governo', 'estado', 'organização', 'movimento', 'luta']
    
    relacional_keywords = ['relação', 'relacional', 'conexão', 'rede', 'vínculo', 'interação',
                          'reciprocidade', 'mutualidade', 'interdependência', 'co-', 'intra-',
                          'entre', 'simbiose', 'colaboração', 'cooperação', 'encontro']
    
    geral_keywords = ['conceito', 'teoria', 'abstrato', 'abstração', 'ideia', 'noção',
                     'princípio', 'fundamento', 'base', 'essência', 'natureza', 'ser',
                     'existência', 'ontologia', 'epistemologia', 'metafísica', 'universal']
    
    # Conta ocorrências
    pratica_score = sum(1 for kw in pratica_keywords if kw in text)
    relacional_score = sum(1 for kw in relacional_keywords if kw in text)
    geral_score = sum(1 for kw in geral_keywords if kw in text)
    
    # Conceitos híbridos/mistos: têm scores similares em múltiplas categorias
    scores = [pratica_score, relacional_score, geral_score]
    max_score = max(scores)
    
    # Se tem scores altos em múltiplas categorias OU score muito baixo em todas = Mista
    high_scores = sum(1 for s in scores if s > 1)
    if high_scores >= 2 or max_score == 0:
        return 3  # Mista
    
    # Categoriza pela maior pontuação
    if geral_score == max_score:
        return 0  # Geral
    elif relacional_score == max_score:
        return 1  # Relacional
    else:
        return 2  # Prática

def main():
    print("🎯 CATEGORIZAÇÃO SEMÂNTICA DE SUBCAMADAS")
    print("=" * 70)
    
    with open('assets/concepts.json', 'r', encoding='utf-8') as f:
        concepts = json.load(f)
    
    # Camadas para categorizar
    layers_to_process = ['epistemica', 'temporal', 'ecologica', 'etica']
    
    changes = []
    
    for layer in layers_to_process:
        layer_concepts = [c for c in concepts if c['layer'].startswith(layer)]
        
        print(f"\n📍 {layer.upper()} ({len(layer_concepts)} conceitos)")
        
        # Categoriza cada conceito
        categorized = {0: [], 1: [], 2: [], 3: []}
        
        for concept in layer_concepts:
            category = categorize_concept(concept, layer)
            categorized[category].append(concept)
            
            new_layer = f"{layer}-{category}"
            if concept['layer'] != new_layer:
                changes.append({
                    'name': concept['name'],
                    'old': concept['layer'],
                    'new': new_layer
                })
                concept['layer'] = new_layer
        
        # Mostra distribuição
        labels = {0: 'Geral', 1: 'Relacional', 2: 'Prática', 3: 'Mista'}
        for cat in range(4):
            count = len(categorized[cat])
            print(f"   {layer}-{cat} ({labels[cat]:11s}): {count:3d} conceitos")
            # Mostra alguns exemplos
            if count > 0:
                examples = [c['name'] for c in categorized[cat][:3]]
                print(f"      Ex: {', '.join(examples)}")
    
    # Salva
    with open('assets/concepts.json', 'w', encoding='utf-8') as f:
        json.dump(concepts, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ {len(changes)} conceitos recategorizados")
    print("=" * 70)

if __name__ == '__main__':
    main()
