# BIP-0004: Prova de Vida + Avaliação de Saúde Existencial

**Status:** Draft  
**Tipo:** Core/Security  
**Autor(es):** @revolucao-cibernetica  
**Criado:** 2025-11-02  
**Votação:** Consenso (segurança crítica)  
**Tags:** `security`, `identity`, `health`, `well-being`, `proof-of-life`

---

## 📋 Resumo Executivo

Implementar sistema de **Prova de Vida contínua** com **Avaliação de Saúde Existencial** para:

1. **Prevenir fraude** por morte (IDS expira, pessoa falecida não vota)
2. **Detectar impersonation** (autenticação contínua)
3. **Avaliar bem-estar** do cidadão em 6 dimensões
4. **Recomendar melhorias** personalizadas para qualidade de vida

---

## 🎯 Problemas Críticos

### 1. Fraude por Morte

```
CENÁRIO ATUAL:
┌─────────────────────────────────────┐
│ João faleceu em 2024                │
│ Filho usa IDS do pai                │
│ Vota com identidade morta           │
│ Sistema não detecta fraude ❌        │
└─────────────────────────────────────┘
```

**Impacto:** Votações manipuladas, legitimidade comprometida.

### 2. Impersonation (Disfarce)

```
CENÁRIO ATUAL:
┌─────────────────────────────────────┐
│ Maria empresta IDS para irmã        │
│ Irmã usa durante dias               │
│ Sistema não detecta troca ❌         │
└─────────────────────────────────────┘
```

**Impacto:** Identidade não é realmente soberana.

### 3. Ausência de Expiração

```
PROBLEMA:
├─ IDS nunca expira
├─ Acúmulo de identidades abandonadas
├─ Impossível distinguir ativo de inativo
└─ Falecidos permanecem "vivos" no sistema
```

### 4. Falta de Cuidado com Cidadão

```
PROBLEMA:
├─ Sistema não se preocupa com bem-estar
├─ Cidadão em crise não recebe suporte
├─ Nenhum monitoramento de saúde
└─ Foco apenas em governança, não em pessoas
```

---

## 💡 Solução: Sistema Tridimensional

### Arquitetura

```
┌─────────────────────────────────────────────┐
│         PROOF OF LIFE SYSTEM                │
├─────────────────────────────────────────────┤
│  1. AUTENTICAÇÃO CONTÍNUA                   │
│     ├─ Biométrica (face, íris, digital)     │
│     ├─ Comportamental (digitação, gestos)   │
│     ├─ Cognitiva (desafios)                 │
│     ├─ Social (confirmação de conhecidos)   │
│     └─ Geolocalização (padrões)             │
├─────────────────────────────────────────────┤
│  2. EXPIRAÇÃO AUTOMÁTICA                    │
│     ├─ IDS válido por 1 ano                 │
│     ├─ Renovação requer prova recente       │
│     ├─ Alerta 30 dias antes                 │
│     └─ Desativação automática se expirar    │
├─────────────────────────────────────────────┤
│  3. AVALIAÇÃO DE SAÚDE EXISTENCIAL          │
│     ├─ 6 dimensões monitoradas              │
│     ├─ Laudo completo gerado                │
│     ├─ Recomendações personalizadas         │
│     └─ Intervenção em casos críticos        │
└─────────────────────────────────────────────┘
```

---

## 🔐 1. Autenticação Contínua

### Métodos Suportados

| Método | Confiança | Frequência | Descrição |
|--------|-----------|------------|-----------|
| **Biométrico** | 95-100% | A cada ação crítica | Face ID, íris, impressão digital |
| **Comportamental** | 70-85% | Contínua | Padrões de digitação, movimento mouse |
| **Cognitivo** | 80-90% | Semanal | Desafios personalizados, memória |
| **Social** | 75-85% | Mensal | Confirmação por pessoas próximas |
| **Geolocalização** | 60-75% | Contínua | Padrões de localização esperados |

### Exemplo: Biometria Facial

```javascript
// Frontend - Captura periódica
async function captureProofOfLife() {
  // 1. Capturar face via webcam
  const faceImage = await camera.capture();
  
  // 2. Liveness detection (piscar, sorrir, virar cabeça)
  const isLive = await detectLiveness(faceImage);
  
  if (!isLive) {
    throw new Error("Liveness check failed - possible photo/video");
  }
  
  // 3. Extrair embeddings faciais
  const faceEmbedding = await extractFaceEmbedding(faceImage);
  
  // 4. Comparar com referência
  const similarity = cosineSimilarity(faceEmbedding, storedEmbedding);
  
  if (similarity < 0.85) {
    throw new Error("Face does not match registered citizen");
  }
  
  // 5. Gerar prova zero-knowledge
  const zkProof = await generateZKProof({
    faceEmbedding,
    timestamp: Date.now(),
    challenge: randomChallenge
  });
  
  // 6. Enviar para validador
  const proofHash = await ipfs.add(zkProof);
  
  await proofOfLife.submitProofOfLife(
    citizenAddress,
    AuthenticationMethod.Biometric,
    95,  // confidence score
    proofHash
  );
}
```

### Exemplo: Autenticação Comportamental

```python
# Backend - Análise contínua de padrões
class BehavioralAuth:
    def __init__(self, citizen_id):
        self.citizen_id = citizen_id
        self.profile = load_behavioral_profile(citizen_id)
    
    def analyze_typing_pattern(self, keystrokes):
        """Analisa padrão de digitação"""
        features = {
            'avg_speed': calc_avg_speed(keystrokes),
            'variance': calc_variance(keystrokes),
            'bigrams': analyze_bigrams(keystrokes),
            'errors': count_errors(keystrokes)
        }
        
        similarity = compare_with_profile(features, self.profile.typing)
        return similarity > 0.75
    
    def analyze_mouse_movement(self, movements):
        """Analisa padrão de movimento do mouse"""
        features = {
            'speed': calc_speed(movements),
            'acceleration': calc_acceleration(movements),
            'curvature': analyze_curvature(movements),
            'pauses': detect_pauses(movements)
        }
        
        similarity = compare_with_profile(features, self.profile.mouse)
        return similarity > 0.70
    
    def continuous_authentication(self):
        """Score contínuo de confiança"""
        scores = []
        
        if self.analyze_typing_pattern(recent_keystrokes):
            scores.append(0.80)
        
        if self.analyze_mouse_movement(recent_movements):
            scores.append(0.75)
        
        if self.check_geolocation(current_location):
            scores.append(0.65)
        
        if self.check_time_patterns(current_time):
            scores.append(0.70)
        
        confidence = sum(scores) / len(scores) if scores else 0
        
        return {
            'is_authentic': confidence > 0.70,
            'confidence': confidence,
            'method': AuthenticationMethod.Behavioral
        }
```

---

## ⏰ 2. Sistema de Expiração

### Linha do Tempo

```
┌───────────────────────────────────────────────┐
│  ANO DO IDS                                   │
├───────────────────────────────────────────────┤
│  Mês 0: Registro inicial                      │
│  Mês 3: Primeira prova de vida obrigatória    │
│  Mês 6: Segunda prova de vida                 │
│  Mês 9: Terceira prova de vida                │
│  Mês 11: ALERTA - Renovar em 30 dias!         │
│  Mês 12: EXPIRAÇÃO - IDS desativado           │
└───────────────────────────────────────────────┘

Regras:
├─ Máximo 90 dias sem prova de vida
├─ Renovação requer prova recente (<90 dias)
├─ Alerta enviado 30 dias antes da expiração
└─ Após expiração: IDS inválido até renovar
```

### Automação

```javascript
// Keeper (Chainlink/Gelato)
class IDSExpirationKeeper {
    async checkUpkeep() {
        // 1. Buscar cidadãos próximos da expiração
        const citizens = await proofOfLife.getCitizensNeedingRenewal();
        
        for (const citizen of citizens) {
            const timeLeft = await proofOfLife.getTimeUntilExpiration(citizen);
            
            // Enviar alerta
            if (timeLeft <= 30 * 86400) {  // 30 dias
                await sendExpirationAlert(citizen, timeLeft);
            }
        }
        
        // 2. Marcar expirados
        const allCitizens = await proofOfLife.getActiveCitizens();
        
        for (const citizen of allCitizens) {
            const info = await proofOfLife.getCitizenInfo(citizen);
            
            if (info.idsExpiration < Date.now() / 1000) {
                await proofOfLife.markAsExpired(citizen);
            }
        }
    }
    
    async performUpkeep() {
        // Executar verificações a cada hora
        setInterval(() => this.checkUpkeep(), 3600 * 1000);
    }
}
```

---

## 🏥 3. Avaliação de Saúde Existencial

### 6 Dimensões de Bem-Estar

#### 1. **Saúde Física** (Physical)

```yaml
Métricas:
  - Atividade física (passos/dia, exercícios)
  - Qualidade do sono (horas, REM)
  - Nutrição (calorias, macros)
  - Sinais vitais (pressão, frequência cardíaca)
  - Doenças crônicas (controladas?)

Score Exemplo: 75/100
Risco: Médio

Recomendações:
  - Aumentar atividade física para 30 min/dia
  - Melhorar qualidade do sono (antes das 23h)
  - Consultar nutricionista para plano alimentar
```

#### 2. **Saúde Mental** (Mental)

```yaml
Métricas:
  - Nível de estresse (escala PSS)
  - Sintomas de ansiedade (GAD-7)
  - Sintomas de depressão (PHQ-9)
  - Qualidade cognitiva (memória, foco)
  - Mindfulness/meditação

Score Exemplo: 60/100
Risco: Médio-Alto

Recomendações:
  - Iniciar terapia semanal
  - Praticar meditação 10 min/dia
  - Reduzir consumo de notícias negativas
  - Considerar medicação (avaliar com psiquiatra)
```

#### 3. **Saúde Social** (Social)

```yaml
Métricas:
  - Quantidade de interações sociais
  - Qualidade dos relacionamentos
  - Apoio social percebido
  - Sensação de pertencimento
  - Isolamento social

Score Exemplo: 85/100
Risco: Baixo

Recomendações:
  - Manter frequência de interações
  - Participar de atividades comunitárias
  - Cultivar amizades profundas (não apenas superficiais)
```

#### 4. **Segurança Financeira** (Financial)

```yaml
Métricas:
  - Estabilidade de renda
  - Reserva de emergência
  - Dívidas (relação dívida/renda)
  - Planejamento financeiro
  - Ansiedade financeira

Score Exemplo: 45/100
Risco: Alto

Recomendações:
  - Criar orçamento mensal
  - Iniciar reserva de emergência (3 meses)
  - Renegociar dívidas de alto juros
  - Buscar educação financeira
  - Considerar fontes de renda adicionais
```

#### 5. **Qualidade Ambiental** (Environmental)

```yaml
Métricas:
  - Qualidade do ar (poluição)
  - Acesso a áreas verdes
  - Segurança do bairro
  - Condições de moradia
  - Ruído ambiente

Score Exemplo: 70/100
Risco: Médio

Recomendações:
  - Aumentar exposição a áreas verdes (parques)
  - Melhorar ventilação da casa
  - Considerar mudança para bairro mais seguro
  - Usar protetores auriculares para ruído
```

#### 6. **Senso de Propósito** (Purpose)

```yaml
Métricas:
  - Clareza de objetivos de vida
  - Alinhamento valores/ações
  - Contribuição para comunidade
  - Satisfação com trabalho
  - Legado percebido

Score Exemplo: 80/100
Risco: Baixo

Recomendações:
  - Continuar trabalho voluntário
  - Mentorar jovens profissionais
  - Documentar aprendizados (blog/livro)
  - Expandir impacto social
```

### Cálculo do Score Geral

```python
def calculate_overall_health(dimensions: dict) -> dict:
    """
    Calcula score geral ponderado
    """
    weights = {
        'Physical': 0.20,    # 20%
        'Mental': 0.25,      # 25% (mais importante)
        'Social': 0.15,      # 15%
        'Financial': 0.15,   # 15%
        'Environmental': 0.10, # 10%
        'Purpose': 0.15      # 15%
    }
    
    weighted_sum = sum(
        dimensions[dim]['score'] * weights[dim]
        for dim in dimensions
    )
    
    overall_score = weighted_sum
    
    # Determinar risco geral
    critical_count = sum(
        1 for dim in dimensions.values()
        if dim['risk'] == RiskLevel.Critical
    )
    
    if critical_count > 0:
        risk = RiskLevel.Critical
    elif overall_score < 50:
        risk = RiskLevel.High
    elif overall_score < 70:
        risk = RiskLevel.Medium
    else:
        risk = RiskLevel.Low
    
    return {
        'overall_score': overall_score,
        'overall_risk': risk,
        'dimensions': dimensions
    }
```

### Geração do Laudo

```markdown
# Laudo de Saúde Existencial
**Cidadão:** 0x1234...abcd  
**Data:** 2025-11-02  
**Avaliador:** Dr. Sistema de Bem-Estar

## Score Geral: 68/100
**Risco:** Médio

## Dimensões Avaliadas

### 🏃 Saúde Física: 75/100 (Médio)
- Atividade física adequada
- Sono pode melhorar
- Nutrição balanceada

**Recomendações:**
1. Dormir antes das 23h
2. Aumentar hidratação (2L/dia)

### 🧠 Saúde Mental: 60/100 (Médio-Alto)
- Níveis elevados de estresse
- Ansiedade moderada
- Foco prejudicado

**Recomendações:**
1. ⚠️ Iniciar terapia URGENTE
2. Praticar meditação diária
3. Reduzir carga de trabalho

### 👥 Saúde Social: 85/100 (Baixo)
- Rede social forte
- Relacionamentos de qualidade
- Bom senso de comunidade

**Recomendações:**
1. Manter frequência atual
2. Cultivar amizades profundas

### 💰 Segurança Financeira: 45/100 (Alto)
- ⚠️ Dívidas elevadas
- Sem reserva de emergência
- Ansiedade financeira

**Recomendações:**
1. 🚨 Criar orçamento IMEDIATAMENTE
2. Renegociar dívidas
3. Buscar educação financeira
4. Considerar renda adicional

### 🌳 Qualidade Ambiental: 70/100 (Médio)
- Bairro seguro
- Acesso a parques
- Moradia adequada

**Recomendações:**
1. Aumentar tempo em áreas verdes
2. Melhorar ventilação casa

### 🎯 Senso de Propósito: 80/100 (Baixo)
- Clareza de objetivos
- Trabalho alinhado com valores
- Contribuição comunitária

**Recomendações:**
1. Continuar trabalho voluntário
2. Mentorar outros

## Plano de Ação Prioritário

### Urgente (30 dias):
1. 🚨 Agendar terapia (saúde mental)
2. 🚨 Criar orçamento e renegociar dívidas

### Curto Prazo (90 dias):
1. Estabelecer rotina de meditação
2. Iniciar reserva de emergência
3. Melhorar qualidade do sono

### Médio Prazo (6 meses):
1. Reduzir ansiedade financeira
2. Fortalecer práticas de bem-estar
3. Aumentar atividade física

## Próxima Avaliação
**Data Recomendada:** 2026-02-02 (3 meses)

---
*Este laudo é confidencial e protegido por zero-knowledge proofs.*
```

---

## 🔒 Privacy & Security

### Zero-Knowledge Proofs

```
PROBLEMA: Dados de saúde são sensíveis

SOLUÇÃO: ZK-Proofs
├─ On-chain: Apenas hash + score numérico
├─ Off-chain: Laudo completo criptografado no IPFS
├─ Cidadão controla acesso aos dados
└─ Validadores verificam sem ver conteúdo
```

### Exemplo: ZK-Proof de Saúde

```javascript
// Cidadão prova que score > 50 sem revelar valor exato
async function proveHealthScore() {
  const actualScore = 68;  // Score real (privado)
  
  // Gerar prova que score > 50
  const zkProof = await snarkjs.groth16.fullProve(
    {
      score: actualScore,
      threshold: 50
    },
    wasmFile,
    zkeyFile
  );
  
  // Publicar apenas a prova (não o score)
  const { proof, publicSignals } = zkProof;
  
  // On-chain: Validar prova
  const isValid = await verifier.verifyProof(
    proof.a,
    proof.b,
    proof.c,
    publicSignals
  );
  
  // Sistema sabe que score > 50, mas não sabe o valor exato
  console.log("Score is above threshold:", isValid);
}
```

---

## 📊 Implementação

### Fase 1: MVP (Mês 1-3)

- [ ] Deploy `ProofOfLife.sol`
- [ ] Sistema de expiração automática
- [ ] Biometria facial básica
- [ ] 3 dimensões de saúde (Física, Mental, Social)

### Fase 2: Expansão (Mês 4-6)

- [ ] Autenticação comportamental
- [ ] 6 dimensões completas
- [ ] Geração de laudos automática
- [ ] Zero-knowledge proofs

### Fase 3: IA & Personalização (Mês 7-12)

- [ ] Recomendações por IA
- [ ] Predição de riscos
- [ ] Intervenções automáticas
- [ ] Gamificação de bem-estar

---

## 💰 Custos

### Gas Costs

| Operação | Gas | USD @ 60 gwei |
|----------|-----|---------------|
| Registrar cidadão | ~250k | $15.00 |
| Submeter prova | ~100k | $6.00 |
| Renovar IDS | ~50k | $3.00 |
| Avaliação saúde | ~150k | $9.00 |

### Infraestrutura

```yaml
Biometria Facial:
  - AWS Rekognition: $1.00 per 1k faces
  - Ou auto-hospedado (FaceNet): $0 + compute

Behavioral Analytics:
  - Auto-hospedado: $100/mês (servidor)

IPFS Storage:
  - Pinata: $20/mês (1GB)
  - Ou node próprio: $50/mês

Keepers (Automação):
  - Chainlink: ~$200/mês
  - Gelato: ~$150/mês
```

---

## 🎯 Métricas de Sucesso

### Mês 1-3

| Métrica | Meta |
|---------|------|
| Cidadãos registrados | 1.000+ |
| Provas de vida | 3.000+ |
| Taxa de renovação | >90% |
| Falsas rejeições | <5% |

### Mês 4-6

| Métrica | Meta |
|---------|------|
| Cidadãos registrados | 10.000+ |
| Avaliações de saúde | 5.000+ |
| Intervenções críticas | <1% |
| Satisfação usuários | >4.5/5 |

---

## 🚨 Casos de Emergência

### Intervenção por Risco Crítico

```python
async def handle_critical_risk(citizen, dimension):
    """
    Resposta automática para risco crítico
    """
    if dimension == HealthDimension.Mental:
        # Saúde mental crítica
        await send_emergency_contacts(citizen)
        await schedule_urgent_therapy(citizen)
        await activate_crisis_line(citizen)
        
    elif dimension == HealthDimension.Financial:
        # Crise financeira
        await connect_to_social_services(citizen)
        await provide_emergency_fund(citizen, amount=500)
        await schedule_financial_counseling(citizen)
        
    elif dimension == HealthDimension.Physical:
        # Saúde física crítica
        await alert_emergency_services(citizen)
        await notify_family(citizen)
```

---

## 💬 FAQ

**P: E se eu não quiser compartilhar meus dados de saúde?**
R: Sistema usa zero-knowledge proofs. Apenas scores numéricos são visíveis. Laudo completo é seu e criptografado.

**P: Quem pode ver meu laudo de saúde?**
R: Apenas você. Nem validadores têm acesso ao laudo completo. Apenas verificam que ele existe e está assinado.

**P: E se eu ficar doente e não puder fazer prova de vida?**
R: Existem métodos alternativos (confirmação social, médica). Sistema é flexível para casos especiais.

**P: Como funciona após morte real?**
R: Familiares/executores podem solicitar encerramento da conta com atestado de óbito. SOB são queimados.

**P: Biometria não é invasiva?**
R: É opcional. Pode usar combinação de outros métodos (comportamental + social + cognitivo).

---

## ✅ Aprovação

Esta BIP requer:
- [ ] **Votação por consenso** (segurança crítica)
- [ ] **Quórum**: 40% dos cidadãos ativos
- [ ] **Aprovação**: >75% de consenso
- [ ] **Duração**: 30 dias de votação
- [ ] **Auditorias**: 2+ empresas especializadas em privacidade

---

<div align="center">

**🌿 Um sistema que cuida das pessoas, não apenas da governança 🌿**

*"A verdadeira soberania começa com vida, saúde e dignidade."*

— Constituição Viva 2.0

**∅**

</div>
