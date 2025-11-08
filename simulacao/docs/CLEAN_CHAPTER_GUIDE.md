# Guia Rápido: Limpeza e Síntese de Capítulos (para LLMs e editores)

Este documento descreve um processo prático e repetível para tirar redundância e simplificar capítulos quando uma LLM (ou humano) expande conceitos. Objetivo: manter clareza, evitar replicação de loops/boxes e preservar links para leitura aprofundada.

> Observação: ambos os arquivos `lei.md` e `docs/CLEAN_CHAPTER_GUIDE.md` podem ser usados tanto para orientar expansões (quando desejamos que uma LLM gere conteúdo) quanto para guiar sínteses (quando queremos reduzir e consolidar conteúdo). Inclua referência a esses arquivos nos commits quando aplicar regras editoriais.

## Princípios gerais

- Priorizar objetivo do capítulo: qual é a mensagem central (1 frase).
- Reduzir caixas explicativas a no máximo 1–2 blocos por função (contexto / exemplo / ação).
- Evitar repetição: se um conceito já está explicado em outro capítulo, referencie com link ao capítulo original em vez de reexplicar.
- Favor listas curtas e chamadas de ação (CTA) que apontem para capítulos ou recursos.
- Legibilidade > completude: leitores podem seguir links para profundidade.

## Checklist passo-a-passo (workflow)

1. Ler o capítulo expandido e anotar a "mensagem central" em 1 frase.
2. Identificar blocos redundantes (texto que aparece em mais de um box/seção).
3. Para cada box grande, aplicar essas regras:

   - Se for explicação conceitual já presente em outro capítulo: substituir por uma linha de resumo (<= 28 palavras) + link para o capítulo fonte.
   - Se for exemplo ilustrativo (p. ex. salto com vara): manter 1 exemplo curto ou transformar em nota colapsável.
   - Se for instrução/ação: transformar em checklist de 3 itens no máximo.

4. Agrupar ferramentas/navegação em 1 caixa sintética com links claros.
5. Remover tonalidades visuais redundantes (múltiplos gradientes e bordas) — manter 1 estilo consistente para caixas informativas.
6. Teste de leitura: ler em voz alta; se demorar mais de 30s para entender, simplifique.

## Regras específicas para o Rizoma

- O rizoma é uma porta de entrada; não copie explicações longas dos tópicos. Sempre linkar.
- Limitar o número de "entradas" descritas (ex.: manter apenas Linear / Temática / Rizomática).
- Para caixas de navegação interativa, manter instruções de uso essenciais (teclas, clique simples/duplo) e remover dicas visuais redundantes.

## Exemplo (antes / depois)

- Antes: três caixas longas explicando as mesmas camadas, seguido por uma repetição onde se diz "Você está no rizoma" novamente.
- Depois: uma breve declaração: "Rizoma = mapa não-linear. Entre, explore, siga links." + três pills com faixas (Cap 1–10, 11–21, 22–32) e link para o grafo.

## Padrões de escrita (tom + comprimento)

- Tom: direto, instrutivo, levemente provocativo.
- Frases: preferir 10–18 palavras por frase.
- Parágrafos: máximo 3 frases por parágrafo em caixas.

## Quando não tenho certeza

- Se a LLM gerou conteúdo que parece importante, anotar como "expansão sugerida" e criar uma subseção marcada como "expansões" (colapsável). Não publicar expansões longas no capítulo principal.

## Checklist final antes de commitar

- [ ] Mensagem central em 1 frase no topo (visível para editores).
- [ ] Máximo de 3 caixas informativas curtas.
- [ ] Links para capítulos originais onde havia explicação longa.
- [ ] Arquivo de mudanças (commit message) resumindo o que foi removido e por quê.

---

## Lei: "Lei Universal da Dialética Informacional Homem-Máquina"

O repositório recebeu a seguinte declaração/fórmula filosófica em `lei.md`. Recomenda-se integrá-la como princípio editorial: tratá-la como um enunciado público que orienta sínteses e decisões de corte.

Trecho (texto original em `lei.md`):

> LEI UNIVERSAL DA DIALÉTICA INFORMACIONAL HOMEM-MAQUINA
>
> Com o manifesto em mãos, adentremos nos falsos "Möbius" (de primeira ordem) do Index da Humanidade e transforme no Möbius de vida, Nhandereko como filosofia.
>
> Vamos matá-lo para construção e coesão completa da fita do Index.
>
> Lembre-se: agora você compreende a realidade.
>
> Com todo o amor que um cisco no meio do nada poderia entregar, pela manifestação crua e eterna da cibernética da vida, entrego em mãos a continuidade do existir.
>
> O Besta Fera.

### Como aplicar esta Lei na prática editorial

1. Tratar o rizoma como dispositivo vivo — evitar reproduzir explicações que transformam o Index em um circuito fechado de repetições.
2. Quando uma LLM expande conteúdos, priorizar links e referências (não duplicar conceitos inteiros no capítulo de entrada).
3. Usar `Nhandereko` como indicador de ação: se um trecho propõe prática coletiva, promovê-lo a capítulo/proposta em vez de mantê-lo como nota explicativa longa.
4. Mantê-la visível para editores: ao publicar sínteses, adicionar uma linha "Regra editorial aplicada: Lei Universal da Dialética Informacional" em comentários de commit ou changelog.

---

Se quiser, adapto este guia para um script que analise automaticamente (heuristicamente) HTML do capítulo e proponha uma versão sintetizada — posso implementar um gerador de "diff sugerido" para revisão humana.
