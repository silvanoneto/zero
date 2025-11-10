#!/usr/bin/env python3
"""
Diversifica tipos de relações para aumentar riqueza semântica do rizoma.
Substitui relações genéricas por variações contextuais.
"""

import json
import re
from collections import defaultdict

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def diversify_emancipa(relation, index):
    """Diversifica 'emancipa-se via' baseado em contexto."""
    desc = relation['description'].lower()
    from_id = relation['from']
    to_id = relation['to']
    
    # Contextos de superação/transcendência
    if any(word in desc for word in ['transcende', 'supera', 'ultrapassa', 'vai além']):
        return 'transcende via'
    
    # Contextos de ruptura/quebra
    if any(word in desc for word in ['rompe', 'quebra', 'desconstrói', 'desfaz', 'quebrar']):
        return 'rompe com'
    
    # Contextos de resistência ativa
    if any(word in desc for word in ['resiste', 'luta', 'combate', 'enfrenta']):
        return 'libera-se através de'
    
    # Contextos de desativação/neutralização
    if any(word in desc for word in ['desativa', 'neutraliza', 'dissolve']):
        return 'desativa através de'
    
    # Contextos de abertura/possibilidade
    if any(word in desc for word in ['abre', 'possibilita', 'permite', 'habilita']):
        return 'liberta-se via'
    
    # Contextos ontológicos profundos - reconstitui
    if any(word in from_id for word in ['vulnerabilidade', 'precariedade', 'despossessao']):
        return 'reconstitui-se por'
    
    # Contextos éticos
    if any(word in to_id for word in ['cuidado', 'justica', 'etica', 'responsabilidade']):
        return 'se afirma através de'
    
    # Contextos políticos de transformação
    if any(word in to_id for word in ['autonomia', 'commons', 'decrescimento', 'cooperativas']):
        return 'se transforma via'
    
    # MUDANÇA: Distribuição circular para TODOS os casos restantes
    options = [
        'liberta-se por',
        'autonomiza-se via',
        'se desprende através de',
        'transcende por meio de',
        'se emancipa em'
    ]
    return options[index % len(options)]

def diversify_compoe(relation, index):
    """Diversifica 'compõe' baseado em contexto ontológico."""
    desc = relation['description'].lower()
    from_id = relation['from']
    to_id = relation['to']
    
    # Contextos de co-constituição mútua
    if any(word in desc for word in ['mutuamente', 'reciprocamente', 'co-']):
        return 'co-constitui'
    
    # Contextos de articulação/ligação
    if any(word in desc for word in ['articula', 'conecta', 'liga', 'une']):
        return 'articula-se com'
    
    # Contextos de agência/ação
    if any(word in desc for word in ['age', 'atua', 'opera', 'funciona']):
        return 'agencia através de'
    
    # Contextos de tecelagem/entrelaçamento
    if any(word in desc for word in ['tece', 'entrelaça', 'emaranha', 'entretece']):
        return 'tece com'
    
    # Contextos de integração/síntese
    if any(word in desc for word in ['integra', 'sintetiza', 'incorpora', 'inclui']):
        return 'integra'
    
    # Contextos relacionais específicos - fundamento
    if 'ontologia' in from_id or 'processo' in from_id:
        return 'fundamenta-se em'
    
    # Contextos ecológicos/simbióticos
    if any(word in to_id for word in ['holobionte', 'simbiose', 'micorrizas', 'ecologia']):
        return 'simbiosa com'
    
    # Contextos processuais
    if any(word in from_id for word in ['devir', 'processo', 'ocasioes']):
        return 'desdobra-se em'
    
    # MUDANÇA: Distribuição circular para TODOS os casos restantes
    options = [
        'compõe-se com',
        'estrutura-se através de',
        'constrói-se com',
        'forma-se por',
        'se organiza em'
    ]
    return options[index % len(options)]

def diversify_possibilita(relation, index):
    """Diversifica 'possibilita' para evitar monotonia."""
    desc = relation['description'].lower()
    
    # Contextos de habilitação
    if any(word in desc for word in ['habilita', 'capacita', 'permite que']):
        return 'habilita'
    
    # Contextos de abertura
    if any(word in desc for word in ['abre', 'inaugura', 'inicia']):
        return 'abre caminho para'
    
    # Contextos de condição
    if any(word in desc for word in ['condição', 'condicionante', 'necessário']):
        return 'condiciona'
    
    # Contextos de potencialização
    if any(word in desc for word in ['potencializa', 'amplifica', 'intensifica']):
        return 'potencializa'
    
    # Distribuição circular
    options = [
        'viabiliza',
        'torna possível',
        'faculta',
        'propicia'
    ]
    return options[index % len(options)]

def main():
    print("🔄 Diversificando tipos de relações...")
    
    # Carrega dados
    relations = load_json('assets/relations.json')
    
    # Contadores
    changes = defaultdict(int)
    
    # Processa relações
    for i, rel in enumerate(relations):
        original = rel['name']
        
        if rel['name'] in ['emancipa-se via', 'emancipa-se por meio de']:
            rel['name'] = diversify_emancipa(rel, i)
            if rel['name'] != original:
                changes['emancipa-se via'] += 1
        
        elif rel['name'] in ['compõe', 'co-compõe']:
            rel['name'] = diversify_compoe(rel, i)
            if rel['name'] != original:
                changes['compõe'] += 1
        
        elif rel['name'] in ['possibilita', 'viabiliza']:
            rel['name'] = diversify_possibilita(rel, i)
            if rel['name'] != original:
                changes['possibilita'] += 1
    
    # Salva resultado
    save_json('assets/relations.json', relations)
    
    print(f"\n✅ Diversificação concluída:")
    for tipo, count in sorted(changes.items(), key=lambda x: x[1], reverse=True):
        print(f"   • {tipo}: {count} variações criadas")
    
    # Estatísticas finais
    type_counts = defaultdict(int)
    for rel in relations:
        type_counts[rel['name']] += 1
    
    print(f"\n📊 Top 10 tipos de relações após diversificação:")
    for tipo, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"   • {tipo}: {count}")

if __name__ == '__main__':
    main()
