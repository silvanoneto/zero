'use client';

import { useState, useEffect } from 'react';

/**
 * Hook para usar localStorage de forma segura (client-side only)
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isClient, setIsClient] = useState(false);

  // Detecta se está no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Carrega o valor do localStorage quando o componente monta
  useEffect(() => {
    if (!isClient) return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
    }
  }, [key, isClient]);

  // Função para salvar no localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permite passar uma função como no useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (isClient) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isClient] as const;
}

/**
 * Storage adapter para propostas - substitui IPFS e Subgraph
 */
export interface StoredProposal {
  id: number;
  title: string;
  description: string;
  ipfsHash: string;
  proposer: string;
  voteType: string;
  startTime: number;
  endTime: number;
  votesFor: string; // BigInt como string
  votesAgainst: string; // BigInt como string
  totalVoters: number;
  state: 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXPIRED';
  tags?: {
    isProcedural?: boolean;
    isResourceAllocation?: boolean;
    isTechnical?: boolean;
    isEthical?: boolean;
    budgetImpact?: string;
    requiresExpertise?: boolean;
  };
}

const PROPOSALS_KEY = 'revolucao_cibernetica_proposals';
const PROPOSAL_COUNTER_KEY = 'revolucao_cibernetica_proposal_counter';

export class LocalStorageAdapter {
  /**
   * Salva uma proposta no localStorage
   */
  static saveProposal(proposal: Omit<StoredProposal, 'id'>): StoredProposal {
    if (typeof window === 'undefined') {
      throw new Error('localStorage is not available on server side');
    }

    // Pega o contador atual
    const counter = this.getCounter();
    const newId = counter + 1;

    const newProposal: StoredProposal = {
      ...proposal,
      id: newId,
    };

    // Salva a proposta
    const proposals = this.getProposals();
    proposals.push(newProposal);
    window.localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));

    // Incrementa o contador
    window.localStorage.setItem(PROPOSAL_COUNTER_KEY, JSON.stringify(newId));

    return newProposal;
  }

  /**
   * Busca todas as propostas
   */
  static getProposals(): StoredProposal[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const data = window.localStorage.getItem(PROPOSALS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading proposals from localStorage:', error);
      return [];
    }
  }

  /**
   * Busca uma proposta por ID
   */
  static getProposal(id: number): StoredProposal | null {
    const proposals = this.getProposals();
    return proposals.find(p => p.id === id) || null;
  }

  /**
   * Atualiza uma proposta existente
   */
  static updateProposal(id: number, updates: Partial<StoredProposal>): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const proposals = this.getProposals();
    const index = proposals.findIndex(p => p.id === id);

    if (index === -1) {
      return false;
    }

    proposals[index] = { ...proposals[index], ...updates };
    window.localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
    return true;
  }

  /**
   * Adiciona um voto a uma proposta
   */
  static addVote(proposalId: number, support: boolean, weight: bigint): boolean {
    const proposal = this.getProposal(proposalId);
    if (!proposal) return false;

    const currentFor = BigInt(proposal.votesFor);
    const currentAgainst = BigInt(proposal.votesAgainst);

    const updates: Partial<StoredProposal> = {
      votesFor: support ? (currentFor + weight).toString() : currentFor.toString(),
      votesAgainst: !support ? (currentAgainst + weight).toString() : currentAgainst.toString(),
      totalVoters: proposal.totalVoters + 1,
    };

    return this.updateProposal(proposalId, updates);
  }

  /**
   * Busca o contador de propostas
   */
  private static getCounter(): number {
    if (typeof window === 'undefined') {
      return 0;
    }

    try {
      const data = window.localStorage.getItem(PROPOSAL_COUNTER_KEY);
      return data ? JSON.parse(data) : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Limpa todas as propostas (útil para testes)
   */
  static clearAll(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(PROPOSALS_KEY);
    window.localStorage.removeItem(PROPOSAL_COUNTER_KEY);
  }

  /**
   * Inicializa com propostas de exemplo (modo demo)
   */
  static initializeDemoData(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const existing = this.getProposals();
    if (existing.length > 0) {
      return; // Já tem dados
    }

    const now = Date.now();
    const demoProposals: Omit<StoredProposal, 'id'>[] = [
      {
        title: 'Implementar Sistema de Reputação Descentralizada',
        description: 'Proposta para criar um sistema de reputação baseado em contribuições à comunidade, usando tokens de atenção e validação por pares.',
        ipfsHash: 'QmDemo1234567890abcdef',
        proposer: '0x1234567890123456789012345678901234567890',
        voteType: 'QUADRATIC',
        startTime: now - 2 * 24 * 60 * 60 * 1000, // 2 dias atrás
        endTime: now + 5 * 24 * 60 * 60 * 1000, // 5 dias no futuro
        votesFor: '15000',
        votesAgainst: '3000',
        totalVoters: 42,
        state: 'ACTIVE',
        tags: {
          isTechnical: true,
          requiresExpertise: true,
        },
      },
      {
        title: 'Alocar Recursos para Educação Digital',
        description: 'Proposta para destinar 20% do orçamento para programas de educação digital e alfabetização tecnológica nas comunidades.',
        ipfsHash: 'QmDemo2345678901bcdefg',
        proposer: '0x2345678901234567890123456789012345678901',
        voteType: 'LINEAR',
        startTime: now - 1 * 24 * 60 * 60 * 1000,
        endTime: now + 6 * 24 * 60 * 60 * 1000,
        votesFor: '25000',
        votesAgainst: '5000',
        totalVoters: 78,
        state: 'ACTIVE',
        tags: {
          isResourceAllocation: true,
          budgetImpact: '100000',
        },
      },
      {
        title: 'Estabelecer Código de Ética para IA',
        description: 'Proposta para criar e adotar um código de ética para desenvolvimento e uso de inteligência artificial na comunidade.',
        ipfsHash: 'QmDemo3456789012cdefgh',
        proposer: '0x3456789012345678901234567890123456789012',
        voteType: 'CONSENSUS',
        startTime: now - 3 * 24 * 60 * 60 * 1000,
        endTime: now + 4 * 24 * 60 * 60 * 1000,
        votesFor: '18000',
        votesAgainst: '2000',
        totalVoters: 56,
        state: 'ACTIVE',
        tags: {
          isEthical: true,
        },
      },
    ];

    demoProposals.forEach(proposal => {
      this.saveProposal(proposal);
    });
  }
}
