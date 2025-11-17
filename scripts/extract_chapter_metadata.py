#!/usr/bin/env python3
"""
Script para extrair metadados dos capítulos do livro
Gera chapter-metadata.json com informações sobre conceitos, autores e distribuição por camada
"""

import json
import re
from collections import defaultdict
from pathlib import Path

def load_concepts():
    """Carrega os conceitos do arquivo JSON"""
    with open('assets/concepts.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def load_relations():
    """Carrega as relações do arquivo JSON"""
    with open('assets/relations.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def load_livro_markdown():
    """Carrega o conteúdo do livro"""
    with open('…_.md', 'r', encoding='utf-8') as f:
        return f.read()

def extract_chapters(markdown_content):
    """Extrai os capítulos do markdown"""
    # Dividir por h1 (capítulos)
    chapters = []
    lines = markdown_content.split('\n')
    current_chapter = None
    current_content = []
    
    for line in lines:
        # Detectar início de capítulo (h1)
        if line.startswith('# '):
            # Salvar capítulo anterior se existir
            if current_chapter:
                chapters.append({
                    'title': current_chapter,
                    'content': '\n'.join(current_content)
                })
            # Iniciar novo capítulo
            current_chapter = line[2:].strip()
            current_content = []
        else:
            current_content.append(line)
    
    # Adicionar último capítulo
    if current_chapter:
        chapters.append({
            'title': current_chapter,
            'content': '\n'.join(current_content)
        })
    
    return chapters

def extract_concepts_from_text(text, concepts):
    """Extrai conceitos mencionados no texto"""
    concept_mentions = defaultdict(int)
    
    # Criar mapa de nomes de conceitos
    concept_map = {c['name'].lower(): c for c in concepts}
    
    # Contar menções de cada conceito
    for concept_name, concept in concept_map.items():
        # Buscar o nome do conceito com word boundaries
        pattern = r'\b' + re.escape(concept_name) + r'\b'
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            concept_mentions[concept['id']] = len(matches)
    
    return concept_mentions

def extract_authors_from_text(text):
    """Extrai citações de autores do texto"""
    authors = set()
    
    # Padrões comuns de citação
    # Padrão 1: Nome com inicial maiúscula seguido de vírgula ou ponto
    # Padrão 2: Nome entre parênteses
    # Padrão 3: Nome seguido de ano entre parênteses
    
    # Lista de autores conhecidos do contexto do livro
    known_authors = [
        'Nāgārjuna', 'Carlo Rovelli', 'Karen Barad', 'Jay Garfield',
        'Jan Westerhoff', 'Graham Priest', 'Slavoj Žižek',
        'Michel Foucault', 'Judith Butler', 'bell hooks',
        'Donna Haraway', 'Bruno Latour', 'Isabelle Stengers',
        'Eduardo Viveiros de Castro', 'Ailton Krenak',
        'Denise Ferreira da Silva', 'Lélia Gonzalez',
        'Patricia Hill Collins', 'Frantz Fanon',
        'Gayatri Spivak', 'Sara Ahmed', 'Eve Tuck',
        'Robin Wall Kimmerer', 'Tyson Yunkaporta',
        'Leanne Betasamosake Simpson', 'Glen Coulthard',
        'Audra Simpson', 'Kim TallBear', 'Zoe Todd',
        'Vanessa Watts', 'Kyle Whyte', 'Dian Million'
    ]
    
    for author in known_authors:
        # Buscar menções do autor (case insensitive)
        if re.search(r'\b' + re.escape(author) + r'\b', text, re.IGNORECASE):
            authors.add(author)
    
    return list(authors)

def calculate_layer_distribution(concept_mentions, concepts):
    """Calcula a distribuição de conceitos por camada ontológica"""
    distribution = defaultdict(int)
    
    # Criar mapa de conceitos por ID
    concept_map = {c['id']: c for c in concepts}
    
    for concept_id, mentions in concept_mentions.items():
        if concept_id in concept_map:
            layer = concept_map[concept_id]['layer']
            # Remover sufixo numérico de subcamadas
            base_layer = layer.split('-')[0]
            distribution[base_layer] += mentions
    
    return dict(distribution)

def identify_protocols(chapter_content):
    """Identifica protocolos mencionados no capítulo"""
    protocols = []
    
    # Padrões de identificação de protocolos
    protocol_patterns = [
        (r'auditoria\s+de\s+expectativas', 'auditoria-expectativas-implicitas'),
        (r'teste\s+de\s+reciprocidade', 'teste-reciprocidade-identitaria'),
        (r'índice\s+de\s+reversibilidade', 'indice-reversibilidade-paradigmatica'),
        (r'auditoria\s+de\s+transparência', 'auditoria-transparencia-assimetrica'),
        (r'protocolo\s+de\s+divergência', 'protocolo-divergencia-construtiva'),
    ]
    
    for pattern, protocol_id in protocol_patterns:
        if re.search(pattern, chapter_content, re.IGNORECASE):
            protocols.append(protocol_id)
    
    return protocols

def generate_chapter_id(title):
    """Gera um ID único para o capítulo baseado no título"""
    # Remover acentos e caracteres especiais
    import unicodedata
    normalized = unicodedata.normalize('NFD', title)
    without_accents = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
    
    # Converter para lowercase e substituir espaços por hífens
    chapter_id = re.sub(r'[^\w\s-]', '', without_accents.lower())
    chapter_id = re.sub(r'[-\s]+', '-', chapter_id)
    chapter_id = 'capitulo-' + chapter_id.strip('-')
    
    return chapter_id

def extract_chapter_metadata(chapters, concepts, relations):
    """Extrai metadados de todos os capítulos"""
    metadata = {
        'chapters': []
    }
    
    # Identificar partes do livro (análise simples)
    current_part = 'I'
    
    for i, chapter in enumerate(chapters, start=1):
        title = chapter['title']
        content = chapter['content']
        
        # Detectar mudança de parte
        if 'PARTE II' in content or 'parte ii' in content.lower():
            current_part = 'II'
        elif 'PARTE III' in content or 'parte iii' in content.lower():
            current_part = 'III'
        
        # Extrair informações
        concept_mentions = extract_concepts_from_text(content, concepts)
        authors = extract_authors_from_text(content)
        layer_dist = calculate_layer_distribution(concept_mentions, concepts)
        protocols = identify_protocols(content)
        
        # Criar estrutura de metadados
        chapter_meta = {
            'id': generate_chapter_id(title),
            'title': title,
            'number': i,
            'part': current_part,
            'concepts': [
                {
                    'id': cid,
                    'mentions': count
                }
                for cid, count in sorted(concept_mentions.items(), key=lambda x: -x[1])
            ],
            'authors': authors,
            'protocols': protocols,
            'layerDistribution': layer_dist,
            'wordCount': len(content.split())
        }
        
        metadata['chapters'].append(chapter_meta)
    
    return metadata

def main():
    print('🔍 Extraindo metadados dos capítulos...\n')
    
    # Carregar dados
    print('📚 Carregando conceitos...')
    concepts = load_concepts()
    print(f'  ✓ {len(concepts)} conceitos carregados')
    
    print('🔗 Carregando relações...')
    relations = load_relations()
    print(f'  ✓ {len(relations)} relações carregadas')
    
    print('📖 Carregando livro...')
    markdown = load_livro_markdown()
    print(f'  ✓ Livro carregado ({len(markdown)} caracteres)')
    
    print('✂️  Extraindo capítulos...')
    chapters = extract_chapters(markdown)
    print(f'  ✓ {len(chapters)} capítulos encontrados')
    
    print('\n🔬 Analisando capítulos...')
    metadata = extract_chapter_metadata(chapters, concepts, relations)
    
    # Estatísticas
    total_concepts = sum(len(ch['concepts']) for ch in metadata['chapters'])
    total_authors = sum(len(ch['authors']) for ch in metadata['chapters'])
    
    print(f'\n📊 Estatísticas:')
    print(f'  • {len(metadata["chapters"])} capítulos processados')
    print(f'  • {total_concepts} menções de conceitos encontradas')
    print(f'  • {total_authors} citações de autores identificadas')
    
    # Salvar arquivo
    output_path = Path('assets/chapter-metadata.json')
    print(f'\n💾 Salvando em {output_path}...')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f'  ✓ Arquivo salvo com sucesso!')
    
    # Exibir preview de um capítulo
    if metadata['chapters']:
        print(f'\n📋 Preview do primeiro capítulo:')
        first = metadata['chapters'][0]
        print(f'  Título: {first["title"]}')
        print(f'  Conceitos: {len(first["concepts"])}')
        print(f'  Autores: {", ".join(first["authors"][:3])}{"..." if len(first["authors"]) > 3 else ""}')
        print(f'  Camadas: {", ".join(first["layerDistribution"].keys())}')

if __name__ == '__main__':
    main()
