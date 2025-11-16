#!/usr/bin/env python3
"""
Aplica novas relações propostas ao grafo, evitando duplicatas.
"""

import json
from collections import defaultdict

def main():
    # Carregar dados
    print("📂 Carregando dados...")
    with open('assets/relations.json', 'r', encoding='utf-8') as f:
        existing_relations = json.load(f)
    
    with open('assets/new_relations_proposals.json', 'r', encoding='utf-8') as f:
        proposals = json.load(f)
    
    with open('assets/concepts.json', 'r', encoding='utf-8') as f:
        concepts = json.load(f)
    
    # Criar índice de conceitos
    concept_ids = {c['id'] for c in concepts}
    
    # Criar índice de relações existentes (normalizado para detectar duplicatas)
    existing_pairs = set()
    for rel in existing_relations:
        pair = tuple(sorted([rel['from'], rel['to']]))
        existing_pairs.add(pair)
    
    print(f"   Relações existentes: {len(existing_relations)}")
    print(f"   Pares únicos existentes: {len(existing_pairs)}")
    print(f"   Propostas recebidas: {len(proposals)}")
    print()
    
    # Filtrar propostas válidas
    valid_proposals = []
    duplicates = 0
    invalid_ids = 0
    
    for prop in proposals:
        # Verificar se IDs existem
        if prop['from'] not in concept_ids or prop['to'] not in concept_ids:
            invalid_ids += 1
            continue
        
        # Verificar duplicata
        pair = tuple(sorted([prop['from'], prop['to']]))
        if pair in existing_pairs:
            duplicates += 1
            continue
        
        valid_proposals.append(prop)
        existing_pairs.add(pair)  # Adicionar para evitar duplicatas internas
    
    print(f"🔍 FILTRAGEM:")
    print(f"   ❌ Duplicatas detectadas: {duplicates}")
    print(f"   ❌ IDs inválidos: {invalid_ids}")
    print(f"   ✅ Propostas válidas: {len(valid_proposals)}")
    print()
    
    if not valid_proposals:
        print("⚠️  Nenhuma proposta válida para aplicar.")
        return
    
    # Mostrar preview
    print("📋 PREVIEW DAS PRIMEIRAS 10 RELAÇÕES:")
    for i, rel in enumerate(valid_proposals[:10], 1):
        print(f"   {i:2d}. {rel['from']:30s} → {rel['name']:20s} → {rel['to']}")
    
    if len(valid_proposals) > 10:
        print(f"   ... e mais {len(valid_proposals) - 10} relações")
    print()
    
    # Confirmar aplicação
    response = input(f"Aplicar {len(valid_proposals)} novas relações? [s/N]: ").strip().lower()
    
    if response != 's':
        print("❌ Operação cancelada.")
        return
    
    # Mesclar relações
    all_relations = existing_relations + valid_proposals
    
    # Salvar backup
    import shutil
    from datetime import datetime
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = f'assets/relations.json.backup_{timestamp}'
    shutil.copy('assets/relations.json', backup_path)
    print(f"💾 Backup criado: {backup_path}")
    
    # Salvar arquivo atualizado
    with open('assets/relations.json', 'w', encoding='utf-8') as f:
        json.dump(all_relations, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ SUCESSO!")
    print(f"   Relações totais: {len(existing_relations)} → {len(all_relations)}")
    print(f"   Incremento: +{len(valid_proposals)} ({(len(valid_proposals)/len(existing_relations)*100):.1f}%)")
    print()
    print(f"   Execute 'make ontology' para validar o grafo atualizado.")

if __name__ == '__main__':
    main()
