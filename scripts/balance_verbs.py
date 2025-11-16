#!/usr/bin/env python3
"""
Script para equilibrar verbos nas relações da ontologia CRIOS
Diversifica verbos genéricos em variantes contextuais para aumentar riqueza semântica
"""

import json
import re
from collections import defaultdict, Counter
from pathlib import Path

# Caminhos
BASE_DIR = Path(__file__).parent.parent
CONCEPTS_FILE = BASE_DIR / 'assets' / 'concepts.json'
RELATIONS_FILE = BASE_DIR / 'assets' / 'relations.json'


def load_json(filepath):
    """Carrega arquivo JSON com encoding UTF-8"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(filepath, data):
    """Salva arquivo JSON com encoding UTF-8 e formatação"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_concept_layer(concept_id, concepts):
    """Retorna a camada de um conceito"""
    for c in concepts:
        if c['id'] == concept_id:
            return c.get('layer', 'desconhecida')
    return 'desconhecida'


def diversify_relaciona_se_com(relation, index, concepts):
    """
    Diversifica 'relaciona-se com' baseado em:
    - Camadas dos conceitos envolvidos
    - Descrição da relação
    - Contexto semântico
    """
    desc = relation['description'].lower()
    from_id = relation['from']
    to_id = relation['to']
    
    from_layer = get_concept_layer(from_id, concepts)
    to_layer = get_concept_layer(to_id, concepts)
    
    # CONTEXTOS FUNDACIONAIS
    if from_layer == 'fundacional' or to_layer == 'fundacional':
        if any(word in desc for word in ['fundamenta', 'base', 'fundamento', 'alicerce']):
            return 'fundamenta-se em'
        if any(word in desc for word in ['sustenta', 'suporta', 'mantém']):
            return 'sustenta'
        if any(word in desc for word in ['emerge', 'surge', 'brota']):
            return 'emerge de'
        if any(word in desc for word in ['condiciona', 'condição', 'necessário']):
            return 'condiciona'
    
    # CONTEXTOS ONTOLÓGICOS
    if from_layer == 'ontologica' or to_layer == 'ontologica':
        if any(word in desc for word in ['constitui', 'forma', 'compõe']):
            return 'constitui'
        if any(word in desc for word in ['articula', 'conecta', 'vincula']):
            return 'articula-se com'
        if any(word in desc for word in ['entrelaça', 'entretece', 'emaranha']):
            return 'entrelaça-se com'
        if any(word in desc for word in ['estrutura', 'organiza', 'configura']):
            return 'estrutura-se em'
    
    # CONTEXTOS EPISTÊMICOS
    if from_layer == 'epistemica' or to_layer == 'epistemica':
        if any(word in desc for word in ['conhece', 'sabe', 'aprende']):
            return 'conhece através de'
        if any(word in desc for word in ['questiona', 'problematiza', 'interroga']):
            return 'questiona'
        if any(word in desc for word in ['revela', 'mostra', 'evidencia']):
            return 'revela'
        if any(word in desc for word in ['dialoga', 'conversa', 'comunica']):
            return 'dialoga com'
        if any(word in desc for word in ['pensa', 'reflete', 'concebe']):
            return 'pensa através de'
    
    # CONTEXTOS POLÍTICOS
    if from_layer == 'politica' or to_layer == 'politica':
        if any(word in desc for word in ['mobiliza', 'organiza', 'ativa']):
            return 'mobiliza'
        if any(word in desc for word in ['resiste', 'combate', 'enfrenta']):
            return 'resiste a'
        if any(word in desc for word in ['transforma', 'muda', 'altera']):
            return 'transforma'
        if any(word in desc for word in ['emancipa', 'liberta', 'autonomiza']):
            return 'emancipa-se via'
        if any(word in desc for word in ['disputa', 'contesta', 'confronta']):
            return 'disputa'
    
    # CONTEXTOS ÉTICOS
    if from_layer == 'etica' or to_layer == 'etica':
        if any(word in desc for word in ['cuida', 'zela', 'protege']):
            return 'cuida de'
        if any(word in desc for word in ['responsabiliza', 'responde', 'responsável']):
            return 'responsabiliza-se por'
        if any(word in desc for word in ['respeita', 'honra', 'valoriza']):
            return 'respeita'
        if any(word in desc for word in ['acolhe', 'recebe', 'hospitalidade']):
            return 'acolhe'
    
    # CONTEXTOS TEMPORAIS
    if from_layer == 'temporal' or to_layer == 'temporal':
        if any(word in desc for word in ['desdobra', 'desenvolve', 'desenrola']):
            return 'desdobra-se em'
        if any(word in desc for word in ['evolui', 'progride', 'avança']):
            return 'evolui para'
        if any(word in desc for word in ['sedimenta', 'cristaliza', 'consolida']):
            return 'sedimenta-se em'
        if any(word in desc for word in ['atualiza', 'renova', 'contemporiza']):
            return 'atualiza'
    
    # CONTEXTOS ECOLÓGICOS
    if from_layer == 'ecologica' or to_layer == 'ecologica':
        if any(word in desc for word in ['simbiose', 'simbiótico', 'mutualismo']):
            return 'simbiosa com'
        if any(word in desc for word in ['habita', 'coabita', 'vive']):
            return 'co-habita'
        if any(word in desc for word in ['flui', 'circula', 'perpassa']):
            return 'flui em'
        if any(word in desc for word in ['enraíza', 'ancora', 'fixa']):
            return 'enraíza-se em'
    
    # CONTEXTOS PRÁTICOS
    if from_layer == 'pratica' or to_layer == 'pratica':
        if any(word in desc for word in ['implementa', 'realiza', 'executa']):
            return 'implementa'
        if any(word in desc for word in ['pratica', 'exerce', 'faz']):
            return 'pratica'
        if any(word in desc for word in ['performa', 'atua', 'age']):
            return 'performa'
        if any(word in desc for word in ['opera', 'funciona', 'trabalha']):
            return 'opera'
    
    # CONTEXTOS SEMÂNTICOS GERAIS
    # Intra-ação e co-constituição
    if any(word in desc for word in ['intra-age', 'intra-ação', 'mutuamente']):
        return 'intra-age com'
    
    # Ressonância e convergência
    if any(word in desc for word in ['ressoa', 'ecoa', 'vibra']):
        return 'ressoa em'
    if any(word in desc for word in ['converge', 'aproxima', 'encontra']):
        return 'converge com'
    
    # Intensificação e potencialização
    if any(word in desc for word in ['intensifica', 'amplifica', 'potencializa']):
        return 'intensifica-se em'
    
    # Manifestação e expressão
    if any(word in desc for word in ['manifesta', 'expressa', 'revela-se']):
        return 'manifesta-se em'
    
    # Recursão e reflexividade
    if any(word in desc for word in ['recursão', 'recursivo', 'retroalimenta']):
        return 'recursiona em'
    
    # DISTRIBUIÇÃO CIRCULAR CONTEXTUAL para casos restantes
    # Usa o índice para distribuir igualmente entre variantes ricas
    
    # Mesma camada (relações horizontais)
    if from_layer == to_layer and from_layer != 'desconhecida':
        horizontal_verbs = [
            'dialoga com',
            'converge com',
            'co-emerge com',
            'ressoa em',
            'co-constitui',
            'tece com',
            'compartilha com',
            'co-produz com'
        ]
        return horizontal_verbs[index % len(horizontal_verbs)]
    
    # Camadas diferentes (relações verticais/transversais)
    vertical_verbs = [
        'articula-se com',
        'conecta-se a',
        'vincula-se a',
        'desdobra-se em',
        'manifesta-se em',
        'efetiva-se em',
        'realiza-se através de',
        'expressa-se em'
    ]
    return vertical_verbs[index % len(vertical_verbs)]


def diversify_fundamenta(relation, index, concepts):
    """Diversifica variações de 'fundamenta'"""
    desc = relation['description'].lower()
    
    if any(word in desc for word in ['base', 'alicerce', 'pilar']):
        return 'baseia-se em'
    if any(word in desc for word in ['sustenta', 'mantém', 'suporta']):
        return 'sustenta-se em'
    if any(word in desc for word in ['origina', 'nasce', 'provém']):
        return 'origina-se de'
    
    options = ['fundamenta-se em', 'ancora-se em', 'apoia-se em', 'funda-se em']
    return options[index % len(options)]


def diversify_constitui(relation, index, concepts):
    """Diversifica 'constitui'"""
    desc = relation['description'].lower()
    
    if any(word in desc for word in ['forma', 'molda', 'configura']):
        return 'forma'
    if any(word in desc for word in ['compõe', 'integra', 'incorpora']):
        return 'compõe-se de'
    if any(word in desc for word in ['estrutura', 'organiza', 'ordena']):
        return 'estrutura'
    
    options = ['constitui', 'configura-se em', 'se organiza em', 'se compõe de']
    return options[index % len(options)]


def diversify_temporaliza(relation, index, concepts):
    """Diversifica 'temporaliza'"""
    desc = relation['description'].lower()
    
    if any(word in desc for word in ['marca', 'delimita', 'define']):
        return 'marca temporalmente'
    if any(word in desc for word in ['ritma', 'cadencia', 'pulsa']):
        return 'ritma'
    if any(word in desc for word in ['dura', 'perdura', 'persiste']):
        return 'dura através de'
    
    options = ['temporaliza-se em', 'se temporaliza através de', 'marca temporalmente', 'dura em']
    return options[index % len(options)]


def main():
    """Função principal"""
    print("⚖️  BALANCEAMENTO DE VERBOS NA ONTOLOGIA CRIOS")
    print("=" * 60)
    
    # Carrega dados
    print("\n📂 Carregando dados...")
    concepts = load_json(CONCEPTS_FILE)
    relations = load_json(RELATIONS_FILE)
    
    print(f"   • {len(concepts)} conceitos")
    print(f"   • {len(relations)} relações")
    
    # Analisa estado atual
    print("\n📊 Estado atual dos verbos:")
    verb_counts = Counter(r['name'] for r in relations)
    print(f"   • Verbos únicos: {len(verb_counts)}")
    print(f"\n   Top 10 verbos mais usados:")
    for verb, count in verb_counts.most_common(10):
        pct = (count / len(relations) * 100)
        print(f"     {verb:30s}: {count:4d} ({pct:5.1f}%)")
    
    # Identifica verbos a equilibrar
    overused_threshold = len(relations) * 0.05  # 5% ou mais
    overused_verbs = {verb: count for verb, count in verb_counts.items() if count > overused_threshold}
    
    print(f"\n⚠️  Verbos sobre-utilizados (>{overused_threshold:.0f} ocorrências):")
    for verb, count in sorted(overused_verbs.items(), key=lambda x: -x[1]):
        print(f"     • {verb}: {count}")
    
    # Aplica diversificação
    print("\n🔄 Aplicando diversificação...")
    changes = defaultdict(int)
    
    for i, rel in enumerate(relations):
        original = rel['name']
        
        # Diversifica 'relaciona-se com' (o mais crítico - 15.9%)
        if rel['name'] == 'relaciona-se com':
            rel['name'] = diversify_relaciona_se_com(rel, i, concepts)
            if rel['name'] != original:
                changes['relaciona-se com'] += 1
        
        # Diversifica 'fundamenta'
        elif rel['name'] in ['fundamenta', 'fundamenta-se']:
            rel['name'] = diversify_fundamenta(rel, i, concepts)
            if rel['name'] != original:
                changes['fundamenta'] += 1
        
        # Diversifica 'constitui'
        elif rel['name'] in ['constitui', 'constitui ontologicamente']:
            rel['name'] = diversify_constitui(rel, i, concepts)
            if rel['name'] != original:
                changes['constitui'] += 1
        
        # Diversifica 'temporaliza'
        elif rel['name'] in ['temporaliza', 'temporaliza-se em']:
            rel['name'] = diversify_temporaliza(rel, i, concepts)
            if rel['name'] != original:
                changes['temporaliza'] += 1
    
    # Salva resultado
    print("\n💾 Salvando mudanças...")
    save_json(RELATIONS_FILE, relations)
    
    # Relatório de mudanças
    print("\n✅ Diversificação concluída:")
    total_changes = sum(changes.values())
    for verb_type, count in sorted(changes.items(), key=lambda x: -x[1]):
        print(f"   • {verb_type}: {count} variações criadas")
    print(f"\n   Total de relações diversificadas: {total_changes}")
    
    # Estatísticas finais
    print("\n📊 Estado final dos verbos:")
    final_verb_counts = Counter(r['name'] for r in relations)
    print(f"   • Verbos únicos: {len(final_verb_counts)} (antes: {len(verb_counts)})")
    print(f"   • Ganho de diversidade: +{len(final_verb_counts) - len(verb_counts)} verbos")
    
    print(f"\n   Top 10 verbos após balanceamento:")
    for verb, count in final_verb_counts.most_common(10):
        pct = (count / len(relations) * 100)
        print(f"     {verb:30s}: {count:4d} ({pct:5.1f}%)")
    
    # Análise de distribuição
    max_count = final_verb_counts.most_common(1)[0][1]
    max_pct = (max_count / len(relations) * 100)
    
    print(f"\n⚖️  AVALIAÇÃO FINAL:")
    if max_pct < 5:
        print(f"   ✅ EXCELENTE: Verbo mais usado ({max_pct:.1f}%) está bem distribuído")
    elif max_pct < 10:
        print(f"   ✅ BOM: Verbo mais usado ({max_pct:.1f}%) tem uso moderado")
    elif max_pct < 15:
        print(f"   ⚠️  ACEITÁVEL: Verbo mais usado ({max_pct:.1f}%) ainda dominante")
    else:
        print(f"   ❌ REQUER ATENÇÃO: Verbo mais usado ({max_pct:.1f}%) muito concentrado")
    
    print("\n" + "=" * 60)
    print("✨ Balanceamento concluído!")


if __name__ == '__main__':
    main()
