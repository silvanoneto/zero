# Chainlink VRF Integration - RestorativeJustice
## Seleção Verdadeiramente Aleatória de Jurados

**Status**: ✅ Implementado e Testado  
**Data**: Novembro 2025  
**Versão**: 1.0.0

---

## 📋 Visão Geral

A integração com Chainlink VRF (Verifiable Random Function) v2 resolve o gap crítico de segurança na seleção aleatória de jurados, substituindo a pseudo-randomness manipulável por mineradores por randomness verdadeiramente verificável.

### Problema Resolvido

**ANTES (Pseudo-random - Inseguro)**:
```solidity
uint256 seed = uint256(keccak256(abi.encodePacked(
    disputeId,
    block.timestamp,
    block.prevrandao  // ⚠️ Manipulável por mineradores!
)));
```

**DEPOIS (Chainlink VRF - Seguro)**:
```solidity
// Solicita randomness verificável off-chain
uint256 requestId = vrfCoordinator.requestRandomWords(...);

// Callback com número verdadeiramente aleatório
function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) {
    // randomWords[0] é verificável e não-manipulável ✅
}
```

---

## 🏗️ Arquitetura

### Componentes

1. **VRFCoordinatorV2Mock** - Mock para desenvolvimento/testes
2. **VRFConsumerBaseV2Mock** - Base contract para consumers
3. **RestorativeJustice** - Consumer que usa VRF

### Fluxo de Execução

```
┌─────────────────────────────────────────────────────────────┐
│  1. Usuario convoca júri                                     │
│     conveneJury(disputeId)                                   │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────▼───────────┐
        │ VRF habilitado?       │
        └───┬───────────────┬───┘
            │               │
          SIM              NÃO
            │               │
            │               └──────────────────────────┐
            │                                          │
┌───────────▼─────────────────────┐    ┌──────────────▼──────────────┐
│ 2. Solicita randomness VRF       │    │ Fallback: Pseudo-random     │
│    requestRandomWords()          │    │ _selectRandomJurors(0)      │
│    Status → PENDING_VRF          │    │ Status → IN_TRIAL           │
└───────────┬─────────────────────┘    └─────────────────────────────┘
            │
┌───────────▼─────────────────────┐
│ 3. Chainlink Oracle processa     │
│    (off-chain, seguro)           │
└───────────┬─────────────────────┘
            │
┌───────────▼─────────────────────┐
│ 4. Callback com randomness       │
│    fulfillRandomWords()          │
│    _selectRandomJurors(random)   │
│    Status → IN_TRIAL             │
└─────────────────────────────────┘
```

---

## 💻 Implementação

### Construtor

```solidity
constructor(
    address vrfCoordinator,  // Endereço do VRF Coordinator (ou address(0) para desabilitar)
    uint64 subscriptionId,   // ID da assinatura Chainlink
    bytes32 keyHash,         // Gas lane key hash
    uint32 callbackGasLimit  // Limite de gas para callback
)
```

**Exemplo - Desenvolvimento (VRF Desabilitado)**:
```solidity
RestorativeJustice justice = new RestorativeJustice(
    address(0),     // VRF desabilitado
    0,              // subscriptionId não usado
    bytes32(0),     // keyHash não usado
    0               // callbackGasLimit não usado
);
```

**Exemplo - Produção (VRF Habilitado)**:
```solidity
// Sepolia VRF Coordinator: 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
RestorativeJustice justice = new RestorativeJustice(
    0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625,  // VRF Coordinator Sepolia
    12345,                                        // Sua subscription ID
    0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c, // 500 gwei Key Hash
    500000                                        // 500k gas limit
);

// Habilitar VRF manualmente
justice.setVrfEnabled(true);
```

### Novo Status: PENDING_VRF

```solidity
enum DisputeStatus {
    PENDING_MEDIATION,
    IN_MEDIATION,
    MEDIATION_FAILED,
    PENDING_VRF,         // ⭐ NOVO - Aguardando randomness do VRF
    PENDING_JURY,
    IN_TRIAL,
    VERDICT_REACHED,
    RESOLUTION_COMPLETED,
    DISMISSED
}
```

### Funções Admin

```solidity
/**
 * @notice Habilita/desabilita VRF
 * @param enabled true para usar VRF, false para fallback pseudo-random
 */
function setVrfEnabled(bool enabled) external onlyOwner

/**
 * @notice Verifica se VRF está habilitado
 */
function vrfEnabled() public view returns (bool)
```

### Eventos

```solidity
event VrfStatusChanged(bool enabled);
event VrfRandomnessRequested(uint256 indexed disputeId, uint256 requestId);
event VrfRandomnessFulfilled(uint256 indexed disputeId, uint256 requestId);
```

---

## 🧪 Testes

### Cobertura (30 testes - 100% passing)

#### Testes VRF Específicos (2)
- ✅ `testVRFJurySelection()` - Seleção com VRF habilitado
- ✅ `testVRFDisabledFallback()` - Fallback pseudo-random quando VRF desabilitado

#### Cenários Testados

**Teste 1: VRF Habilitado**
```solidity
function testVRFJurySelection() public {
    // 1. Deploy com VRF
    justiceVRF = new RestorativeJustice(address(vrfCoordinator), ...);
    
    // 2. Habilita VRF
    justiceVRF.setVrfEnabled(true);
    
    // 3. Convoca júri
    justiceVRF.conveneJury(disputeId);
    
    // 4. Verifica status PENDING_VRF
    assertEq(dispute.status, DisputeStatus.PENDING_VRF);
    
    // 5. Simula callback VRF
    vrfCoordinator.fulfillRandomWords(requestId, address(justiceVRF));
    
    // 6. Verifica júri convocado
    assertEq(dispute.status, DisputeStatus.IN_TRIAL);
    assertEq(dispute.jurors.length, 12);
}
```

**Teste 2: VRF Desabilitado (Fallback)**
```solidity
function testVRFDisabledFallback() public {
    // 1. Deploy com VRF mas mantém desabilitado
    justiceVRF = new RestorativeJustice(address(vrfCoordinator), ...);
    
    // 2. VRF desabilitado por padrão
    // (não chama setVrfEnabled)
    
    // 3. Convoca júri - usa fallback
    justiceVRF.conveneJury(disputeId);
    
    // 4. Júri convocado IMEDIATAMENTE (sem callback)
    assertEq(dispute.status, DisputeStatus.IN_TRIAL);
    assertEq(dispute.jurors.length, 12);
}
```

**Resultados**:
```bash
Ran 30 tests for test/RestorativeJustice.t.sol:RestorativeJusticeTest
[PASS] testVRFJurySelection() (gas: 5041241)
[PASS] testVRFDisabledFallback() (gas: 4950000)
Suite result: ok. 30 passed; 0 failed; 0 skipped
```

---

## 📦 Deployment

### Passo 1: Criar Subscription no Chainlink

```bash
# 1. Acesse: https://vrf.chain.link/
# 2. Conecte wallet
# 3. Create Subscription
# 4. Adicione funds (LINK tokens)
# 5. Anote o Subscription ID
```

### Passo 2: Deploy do Contrato

```solidity
// Deploy script
RestorativeJustice justice = new RestorativeJustice(
    VRF_COORDINATOR_ADDRESS,
    SUBSCRIPTION_ID,
    KEY_HASH,
    CALLBACK_GAS_LIMIT
);
```

### Passo 3: Adicionar Consumer à Subscription

```bash
# 1. Volte para https://vrf.chain.link/
# 2. Abra sua subscription
# 3. Add Consumer
# 4. Cole o endereço do contrato RestorativeJustice
```

### Passo 4: Habilitar VRF

```solidity
// Como owner
justice.setVrfEnabled(true);
```

---

## 🌐 Endereços VRF por Rede

### Mainnet
- **Coordinator**: `0x271682DEB8C4E0901D1a1550aD2e64D568E69909`
- **Key Hash (500 gwei)**: `0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef`

### Sepolia Testnet
- **Coordinator**: `0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625`
- **Key Hash (500 gwei)**: `0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c`
- **Faucet LINK**: https://faucets.chain.link/sepolia

### Polygon Mumbai
- **Coordinator**: `0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed`
- **Key Hash (500 gwei)**: `0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f`

---

## 💰 Custos

### Gas Costs
- **Request**: ~100,000 gas
- **Callback**: ~200,000 - 500,000 gas (depende do `callbackGasLimit`)
- **Total por seleção**: ~300,000 - 600,000 gas

### LINK Costs
- Varia por rede e gas lane
- **Sepolia**: ~0.25 LINK por request
- **Mainnet**: ~2 LINK por request (500 gwei lane)

### Otimização
Para reduzir custos, considere:
1. Usar gas lanes mais baratas quando possível
2. Ajustar `callbackGasLimit` para o mínimo necessário
3. Batch múltiplas seleções quando viável

---

## 🔒 Segurança

### Vantagens do VRF

1. **Não-manipulável**: Mineradores não podem influenciar o resultado
2. **Verificável**: Qualquer um pode verificar que o random foi gerado corretamente
3. **On-chain**: Prova criptográfica armazenada na blockchain
4. **Auditável**: Histórico completo de requests/fulfillments

### Best Practices

```solidity
// ✅ BOM: Usa VRF em produção
justice.setVrfEnabled(true);

// ⚠️ DESENVOLVIMENTO APENAS: Fallback pseudo-random
justice.setVrfEnabled(false);
```

### Considerações

- **Latency**: VRF adiciona ~1-3 blocos de delay (callback)
- **Cost**: Requer LINK tokens na subscription
- **Dependency**: Depende da rede Chainlink estar operacional

---

## 📊 Comparação

| Aspecto | Pseudo-Random | Chainlink VRF |
|---------|--------------|---------------|
| Segurança | ⚠️ Baixa | ✅ Alta |
| Manipulável | ⚠️ Sim (mineradores) | ✅ Não |
| Verificável | ❌ Não | ✅ Sim |
| Custo | ✅ Grátis | ⚠️ ~2 LINK |
| Latency | ✅ Instantâneo | ⚠️ 1-3 blocos |
| Produção | ❌ Não recomendado | ✅ Recomendado |

---

## 🚀 Próximos Passos

### Curto Prazo
- ✅ ~~Implementar VRF mock para testes~~
- ✅ ~~Adicionar fallback pseudo-random~~
- ✅ ~~Testes completos (30/30 passing)~~
- ⏳ **Deploy em Sepolia testnet**
- ⏳ **Criar subscription Chainlink**
- ⏳ **Testar VRF real em testnet**

### Médio Prazo
- ⏳ Monitoramento de custos LINK
- ⏳ Dashboard de requests VRF
- ⏳ Alertas de subscription balance baixo

### Longo Prazo
- ⏳ Otimização de gas costs
- ⏳ Suporte para múltiplas redes
- ⏳ Automated refill de subscription

---

## 📚 Referências

- [Chainlink VRF Documentation](https://docs.chain.link/vrf/v2/introduction)
- [VRF Best Practices](https://docs.chain.link/vrf/v2/best-practices)
- [VRF Security Considerations](https://docs.chain.link/vrf/v2/security)
- [Supported Networks](https://docs.chain.link/vrf/v2/supported-networks)

---

## 📝 Changelog

### v1.0.0 (Novembro 2025)
- ✅ Implementação completa do Chainlink VRF v2
- ✅ Mock VRFCoordinator para testes
- ✅ Fallback pseudo-random para desenvolvimento
- ✅ 30/30 testes passando
- ✅ Novo status PENDING_VRF
- ✅ Admin function setVrfEnabled()
- ✅ Eventos VRF (Requested, Fulfilled, StatusChanged)

---

**Implementação**: GitHub Copilot  
**Autor**: Cybersyn 2.0 Team  
**License**: MIT
