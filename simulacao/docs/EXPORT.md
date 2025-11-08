# Exportação de Arquivos - A Revolução Cibernética

Este documento explica como usar o script `export_file.py` para gerar arquivos EPUB, PDF e XML do site.

## Requisitos

```bash
pip install ebooklib beautifulsoup4 lxml reportlab xhtml2pdf
```

## Uso

### Gerar EPUB

```bash
python export_file.py epub
```

Gera o arquivo `docs/revolucao_cibernetica.epub` (~119 MB) com:
- 2 capítulos (Teoria + Manifesto)
- 58 imagens em alta qualidade
- Navegação completa
- Metadados e licença CC BY-SA 4.0

### Gerar PDF

```bash
python export_file.py pdf
```

Gera o arquivo `docs/revolucao_cibernetica.pdf` (~165 MB) com:
- Página de título profissional
- Todo o conteúdo dos capítulos
- Imagens preservadas
- Estilos tipográficos bonitos
- Quebras de página automáticas

### Gerar XML (para Agentes de IA)

```bash
python export_file.py xml
```

Gera o arquivo `docs/revolucao_cibernetica.xml` (~2.1 MB) com:
- Estrutura hierárquica completa
- Metadados e tags de categorização
- Conteúdo extraído e estruturado por seções
- Conceitos-chave identificados automaticamente
- Glossário de conceitos fundamentais
- Instruções específicas para processamento por IA
- Temas principais mapeados com keywords
- Otimizado para RAG, análise semântica e feedback loops
- **Formato legível** com indentação

**📚 Veja o [XML_GUIDE.md](./XML_GUIDE.md) para documentação completa sobre uso do XML.**

### Gerar XML Minificado

```bash
python export_file.py xml-min
```

Gera o arquivo `docs/revolucao_cibernetica.min.xml` (~1.9 MB) com:
- Mesmo conteúdo e estrutura do XML formatado
- **10% menor** (sem espaços em branco e indentação)
- Ideal para:
  - Transferência via rede
  - APIs e microserviços
  - Armazenamento otimizado
  - Processamento automático por máquinas
- Menos legível para humanos, mas funcionalmente idêntico

## Formato Padrão

Se você executar o script sem argumentos, ele gerará EPUB por padrão:

```bash
python export_file.py  # Gera EPUB
```

## Características

### EPUB
- ✅ Formato universal (compatível com Kindle, Apple Books, Google Play Books, etc.)
- ✅ Todas as 58 imagens incluídas
- ✅ Navegação interativa
- ✅ Redimensionamento de texto
- ✅ Metadados completos

### PDF
- ✅ Segue o style guide do site (cores roxo #8b5cf6 e rosa #ec4899)
- ✅ Fonte Inter para títulos e texto (brutalismo digital)
- ✅ Formatação profissional com line-height 1.75
- ✅ Página de título moderna e elegante
- ✅ Títulos coloridos: H1 roxo (#8b5cf6), H2 roxo escuro (#7c3aed)
- ✅ Bordas coloridas: H1 com borda rosa (#ec4899)
- ✅ Links em rosa (#ec4899) seguindo o style guide
- ✅ Code blocks com destaque em rosa
- ✅ Blockquotes com borda roxa (#8b5cf6)
- ✅ Quebras de página inteligentes
- ✅ Imagens em alta qualidade com border-radius
- ✅ Margens de 2.5cm (padrão A4)
- ✅ Justificação de texto

### XML (Agentes de IA)
- ✅ Estrutura hierárquica clara (documentos → seções → conteúdo)
- ✅ Metadados completos com tags de categorização
- ✅ Extração automática de conceitos-chave
- ✅ Separação de parágrafos, citações, listas e imagens
- ✅ Glossário integrado com 8 conceitos fundamentais
- ✅ Instruções específicas para processamento por LLMs
- ✅ Temas principais estruturados com keywords
- ✅ Otimizado para RAG (Retrieval-Augmented Generation)
- ✅ Compatível com sistemas de feedback loop
- ✅ Ideal para indexação vetorial e busca semântica
- ✅ Integração nativa com sistema Nhandereko

## Estrutura dos Arquivos Gerados

### EPUB (revolucao_cibernetica.epub)

```text
revolucao_cibernetica.epub
├── Metadata (título, autor, idioma, licença)
├── Navegação (TOC interativo)
├── Capítulos
│   ├── index.xhtml (Teoria)
│   └── manifesto.xhtml (Manifesto)
└── Imagens (58 arquivos PNG)
    ├── 01_capa_revolucao_cibernetica.png
    ├── 02_abertura_multiplicidades.png
    └── ... (56 outras imagens)
```

### PDF (revolucao_cibernetica.pdf)

```text
revolucao_cibernetica.pdf
├── Página de Título
│   ├── Nome do livro
│   ├── Subtítulo
│   ├── Autor
│   └── Licença
├── Teoria (de index.html)
│   └── [Quebra de página]
└── Manifesto (de manifesto.html)
```

### XML (revolucao_cibernetica.xml)

```xml
revolucao_cibernetica.xml
├── <metadata>              # Metadados completos
│   ├── <title>
│   ├── <author>
│   ├── <license>
│   └── <tags>
├── <document type="teoria">
│   └── <section id="...">
│       ├── <title>
│       ├── <content>       # Parágrafos
│       ├── <quotes>        # Citações
│       ├── <lists>         # Listas
│       ├── <images>        # Referências
│       └── <key_concepts>  # Conceitos extraídos
├── <document type="manifesto">
│   └── (mesma estrutura)
├── <glossary>              # 8 conceitos fundamentais
│   └── <entry>
│       ├── <term>
│       └── <definition>
├── <ai_processing_hints>   # 8 orientações para IA
│   └── <hint priority="1-8">
└── <main_themes>           # 4 temas estruturados
    └── <theme>
        ├── <name>
        ├── <description>
        └── <keywords>
```

**Total de seções extraídas**: 50 (42 da teoria + 8 do manifesto)

### XML Minificado (revolucao_cibernetica.min.xml)

```xml
revolucao_cibernetica.min.xml
└── (mesma estrutura, sem formatação)
```

**Características**:

- 📦 **10% menor** que a versão formatada (1.9 MB vs 2.1 MB)
- ⚡ **Transferência mais rápida** via rede
- 🔧 **Mesma estrutura e conteúdo** da versão formatada
- 🤖 **Ideal para APIs** e processamento automatizado

## Integração com o Site

O site possui botões de download que redirecionam para `download.html`:

- **Botão EPUB**: `download.html?formato=epub`
- **Botão PDF**: `download.html?formato=pdf`
- **Botão XML**: `download.html?formato=xml` (para desenvolvedores e agentes de IA)

A página `download.html` detecta o formato automaticamente e exibe:

- Ícone correto (📚 para EPUB, 📄 para PDF, 🤖 para XML)
- Tamanho do arquivo
- Descrição do formato
- Botão de download apropriado
- Captcha visual de verificação humana

## Notas Técnicas

### EPUB

- Usa `ebooklib` para criação do EPUB 3.0
- Converte caminhos de imagem automaticamente (`assets/images/` → `images/`)
- Remove elementos desnecessários (scripts, nav, buttons)
- Preserva estrutura semântica do HTML

### PDF

- Usa `xhtml2pdf` (baseado em ReportLab)
- Segue o **style guide** com cores roxo (#8b5cf6) e rosa (#ec4899)
- Fonte **Inter** para títulos e texto (brutalismo digital)
- Remove variáveis CSS (`var(--primary)`) que causam erros
- Limpa estilos inline problemáticos
- Remove atributos HTML não essenciais
- Aplica CSS otimizado para impressão

### XML

- Usa `xml.etree.ElementTree` (biblioteca padrão Python)
- Formatação com `xml.dom.minidom` para indentação legível
- Extração automática de estrutura hierárquica (seções/capítulos)
- Parsing com `BeautifulSoup` para extrair conteúdo limpo
- Separação automática de elementos (parágrafos, citações, listas, imagens)
- Identificação de conceitos-chave via tags `<strong>` e `<em>`
- Metadados ISO 8601 com timestamp de geração
- Tags de categorização para indexação
- Estrutura otimizada para:
  - **Embeddings vetoriais**: Parágrafos indexados individualmente
  - **RAG**: Seções com contexto completo (título + conteúdo + conceitos)
  - **Grafo de conhecimento**: Conceitos e temas mapeados
  - **Busca semântica**: Keywords e tags estruturadas
  - **Feedback loops**: Hints específicos para processamento IA

## Resolução de Problemas

### Erro de bibliotecas faltando
```bash
pip install ebooklib beautifulsoup4 lxml reportlab xhtml2pdf
```

### Arquivo muito grande
Os arquivos são grandes porque incluem todas as 58 imagens em alta qualidade. Isso é intencional para preservar a qualidade visual do conteúdo.

### PDF com fontes diferentes

O PDF agora usa a fonte **Inter** (mesma do site) para manter consistência com o style guide e criar uma identidade visual unificada entre web e PDF. Os títulos seguem as cores roxo (#8b5cf6) e rosa (#ec4899) do brutalismo digital.

## Licença

Assim como o conteúdo original, os arquivos gerados estão sob licença **Creative Commons BY-SA 4.0**.

Você é livre para:
- ✅ Compartilhar
- ✅ Adaptar
- ✅ Usar comercialmente

Desde que:
- 📝 Dê crédito apropriado
- 🔗 Mantenha a mesma licença
