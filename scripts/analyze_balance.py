#!/usr/bin/env python3
"""
Script de análise de balanceamento entre camadas ontológicas
Identifica desbalanceamentos e sugere reclassificações
"""

import json
import sys
from collections import Counter
from pathlib import Path
import statistics

# Caminhos
BASE_DIR = Path(__file__).parent.parent
CONCEPTS_FILE = BASE_DIR / 'assets' / 'concepts.json'


def load_json(filepath):
    """Carrega arquivo JSON com encoding UTF-8"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def analyze_balance(concepts):
    """Analisa balanceamento das camadas"""
    layer_counts = Counter(c['layer'] for c in concepts)
    counts = list(layer_counts.values())
    
    total = len(concepts)
    mean = statistics.mean(counts)
    median = statistics.median(counts)
    stdev = statistics.stdev(counts)
    ratio = max(counts) / min(counts)
    
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    print('📊 ANÁLISE DE BALANCEAMENTO POR CAMADA')
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    print(f'\nTotal: {total} conceitos\n')
    
    # Distribuição
    for layer, count in sorted(layer_counts.items(), key=lambda x: -x[1]):
        pct = (count / total) * 100
        bar_length = int(count / 2)
        bar = '█' * bar_length
        
        # Flags
        status = ''
        if count > mean * 1.5:
            status = ' ⚠️  SOBRE-REPRESENTADA'
        elif count < mean * 0.5:
            status = ' ⚠️  SUB-REPRESENTADA'
        
        print(f'  {layer:<15s} {count:3d} ({pct:4.1f}%) {bar}{status}')
    
    # Estatísticas
    print(f'\n📈 ESTATÍSTICAS:')
    print(f'  Média:          {mean:.1f} conceitos/camada')
    print(f'  Mediana:        {median:.1f}')
    print(f'  Desvio padrão:  {stdev:.1f}')
    print(f'  Razão max/min:  {ratio:.1f}x')
    
    # Avaliação
    print(f'\n⚖️  AVALIAÇÃO:')
    if ratio < 3:
        print(f'  ✅ BALANCEAMENTO BOM (razão {ratio:.1f}x)')
        status_code = 0
    elif ratio < 5:
        print(f'  ⚠️  BALANCEAMENTO MODERADO (razão {ratio:.1f}x)')
        status_code = 0
    else:
        print(f'  ❌ DESBALANCEAMENTO CRÍTICO (razão {ratio:.1f}x)')
        status_code = 1
    
    # Distribuição ideal
    ideal = total / len(layer_counts)
    print(f'\n🎯 DISTRIBUIÇÃO IDEAL (igualitária): {ideal:.1f} conceitos/camada')
    
    over_represented = [(l, c) for l, c in layer_counts.items() if c > ideal * 1.3]
    under_represented = [(l, c) for l, c in layer_counts.items() if c < ideal * 0.7]
    
    if over_represented:
        print(f'\n📈 Sobre-representadas (>30% acima da média):')
        for layer, count in sorted(over_represented, key=lambda x: -x[1]):
            excess = count - ideal
            print(f'  • {layer}: {count} (+{excess:.0f})')
    
    if under_represented:
        print(f'\n📉 Sub-representadas (<30% abaixo da média):')
        for layer, count in sorted(under_represented, key=lambda x: x[1]):
            deficit = ideal - count
            print(f'  • {layer}: {count} (-{deficit:.0f})')
    
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return status_code


def main():
    """Função principal"""
    concepts = load_json(CONCEPTS_FILE)
    status = analyze_balance(concepts)
    sys.exit(status)


if __name__ == '__main__':
    main()
