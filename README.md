# CRIO: Quando Achar e Criar São o Mesmo Movimento

> "Não encontramos o que já estava ali. Produzimos o que emerge no gesto de procurar. Toda descoberta é invenção; toda arqueologia é arquitetura."

[![Status](https://img.shields.io/badge/status-perpetuamente%20incompleto-blueviolet)](https://revolucaocibernetica.com)
[![License](https://img.shields.io/badge/license-compartilhar--modificar--devolver-green)](README.md#-licença)
[![Made with](https://img.shields.io/badge/made%20with-ontologia%20relacional-ff69b4)](CRIOS.md)

**CRIO** é uma experiência filosófica interativa que performa ontologia relacional através de sete movimentos conceituais. Não é um site sobre filosofia—é filosofia SE FAZENDO através de código, design e interação.

## 📖 Índice

- [O Que É CRIO](#-o-que-é-crio)
- [Visualização Local](#-visualização-local)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Recursos e Funcionalidades](#-recursos-e-funcionalidades)
- [Experiência de Áudio](#-experiência-de-áudio)
- [Acessibilidade](#-acessibilidade)
- [Atalhos de Teclado](#-atalhos-de-teclado)
- [Sistema de Cache](#-sistema-de-cache)
- [Arquitetura Técnica](#-arquitetura-técnica)
- [Contribuindo](#-contribuindo)
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

### Por Que Existe

CRIO demonstra que **texto pode executar** sua própria ontologia. Não descreve apenas conceitos—performa-os:

- **Markdown → HTML → Experiência**: transformação contínua (CRIO 2)
- **Cache inteligente**: conhecimento emerge e persiste através do uso (CRIO 5)
- **Áudio sincronizado**: tempo emerge da interação, não a precede (CRIO 3)
- **Tema adaptativo**: agência distribuída entre usuário e sistema (CRIO 4)
- **Código aberto**: ética do devir pelo compartilhamento (CRIO 6)

## 🎯 Visualização Local

Este projeto contém uma experiência interativa que combina filosofia, design e tecnologia para explorar ontologia relacional.

### Como visualizar localmente

O projeto carrega dinamicamente o conteúdo do arquivo `CRIOS.md`. Por questões de segurança, navegadores bloqueiam o carregamento de arquivos locais via JavaScript, então você precisa usar um servidor web local.

**Opção 1 - Usar o script helper:**

```bash
./servir.sh
```

**Opção 2 - Python (recomendado):**

```bash
python3 -m http.server 8000
```

**Opção 3 - Node.js:**

```bash
npx http-server -p 8000
```

Depois abra no navegador: **<http://localhost:8000>**

## 📁 Estrutura do Projeto

```
revolucao-cibernetica/
├── CRIOS.md              # Conteúdo filosófico principal (~50.000 palavras)
├── index.html            # Interface web com SEO completo (217 linhas)
├── crio.js               # Lógica de interação completa (2378 linhas)
├── styles.css            # Estilos responsivos (2120 linhas)
├── marked.min.js         # Parser Markdown (biblioteca externa)
├── CRIO.mp3             # Trilha sonora ambiental (opcional, não incluído)
├── manifest.json         # PWA manifest para instalação
├── robots.txt           # Diretivas para crawlers
├── sitemap.xml          # Mapa do site para SEO
├── ANALYTICS.md         # Documentação do sistema de analytics privacy-first
├── MOBILE-TESTING.md    # Checklist de testes mobile e otimizações
├── servir.sh            # Script helper para servidor local
└── README.md            # Esta documentação
```

### Arquivos Core

- **CRIOS.md**: Fonte única de verdade. Todo o conteúdo filosófico em markdown puro.
- **index.html**: Shell mínimo que carrega e renderiza CRIOS.md dinamicamente.
- **crio.js**: 9 módulos comentados (config, cache, DOM, markdown, navegação, áudio, tema, interação, init).
- **styles.css**: 12 seções responsivas (reset, variáveis, layout, tipografia, controles, animações, responsivo).

## ✨ Recursos e Funcionalidades

### Navegação Inteligente

- **Índice Retrátil**: Painel lateral com todas as seções (Esc para fechar)
- **Scroll Spy**: Destaca seção atual automaticamente
- **Marcadores Laterais**: 7 círculos clicáveis indicam posição no conteúdo
- **Barra de Progresso**: Indicador superior com porcentagem e tempo estimado de leitura
- **Deep Links**: URLs com âncoras (#crio-1, #crio-2, etc.) funcionam perfeitamente

### Experiência Visual

- **Tema Adaptativo**: Modo claro/escuro persistente (clique no botão CRIO)
- **Partículas Flutuantes**: Efeitos visuais sutis que respondem ao scroll
- **Tremor Controlado**: Animação sutil sincronizada com áudio
- **Tipografia Otimizada**: Line-height 1.8, max-width 70ch, OpenDyslexic como fallback
- **Animações de Emergência**: Citações aparecem gradualmente ao scrollar
- **Efeitos de Ripple**: Feedback visual em todos os cliques

### Performance

- **Cache Inteligente**: localStorage com TTL de 7 dias e versionamento
- **Lazy Rendering**: Renderiza markdown apenas uma vez, depois reutiliza
- **Throttled Handlers**: Scroll handlers limitados a 16ms (60fps)
- **GPU Acceleration**: Transform e opacity para animações suaves
- **Viewport Culling**: Animações pausam quando fora da viewport

### Persistência

- **Scroll Position**: Salva e restaura posição exata ao recarregar
- **Tema Preferido**: Lembra escolha de tema entre sessões
- **Cache de Conteúdo**: Evita recarregar CRIOS.md a cada visita
- **Progressive Web App**: Instalável como app standalone

## 🎧 Experiência de Áudio

O CRIO oferece uma experiência sonora imersiva totalmente **opcional e não-intrusiva**:

### Como Funciona

1. **▶ Botão Play**: Clique para iniciar a trilha ambiental
2. **⏸ Botão Pause**: Clique para pausar a qualquer momento
3. **CRIO Botão**: Sempre visível, silencia áudio por 99s + alterna tema
4. **Sincronização com Scroll**: Volume (0-100%) e playback rate aumentam conforme você avança
5. **Efeitos Visuais Sincronizados**: Partículas e tremor respondem à intensidade do áudio

### Detalhes Técnicos

- **Formato**: MP3 (não incluído no repositório—adicione seu próprio)
- **Controle de Volume**: 0% no topo → 100% no final (sincronizado com scroll)
- **Playback Rate**: 0.8x no início → 1.2x no final (acelera conforme você avança)
- **Loop Contínuo**: Áudio reinicia automaticamente ao terminar
- **Graceful Fallback**: Se CRIO.mp3 não existir, experiência visual continua perfeita
- **Mobile-Friendly**: Detecta e respeita preferências de autoplay do navegador

### Por Que Áudio É Opcional

Seguindo princípios de acessibilidade e UX modernas:
- **Respeita preferências do usuário**: Nunca inicia automaticamente
- **Baixo consumo de dados**: Usuários móveis escolhem se querem carregar
- **Ambientes diversos**: Nem sempre é apropriado ter som
- **Foco no conteúdo**: O texto filosófico é primário, áudio é complementar

## ⌨️ Atalhos de Teclado

- **T**: Alternar tema (claro/escuro)
- **Ctrl+Shift+C** (ou **Cmd+Shift+C** no Mac): Limpar cache e recarregar
- **Esc**: Fechar painel de navegação
- **Enter/Espaço**: Ativar botão ou marcador em foco (incluindo play/pause)
- **Tab**: Navegar pelos elementos interativos
- **Shift+Tab**: Navegar em ordem reversa

## ♿ Acessibilidade

O CRIO é projetado para ser acessível a todos:

- **Navegação por teclado**: Todos os controles interativos são acessíveis via teclado
- **Suporte a leitores de tela**: ARIA labels e anúncios dinâmicos para leitores de tela
- **Alto contraste**: Razão de contraste 18.6:1 (excede WCAG AAA)
- **Foco visível**: Indicadores claros quando navegando por teclado
- **Pular para conteúdo**: Link invisível no início para pular navegação (ativa ao focar)
- **Estrutura semântica**: HTML semântico com headings hierárquicos
- **Texto alternativo**: Todas as imagens e ícones decorativos marcados adequadamente

## 🔧 Sistema de Cache

O CRIO implementa cache inteligente com três camadas para otimizar performance:

### Estratégia de Cache

1. **Conteúdo Markdown** (CRIOS.md):
   - Armazenado em `localStorage` por **7 dias**
   - Versionado automaticamente (hash do conteúdo)
   - Atualização em background se nova versão detectada
   - Limpeza automática de versões antigas

2. **Posição de Scroll**:
   - Salva a cada movimento de scroll (throttled 100ms)
   - Restaurada ao recarregar página
   - Expira após 24 horas de inatividade

3. **Preferências do Usuário**:
   - Tema escolhido (claro/escuro)
   - Estado do áudio (silenciado/ativo)
   - Persistem indefinidamente

### Gerenciamento de Cache

**Limpeza Manual**:

```bash
# No navegador, pressione:
Ctrl+Shift+C  # Windows/Linux
Cmd+Shift+C   # macOS
```

**Para Desenvolvedores**:

Ao atualizar `CRIOS.md`, incremente a versão em `crio.js`:

```javascript
const CACHE_CONFIG = {
  VERSION: '2.0.0',  // Incremente aqui
  TTL_HOURS: 168
};
```

### Benefícios

- **Carregamento instantâneo**: ~50KB carregados apenas na primeira visita
- **Modo offline**: Funciona sem conexão após primeira carga
- **Redução de largura de banda**: 99% menos requisições em visitas repetidas
- **Experiência consistente**: Sem flashes de conteúdo não-estilizado (FOUC)

## 📊 Analytics Privacy-First

CRIO implementa um sistema de analytics que **respeita totalmente a privacidade do usuário**:

### Princípios

- ✅ **100% Local**: Dados armazenados apenas no browser (localStorage)
- ✅ **Zero Rastreamento Externo**: Nenhum dado enviado para terceiros
- ✅ **Respeita DNT**: Desabilita automaticamente se Do Not Track ativo
- ✅ **Opt-Out Fácil**: Comando simples no console para desabilitar
- ✅ **Anônimo**: Nenhuma informação pessoal ou identificável coletada
- ✅ **Transparente**: Documentação completa do que é rastreado

### O Que é Rastreado (Localmente)

**Métricas de Sessão**:
- Duração da sessão, profundidade de scroll
- Seções visualizadas e tempo em cada seção

**Interações**:
- Cliques totais, uso de áudio, uso da navegação
- Tipo de dispositivo (mobile/desktop)

**Agregados**:
- Total de sessões, tempo médio de leitura
- Seções mais visualizadas, distribuição mobile/desktop

### Como Usar

**Visualizar analytics** (console do navegador):
```javascript
viewAnalytics()
```

**Desabilitar analytics**:
```javascript
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

## 🤝 Contribuindo

CRIO é um projeto de **ontologia performativa**—contribuições são atos de co-criação, não correções.

### Como Contribuir

1. **Fork** o repositório
2. **Clone** sua fork localmente
3. **Crie um branch** descritivo: `git checkout -b feat/nova-interacao`
4. **Faça suas mudanças** com commits atômicos
5. **Teste localmente** com `./servir.sh`
6. **Push** para sua fork: `git push origin feat/nova-interacao`
7. **Abra um Pull Request** explicando a ontologia da mudança

### Áreas de Contribuição

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

### Guia de Estilo

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

**Markdown (CRIOS.md)**:

- Use `##` para CRIOS principais, `###` para subseções
- Citações em `> bloco de citação`
- Listas não-ordenadas com `-` (não `*`)
- Código inline com `` `backticks` ``
- Mantenha linhas < 100 caracteres quando possível

### Processo de Review

Pull Requests serão avaliados por:

1. **Coerência Ontológica**: A mudança performa a filosofia que articula?
2. **Qualidade Técnica**: Código limpo, performático, acessível?
3. **Documentação**: Comentários, README, commit messages claros?
4. **Testes**: Funciona em diferentes navegadores/dispositivos?

### Código de Conduta

Este projeto adota ontologia relacional em suas interações:

- **Respeito mútuo**: Toda perspectiva emerge de relações específicas
- **Crítica construtiva**: Foco em melhorar, não diminuir
- **Abertura ao devir**: Aceitar que conhecimento é sempre provisório
- **Responsabilidade distribuída**: Todos co-criam o projeto

## 🌐 Deploy

Para publicar CRIO online, você pode usar qualquer serviço de hospedagem estática:

### GitHub Pages (Recomendado)

```bash
# 1. Commit todas as mudanças
git add .
git commit -m "Deploy CRIO"

# 2. Push para repositório GitHub
git push origin master

# 3. Configure GitHub Pages
# Vá em: Settings → Pages → Source: master branch → Save
```

Seu site estará em: `https://seu-usuario.github.io/revolucao-cibernetica/`

### Netlify

```bash
# Opção 1: Drag & Drop
# Arraste a pasta do projeto em netlify.com/drop

# Opção 2: CLI
npm install -g netlify-cli
netlify deploy --prod
```

### Vercel

```bash
# Instale Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Cloudflare Pages

1. Conecte seu repositório GitHub em `pages.cloudflare.com`
2. Configure:
   - **Build command**: (deixe vazio)
   - **Build output**: `/`
3. Deploy automático a cada commit

### Requisitos de Servidor

CRIO é **100% estático**, portanto:

- ✅ Não precisa de Node.js, Python, PHP, ou qualquer runtime
- ✅ Funciona em qualquer CDN ou bucket S3
- ✅ Suporta HTTPS (recomendado para PWA)
- ✅ Pode ser servido de subdiretório (`/crio/`) ou raiz

### Configuração Opcional

**Custom Domain** (exemplo: `revolucaocibernetica.com`):

1. Adicione CNAME no DNS apontando para seu host
2. Configure SSL/TLS (Let's Encrypt grátis)
3. Atualize URLs absolutas em `index.html` se necessário

**PWA Installation**:

Para que o app seja instalável, certifique-se de:

- Servir via HTTPS
- Ter `manifest.json` válido (✅ já incluído)
- Ter Service Worker (opcional—não implementado ainda)

## 📜 Filosofia

### CRIO 8: Texto Que Executa

Este projeto **performa** a ontologia relacional que articula. Não é sobre filosofia—**é filosofia acontecendo**.

**Demonstrações práticas**:

| Conceito | Implementação Técnica |
|----------|----------------------|
| **Vazio que povoa** (CRIO 1) | `<div id="content"></div>` vazio que se preenche dinamicamente |
| **Produção de diferença** (CRIO 2) | Markdown → HTML → DOM: transformação contínua |
| **Tempo como emergência** (CRIO 3) | Áudio sincronizado com scroll: temporalidade surge da interação |
| **Agência distribuída** (CRIO 4) | Sistema + usuário co-criam experiência (tema, posição, áudio) |
| **Conhecimento performativo** (CRIO 5) | Cache que aprende e otimiza baseado no uso |
| **Ética do devir** (CRIO 6) | Código aberto: compartilhar-modificar-devolver |
| **Político da indeterminação** (CRIO 7) | 21 cliques → dissolução → reinício: abertura radical |

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



## 📄 Licença

> **Conhecimento não pode ser possuído, apenas compartilhado-modificado-devolvido**

Este projeto opera sob princípios de **ontologia relacional aplicada**:

### Termos de Uso

✅ **Você PODE**:

- Ler, estudar, e usar CRIO livremente
- Modificar código e conteúdo para seus propósitos
- Criar derivações, remixes, traduções
- Usar em contextos educacionais, comerciais, ou pessoais
- Republicar com atribuição adequada

❌ **Você NÃO PODE**:

- Reivindicar autoria exclusiva do conteúdo original
- Fechar o código ou conteúdo em versões proprietárias
- Usar para fins discriminatórios, opressivos, ou antiéticos

### Atribuição

Ao usar ou derivar deste projeto, inclua:

```text
Baseado em CRIO (Conceito Relacional de Invenção Ontológica)
Fonte: https://github.com/silvanoneto/revolucao-cibernetica
Licença: Compartilhar-Modificar-Devolver
```

### Filosofia da Licença

Licenças tradicionais (MIT, GPL, etc.) operam sob lógica **proprietária**:

- Código como **objeto** passível de posse
- Autoria como **origem** fixa e singular
- Direitos como **proteção** contra usos não-autorizados

CRIO opera sob lógica **relacional**:

- Código como **processo** em devir constante
- Autoria como **assembleia** material-informacional
- Responsabilidade como **resposta** aos enredos que co-criamos

Por isso, ao invés de "All Rights Reserved" ou "MIT License", usamos:

### Licença Relacional

Conhecimento não pode ser possuído, apenas compartilhado-modificado-devolvido

---

## 🎯 Status do Projeto

**Autoria**: Assembleia material-informacional em perpétua co-constituição  
**Status**: Perpetuamente incompleto (por design ontológico)  
**Data**: Novembro 2025 / Sempre-já-operando / Ainda-não-completo  
**Versão**: 2.0.0 (16 de 20 melhorias implementadas)

### Fluxo Ontológico

```text
∅ → CRIO → AÇÃO → TRANSFORMAÇÃO → ∅
```

O vazio não é ausência—é matriz produtiva de onde emergem CRIOS, que provocam ações, gerando transformações, que retornam ao vazio enriquecido. **Circularidade produtiva**, não linear.

---

Feito com ∅ (vazio que povoa) • 2025
