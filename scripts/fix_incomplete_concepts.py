#!/usr/bin/env python3
"""
Fix incomplete concepts in concepts.json:
1. Rename 'category' to 'layer'
2. Add minimal descriptions for concepts without them
3. Add empty connections array if missing
"""

import json
import sys
from pathlib import Path

def fix_concepts(concepts_path: Path):
    """Fix incomplete concepts."""
    
    # Load concepts
    with open(concepts_path, 'r', encoding='utf-8') as f:
        concepts = json.load(f)
    
    fixed_count = 0
    
    for concept in concepts:
        changed = False
        
        # Fix 1: Rename 'category' to 'layer'
        if 'category' in concept and 'layer' not in concept:
            concept['layer'] = concept.pop('category')
            changed = True
        
        # Fix 2: Add minimal description if missing or too short
        if 'description' not in concept:
            concept['description'] = f"Conceito relacional: {concept['name']}. [Descrição a ser expandida]"
            changed = True
        elif len(concept['description']) < 20:
            concept['description'] = f"{concept['description']} - Conceito na camada {concept.get('layer', 'não especificada')}. [Descrição a ser expandida]"
            changed = True
        
        # Fix 3: Add empty connections if missing
        if 'connections' not in concept:
            concept['connections'] = []
            changed = True
        
        if changed:
            fixed_count += 1
    
    # Save fixed concepts
    with open(concepts_path, 'w', encoding='utf-8') as f:
        json.dump(concepts, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Fixed {fixed_count} concepts")
    return fixed_count

if __name__ == '__main__':
    concepts_path = Path(__file__).parent.parent / 'assets' / 'concepts.json'
    
    if not concepts_path.exists():
        print(f"❌ Concepts file not found: {concepts_path}")
        sys.exit(1)
    
    print(f"📂 Loading concepts from: {concepts_path}")
    fixed = fix_concepts(concepts_path)
    
    if fixed > 0:
        print(f"✨ Successfully fixed {fixed} concepts!")
    else:
        print("✅ No fixes needed - all concepts are complete")
