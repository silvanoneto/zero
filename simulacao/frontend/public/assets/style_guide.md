# Guia de Estilo: Revolução Cibernética

## 📖 O que é este documento?

Este é um guia prático que explica como o site "Revolução Cibernética" foi construído, incluindo cores, fontes, layout e efeitos visuais. Você pode usar este guia para:

- Entender as escolhas de design do site
- Criar novos projetos com estilo similar
- Fazer modificações mantendo a consistência visual

---

## � Evolução: Do Binário ao Ternário

### A Dialética das Cores

**Versão 1.0 (Binário):** Roxo + Rosa (dualidade)  
**Versão 2.0 (Ternário):** 🔴 Vermelho + 🟢 Verde + 🔵 Azul (trialidade dialética)

A evolução para RGB não é apenas estética — é **ontológica**:
- **RGB** = Red, Green, Blue (cores primárias da luz)
- **Vermelho** = Tese (Passado, fundamentos)
- **Verde** = Antítese (Presente, crítica)
- **Azul** = Síntese (Futuro, construção)

Esta trialética reflete a estrutura completa do projeto:
- **Teoria** (Vermelho) → **Manifesto** (Verde) → **Sistema Nhandereko** (Azul)
- **Loop 1** (Micro) → **Loop 2** (Macro) → **Loop 3** (Meta)
- **Observação** → **Ação** → **Transformação**

---

## �🎨 1. Conceito Visual

### O que é "Brutalismo Dialético"?

É um estilo de design que valoriza:
- **Clareza**: A informação vem primeiro, sem enfeites desnecessários
- **Contraste forte**: Texto branco em fundo escuro para leitura confortável
- **Hierarquia plana**: Capítulos numerados, sem "partes" ou seções complexas
- **Cores trialética**: RGB para expressar a estrutura trialética do pensamento
- **Experimentação**: Design que permite experimentar com novos layouts sem quebrar a estrutura
- **Funcionalidade**: Tudo que você vê tem uma função
- **Recursividade**: O design reflete a teoria que apresenta

### Características principais

- ✅ Texto grande e fácil de ler
- ✅ Fundo escuro que não cansa os olhos
- ✅ Sistema RGB ternário (Vermelho/Verde/Azul)
- ✅ Funciona bem em celular, tablet e computador
- ✅ Navegação temporal (Passado/Presente/Futuro)
- ✅ Estrutura fractal (loops dentro de loops)

---

## 🎨 2. Sistema de Cores RGB Ternário

### 🌈 Sistema de Cores

O site usa **RGB como metáfora trialética** — não apenas cores, mas camadas temporais e epistemológicas:

#### 🌙 Tema Escuro (padrão)

**Cores de fundo:**
- **Fundo principal**: Preto profundo `#1a1a1a`
- **Texto**: Branco quase puro `#fafafa`
- **Cards e áreas destacadas**: Cinza muito escuro `#212121`

**Cores Ternárias (RGB Trialético):**

| Cor | Hex | Significado | Uso |
|-----|-----|-------------|-----|
| 🔴 **Vermelho (Tese)** | `#dc2626` → `#ef4444` | Passado, Fundamentos | Caps 1-8, Loop 1 (Micro) |
| 🟢 **Verde (Antítese)** | `#059669` → `#10b981` | Presente, Crítica | Caps 9-16, Loop 2 (Macro) |
| 🔵 **Azul (Síntese)** | `#2563eb` → `#3b82f6` | Futuro, Construção | Caps 17-24 + Manifesto + Nhandereko, Loop 3 (Meta) |

**Cores Auxiliares (Legado Binário):**
- **Roxo**: `#8b5cf6` → `#7c3aed` (Transição, usado em elementos neutros)
- **Rosa**: `#ec4899` → `#db2777` (Energia, usado em CTAs e destaque)

**Por que RGB?**
- **Cores primárias da luz**: Base de toda cor visível (monitores são RGB)
- **Estrutura ternária**: Reflete os 3 loops fractais (Micro/Macro/Meta)
- **Trialética visual**: Vermelho (tese) + Verde (antítese) = Azul (síntese) na teoria das cores
- **Temporal**: Vermelho (quente, passado), Verde (neutro, presente), Azul (frio, futuro)

#### ☀️ Tema Claro (alternativo)

**Cores de fundo:**
- **Fundo principal**: Branco quase puro `#fafafa`
- **Texto**: Preto profundo `#1a1a1a`
- **Cards**: Cinza muito claro `#f5f5f5`

**Cores Ternárias (RGB Trialético - mais saturadas para contraste):**

| Cor | Hex | Modo Claro |
|-----|-----|------------|
| 🔴 **Vermelho** | `#b91c1c` → `#dc2626` | Mais escuro para legibilidade |
| 🟢 **Verde** | `#047857` → `#059669` | Mais escuro para legibilidade |
| 🔵 **Azul** | `#1d4ed8` → `#2563eb` | Mais escuro para legibilidade |

### 🎨 Código das cores (para desenvolvedores)

```css
/* Tema Escuro - Sistema RGB Ternário */
:root.dark {
  /* Fundos e texto base */
  --fundo: #1a1a1a;
  --texto: #fafafa;
  --cinza: #2a2a2a;
  
  /* RGB Trialético (Cores Primárias) */
  --vermelho: #dc2626;          /* Tese / Passado */
  --vermelho-claro: #ef4444;    /* Hover vermelho */
  --verde: #059669;             /* Antítese / Presente */
  --verde-claro: #10b981;       /* Hover verde */
  --azul: #2563eb;              /* Síntese / Futuro */
  --azul-claro: #3b82f6;        /* Hover azul */
  
  /* Binário Legado (uso secundário) */
  --roxo: #8b5cf6;              /* Neutro / Transição */
  --rosa: #ec4899;              /* CTA / Destaque */
  --rosa-claro: #f472b6;        /* Hover rosa */
}

/* Tema Claro - Sistema RGB Ternário */
:root.light {
  /* Fundos e texto base */
  --fundo: #fafafa;
  --texto: #1a1a1a;
  --cinza: #e5e5e5;
  
  /* RGB Trialético (mais escuros para contraste) */
  --vermelho: #b91c1c;
  --vermelho-claro: #dc2626;
  --verde: #047857;
  --verde-claro: #059669;
  --azul: #1d4ed8;
  --azul-claro: #2563eb;
  
  /* Binário Legado */
  --roxo: #7c3aed;
  --rosa: #ec4899;
  --rosa-claro: #db2777;
}
```

### 🌈 Gradientes Ternários

#### Gradiente RGB Completo (Passado → Presente → Futuro)
```css
}
```

### 📐 Uso das Cores Ternárias

/* Gradiente completo da jornada trialética */
.titulo-rgb {
  background: linear-gradient(90deg, 
    var(--vermelho) 0%,    /* Vermelho (Tese) */
    var(--verde) 50%,      /* Verde (Antítese) */
    var(--azul) 100%       /* Azul (Síntese) */
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

#### Gradientes Binários (transições específicas)
```css
/* Passado → Presente */
.gradiente-tese-antitese {
  background: linear-gradient(90deg, var(--vermelho), var(--verde));
}

/* Presente → Futuro */
.gradiente-antitese-sintese {
  background: linear-gradient(90deg, var(--verde), var(--azul));
}

/* Passado → Futuro (salto dialético) */
.gradiente-tese-sintese {
  background: linear-gradient(90deg, var(--vermelho), var(--azul));
}
```

#### Legado: Roxo → Rosa (para compatibilidade)
```css
/* Mantido para elementos não-temporais */
.gradiente-legado {
  background: linear-gradient(90deg, var(--roxo), var(--rosa));
}
/* Como criar o gradiente */
.titulo-com-gradiente {
  background: linear-gradient(90deg, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

**O que isso faz?**
Cria um título que começa roxo à esquerda e termina rosa à direita, dando um efeito moderno e chamativo.

---

## 📝 3. Fontes e Texto

### Quais fontes usamos?

O site usa duas fontes principais, ambas gratuitas do Google Fonts:

#### 1. **Inter** - Para texto normal
- Usada em: parágrafos, títulos, menus, botões
- Por quê? É moderna, muito legível e funciona bem em telas
- Download: [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)

#### 2. **JetBrains Mono** - Para código
- Usada em: código, elementos técnicos
- Por quê? É monoespaçada (todas as letras têm a mesma largura), ideal para código
- Download: [Google Fonts - JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)

### Tamanhos de texto

Aqui está a hierarquia de tamanhos, do maior para o menor:

| Elemento | Tamanho | Quando usar |
|----------|---------|-------------|
| **h1** (título principal) | 40px | Título da página |
| **h2** (título de seção) | 32px | Início de cada seção |
| **h3** (subtítulo) | 24px | Subdivisões dentro de seções |
| **h4** | 20px | Títulos menores |
| **Parágrafo normal** | 16px | Todo o texto corrido |
| **Texto pequeno** | 14px | Legendas, notas de rodapé |
| **Texto extra pequeno** | 12px | Informações secundárias |

**💡 Dica:** No celular, os títulos ficam um pouco menores para caber na tela.

### Como o texto fica colorido?

```css
/* Títulos com gradiente roxo → rosa */
h1, h2, h3 {
  background: linear-gradient(90deg, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Links em rosa */
a {
  color: #ec4899;  /* Rosa padrão */
}

a:hover {
  color: #f472b6;  /* Rosa mais claro quando passa o mouse */
}

/* Texto em destaque */
strong {
  font-weight: 600;
  color: #fafafa;  /* Branco puro */
}
```

### Como adicionar as fontes no seu projeto?

```html
<!-- Cole isso no <head> do seu HTML -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
/* E isso no seu CSS */
body {
  font-family: "Inter", -apple-system, sans-serif;
}

code, pre {
  font-family: "JetBrains Mono", monospace;
}
```

---

## 📐 4. Organização da Página

### Como a página é estruturada?

O site tem uma estrutura simples e organizada:

```
┌─────────────────────────────────────┐
│         TOPO (Header)               │ ← Logo e título
├─────────────────────┬───────────────┤
│                     │               │
│   CONTEÚDO          │   MENU        │ ← Conteúdo principal + Menu lateral
│   PRINCIPAL         │   LATERAL     │   (no celular, o menu fica escondido)
│                     │   (Sidebar)   │
│                     │               │
├─────────────────────┴───────────────┤
│         RODAPÉ (Footer)             │ ← Informações finais
└─────────────────────────────────────┘
```

### 📱 Como funciona em diferentes telas?

#### Celular (menos de 768px)
- Menu lateral fica escondido
- Botão no canto para abrir o menu
- Conteúdo ocupa toda a largura
- Texto um pouco menor para caber

#### Tablet e Computador (768px ou mais)
- Menu lateral aparece fixo do lado direito
- Conteúdo do lado esquerdo com largura máxima de 768px
- Títulos maiores
- Mais espaço entre elementos

### Espaços e margens

O site usa um sistema consistente de espaçamentos:

| Espaço | Tamanho | Onde usar |
|--------|---------|-----------|
| Pequeno | 16px | Entre parágrafos próximos |
| Médio | 24px | Entre subtítulos e conteúdo |
| Grande | 48px | Entre seções principais |
| Extra grande | 96px | Entre capítulos |

**💡 Regra de ouro:** Quanto mais importante a separação, maior o espaço.

### Exemplo de código para layout

```css
/* Container do conteúdo principal */
.conteudo {
  max-width: 768px;        /* Largura máxima */
  margin: 0 auto;          /* Centraliza */
  padding: 32px 16px;      /* Espaço interno */
}

/* No tablet/desktop */
@media (min-width: 768px) {
  .pagina {
    display: grid;
    grid-template-columns: 1fr 320px;  /* Conteúdo + Sidebar de 320px */
  }
}
```

---

## ✨ 5. Efeitos Visuais Especiais

### Glass Morphism (Vidro Embaçado)

Um dos efeitos mais legais do site! Dá a impressão de vidro fosco com transparência.

**Onde é usado?**
- ✓ Botão do menu (no celular)
- ✓ Botão "voltar ao topo"
- ✓ Botões flutuantes

**Como funciona?**
```css
.efeito-vidro {
  /* Gradiente roxo → rosa com transparência */
  background: linear-gradient(90deg, 
    rgba(139, 92, 246, 0.4),  /* Roxo 40% transparente */
    rgba(236, 72, 153, 0.4)   /* Rosa 40% transparente */
  );
  
  /* O efeito de blur (embaçamento) */
  backdrop-filter: blur(12px) saturate(180%);
  
  /* Sombra colorida */
  box-shadow: 0 8px 32px 0 rgba(139, 92, 246, 0.3);
}

/* Quando passa o mouse por cima */
.efeito-vidro:hover {
  /* Cores ficam mais fortes */
  background: linear-gradient(90deg, 
    rgba(139, 92, 246, 0.6),  /* Roxo 60% */
    rgba(236, 72, 153, 0.6)   /* Rosa 60% */
  );
  
  /* Move um pouquinho para cima */
  transform: translateY(-2px);
}
```

**💡 O que isso cria?**
Um botão semi-transparente que parece vidro fosco, com um efeito de elevação quando você passa o mouse.

### Interações com o Mouse

O site responde quando você interage com elementos:

#### 1. **Links** (mudam de cor)
- **Normal**: Rosa `#ec4899`
- **Mouse em cima**: Rosa claro `#f472b6`
- **Clicado/Focado**: Roxo `#8b5cf6`

#### 2. **Botões** (se elevam)
- Mouse em cima: Sobe 2px e fica mais colorido
- Clicado: Volta à posição normal

#### 3. **Imagens** (ficam transparentes)
- Mouse em cima: Opacidade de 80% (fica um pouco transparente)
- Indica que você pode clicar para ampliar

```css
/* Exemplo de imagem clicável */
img.clicavel {
  cursor: pointer;  /* Cursor vira mãozinha */
  transition: opacity 0.3s;  /* Transição suave */
}

img.clicavel:hover {
  opacity: 0.8;  /* Fica um pouco transparente */
}
```

### Animações Suaves

Todos os elementos têm transições suaves (não mudam bruscamente):

```css
/* Transição padrão */
.elemento {
  transition: all 0.3s ease;  /* 0.3 segundos, suave */
}
```

**O que isso significa?**
Quando algo muda (cor, posição, tamanho), leva 0.3 segundos para completar a mudança, criando um efeito mais agradável.

---

## 🧩 6. Componentes Principais

Aqui estão os blocos que formam o site, explicados de forma simples.

### 📄 Topo da Página (Header)

O que aparece no início de cada página:

```html
<header>
  <!-- Logo e título -->
  <div>
    <img src="logo.png" alt="Logo">
    <h1>Revolução Cibernética</h1>
    <p>Por O Besta Fera • Janeiro 2025</p>
  </div>
</header>
```

**Elementos:**
- Logo (imagem de 64x64 pixels)
- Título com gradiente colorido
- Informação do autor e data
- Botão para alternar tema claro/escuro

### 🗂️ Menu Lateral (Sidebar)

Aparece do lado direito (ou escondido no celular):

**O que contém:**
- Índice clicável de todas as seções
- Links que levam direto para cada parte
- Indicador visual da seção atual

**Como funciona:**
```
ÍNDICE
├─ 1. Abertura
│  ├─ 1.1 Multiplicidades
│  └─ 1.2 Sistema em Loop
├─ 2. Ontologia Relacional
│  └─ 2.1 Conceitos Básicos
└─ 3. Cibernética...
```

Ao clicar em qualquer item, a página rola suavemente até aquela seção.

### 📝 Seção de Conteúdo

Como cada seção é organizada:

```html
<section id="nome-da-secao">
  <!-- Título da seção -->
  <h2>Título Principal</h2>
  
  <!-- Imagem ou diagrama (se houver) -->
  <img src="diagrama.png" alt="Descrição">
  
  <!-- Texto explicativo -->
  <p>Conteúdo da seção...</p>
  
  <!-- Subseção (se houver) -->
  <div id="subsecao">
    <h3>Subtítulo</h3>
    <p>Mais conteúdo...</p>
  </div>
</section>
```

**💡 Dica:** Cada seção tem um `id` único para que os links do menu funcionem corretamente.

### 🖼️ Imagens e Diagramas

As imagens podem ser ampliadas ao clicar:

```html
<!-- Imagem normal -->
<img 
  src="diagrama.png" 
  alt="Diagrama explicativo"
  class="clicavel"
>
```

**O que acontece:**
1. Mouse em cima: Imagem fica um pouco transparente
2. Clica: Abre em tela cheia
3. Botão X no canto: Fecha a imagem ampliada

### 📚 Referências

Seção especial no final com todas as fontes citadas:

```html
<section id="referencias">
  <h2>Referências</h2>
  
  <div class="referencia">
    <span class="numero">[1]</span>
    <p>
      <strong>Wiener, N.</strong> (1948). 
      <em>Cybernetics</em>. MIT Press.
      <a href="link">Ver online</a>
    </p>
  </div>
</section>
```

Cada referência tem:
- Número entre colchetes [1], [2], etc.
- Nome do autor em negrito
- Título do livro/artigo em itálico
- Link para acessar online (se disponível)

### 🔙 Botão "Voltar ao Topo"

Aparece quando você rola a página para baixo:

**Características:**
- Fica fixo no canto inferior direito
- Efeito de vidro (glass morphism)
- Ao clicar, volta suavemente para o topo
- Desaparece quando já está no topo

```css
#voltar-ao-topo {
  position: fixed;           /* Fica fixo na tela */
  bottom: 2rem;              /* 32px do fundo */
  right: 2rem;               /* 32px da direita */
  
  /* Efeito de vidro */
  background: linear-gradient(90deg, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.4));
  backdrop-filter: blur(12px);
}
```

---

## 📱 7. Design Responsivo (Funciona em Todos os Dispositivos)

### O que é design responsivo?

Significa que o site se adapta automaticamente ao tamanho da tela. Se você abre no celular, tablet ou computador, sempre fica bonito e fácil de usar.

### Tamanhos de tela (Breakpoints)

O site se ajusta nestes pontos:

| Dispositivo | Largura | O que muda |
|-------------|---------|------------|
| 📱 **Celular** | 0 - 639px | Menu escondido, texto menor, botão de menu |
| 📱 **Celular grande** | 640 - 767px | Um pouco mais de espaço |
| 📱 **Tablet** | 768 - 1023px | Menu lateral aparece, texto maior |
| 💻 **Computador** | 1024px+ | Layout completo com mais espaço |
| 🖥️ **Tela grande** | 1280px+ | Ainda mais espaço entre elementos |

### Como funciona no código?

```css
/* Celular (padrão - não precisa de media query) */
.titulo {
  font-size: 32px;  /* Título menor */
}

/* Tablet e maior */
@media (min-width: 768px) {
  .titulo {
    font-size: 40px;  /* Título maior */
  }
  
  /* Menu lateral aparece */
  .menu-lateral {
    display: block;
  }
}

/* Computador */
@media (min-width: 1024px) {
  .conteudo {
    padding: 64px 32px;  /* Mais espaço */
  }
}
```

### 📱 Modo Mobile (Celular)

**Mudanças especiais:**
- ✓ Menu lateral fica escondido
- ✓ Botão hambúrguer no canto para abrir menu
- ✓ Títulos menores (h1 = 32px em vez de 40px)
- ✓ Menos espaço entre elementos
- ✓ Imagens ocupam 100% da largura

```css
/* Ajustes para celular */
@media (max-width: 767px) {
  /* Menu escondido por padrão */
  .menu-lateral {
    position: fixed;
    right: -100%;  /* Fora da tela */
    transition: right 0.3s;
  }
  
  /* Menu aberto */
  .menu-lateral.aberto {
    right: 0;  /* Entra na tela */
  }
  
  /* Títulos menores */
  h1 { font-size: 32px; }
  h2 { font-size: 24px; }
}
```

### 💡 Dicas para design responsivo

1. **Pense no mobile primeiro**: Comece desenhando para celular, depois adapte para telas maiores
2. **Teste em vários tamanhos**: Não confie só no seu dispositivo
3. **Imagens flexíveis**: Use `width: 100%` para imagens se adaptarem
4. **Texto legível**: Nunca deixe o texto menor que 14px no celular

---

## ♿ 8. Acessibilidade (Para Todos Poderem Usar)

### O que é acessibilidade?

É garantir que o site funcione bem para **todas as pessoas**, incluindo:
- Pessoas com deficiência visual (que usam leitores de tela)
- Pessoas com dificuldade de movimento (que navegam só pelo teclado)
- Pessoas com daltonismo (dificuldade para distinguir cores)

### Como o site é acessível?

#### 1. **Navegação pelo teclado** ⌨️

Tudo que você pode clicar com o mouse também funciona com o teclado:
- `Tab` → Vai para o próximo elemento
- `Enter` ou `Espaço` → Clica no elemento
- `Esc` → Fecha modais/menus

```css
/* Mostra claramente onde está o foco */
*:focus-visible {
  outline: 2px solid #8b5cf6;  /* Borda roxa */
  outline-offset: 2px;          /* Espaço da borda */
}
```

**💡 O que isso faz?** Quando você navega pelo teclado, uma borda roxa mostra exatamente onde você está.

#### 2. **Descrições em imagens** 🖼️

Todas as imagens têm texto alternativo:

```html
<!-- ✅ Correto -->
<img 
  src="diagrama.png" 
  alt="Diagrama mostrando o ciclo de feedback da cibernética"
>

<!-- ❌ Errado -->
<img src="diagrama.png">
```

**Por quê?** Leitores de tela leem o texto alternativo para pessoas que não podem ver a imagem.

#### 3. **Contraste de cores** 🎨

Todas as combinações de cores têm contraste suficiente:

| Combinação | Contraste | Status |
|------------|-----------|--------|
| Branco sobre Preto | 19.77:1 | ✅ Excelente |
| Roxo claro sobre Preto | 8.91:1 | ✅ Muito bom |
| Cinza sobre Preto | 7.23:1 | ✅ Bom |

**Mínimo recomendado:**
- Texto normal: 4.5:1
- Texto grande: 3:1

#### 4. **HTML semântico** 📝

Usamos as tags corretas para cada tipo de conteúdo:

```html
<!-- Estrutura semântica correta -->
<header>        <!-- Cabeçalho da página -->
  <h1>Título</h1>
</header>

<nav>           <!-- Menu de navegação -->
  <ul>
    <li><a>Link</a></li>
  </ul>
</nav>

<main>          <!-- Conteúdo principal -->
  <article>     <!-- Artigo -->
    <section>   <!-- Seção -->
      <h2>Título da seção</h2>
      <p>Texto...</p>
    </section>
  </article>
</main>

<footer>        <!-- Rodapé -->
</footer>
```

**Por quê?** Leitores de tela usam essas tags para entender a estrutura da página.

#### 5. **ARIA labels** (quando necessário) 🏷️

Para elementos que não têm texto visível:

```html
<!-- Botão com apenas ícone -->
<button aria-label="Fechar modal">
  <X />  <!-- Apenas ícone de X -->
</button>

<!-- Menu lateral -->
<nav aria-label="Índice do artigo">
  <!-- Links do menu -->
</nav>
```

**O que isso faz?** Dá um nome ao elemento para leitores de tela, mesmo sem texto visível.

### ✅ Checklist de Acessibilidade

Use esta lista para verificar seu site:

- [ ] Todas as imagens têm texto alternativo (`alt`)
- [ ] É possível navegar só com o teclado
- [ ] O foco do teclado é visível (borda roxa)
- [ ] Contraste de cores é suficiente (mínimo 4.5:1)
- [ ] Usa tags HTML semânticas (`<header>`, `<nav>`, etc.)
- [ ] Botões sem texto têm `aria-label`
- [ ] Links fazem sentido fora de contexto
- [ ] Títulos estão em ordem (h1 → h2 → h3, nunca pula)
- [ ] Funciona com zoom de 200%
- [ ] Funciona com leitor de tela

### 🛠️ Ferramentas para testar

- **WAVE**: Extensão de navegador que mostra problemas de acessibilidade
- **axe DevTools**: Outra extensão para testar acessibilidade
- **Leitor de tela**: Teste com NVDA (Windows) ou VoiceOver (Mac)
- **Contraste**: Use o DevTools do navegador ou sites como WebAIM

---

## ⚡ 9. Performance (Site Rápido)

### Por que performance importa?

Um site lento:
- ❌ Frustra os visitantes
- ❌ Usa mais bateria do celular
- ❌ Custa mais dados móveis
- ❌ Aparece pior no Google

**Objetivo:** Carregar em menos de 3 segundos, mesmo em 3G.

### Como otimizamos as imagens?

#### 1. **Lazy loading** (carregamento preguiçoso)

Imagens só carregam quando você vai vê-las:

```html
<img 
  src="imagem.png" 
  alt="Descrição"
  loading="lazy"  ← Isso faz a mágica!
>
```

**Economia:** Se a página tem 50 imagens mas você só vê 5, só essas 5 carregam.

#### 2. **Formatos modernos** (WebP)

WebP é um formato de imagem mais leve que PNG/JPG:

```html
<picture>
  <!-- Tenta WebP primeiro (mais leve) -->
  <source srcset="imagem.webp" type="image/webp">
  
  <!-- Se não suportar, usa PNG -->
  <source srcset="imagem.png" type="image/png">
  
  <!-- Fallback para navegadores antigos -->
  <img src="imagem.png" alt="Descrição">
</picture>
```

**Economia:** WebP pode ser até 30% menor que PNG.

#### 3. **Dimensões explícitas**

Informe o tamanho da imagem no HTML:

```html
<img 
  src="imagem.png" 
  width="800" 
  height="600"
  alt="Descrição"
>
```

**Por quê?** Evita que a página "pule" quando a imagem carrega (layout shift).

### Como otimizamos as fontes?

```html
<!-- Conecta mais rápido ao Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- display=swap evita texto invisível enquanto carrega -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

**O que `display=swap` faz?**
- Mostra texto com fonte padrão enquanto carrega
- Troca para Inter quando estiver pronta
- Usuário nunca vê página em branco

### Outras otimizações

#### CSS e JavaScript

```html
<!-- CSS no <head> para carregar logo -->
<link rel="stylesheet" href="styles.css">

<!-- JavaScript no final do <body> -->
<script src="main.js" defer></script>
```

#### Scroll suave

```css
/* Nativo é mais rápido que JavaScript */
html {
  scroll-behavior: smooth;
}
```

### 📊 Como testar performance?

1. **Lighthouse** (no DevTools do Chrome)
   - F12 → aba "Lighthouse" → "Generate report"
   - Objetivo: Nota acima de 90

2. **WebPageTest** (webpagetest.org)
   - Testa de várias localizações
   - Simula conexões lentas

3. **DevTools Network**
   - F12 → aba "Network"
   - Veja o tamanho total e tempo de carregamento

### ✅ Checklist de Performance

- [ ] Todas as imagens têm `loading="lazy"`
- [ ] Imagens estão em WebP (com fallback PNG/JPG)
- [ ] Imagens têm `width` e `height`
- [ ] Fontes usam `display=swap`
- [ ] CSS está minificado
- [ ] JavaScript usa `defer` ou `async`
- [ ] Lighthouse dá nota acima de 90
- [ ] Site carrega em menos de 3 segundos

---

## 📂 10. Organização dos Arquivos

### Como estruturar seu projeto?

Aqui está uma estrutura recomendada, organizada e fácil de entender:

```
revolucao-cibernetica/
│
├── index.html              ← Página principal
├── manifesto.html          ← Página do manifesto
├── README.md               ← Documentação do projeto
├── robots.txt              ← Para mecanismos de busca
│
└── assets/                 ← Todos os recursos
    │
    ├── css/
    │   └── styles.css      ← Todos os estilos
    │
    ├── scripts/
    │   └── main.js         ← JavaScript principal
    │
    └── images/             ← Todas as imagens
        ├── favicon.ico     ← Ícone do site
        ├── 88x31.png       ← Badge/banner
        ├── image_001.png   ← Imagens numeradas
        ├── image_002.png
        └── ...
```

### 💡 Dicas de organização

#### 1. **Nomear arquivos**
```
✅ Bom:
- image_001.png
- diagrama-cibernetica.png
- capitulo-02-abertura.png

❌ Ruim:
- Imagem sem título (1).png
- foto.jpg
- asdf.png
```

**Regras:**
- Use nomes descritivos
- Use hífen (`-`) ou underscore (`_`), não espaços
- Numere sequencialmente: `001`, `002`, `003`
- Mantenha minúsculas

#### 2. **Organizar por tipo**
- `css/` → Estilos
- `scripts/` → JavaScript
- `images/` → Imagens e diagramas
- `fonts/` → Fontes locais (se houver)

#### 3. **Evite duplicação**
```
❌ Ruim:
- styles.css
- style.css
- estilos.css
- main.css

✅ Bom:
- styles.css (um arquivo principal)
```

### Exemplo de HTML com caminhos corretos

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Revolução Cibernética</title>
  
  <!-- Ícone do site -->
  <link rel="icon" href="./assets/images/favicon.ico">
  
  <!-- Estilos -->
  <link rel="stylesheet" href="./assets/css/styles.css">
</head>
<body>
  <!-- Conteúdo -->
  
  <!-- Imagem -->
  <img src="./assets/images/image_001.png" alt="Descrição">
  
  <!-- JavaScript -->
  <script src="./assets/scripts/main.js"></script>
</body>
</html>
```

**⚠️ Atenção aos caminhos:**
- `./` significa "pasta atual"
- `../` significa "pasta anterior"
- Sempre use caminhos relativos, não absolutos

---

## 🚀 11. Como Começar (Guia Prático)

### Para iniciantes: HTML/CSS simples

Não precisa de ferramentas complexas! Você pode começar com arquivos simples:

#### 1. Crie a estrutura básica

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meu Site</title>
  
  <!-- Fontes do Google -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  
  <!-- Seus estilos -->
  <link rel="stylesheet" href="./assets/css/styles.css">
</head>
<body class="dark">
  <header>
    <h1>Título do Meu Site</h1>
  </header>
  
  <main>
    <section id="introducao">
      <h2>Introdução</h2>
      <p>Seu conteúdo aqui...</p>
    </section>
  </main>
  
  <footer>
    <p>© 2025 Seu Nome</p>
  </footer>
  
  <script src="./assets/scripts/main.js"></script>
</body>
</html>
```

#### 2. Adicione os estilos básicos (styles.css)

```css
/* Variáveis de cores */
:root {
  --preto: #1a1a1a;
  --branco: #fafafa;
  --roxo: #8b5cf6;
  --rosa: #ec4899;
  --cinza: #2a2a2a;
}

/* Reset básico */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Corpo da página */
body {
  font-family: 'Inter', sans-serif;
  background-color: var(--preto);
  color: var(--branco);
  line-height: 1.75;
}

/* Títulos com gradiente */
h1, h2, h3 {
  background: linear-gradient(90deg, var(--roxo), var(--rosa));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }

/* Links */
a {
  color: var(--rosa);
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: #f472b6;
}

/* Seções */
section {
  max-width: 768px;
  margin: 0 auto;
  padding: 3rem 1rem;
}

/* Imagens */
img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}
```

#### 3. Pronto! 🎉

Abra o arquivo HTML no navegador e você terá um site funcionando com o estilo básico.

### Para desenvolvedores: Projeto completo

Se você já conhece React, Node.js, etc:

#### 1. Clone ou crie o projeto

```bash
# Criar pasta
mkdir meu-projeto
cd meu-projeto

# Iniciar projeto (se usar npm)
npm init -y
```

#### 2. Instale as dependências

```bash
# Para projeto React com Vite
npm create vite@latest . -- --template react
npm install

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 3. Configure o Tailwind (tailwind.config.js)

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        roxo: {
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        rosa: {
          500: '#ec4899',
          600: '#db2777',
        }
      }
    },
  },
  plugins: [],
}
```

#### 4. Execute o projeto

```bash
npm run dev
```

### ✅ Checklist Completo

Use esta lista ao criar seu projeto:

**Configuração Inicial**
- [ ] Criar estrutura de pastas
- [ ] Adicionar fontes (Inter)
- [ ] Configurar cores (roxo e rosa)
- [ ] Configurar tema escuro

**Componentes**
- [ ] Criar cabeçalho com título
- [ ] Criar menu de navegação
- [ ] Criar seções de conteúdo
- [ ] Criar rodapé

**Conteúdo**
- [ ] Adicionar imagens com `alt` text
- [ ] Adicionar referências (se houver)
- [ ] Configurar IDs nas seções para navegação
- [ ] Revisar ortografia

**Responsividade**
- [ ] Testar em celular (< 768px)
- [ ] Testar em tablet (768px - 1024px)
- [ ] Testar em desktop (> 1024px)
- [ ] Verificar menu mobile

**Acessibilidade**
- [ ] Todas as imagens têm `alt`
- [ ] Navegação funciona pelo teclado
- [ ] Foco visível nos elementos
- [ ] Contraste de cores adequado
- [ ] Tags HTML semânticas

**Performance**
- [ ] Imagens com `loading="lazy"`
- [ ] Imagens em WebP
- [ ] Fontes com `display=swap`
- [ ] CSS minificado
- [ ] Testar com Lighthouse (nota > 90)

**Final**
- [ ] Testar em diferentes navegadores
- [ ] Validar HTML (validator.w3.org)
- [ ] Verificar links quebrados
- [ ] Fazer backup dos arquivos

---

## 🛠️ 12. Ferramentas e Recursos

### 🎨 Design e Cores

| Ferramenta | O que faz | Link |
|------------|-----------|------|
| **Coolors** | Criar paletas de cores | coolors.co |
| **Adobe Color** | Gerar esquemas de cores | color.adobe.com |
| **Contrast Checker** | Verificar contraste de acessibilidade | webaim.org/resources/contrastchecker |
| **Figma** | Design de interfaces (gratuito) | figma.com |

### ✍️ Tipografia

| Ferramenta | O que faz | Link |
|------------|-----------|------|
| **Google Fonts** | Fontes gratuitas | fonts.google.com |
| **Font Pair** | Sugestões de combinações de fontes | fontpair.co |
| **Type Scale** | Criar hierarquia tipográfica | typescale.com |

### 🖼️ Imagens e Ícones

| Ferramenta | O que faz | Link |
|------------|-----------|------|
| **Unsplash** | Fotos gratuitas de alta qualidade | unsplash.com |
| **Lucide** | Ícones SVG modernos | lucide.dev |
| **Heroicons** | Ícones SVG do Tailwind | heroicons.com |
| **TinyPNG** | Comprimir imagens PNG/JPG | tinypng.com |
| **Squoosh** | Converter para WebP | squoosh.app |

### 📊 Diagramas

| Ferramenta | O que faz | Link |
|------------|-----------|------|
| **Excalidraw** | Desenhar diagramas à mão | excalidraw.com |
| **Mermaid** | Diagramas em código | mermaid.js.org |
| **Figma** | Diagramas profissionais | figma.com |

### ♿ Acessibilidade

| Ferramenta | O que faz | Como usar |
|------------|-----------|-----------|
| **WAVE** | Detectar problemas de acessibilidade | Extensão do navegador |
| **axe DevTools** | Auditoria de acessibilidade | Extensão do navegador |
| **Lighthouse** | Teste completo (acessibilidade + performance) | DevTools do Chrome (F12) |

### ⚡ Performance

| Ferramenta | O que faz | Link |
|------------|-----------|------|
| **Lighthouse** | Análise completa de performance | DevTools do Chrome |
| **WebPageTest** | Teste de velocidade detalhado | webpagetest.org |
| **GTmetrix** | Análise de performance | gtmetrix.com |

### 🧪 Validação

| Ferramenta | O que faz | Link |
|------------|-----------|------|
| **W3C Validator** | Validar HTML | validator.w3.org |
| **CSS Validator** | Validar CSS | jigsaw.w3.org/css-validator |

### 💻 Desenvolvimento

Se você usa React/JavaScript:

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.468.0"
  }
}
```

**Outras bibliotecas úteis:**
- **Tailwind CSS**: Framework CSS utility-first
- **Vite**: Bundler rápido para desenvolvimento
- **Wouter**: Roteamento simples para React

---

## 💡 13. Dicas Finais e Boas Práticas

### ✅ O que fazer

1. **Mantenha consistência**
   - Use sempre as mesmas cores
   - Use sempre as mesmas fontes
   - Use sempre os mesmos espaçamentos

2. **Pense no usuário**
   - Texto deve ser fácil de ler
   - Navegação deve ser intuitiva
   - Site deve carregar rápido

3. **Teste em vários dispositivos**
   - Celular pequeno (iPhone SE)
   - Celular grande (iPhone Pro Max)
   - Tablet (iPad)
   - Computador

4. **Otimize imagens**
   - Sempre comprima antes de usar
   - Use WebP quando possível
   - Adicione `loading="lazy"`

5. **Documente seu código**
   ```css
   /* Botão principal com efeito vidro */
   .botao-principal {
     background: linear-gradient(90deg, #8b5cf6, #ec4899);
   }
   ```

### ❌ O que evitar

1. **Não abuse de animações**
   - Podem deixar o site lento
   - Podem causar náusea em alguns usuários
   - Use apenas quando necessário

2. **Não use textos muito pequenos**
   - Mínimo: 14px no mobile
   - Ideal: 16px ou mais

3. **Não esqueça do alt text**
   ```html
   <!-- ❌ Errado -->
   <img src="foto.png">
   
   <!-- ✅ Correto -->
   <img src="foto.png" alt="Descrição da foto">
   ```

4. **Não use muitas cores diferentes**
   - Mantenha uma paleta limitada
   - Este projeto usa apenas: roxo, rosa, preto, branco

5. **Não ignore a acessibilidade**
   - Sempre teste com teclado
   - Sempre verifique contraste
   - Sempre adicione ARIA labels onde necessário

### 📝 Resumo do Estilo

**Cores principais:**
- 🟣 Roxo: `#8b5cf6`
- 🌸 Rosa: `#ec4899`
- ⚫ Preto: `#1a1a1a`
- ⚪ Branco: `#fafafa`

**Fontes:**
- Texto: Inter
- Código: JetBrains Mono

**Efeitos especiais:**
- Gradiente roxo → rosa nos títulos
- Glass morphism nos botões flutuantes
- Transições suaves (0.3s)

**Responsividade:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🎓 14. Para Aprender Mais

### Tutoriais recomendados

**HTML/CSS básico:**
- MDN Web Docs: developer.mozilla.org
- W3Schools: w3schools.com
- freeCodeCamp: freecodecamp.org

**Design:**
- Refactoring UI (livro): refactoringui.com
- Laws of UX: lawsofux.com

**Acessibilidade:**
- WebAIM: webaim.org
- A11y Project: a11yproject.com

**Performance:**
- Web.dev: web.dev

### Comunidades

- Stack Overflow: Para tirar dúvidas
- GitHub Discussions: Para projetos open source
- Reddit (r/webdev): Para discussões

---

## 📄 15. Sobre Este Guia

### Informações

- **Projeto**: Revolução Cibernética
- **Autor**: O Besta Fera
- **Versão**: 2.0 (Revisada e Acessível)
- **Data**: Outubro 2025
- **Licença**: Domínio público - use livremente

### O que mudou nesta versão?

✨ **Mais acessível:**
- Linguagem mais simples e direta
- Mais exemplos práticos
- Mais explicações do "por quê"
- Emojis para facilitar navegação

📚 **Melhor organização:**
- Seções numeradas e claras
- Tabelas para comparação
- Checklists práticos
- Guia passo a passo

🎯 **Mais completo:**
- Guia para iniciantes E desenvolvedores
- Lista de ferramentas úteis
- Dicas e boas práticas
- Recursos para aprender mais

### Como usar este guia?

1. **Leia na ordem** se você é iniciante
2. **Pule para seções específicas** se já tem experiência
3. **Use os checklists** para não esquecer nada
4. **Adapte ao seu projeto** - não precisa seguir tudo à risca

### Feedback

Este guia pode ser melhorado! Se você:
- Encontrou algum erro
- Tem sugestões
- Quer adicionar algo

Fique à vontade para contribuir ou entrar em contato.

---

## 🎉 Conclusão

Você tem todas as informações para criar um site com o estilo "Revolução Cibernética":

✅ Cores vibrantes (roxo e rosa)  
✅ Tipografia moderna (Inter)  
✅ Layout responsivo  
✅ Efeitos especiais (glass morphism)  
✅ Acessível para todos  
✅ Performance otimizada  

**Próximos passos:**
1. Escolha entre HTML simples ou React
2. Configure as cores e fontes
3. Crie a estrutura básica
4. Adicione seu conteúdo
5. Teste em vários dispositivos
6. Otimize e publique!

**Lembre-se:** O mais importante é que seu site seja útil e acessível. O estilo visual é importante, mas vem depois do conteúdo e da funcionalidade.

Boa sorte com seu projeto! 🚀

---

**Fim do Guia de Estilo**

