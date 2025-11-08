'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Tag as TagIcon, Search } from 'lucide-react';

export interface TagCategory {
  name: string;
  label: string;
  color: string;
  tags: string[];
}

// Categorias expandidas para todas as áreas da vida humana
export const TAG_CATEGORIES: TagCategory[] = [
  {
    name: 'educacao',
    label: 'Educação',
    color: 'blue',
    tags: [
      'educação básica',
      'ensino superior',
      'formação profissional',
      'educação infantil',
      'alfabetização',
      'educação digital',
      'pesquisa acadêmica',
      'bolsas de estudo',
      'educação especial',
      'educação a distância'
    ]
  },
  {
    name: 'saude',
    label: 'Saúde',
    color: 'red',
    tags: [
      'saúde pública',
      'hospitais',
      'medicamentos',
      'prevenção',
      'saúde mental',
      'vacinas',
      'atendimento básico',
      'emergência médica',
      'nutrição',
      'saneamento'
    ]
  },
  {
    name: 'economia',
    label: 'Economia',
    color: 'green',
    tags: [
      'orçamento',
      'financiamento',
      'investimento',
      'desenvolvimento econômico',
      'empreendedorismo',
      'microcrédito',
      'comércio',
      'tributação',
      'renda básica',
      'economia solidária'
    ]
  },
  {
    name: 'tecnologia',
    label: 'Tecnologia',
    color: 'purple',
    tags: [
      'tecnologia',
      'inovação',
      'infraestrutura digital',
      'internet',
      'telecomunicações',
      'criptografia',
      'blockchain',
      'inteligência artificial',
      'segurança digital',
      'código aberto'
    ]
  },
  {
    name: 'meio-ambiente',
    label: 'Meio Ambiente',
    color: 'emerald',
    tags: [
      'meio ambiente',
      'biodiversidade',
      'clima',
      'energia renovável',
      'preservação',
      'desmatamento',
      'poluição',
      'reciclagem',
      'água',
      'sustentabilidade'
    ]
  },
  {
    name: 'cultura',
    label: 'Cultura',
    color: 'pink',
    tags: [
      'cultura',
      'arte',
      'patrimônio histórico',
      'música',
      'cinema',
      'teatro',
      'literatura',
      'museus',
      'festivais',
      'artesanato'
    ]
  },
  {
    name: 'infraestrutura',
    label: 'Infraestrutura',
    color: 'orange',
    tags: [
      'infraestrutura',
      'transporte público',
      'mobilidade urbana',
      'rodovias',
      'portos',
      'aeroportos',
      'obras públicas',
      'urbanismo',
      'habitação',
      'energia'
    ]
  },
  {
    name: 'direitos',
    label: 'Direitos e Ética',
    color: 'amber',
    tags: [
      'direitos humanos',
      'ético',
      'fundamental',
      'constitucional',
      'dignidade',
      'igualdade',
      'liberdade',
      'justiça social',
      'acessibilidade',
      'inclusão'
    ]
  },
  {
    name: 'seguranca',
    label: 'Segurança',
    color: 'slate',
    tags: [
      'segurança pública',
      'defesa civil',
      'prevenção de desastres',
      'policiamento',
      'segurança',
      'emergências',
      'vigilância',
      'crime',
      'justiça',
      'proteção'
    ]
  },
  {
    name: 'social',
    label: 'Social',
    color: 'cyan',
    tags: [
      'assistência social',
      'vulnerabilidade',
      'comunidade',
      'família',
      'criança e adolescente',
      'idosos',
      'trabalho',
      'emprego',
      'moradia',
      'alimentação'
    ]
  },
  {
    name: 'ciencia',
    label: 'Ciência e Pesquisa',
    color: 'indigo',
    tags: [
      'ciência',
      'pesquisa científica',
      'laboratórios',
      'inovação científica',
      'medicina',
      'biologia',
      'física',
      'química',
      'astronomia',
      'tecnologia científica'
    ]
  },
  {
    name: 'esporte',
    label: 'Esporte e Lazer',
    color: 'teal',
    tags: [
      'esporte',
      'lazer',
      'recreação',
      'esporte amador',
      'esporte profissional',
      'olimpíadas',
      'infraestrutura esportiva',
      'atividade física',
      'parques',
      'turismo'
    ]
  },
  {
    name: 'comunicacao',
    label: 'Comunicação',
    color: 'violet',
    tags: [
      'comunicação',
      'mídia',
      'jornalismo',
      'transparência',
      'informação pública',
      'dados abertos',
      'liberdade de expressão',
      'redes sociais',
      'radiodifusão',
      'imprensa'
    ]
  },
  {
    name: 'administrativo',
    label: 'Administrativo',
    color: 'gray',
    tags: [
      'administrativo',
      'procedural',
      'operacional',
      'gestão pública',
      'burocracia',
      'processos',
      'documentação',
      'contratos',
      'licitações',
      'recursos humanos'
    ]
  }
];

// Flatten all tags for easy searching
const ALL_TAGS = TAG_CATEGORIES.flatMap(category => 
  category.tags.map(tag => ({
    tag,
    category: category.name,
    categoryLabel: category.label,
    color: category.color
  }))
);

interface TagAutocompleteProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
}

export function TagAutocomplete({ 
  selectedTags, 
  onTagsChange, 
  maxTags = 5,
  placeholder = 'Buscar tags...'
}: TagAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(ALL_TAGS);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredSuggestions(ALL_TAGS);
    } else {
      const searchTerm = inputValue.toLowerCase();
      const filtered = ALL_TAGS.filter(({ tag, categoryLabel }) => {
        // Don't show already selected tags
        if (selectedTags.includes(tag)) return false;
        
        // Match tag or category
        return tag.toLowerCase().includes(searchTerm) || 
               categoryLabel.toLowerCase().includes(searchTerm);
      });
      setFilteredSuggestions(filtered);
    }
    setHighlightedIndex(0);
  }, [inputValue, selectedTags]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag) && selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag]);
      setInputValue('');
      setIsOpen(false);
      inputRef.current?.focus();
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions.length > 0 && highlightedIndex >= 0) {
        addTag(filteredSuggestions[highlightedIndex].tag);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        Math.min(prev + 1, filteredSuggestions.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
      // Remove last tag on backspace when input is empty
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  // Get color classes for category
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-200',
        border: 'border-blue-300 dark:border-blue-700',
        hover: 'hover:bg-blue-200 dark:hover:bg-blue-900/50'
      },
      red: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-200',
        border: 'border-red-300 dark:border-red-700',
        hover: 'hover:bg-red-200 dark:hover:bg-red-900/50'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-200',
        border: 'border-green-300 dark:border-green-700',
        hover: 'hover:bg-green-200 dark:hover:bg-green-900/50'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-800 dark:text-purple-200',
        border: 'border-purple-300 dark:border-purple-700',
        hover: 'hover:bg-purple-200 dark:hover:bg-purple-900/50'
      },
      emerald: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-800 dark:text-emerald-200',
        border: 'border-emerald-300 dark:border-emerald-700',
        hover: 'hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
      },
      pink: {
        bg: 'bg-pink-100 dark:bg-pink-900/30',
        text: 'text-pink-800 dark:text-pink-200',
        border: 'border-pink-300 dark:border-pink-700',
        hover: 'hover:bg-pink-200 dark:hover:bg-pink-900/50'
      },
      orange: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-800 dark:text-orange-200',
        border: 'border-orange-300 dark:border-orange-700',
        hover: 'hover:bg-orange-200 dark:hover:bg-orange-900/50'
      },
      amber: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-800 dark:text-amber-200',
        border: 'border-amber-300 dark:border-amber-700',
        hover: 'hover:bg-amber-200 dark:hover:bg-amber-900/50'
      },
      slate: {
        bg: 'bg-slate-100 dark:bg-slate-900/30',
        text: 'text-slate-800 dark:text-slate-200',
        border: 'border-slate-300 dark:border-slate-700',
        hover: 'hover:bg-slate-200 dark:hover:bg-slate-900/50'
      },
      cyan: {
        bg: 'bg-cyan-100 dark:bg-cyan-900/30',
        text: 'text-cyan-800 dark:text-cyan-200',
        border: 'border-cyan-300 dark:border-cyan-700',
        hover: 'hover:bg-cyan-200 dark:hover:bg-cyan-900/50'
      },
      indigo: {
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        text: 'text-indigo-800 dark:text-indigo-200',
        border: 'border-indigo-300 dark:border-indigo-700',
        hover: 'hover:bg-indigo-200 dark:hover:bg-indigo-900/50'
      },
      teal: {
        bg: 'bg-teal-100 dark:bg-teal-900/30',
        text: 'text-teal-800 dark:text-teal-200',
        border: 'border-teal-300 dark:border-teal-700',
        hover: 'hover:bg-teal-200 dark:hover:bg-teal-900/50'
      },
      violet: {
        bg: 'bg-violet-100 dark:bg-violet-900/30',
        text: 'text-violet-800 dark:text-violet-200',
        border: 'border-violet-300 dark:border-violet-700',
        hover: 'hover:bg-violet-200 dark:hover:bg-violet-900/50'
      },
      gray: {
        bg: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-800 dark:text-gray-200',
        border: 'border-gray-300 dark:border-gray-700',
        hover: 'hover:bg-gray-200 dark:hover:bg-gray-900/50'
      }
    };
    return colorMap[color] || colorMap.gray;
  };

  // Get color for a specific tag
  const getTagColor = (tagName: string) => {
    const tagInfo = ALL_TAGS.find(t => t.tag === tagName);
    return tagInfo ? tagInfo.color : 'gray';
  };

  return (
    <div className="relative">
      {/* Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length >= maxTags ? `Máximo de ${maxTags} tags` : placeholder}
          disabled={selectedTags.length >= maxTags}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && filteredSuggestions.length > 0 && selectedTags.length < maxTags && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg"
        >
          {filteredSuggestions.map((suggestion, index) => {
            const colors = getColorClasses(suggestion.color);
            return (
              <button
                key={`${suggestion.category}-${suggestion.tag}`}
                type="button"
                onClick={() => addTag(suggestion.tag)}
                className={`w-full px-4 py-2 text-left flex items-center justify-between gap-2 transition-colors ${
                  index === highlightedIndex
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {suggestion.tag}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {suggestion.categoryLabel}
                  </div>
                </div>
                <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                  <TagIcon className="h-3 w-3 inline mr-1" />
                  {suggestion.categoryLabel}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedTags.map((tag) => {
            const color = getTagColor(tag);
            const colors = getColorClasses(color);
            return (
              <span
                key={tag}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
              >
                <TagIcon className="h-3 w-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className={`ml-1 ${colors.hover} rounded-full p-0.5 transition-colors`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {selectedTags.length}/{maxTags} tags selecionadas. Use ↑↓ para navegar, Enter para selecionar, Backspace para remover.
      </p>
    </div>
  );
}
