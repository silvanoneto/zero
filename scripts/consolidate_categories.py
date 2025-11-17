#!/usr/bin/env python3
"""
Consolida categorias redundantes ou sobrepostas em referencias.json
"""

import json
from pathlib import Path

# Mapeamento de consolidação
CONSOLIDATION_MAP = {
    # Epistemológicas
    'epistemologia': 'epistemológica',
    'epistemica': 'epistemológica',
    'onto-epistemológica': 'epistemológica',
    
    # Temporal
    'tempo': 'temporal',
    'temporal-política': 'temporal',
    
    # Ecológicas
    'ecologia': 'ecológica',
    'agroecologia': 'ecológica',
    'permacultura': 'ecológica',
    'regeneração': 'ecológica',
    'biomimética': 'ecológica',
    'ciclos-biogeoquímicos': 'ecológica',
    'sucessão-ecológica': 'ecológica',
    'mutualismo': 'ecológica',
    
    # Economia
    'economia-solidária': 'economia',
    'economia-diversa': 'economia',
    'commons': 'economia',
    'decrescimento': 'economia',
    
    # Política
    'governança': 'política',
    'poder': 'política',
    'sujeito-político': 'política',
    'resistência': 'política',
    'decolonialidade': 'política',
    
    # Justiça/Direitos
    'direitos-da-natureza': 'ética',
    'justiça-climática': 'ética',
    'feminismo': 'ética',
    'neurodiversidade': 'ética',
    
    # Tecnologia
    'tecnologia-digital': 'tecnologia',
    'infraestrutura': 'tecnologia',
    'filosofia-tecnologia': 'tecnologia',
    
    # Sistemas/Fundamentos
    'sistemas': 'fundamentos',
    'recursão': 'fundamentos',
    'biologia': 'fundamentos',
    
    # Místico/Espiritual
    'misticismo-islâmico': 'vazio',
    'misticismo-cristão': 'vazio',
    'budismo-matemática': 'vazio',
    
    # Outros
    'metabolismo': 'ecológica',
    'soberania-alimentar': 'praxis',
}

def consolidate_categories():
    """Consolida categorias em referencias.json"""
    
    # Carrega dados
    refs_path = Path(__file__).parent.parent / 'assets' / 'referencias.json'
    with open(refs_path, 'r', encoding='utf-8') as f:
        referencias = json.load(f)
    
    # Contadores
    changes = {}
    
    # Aplica consolidação
    for ref in referencias:
        old_cat = ref.get('categoria', '')
        if old_cat in CONSOLIDATION_MAP:
            new_cat = CONSOLIDATION_MAP[old_cat]
            ref['categoria'] = new_cat
            
            # Contabiliza mudança
            key = f'{old_cat} → {new_cat}'
            changes[key] = changes.get(key, 0) + 1
    
    # Salva resultado
    with open(refs_path, 'w', encoding='utf-8') as f:
        json.dump(referencias, f, ensure_ascii=False, indent=2)
    
    # Mostra resumo
    print("Consolidação de categorias concluída!\n")
    print("Mudanças realizadas:")
    for change, count in sorted(changes.items()):
        print(f"  {count:2d}x  {change}")
    
    # Mostra distribuição final
    from collections import Counter
    final_cats = Counter(ref.get('categoria', 'sem categoria') for ref in referencias)
    
    print("\n\nDistribuição final:")
    for cat, count in sorted(final_cats.items(), key=lambda x: -x[1]):
        print(f"  {count:3d} - {cat}")

if __name__ == '__main__':
    consolidate_categories()
