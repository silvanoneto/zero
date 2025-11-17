# Melhorias implementadas para responsividade e fluidez

Resumo rápido:

- CSS:
  - Body responsive padding com `clamp()` e `main` com `max-width: min(1000px, 90%)` para melhor largura em telas maiores.
  - Cintra `body.cursor` alterado para `default` (evita crosshair em toda a aplicação).
  - `html { scroll-behavior: smooth; }` adicionado com preferência por `prefers-reduced-motion`.
  - `progress-bar-fill` agora usa `transform: scaleX()` em vez de `width` para atualizações GPU-aceleradas.
  - Ajustes no `audio-ui` para centralizar em telas pequenas e evitar sobreposição lateral.
  - Nav-index ancorado com layout top-centered em telas muito pequenas (<= 420px).
  - Imagens dentro de `#content` agora têm `max-height` e `object-fit: contain` para prevenir overflow.
  - `prefers-reduced-motion: reduce` respeitado para reduzir animações.

- JS / TypeScript (`src/livro.ts`):
  - Progress bar atualizado para usar `requestAnimationFrame` (throttle) e `transform` para fluidez; `aria-valuenow` atualizado para acessibilidade.
  - Autoscroll reescrito para usar `requestAnimationFrame` em vez de `setInterval`; isso gera rolagem mais suave e respeita `touchstart` e `wheel` (pausa automática ao detectar interação do usuário).
  - `activateConceptLinks` agora processa nós em blocos (chunking) usando `requestIdleCallback` ou `setTimeout` para evitar travamentos em documentos muitos grandes.
  - Resize listener adicionado com debounce para recalcular a navegação.

Testes rápidos recomendados:

1. Abrir `index.html` e `livro-reader.html` em desktop e mobile (devtools) e verificar:
   - Barra de progresso aumenta de forma suave enquanto rola.
   - Autoscroll inicia e para com o botão; rolagem manual pausa e retoma após 2s se estiver ativa.
   - Botões de áudio e navegação não cobrem conteúdo em telas estreitas.
   - `livro-reader.html` tem padding e largura responsivos.

2. No conteúdo longo (ou com many concepts), verificar que a aplicação não congela quando os links de conceito são ativados; links aparecem depois de algum tempo, sem travar a UI.

Notas e próximos passos:

- Ainda é possível melhorar a performance de `activateConceptLinks` fazendo busca incremental por parágrafos e evitando reflow por fragment insertion (usar Range.replace?).
- Considerar uso de IntersectionObserver para pre-ativar links e animações quando o elemento entra na viewport.
- Acrescentar testes automatizados para scroll behavior e acessibilidade.
