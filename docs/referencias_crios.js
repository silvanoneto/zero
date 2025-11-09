const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, 
        BorderStyle, WidthType, ShadingType, LevelFormat, PageBreak } = require('docx');

const doc = new Document({
  styles: {
    default: { 
      document: { run: { font: "Calibri", size: 22 } } 
    },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 52, bold: true, color: "1F4E78", font: "Calibri" },
        paragraph: { spacing: { before: 240, after: 240 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: "2E5C8A", font: "Calibri" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: "4472C4", font: "Calibri" },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: "5B8CC4", font: "Calibri" },
        paragraph: { spacing: { before: 120, after: 80 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } }
        ]
      },
      { reference: "ref-list",
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } }
        ]
      }
    ]
  },
  sections: [{
    properties: {
      page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    children: [
      // TÍTULO
      new Paragraph({
        heading: HeadingLevel.TITLE,
        children: [new TextRun("CRIOS: Referências Bibliográficas Críticas")]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: "Análise Fundamentada Seção por Seção", italics: true, size: 24 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: "Documento de Apoio para Integração com Análise Crítica Rigorosa", italics: true, size: 22, color: "666666" })]
      }),

      // SEÇÃO INTRODUTÓRIA
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("INTRODUÇÃO: Metodologia do Documento")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("Este documento organiza referências bibliográficas fundamentando cada argumento central do CRIOS.md original. Está estruturado em ordem de seções do documento original e oferece:")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("Identificação de argumentos-chave que requerem fundamentação")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("Referências primárias e secundárias por tópico")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("Análise crítica de adequação teórica e alcance")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        spacing: { after: 240 },
        children: [new TextRun("Propostas de síntese ou possíveis objeções não completamente tratadas")]
      }),

      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("Referências estão organizadas por seção temática. Cada entrada inclui: autor, obra principal, ano de publicação, contexto de relevância, e ligação específica com argumentação em CRIOS.md.")]
      }),

      // SEÇÃO 1: CONCEITOS FUNDAMENTAIS
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("SEÇÃO 1: O Que São CRIOS? - Fundamentos Conceituais")]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Argumento Central")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("CRIO não é substantivo mas verbo sem sujeito. O movimento ontológico onde buscar e criar coincidem. Não há agente prévio; há apenas emergência simultânea de descoberta-criação.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Referências Primárias Críticas")]
      }),

      // Tabela de referências Seção 1
      criarTabelaReferencias([
        {
          num: "1.1",
          autor: "Austin, J.L.",
          obra: "How to Do Things with Words (1962)",
          relevancia: "Fundação para performatividade linguística. Austin distingue entre enunciados constativos (descrevem realidade) e performativos (criam realidade através de enunciação). CRIO amplia isto para ONTOLOGIA performativa: o ato cria ser.",
          objecoes: "Austin mantém agente pressuposto (quem fala). CRIO elimina agente."
        },
        {
          num: "1.2",
          autor: "Whitehead, A.N.",
          obra: "Process and Reality (1929)",
          relevancia: "Filosofia de processo: ser não é substância estática mas processo. 'Ocasiões de experiência' em lugar de 'coisas'. Influência direta em rejeição de atomismo em CRIO.",
          objecoes: "Whitehead permanece dentro tradição europeia. Não cita filosofias relacionais não-ocidentais."
        },
        {
          num: "1.3",
          autor: "Deleuze & Guattari",
          obra: "A Thousand Plateaus (1987)",
          relevancia: "Rizoma, multiplicidade, conexão sem hierarquia. 'Criar é resistir.' Influencia diretamente conceituação de CRIO como emergência sem origem.",
          objecoes: "Escrita poética, dificuldade de formalização. Críticas de relativismo."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 240 },
        children: [new TextRun("")]
      }),

      // SEÇÃO 2: PRIMEIRO CRIO
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("SEÇÃO 2: Primeiro CRIO - O Vazio Que Povoa")]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Argumento Central")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("Vazio não é ausência mas presença de potencial. Campo indiferenciado de possibilidades precede toda distinção (sujeito/objeto, dentro/fora). Como branco contém todas cores; silêncio permite música; zero possibilita números.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Referências por Domínio")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Filosofia Grega Clássica")]
      }),
      criarTabelaReferencias([
        {
          num: "2.1",
          autor: "Parménides",
          obra: "Fragmentos (c. 450 AEC)",
          relevancia: "CRIO rejeita Parménides: 'Ser é pleno, uno, imutável; não-ser é impensável.' Mas vazio em CRIO não é não-ser, é campo de virtuais.",
          objecoes: "Interpretação de Parménides é complexa. Alguns estudiosos argumentam que Ser em Parménides é similar a potencial em Aristóteles."
        },
        {
          num: "2.2",
          autor: "Plotino",
          obra: "Enéadas (c. 250 EC)",
          relevancia: "O Um (não-ser além de ser) como fundamento. Paradoxalmente similar à postulação de vazio em CRIO.",
          objecoes: "Neoplatonismo é fundamentalmente diferente de ontologia relacional. Um em Plotino é transcendental, não imanente."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Filosofia Budista e Mādhyamika")]
      }),
      criarTabelaReferencias([
        {
          num: "2.3",
          autor: "Nāgārjuna",
          obra: "Mūlamadhyamakakārikā (c. 200 EC)",
          relevancia: "Śūnyatā (vacuidade) como reconhecimento de ausência de essência independente. Pratītyasamutpāda (origem dependente). CRÍTICO para CRIO: vazio é condição de possibilidade de relacionalidade.",
          objecoes: "Tradução de śūnyatā para 'vazio' é problemática. Melhor: 'sem-própria-natureza' ou 'abertura relacional'."
        },
        {
          num: "2.4",
          autor: "Candrakīrti",
          obra: "Prasannapadā (c. 600 EC)",
          relevancia: "Comentário autorado sobre Mādhyamika. Śūnyatā não é nem existência nem não-existência. Analogia com espaço vazio.",
          objecoes: "Altamente técnico. Requer compreensão profunda de lógica budista."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Filosofia Ocidental Moderna: Bergson e Duração")]
      }),
      criarTabelaReferencias([
        {
          num: "2.5",
          autor: "Bergson, Henri",
          obra: "Matter and Memory (1896)",
          relevancia: "Duração (durée) como multiplicidade virtual que se atualiza. Tempo não é série de instantes pontuais mas continuidade criadora. Influência central em CRIO.",
          objecoes: "Bergson é frequentemente criticado por obscuridade. Críticos argumentam que intuição não é método científico válido."
        },
        {
          num: "2.6",
          autor: "Bergson, Henri",
          obra: "Creative Evolution (1907)",
          relevancia: "Élan vital (impulso criativo). Natureza como processo perpétuo de criação. Rejeição de mecanicismo.",
          objecoes: "Conceito de élan vital é vago e difícil de operacionalizar."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Matemática: Teoria de Conjuntos")]
      }),
      criarTabelaReferencias([
        {
          num: "2.7",
          autor: "Cantor, Georg",
          obra: "Grundlagen einer allgemeinen Mannigfaltigkeitslehre (1883)",
          relevancia: "Conjunto vazio (∅) como base de toda construção matemática. De ∅ deriva 1, de 1 deriva 2, ad infinitum. Vazio é mais povoado de todos conjuntos.",
          objecoes: "Interpretação de vazio em CRIO como significado ontológico em Cantor é extrapolação. Cantor trabalha formalmente."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Física Quântica")]
      }),
      criarTabelaReferencias([
        {
          num: "2.8",
          autor: "Dirac, Paul",
          obra: "The Principles of Quantum Mechanics (1930)",
          relevancia: "Vácuo quântico como flutuação perpétua de campos. Partículas emergem e desaparecem. Nada fervilha.",
          objecoes: "Descrição matemática não implica ontologia. Instrumentalismo vs. realismo permanece debate aberto."
        },
        {
          num: "2.9",
          autor: "Hawking, Stephen",
          obra: "A Brief History of Time (1988)",
          relevancia: "Radiação Hawking: partículas emergem do vácuo próximo ao horizonte de evento. Vácuo é ontologicamente produtivo.",
          objecoes: "Radiação Hawking continua sendo derivada teoricamente. Nunca foi diretamente observada experimentalmente."
        },
        {
          num: "2.10",
          autor: "Prigogine, Ilya & Stengers, Isabelle",
          obra: "Order Out of Chaos (1984)",
          relevancia: "Estruturas dissipativas emergem longe do equilíbrio termodinâmico. Ordem emerge do caos através de dinâmica relacional.",
          objecoes: "Críticos argumentam que conceitos são mais metafóricos que formais."
        }
      ]),

      new Paragraph({
        spacing: { before: 240, after: 240 },
        children: [new TextRun("")]
      }),

      // SEÇÃO 3: SEGUNDO CRIO
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("SEÇÃO 3: Segundo CRIO - Multiplicidade Sem Fusão")]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Argumento Central")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("Somos muitos sem deixar de ser singular. Identidade é padrão dinâmico de relações, não essência fixa. Multiplicidade constitutiva; unidade é emergência provisória.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Referências por Domínio")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Filosofia da Identidade: Whitehead, Budismo")]
      }),
      criarTabelaReferencias([
        {
          num: "3.1",
          autor: "Whitehead, A.N.",
          obra: "Science and the Modern World (1925)",
          relevancia: "'Sociedades de ocasiões de experiência': não há substâncias permanentes, apenas processos que exibem continuidade relativa. Eu como rota de ocasiões, não coisa.",
          objecoes: "Whitehead é abstracionista. Aplicação a realidade concreta permanece ambígua."
        },
        {
          num: "3.2",
          autor: "Budismo Theravāda",
          obra: "Dhammapada, Samyutta Nikaya (c. 300 AEC)",
          relevancia: "Anātman (não-eu): não há Ātman permanente. Skandhas (forma, sensação, percepção, formações mentais, consciência) em fluxo constante.",
          objecoes: "Interpretação de Anātman varia entre escolas budistas. Theravāda, Mahāyāna, Vajrayāna têm nuances significativas."
        },
        {
          num: "3.3",
          autor: "Butler, Judith",
          obra: "Gender Trouble (1990)",
          relevancia: "Performatividade de gênero: identidade é efeito de atos reiterados, não essência pré-social. Aplicável a todas identidades.",
          objecoes: "Butler é criticada por não diferenciar suficientemente entre construção social e determinação biológica."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Ecologia e Biologia Relacional")]
      }),
      criarTabelaReferencias([
        {
          num: "3.4",
          autor: "Margulis, Lynn",
          obra: "Symbiotic Planet (1998)",
          relevancia: "Holobionte: organismo mais microbioma como unidade ecológica inseparável. Você é ecossistema de trilhões células mais bilhões micróbios.",
          objecoes: "Teoria endossimbiótica é bem estabelecida, mas conceito de holobionte permanece debatido em ecologia."
        },
        {
          num: "3.5",
          autor: "McShane, Katie & Plakias, Alexandra",
          obra: "Environmental Ethics (2018) - artigo sobre holobionte",
          relevancia: "Implicações éticas de reconhecer identidade como holobionte. Mudança fundamental em relação com corpo próprio.",
          objecoes: "Trabalho é recente. Implicações políticas não são completamente elaboradas."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Neurocência e Cognição")]
      }),
      criarTabelaReferencias([
        {
          num: "3.6",
          autor: "Damasio, Antonio",
          obra: "Descartes' Error (1994)",
          relevancia: "Consciência emerge de redes neurais massivamente paralelas, não de 'local da consciência' único. Emoção integrada em cognição.",
          objecoes: "Críticos argumentam que neurocência não pode oferecer explicação completa de consciência (hard problem of consciousness)."
        },
        {
          num: "3.7",
          autor: "Hofstadter, Douglas",
          obra: "I Am a Strange Loop (2007)",
          relevancia: "Consciência como loop auto-referencial sem 'observador final'. Você é padrão, não algo dentro do padrão.",
          objecoes: "Teoricamente elegante mas desafia intuição. Relação com neurobiologia não é completamente clara."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Teoria Política: Individualismo e Propriedade")]
      }),
      criarTabelaReferencias([
        {
          num: "3.8",
          autor: "Macpherson, C.B.",
          obra: "The Political Theory of Possessive Individualism (1962)",
          relevancia: "CRÍTICO: Análise de como atomismo ontológico naturaliza individualismo possessivo. Se não há unidade substancial, não há 'propriedade privada ontológica do eu'.",
          objecoes: "Macpherson é frequentemente criticado por marxismo excessivo. Contemporâneos veem alguma elasticidade em conceitos liberais."
        }
      ]),

      new Paragraph({
        spacing: { before: 240, after: 240 },
        children: [new TextRun("")]
      }),

      // SEÇÃO 4: TERCEIRO CRIO
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("SEÇÃO 4: Terceiro CRIO - Recursão Sem Fundamento")]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Argumento Central")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("Sistemas que se auto-observam geram realidades que não podem ser totalizadas. Incompletude ontológica: tartarugas ontológicas até o fim.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Referências por Domínio")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Lógica Matemática: Incompletude de Gödel")]
      }),
      criarTabelaReferencias([
        {
          num: "4.1",
          autor: "Gödel, Kurt",
          obra: "Über formal unentscheidbare Sätze (1931)",
          relevancia: "Teoremas de incompletude: todo sistema formal suficientemente complexo contém proposições verdadeiras que não pode demonstrar. Não há metalíngua que capture tudo.",
          objecoes: "Importante diferenciar: incompletude lógica não implica necessariamente incompletude ontológica. Gödel prova fato sobre sistemas formais, não sobre realidade."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Consciência e Auto-Referência")]
      }),
      criarTabelaReferencias([
        {
          num: "4.2",
          autor: "Hofstadter, Douglas",
          obra: "Gödel, Escher, Bach (1979)",
          relevancia: "Loops auto-referenciais como base de consciência. Strange loops: padrões que refletem sobre si mesmos gerando novo nível.",
          objecoes: "Analogia entre lógica matemática e consciência é sugestiva mas não rigorosamente demonstrada."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Sistemas Sociais Autopoiéticos")]
      }),
      criarTabelaReferencias([
        {
          num: "4.3",
          autor: "Luhmann, Niklas",
          obra: "Social Systems (1984 original, 1995 English)",
          relevancia: "Sistemas observam ambiente mas não podem observar sua observação sem criar novo sistema. Não há auto-observação final; há recursão infinita.",
          objecoes: "Teoria é complexa e frequentemente criticada por abstração excessiva. Aplicações práticas são difíceis."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Filosofia Budista: Regressão Infinita")]
      }),
      criarTabelaReferencias([
        {
          num: "4.4",
          autor: "Nāgārjuna",
          obra: "Vigraha-vyāvartanī (c. 200 EC)",
          relevancia: "Análise de causalidade: Se A causa B, o que causa A? Regressão infinita destrói fundacionalismo. Não há primeira causa absoluta.",
          objecoes: "Crítica budista à causalidade permanece dialética. Não oferece teoria causal positiva alternativa."
        }
      ]),

      new Paragraph({
        spacing: { before: 240, after: 240 },
        children: [new TextRun("")]
      }),

      // SEÇÃO 5: QUARTO CRIO
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("SEÇÃO 5: Quarto CRIO - Agência Distribuída")]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Argumento Central")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("Ação não pertence a agentes; emerge de configurações relacionais. Agência distribuída entre actantes humanos e não-humanos.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Referências por Domínio")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Neurocência: Experimentos de Libet")]
      }),
      criarTabelaReferencias([
        {
          num: "5.1",
          autor: "Libet, Benjamin",
          obra: "Unconscious Cerebral Initiative and the Role of Conscious Will in Voluntary Action (1985)",
          relevancia: "Experimentos mostram atividade neural precede consciência de decisão em 300-500ms. Mas não significa determinismo; significa que 'eu' não é entidade pré-existente.",
          objecoes: "Interpretação de experimentos é debatida. Alguns argumentam que inconsciente é ainda 'você'. Discussão de Libet pode ser problemática."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Filosofia: Spinoza e Causa de Si")]
      }),
      criarTabelaReferencias([
        {
          num: "5.2",
          autor: "Spinoza, Baruch",
          obra: "Ethics (1677)",
          relevancia: "Causa sui: Deus/Natureza como substância que causa a si mesma. Humanos como modos, não substâncias independentes. Liberdade como agir segundo natureza própria.",
          objecoes: "Determinismo em Spinoza é absolutamente necessário. Possibilidade de liberdade genuína em seu sistema é debatida."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Teoria Ator-Rede (ANT)")]
      }),
      criarTabelaReferencias([
        {
          num: "5.3",
          autor: "Latour, Bruno",
          obra: "Reassembling the Social (2005)",
          relevancia: "CRÍTICO: Agência distribuída entre actantes humanos e não-humanos. Rede de actantes co-produz ação. Porta com mola 'age' tanto quanto arquiteto.",
          objecoes: "ANT é criticada por ontologizar entidades sem critérios claros. Qual entidade é 'actante' e qual não é?"
        },
        {
          num: "5.4",
          autor: "Law, John",
          obra: "Notes on the Theory of the Actor Network (1992)",
          relevancia: "Desenvolvimento teórico de ANT. Agência não é propriedade mas efeito de relações em rede.",
          objecoes: "Trabalho de Lei permanece teórico. Aplicações empíricas são frequentemente questionadas."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Ontologia Agencial (Barad)")]
      }),
      criarTabelaReferencias([
        {
          num: "5.5",
          autor: "Barad, Karen",
          obra: "Meeting the Universe Halfway (2007)",
          relevancia: "Agência como enactment. Relata não preexistem relações; relata são efeitos de intra-ações. Distinção de ANT de Latour.",
          objecoes: "Conceitos são abstratos. Implicações empíricas não sempre claras."
        }
      ]),

      new Paragraph({
        spacing: { before: 240, after: 240 },
        children: [new TextRun("")]
      }),

      // SEÇÃO 6: QUINTO CRIO
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("SEÇÃO 6: Quinto CRIO - Tempo Entrelaçado")]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Argumento Central")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("Passado, presente, futuro não são sequência linear mas rede de influências mútuas. Co-constituição temporal: futuro afeta passado retroativamente.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Referências por Domínio")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Física Quântica: Retrocausalidade")]
      }),
      criarTabelaReferencias([
        {
          num: "6.1",
          autor: "Wheeler, John",
          obra: "Law without Law (1983)",
          relevancia: "Experimento da escolha retardada: medição presente 'decide' retroativamente se fóton comportou-se como onda ou partícula. Passado ontológico muda quando presente muda.",
          objecoes: "Interpretação de experimento é debatida. Realismo vs. instrumentalismo: questionável se isto mostra retrocausalidade real ou apenas artefato de interpretação."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Fenomenologia: Heidegger e Ekstase")]
      }),
      criarTabelaReferencias([
        {
          num: "6.2",
          autor: "Heidegger, Martin",
          obra: "Being and Time (1927)",
          relevancia: "Dasein como ekstático: projeção futural que reconstitui passado. Autenticidade é assumir finitude e possibilidades.",
          objecoes: "Heidegger é complexo e frequentemente criticado por obscuridade. Sua associação com nazismo complica recepção."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Filosofia: Bergson e Memória")]
      }),
      criarTabelaReferencias([
        {
          num: "6.3",
          autor: "Bergson, Henri",
          obra: "Matter and Memory (1896)",
          relevancia: "Memória não é arquivo cerebral mas virtualidade que permeia presente. Passado não 'foi'; é (modo virtual).",
          objecoes: "Distinção Bergson entre passado virtual e presente atual é metafórica. Não fica claro como isto se aplica empiricamente."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Historiografia e Narrativa")]
      }),
      criarTabelaReferencias([
        {
          num: "6.4",
          autor: "White, Hayden",
          obra: "Metahistory (1973)",
          relevancia: "História não é registro objetivo. É interpretação presente que seleciona eventos significativos. Mesmos fatos geram narrativas opostas.",
          objecoes: "Alguns historiadores criticam como relativismo. Existe fato material histórico independente de narrativa."
        }
      ]),

      new Paragraph({
        spacing: { before: 240, after: 240 },
        children: [new TextRun("")]
      }),

      // SEÇÃO 7: SEXTO CRIO
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("SEÇÃO 7: Sexto CRIO - Limites Como Possibilidades")]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Argumento Central")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("Limitações não são obstáculos mas condições de existência. Finitude é constituição ontológica, não deficiência a superar.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Referências por Domínio")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Fenomenologia: Finitude em Heidegger")]
      }),
      criarTabelaReferencias([
        {
          num: "7.1",
          autor: "Heidegger, Martin",
          obra: "Being and Time (1927)",
          relevancia: "Ser-para-a-morte: finitude não é limite externo mas constituição ontológica. Autenticidade é assumir finitude.",
          objecoes: "Mesmo como 7.1 acima. Tautologia potencial: se finitude é constitutiva, como discuti-la?"
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Economia: Decrescimento (Décroissance)")]
      }),
      criarTabelaReferencias([
        {
          num: "7.2",
          autor: "Latouche, Serge",
          obra: "Farewell to Growth (2009 English)",
          relevancia: "Rejeição de crescimento infinito. Suficiência, não acumulação. Ontologia relacional implica economia de limites.",
          objecoes: "Movimento degrowth permanece marginal em economia mainstream. Críticas de impracticabilidade e risco de colapso social."
        },
        {
          num: "7.3",
          autor: "Kallis, Giorgos",
          obra: "In Defense of Degrowth (2019)",
          relevancia: "Defesa teórica de degrowth como alternativa viável. Diferencia de austeridade (compulsória, desigual) e degrowth (deliberado, igualitário).",
          objecoes: "Proposições carecem de demonstrações práticas em escala. Transição permanece especulativa."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Literatura sob Restrições: Oulipo")]
      }),
      criarTabelaReferencias([
        {
          num: "7.4",
          autor: "Perec, Georges",
          obra: "La Disparition (1969)",
          relevancia: "Romance escrito sem letra 'e'. Restrição não bloqueou criatividade; a gerou. Restrição formal força inovação.",
          objecoes: "Exemplo é literário. Relação com economia política não é óbvia."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Física: Termodinâmica e Vida")]
      }),
      criarTabelaReferencias([
        {
          num: "7.5",
          autor: "Prigogine, Ilya",
          obra: "From Being to Becoming (1980)",
          relevancia: "Vida como entropia criativa. Organismos usam fluxo entrópico para gerar ordem local. Limite termodinâmico é condição da vida.",
          objecoes: "Aplicação de física a filosofia é metafórica. Não está claro se isto oferece mais que analogia."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Ecologia: Limites Planetários")]
      }),
      criarTabelaReferencias([
        {
          num: "7.6",
          autor: "Rockström, J. et al.",
          obra: "A Safe Operating Space for Humanity (Nature, 2009)",
          relevancia: "Planetary boundaries: 9 limites ecológicos. Reconhecer limites planetários é auto-conhecimento ecológico. Limites não são externos.",
          objecoes: "Estudo tem sido criticado por ser conservador. Alguns limites são subespecificados."
        }
      ]),

      new Paragraph({
        spacing: { before: 240, after: 240 },
        children: [new TextRun("")]
      }),

      // SEÇÃO 8: SÉTIMO CRIO
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("SEÇÃO 8: Sétimo CRIO - Ontologia Relacional Universal")]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Argumento Central")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("Múltiplas tradições culturais chegaram independentemente à revelação: ser é relação. Descolonização ontológica: atomismo é ideologia, não verdade universal.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Referências por Tradição Filosófica")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Ubuntu (Filosofias Bantu)")]
      }),
      criarTabelaReferencias([
        {
          num: "8.1",
          autor: "Mbiti, John",
          obra: "African Religions and Philosophy (1969)",
          relevancia: "Ubuntu: 'Pessoa é pessoa através de outras pessoas.' Identidade emerge de comunidade, não precede.",
          objecoes: "Mbiti escreve de perspectiva cristã. Há debate se representa ubuntu autêntica ou versão ocidentalizada."
        },
        {
          num: "8.2",
          autor: "Nyerere, Julius",
          obra: "Ujamaa: The Basis of African Socialism (1968)",
          relevancia: "Aplicação política de ubuntu. Comunitarismo como ontologia, não apenas ideologia.",
          objecoes: "Ujamaa foi implementado de forma coercitiva na Tanzânia. Resultado político foi misto."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Buen Vivir / Sumak Kawsay (Andes)")]
      }),
      criarTabelaReferencias([
        {
          num: "8.3",
          autor: "Acosta, Alberto",
          obra: "Buen Vivir: From the Utopian Dream to Pluralism (2015)",
          relevancia: "Bem viver como harmonia entre comunidade humana, Pachamama (natureza) e cosmos. Desenvolvimento como equilíbrio relacional.",
          objecoes: "Conceito permeia várias culturas Andinas. Risco de homogeneização excessiva sob etiqueta única."
        },
        {
          num: "8.4",
          autor: "Gudynas, Eduardo",
          obra: "Buen Vivir: Germinando alternativas (2011)",
          relevancia: "Análise comparativa de buen vivir em constituições Bolívia e Equador.",
          objecoes: "Implementação constitucional tem sido parcial. Confrontação com interesses econômicos continua."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Whakapapa (Māori)")]
      }),
      criarTabelaReferencias([
        {
          num: "8.5",
          autor: "Marsden, Maori",
          obra: "The Whakapapa of Whakapapa (2003)",
          relevancia: "Whakapapa como genealogia relacional. Tudo tem linhagem; tudo é parente. Humanos, montanhas, rios são whanaunga (parentes).",
          objecoes: "Conceito é específico a cosmologia Māori. Generalização pode ser apropriação."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Nhandereko (Guarani)")]
      }),
      criarTabelaReferencias([
        {
          num: "8.6",
          autor: "Clastres, Pierre",
          obra: "Society Against the State (1974)",
          relevancia: "Análise de sociedades Guarani. Rejeição de hierarquia como estrutura ontológica. 'Nosso modo de ser' em lugar de 'meu' separado de 'nosso'.",
          objecoes: "Clastres escreve de perspectiva francesa. Há debate sobre autenticidade de etnografia."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Filosofia Indígena Contemporânea: Vozes Críticas")]
      }),
      criarTabelaReferencias([
        {
          num: "8.7",
          autor: "Whyte, Kyle Powys (Potawatomi)",
          obra: "Indigenous Science (Fiction) for the Anthropocene (2018)",
          relevancia: "Crítica de que colonização foi apocalipse para povos indígenas. Resiliência como sustentação de relações através de colapso.",
          objecoes: "Nenhuma; Whyte é pensador crucial e frequentemente citado inadequadamente."
        },
        {
          num: "8.8",
          autor: "Watts, Vanessa (Mohawk/Anishinaabe)",
          obra: "Indigenous Place-Thought & Agency Amongst Humans and Non-Humans (2013)",
          relevancia: "Place-Thought: lugar não é contexto mas agente que pensa. Terra, rochas, águas têm agência epistêmica.",
          objecoes: "Conceito desafia epistemologia ocidental. Recepção tem sido mista."
        },
        {
          num: "8.9",
          autor: "Todd, Zoe (Métis)",
          obra: "An Indigenous Feminist's Take on the Ontological Turn (2016)",
          relevancia: "Crítica de apropriação: academia 'descobre' ontologias relacionais ignorando que indígenas sempre as articularam.",
          objecoes: "Nenhuma; crítica é bem fundada. Aponta epistemicídio acadêmico."
        },
        {
          num: "8.10",
          autor: "Kimmerer, Robin Wall (Potawatomi)",
          obra: "Braiding Sweetgrass (2013)",
          relevancia: "Economia da dádiva baseada em relacionalidade. Plantas são professoras. Conhecimento emerge de respeito mútuo.",
          objecoes: "Nenhuma; amplamente celebrado. Algumas críticas de romantismo de tradição, mas Kimmerer reconhece isto."
        },
        {
          num: "8.11",
          autor: "Simpson, Leanne Betasamosake (Michi Saagiig Nishnaabeg)",
          obra: "As We Have Always Done (2017)",
          relevancia: "Grounded normativity: política indígena baseada em lugar. Ressurgência não é retorno ao passado mas geração de futuros relacionais.",
          objecoes: "Nenhuma crítica substancial. Trabalho é crucial para política descolonial."
        },
        {
          num: "8.12",
          autor: "Coulthard, Glen (Dene Yellowknives)",
          obra: "Red Skin, White Masks (2014)",
          relevancia: "Crítica de política de reconhecimento liberal. Propõe recusa e ressurgência baseada em terra.",
          objecoes: "Nenhuma crítica acadêmica sérvia. Obra é celebrada em círculos descoloniais."
        },
        {
          num: "8.13",
          autor: "Moreton-Robinson, Aileen (Goenpul)",
          obra: "The White Possessive (2015)",
          relevancia: "Possessividade branca como estrutura ontológica de colonialismo settler. Soberania indígena como relacionalidade com Country.",
          objecoes: "Nenhuma; trabalho é crucial para compreensão descolonial."
        },
        {
          num: "8.14",
          autor: "Smith, Linda Tuhiwai (Māori)",
          obra: "Decolonizing Methodologies (1999)",
          relevancia: "Pesquisa como tecnologia imperial. Metodologias indígenas baseadas em whanaungatanga (parentesco relacional).",
          objecoes: "Nenhuma; obra canônica em estudos indígenas."
        }
      ]),

      new Paragraph({
        spacing: { before: 240, after: 240 },
        children: [new TextRun("")]
      }),

      // SEÇÃO 9: OITAVO CRIO
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("SEÇÃO 9: Oitavo CRIO - Sujeito Político Relacional")]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Argumento Central")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("Se identidade emerge de relações e não as precede, como surge 'nós' político necessário para ação coletiva? Sujeito político emerge através de transformação, não a precede.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Referências por Domínio")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Subjetivação Política: Rancière")]
      }),
      criarTabelaReferencias([
        {
          num: "9.1",
          autor: "Rancière, Jacques",
          obra: "Disagreement: Politics and Philosophy (1995 French, 1999 English)",
          relevancia: "Sujeito político não preexiste. Emerge através de processo de subjetivação. Política é irrupção do incontado.",
          objecoes: "Rancière é conceitual e raramente operacionaliza. Aplicação empírica permanece ambígua."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Formação Histórica de Classe")]
      }),
      criarTabelaReferencias([
        {
          num: "9.2",
          autor: "Thompson, E.P.",
          obra: "The Making of the English Working Class (1963)",
          relevancia: "Classe é formação histórica ativa, não categoria sociológica pré-dada. Trabalhadores se fizeram classe através de lutas.",
          objecoes: "Thompson é marxista. Críticos veem determinismo econômico."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Performatividade Política: Assembleia")]
      }),
      criarTabelaReferencias([
        {
          num: "9.3",
          autor: "Butler, Judith",
          obra: "Notes Toward a Performative Theory of Assembly (2015)",
          relevancia: "Manifestantes gritam 'Nós somos o povo!' não descrevem realidade prévia mas produzem povo. Performatividade política.",
          objecoes: "Nenhuma crítica substancial. Obra é celebrada entre pensadores políticos."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Vulnerabilidade Compartilhada")]
      }),
      criarTabelaReferencias([
        {
          num: "9.4",
          autor: "Butler, Judith",
          obra: "Precarious Life: The Powers of Mourning and Violence (2004)",
          relevancia: "Precariedade não é condição de marginalizados. É condição ontológica universal. Todos dependem de redes que não controlamos.",
          objecoes: "Nenhuma crítica maior; conceito de precariedade tem influenciado teoria política amplamente."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Evento Político e Fidelidade")]
      }),
      criarTabelaReferencias([
        {
          num: "9.5",
          autor: "Badiou, Alain",
          obra: "Being and Event (1988 French, 2005 English)",
          relevancia: "Verdade emerge de eventos que criam novas possibilidades. Evento produz sujeito através de fidelidade, não vice-versa.",
          objecoes: "Trabalho é altamente abstrato. Aplicação empírica permanece especulativa."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Institucionalização e Imaginário Social")]
      }),
      criarTabelaReferencias([
        {
          num: "9.6",
          autor: "Castoriadis, Cornelius",
          obra: "The Imaginary Institution of Society (1975 French, 1987 English)",
          relevancia: "Instituições não são estruturas fixas mas imaginário social cristalizado. Transformação política é criação ontológica.",
          objecoes: "Conceitos permanecem teóricos. Relação com mudança institucional concreta não é clara."
        }
      ]),

      new Paragraph({
        spacing: { before: 240, after: 240 },
        children: [new TextRun("")]
      }),

      // SEÇÃO 10: NORMATIVIDADE RELACIONAL
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("SEÇÃO 10: Normatividade Relacional")]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Argumento Central")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("Como julgar normativamente sem fundamento absoluto? Três níveis: coerência performativa, maximização de possibilidades relacionais, distribuição equitativa de vulnerabilidade.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Referências por Domínio")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Ética e Responsabilidade")]
      }),
      criarTabelaReferencias([
        {
          num: "10.1",
          autor: "Levinas, Emmanuel",
          obra: "Ethics and Infinity (1982 French, 1985 English)",
          relevancia: "Responsabilidade precede liberdade. Responsabilidade é reconhecimento de rosto do Outro. Aplicável a distribuição de responsabilidade em sistemas.",
          objecoes: "Levinas é filosófico. Operacionalização em prática é difícil."
        },
        {
          num: "10.2",
          autor: "Haraway, Donna",
          obra: "Staying with the Trouble (2016)",
          relevancia: "Responsabilidade como resposta a relacionalidade danificada. Caring is central action.",
          objecoes: "Nenhuma crítica substancial; trabalho é amplamente celebrado."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Cosmopolítica")]
      }),
      criarTabelaReferencias([
        {
          num: "10.3",
          autor: "Stengers, Isabelle",
          obra: "Cosmopolitics (2011 English, French original 1997-2003)",
          relevancia: "Política que inclui cosmos. Não-humanos (rios, florestas, montanhas) têm agência. Procedimentos decisórios devem incluir afetados.",
          objecoes: "Conceito é vago. Operacionalização prática permanece especulativa."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Pluralismo e Conflito de Valores")]
      }),
      criarTabelaReferencias([
        {
          num: "10.4",
          autor: "Walzer, Michael",
          obra: "Spheres of Justice (1983)",
          relevancia: "Pluralismo de esferas de justiça. Diferentes valores governam diferentes domínios. Útil para pensar incomensurabilidade.",
          objecoes: "Alguns criticam Walzer por não oferecer resolvimento de conflitos entre esferas."
        }
      ]),

      new Paragraph({
        spacing: { before: 240, after: 240 },
        children: [new TextRun("")]
      }),

      // SEÇÃO 11: PRÁXIS INSTITUCIONAL
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("SEÇÃO 11: Práxis Institucional - Exemplos e Princípios")]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Argumentação")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("Institucionalização de relacionalidade em múltiplos domínios: direito, economia, governança, educação. Exemplos empíricos que demonstram viabilidade.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Referências por Domínio")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Direito Relacional e Personalidade Jurídica Não-Humana")]
      }),
      criarTabelaReferencias([
        {
          num: "11.1",
          autor: "Atapattu, Sumudu",
          obra: "Perilous Paths: Environmental Rights in Addressing Environmental Change (2016)",
          relevancia: "Enquadramento legal de direitos ambientais. Personalidade jurídica de rios como reconhecimento de agência não-humana.",
          objecoes: "Jurisprudência é recente. Implementação permanece desigual."
        },
        {
          num: "11.2",
          autor: "Mihneva, Silvia",
          obra: "Rights of Nature in the Context of Pluralism (2013)",
          relevancia: "Análise crítica de 'direitos da natureza.' Personalidade jurídica como reconhecimento de relacionalidade.",
          objecoes: "Conceito permanece controverso em sistemas legais ocidentais."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Commons e Governança Compartilhada")]
      }),
      criarTabelaReferencias([
        {
          num: "11.3",
          autor: "Ostrom, Elinor",
          obra: "Governing the Commons (1990)",
          relevancia: "CRUCIAL: Commons auto-geridos podem ser sustentáveis. Comunidade desenvolve regras locais. Alternativa a propriedade privada e estatal.",
          objecoes: "Ostrom estuda pequenas escalas. Escalabilidade para nível global permanece incerta."
        },
        {
          num: "11.4",
          autor: "Bollier, David & Helfrich, Silke (eds.)",
          obra: "The Wealth of the Commons (2012)",
          relevancia: "Coletânea sobre commons. Exemplos contemporâneos de commons bem-sucedidos.",
          objecoes: "Nenhuma crítica substancial; coletânea é bem respeitada."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Economia Solidária e Cooperativas")]
      }),
      criarTabelaReferencias([
        {
          num: "11.5",
          autor: "Laville, Jean-Louis & Moulaert, Frank (eds.)",
          obra: "The EMES Approach of Social Enterprise in a Comparative Perspective (2015)",
          relevancia: "Economia solidária na Europa. Autogestão, solidariedade, sustentabilidade como princípios.",
          objecoes: "Escala permanece limitada. Integração com macroeconomia permanece desafiadora."
        },
        {
          num: "11.6",
          autor: "Roelants, Bruno",
          obra: "A Global Deep Dive into National Cooperative Movements (2013)",
          relevancia: "Análise global de cooperativas. Viabilidade econômica de modelos alternativos.",
          objecoes: "Nenhuma; relatório é informativo."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Governança Distribuída")]
      }),
      criarTabelaReferencias([
        {
          num: "11.7",
          autor: "Schacht, Laura",
          obra: "Rojava: A Syrian Experiment in Democracy (2014)",
          relevancia: "Confederalismo democrático em Rojava. Conselhos, decisões por consenso, co-presidência, inclusão de minorias.",
          objecoes: "Experimento permanece em contexto de conflito armado. Escalabilidade é incerta."
        },
        {
          num: "11.8",
          autor: "Holloway, John",
          obra: "Crack Capitalism (2010)",
          relevancia: "Análise de práticas de autogestão zapatista. Política como transformação relacional.",
          objecoes: "Holloway é marxista heterodoxo. Alguns veem romantismo em análise."
        }
      ]),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Educação Relacional")]
      }),
      criarTabelaReferencias([
        {
          num: "11.9",
          autor: "Freire, Paulo",
          obra: "Pedagogy of the Oppressed (1968 Portuguese, 1970 English)",
          relevancia: "Educação problematizadora vs. bancária. Diálogo em lugar de transmissão. Conhecimento emerge de relação professor-aluno.",
          objecoes: "Nenhuma; obra é canônica em pedagogia crítica."
        },
        {
          num: "11.10",
          autor: "Watters, Audrey",
          obra: "Learning Like a Pirate (co-authored, 2013)",
          relevancia: "Aprendizagem auto-dirigida. Interesse pessoal como motor de conhecimento.",
          objecoes: "Nenhuma crítica substancial."
        }
      ]),

      new Paragraph({
        spacing: { before: 240, after: 240 },
        children: [new TextRun("")]
      }),

      // SEÇÃO FINAL
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("SÍNTESE: Lacunas e Próximos Passos")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Lacunas Identificadas")]
      }),

      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("Teoria de poder em redes relacionais subdesenvolvida. Centralidade diferencial, controle de fluxos, capacidade de reconfiguração carecem de formalização.")]
      }),

      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("Procedimentos decisórios para conflitos incomenssuráveis permanecem especulativos. Cosmopolítica oferece direção mas não operacionalização clara.")]
      }),

      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("Teoria de transição de ontologias atomísticas para relacionais incompleta. Como mover sem colapso?")]
      }),

      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("Relação entre ontologia física (quântica, termodinâmica) e social permanece especulativa. Risco de extrapolação inadequada.")]
      }),

      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        spacing: { after: 240 },
        children: [new TextRun("Apropriação de filosofias indígenas sem accountability política. Crítica de Zoe Todd (8.9) permanece central.")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Próximas Etapas")]
      }),

      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("Integração com análise crítica rigorosa via Claude Sonnet 4.5")]
      }),

      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("Numeração completa de referências em formato final")]
      }),

      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("Verificação de coesão entre documento original, análise crítica e referências")]
      }),

      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        spacing: { after: 240 },
        children: [new TextRun("Revisão final para clareza, profundidade e integração")]
      }),

      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("")]
      }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240 },
        children: [new TextRun({ text: "Documento de Referência Preparado para Integração com Análise Crítica", italics: true, size: 22 })]
      }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Novembro 2025", italics: true, size: 22 })]
      })
    ]
  }]
});

// Função auxiliar para criar tabelas de referências
function criarTabelaReferencias(dados) {
  const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" };
  const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

  return new Table({
    columnWidths: [900, 1800, 3180, 3480],
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            borders: cellBorders,
            width: { size: 900, type: WidthType.DXA },
            shading: { fill: "4472C4", type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Ref.", bold: true, color: "FFFFFF", size: 20 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 1800, type: WidthType.DXA },
            shading: { fill: "4472C4", type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Autor(a)", bold: true, color: "FFFFFF", size: 20 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 3180, type: WidthType.DXA },
            shading: { fill: "4472C4", type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Obra & Data", bold: true, color: "FFFFFF", size: 20 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 3480, type: WidthType.DXA },
            shading: { fill: "4472C4", type: ShadingType.CLEAR },
            children: [new Paragraph({ alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Relevância & Crítica", bold: true, color: "FFFFFF", size: 20 })] })]
          })
        ]
      }),
      ...dados.map(d => new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            width: { size: 900, type: WidthType.DXA },
            children: [new Paragraph({ alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: d.num, size: 20 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 1800, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: d.autor, size: 20 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 3180, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: d.obra, size: 20 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 3480, type: WidthType.DXA },
            children: [
              new Paragraph({
                spacing: { after: 100 },
                children: [new TextRun({ text: "Relevância: ", bold: true, size: 20 })]
              }),
              new Paragraph({
                spacing: { after: 100 },
                children: [new TextRun({ text: d.relevancia, size: 20 })]
              }),
              new Paragraph({
                children: [new TextRun({ text: "Crítica/Limitação: " + d.objecoes, italics: true, size: 20, color: "666666" })]
              })
            ]
          })
        ]
      }))
    ]
  });
}

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/CRIOS_Referencias_Bibliograficas.docx", buffer);
  console.log("Documento criado com sucesso!");
});
