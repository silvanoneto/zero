#!/usr/bin/env python3
"""
Calcula conexões a partir de relations.json
Usado pelos comandos do Makefile para estatísticas
"""
import json
import sys
from collections import defaultdict

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def calculate_connections():
    """Calcula conexões bidirecionais a partir de relations.json"""
    concepts = load_json('assets/concepts.json')
    relations = load_json('assets/relations.json')
    
    # Criar mapa de conexões
    connections = defaultdict(set)
    
    # Processar relações (bidirecionais)
    for rel in relations:
        from_id = rel['from']
        to_id = rel['to']
        connections[from_id].add(to_id)
        connections[to_id].add(from_id)
    
    # Criar dicionário de resultados
    results = {}
    for concept in concepts:
        concept_id = concept['id']
        results[concept_id] = {
            'id': concept_id,
            'name': concept['name'],
            'layer': concept.get('layer', 'undefined'),
            'connection_count': len(connections.get(concept_id, set()))
        }
    
    return results

def get_stats():
    """Retorna estatísticas de conectividade"""
    conn_data = calculate_connections()
    
    if not conn_data:
        return {
            'avg': 0,
            'max_concept': 'N/A',
            'max_count': 0,
            'min_concept': 'N/A',
            'min_count': 0
        }
    
    counts = [data['connection_count'] for data in conn_data.values()]
    avg = sum(counts) / len(counts) if counts else 0
    
    max_item = max(conn_data.values(), key=lambda x: x['connection_count'])
    min_item = min(conn_data.values(), key=lambda x: x['connection_count'])
    
    return {
        'avg': int(avg),
        'max_concept': max_item['name'],
        'max_count': max_item['connection_count'],
        'min_concept': min_item['name'],
        'min_count': min_item['connection_count']
    }

def get_top_hubs(limit=10):
    """Retorna os conceitos mais conectados"""
    conn_data = calculate_connections()
    sorted_data = sorted(conn_data.values(), key=lambda x: x['connection_count'], reverse=True)
    return sorted_data[:limit]

def get_underconnected(threshold=3):
    """Retorna conceitos sub-conectados"""
    conn_data = calculate_connections()
    if threshold == 0:
        # Para threshold 0, retornar apenas os exatamente com 0 conexões
        return [data for data in conn_data.values() if data['connection_count'] == 0]
    return [data for data in conn_data.values() if data['connection_count'] <= threshold]

if __name__ == '__main__':
    command = sys.argv[1] if len(sys.argv) > 1 else 'stats'
    
    if command == 'stats':
        stats = get_stats()
        print(f"{stats['avg']}")
        
    elif command == 'max':
        stats = get_stats()
        print(f"{stats['max_concept']} ({stats['max_count']} conexões)")
        
    elif command == 'min':
        stats = get_stats()
        print(f"{stats['min_concept']} ({stats['min_count']} conexões)")
        
    elif command == 'hubs':
        limit = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        hubs = get_top_hubs(limit)
        for i, hub in enumerate(hubs, 1):
            print(f"{i:2d}. {hub['name']:<40s} {hub['connection_count']:2d} conexões")
            
    elif command == 'underconnected':
        threshold = int(sys.argv[2]) if len(sys.argv) > 2 else 3
        under = get_underconnected(threshold)
        print(f"{len(under)}")
        
    elif command == 'distribution':
        conn_data = calculate_connections()
        counts = {}
        for data in conn_data.values():
            count = data['connection_count']
            counts[count] = counts.get(count, 0) + 1
        
        for count in sorted(counts.keys()):
            print(f"{count:3d} conexões: {counts[count]:3d} conceitos")
