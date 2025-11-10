#!/usr/bin/env python3
"""
Consolida conceitos redundantes na ontologia.
Estratégia: fundir duplicatas mantendo o conceito mais desenvolvido
e transferir todas as relações para a versão consolidada.
"""

import json
from pathlib import Path

# Redundâncias identificadas: (manter, remover, motivo)
REDUNDANCIES = [
    {
        "keep": "madhyamaka",
        "remove": "madhyamika",
        "reason": "Madhyamika é variante ortográfica de madhyamaka - mesma escola budista"
    },
    {
        "keep": "intracao",
        "remove": "intra-ação",
        "reason": "Conceito idêntico com dupla entrada - intracao tem descrição mais completa"
    },
    {
        "keep": "recursao",
        "remove": "recursão",
        "reason": "Recursão genérica subsumida por 'Recursão Sem Fundamento' (epistemológica)"
    },
    {
        "keep": "hibridação",
        "remove": "hibridez",
        "reason": "Hibridez é versão abstrata/genérica - hibridação tem contexto cultural específico (García Canclini)"
    },
    {
        "keep": "escala",
        "remove": "escala",  # Ambos têm id "escala" - BUG!
        "reason": "DUPLICATA DE ID - dois conceitos com mesmo ID 'escala' (ontológica vs política)",
        "action": "RENOMEAR segundo para 'politica-escala'"
    },
    {
        "keep": "economia-solidaria",
        "remove": "economia solidária",
        "reason": "DUPLICATA CRÍTICA - dois conceitos 'Economia Solidária' (economia-solidaria mais desenvolvido com 7 conexões vs 4)"
    }
]

def load_json(filepath):
    """Carrega JSON com encoding UTF-8"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filepath, data):
    """Salva JSON com indentação e UTF-8"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def consolidate_concepts(concepts_path, relations_path):
    """Consolida conceitos redundantes"""
    
    concepts = load_json(concepts_path)
    relations = load_json(relations_path)
    
    print(f"📊 Estado inicial: {len(concepts)} conceitos, {len(relations)} relações\n")
    
    # 1. Identificar e resolver duplicata de ID "escala"
    escala_concepts = [c for c in concepts if c['id'] == 'escala']
    if len(escala_concepts) == 2:
        print("⚠️  DUPLICATA CRÍTICA: 2 conceitos com id='escala'")
        for i, c in enumerate(escala_concepts):
            print(f"   [{i}] layer={c['layer']}, name={c['name']}")
        
        # Renomear o político para 'politica-escala'
        for c in concepts:
            if c['id'] == 'escala' and c['layer'] == 'politica':
                old_id = c['id']
                c['id'] = 'politica-escala'
                print(f"   ✓ Renomeado: 'escala' (politica) → 'politica-escala'")
                
                # Atualizar relações
                for r in relations:
                    if r['from'] == old_id and r.get('from_layer') == 'politica':
                        r['from'] = 'politica-escala'
                    if r['to'] == old_id and r.get('to_layer') == 'politica':
                        r['to'] = 'politica-escala'
                
                # Atualizar conexões em outros conceitos
                for other in concepts:
                    if 'connections' in other and old_id in other['connections']:
                        # Só atualizar se for referência ao conceito político
                        # (heurística: se tem outras refs políticas)
                        if other['layer'] in ['politica', 'pratica']:
                            idx = other['connections'].index(old_id)
                            other['connections'][idx] = 'politica-escala'
        print()
    
    # 2. Processar redundâncias
    removed_count = 0
    updated_relations = 0
    
    for redundancy in REDUNDANCIES:
        keep_id = redundancy['keep']
        remove_id = redundancy['remove']
        reason = redundancy['reason']
        
        # Pular a duplicata de escala (já resolvida)
        if 'DUPLICATA DE ID' in reason:
            continue
        
        print(f"🔄 Consolidando: {remove_id} → {keep_id}")
        print(f"   Motivo: {reason}")
        
        # Verificar se ambos existem
        keep_concept = next((c for c in concepts if c['id'] == keep_id), None)
        remove_concept = next((c for c in concepts if c['id'] == remove_id), None)
        
        if not keep_concept:
            print(f"   ⚠️  Conceito '{keep_id}' não encontrado - pulando")
            continue
        if not remove_concept:
            print(f"   ⚠️  Conceito '{remove_id}' não encontrado - pulando")
            continue
        
        # Transferir conexões únicas
        keep_connections = set(keep_concept.get('connections', []))
        remove_connections = set(remove_concept.get('connections', []))
        new_connections = remove_connections - keep_connections - {remove_id, keep_id}
        
        if new_connections:
            keep_concept['connections'].extend(sorted(new_connections))
            print(f"   + {len(new_connections)} conexões transferidas: {', '.join(new_connections)}")
        
        # Atualizar todas as relações que referenciam o conceito removido
        for relation in relations:
            if relation['from'] == remove_id:
                relation['from'] = keep_id
                updated_relations += 1
            if relation['to'] == remove_id:
                relation['to'] = keep_id
                updated_relations += 1
        
        # Atualizar referências em connections de outros conceitos
        for concept in concepts:
            if concept['id'] != remove_id and 'connections' in concept:
                if remove_id in concept['connections']:
                    idx = concept['connections'].index(remove_id)
                    concept['connections'][idx] = keep_id
                    print(f"   ↪ Atualizada referência em '{concept['id']}'")
        
        # Remover conceito redundante
        concepts = [c for c in concepts if c['id'] != remove_id]
        removed_count += 1
        print(f"   ✓ Conceito '{remove_id}' removido\n")
    
    # 3. Remover duplicatas em connections (pós-consolidação)
    for concept in concepts:
        if 'connections' in concept:
            original_len = len(concept['connections'])
            concept['connections'] = sorted(list(set(concept['connections'])))
            if len(concept['connections']) < original_len:
                print(f"   🔧 '{concept['id']}': {original_len - len(concept['connections'])} duplicatas removidas")
    
    # 4. Remover relações duplicadas
    seen_relations = set()
    unique_relations = []
    duplicates_removed = 0
    
    for rel in relations:
        key = (rel['from'], rel['to'], rel['name'])
        if key not in seen_relations:
            seen_relations.add(key)
            unique_relations.append(rel)
        else:
            duplicates_removed += 1
    
    if duplicates_removed > 0:
        print(f"\n🔧 {duplicates_removed} relações duplicadas removidas")
    
    # Salvar
    save_json(concepts_path, concepts)
    save_json(relations_path, unique_relations)
    
    print(f"\n✅ Consolidação completa:")
    print(f"   Conceitos: {len(load_json(concepts_path))} ({len(concepts)} → {len(concepts) - removed_count} = -{removed_count})")
    print(f"   Relações: {len(unique_relations)} (atualizada {updated_relations} referências, -{duplicates_removed} duplicatas)")
    
    return {
        'removed_concepts': removed_count,
        'updated_relations': updated_relations,
        'removed_duplicates': duplicates_removed
    }

if __name__ == '__main__':
    base_path = Path(__file__).parent.parent / 'assets'
    concepts_path = base_path / 'concepts.json'
    relations_path = base_path / 'relations.json'
    
    print("=" * 60)
    print("CONSOLIDAÇÃO DE REDUNDÂNCIAS CONCEITUAIS")
    print("=" * 60 + "\n")
    
    result = consolidate_concepts(concepts_path, relations_path)
    
    print("\n" + "=" * 60)
