#!/usr/bin/env python3
"""
Script de atualização e validação completa da ontologia CRIOS
Executa verificações de qualidade, mesclas, validações e estatísticas
"""

import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

# Caminhos dos arquivos
BASE_DIR = Path(__file__).parent.parent
CONCEPTS_FILE = BASE_DIR / 'assets' / 'concepts.json'
RELATIONS_FILE = BASE_DIR / 'assets' / 'relations.json'
REFERENCIAS_FILE = BASE_DIR / 'assets' / 'referencias.json'

# Camadas ontológicas canônicas
CANONICAL_LAYERS = {
    'fundacional', 'ontologica', 'epistemica', 'politica',
    'etica', 'temporal', 'ecologica', 'pratica'
}

# Verbos por camada para geração de relações
LAYER_VERBS = {
    'fundacional': [
        'fundamenta', 'sustenta', 'origina', 'possibilita', 'condiciona',
        'precede', 'emerge em', 'dissolve-se em', 'manifesta-se em'
    ],
    'ontologica': [
        'constitui', 'articula-se com', 'entrelaça-se com', 'compõe',
        'estrutura', 'configura-se em', 'realiza-se em', 'intensifica-se em'
    ],
    'epistemica': [
        'informa', 'revela', 'questiona', 'problematiza', 'reconhece',
        'aprende de', 'pensa através de', 'dialoga com'
    ],
    'politica': [
        'mobiliza', 'resiste a', 'organiza', 'transforma', 'radicaliza-se em',
        'politiza-se em', 'emancipa-se via', 'disputa'
    ],
    'etica': [
        'responsabiliza-se por', 'cuida de', 'respeita', 'protege',
        'compartilha', 'reconhece', 'acolhe'
    ],
    'temporal': [
        'desdobra-se em', 'evolui para', 'sedimenta-se em', 'projeta-se em',
        'atualiza', 'devém', 'marca'
    ],
    'ecologica': [
        'simbiosa com', 'co-habita', 'entrelaça-se com', 'circula em',
        'flui em', 'enraíza-se em', 'territorializa-se em'
    ],
    'pratica': [
        'implementa', 'pratica', 'performa', 'efetiva', 'atua em',
        'realiza', 'experimenta', 'opera'
    ]
}


def load_json(filepath):
    """Carrega arquivo JSON com encoding UTF-8"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(filepath, data):
    """Salva arquivo JSON com encoding UTF-8 e formatação"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def print_section(title):
    """Imprime seção formatada"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def check_duplicates(concepts):
    """Verifica duplicações de ID e nome"""
    print_section("1. VERIFICAÇÃO DE DUPLICATAS")
    
    ids = [c['id'] for c in concepts]
    names = [c['name'] for c in concepts]
    
    id_counts = Counter(ids)
    name_counts = Counter(names)
    
    id_dups = {k: v for k, v in id_counts.items() if v > 1}
    name_dups = {k: v for k, v in name_counts.items() if v > 1}
    
    if id_dups:
        print(f"❌ {len(id_dups)} IDs duplicados:")
        for dup_id, count in id_dups.items():
            print(f"   • {dup_id} ({count}×)")
    else:
        print("✅ Nenhum ID duplicado")
    
    if name_dups:
        print(f"❌ {len(name_dups)} nomes duplicados:")
        for dup_name, count in name_dups.items():
            print(f"   • {dup_name} ({count}×)")
    else:
        print("✅ Nenhum nome duplicado")
    
    return len(id_dups) == 0 and len(name_dups) == 0


def check_required_fields(concepts):
    """Verifica campos obrigatórios"""
    print_section("2. VERIFICAÇÃO DE CAMPOS OBRIGATÓRIOS")
    
    critical_errors = []
    warnings = []
    
    for c in concepts:
        if not c.get('id'):
            critical_errors.append(f"❌ Sem ID: {c.get('name', 'SEM NOME')}")
        if not c.get('name'):
            critical_errors.append(f"❌ Sem nome: {c.get('id', 'SEM ID')}")
        if not c.get('description') or len(c.get('description', '')) < 20:
            warnings.append(f"⚠️  Descrição curta (<20 chars): {c['id']}")
        if not c.get('layer'):
            critical_errors.append(f"❌ Sem camada: {c['id']}")
        if not c.get('connections') or len(c.get('connections', [])) == 0:
            warnings.append(f"⚠️  Sem conexões: {c['id']}")
    
    if critical_errors:
        print(f"❌ {len(critical_errors)} erros críticos encontrados:")
        for issue in critical_errors[:20]:
            print(f"   {issue}")
        if len(critical_errors) > 20:
            print(f"   ... e mais {len(critical_errors) - 20} erros")
    
    if warnings:
        print(f"⚠️  {len(warnings)} avisos encontrados:")
        for issue in warnings[:10]:
            print(f"   {issue}")
        if len(warnings) > 10:
            print(f"   ... e mais {len(warnings) - 10} avisos")
    
    if not critical_errors and not warnings:
        print("✅ Todos os conceitos têm campos obrigatórios")
    
    # Only fail on critical errors, not warnings
    return len(critical_errors) == 0


def check_orphan_references(concepts):
    """Verifica referências órfãs nas conexões"""
    print_section("3. VERIFICAÇÃO DE REFERÊNCIAS ÓRFÃS")
    
    all_ids = set(c['id'] for c in concepts)
    orphan_refs = set()
    
    for c in concepts:
        for conn in c.get('connections', []):
            if conn not in all_ids:
                orphan_refs.add(f"{c['id']} → {conn}")
    
    if orphan_refs:
        print(f"❌ {len(orphan_refs)} referências órfãs:")
        for ref in sorted(list(orphan_refs))[:20]:
            print(f"   {ref}")
        if len(orphan_refs) > 20:
            print(f"   ... e mais {len(orphan_refs) - 20} referências")
    else:
        print("✅ Todas as conexões são válidas (0 órfãs)")
    
    return len(orphan_refs) == 0


def analyze_layer_distribution(concepts):
    """Analisa distribuição por camada"""
    print_section("4. DISTRIBUIÇÃO POR CAMADA")
    
    layer_dist = Counter(c.get('layer') for c in concepts)
    
    print(f"Total de conceitos: {len(concepts)}\n")
    for layer in CANONICAL_LAYERS:
        count = layer_dist.get(layer, 0)
        pct = (count / len(concepts) * 100) if concepts else 0
        print(f"  {layer:12s}: {count:3d} ({pct:5.1f}%)")
    
    # Camadas não-canônicas
    non_canonical = {k: v for k, v in layer_dist.items() if k not in CANONICAL_LAYERS}
    if non_canonical:
        print(f"\n⚠️  Camadas não-canônicas encontradas:")
        for layer, count in non_canonical.items():
            print(f"  {layer}: {count}")


def analyze_connections(concepts):
    """Analisa estatísticas de conexões"""
    print_section("5. ESTATÍSTICAS DE CONEXÕES")
    
    conn_counts = [len(c.get('connections', [])) for c in concepts]
    
    if conn_counts:
        avg = sum(conn_counts) / len(conn_counts)
        print(f"  Média:   {avg:.1f} conexões/conceito")
        print(f"  Mínima:  {min(conn_counts)}")
        print(f"  Máxima:  {max(conn_counts)}")
        
        # Top conceitos mais conectados
        most_connected = sorted(
            [(c['id'], c['name'], len(c.get('connections', []))) for c in concepts],
            key=lambda x: -x[2]
        )[:10]
        
        print(f"\n  Top 10 mais conectados:")
        for cid, name, count in most_connected:
            print(f"    • {name} ({count})")


def check_relations_integrity(concepts, relations):
    """Verifica integridade das relações"""
    print_section("6. VERIFICAÇÃO DE RELAÇÕES")
    
    all_ids = set(c['id'] for c in concepts)
    
    issues = []
    for rel in relations:
        if rel['from'] not in all_ids:
            issues.append(f"❌ ID origem não existe: {rel['from']} → {rel['to']}")
        if rel['to'] not in all_ids:
            issues.append(f"❌ ID destino não existe: {rel['from']} → {rel['to']}")
        if rel['from'] == rel['to']:
            issues.append(f"⚠️  Auto-relação: {rel['from']}")
    
    if issues:
        print(f"⚠️  {len(issues)} problemas encontrados:")
        for issue in issues[:20]:
            print(f"   {issue}")
        if len(issues) > 20:
            print(f"   ... e mais {len(issues) - 20} problemas")
    else:
        print(f"✅ Todas as {len(relations)} relações são válidas")
    
    # Verificar duplicatas
    seen = set()
    duplicates = 0
    for rel in relations:
        key = (rel['from'], rel['to'])
        if key in seen:
            duplicates += 1
        seen.add(key)
    
    if duplicates > 0:
        print(f"⚠️  {duplicates} relações duplicadas")
    else:
        print(f"✅ Nenhuma relação duplicada")
    
    return len(issues) == 0 and duplicates == 0


def analyze_relation_verbs(relations):
    """Analisa distribuição de verbos nas relações"""
    print_section("7. ANÁLISE DE VERBOS SEMÂNTICOS")
    
    verb_counts = Counter(r['name'] for r in relations)
    
    print(f"Total de relações: {len(relations)}")
    print(f"Verbos únicos: {len(verb_counts)}\n")
    
    print("Top 15 verbos mais usados:")
    for verb, count in verb_counts.most_common(15):
        pct = (count / len(relations) * 100) if relations else 0
        print(f"  {verb:25s}: {count:4d} ({pct:5.1f}%)")


def compare_with_literature(concepts, referencias):
    """Compara conceitos do rizoma com literatura"""
    print_section("8. COMPARAÇÃO COM LITERATURA")
    
    # Conceitos na literatura
    lit_concepts = set()
    for ref in referencias:
        for c in ref.get('conceitos', []):
            lit_concepts.add(c)
    
    # Conceitos no rizoma
    riz_concepts = set(c['name'] for c in concepts)
    
    # Conceitos produzidos (não mapeados na literatura)
    produced = riz_concepts - lit_concepts
    
    print(f"📚 Conceitos na literatura: {len(lit_concepts)}")
    print(f"🌐 Conceitos no rizoma: {len(riz_concepts)}")
    print(f"✨ Conceitos produzidos: {len(produced)} ({len(produced)/len(riz_concepts)*100:.1f}%)")
    print(f"🔗 Conceitos mapeados: {len(riz_concepts & lit_concepts)}")


def print_final_statistics(concepts, relations):
    """Imprime estatísticas finais"""
    print_section("ESTATÍSTICAS FINAIS")
    
    print(f"📚 Conceitos: {len(concepts)}")
    print(f"🔗 Relações: {len(relations)}")
    print(f"🎯 Verbos únicos: {len(set(r['name'] for r in relations))}")
    print(f"📊 Camadas: {len(CANONICAL_LAYERS)}")
    
    conn_counts = [len(c.get('connections', [])) for c in concepts]
    if conn_counts:
        print(f"🌐 Média de conexões: {sum(conn_counts)/len(conn_counts):.1f}")


def main():
    """Função principal"""
    print("\n" + "="*60)
    print("  ATUALIZAÇÃO E VALIDAÇÃO DA ONTOLOGIA CRIOS")
    print("="*60)
    
    # Carregar dados
    print("\nCarregando arquivos...")
    try:
        concepts = load_json(CONCEPTS_FILE)
        relations = load_json(RELATIONS_FILE)
        referencias = load_json(REFERENCIAS_FILE)
        print(f"✅ {len(concepts)} conceitos carregados")
        print(f"✅ {len(relations)} relações carregadas")
        print(f"✅ {len(referencias)} referências carregadas")
    except Exception as e:
        print(f"❌ Erro ao carregar arquivos: {e}")
        sys.exit(1)
    
    # Executar verificações
    all_ok = True
    
    all_ok &= check_duplicates(concepts)
    all_ok &= check_required_fields(concepts)
    all_ok &= check_orphan_references(concepts)
    analyze_layer_distribution(concepts)
    analyze_connections(concepts)
    all_ok &= check_relations_integrity(concepts, relations)
    analyze_relation_verbs(relations)
    compare_with_literature(concepts, referencias)
    
    # Estatísticas finais
    print_final_statistics(concepts, relations)
    
    # Resultado final
    print("\n" + "="*60)
    if all_ok:
        print("  ✅ VALIDAÇÃO COMPLETA: SISTEMA ÍNTEGRO")
    else:
        print("  ⚠️  VALIDAÇÃO COMPLETA: PROBLEMAS ENCONTRADOS")
    print("="*60 + "\n")
    
    return 0 if all_ok else 1


if __name__ == '__main__':
    sys.exit(main())
