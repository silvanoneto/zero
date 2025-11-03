#!/usr/bin/env python3
"""
Script para exportar o conteúdo do site "A Revolução Cibernética" para EPUB, PDF e XML.

Exporta os seguintes arquivos HTML:
- index.html (Teoria Principal)
- manifesto.html (Manifesto Político)
- constituicao_2.0.html (Constituição 2.0 - Visão Geral)
- constituicao_2.0_completa.html (Constituição 2.0 - Texto Completo)
- ∅.html (Ordem Zero)

Formatos de saída:
- EPUB: docs/revolucao_cibernetica.epub
- PDF: docs/revolucao_cibernetica.pdf
- XML: docs/revolucao_cibernetica.xml
- XML Minificado: docs/revolucao_cibernetica.min.xml
"""

import os
import sys
import warnings
import xml.etree.ElementTree as ET
from xml.dom import minidom
from datetime import datetime, timezone
from ebooklib import epub  # type: ignore
from bs4 import BeautifulSoup
from xhtml2pdf import pisa  # type: ignore
from PIL import Image
from io import BytesIO
import base64

# Suprimir warnings de JSON decode do xhtml2pdf
warnings.filterwarnings("ignore", message=".*JSON.*")
warnings.filterwarnings("ignore", category=UserWarning, module="xhtml2pdf")


def compress_image(
    image_data: bytes, max_size_kb: int = 500, quality: int = 75
) -> bytes:
    """
    Comprime uma imagem para reduzir o tamanho do arquivo.

    Args:
        image_data: Dados binários da imagem original
        max_size_kb: Tamanho máximo desejado em KB (padrão: 500KB)
        quality: Qualidade JPEG (1-100, padrão: 75)

    Returns:
        Dados binários da imagem comprimida
    """
    try:
        # Abrir imagem
        img = Image.open(BytesIO(image_data))

        # Converter RGBA para RGB se necessário (para salvar como JPEG)
        if img.mode in ("RGBA", "LA", "P"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            background.paste(
                img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None
            )
            img = background

        # Redimensionar se a imagem for muito grande
        max_dimension = 1920
        if max(img.size) > max_dimension:
            ratio = max_dimension / max(img.size)
            new_size = tuple(int(dim * ratio) for dim in img.size)
            img = img.resize(new_size, Image.Resampling.LANCZOS)

        # Comprimir imagem
        output = BytesIO()
        img.save(output, format="JPEG", quality=quality, optimize=True)
        compressed_data = output.getvalue()

        # Se ainda estiver muito grande, reduzir qualidade gradualmente
        current_quality = quality
        while len(compressed_data) > max_size_kb * 1024 and current_quality > 30:
            current_quality -= 10
            output = BytesIO()
            img.save(output, format="JPEG", quality=current_quality, optimize=True)
            compressed_data = output.getvalue()

        # Retornar a versão menor
        if len(compressed_data) < len(image_data):
            return compressed_data
        return image_data

    except Exception as e:
        print(f"  ⚠ Erro ao comprimir imagem: {e}")
        return image_data


def compress_and_embed_images_in_html(html_content: str, quality: int = 60) -> str:
    """
    Processa todas as tags <img> no HTML, comprime as imagens e converte para base64.

    Args:
        html_content: HTML com tags <img src="path/to/image.png">
        quality: Qualidade JPEG para compressão (1-100)

    Returns:
        HTML com imagens embutidas em base64
    """
    soup = BeautifulSoup(html_content, "html.parser")

    for img_tag in soup.find_all("img"):
        src = img_tag.get("src")
        if not src or src.startswith("data:"):
            continue

        try:
            # Ler imagem do disco
            img_path = (
                src
                if os.path.exists(src)
                else os.path.join("assets/images", os.path.basename(src))
            )

            if not os.path.exists(img_path):
                continue

            with open(img_path, "rb") as f:
                img_data = f.read()

            # Comprimir imagem (mais agressivo para PDF)
            compressed_data = compress_image(img_data, max_size_kb=300, quality=quality)

            # Converter para base64
            base64_data = base64.b64encode(compressed_data).decode("utf-8")

            # Substituir src por data URI
            img_tag["src"] = f"data:image/jpeg;base64,{base64_data}"

        except Exception as e:
            print(f"  ⚠ Erro ao processar imagem {src}: {e}")
            continue

    return str(soup)


def clean_html_content(html_content: str) -> str:
    """Remove scripts, estilos e elementos desnecessários do HTML."""
    soup = BeautifulSoup(html_content, "html.parser")

    # Remove elementos desnecessários
    for element in soup(
        ["script", "style", "nav", "header", "footer", "button", "noscript"]
    ):
        element.decompose()

    # Remove classes e IDs desnecessários (mantém estrutura)
    for tag in soup.find_all(True):
        if tag.name not in ["img", "a"]:
            tag.attrs = {}

    return str(soup)


def extract_main_content(html_file: str) -> str:
    """Extrai o conteúdo principal de um arquivo HTML."""
    with open(html_file, "r", encoding="utf-8") as f:
        content = f.read()

    soup = BeautifulSoup(content, "html.parser")

    # Tenta encontrar o conteúdo principal
    main_content = soup.find("main") or soup.find("article") or soup.find("body")

    if main_content:
        # Corrigir caminhos das imagens para o formato EPUB
        for img in main_content.find_all("img"):
            if img.get("src"):
                # Converter assets/images/xxx.png para images/xxx.png
                src = img["src"]
                # Garantir que src é uma string
                if isinstance(src, str):
                    if src.startswith("assets/images/"):
                        img["src"] = src.replace("assets/images/", "images/")
                    elif src.startswith("./assets/images/"):
                        img["src"] = src.replace("./assets/images/", "images/")

        return str(main_content)
    return content


def create_epub():
    """Cria o arquivo EPUB com o conteúdo do site."""

    # Garantir que o diretório docs/ existe
    os.makedirs("docs", exist_ok=True)

    # Criar o livro EPUB
    book = epub.EpubBook()

    # Metadados
    book.set_identifier("revolucao-cibernetica-2025")  # type: ignore
    book.set_title("A Revolução Cibernética: Teoria, Manifesto e Sistema")
    book.set_language("pt-BR")
    book.add_author("O Besta Fera")

    # Adicionar metadados extras
    book.add_metadata(
        "DC",
        "description",
        "Uma síntese teórica crítica que conecta Cibernética, Marxismo e Capitalismo Digital",
    )
    book.add_metadata("DC", "subject", "Cibernética")
    book.add_metadata("DC", "subject", "Marxismo")
    book.add_metadata("DC", "subject", "Capitalismo Digital")
    book.add_metadata("DC", "rights", "Creative Commons BY-SA 4.0")
    book.add_metadata("DC", "publisher", "O Besta Fera")
    book.add_metadata("DC", "date", "2025")

    print("Metadados configurados ✓")

    # CSS para o EPUB
    style = """
    @namespace epub "http://www.idpf.org/2007/ops";
    
    body {
        font-family: Georgia, serif;
        line-height: 1.6;
        color: #333;
        margin: 1em;
    }
    
    h1, h2, h3, h4, h5, h6 {
        font-family: Helvetica, Arial, sans-serif;
        font-weight: bold;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        color: #2d3748;
    }
    
    h1 {
        font-size: 2em;
        border-bottom: 2px solid #4a5568;
        padding-bottom: 0.3em;
    }
    
    h2 {
        font-size: 1.5em;
        color: #4a5568;
    }
    
    h3 {
        font-size: 1.25em;
        color: #718096;
    }
    
    p {
        margin: 1em 0;
        text-align: justify;
    }
    
    blockquote {
        border-left: 4px solid #cbd5e0;
        padding-left: 1em;
        margin: 1em 0;
        font-style: italic;
        color: #4a5568;
    }
    
    code {
        font-family: "Courier New", monospace;
        background-color: #f7fafc;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-size: 0.9em;
    }
    
    pre {
        background-color: #f7fafc;
        padding: 1em;
        border-radius: 5px;
        overflow-x: auto;
    }
    
    img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 1em auto;
    }
    
    ul, ol {
        margin: 1em 0;
        padding-left: 2em;
    }
    
    li {
        margin: 0.5em 0;
    }
    
    a {
        color: #3182ce;
        text-decoration: none;
    }
    
    a:hover {
        text-decoration: underline;
    }
    
    .section-divider {
        text-align: center;
        margin: 2em 0;
        font-size: 1.5em;
        color: #a0aec0;
    }
    """

    # Adicionar CSS
    nav_css = epub.EpubItem(
        uid="style_nav",
        file_name="style/nav.css",
        media_type="text/css",
        content=style.encode("utf-8"),
    )  # type: ignore
    book.add_item(nav_css)

    # Lista de capítulos
    chapters = []
    spine = ["nav"]

    # Capítulo 1: Teoria Principal (index.html)
    print("\nProcessando index.html...")
    try:
        content = extract_main_content("index.html")

        # Contar imagens no conteúdo
        soup = BeautifulSoup(content, "html.parser")
        images_in_content = soup.find_all("img")
        print(f"  → Encontradas {len(images_in_content)} imagens no conteúdo")

        # Criar capítulo
        c1 = epub.EpubHtml(
            title="Cibernética, Marxismo e Capitalismo Digital",
            file_name="teoria.xhtml",
            lang="pt-BR",
        )
        c1.content = content
        c1.add_item(nav_css)

        book.add_item(c1)
        chapters.append(c1)
        spine.append(c1)  # type: ignore
        print("✓ index.html processado")
    except Exception as e:
        print(f"✗ Erro ao processar index.html: {e}")

    # Capítulo 2: Manifesto (manifesto.html)
    print("\nProcessando manifesto.html...")
    try:
        content = extract_main_content("manifesto.html")

        # Contar imagens no conteúdo
        soup = BeautifulSoup(content, "html.parser")
        images_in_content = soup.find_all("img")
        print(f"  → Encontradas {len(images_in_content)} imagens no conteúdo")

        c2 = epub.EpubHtml(
            title="A Morte do Eu Individual e o Nascimento do Eu Coletivo",
            file_name="manifesto.xhtml",
            lang="pt-BR",
        )
        c2.content = content
        c2.add_item(nav_css)

        book.add_item(c2)
        chapters.append(c2)
        spine.append(c2)  # type: ignore
        print("✓ manifesto.html processado")
    except Exception as e:
        print(f"✗ Erro ao processar manifesto.html: {e}")

    # Capítulo 3: Constituição 2.0 (constituicao_2.0.html)
    print("\nProcessando constituicao_2.0.html...")
    try:
        content = extract_main_content("constituicao_2.0.html")

        # Contar imagens no conteúdo
        soup = BeautifulSoup(content, "html.parser")
        images_in_content = soup.find_all("img")
        print(f"  → Encontradas {len(images_in_content)} imagens no conteúdo")

        c3 = epub.EpubHtml(
            title="Constituição 2.0 — Protocolo Biomimético-Cibernético",
            file_name="constituicao_2.0.xhtml",
            lang="pt-BR",
        )
        c3.content = content
        c3.add_item(nav_css)

        book.add_item(c3)
        chapters.append(c3)
        spine.append(c3)  # type: ignore
        print("✓ constituicao_2.0.html processado")
    except Exception as e:
        print(f"✗ Erro ao processar constituicao_2.0.html: {e}")

    # Capítulo 4: Constituição 2.0 Completa (constituicao_2.0_completa.html)
    print("\nProcessando constituicao_2.0_completa.html...")
    try:
        content = extract_main_content("constituicao_2.0_completa.html")

        # Contar imagens no conteúdo
        soup = BeautifulSoup(content, "html.parser")
        images_in_content = soup.find_all("img")
        print(f"  → Encontradas {len(images_in_content)} imagens no conteúdo")

        c4 = epub.EpubHtml(
            title="Constituição 2.0 — Texto Completo",
            file_name="constituicao_2.0_completa.xhtml",
            lang="pt-BR",
        )
        c4.content = content
        c4.add_item(nav_css)

        book.add_item(c4)
        chapters.append(c4)
        spine.append(c4)  # type: ignore
        print("✓ constituicao_2.0_completa.html processado")
    except Exception as e:
        print(f"✗ Erro ao processar constituicao_2.0_completa.html: {e}")

    # Capítulo 5: Ordem Zero (∅.html)
    print("\nProcessando ∅.html...")
    try:
        content = extract_main_content("∅.html")

        # Contar imagens no conteúdo
        soup = BeautifulSoup(content, "html.parser")
        images_in_content = soup.find_all("img")
        print(f"  → Encontradas {len(images_in_content)} imagens no conteúdo")

        c5 = epub.EpubHtml(
            title="∅ — Ordem Zero: A Möbius Primitiva",
            file_name="ordem_zero.xhtml",
            lang="pt-BR",
        )
        c5.content = content
        c5.add_item(nav_css)

        book.add_item(c5)
        chapters.append(c5)
        spine.append(c5)  # type: ignore
        print("✓ ∅.html processado")
    except Exception as e:
        print(f"✗ Erro ao processar ∅.html: {e}")

    # Adicionar imagem de capa
    print("Processando imagem de capa...")
    try:
        cover_path = "assets/images/01_capa_revolucao_cibernetica.png"
        if os.path.exists(cover_path):
            with open(cover_path, "rb") as f:
                cover_image_data = f.read()

            # Comprimir imagem de capa
            original_size = len(cover_image_data) / 1024
            cover_image = compress_image(cover_image_data, max_size_kb=800, quality=80)
            compressed_size = len(cover_image) / 1024

            book.set_cover("cover.png", cover_image)
            print(
                f"✓ Capa adicionada ({original_size:.1f}KB → {compressed_size:.1f}KB)"
            )
        else:
            print("⚠ Imagem de capa não encontrada")
    except Exception as e:
        print(f"✗ Erro ao adicionar capa: {e}")

    # Adicionar todas as imagens do diretório
    print("Processando imagens...")
    images_dir = "assets/images"
    image_count = 0
    total_original_size = 0
    total_compressed_size = 0

    if os.path.exists(images_dir):
        # Listar todos os arquivos de imagem
        for img_file in sorted(os.listdir(images_dir)):
            # Processar apenas arquivos de imagem (png, jpg, jpeg, gif)
            # SVG não comprime bem, então ignoramos
            if img_file.lower().endswith((".png", ".jpg", ".jpeg", ".gif")):
                try:
                    img_path = os.path.join(images_dir, img_file)

                    with open(img_path, "rb") as f:
                        img_content_original = f.read()

                    original_size = len(img_content_original)
                    total_original_size += original_size

                    # Comprimir imagem (mais agressivo para EPUB)
                    img_content = compress_image(
                        img_content_original, max_size_kb=400, quality=70
                    )
                    compressed_size = len(img_content)
                    total_compressed_size += compressed_size

                    # Determinar o tipo MIME (sempre JPEG após compressão)
                    media_type = "image/jpeg"

                    img_item = epub.EpubItem(
                        uid=img_file.replace(".", "_").replace("-", "_"),
                        file_name=f"images/{img_file}",
                        media_type=media_type,
                        content=img_content,
                    )
                    book.add_item(img_item)
                    image_count += 1

                    reduction = (original_size - compressed_size) / original_size * 100
                    print(
                        f"✓ {img_file} ({original_size / 1024:.1f}KB → {compressed_size / 1024:.1f}KB, -{reduction:.0f}%)"
                    )
                except Exception as e:
                    print(f"✗ Erro ao processar {img_file}: {e}")

        print(f"\nTotal de imagens processadas: {image_count}")
    else:
        print("⚠ Diretório de imagens não encontrado")

    # Definir o sumário
    book.toc = chapters

    # Adicionar navegação padrão
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())

    # Definir a ordem de leitura
    book.spine = spine

    # Salvar o EPUB
    output_file = "docs/revolucao_cibernetica.epub"
    print(f"\nGerando arquivo EPUB: {output_file}")
    epub.write_epub(output_file, book, {})
    print(f"✓ EPUB criado com sucesso: {output_file}")

    file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB

    # Estatísticas finais
    print("\n" + "=" * 60)
    print("📊 ESTATÍSTICAS DA EXPORTAÇÃO")
    print("=" * 60)
    print(f"📚 Capítulos: {len(chapters)}")
    print(f"🖼️  Imagens processadas: {image_count}")
    print(
        f"� Tamanho original das imagens: {total_original_size / (1024 * 1024):.1f} MB"
    )
    print(f"� Tamanho comprimido: {total_compressed_size / (1024 * 1024):.1f} MB")
    print(
        f"💾 Redução: {((total_original_size - total_compressed_size) / total_original_size * 100):.0f}%"
    )
    print(f"📄 Tamanho do EPUB: {file_size:.2f} MB")
    print("=" * 60)

    return output_file


def create_pdf() -> str:
    """Cria um arquivo PDF bonito do site."""

    # Garantir que o diretório docs/ existe
    os.makedirs("docs", exist_ok=True)

    print("=" * 60)
    print("Criando PDF com estilos preservados...")
    print("=" * 60)

    # CSS otimizado para PDF seguindo o style guide
    pdf_css = """
    @page {
        size: a4 portrait;
        margin: 2.5cm;
    }
    
    body {
        font-family: 'Inter', 'Helvetica Neue', 'Arial', sans-serif;
        font-size: 11pt;
        line-height: 1.75;
        color: #1a1a1a;
        background-color: #ffffff;
        text-align: justify;
        margin: 0;
        padding: 0;
    }
    
    /* Títulos - Roxo e Rosa do style guide */
    h1 {
        font-family: 'Inter', 'Helvetica Neue', 'Arial', sans-serif;
        font-size: 28pt;
        font-weight: 700;
        color: #8b5cf6;
        margin: 1.5em 0 0.8em 0;
        padding-bottom: 0.5em;
        border-bottom: 3px solid #ec4899;
        page-break-after: avoid;
        line-height: 1.2;
    }
    
    h2 {
        font-family: 'Inter', 'Helvetica Neue', 'Arial', sans-serif;
        font-size: 20pt;
        font-weight: 600;
        color: #7c3aed;
        margin: 1.2em 0 0.6em 0;
        page-break-after: avoid;
        line-height: 1.3;
    }
    
    h3 {
        font-family: 'Inter', 'Helvetica Neue', 'Arial', sans-serif;
        font-size: 16pt;
        font-weight: 600;
        color: #6d28d9;
        margin: 1em 0 0.5em 0;
        page-break-after: avoid;
        line-height: 1.4;
    }
    
    h4, h5, h6 {
        font-family: 'Inter', 'Helvetica Neue', 'Arial', sans-serif;
        font-weight: 600;
        color: #a78bfa;
        margin: 0.8em 0 0.4em 0;
        page-break-after: avoid;
    }
    
    /* Parágrafos */
    p {
        margin: 0.8em 0;
        text-indent: 0;
        line-height: 1.75;
        color: #1a1a1a;
    }
    
    /* Texto em destaque */
    
    strong, b {
        font-weight: 600;
        color: #1a1a1a;
    }
    
    em, i {
        font-style: italic;
        color: #374151;
    }
    
    /* Imagens */
    img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 1.5em auto;
        page-break-inside: avoid;
        border-radius: 8px;
    }
    
    /* Listas */
    ul, ol {
        margin: 1em 0;
        padding-left: 2.5em;
        line-height: 1.75;
        color: #1a1a1a;
    }
    
    li {
        margin: 0.4em 0;
        color: #1a1a1a;
    }
    
    li p {
        margin: 0.2em 0;
        display: inline;
    }
    
    /* Links - Rosa do style guide */
    a {
        color: #ec4899;
        text-decoration: none;
        font-weight: 500;
    }
    
    /* Blockquotes - Com bordas coloridas */
    blockquote {
        margin: 1.5em 2em;
        padding: 1em 1.5em;
        border-left: 4px solid #8b5cf6;
        background-color: #f9fafb;
        font-style: italic;
        color: #4b5563;
    }
    
    /* Code - Estilo do JetBrains Mono */
    code {
        font-family: 'JetBrains Mono', 'Courier New', monospace;
        background-color: #f3f4f6;
        color: #ec4899;
        padding: 0.2em 0.4em;
        border-radius: 4px;
        font-size: 0.9em;
    }
    
    pre {
        background-color: #f9fafb;
        color: #1f2937;
        padding: 1.5em;
        overflow-x: auto;
        border-left: 4px solid #8b5cf6;
        border-radius: 8px;
        margin: 1.5em 0;
    }
    
    pre code {
        background-color: transparent;
        color: #1f2937;
        padding: 0;
    }
    
    /* Tabelas */
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5em 0;
    }
    
    th, td {
        padding: 0.75em;
        border: 1px solid #e5e7eb;
        text-align: left;
        color: #1a1a1a;
    }
    
    th {
        background-color: #8b5cf6;
        color: white;
        font-weight: 600;
        font-family: 'Inter', sans-serif;
    }
    
    tr:nth-child(even) {
        background-color: #f9fafb;
    }
    
    tr:nth-child(odd) {
        background-color: #ffffff;
    }
    
    /* Quebra de página */
    .page-break {
        page-break-before: always;
    }
    
    /* Capa - Estilo brutalismo digital */
    .cover {
        text-align: center;
        padding-top: 6cm;
    }
    
    .cover h1 {
        font-size: 42pt;
        font-weight: 700;
        border: none;
        margin-bottom: 0.5em;
        color: #8b5cf6;
        line-height: 1.1;
    }
    
    .cover .subtitle {
        font-size: 18pt;
        font-weight: 500;
        margin: 1.5em 0;
        color: #ec4899;
        line-height: 1.4;
    }
    
    .cover .author {
        font-size: 16pt;
        font-weight: 600;
        margin-top: 4em;
        color: #2d3748;
    }
    
    .cover .license {
        font-size: 11pt;
        margin-top: 1.5em;
        color: #9ca3af;
        font-weight: 400;
    }
    
    /* Número de capítulo */
    .chapter-number {
        font-size: 12pt;
        font-weight: 600;
        color: #a78bfa;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.5em;
    }
    
    /* Diagramas e elementos visuais */
    .diagram-content {
        background-color: #f9fafb;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        padding: 1.5em;
        margin: 2em 0;
    }
    
    .diagram-title {
        font-weight: 600;
        color: #7c3aed;
        margin-bottom: 1em;
        font-size: 12pt;
    }
    
    /* Ocultar elementos não desejados */
    header, footer, nav, button, script, style, .mobile-menu-btn, 
    .sidebar, .back-to-top, .mobile-overlay, .sidebar-overlay {
        display: none !important;
    }
    """

    # Construir HTML completo
    html_parts = []

    # Cabeçalho do documento
    html_parts.append(
        """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>A Revolução Cibernética</title>
    <style>
"""
        + pdf_css
        + """
    </style>
</head>
<body>
"""
    )

    # Página de título - Estilo brutalismo digital
    html_parts.append(
        """
<div class="cover">
    <h1>A Revolução<br/>Cibernética</h1>
    <div class="subtitle">
        Uma Ontologia Relacional<br/>
        para o Século XXI
    </div>
    <div class="author">O Besta Fera</div>
    <div class="license">
        Creative Commons BY-SA 4.0<br/>
        Outubro 2025
    </div>
</div>
<div class="page-break"></div>
"""
    )

    # Processar index.html
    print("Processando index.html...")
    try:
        with open("index.html", "r", encoding="utf-8") as f:
            content = f.read()

        soup = BeautifulSoup(content, "html.parser")
        main_content = soup.find("main") or soup.find("article") or soup.find("body")

        if main_content:
            # Limpar elementos desnecessários
            for element in main_content.find_all(
                ["script", "style", "nav", "header", "footer", "button", "noscript"]
            ):
                element.decompose()

            # Remover estilos inline que usam variáveis CSS
            for element in main_content.find_all(style=True):
                del element["style"]

            # Remover classes e atributos que podem causar problemas
            for element in main_content.find_all(True):
                if element.name not in [
                    "img",
                    "a",
                    "h1",
                    "h2",
                    "h3",
                    "p",
                    "ul",
                    "ol",
                    "li",
                    "blockquote",
                    "code",
                    "pre",
                ]:
                    element.attrs = {
                        k: v
                        for k, v in element.attrs.items()
                        if k in ["href", "src", "alt"]
                    }

            html_parts.append(str(main_content))
            print("✓ index.html processado")
    except Exception as e:
        print(f"✗ Erro ao processar index.html: {e}")

    # Adicionar quebra de página
    html_parts.append('<div class="page-break"></div>')

    # Processar manifesto.html
    print("Processando manifesto.html...")
    try:
        with open("manifesto.html", "r", encoding="utf-8") as f:
            content = f.read()

        soup = BeautifulSoup(content, "html.parser")
        main_content = soup.find("main") or soup.find("article") or soup.find("body")

        if main_content:
            # Limpar elementos desnecessários
            for element in main_content.find_all(
                ["script", "style", "nav", "header", "footer", "button", "noscript"]
            ):
                element.decompose()

            # Remover estilos inline que usam variáveis CSS
            for element in main_content.find_all(style=True):
                del element["style"]

            # Remover classes e atributos que podem causar problemas
            for element in main_content.find_all(True):
                if element.name not in [
                    "img",
                    "a",
                    "h1",
                    "h2",
                    "h3",
                    "p",
                    "ul",
                    "ol",
                    "li",
                    "blockquote",
                    "code",
                    "pre",
                ]:
                    element.attrs = {
                        k: v
                        for k, v in element.attrs.items()
                        if k in ["href", "src", "alt"]
                    }

            html_parts.append(str(main_content))
            print("✓ manifesto.html processado")
    except Exception as e:
        print(f"✗ Erro ao processar manifesto.html: {e}")

    # Adicionar quebra de página
    html_parts.append('<div class="page-break"></div>')

    # Processar constituicao_2.0.html
    print("Processando constituicao_2.0.html...")
    try:
        with open("constituicao_2.0.html", "r", encoding="utf-8") as f:
            content = f.read()

        soup = BeautifulSoup(content, "html.parser")
        main_content = soup.find("main") or soup.find("article") or soup.find("body")

        if main_content:
            # Limpar elementos desnecessários
            for element in main_content.find_all(
                ["script", "style", "nav", "header", "footer", "button", "noscript"]
            ):
                element.decompose()

            # Remover estilos inline que usam variáveis CSS
            for element in main_content.find_all(style=True):
                del element["style"]

            # Remover classes e atributos que podem causar problemas
            for element in main_content.find_all(True):
                if element.name not in [
                    "img",
                    "a",
                    "h1",
                    "h2",
                    "h3",
                    "p",
                    "ul",
                    "ol",
                    "li",
                    "blockquote",
                    "code",
                    "pre",
                ]:
                    element.attrs = {
                        k: v
                        for k, v in element.attrs.items()
                        if k in ["href", "src", "alt"]
                    }

            html_parts.append(str(main_content))
            print("✓ constituicao_2.0.html processado")
    except Exception as e:
        print(f"✗ Erro ao processar constituicao_2.0.html: {e}")

    # Adicionar quebra de página
    html_parts.append('<div class="page-break"></div>')

    # Processar ∅.html
    print("Processando ∅.html...")
    try:
        with open("∅.html", "r", encoding="utf-8") as f:
            content = f.read()

        soup = BeautifulSoup(content, "html.parser")
        main_content = soup.find("main") or soup.find("article") or soup.find("body")

        if main_content:
            # Limpar elementos desnecessários
            for element in main_content.find_all(
                ["script", "style", "nav", "header", "footer", "button", "noscript"]
            ):
                element.decompose()

            # Remover estilos inline que usam variáveis CSS
            for element in main_content.find_all(style=True):
                del element["style"]

            # Remover classes e atributos que podem causar problemas
            for element in main_content.find_all(True):
                if element.name not in [
                    "img",
                    "a",
                    "h1",
                    "h2",
                    "h3",
                    "p",
                    "ul",
                    "ol",
                    "li",
                    "blockquote",
                    "code",
                    "pre",
                ]:
                    element.attrs = {
                        k: v
                        for k, v in element.attrs.items()
                        if k in ["href", "src", "alt"]
                    }

            html_parts.append(str(main_content))
            print("✓ ∅.html processado")
    except Exception as e:
        print(f"✗ Erro ao processar ∅.html: {e}")

    # Rodapé do documento
    html_parts.append(
        """
</body>
</html>
"""
    )

    # Combinar tudo
    intermediate_html = "".join(html_parts)

    # Comprimir e embutir imagens (conversão para base64)
    print("\nComprimindo e embutindo imagens...")
    final_html = compress_and_embed_images_in_html(intermediate_html, quality=55)

    # Gerar PDF
    output_file = "docs/revolucao_cibernetica.pdf"
    print(f"\nGerando arquivo PDF: {output_file}")

    # Usar xhtml2pdf para converter HTML em PDF
    # Suprimir warnings do xhtml2pdf redirecionando stdout e stderr temporariamente
    import io

    stdout_backup = sys.stdout
    stderr_backup = sys.stderr
    sys.stdout = io.StringIO()
    sys.stderr = io.StringIO()

    try:
        with open(output_file, "wb") as pdf_file:
            pisa_status = pisa.CreatePDF(final_html, dest=pdf_file, encoding="utf-8")

        sys.stdout = stdout_backup
        sys.stderr = stderr_backup

        if pisa_status.err:
            raise Exception(f"Erro ao gerar PDF: {pisa_status.err}")
    except Exception as e:
        sys.stdout = stdout_backup
        sys.stderr = stderr_backup
        raise e

    print(f"✓ PDF criado com sucesso: {output_file}")

    # Estatísticas
    file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB
    print("\n" + "=" * 60)
    print("📊 ESTATÍSTICAS DA EXPORTAÇÃO")
    print("=" * 60)
    print(f"📄 Arquivo: {output_file}")
    print(f"💾 Tamanho: {file_size:.2f} MB")
    print("=" * 60)

    return output_file


def create_xml(minify: bool = False) -> str:
    """
    Cria um arquivo XML estruturado para consumo de agentes de IA.

    Args:
        minify: Se True, gera XML minificado (sem espaços em branco)

    Estrutura otimizada para:
    - Processamento automático por LLMs
    - Análise semântica e extração de conceitos
    - Feedback loops e sistemas de RAG
    - Indexação e busca vetorial
    """

    format_type = "minificado" if minify else "formatado"
    print(f"Iniciando exportação XML para agentes de IA ({format_type})...")
    print()

    # Criar elemento raiz
    root = ET.Element("revolucao_cibernetica")
    root.set("version", "1.0")
    root.set("format", "ai_structured")
    # Preserve previous 'generated' timestamp if file exists to avoid spurious diffs
    prev_generated = None
    prev_xml = "docs/revolucao_cibernetica.xml"
    prev_min_xml = "docs/revolucao_cibernetica.min.xml"
    try:
        if os.path.exists(prev_xml):
            prev_dom = ET.parse(prev_xml)
            prev_root = prev_dom.getroot()
            prev_generated = prev_root.get("generated")
        elif os.path.exists(prev_min_xml):
            prev_dom = ET.parse(prev_min_xml)
            prev_root = prev_dom.getroot()
            prev_generated = prev_root.get("generated")
    except Exception:
        prev_generated = None

    if prev_generated:
        root.set("generated", prev_generated)
    else:
        root.set("generated", datetime.now().isoformat())

    # Metadados
    metadata = ET.SubElement(root, "metadata")
    ET.SubElement(metadata, "title").text = "A Revolução Cibernética"
    ET.SubElement(metadata, "subtitle").text = (
        "Uma Ontologia Relacional para a Era da Informação"
    )
    ET.SubElement(metadata, "author").text = "O Besta Fera"
    ET.SubElement(metadata, "language").text = "pt-BR"
    ET.SubElement(metadata, "license").text = "Creative Commons BY-SA 4.0"
    ET.SubElement(metadata, "url").text = "https://obestafera.com"
    ET.SubElement(metadata, "description").text = (
        "Ensaio filosófico sobre cibernética, ontologia relacional e a transformação da subjetividade na era digital."
    )

    # Tags para categorização
    tags_elem = ET.SubElement(metadata, "tags")
    tags = [
        "cibernética",
        "ontologia relacional",
        "filosofia da tecnologia",
        "teoria dos sistemas",
        "Gregory Bateson",
        "Gilles Deleuze",
        "Félix Guattari",
        "segunda ordem",
        "epistemologia",
        "praxis política",
    ]
    for tag in tags:
        ET.SubElement(tags_elem, "tag").text = tag

    # Processando arquivos HTML
    html_files = [
        "index.html",
        "manifesto.html",
        "constituicao_2.0.html",
        "constituicao_2.0_completa.html",
        "∅.html",
    ]

    for html_file in html_files:
        print(f"Processando {html_file}...")

        with open(html_file, "r", encoding="utf-8") as f:
            content = f.read()

        soup = BeautifulSoup(content, "html.parser")
        main_content = soup.find("main") or soup.find("article") or soup.find("body")

        if not main_content:
            continue

        # Determinar tipo de documento
        if html_file == "index.html":
            doc_type = "teoria"
        elif html_file == "manifesto.html":
            doc_type = "manifesto"
        elif html_file == "constituicao_2.0.html":
            doc_type = "constituicao_visao_geral"
        elif html_file == "constituicao_2.0_completa.html":
            doc_type = "constituicao_completa"
        elif html_file == "∅.html":
            doc_type = "ordem_zero"
        else:
            doc_type = "documento"

        document = ET.SubElement(root, "document")
        document.set("type", doc_type)
        document.set("source", html_file)

        # Extrair capítulos/seções
        sections = main_content.find_all(["section", "article"])
        if not sections:
            # Se não houver sections, usar o próprio main como seção única
            sections = [main_content]

        section_count = 0
        for section in sections:
            section_count += 1

            # Buscar título da seção
            title_elem = section.find(["h1", "h2", "h3"])
            if not title_elem:
                continue

            title_text = title_elem.get_text(strip=True)

            # Criar elemento de seção
            section_elem = ET.SubElement(document, "section")
            section_elem.set("id", f"{doc_type}_{section_count}")
            ET.SubElement(section_elem, "title").text = title_text

            # Extrair nível hierárquico
            level = (
                int(title_elem.name[1])
                if title_elem.name in ["h1", "h2", "h3", "h4", "h5", "h6"]
                else 1
            )
            section_elem.set("level", str(level))

            # Extrair parágrafos
            paragraphs = section.find_all("p", recursive=False)
            if paragraphs:
                content_elem = ET.SubElement(section_elem, "content")
                for i, p in enumerate(paragraphs):
                    p_text = p.get_text(strip=True)
                    if p_text:
                        para_elem = ET.SubElement(content_elem, "paragraph")
                        para_elem.set("index", str(i))
                        para_elem.text = p_text

            # Extrair blockquotes (citações)
            blockquotes = section.find_all("blockquote")
            if blockquotes:
                quotes_elem = ET.SubElement(section_elem, "quotes")
                for i, bq in enumerate(blockquotes):
                    quote_text = bq.get_text(strip=True)
                    if quote_text:
                        quote_elem = ET.SubElement(quotes_elem, "quote")
                        quote_elem.set("index", str(i))
                        quote_elem.text = quote_text

            # Extrair listas
            lists = section.find_all(["ul", "ol"])
            if lists:
                lists_elem = ET.SubElement(section_elem, "lists")
                for list_idx, lst in enumerate(lists):
                    list_elem = ET.SubElement(lists_elem, "list")
                    list_elem.set(
                        "type", "ordered" if lst.name == "ol" else "unordered"
                    )
                    list_elem.set("index", str(list_idx))

                    items = lst.find_all("li", recursive=False)
                    for item_idx, item in enumerate(items):
                        item_text = item.get_text(strip=True)
                        if item_text:
                            item_elem = ET.SubElement(list_elem, "item")
                            item_elem.set("index", str(item_idx))
                            item_elem.text = item_text

            # Extrair código (se houver)
            code_blocks = section.find_all(["code", "pre"])
            if code_blocks:
                code_elem = ET.SubElement(section_elem, "code_blocks")
                for code_idx, code in enumerate(code_blocks):
                    code_text = code.get_text(strip=True)
                    if code_text:
                        block_elem = ET.SubElement(code_elem, "code")
                        block_elem.set("index", str(code_idx))
                        block_elem.text = code_text

            # Extrair imagens (referências)
            images = section.find_all("img")
            if images:
                images_elem = ET.SubElement(section_elem, "images")
                for img_idx, img in enumerate(images):
                    img_src = img.get("src", "")
                    img_alt = img.get("alt", "")
                    if img_src:
                        img_elem = ET.SubElement(images_elem, "image")
                        img_elem.set("index", str(img_idx))
                        img_elem.set("src", img_src)
                        if img_alt:
                            img_elem.set("alt", img_alt)

            # Extrair conceitos-chave (palavras em strong/em)
            concepts = section.find_all(["strong", "em", "b", "i"])
            if concepts:
                concepts_elem = ET.SubElement(section_elem, "key_concepts")
                seen_concepts = set()
                for concept in concepts:
                    concept_text = concept.get_text(strip=True)
                    if (
                        concept_text
                        and concept_text not in seen_concepts
                        and len(concept_text) > 3
                    ):
                        seen_concepts.add(concept_text)
                        concept_elem = ET.SubElement(concepts_elem, "concept")
                        concept_elem.text = concept_text

        print(f"✓ {html_file} processado - {section_count} seções extraídas")

    # Adicionar glossário de conceitos principais
    glossary = ET.SubElement(root, "glossary")
    glossary.set("description", "Conceitos fundamentais da Revolução Cibernética")

    key_concepts = {
        "Cibernética de Segunda Ordem": "Sistema que observa a si mesmo observando. O observador é parte do sistema observado.",
        "Ontologia Relacional": "Compreensão do ser como fundamentalmente constituído por relações, não por substâncias isoladas.",
        "Multiplicidades": "Conceito de Deleuze e Guattari para entidades que não são nem Uno nem múltiplo, mas processos de diferenciação.",
        "Rizoma": "Modelo não-hierárquico de organização do conhecimento e das relações, sem centro ou estrutura arborescente.",
        "Feedback Loop": "Ciclo de retroalimentação onde a saída de um sistema retorna como entrada, modificando o próprio sistema.",
        "Autopoiese": "Capacidade de um sistema de produzir e manter a si mesmo através de suas próprias operações.",
        "Enação": "Processo pelo qual um organismo e seu ambiente se constituem mutuamente através da ação.",
        "Diferença que faz diferença": "Definição batesoniana de informação como padrão que gera transformação.",
    }

    for concept_name, concept_def in key_concepts.items():
        entry = ET.SubElement(glossary, "entry")
        ET.SubElement(entry, "term").text = concept_name
        ET.SubElement(entry, "definition").text = concept_def

    # Adicionar instruções para agentes de IA
    ai_instructions = ET.SubElement(root, "ai_processing_hints")
    ai_instructions.set("purpose", "Orientações para processamento por agentes de IA")

    hints = [
        "Este documento apresenta uma ontologia relacional baseada em cibernética de segunda ordem.",
        "Conceitos-chave devem ser compreendidos de forma sistêmica e relacional, não isoladamente.",
        "O texto dialoga com autores como Bateson, Deleuze, Guattari, Varela e Maturana.",
        "A estrutura é não-linear: conceitos se entrelaçam e se referenciam mutuamente.",
        "Para análise semântica: priorize relações entre conceitos em vez de definições estáticas.",
        "Para RAG: use embeddings relacionais que capturem interdependências conceituais.",
        "Para feedback loops: relacione conceitos do texto com queries do usuário de forma cibernética.",
        "Ontologia central: tudo é relação, processo, devir - não substância fixa.",
    ]

    for i, hint in enumerate(hints):
        hint_elem = ET.SubElement(ai_instructions, "hint")
        hint_elem.set("priority", str(i + 1))
        hint_elem.text = hint

    # Adicionar estrutura de temas principais
    themes = ET.SubElement(root, "main_themes")

    theme_structure = [
        {
            "name": "Ontologia Relacional",
            "description": "Fundamento filosófico que compreende o ser como relação",
            "keywords": ["relação", "devir", "multiplicidades", "rizoma", "diferença"],
        },
        {
            "name": "Cibernética de Segunda Ordem",
            "description": "Sistemas que observam a si mesmos, incluindo o observador",
            "keywords": [
                "observador",
                "auto-referência",
                "recursividade",
                "feedback",
                "autopoiese",
            ],
        },
        {
            "name": "Epistemologia",
            "description": "Como conhecemos e como a informação circula em sistemas",
            "keywords": ["informação", "padrão", "diferença", "contexto", "enação"],
        },
        {
            "name": "Ética e Praxis",
            "description": "Implicações políticas e éticas da ontologia relacional",
            "keywords": [
                "práxis",
                "política",
                "subjetividade",
                "transformação",
                "responsabilidade",
            ],
        },
    ]

    for theme_data in theme_structure:
        theme_elem = ET.SubElement(themes, "theme")
        ET.SubElement(theme_elem, "name").text = theme_data["name"]
        ET.SubElement(theme_elem, "description").text = theme_data["description"]

        keywords_elem = ET.SubElement(theme_elem, "keywords")
        for keyword in theme_data["keywords"]:
            ET.SubElement(keywords_elem, "keyword").text = keyword

    # Converter para string XML formatada
    xml_string = ET.tostring(root, encoding="utf-8")

    if minify:
        # XML minificado (sem formatação)
        # Remover declaração XML padrão e adicionar nossa própria
        output_file = "docs/revolucao_cibernetica.min.xml"
        with open(output_file, "wb") as f:
            f.write(b'<?xml version="1.0" encoding="utf-8"?>')
            f.write(xml_string)
    else:
        # Usar minidom para formatar com indentação
        dom = minidom.parseString(xml_string)
        pretty_xml = dom.toprettyxml(indent="  ", encoding="utf-8")

        # Salvar arquivo
        output_file = "docs/revolucao_cibernetica.xml"
        with open(output_file, "wb") as f:
            f.write(pretty_xml)

    # Estatísticas
    file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB

    print()
    print("=" * 60)
    print("📊 ESTATÍSTICAS DA EXPORTAÇÃO XML")
    print("=" * 60)
    print(f"📄 Arquivo: {output_file}")
    print(f"💾 Tamanho: {file_size:.2f} MB")
    print(f"📦 Formato: {'Minificado' if minify else 'Formatado (legível)'}")
    print("🤖 Otimizado para: LLMs, RAG, Análise Semântica")
    print("=" * 60)

    return output_file


def create_jsonl():
    """
    Cria um arquivo JSONL (JSON Lines) otimizado para LLMs.

    Formato: Uma linha JSON por parágrafo, ideal para:
    - Streaming e processamento linha a linha
    - Embeddings e vetorização (cada linha = 1 chunk)
    - Fine-tuning de LLMs (formato OpenAI)
    - RAG systems (Retrieval-Augmented Generation)
    - Vector databases (Pinecone, Weaviate, etc)

    Vantagens sobre XML:
    - ~40% menos tokens
    - Parsing extremamente rápido
    - Streaming-friendly
    - Compatível com todos os frameworks de IA
    """

    print("Iniciando exportação JSONL para LLMs...")
    print()

    import json

    output_file = "docs/revolucao_cibernetica.jsonl"

    # Contador de parágrafos
    paragraph_count = 0

    # Processando arquivos HTML
    html_files = ["index.html", "manifesto.html"]

    with open(output_file, "w", encoding="utf-8") as jsonl_file:
        for html_file in html_files:
            print(f"Processando {html_file}...")

            with open(html_file, "r", encoding="utf-8") as f:
                content = f.read()

            soup = BeautifulSoup(content, "html.parser")
            main_content = (
                soup.find("main") or soup.find("article") or soup.find("body")
            )

            if not main_content:
                continue

            # Determinar tipo de documento
            doc_type = "teoria" if html_file == "index.html" else "manifesto"

            # Processar seções
            sections = main_content.find_all("section", class_="chapter")

            for section in sections:
                # Obter ID e título da seção
                section_id = section.get("id", "unknown")
                section_title_elem = section.find(["h1", "h2", "h3"])
                section_title = (
                    section_title_elem.get_text(strip=True)
                    if section_title_elem
                    else "Sem título"
                )

                # Processar parágrafos
                paragraphs = section.find_all("p")

                for p_idx, p in enumerate(paragraphs):
                    text = p.get_text(strip=True)

                    # Ignorar parágrafos vazios ou muito curtos
                    if not text or len(text) < 10:
                        continue

                    paragraph_count += 1

                    # Extrair conceitos de <strong> e <em>
                    concepts = []
                    for strong in p.find_all(["strong", "em"]):
                        concept = strong.get_text(strip=True)
                        if concept and len(concept) > 2:
                            concepts.append(concept)

                    # Criar objeto JSON para esta linha
                    json_obj = {
                        "id": f"{section_id}_p{p_idx + 1}",
                        "paragraph_number": paragraph_count,
                        "document_type": doc_type,
                        "section_id": section_id,
                        "section_title": section_title,
                        "text": text,
                        "concepts": list(set(concepts)),  # Remove duplicatas
                        "char_count": len(text),
                        "word_count": len(text.split()),
                    }

                    # Escrever linha JSONL (um JSON por linha)
                    jsonl_file.write(json.dumps(json_obj, ensure_ascii=False) + "\n")

        # Adicionar metadados como última linha (opcional)
        # Preserve previous 'generated' timestamp if present to avoid spurious diffs
        prev_generated = None
        try:
            if os.path.exists(output_file):
                with open(output_file, "r", encoding="utf-8") as _f:
                    lines = _f.read().splitlines()
                    if lines:
                        try:
                            import json as _json

                            last = _json.loads(lines[-1])
                            prev_generated = last.get("generated")
                        except Exception:
                            prev_generated = None
        except Exception:
            prev_generated = None

        metadata_obj = {
            "id": "_metadata",
            "type": "metadata",
            "title": "A Revolução Cibernética",
            "subtitle": "Uma Ontologia Relacional para a Era da Informação",
            "author": "O Besta Fera",
            "language": "pt-BR",
            "license": "Creative Commons BY-SA 4.0",
            "url": "https://obestafera.com",
            "total_paragraphs": paragraph_count,
            "generated": prev_generated or datetime.now().isoformat(),
            "format": "jsonl",
            "optimized_for": ["embeddings", "rag", "fine-tuning", "streaming"],
            "tags": [
                "cibernética",
                "ontologia relacional",
                "filosofia da tecnologia",
                "teoria dos sistemas",
                "Gregory Bateson",
                "Gilles Deleuze",
                "segunda ordem",
                "epistemologia",
                "praxis política",
            ],
            "glossary": {
                "Ontologia Relacional": "O ser é constituído por relações, não por essências isoladas.",
                "Cibernética de Segunda Ordem": "Sistemas que incluem o observador no sistema observado.",
                "Autopoiese": "Capacidade de sistemas vivos se produzirem e manterem a si mesmos.",
                "Diferença que faz diferença": "Definição batesoniana de informação como padrão que gera transformação.",
                "Rizoma": "Modelo de conhecimento não-hierárquico com múltiplas conexões.",
                "Multiplicidades": "Entidades que são muitas sem ser uma totalidade unificada.",
                "Enação": "Conhecimento emerge da interação incorporada com o mundo.",
                "Feedback Loop": "Processo circular onde saídas alimentam entradas do sistema.",
            },
            "processing_hints": [
                "Este documento apresenta uma ontologia relacional baseada em cibernética de segunda ordem.",
                "Conceitos-chave devem ser compreendidos de forma sistêmica e relacional.",
                "Para embeddings: cada linha JSONL representa um chunk ideal para vetorização.",
                'Para RAG: use campo "concepts" para melhorar retrieval contextual.',
                "Para streaming: processe linha a linha sem carregar tudo na memória.",
            ],
        }

        jsonl_file.write(json.dumps(metadata_obj, ensure_ascii=False) + "\n")

    # Estatísticas
    file_size = os.path.getsize(output_file) / (1024 * 1024)  # MB

    print()
    print("=" * 60)
    print("📊 ESTATÍSTICAS DA EXPORTAÇÃO JSONL")
    print("=" * 60)
    print(f"📄 Arquivo: {output_file}")
    print(f"💾 Tamanho: {file_size:.2f} MB")
    print(f"📝 Parágrafos: {paragraph_count:,}")
    print("🤖 Formato: JSON Lines (streaming)")
    print("✨ Otimizado para: Embeddings, RAG, Fine-tuning, LLMs")
    print("⚡ Compatível com: OpenAI, LangChain, Pinecone, Weaviate")
    print("=" * 60)
    print()
    print("💡 EXEMPLO DE USO:")
    print("=" * 60)
    print("# Python - Processar linha a linha")
    print("import json")
    print(f"with open('{output_file}', 'r') as f:")
    print("    for line in f:")
    print("        obj = json.loads(line)")
    print("        print(obj['section_title'], obj['text'][:50])")
    print()
    print("# LangChain - Carregar como documentos")
    print("from langchain.document_loaders import JSONLoader")
    print(f"loader = JSONLoader('{output_file}', jq_schema='.', text_content=False)")
    print("documents = loader.load()")
    print("=" * 60)

    return output_file


def create_rizoma_exports():
    """
    Gera/atualiza os arquivos do rizoma em `docs/` a partir do JSON existente em `docs/rizoma-revolucao-cibernetica.json`.

    Produz:
    - docs/rizoma-revolucao-cibernetica.json (copiado/atualizado)
    - docs/rizoma-revolucao-cibernetica.graphml
    - docs/rizoma-revolucao-cibernetica.md
    - docs/rizoma-nodes.csv
    - docs/rizoma-edges.csv
    """

    import json

    os.makedirs("docs", exist_ok=True)

    src_json = "docs/rizoma-revolucao-cibernetica.json"
    if not os.path.exists(src_json):
        print(f"⚠ Arquivo do rizoma não encontrado: {src_json}")
        print(
            "⚠ Se o rizoma for gerado apenas pelo client-side, gere/cole o JSON em docs/ primeiro."
        )
        return None

    print(f"Carregando rizoma existente: {src_json}")
    with open(src_json, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Atualizar timestamp apenas se ausente, para evitar diffs por timestamp em todas execuções
    if "meta" in data:
        if not data["meta"].get("exported_at"):
            data["meta"]["exported_at"] = datetime.now(timezone.utc).isoformat()

    # Re-escrever JSON (formatado) para garantir consistência
    out_json = "docs/rizoma-revolucao-cibernetica.json"
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✓ JSON do rizoma salvo: {out_json}")

    # Gerar GraphML
    try:
        graphml_header = (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<graphml xmlns="http://graphml.graphdrawing.org/xmlns"\n'
            '         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n'
            '         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns\n'
            '         http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n'
        )

        keys = (
            '  <key id="name" for="node" attr.name="name" attr.type="string"/>\n'
            '  <key id="description" for="node" attr.name="description" attr.type="string"/>\n'
            '  <key id="color" for="node" attr.name="color" attr.type="string"/>\n'
            '  <key id="layer" for="node" attr.name="layer" attr.type="int"/>\n'
        )

        xml = graphml_header + keys + '  <graph id="Rizoma" edgedefault="undirected">\n'

        # Nós
        for node in data.get("nodes", []):
            node_id = node.get("id")
            name = (
                str(node.get("name", ""))
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
            )
            description = (
                str(node.get("description", ""))
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
            )
            color = node.get("color", "")
            layer = node.get("layer", "")

            xml += f'    <node id="{node_id}">\n'
            xml += f'      <data key="name">{name}</data>\n'
            xml += f'      <data key="description">{description}</data>\n'
            xml += f'      <data key="color">{color}</data>\n'
            xml += f'      <data key="layer">{layer}</data>\n'
            xml += "    </node>\n"

        # Arestas (sem duplicatas)
        edges_added = set()
        for node in data.get("nodes", []):
            src = node.get("id")
            for tgt in node.get("connections", []) or []:
                key = "|".join(sorted([src, tgt]))
                if key in edges_added:
                    continue
                xml += f'    <edge source="{src}" target="{tgt}"/>\n'
                edges_added.add(key)

        xml += "  </graph>\n</graphml>"

        out_graphml = "docs/rizoma-revolucao-cibernetica.graphml"
        with open(out_graphml, "w", encoding="utf-8") as f:
            f.write(xml)

        print(f"✓ GraphML gerado: {out_graphml}")
    except Exception as e:
        print(f"✗ Erro ao gerar GraphML: {e}")

    # Gerar Markdown
    try:
        md = []
        md.append(f"# {data.get('meta', {}).get('title', 'Rizoma')}\n")
        md.append(f"**Versão:** {data.get('meta', {}).get('version', '')}  \n")
        md.append(f"**Data:** {data.get('meta', {}).get('date', '')}  \n")
        md.append(f"**Total de Conceitos:** {len(data.get('nodes', []))}\n\n")

        md.append("## 📊 Estatísticas\n\n")
        colors = {n.get("color") for n in data.get("nodes", [])}
        md.append(f"- **Cores usadas:** {len(colors)}\n\n")

        # Por camada
        for layer_label, layer_name in [
            (-1, "Passado (-1)"),
            (0, "Presente (0)"),
            (1, "Futuro (+1)"),
        ]:
            md.append(f"### Camada {layer_label}: {layer_name}\n\n")
            nodes_in_layer = [
                n for n in data.get("nodes", []) if n.get("layer") == layer_label
            ]
            nodes_in_layer = sorted(nodes_in_layer, key=lambda x: x.get("name", ""))
            for n in nodes_in_layer:
                md.append(f"#### {n.get('name')} (`{n.get('id')}`)\n\n")
                md.append(f"{n.get('description')}\n\n")
                md.append(
                    f"**Conexões:** {', '.join([f'`{c}`' for c in n.get('connections', [])])}\n\n"
                )
                md.append("---\n\n")

        md.append("\n*Gerado automaticamente pelo export_file.py*")

        out_md = "docs/rizoma-revolucao-cibernetica.md"
        with open(out_md, "w", encoding="utf-8") as f:
            f.write("".join(md))

        print(f"✓ Markdown gerado: {out_md}")
    except Exception as e:
        print(f"✗ Erro ao gerar Markdown: {e}")

    # Gerar CSVs de nós e arestas
    try:
        nodes_csv = "id,name,description,color,layer,connections_count\n"
        for n in data.get("nodes", []):
            nodes_csv += '"{}","{}","{}","{}",{},{}\n'.format(
                n.get("id", ""),
                n.get("name", "").replace('"', '""'),
                n.get("description", "").replace('"', '""'),
                n.get("color", ""),
                n.get("layer", ""),
                len(n.get("connections", [])),
            )

        edges_csv = "source,target\n"
        edges_added = set()
        for n in data.get("nodes", []):
            src = n.get("id")
            for tgt in n.get("connections", []) or []:
                key = "|".join(sorted([src, tgt]))
                if key in edges_added:
                    continue
                edges_csv += f'"{src}","{tgt}"\n'
                edges_added.add(key)

        out_nodes = "docs/rizoma-nodes.csv"
        out_edges = "docs/rizoma-edges.csv"
        with open(out_nodes, "w", encoding="utf-8") as f:
            f.write(nodes_csv)
        with open(out_edges, "w", encoding="utf-8") as f:
            f.write(edges_csv)

        print(f"✓ CSVs gerados: {out_nodes}, {out_edges}")
    except Exception as e:
        print(f"✗ Erro ao gerar CSVs: {e}")

    return [out_json, out_graphml, out_md, out_nodes, out_edges]


if __name__ == "__main__":
    print("=" * 60)
    print("Exportador - A Revolução Cibernética")
    print("=" * 60)
    print()

    # Verificar argumentos
    formato = "epub"  # Padrão
    if len(sys.argv) > 1:
        formato = sys.argv[1].lower()

    if formato not in ["epub", "pdf", "xml", "xml-min", "jsonl", "rizoma", "all"]:
        print("❌ Formato inválido!")
        print("Uso: python export_file.py [epub|pdf|xml|xml-min|jsonl|rizoma|all]")
        print()
        print("Formatos disponíveis:")
        print("  epub    - Livro eletrônico (EPUB 3.0)")
        print("  pdf     - Documento PDF")
        print("  xml     - Estrutura XML para agentes de IA (formatado)")
        print("  xml-min - XML minificado (compacto, sem espaços)")
        print("  jsonl   - JSON Lines (otimizado para LLMs, streaming, RAG)")
        print("  all     - Exportar todos os formatos")
        print("  rizoma  - Gerar/exportar arquivos do Rizoma (JSON/GraphML/MD/CSV)")
        sys.exit(1)

    try:
        if formato == "all":
            print("Formato selecionado: TODOS\n")
            outputs = []

            print("📚 Exportando EPUB...")
            outputs.append(create_epub())
            print("✅ EPUB concluído!\n")

            print("📄 Exportando PDF...")
            outputs.append(create_pdf())
            print("✅ PDF concluído!\n")

            print("🗂️ Exportando XML...")
            outputs.append(create_xml(minify=False))
            print("✅ XML concluído!\n")

            print("🗜️ Exportando XML Minificado...")
            outputs.append(create_xml(minify=True))
            print("✅ XML Minificado concluído!\n")

            print("📋 Exportando JSONL...")
            outputs.append(create_jsonl())
            print("✅ JSONL concluído!\n")

            print("🌀 Exportando Rizoma (JSON/GraphML/MD/CSV)...")
            rizoma_outs = create_rizoma_exports()
            if rizoma_outs:
                outputs.extend(rizoma_outs)
            print("✅ Rizoma concluído!\n")

            print()
            print("=" * 60)
            print("✅ Todas as exportações concluídas!")
            print("\n📦 Arquivos gerados:")
            for output in outputs:
                print(f"   - {output}")
            print("=" * 60)

        elif formato == "epub":
            print("Formato selecionado: EPUB\n")
            output = create_epub()
            print()
            print("=" * 60)
            print("✅ Exportação concluída!")
            print(f"📦 Arquivo: {output}")
            print("=" * 60)
        elif formato == "xml":
            print("Formato selecionado: XML (AI-optimized)\n")
            output = create_xml(minify=False)
            print()
            print("=" * 60)
            print("✅ Exportação concluída!")
            print(f"📦 Arquivo: {output}")
            print("=" * 60)
        elif formato == "xml-min":
            print("Formato selecionado: XML Minificado\n")
            output = create_xml(minify=True)
            print()
            print("=" * 60)
            print("✅ Exportação concluída!")
            print(f"📦 Arquivo: {output}")
            print("=" * 60)
        elif formato == "jsonl":
            print("Formato selecionado: JSONL (LLM-optimized)\n")
            output = create_jsonl()
            print()
            print("=" * 60)
            print("✅ Exportação concluída!")
            print(f"📦 Arquivo: {output}")
            print("=" * 60)
        elif formato == "rizoma":
            print("Formato selecionado: RIZOMA (JSON/GraphML/MD/CSV)\n")
            outputs = create_rizoma_exports()
            print()
            print("=" * 60)
            print("✅ Exportação do Rizoma concluída!")
            if outputs:
                print("📦 Arquivos gerados:")
                for out in outputs:
                    print(f"   - {out}")
            print("=" * 60)
            sys.exit(0)
        else:
            print("Formato selecionado: PDF\n")
            output = create_pdf()
            print()
            print("=" * 60)
            print("✅ Exportação concluída!")
            print(f"📦 Arquivo: {output}")
            print("=" * 60)
    except Exception as e:
        print()
        print("=" * 60)
        print(f"❌ ERRO: {e}")
        print("=" * 60)
        import traceback

        traceback.print_exc()
