#!/usr/bin/env python3
"""
Fix duplicate concepts and orphan references
"""
import json
from pathlib import Path

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    assets_dir = Path(__file__).parent.parent / 'assets'
    concepts_file = assets_dir / 'concepts.json'
    relations_file = assets_dir / 'relations.json'
    
    print("🔧 CORREÇÃO DE DUPLICATAS E REFERÊNCIAS ÓRFÃS")
    print("=" * 60)
    
    # Load data
    concepts = load_json(concepts_file)
    relations = load_json(relations_file)
    
    print(f"\n📚 Carregando dados:")
    print(f"   • {len(concepts)} conceitos")
    print(f"   • {len(relations)} relações")
    
    # Fix duplicates
    print(f"\n🔄 Corrigindo duplicatas:")
    
    # Remove "realismo-agencial" and keep "realismo agencial"
    concepts_filtered = []
    removed_ids = set()
    
    for concept in concepts:
        if concept['id'] == 'realismo-agencial':
            print(f"   🗑️  Removendo duplicata: {concept['id']}")
            removed_ids.add(concept['id'])
            # Merge connections into the kept one
            kept_concept = next(c for c in concepts if c['id'] == 'realismo agencial')
            for conn in concept['connections']:
                if conn not in kept_concept['connections']:
                    kept_concept['connections'].append(conn)
        else:
            concepts_filtered.append(concept)
    
    # Update all connections to point to the kept ID
    print(f"\n🔗 Atualizando conexões:")
    for concept in concepts_filtered:
        if 'realismo-agencial' in concept['connections']:
            idx = concept['connections'].index('realismo-agencial')
            concept['connections'][idx] = 'realismo agencial'
            print(f"   ✏️  {concept['id']}: realismo-agencial → realismo agencial")
    
    # Update relations to point to the kept ID
    relations_updated = []
    for rel in relations:
        updated = False
        if rel['from'] == 'realismo-agencial':
            rel['from'] = 'realismo agencial'
            updated = True
        if rel['to'] == 'realismo-agencial':
            rel['to'] = 'realismo agencial'
            updated = True
        
        # Skip if it's now a self-reference
        if rel['from'] == rel['to']:
            print(f"   🗑️  Removendo auto-relação: {rel['from']}")
            continue
            
        if updated:
            print(f"   ✏️  Atualizando relação: realismo-agencial → realismo agencial")
        
        relations_updated.append(rel)
    
    # Fix orphan reference: preensao → sentir
    print(f"\n🔗 Corrigindo referências órfãs:")
    
    # Check if 'preensao' or 'sentir' exist
    concept_ids = {c['id'] for c in concepts_filtered}
    
    # Remove 'sentir' from preensao's connections if sentir doesn't exist
    for concept in concepts_filtered:
        if concept['id'] == 'preensao' and 'sentir' in concept['connections']:
            if 'sentir' not in concept_ids:
                print(f"   🗑️  Removendo conexão órfã de preensao: sentir")
                concept['connections'].remove('sentir')
    
    # Remove relations to/from sentir if it doesn't exist
    orphan_fixed = False
    for rel in relations_updated[:]:
        if (rel['from'] == 'sentir' or rel['to'] == 'sentir') and 'sentir' not in concept_ids:
            print(f"   🗑️  Removendo relação órfã: {rel['from']} → {rel['to']}")
            relations_updated.remove(rel)
            orphan_fixed = True
    
    # Remove duplicates in relations
    print(f"\n🧹 Removendo relações duplicadas:")
    seen = set()
    relations_final = []
    duplicates_removed = 0
    
    for rel in relations_updated:
        key = (rel['from'], rel['to'], rel['name'])
        if key not in seen:
            seen.add(key)
            relations_final.append(rel)
        else:
            duplicates_removed += 1
    
    print(f"   🗑️  {duplicates_removed} duplicatas removidas")
    
    # Save
    print(f"\n💾 Salvando mudanças:")
    save_json(concepts_file, concepts_filtered)
    print(f"   ✅ Conceitos: {len(concepts_filtered)} (era {len(concepts)})")
    
    save_json(relations_file, relations_final)
    print(f"   ✅ Relações: {len(relations_final)} (era {len(relations)})")
    
    print("\n" + "=" * 60)
    print("✨ Correção concluída!")

if __name__ == '__main__':
    main()
