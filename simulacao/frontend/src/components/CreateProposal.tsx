'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Send, Loader2, CheckCircle, AlertCircle, Network } from 'lucide-react';
import { useCreateProposal } from '../hooks/useCreateProposal';
import { useP2P } from '../hooks/useP2P';
import { TagAutocomplete } from './TagAutocomplete';

// Mapeamento expandido de tags para tipos de votação (Art. 3º-A da Constituição)
const TAG_TO_VOTE_TYPE: Record<string, 'LINEAR' | 'QUADRATIC' | 'LOGARITHMIC' | 'CONSENSUS'> = {
  // Tags administrativas/procedimentais -> LINEAR
  'administrativo': 'LINEAR',
  'procedural': 'LINEAR',
  'operacional': 'LINEAR',
  'gestão pública': 'LINEAR',
  'burocracia': 'LINEAR',
  'processos': 'LINEAR',
  'documentação': 'LINEAR',
  'contratos': 'LINEAR',
  'licitações': 'LINEAR',
  'recursos humanos': 'LINEAR',
  
  // Tags de alocação de recursos -> QUADRATIC
  'orçamento': 'QUADRATIC',
  'recurso': 'QUADRATIC',
  'financiamento': 'QUADRATIC',
  'investimento': 'QUADRATIC',
  'desenvolvimento econômico': 'QUADRATIC',
  'empreendedorismo': 'QUADRATIC',
  'microcrédito': 'QUADRATIC',
  'comércio': 'QUADRATIC',
  'tributação': 'QUADRATIC',
  'renda básica': 'QUADRATIC',
  'economia solidária': 'QUADRATIC',
  'bolsas de estudo': 'QUADRATIC',
  'assistência social': 'QUADRATIC',
  'alimentação': 'QUADRATIC',
  
  // Tags técnicas -> LOGARITHMIC
  'técnico': 'LOGARITHMIC',
  'tecnologia': 'LOGARITHMIC',
  'infraestrutura': 'LOGARITHMIC',
  'segurança': 'LOGARITHMIC',
  'saúde': 'LOGARITHMIC',
  'energia': 'LOGARITHMIC',
  'criptografia': 'LOGARITHMIC',
  'biodiversidade': 'LOGARITHMIC',
  'inovação': 'LOGARITHMIC',
  'infraestrutura digital': 'LOGARITHMIC',
  'internet': 'LOGARITHMIC',
  'telecomunicações': 'LOGARITHMIC',
  'blockchain': 'LOGARITHMIC',
  'inteligência artificial': 'LOGARITHMIC',
  'segurança digital': 'LOGARITHMIC',
  'código aberto': 'LOGARITHMIC',
  'saúde pública': 'LOGARITHMIC',
  'hospitais': 'LOGARITHMIC',
  'medicamentos': 'LOGARITHMIC',
  'prevenção': 'LOGARITHMIC',
  'vacinas': 'LOGARITHMIC',
  'saneamento': 'LOGARITHMIC',
  'transporte público': 'LOGARITHMIC',
  'mobilidade urbana': 'LOGARITHMIC',
  'rodovias': 'LOGARITHMIC',
  'portos': 'LOGARITHMIC',
  'aeroportos': 'LOGARITHMIC',
  'obras públicas': 'LOGARITHMIC',
  'urbanismo': 'LOGARITHMIC',
  'habitação': 'LOGARITHMIC',
  'energia renovável': 'LOGARITHMIC',
  'clima': 'LOGARITHMIC',
  'meio ambiente': 'LOGARITHMIC',
  'preservação': 'LOGARITHMIC',
  'água': 'LOGARITHMIC',
  'sustentabilidade': 'LOGARITHMIC',
  'educação digital': 'LOGARITHMIC',
  'pesquisa acadêmica': 'LOGARITHMIC',
  'ciência': 'LOGARITHMIC',
  'pesquisa científica': 'LOGARITHMIC',
  'laboratórios': 'LOGARITHMIC',
  'inovação científica': 'LOGARITHMIC',
  'medicina': 'LOGARITHMIC',
  
  // Tags éticas/fundamentais -> CONSENSUS
  'ético': 'CONSENSUS',
  'direitos': 'CONSENSUS',
  'fundamental': 'CONSENSUS',
  'constitucional': 'CONSENSUS',
  'dignidade': 'CONSENSUS',
  'direitos humanos': 'CONSENSUS',
  'igualdade': 'CONSENSUS',
  'liberdade': 'CONSENSUS',
  'justiça social': 'CONSENSUS',
  'acessibilidade': 'CONSENSUS',
  'inclusão': 'CONSENSUS',
  'liberdade de expressão': 'CONSENSUS',
  'transparência': 'CONSENSUS',
  'educação básica': 'CONSENSUS',
  'alfabetização': 'CONSENSUS',
  'educação especial': 'CONSENSUS',
};

export function CreateProposal() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [voteType, setVoteType] = useState<'LINEAR' | 'QUADRATIC' | 'LOGARITHMIC' | 'CONSENSUS'>('LINEAR');
  const [autoVoteType, setAutoVoteType] = useState(true); // Modo automático ativado por padrão
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { 
    createProposal, 
    isPending, 
    isConfirming, 
    isSuccess, 
    error,
    hash 
  } = useCreateProposal();

  // Integração P2P
  const { 
    isConnected: p2pConnected, 
    publishProposal,
    stats 
  } = useP2P({ autoConnect: true });

  const isSubmitting = isPending || isConfirming;

  // Detecta automaticamente o tipo de votação baseado em tags
  useEffect(() => {
    if (!autoVoteType || tags.length === 0) return;
    
    // Procura por correspondências de tags no mapeamento
    for (const tag of tags) {
      const normalizedTag = tag.toLowerCase().trim();
      if (TAG_TO_VOTE_TYPE[normalizedTag]) {
        setVoteType(TAG_TO_VOTE_TYPE[normalizedTag]);
        return; // Usa a primeira correspondência encontrada
      }
    }
    
    // Se nenhuma tag especial, usa LINEAR como padrão
    setVoteType('LINEAR');
  }, [tags, autoVoteType]);

  // Monitora sucesso da transação e publica no P2P
  useEffect(() => {
    if (isSuccess && hash) {
      setShowSuccess(true);
      
      // Publica proposta na rede P2P
      if (p2pConnected) {
        const proposalData = {
          hash,
          title,
          description,
          voteType,
          tags,
          chainId,
          timestamp: Date.now(),
          creator: address
        };
        
        publishProposal(proposalData)
          .then((success) => {
            if (success) {
              console.log('✅ Proposta publicada na rede P2P');
            } else {
              console.warn('⚠️ Falha ao publicar proposta no P2P');
            }
          })
          .catch((err) => {
            console.error('❌ Erro ao publicar proposta no P2P:', err);
          });
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      setTags([]);
      setVoteType('LINEAR');
      setAutoVoteType(true);
      
      // Esconde mensagem após 5 segundos
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [isSuccess, hash, p2pConnected, publishProposal, title, description, voteType, tags, chainId, address]);

  // Monitora erros
  useEffect(() => {
    if (error) {
      setShowError(true);
      setErrorMessage(error.message || 'Erro desconhecido');
      setTimeout(() => setShowError(false), 5000);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isConnected) {
      setErrorMessage('Por favor, conecte sua carteira primeiro');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    try {
      await createProposal(title, description, voteType, chainId);
    } catch (err) {
      console.error('Erro ao criar proposta:', err);
      setErrorMessage('Erro ao enviar transação');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* P2P Status Indicator */}
      {p2pConnected && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
          <Network className="w-4 h-4 text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-green-800 dark:text-green-200">
              Rede P2P Conectada
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              {stats.peers} peers conectados • Proposta será propagada automaticamente
            </p>
          </div>
        </div>
      )}

      {/* Title Input */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Título da Proposta
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Alocar recursos para..."
          required
          maxLength={100}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {title.length}/100 caracteres
        </p>
      </div>

      {/* Description Input */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descrição
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva sua proposta em detalhes..."
          required
          maxLength={500}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {description.length}/500 caracteres
        </p>
      </div>

      {/* Tags Input */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags (influenciam tipo de votação)
        </label>
        <TagAutocomplete
          selectedTags={tags}
          onTagsChange={setTags}
          maxTags={5}
          placeholder="Buscar tags por categoria (ex: educação, saúde, tecnologia)..."
        />
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          💡 Dica: Tags influenciam o tipo de votação automaticamente. Use categorias como educação, saúde, economia, tecnologia, etc.
        </p>
      </div>

      {/* Vote Type Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tipo de Votação
          </label>
          <button
            type="button"
            onClick={() => setAutoVoteType(!autoVoteType)}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              autoVoteType
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            {autoVoteType ? '🤖 Automático' : '✋ Manual'}
          </button>
        </div>
        
        {autoVoteType && tags.length > 0 && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              💡 Tipo selecionado automaticamente baseado nas tags: <strong>{voteType}</strong>
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setAutoVoteType(false);
              setVoteType('LINEAR');
            }}
            disabled={autoVoteType}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              voteType === 'LINEAR'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            } ${autoVoteType ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Linear
          </button>
          <button
            type="button"
            onClick={() => {
              setAutoVoteType(false);
              setVoteType('QUADRATIC');
            }}
            disabled={autoVoteType}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              voteType === 'QUADRATIC'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            } ${autoVoteType ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Quadrática
          </button>
          <button
            type="button"
            onClick={() => {
              setAutoVoteType(false);
              setVoteType('LOGARITHMIC');
            }}
            disabled={autoVoteType}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              voteType === 'LOGARITHMIC'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            } ${autoVoteType ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Logarítmica
          </button>
          <button
            type="button"
            onClick={() => {
              setAutoVoteType(false);
              setVoteType('CONSENSUS');
            }}
            disabled={autoVoteType}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              voteType === 'CONSENSUS'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            } ${autoVoteType ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Consenso
          </button>
        </div>
      </div>

      {/* Vote Type Description */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {voteType === 'LINEAR' && '1 token = 1 voto. Votação simples e direta.'}
          {voteType === 'QUADRATIC' && 'Custo quadrático: previne dominação por grandes holders.'}
          {voteType === 'LOGARITHMIC' && 'Reduz peso de grandes holders, favorece participação ampla.'}
          {voteType === 'CONSENSUS' && 'Requer aprovação por múltiplas federações.'}
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isConnected || isSubmitting || !title || !description}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isConfirming ? 'Confirmando...' : 'Enviando...'}
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Criar Proposta
          </>
        )}
      </button>

      {/* Success Message */}
      {showSuccess && hash && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
              Proposta criada com sucesso!
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 font-mono break-all mb-2">
              TX: {hash.substring(0, 10)}...{hash.substring(hash.length - 8)}
            </p>
            {p2pConnected && (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Network className="w-3 h-3" />
                <span>Propagada para {stats.peers} peers na rede P2P</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
              Erro ao criar proposta
            </p>
            <p className="text-xs text-red-700 dark:text-red-300">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      {!isConnected && (
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Conecte sua carteira para criar propostas
        </p>
      )}
    </form>
  );
}
