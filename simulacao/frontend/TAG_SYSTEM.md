# Sistema de Tags Expandido - Revolução Cibernética

## 📋 Visão Geral

O sistema de tags foi completamente reformulado para oferecer:

1. **14 categorias abrangentes** cobrindo todas as áreas da vida humana
2. **Autocomplete inteligente** com sugestões filtradas
3. **Interface visual rica** com cores por categoria
4. **Navegação por teclado** completa
5. **Compatibilidade dark/light mode** perfeita

## 🏷️ Categorias Disponíveis

### 1. **Educação** (Azul)
- educação básica, ensino superior, formação profissional
- educação infantil, alfabetização, educação digital
- pesquisa acadêmica, bolsas de estudo, educação especial
- educação a distância

### 2. **Saúde** (Vermelho)
- saúde pública, hospitais, medicamentos, prevenção
- saúde mental, vacinas, atendimento básico
- emergência médica, nutrição, saneamento

### 3. **Economia** (Verde)
- orçamento, financiamento, investimento
- desenvolvimento econômico, empreendedorismo
- microcrédito, comércio, tributação
- renda básica, economia solidária

### 4. **Tecnologia** (Roxo)
- tecnologia, inovação, infraestrutura digital
- internet, telecomunicações, criptografia
- blockchain, inteligência artificial
- segurança digital, código aberto

### 5. **Meio Ambiente** (Esmeralda)
- meio ambiente, biodiversidade, clima
- energia renovável, preservação, desmatamento
- poluição, reciclagem, água, sustentabilidade

### 6. **Cultura** (Rosa)
- cultura, arte, patrimônio histórico
- música, cinema, teatro, literatura
- museus, festivais, artesanato

### 7. **Infraestrutura** (Laranja)
- infraestrutura, transporte público, mobilidade urbana
- rodovias, portos, aeroportos, obras públicas
- urbanismo, habitação, energia

### 8. **Direitos e Ética** (Âmbar)
- direitos humanos, ético, fundamental, constitucional
- dignidade, igualdade, liberdade, justiça social
- acessibilidade, inclusão

### 9. **Segurança** (Ardósia)
- segurança pública, defesa civil
- prevenção de desastres, policiamento
- emergências, vigilância, crime, justiça, proteção

### 10. **Social** (Ciano)
- assistência social, vulnerabilidade, comunidade
- família, criança e adolescente, idosos
- trabalho, emprego, moradia, alimentação

### 11. **Ciência e Pesquisa** (Índigo)
- ciência, pesquisa científica, laboratórios
- inovação científica, medicina, biologia
- física, química, astronomia, tecnologia científica

### 12. **Esporte e Lazer** (Teal)
- esporte, lazer, recreação
- esporte amador, esporte profissional, olimpíadas
- infraestrutura esportiva, atividade física
- parques, turismo

### 13. **Comunicação** (Violeta)
- comunicação, mídia, jornalismo, transparência
- informação pública, dados abertos
- liberdade de expressão, redes sociais
- radiodifusão, imprensa

### 14. **Administrativo** (Cinza)
- administrativo, procedural, operacional
- gestão pública, burocracia, processos
- documentação, contratos, licitações
- recursos humanos

## 🎯 Mapeamento para Tipos de Votação

O sistema mantém o mapeamento automático conforme Art. 3º-A da Constituição:

### LINEAR (Administrativo)
Tags administrativas, procedurais, operacionais, gestão pública, etc.

### QUADRATIC (Alocação de Recursos)
Orçamento, financiamento, investimento, bolsas, assistência social, alimentação, etc.

### LOGARITHMIC (Técnico/Especializado)
Tecnologia, saúde, infraestrutura, ciência, meio ambiente, energia, transporte, etc.

### CONSENSUS (Ético/Fundamental)
Direitos humanos, ético, fundamental, constitucional, dignidade, liberdade, educação básica, etc.

## 💡 Como Usar

### Interface Básica
1. Digite no campo de busca para filtrar tags
2. Use ↑↓ para navegar pelas sugestões
3. Pressione Enter para selecionar
4. Clique no X para remover tags
5. Backspace com campo vazio remove última tag

### Busca Inteligente
- Busque por **nome da tag**: "educação", "saúde", "tecnologia"
- Busque por **categoria**: "Educação" mostra todas as tags educacionais
- Sistema filtra automaticamente tags já selecionadas

### Visual e Acessibilidade
- Cada categoria tem cor única (14 cores diferentes)
- Tags mostram ícone e categoria de origem
- Sugestões mostram categoria para contexto
- Funciona perfeitamente em dark e light mode

## 🎨 Cores por Categoria

| Categoria | Cor | Light Mode | Dark Mode |
|-----------|-----|------------|-----------|
| Educação | Azul | bg-blue-100 | bg-blue-900/30 |
| Saúde | Vermelho | bg-red-100 | bg-red-900/30 |
| Economia | Verde | bg-green-100 | bg-green-900/30 |
| Tecnologia | Roxo | bg-purple-100 | bg-purple-900/30 |
| Meio Ambiente | Esmeralda | bg-emerald-100 | bg-emerald-900/30 |
| Cultura | Rosa | bg-pink-100 | bg-pink-900/30 |
| Infraestrutura | Laranja | bg-orange-100 | bg-orange-900/30 |
| Direitos | Âmbar | bg-amber-100 | bg-amber-900/30 |
| Segurança | Ardósia | bg-slate-100 | bg-slate-900/30 |
| Social | Ciano | bg-cyan-100 | bg-cyan-900/30 |
| Ciência | Índigo | bg-indigo-100 | bg-indigo-900/30 |
| Esporte | Teal | bg-teal-100 | bg-teal-900/30 |
| Comunicação | Violeta | bg-violet-100 | bg-violet-900/30 |
| Administrativo | Cinza | bg-gray-100 | bg-gray-900/30 |

## 📁 Arquivos Modificados

### Novos Arquivos
- `frontend/src/components/TagAutocomplete.tsx` - Componente de autocomplete

### Arquivos Atualizados
- `frontend/src/components/CreateProposal.tsx`
  - Importa TagAutocomplete
  - Expandiu TAG_TO_VOTE_TYPE com 100+ tags
  - Removeu input manual de tags
  - Integrou novo componente

## 🔧 Arquitetura Técnica

### TagAutocomplete Component
```typescript
interface TagAutocompleteProps {
  selectedTags: string[];      // Tags selecionadas
  onTagsChange: (tags: string[]) => void;  // Callback de mudança
  maxTags?: number;             // Limite máximo (padrão: 5)
  placeholder?: string;         // Placeholder do input
}
```

### TAG_CATEGORIES Data Structure
```typescript
interface TagCategory {
  name: string;        // ID da categoria
  label: string;       // Nome exibido
  color: string;       // Cor Tailwind
  tags: string[];      // Lista de tags
}
```

## ✅ Checklist de Funcionalidades

- ✅ 14 categorias cobrindo todas as áreas da vida
- ✅ 140+ tags pré-cadastradas
- ✅ Busca em tempo real (tag + categoria)
- ✅ Autocomplete com navegação por teclado
- ✅ Cores únicas por categoria
- ✅ Dark mode completo
- ✅ Light mode otimizado
- ✅ Sugestões visuais ricas
- ✅ Limite de 5 tags
- ✅ Mapeamento automático para tipos de votação
- ✅ Remoção fácil de tags
- ✅ Feedback visual claro
- ✅ Acessibilidade WCAG AA

## 🚀 Próximos Passos (Opcional)

1. **Backend Integration**: Salvar tags no blockchain ou backend
2. **Analytics**: Rastrear tags mais usadas
3. **Sugestões Inteligentes**: Baseadas em título/descrição
4. **Tags Customizadas**: Permitir criação de tags únicas
5. **Tradução**: Suporte multi-idioma para tags
6. **Hierarquia**: Sub-categorias dentro de categorias

## 📊 Estatísticas

- **Total de categorias**: 14
- **Total de tags**: ~140 (10 por categoria)
- **Tags mapeadas para votação**: 100+
- **Cores únicas**: 14
- **Linhas de código**: ~600 (TagAutocomplete.tsx)

---

**Desenvolvido para**: Revolução Cibernética  
**Última atualização**: 2024  
**Padrões seguidos**: WCAG AA, Tailwind CSS v3, React Best Practices
