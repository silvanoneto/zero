# BIP-0001: Implementação do Sistema de Tokens de Atenção

**Status:** Draft  
**Tipo:** Core/Feature  
**Autor(es):** @revolucao-cibernetica  
**Criado:** 2025-01-02  
**Votação:** Linear (procedimento)  
**Tags:** `governance`, `attention-economy`, `biomimetic`

---

## 📋 Resumo Executivo

Implementar o sistema de **Tokens de Atenção** conforme Art. 6º-D da Cybersyn 2.0, inspirado no sistema imunológico humano que usa inflamação para sinalizar urgências.

Cada cidadão recebe **100 tokens/mês** para priorizar propostas. Tokens não utilizados **não acumulam** (como citocinas que degradam).

---

## 🎯 Problema

### Estado Atual
- **Sobrecarga informacional**: 500+ BIPs ativas simultaneamente
- **Ruído democrático**: Propostas importantes perdidas em spam
- **Fadiga de votação**: Taxa de participação <15% em questões não-polêmicas
- **Ausência de priorização**: Todas propostas tratadas igualmente

### Impacto Mensurável
- **Latência decisória**: 45+ dias para aprovar BIPs urgentes
- **Baixo engajamento**: Média de 8% de participação em votações técnicas
- **Recursos desperdiçados**: 30% das BIPs são duplicatas/redundantes

---

## 💡 Solução

### Mecânica dos Tokens de Atenção

#### 1. **Distribuição Mensal**
```solidity
// Smart contract pseudo-código
function monthlyAllocation() {
    for (address citizen : allCitizens) {
        attentionTokens[citizen] = 100;
        expirationDate[citizen] = block.timestamp + 30 days;
    }
}
```

- **100 tokens/mês** por cidadão com IDS ativo
- Distribuição automática no dia 1 de cada mês
- Tokens expiram após 30 dias (não acumulam)

#### 2. **Alocação de Tokens**
```solidity
function allocateAttention(uint256 bipId, uint256 tokens) {
    require(tokens <= attentionBalance[msg.sender], "Insufficient tokens");
    require(tokens >= 1 && tokens <= 50, "Invalid range");
    
    attentionBalance[msg.sender] -= tokens;
    bipAttentionScore[bipId] += tokens;
    
    emit AttentionAllocated(msg.sender, bipId, tokens);
}
```

- Mínimo: **1 token** por BIP
- Máximo: **50 tokens** em uma única BIP (evita concentração)
- Tokens podem ser redistribuídos antes da expiração

#### 3. **Priorização Automática**
```python
def rank_bips(bips):
    return sorted(bips, key=lambda b: (
        b.attention_score * 0.5 +    # 50% tokens alocados
        b.unique_voters * 0.3 +      # 30% diversidade
        b.time_decay * 0.2           # 20% urgência temporal
    ), reverse=True)
```

- **Dashboard público**: Top 20 BIPs com mais atenção
- **Fila fast-track**: >5000 tokens = votação acelerada (7 dias)
- **Filtro anti-spam**: <100 tokens em 48h = BIP movida para draft

---

## 📊 Métricas de Sucesso

### Indicadores Primários

| Métrica | Baseline Atual | Meta (6 meses) | Medição |
|---------|----------------|----------------|---------|
| **Taxa de Participação** | 12% | 35%+ | % cidadãos alocando tokens/mês |
| **Latência Decisória** | 45 dias | <14 dias | Tempo médio draft→executado |
| **Qualidade de BIPs** | 6.2/10 | 8.0/10 | Peer review score |
| **Engajamento Distribuído** | Gini 0.68 | Gini <0.45 | Concentração de tokens |

### Indicadores Secundários
- **Redução de spam**: -60% de BIPs duplicadas
- **Diversidade de tópicos**: +40% em categorias sub-representadas
- **Satisfação do usuário**: Net Promoter Score >50

---

## 💰 Análise de Custo-Benefício

### Custos de Implementação

| Item | Custo | Tempo |
|------|-------|-------|
| **Smart Contract** | 50 ETH (~$150k) | 3 meses |
| **Frontend Dashboard** | 30 ETH (~$90k) | 2 meses |
| **Auditorias** | 20 ETH (~$60k) | 1 mês |
| **Educação/Onboarding** | 15 ETH (~$45k) | 2 meses |
| **TOTAL** | **115 ETH (~$345k)** | **4 meses** |

### Retorno Esperado
- **Eficiência governamental**: +120% (menos tempo em propostas irrelevantes)
- **Economia de recursos**: -40% em custos de moderação
- **Valor intangível**: Legitimidade democrática aumentada

**ROI estimado**: 300% em 18 meses (considerando economia de tempo/recursos)

---

## 🗓️ Roadmap de Implementação

### Fase 1: Fundação (Mês 1-2)
- [ ] **Semana 1-2**: Design detalhado do smart contract
- [ ] **Semana 3-6**: Desenvolvimento e testes em testnet
- [ ] **Semana 7-8**: Auditoria de segurança (Trail of Bits ou equivalente)

### Fase 2: Interface (Mês 2-3)
- [ ] **Semana 9-10**: Wireframes do dashboard de atenção
- [ ] **Semana 11-14**: Desenvolvimento frontend (React + Web3)
- [ ] **Semana 15-16**: Integração com IDS e wallet

### Fase 3: Piloto (Mês 4)
- [ ] **Semana 17-18**: Deploy em ZEC experimental (Art. 9º-G)
- [ ] **Semana 19-20**: Onboarding de 1000 early adopters
- [ ] **Semana 21-22**: Coleta de feedback e iteração
- [ ] **Semana 23-24**: Ajustes baseados em dados reais

### Fase 4: Lançamento (Mês 5+)
- [ ] **Semana 25**: Deploy na mainnet nacional
- [ ] **Semana 26-28**: Campanha de educação massiva
- [ ] **Semana 29+**: Monitoramento contínuo e otimização

---

## 🧪 Plano de Testes

### Testes Unitários (Smart Contract)
```javascript
describe("AttentionTokens", () => {
    it("should allocate 100 tokens monthly", async () => {
        await contract.triggerMonthlyAllocation();
        expect(await contract.balanceOf(citizen1)).to.equal(100);
    });
    
    it("should prevent allocation above 50 tokens", async () => {
        await expect(
            contract.allocateAttention(bip1, 51)
        ).to.be.revertedWith("Invalid range");
    });
    
    it("should expire tokens after 30 days", async () => {
        await time.increase(31 * 86400);
        expect(await contract.balanceOf(citizen1)).to.equal(0);
    });
});
```

### Testes de Integração
- Fluxo completo: Receber tokens → Alocar → Ver impacto em ranking
- Stress test: 10k cidadãos alocando simultaneamente
- Ataque Sybil: Detecção de múltiplas contas

### Testes de Usabilidade
- **5 sessões** com usuários não-técnicos
- Métrica: >80% conseguem alocar tokens em <3 min

---

## 🔒 Considerações de Segurança

### Vetores de Ataque

| Ataque | Mitigação |
|--------|-----------|
| **Sybil (múltiplas contas)** | IDS requer biometria + PoH (Proof of Humanity) |
| **Bot spamming** | Rate limit: 1 alocação/10 segundos |
| **Front-running** | Commit-reveal scheme para alocações grandes |
| **Whale manipulation** | Cap de 50 tokens/BIP |

### Auditorias Requeridas
- [ ] Trail of Bits (smart contract)
- [ ] ConsenSys Diligence (blockchain architecture)
- [ ] Peer review aberto (GitHub)

---

## 🌍 Impacto Social

### Princípios Biomimético-Cibernéticos

**Inspiração biológica**: Sistema imunológico humano
- **Citocinas** = Tokens de atenção
- **Inflamação** = Priorização de ameaças
- **Regulação** = Expiração temporal (evita inflamação crônica)

### Benefícios Esperados
1. **Democracia líquida real**: Atenção como moeda escassa
2. **Redução de polarização**: Incentivo a consenso (não zero-sum)
3. **Empoderamento cidadão**: Cada pessoa controla agenda
4. **Transparência radical**: Todos veem onde a atenção flui

---

## 📚 Referências

1. **Art. 6º-D** — Constituição Viva 2.0 (Tokens de Atenção)
2. **Harberger Taxes** — Weyl & Posner (2018), "Radical Markets"
3. **Attention Economy** — Davenport & Beck (2001)
4. **Immune Signaling** — Abbas et al. (2020), "Cellular and Molecular Immunology"
5. **Quadratic Funding** — Buterin et al. (2019)

---

## 💬 FAQ

**P: Posso vender meus tokens de atenção?**  
R: Não. Tokens são **soulbound** (não-transferíveis). Não podem virar commodity.

**P: O que acontece se eu não usar meus tokens?**  
R: Expiram após 30 dias. Isso incentiva participação ativa.

**P: Posso mudar minha alocação depois?**  
R: Sim, até a BIP entrar em votação formal. Depois é irreversível.

**P: Como evitar manipulação por grupos organizados?**  
R: Cap de 50 tokens/BIP + IDS biométrico + análise de clusters suspeitos.

---

## ✅ Aprovação

Esta BIP requer:
- [ ] **Votação linear** (procedimento simples)
- [ ] **Quórum**: 20% dos cidadãos ativos
- [ ] **Maioria**: >50% de aprovação
- [ ] **Duração**: 14 dias de votação

**Para aprovar esta BIP, vote usando:**
```bash
$ bip vote --id 0001 --support yes --tokens 10
```

---

## 📝 Changelog

- **v1.0** (2025-01-02): Versão inicial
- **v1.1** (TBD): Após feedback da comunidade

---

## 🐙 Como Contribuir

1. Fork o repositório: `github.com/revolucao-cibernetica`
2. Crie branch: `git checkout -b bip-0001-feedback`
3. Comentários inline no markdown
4. Pull request com sugestões

---

<div align="center">

**🌿 Inspirado na natureza, executado em código 🌿**

*"A atenção é o recurso mais escasso do século XXI. Governemos como se isso importasse."*

— Constituição Viva 2.0, Art. 6º-D

</div>

---

## 📎 Anexos

### A. Protótipo do Dashboard
![Mockup](./assets/mockups/attention-dashboard.png)

### B. Análise de Gás (Gas Costs)
- Alocação de tokens: ~45k gas (~$2.70 @ 60 gwei)
- Redistribuição: ~60k gas (~$3.60)
- Reivindicação mensal: ~30k gas (~$1.80)

### C. Simulação Monte Carlo
[Ver notebook Jupyter](./simulations/attention_tokens_monte_carlo.ipynb)

---

**Hash desta BIP:** `a4f7c2e9b1d3f8a6c5e2d9b7f4a3c1e8`  
**Timestamp:** 2025-01-02T15:30:00Z  
**∅**
