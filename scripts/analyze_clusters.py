#!/usr/bin/env python3
"""
Análise e demarcação de clusters na ontologia CRIOS
Identifica comunidades densas para visualização no rizoma 3D
"""

import json
from collections import defaultdict, Counter
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
CONCEPTS_FILE = BASE_DIR / 'assets' / 'concepts.json'
RELATIONS_FILE = BASE_DIR / 'assets' / 'relations.json'


def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def build_adjacency_graph(concepts, relations):
    """Constrói grafo de adjacência"""
    graph = defaultdict(set)
    
    for rel in relations:
        graph[rel['from']].add(rel['to'])
        graph[rel['to']].add(rel['from'])
    
    return graph


def calculate_clustering_coefficient(concept_id, graph):
    """Calcula coeficiente de agrupamento local"""
    neighbors = graph[concept_id]
    k = len(neighbors)
    
    if k < 2:
        return 0.0
    
    # Conta conexões entre vizinhos
    connections = 0
    for n1 in neighbors:
        for n2 in neighbors:
            if n1 != n2 and n2 in graph[n1]:
                connections += 1
    
    # Divide por 2 (bidirecional) e normaliza
    return connections / (k * (k - 1))


def detect_communities_by_layer(concepts, graph):
    """Detecta comunidades densas por camada ontológica"""
    layer_communities = defaultdict(list)
    
    for concept in concepts:
        layer = concept.get('layer', 'unknown')
        concept_id = concept['id']
        
        # Calcula densidade local
        neighbors = graph[concept_id]
        same_layer_neighbors = [
            c for c in concepts 
            if c['id'] in neighbors and c.get('layer') == layer
        ]
        
        # Métricas de cluster
        degree = len(neighbors)
        same_layer_degree = len(same_layer_neighbors)
        clustering_coef = calculate_clustering_coefficient(concept_id, graph)
        
        cluster_info = {
            'id': concept_id,
            'name': concept['name'],
            'layer': layer,
            'degree': degree,
            'same_layer_degree': same_layer_degree,
            'clustering_coefficient': clustering_coef,
            'cluster_score': clustering_coef * degree  # Score composto
        }
        
        layer_communities[layer].append(cluster_info)
    
    return layer_communities


def identify_hub_clusters(communities, min_cluster_size=5):
    """Identifica clusters densos (hubs) em cada camada"""
    hub_clusters = {}
    
    for layer, members in communities.items():
        # Ordena por cluster score
        sorted_members = sorted(members, key=lambda x: -x['cluster_score'])
        
        # Identifica hubs (top 20% ou min 5)
        hub_count = max(min_cluster_size, len(members) // 5)
        hubs = sorted_members[:hub_count]
        
        # Calcula estatísticas da camada
        degrees = [m['degree'] for m in members]
        clustering_coefs = [m['clustering_coefficient'] for m in members]
        
        hub_clusters[layer] = {
            'hubs': hubs,
            'avg_degree': sum(degrees) / len(degrees),
            'avg_clustering': sum(clustering_coefs) / len(clustering_coefs),
            'total_concepts': len(members),
            'density': sum(degrees) / (len(members) * (len(members) - 1)) if len(members) > 1 else 0
        }
    
    return hub_clusters


def detect_cross_layer_bridges(concepts, graph):
    """Identifica conceitos-ponte entre camadas"""
    bridges = []
    
    for concept in concepts:
        concept_id = concept['id']
        layer = concept.get('layer', 'unknown')
        neighbors = graph[concept_id]
        
        # Conta conexões por camada
        layer_connections = defaultdict(int)
        for neighbor_id in neighbors:
            neighbor = next((c for c in concepts if c['id'] == neighbor_id), None)
            if neighbor:
                neighbor_layer = neighbor.get('layer', 'unknown')
                layer_connections[neighbor_layer] += 1
        
        # É ponte se conecta significativamente (>30%) com outras camadas
        total_neighbors = len(neighbors)
        other_layer_connections = sum(
            count for l, count in layer_connections.items() if l != layer
        )
        
        if total_neighbors > 0:
            bridge_ratio = other_layer_connections / total_neighbors
            
            if bridge_ratio > 0.3:
                bridges.append({
                    'id': concept_id,
                    'name': concept['name'],
                    'layer': layer,
                    'bridge_ratio': bridge_ratio,
                    'connections_by_layer': dict(layer_connections),
                    'total_connections': total_neighbors
                })
    
    return sorted(bridges, key=lambda x: -x['bridge_ratio'])


def generate_cluster_metadata(concepts, relations):
    """Gera metadados de cluster para visualização"""
    print("🔍 ANÁLISE DE CLUSTERS NA ONTOLOGIA CRIOS")
    print("=" * 70)
    
    # Constrói grafo
    print("\n📊 Construindo grafo de adjacência...")
    graph = build_adjacency_graph(concepts, relations)
    print(f"   • {len(concepts)} nós")
    print(f"   • {len(relations)} arestas")
    
    # Detecta comunidades por camada
    print("\n🎯 Detectando comunidades por camada...")
    communities = detect_communities_by_layer(concepts, graph)
    hub_clusters = identify_hub_clusters(communities)
    
    print(f"\n📊 CLUSTERS POR CAMADA:")
    for layer in sorted(hub_clusters.keys()):
        info = hub_clusters[layer]
        print(f"\n   {layer.upper()}:")
        print(f"      Conceitos: {info['total_concepts']}")
        print(f"      Densidade: {info['density']:.3f}")
        print(f"      Grau médio: {info['avg_degree']:.1f}")
        print(f"      Clustering médio: {info['avg_clustering']:.3f}")
        print(f"      Top 3 hubs:")
        for hub in info['hubs'][:3]:
            print(f"         • {hub['name']} (score: {hub['cluster_score']:.2f})")
    
    # Detecta pontes entre camadas
    print(f"\n🌉 Detectando pontes entre camadas...")
    bridges = detect_cross_layer_bridges(concepts, graph)
    
    print(f"\n   Total de pontes: {len(bridges)}")
    print(f"   Top 10 conceitos-ponte:")
    for bridge in bridges[:10]:
        print(f"      • {bridge['name']:40s} ({bridge['layer']}, {bridge['bridge_ratio']*100:.1f}% cross-layer)")
    
    # Prepara metadados para export
    cluster_metadata = {
        'layer_clusters': hub_clusters,
        'bridges': bridges[:50],  # Top 50 pontes
        'global_stats': {
            'total_concepts': len(concepts),
            'total_relations': len(relations),
            'avg_degree': sum(len(graph[c['id']]) for c in concepts) / len(concepts),
            'layers': sorted(hub_clusters.keys())
        }
    }
    
    return cluster_metadata


def create_cluster_colors():
    """Define cores para cada camada (clusters)"""
    return {
        'fundacional': '#9966ff',  # Roxo
        'ontologica': '#66ccff',   # Azul claro
        'epistemica': '#66ff99',   # Verde claro
        'politica': '#ff6666',     # Vermelho
        'etica': '#ffcc66',        # Laranja
        'temporal': '#ff66cc',     # Rosa
        'ecologica': '#66ffcc',    # Turquesa
        'pratica': '#ccff66'       # Verde-amarelo
    }


def main():
    print("🎨 DEMARCAÇÃO DE CLUSTERS - ONTOLOGIA CRIOS")
    print("=" * 70)
    
    # Carrega dados
    print("\n📂 Carregando dados...")
    concepts = load_json(CONCEPTS_FILE)
    relations = load_json(RELATIONS_FILE)
    print(f"   ✅ {len(concepts)} conceitos")
    print(f"   ✅ {len(relations)} relações")
    
    # Gera análise de clusters
    metadata = generate_cluster_metadata(concepts, relations)
    
    # Define cores
    metadata['colors'] = create_cluster_colors()
    
    # Salva metadados
    output_file = BASE_DIR / 'assets' / 'cluster_metadata.json'
    save_json(output_file, metadata)
    
    print(f"\n💾 Metadados de cluster salvos em:")
    print(f"   {output_file}")
    
    print("\n" + "=" * 70)
    print("✨ Análise de clusters concluída!")
    print("\n💡 Use esses metadados para:")
    print("   • Colorir clusters no globo 3D por camada")
    print("   • Destacar conceitos-hub dentro de cada cluster")
    print("   • Visualizar pontes entre camadas")
    print("   • Aplicar física específica por cluster")


if __name__ == '__main__':
    main()
