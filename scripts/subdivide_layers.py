#!/usr/bin/env python3
"""
Subdivide camadas grandes em subcamadas (variações cromáticas)
SEM HIERARQUIA - apenas multiplicidade horizontal com tons da mesma cor.

Exemplo: 
- ontologica → ontologica-1, ontologica-2, ontologica-3 (azul claro, azul médio, azul escuro)
- Todas com mesma importância, apenas variações temáticas
"""

import json
from collections import defaultdict

def load_data():
    with open('assets/concepts.json', 'r', encoding='utf-8') as f:
        concepts = json.load(f)
    return concepts

def save_data(concepts):
    with open('assets/concepts.json', 'w', encoding='utf-8') as f:
        json.dump(concepts, f, ensure_ascii=False, indent=2)

def analyze_layer_themes(concepts_in_layer):
    """
    Identifica temas/clusters semânticos dentro de uma camada
    baseado em palavras-chave nas descrições
    """
    # Palavras-chave por tema (expandir conforme necessário)
    theme_keywords = {
        'materialidade': ['material', 'físico', 'corpo', 'matéria', 'concreto', 'tangível'],
        'relacionalidade': ['relação', 'relacional', 'conexão', 'rede', 'vínculo', 'interação'],
        'processualidade': ['processo', 'devir', 'transformação', 'dinâmica', 'fluxo', 'movimento'],
        'temporalidade': ['tempo', 'temporal', 'duração', 'presente', 'passado', 'futuro', 'memória'],
        'espacialidade': ['espaço', 'espacial', 'lugar', 'território', 'localização'],
        'epistemologia': ['conhecimento', 'saber', 'episteme', 'ciência', 'racionalidade'],
        'ética': ['ético', 'ética', 'moral', 'valor', 'responsabilidade', 'cuidado'],
        'política': ['político', 'política', 'poder', 'democracia', 'justiça', 'estado'],
        'prática': ['prática', 'ação', 'fazer', 'pedagógica', 'educação', 'ensino'],
        'ontologia': ['ser', 'existência', 'ontologia', 'realidade', 'essência'],
        'ecologia': ['ecológico', 'ambiente', 'natureza', 'sustentável', 'ecossistema'],
        'fundamento': ['fundação', 'base', 'origem', 'princípio', 'fundamento']
    }
    
    # Conta score de cada tema para cada conceito
    concept_themes = []
    for concept in concepts_in_layer:
        desc_lower = concept['description'].lower()
        theme_scores = {}
        
        for theme, keywords in theme_keywords.items():
            score = sum(1 for kw in keywords if kw in desc_lower)
            if score > 0:
                theme_scores[theme] = score
        
        # Pega os 2 temas principais
        top_themes = sorted(theme_scores.items(), key=lambda x: -x[1])[:2]
        concept_themes.append({
            'concept': concept,
            'themes': [t[0] for t in top_themes] if top_themes else ['geral']
        })
    
    return concept_themes

def subdivide_large_layers(threshold=80):
    """
    Subdivide camadas grandes em 2-3 subcamadas baseado em clustering semântico
    Mantém estrutura horizontal (sem hierarquia)
    """
    
    print("🎨 SUBDIVISÃO DE CAMADAS EM VARIAÇÕES CROMÁTICAS")
    print("=" * 70)
    print("Abordagem: multiplicidade horizontal, sem hierarquia\n")
    
    concepts = load_data()
    
    # Agrupa por camada
    by_layer = defaultdict(list)
    for c in concepts:
        by_layer[c['layer']].append(c)
    
    # Analisa camadas grandes
    print("📊 Camadas atuais:")
    for layer, concepts_list in sorted(by_layer.items(), key=lambda x: -len(x[1])):
        count = len(concepts_list)
        marker = "🔴" if count > threshold else "  "
        print(f"   {marker} {layer:15s} {count:3d} conceitos")
    
    print(f"\n🎯 Subdividindo camadas com >{threshold} conceitos...\n")
    
    changes = []
    
    for layer, concepts_list in by_layer.items():
        if len(concepts_list) <= threshold:
            continue
        
        print(f"\n📍 {layer.upper()} ({len(concepts_list)} conceitos)")
        
        # Analisa temas
        concept_themes = analyze_layer_themes(concepts_list)
        
        # Agrupa por tema principal
        theme_groups = defaultdict(list)
        for ct in concept_themes:
            main_theme = ct['themes'][0] if ct['themes'] else 'geral'
            theme_groups[main_theme].append(ct['concept'])
        
        # Pega os 2-3 temas mais comuns
        top_themes = sorted(theme_groups.items(), key=lambda x: -len(x[1]))[:3]
        
        print(f"   Temas identificados:")
        for theme, group in top_themes:
            print(f"      • {theme:20s} {len(group):3d} conceitos")
        
        # Se temos divisões claras, cria subcamadas
        if len(top_themes) >= 2 and len(top_themes[0][1]) > 20:
            print(f"   ✓ Criando subcamadas:")
            
            for i, (theme, group) in enumerate(top_themes):
                sublayer = f"{layer}-{i+1}"
                print(f"      {sublayer:20s} ({theme}): {len(group)} conceitos")
                
                for concept in group:
                    changes.append({
                        'concept': concept['name'],
                        'old_layer': layer,
                        'new_layer': sublayer,
                        'theme': theme
                    })
                    concept['layer'] = sublayer
            
            # Conceitos restantes ficam em layer-0 (mistos)
            remaining = [c for c in concepts_list if c['layer'] == layer]
            if remaining:
                sublayer = f"{layer}-0"
                print(f"      {sublayer:20s} (mistos): {len(remaining)} conceitos")
                for concept in remaining:
                    changes.append({
                        'concept': concept['name'],
                        'old_layer': layer,
                        'new_layer': sublayer,
                        'theme': 'misto'
                    })
                    concept['layer'] = sublayer
        else:
            print(f"   ⚠ Temas muito distribuídos, mantendo camada única")
    
    if changes:
        save_data(concepts)
        
        print(f"\n\n✅ RESULTADO:")
        print(f"   Total de conceitos reclassificados: {len(changes)}")
        
        # Nova distribuição
        new_by_layer = defaultdict(int)
        for c in concepts:
            new_by_layer[c['layer']] += 1
        
        print(f"\n📊 Nova distribuição ({len(new_by_layer)} camadas):")
        for layer in sorted(new_by_layer.keys()):
            count = new_by_layer[layer]
            bar = '█' * (count // 5)
            print(f"   {layer:20s} {count:3d} {bar}")
        
        # Salva log de mudanças
        with open('docs/SUBDIVISAO_CAMADAS.md', 'w', encoding='utf-8') as f:
            f.write("# Subdivisão de Camadas\n\n")
            f.write("Variações cromáticas horizontais (sem hierarquia)\n\n")
            f.write("## Mudanças\n\n")
            for change in changes:
                f.write(f"- **{change['concept']}**: {change['old_layer']} → {change['new_layer']} ({change['theme']})\n")
        
        print(f"\n📝 Log salvo em docs/SUBDIVISAO_CAMADAS.md")
    else:
        print(f"\n⚠ Nenhuma camada necessita subdivisão")
    
    print("\n" + "=" * 70)

if __name__ == '__main__':
    subdivide_large_layers(threshold=80)
