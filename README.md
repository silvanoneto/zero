# CRIO: Quando Achar e Criar São o Mesmo Movimento

> "Não encontramos o que já estava ali. Produzimos o que emerge no gesto de procurar. Toda descoberta é invenção; toda arqueologia é arquitetura."

[![Status](https://img.shields.io/badge/status-perpetuamente%20incompleto-blueviolet)](https://revolucaocibernetica.com)
[![License](https://img.shields.io/badge/license-compartilhar--modificar--devolver-green)](README.md#-licença)
[![Made with](https://img.shields.io/badge/made%20with-ontologia%20relacional-ff69b4)](docs/CRIOS.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.181.0-black)](https://threejs.org/)
[![Live Reload](https://img.shields.io/badge/dev-live%20reload-brightgreen)](docs/LIVE_RELOAD.md)
[![Browser-sync](https://img.shields.io/badge/browser--sync-enabled-orange)](http://localhost:3001)

**CRIO** é uma experiência filosófica interativa que performa ontologia relacional através de sete movimentos conceituais. Não é um site sobre filosofia—é filosofia SE FAZENDO através de código, design e interação.

## 📖 Índice

- [O Que É CRIO](#-o-que-é-crio)
- [Início Rápido](#-início-rápido)
- [Desenvolvimento](#-desenvolvimento)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Recursos e Funcionalidades](#-recursos-e-funcionalidades)
- [Arquitetura Técnica](#-arquitetura-técnica)
- [Deploy](#-deploy)
- [Filosofia](#-filosofia)
- [Licença](#-licença)

---

## 🌀 O Que É CRIO

**CRIO** (Conceito Relacional de Invenção Ontológica) é uma exploração prática de como realidade, conhecimento e transformação emergem simultaneamente através da relação.

### Os Sete CRIOS

1. **O Vazio Que Povoa** (CRIO 1): O vazio não como ausência, mas como matriz produtiva
2. **A Produção da Diferença** (CRIO 2): Diferenciação como processo ontológico primário
3. **O Tempo Como Emergência** (CRIO 3): Temporalidade surge da relação, não a precede
4. **A Agência Distribuída** (CRIO 4): Intencionalidade como propriedade relacional
5. **O Conhecimento Performativo** (CRIO 5): Conhecer é transformar, não representar
6. **A Ética do Devir** (CRIO 6): Responsabilidade emerge do entrelaçamento ontológico
7. **O Político da Indeterminação** (CRIO 7): Poder como abertura, não como controle

### Fundamentação Teórica

Este projeto sintetiza:
- **Ontologia Relacional** (Karen Barad, Bruno Latour, Donna Haraway)
- **Realismo Agencial** (Karen Barad): agência não é atributo, mas enactment
- **Teoria Ator-Rede** (Bruno Latour): tudo é relação, nada é substância
- **Epistemologia Performativa**: conhecimento produz realidade ao descrevê-la
- **Filosofia da Tecnologia**: código como pensamento materializado

---

## 🚀 Início Rápido

### Instalação

```bash
# Clonar repositório
git clone https://github.com/silvanoneto/revolucao-cibernetica.git
cd revolucao-cibernetica

# Instalar dependências
make install
# ou: npm install
```

### Desenvolvimento com Live Reload

```bash
# Inicia TypeScript watch + Browser-sync (live reload automático)
make dev
# ou: npm run dev
# ou: ./dev.sh
```

**URLs disponíveis:**
- 🌐 **Local**: http://localhost:8000/riz∅ma.html
- 📱 **Rede**: http://192.168.15.5:8000/riz∅ma.html (acessível na rede local)
- 🎛️ **Painel**: http://localhost:3001 (controle do browser-sync)

**✨ Live Reload Ativo:**
- Edite arquivos `.ts`, `.html`, `.css` ou `assets/*`
- Salve (Cmd+S / Ctrl+S)
- **Browser atualiza automaticamente** - sem apertar F5!

📚 **Guia completo**: [docs/LIVE_RELOAD.md](docs/LIVE_RELOAD.md)

---

## 💻 Desenvolvimento

### Requisitos

- **Node.js** 20+ com npm
- **Python** 3.x (opcional, apenas para `make server` sem live reload)
- **Make** (opcional, facilita comandos)

### Comandos Principais

| Comando | Descrição |
|---------|-----------|
| `make help` | Lista todos os comandos disponíveis |
| `make install` | Instala dependências (npm install) |
| `make dev` | 🚀 **Desenvolvimento completo** (TypeScript watch + live reload) |
| `make build` | Compila TypeScript → JavaScript |
| `make watch` | Observa mudanças e recompila automaticamente |
| `make server` | Servidor HTTP simples (sem live reload) |
| `make stop` | Para todos os servidores |
| `make status` | Verifica se servidor está rodando |
| `make logs` | Mostra logs do desenvolvimento |
| `make clean` | Remove dist/ |
| `make clean-all` | Remove dist/ + node_modules/ |
| `make rebuild` | Limpa, reinstala e recompila tudo |

### Scripts npm

```bash
npm install           # Instala dependências
npm run build         # Compila TypeScript
npm run watch         # Observa mudanças (TypeScript)
npm run dev           # 🚀 Watch + browser-sync (live reload)
npm run server        # Apenas servidor HTTP
npm run browser-sync  # Apenas browser-sync (requer dist/ compilado)
```

### Workflow de Desenvolvimento

**⚡ Live Reload Automático:**

1. **Edite** arquivos em `src/*.ts`, `*.html`, `*.css` ou `assets/`
2. **Salve** (Cmd+S / Ctrl+S)
3. **Browser atualiza sozinho** - TypeScript recompila automaticamente!

**Ou use o script auxiliar:**

```bash
./dev.sh           # Interface amigável com mensagens coloridas
```

**📚 Mais informações:** [docs/LIVE_RELOAD.md](docs/LIVE_RELOAD.md)
- Como funciona o browser-sync
- Sincronização multi-device (teste no celular!)
- Painel de controle (http://localhost:3001)
- Troubleshooting e dicas

---

## 📁 Estrutura do Projeto

```
revolucao-cibernetica/
├── src/                    # Código-fonte TypeScript
│   ├── types.ts           # Definições de tipos (Concept, Relation, Layer)
│   ├── constants.ts       # Constantes (opacidades, raios, configurações)
│   ├── utils.ts           # Utilitários (cores, geometria, DOM helpers)
│   ├── state.ts           # Gerenciamento de estado global
│   ├── crio.ts            # Aplicação principal index.html (CRIO reader)
│   └── rizoma-full.ts     # Visualização 3D rizomática (riz∅ma.html)
├── dist/                   # JavaScript compilado (gerado automaticamente)
│   ├── crio.js            # Bundle CRIO compilado
│   └── rizoma-full.js     # Bundle rizoma compilado
├── assets/                # Recursos estáticos
│   ├── concepts.json      # 68 conceitos filosóficos estruturados
│   ├── relations.json     # 289 relações entre conceitos
│   └── CRIO.mp3           # Áudio de fundo (opcional)
├── docs/                  # Documentação
│   ├── CRIOS.md           # Conteúdo filosófico (~50.000 palavras)
│   ├── LIVE_RELOAD.md     # Guia do live reload
│   └── meta-reflexao.md   # Meta-reflexão sobre o projeto
├── public/                # Arquivos públicos
│   ├── manifest.json      # PWA manifest
│   ├── robots.txt         # Diretivas para crawlers
│   └── sitemap.xml        # Mapa do site para SEO
├── .dev-docs/             # Documentação temporária (não versionada)
├── .github/workflows/
│   └── pages.yml         # CI/CD para GitHub Pages
├── index.html            # Experiência de leitura CRIO (landing page)
├── riz∅ma.html           # Visualização 3D rizomática
├── styles.css            # Estilos responsivos completos
├── package.json          # Dependências e scripts npm
├── tsconfig.json         # Configuração TypeScript
├── Makefile              # Comandos de desenvolvimento
└── dev.sh                # Script auxiliar de desenvolvimento
```

### Arquivos Core

**TypeScript (src/):**

- `types.ts`: Sistema de tipos (Concept, Relation, Layer, NodeUserData, LineUserData)
- `constants.ts`: Valores centralizados (SELECTED_OPACITY=1.0, NODE_RADIUS=1.5, etc.)
- `utils.ts`: Funções utilitárias (lerpColor, randomSpherePoint, showNotification)
- `state.ts`: Single source of truth para estado global
- `crio.ts`: Experiência de leitura CRIO (menu dinâmico, efeitos visuais, autoscroll)
- `rizoma-full.ts`: Visualização 3D rizomática (scene, rendering, events, cards)

**Dados (assets/):**

- `concepts.json`: 68 conceitos com id, título, camada, descrição, citações
- `relations.json`: 289 relações direcionadas entre conceitos
- `CRIO.mp3`: Áudio de fundo opcional

**Documentação (docs/):**

- `CRIOS.md`: Conteúdo filosófico completo (~50.000 palavras)
- `meta-reflexao.md`: Meta-análise do projeto

**HTML/CSS:**

- `index.html`: Experiência de leitura com menu de navegação dinâmico e efeitos visuais
- `riz∅ma.html`: Interface com canvas Three.js, legenda de camadas, controles
- `styles.css`: Estilos responsivos, tema adaptativo, animações (2700+ linhas)

**Build:**

- `package.json`: Scripts npm (build, watch, dev) + dependências (three, typescript)
- `tsconfig.json`: Compilação TypeScript ES2020, strict mode desabilitado
- `Makefile`: Comandos make para desenvolvimento (install, build, dev, clean)

**Público (public/):**

- `manifest.json`: PWA manifest para instalação
- `robots.txt`: Diretivas para crawlers
- `sitemap.xml`: Mapa do site para SEO

---

## ✨ Recursos e Funcionalidades

### Experiência de Leitura CRIO (index.html)

**Menu de Navegação Dinâmico:**
- **Botão hambúrguer animado**: Transformação fluida de ☰ → ✕
- **Seções numeradas**: Navegação estruturada pelos 7 CRIOS + seções adicionais
- **Previews contextuais**: Primeiras linhas de cada seção ao passar o mouse
- **Barras de progresso**: Indicadores visuais de leitura em cada seção
- **Sincronização automática**: Menu acompanha posição do scroll
- **Tema adaptativo**: Ajustes de cores para modo claro/escuro

**Efeitos Visuais Interativos:**
- **Partículas flutuantes**: 30 elementos animados em background
- **Símbolo do vazio (∅)**: Animação de opacidade e escala baseada no scroll
- **Tremor progressivo**: Intensidade 0-3 aumenta conforme rolagem (20%-80%)
- **Marcadores laterais**: Indicadores de progresso por seção com preenchimento dinâmico
- **Auto-scroll meditativo**: Movimento automático suave a 0.5px/frame
- **Áudio de fundo**: CRIO.mp3 com controles de play/pause

**Performance:**
- **Cache inteligente**: localStorage com TTL de 7 dias para docs/CRIOS.md
- **Renderização lazy**: Markdown processado uma vez e reutilizado
- **GPU acceleration**: Transforms e opacity otimizados
- **Scroll throttling**: Handlers limitados a 16ms (60fps)

**Interatividade:**
- **Ícones de tema**: ☾ (lua) e ☀ (sol) com animação de rotação
- **Persistência**: Tema e posição de scroll salvos em localStorage
- **Responsivo**: Layout adaptativo para mobile/tablet/desktop

### Visualização Rizoma (riz∅ma.html)

**Sistema de Camadas (9 camadas):**
- Fundacional, Ontológica, Epistemológica, Política
- Pedagógica, Indígena-Comunitária, Ecológica-Material
- Temporal, Prática-Institucional
- **Multi-seleção**: Clique em múltiplas camadas para filtrar simultaneamente
- **Feedback visual**: Camadas ativas com borda e transformação

**Visualização 3D:**
- 68 nós (esferas de vidro) posicionados em esfera
- 289 linhas (cilindros) representando relações
- Gradiente dinâmico entre nós selecionados
- OrbitControls para rotação/zoom/pan interativo
- Labels flutuantes em nós e arestas

**Modo Cards:**
- Grade responsiva de conceitos filtrados por camada
- Citações completas, descrições expandidas
- Scroll infinito com carregamento lazy

**Interatividade:**
- Hover: Destaque de nó + relações conectadas
- Clique: Seleção de nó + cards relacionados
- Legenda: Toggle de camadas (individual ou múltiplas)
- Tema adaptativo: Modo claro/escuro persistente

### Performance

- **Live Reload**: Browser-sync com hot injection (CSS/JS sem reload completo)
- **TypeScript Watch**: Recompilação incremental automática (~100-500ms)
- **Cache Inteligente**: localStorage com TTL de 7 dias e versionamento
- **Lazy Rendering**: Renderiza markdown apenas uma vez, depois reutiliza
- **Throttled Handlers**: Scroll handlers limitados a 16ms (60fps)
- **GPU Acceleration**: Transform e opacity para animações suaves
- **Viewport Culling**: Animações pausam quando fora da viewport
- **ES Modules**: Carregamento modular otimizado para produção
- **Multi-device Sync**: Teste em celular/tablet simultaneamente

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

- **TypeScript 5.9.3**: Type-safe development com ES2020 target
- **Three.js 0.181.0**: Renderização 3D WebGL via CDN (import map)
- **Browser-sync**: Live reload com hot injection e multi-device sync
- **Concurrently**: Gerenciamento de processos paralelos (watch + server)
- **Vanilla JS**: Zero frameworks frontend, máxima performance
- **CSS3**: Gradientes, animações, grid layout responsivo
- **JSON**: Estrutura de dados (concepts.json, relations.json)

### Pipeline de Desenvolvimento

```bash
# Desenvolvimento (watch mode com live reload)
src/*.ts → tsc --watch → dist/*.js → browser-sync → Browser (auto-reload)
                            ↑                ↓
                            └────── detecção ────┘

# Produção (build estático)
src/*.ts → tsc → dist/*.js → GitHub Pages
```

**Desenvolvimento:**

1. `make dev` inicia TypeScript watch + browser-sync
2. `tsc --watch` monitora mudanças em `src/`
3. Recompila automaticamente para `dist/`
4. Browser-sync detecta mudanças e injeta no browser
5. **Browser atualiza automaticamente** - sem F5!

**Produção (GitHub Actions):**

1. Checkout do repositório
2. `npm ci` (instalação limpa de dependências)
3. `npm run build` (compilação TypeScript)
4. Upload de `dist/` como artifact
5. Deploy para GitHub Pages com arquivos compilados

### Modularização

**Separação de responsabilidades:**
**Organização modular (src/):**

- `types.ts`: Contratos de dados (interfaces, types, enums)
- `constants.ts`: Configuração centralizada (valores mágicos extraídos)
- `utils.ts`: Funções puras reutilizáveis (sem efeitos colaterais)
- `state.ts`: Single source of truth para estado global
- `riz∅ma-full.ts`: Orquestração (scene, rendering, events, UI)

**Benefícios:**

- Type safety: Catch errors em tempo de compilação
- Manutenibilidade: Código organizado e autodocumentado
- Reusabilidade: Módulos importáveis independentemente
- Testabilidade: Funções puras fáceis de testar
- Live Reload: Desenvolvente com feedback instantâneo

---

## 🚀 Deploy

### GitHub Pages (Automático)

Cada push na branch `master` dispara CI/CD:

1. **Build Job**: Compila TypeScript → JavaScript
2. **Deploy Job**: Publica em GitHub Pages

**Pipeline**: `.github/workflows/pages.yml`

- Node.js 20 com cache npm
- Compilação TypeScript com `npm run build`
- Upload de artifact (dist/)
- Deploy automático

**URL**: https://[seu-usuario].github.io/revolucao-cibernetica

### Deploy Manual

```bash
# Build local
make build
# ou: npm run build

# Verificar dist/
ls -lh dist/

# Commit e push
git add dist/
git commit -m "Build: Atualização TypeScript"
git push origin master
```

### Requisitos de Hospedagem

- **Servidor estático**: Qualquer host que sirva HTML/CSS/JS
- **HTTPS recomendado**: Para PWA e features modernas
- **Sem build server**: Arquivos estáticos apenas (dist/ já compilado)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Este projeto performa sua própria ontologia: **contribuir é co-criar**.

### Como Contribuir

1. **Fork** o repositório
2. **Clone** seu fork: `git clone https://github.com/SEU-USUARIO/revolucao-cibernetica.git`
3. **Instale** dependências: `make install`
4. **Crie branch**: `git checkout -b feature/minha-contribuicao`
5. **Desenvolva**: Edite arquivos em `src/`, compile com `make dev`
6. **Teste**: Verifique em http://localhost:8000/riz∅ma.html
7. **Commit**: `git commit -m "feat: Descrição da mudança"`
8. **Push**: `git push origin feature/minha-contribuicao`
9. **Pull Request**: Abra PR com descrição detalhada

### Áreas para Contribuição

**Código:**

- Novos conceitos/relações (assets/concepts.json, assets/relations.json)
- Melhorias de performance (otimizações Three.js)
- Novas visualizações (modos alternativos de exibição)
- Testes automatizados (unit tests, integration tests)
- Strict TypeScript (remover @ts-nocheck, adicionar tipos específicos)

**Conteúdo:**

- Expansão de docs/CRIOS.md (novos movimentos filosóficos)
- Traduções (i18n para outros idiomas)
- Acessibilidade (melhorias WCAG AAA)

**Documentação:**

- Tutoriais de uso (screencasts, guias visuais)
- Exemplos de código (snippets reutilizáveis)
- Melhorias neste README

---

## 🛠️ Ambiente de Desenvolvimento

Este projeto possui um ambiente de desenvolvimento moderno e automatizado:

### ✨ Features de Desenvolvimento

| Recurso | Descrição |
|---------|-----------|
| **Live Reload** | Browser atualiza automaticamente ao salvar arquivos |
| **Hot Injection** | CSS/JS injetados sem reload completo da página |
| **TypeScript Watch** | Recompilação incremental (~100-500ms) |
| **Multi-device Sync** | Teste no celular/tablet simultaneamente |
| **Browser-sync UI** | Painel de controle em http://localhost:3001 |
| **Logs coloridos** | Output visual com concurrently |
| **Import Map** | Three.js via CDN (sem build de node_modules) |

### 🎯 Quick Start

```bash
make dev        # Inicia tudo (TypeScript watch + Browser-sync)
# Acesse: http://localhost:8000/riz∅ma.html
# Edite arquivos em src/ e veja mudanças instantaneamente!
```

### 📚 Documentação Completa

- **[docs/LIVE_RELOAD.md](docs/LIVE_RELOAD.md)**: Guia completo do ambiente de desenvolvimento
- **[docs/CRIOS.md](docs/CRIOS.md)**: Fundamentos filosóficos do projeto
- **[docs/meta-reflexao.md](docs/meta-reflexao.md)**: Meta-análise do projeto

---

## 📜 Licença

Este projeto adota a **Licença de Reciprocidade Ontológica**:

### Você Pode

✅ **Compartilhar**: Copiar e redistribuir em qualquer formato  
✅ **Modificar**: Remixar, transformar, construir sobre o material  
✅ **Uso Comercial**: Usar para fins comerciais  

### Sob as Condições

📌 **Atribuição**: Credite o autor original (Silvano Neto)  
📌 **Compartilha Igual**: Distribua sob a mesma licença  
📌 **Devolução**: Contribuições melhoram o original (PRs bem-vindas)  

### Ontologia da Licença

Esta não é uma licença de propriedade—é um convite ao **devir comum**:

> "O conhecimento não é posse, é relação. Ao usar este código, você entra em uma rede de co-criação onde cada fork é um novo mundo possível, e cada PR é um gesto de reciprocidade ontológica."

**Inspirações**: Creative Commons BY-SA 4.0, GPL 3.0, filosofia FOSS

---

## 🌱 Filosofia do Projeto

### Por Que Existe

CRIO demonstra que **texto pode executar** sua própria ontologia. Não descreve apenas conceitos—performa-os:

- **Markdown → HTML → Experiência**: transformação contínua (CRIO 2)
- **Visualização 3D**: relações emergem espacialmente (CRIO 1)
- **Multi-layer filtering**: agência distribuída entre usuário e sistema (CRIO 4)
- **TypeScript**: conhecimento codificado, tipos como ontologia (CRIO 5)
- **Open Source**: ética do devir pelo compartilhamento (CRIO 6)
- **CI/CD**: transformação automática, devir maquínico (CRIO 3)

### Princípios de Design

1. **Performatividade**: Código é pensamento materializado
2. **Emergência**: Complexidade surge de regras simples
3. **Relacionalidade**: Tudo são conexões, nada é substância
4. **Indeterminação**: Sistema aberto a múltiplas interpretações
5. **Reciprocidade**: Contribuir é co-criar, não doar

---

## 📞 Contato

**Autor**: Silvano Neto  
**Site**: [revolucaocibernetica.com](https://revolucaocibernetica.com)  
**GitHub**: [@silvanoneto](https://github.com/silvanoneto)

---

<div align="center">

**CRIO não é um projeto—é um convite.**

*Entre na rede. Transforme. Seja transformado.*

[![GitHub Stars](https://img.shields.io/github/stars/silvanoneto/revolucao-cibernetica?style=social)](https://github.com/silvanoneto/revolucao-cibernetica)

</div>
disableAnalytics()
```

**Limpar dados**:
```javascript
clearAnalytics()
```

Para documentação completa, veja [ANALYTICS.md](./ANALYTICS.md).

### Por Quê?

Este approach alinha-se com a filosofia CRIO:
- **∅ (Vazio)**: Coleta mínima, apenas o essencial
- **Relacionalidade**: Dados servem a relação conteúdo-leitor
- **Imanência**: Dados permanecem na experiência, não externalizados
- **Transparência**: Visibilidade total do que é rastreado
- **Liberdade**: Usuário tem controle completo

## 🏗 Arquitetura Técnica

### Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Markdown Parser**: [Marked.js](https://marked.js.org/) v11.0
- **Servidor Local**: Python HTTP Server (desenvolvimento)
- **Deploy**: Arquivos estáticos (funciona em qualquer CDN/host)

### Módulos JavaScript (crio.js)

1. **Configuration**: Constantes, configurações de cache e áudio
2. **Cache System**: localStorage com versionamento e TTL
3. **DOM Utilities**: Seletores e helpers para manipulação DOM
4. **Markdown Rendering**: Parser Marked.js com sanitização
5. **Navigation**: Índice lateral, scroll spy, marcadores
6. **Audio System**: Play/pause, sincronização com scroll, mute temporário
7. **Theme System**: Alternância claro/escuro com persistência
8. **Interaction System**: Cliques, ripples, countdown, easter eggs
9. **Initialization**: DOMContentLoaded e startup sequence

### Módulos CSS (styles.css)

1. **CSS Reset**: Normalização cross-browser
2. **Custom Properties**: Variáveis de cor, espaçamento, timing
3. **Base Layout**: Grid, container, estrutura principal
4. **Typography**: Fontes, tamanhos, line-height, hierarquia
5. **Navigation**: Índice lateral, marcadores, scroll spy
6. **Controls**: Botões, play/pause, CRIO, tema
7. **Progress**: Barra superior, porcentagem, tempo de leitura
8. **Content Blocks**: Parágrafos, citações, listas, código
9. **Animations**: Partículas, tremor, fade-in, ripple
10. **Accessibility**: Focus, high contrast, screen readers
11. **Responsive**: 5 breakpoints (desktop, tablet, mobile, landscape, print)
12. **Utilities**: Helpers, estados, overrides

### Performance Benchmarks

- **First Contentful Paint**: < 1.2s
- **Time to Interactive**: < 2.5s
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size**: ~120KB total (não-minificado)
- **Cache Hit Rate**: >95% em visitas repetidas

## 🤝 Contribuindo (CRIO Landing Page)

O projeto index.html (CRIO landing page) é um espaço de **ontologia performativa**—contribuições são atos de co-criação.

### Áreas de Contribuição (Landing Page)

**Conteúdo Filosófico**:

- Expanda CRIOS existentes com novas perspectivas
- Adicione novos CRIOS (CRIO 8, 9, 10...)
- Traduza para outros idiomas
- Adicione referências bibliográficas

**Experiência Técnica**:

- Melhore acessibilidade (WCAG AAA)
- Otimize performance (Core Web Vitals)
- Adicione testes automatizados
- Implemente novas interações

**Design Visual**:

- Crie variações de tema
- Desenvolva novas animações
- Adicione ilustrações SVG inline
- Melhore tipografia responsiva

### Guia de Estilo (JavaScript)

**JavaScript**:

```javascript
// Use const por padrão, let quando necessário
const config = { ttl: 168 };

// Funções descritivas com JSDoc
/**
 * Calcula progresso de leitura baseado em scroll
 * @returns {number} Porcentagem (0-100)
 */
function calculateProgress() {
  const scrolled = window.scrollY;
  const total = document.body.scrollHeight - window.innerHeight;
  return (scrolled / total) * 100;
}

// Evite callbacks aninhados—use async/await
async function loadContent() {
  try {
    const response = await fetch('CRIOS.md');
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Erro ao carregar:', error);
  }
}
```

**CSS**:

```css
/* Use custom properties para valores reutilizáveis */
:root {
  --color-primary: #f0f0f0;
  --spacing-unit: 1rem;
}

/* Prefira flexbox/grid sobre floats */
.container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--spacing-unit);
}

/* Mobile-first: breakpoints de menor para maior */
@media (min-width: 768px) {
  .container {
    grid-template-columns: 400px 1fr;
  }
}
```

**TypeScript**:

```typescript
// Use tipos explícitos para documentação
interface Concept {
  id: string;
  layer: Layer;
  title: string;
}

// Prefira const assertions e readonly
const LAYERS = ['fundacional', 'ontologica'] as const;
type Layer = typeof LAYERS[number];

// Use generics para reusabilidade
function filterByLayer<T extends { layer: Layer }>(
  items: T[],
  layer: Layer
): T[] {
  return items.filter(item => item.layer === layer);
}
```

**Markdown (CRIOS.md)**:

- Use `##` para CRIOS principais, `###` para subseções
- Citações em `> bloco de citação`
- Listas não-ordenadas com `-` (não `*`)
- Código inline com `` `backticks` ``
- Mantenha linhas < 100 caracteres quando possível

---
npm install -g netlify-cli
netlify deploy --prod
```

---

### 🎯 Otimizações Futuras

**TypeScript:**
- Remover `@ts-nocheck` de `src/riz∅ma-full.ts`
- Habilitar `strict: true` em `tsconfig.json`
- Adicionar tipos específicos (eliminar `any`)
- Dividir `riz∅ma-full.ts` em módulos menores

**Testes:**
- Jest para unit tests (utils, state management)
- Playwright para E2E (interações 3D, multi-layer selection)
- Coverage reports (>80% target)

**Performance:**
- Minificação de JavaScript (Terser)
- Tree-shaking (remover código não usado)
- Code splitting (lazy load cards view)
- WebGL optimizations (geometry instancing)

**Infraestrutura:**
- Service Worker (offline-first PWA)
- Lighthouse CI (performance monitoring)
- Dependabot (atualização automática de dependências)

---

## 📜 Filosofia do Projeto

### CRIO 8: Texto Que Executa

Este projeto **performa** a ontologia relacional que articula. Não é sobre filosofia—**é filosofia acontecendo**.

**Demonstrações práticas**:

| Conceito | Implementação Técnica |
|----------|----------------------|
| **Vazio que povoa** (CRIO 1) | Esfera 3D vazia que povoa-se com 68 nós relacionais |
| **Produção de diferença** (CRIO 2) | TypeScript → JavaScript: transformação contínua via tsc |
| **Tempo como emergência** (CRIO 3) | Gradientes dinâmicos: visualização emerge da interação |
| **Agência distribuída** (CRIO 4) | Multi-layer filtering: usuário + sistema co-criam vista |
| **Conhecimento performativo** (CRIO 5) | Tipos TypeScript: conhecimento codificado estruturalmente |
| **Ética do devir** (CRIO 6) | Open source + CI/CD: compartilhar-modificar-devolver |
| **Político da indeterminação** (CRIO 7) | 289 relações abertas: múltiplas interpretações possíveis |

### Por Que Código Aberto

Seguindo CRIO 6 (Ética do Devir):

> "Responsabilidade não é evitar danos, mas responder ativamente aos enredos que co-criamos."

Conhecimento fechado **nega** a ontologia relacional que CRIO performa. Por isso:

- ✅ **Código fonte aberto**: Veja, modifique, aprenda
- ✅ **Sem analytics invasivos**: Sua leitura é privada
- ✅ **Sem paywalls ou ads**: Acesso livre é ético
- ✅ **Fork encorajado**: Crie suas variações

### Citação-Manifesto

> "Não encontramos o que já estava ali. Produzimos o que emerge no gesto de procurar. Toda descoberta é invenção; toda arqueologia é arquitetura."
>
> CRIO não é descoberta de verdades pré-existentes—é **invenção colaborativa de realidades possíveis** através do entrelaçamento entre código, texto, design e leitura.



---

## 🎯 Status do Projeto

**Versão**: 2.0.0 (TypeScript Migration Complete)  
**Status**: Perpetuamente incompleto (por design ontológico)  
**Última Atualização**: Novembro 2025

### Roadmap

- [x] Migração completa para TypeScript
- [x] Sistema de multi-layer selection
- [x] CI/CD com GitHub Actions
- [x] Makefile para desenvolvimento
- [ ] Remover `@ts-nocheck` (strict typing)
- [ ] Testes automatizados (Jest + Playwright)
- [ ] Code splitting e lazy loading
- [ ] Service Worker (PWA offline-first)
- [ ] Tradução para inglês/espanhol

---

<div align="center">

**CRIO não é um projeto—é um convite.**

*Entre na rede. Transforme. Seja transformado.*

[![GitHub Stars](https://img.shields.io/github/stars/silvanoneto/revolucao-cibernetica?style=social)](https://github.com/silvanoneto/revolucao-cibernetica)

Feito com ∅ (vazio que povoa) • 2025

</div>
