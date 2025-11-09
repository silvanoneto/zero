#!/usr/bin/env python3
"""
Script para corrigir relações quebradas após mesclas de conceitos
"""

import json
from pathlib import Path

# Caminhos
BASE_DIR = Path(__file__).parent.parent
CONCEPTS_FILE = BASE_DIR / 'assets' / 'concepts.json'
RELATIONS_FILE = BASE_DIR / 'assets' / 'relations.json'

# Mapeamento de IDs antigos para novos (baseado em mesclas anteriores)
ID_MAPPING = {
    'indígena': 'indigena',
    'rizoma': 'riz∅ma',
    'cosmopolítica': 'cosmopolitica',
    'memória coletiva': 'memoriacoletiva',
    'moeda comunitária': 'moedascomunitarias',
    'agência': 'agencia',
    'relacionalismo': 'relacionalidade',
    'memória': 'memoriacoletiva',
    'place-thought': 'placethought',
    'ocasiões de experiência': 'ocasioes',
}


def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def main():
    print("="*60)
    print("  CORREÇÃO DE RELAÇÕES QUEBRADAS")
    print("="*60)
    
    # Carregar dados
    concepts = load_json(CONCEPTS_FILE)
    relations = load_json(RELATIONS_FILE)
    
    # Criar set de IDs válidos
    valid_ids = set(c['id'] for c in concepts)
    
    print(f"\n📚 {len(concepts)} conceitos válidos")
    print(f"🔗 {len(relations)} relações totais\n")
    
    # Corrigir relações
    fixed_relations = []
    removed = 0
    updated = 0
    
    for rel in relations:
        from_id = rel['from']
        to_id = rel['to']
        
        # Mapear IDs antigos
        if from_id in ID_MAPPING:
            old_from = from_id
            from_id = ID_MAPPING[from_id]
            print(f"🔄 FROM: {old_from} → {from_id}")
            updated += 1
        
        if to_id in ID_MAPPING:
            old_to = to_id
            to_id = ID_MAPPING[to_id]
            print(f"🔄 TO: {old_to} → {to_id}")
            updated += 1
        
        # Verificar se IDs existem
        if from_id not in valid_ids:
            print(f"🗑️  Removendo (origem inválida): {from_id} → {to_id}")
            removed += 1
            continue
        
        if to_id not in valid_ids:
            print(f"🗑️  Removendo (destino inválido): {from_id} → {to_id}")
            removed += 1
            continue
        
        # Evitar auto-relações
        if from_id == to_id:
            print(f"🗑️  Removendo (auto-relação): {from_id}")
            removed += 1
            continue
        
        rel['from'] = from_id
        rel['to'] = to_id
        fixed_relations.append(rel)
    
    # Remover duplicatas
    unique_relations = []
    seen = set()
    duplicates = 0
    
    for rel in fixed_relations:
        key = (rel['from'], rel['to'])
        if key not in seen:
            seen.add(key)
            unique_relations.append(rel)
        else:
            duplicates += 1
    
    # Salvar
    save_json(RELATIONS_FILE, unique_relations)
    
    print(f"\n{'='*60}")
    print(f"✅ CORREÇÃO CONCLUÍDA")
    print(f"{'='*60}")
    print(f"  Relações originais:     {len(relations)}")
    print(f"  IDs atualizados:        {updated}")
    print(f"  Relações removidas:     {removed}")
    print(f"  Duplicatas removidas:   {duplicates}")
    print(f"  Relações finais:        {len(unique_relations)}")
    print(f"{'='*60}\n")


if __name__ == '__main__':
    main()
