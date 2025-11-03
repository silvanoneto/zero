# 🔐 Guia de Recuperação de Carteira e Tokens

## Cenário: Minha carteira foi roubada!

**Você está seguro!** O sistema detectou o roubo e bloqueou a carteira automaticamente. Seus tokens SOB estão protegidos. Este guia explica **passo a passo** como recuperar o acesso.

---

## 📋 O Que Aconteceu?

1. **Hacker roubou sua carteira** (phishing, malware, etc)
2. **Sistema detectou fraude** em < 1 minuto (login impossível, velocidade anômala, etc)
3. **Carteira foi bloqueada** automaticamente
4. **Tokens ficaram protegidos** (não podem ser transferidos)
5. **Você mantém acesso através de outra carteira** da sua identidade

---

## ✅ Requisitos para Recuperação

### 1. Você Precisa Ter:

- ✅ **Outra carteira ativa** da sua identidade (das 5 configuradas no MultiWallet)
- ✅ **Acesso aos guardiões** (2 dos 3 precisam aprovar)
- ✅ **Provas de identidade** (mínimo 3 tipos diferentes)
- ✅ **Dispositivo conhecido** ou documentos de backup

### 2. Tipos de Provas Aceitas:

| Prova | Descrição | Score |
|-------|-----------|-------|
| 🤳 **Biometria** | Face ID, impressão digital | 90-100 |
| 📱 **Dispositivo Original** | Login do celular cadastrado | 85-95 |
| 📄 **Documento KYC** | CPF, RG verificado previamente | 80-90 |
| 📧 **Email Verificado** | Código enviado para email cadastrado | 70-80 |
| 📞 **Telefone** | SMS para número cadastrado | 70-80 |
| 🔒 **Perguntas Secretas** | Respostas corretas às perguntas | 60-70 |
| 📊 **Ação Histórica** | Prova de transação passada | 50-60 |
| 👥 **Verificação Social** | Outros cidadãos confirmam | 40-60 |

**Score Necessário:** Média ≥ 70% com no mínimo 3 provas

---

## 🔄 Processo de Recuperação (Passo a Passo)

### **Passo 1: Iniciar Recuperação** 🚀

Use **outra carteira** da sua identidade (não a roubada):

```javascript
// Conectar com carteira secundária
await walletRecovery.initiateRecovery(
  "0x1234...",           // Seu ID de identidade
  "0xHACKER...",         // Carteira roubada (bloqueada)
  "0xNOVA...",           // Nova carteira para receber tokens
  1000                   // Quantidade de SOB a recuperar
);
```

**Interface do Usuário:**
```
╔════════════════════════════════════════════╗
║  🚨 Iniciar Recuperação de Carteira       ║
╠════════════════════════════════════════════╣
║                                            ║
║  Carteira Comprometida:                    ║
║  0x742d...8f3a  [BLOQUEADA]               ║
║                                            ║
║  Nova Carteira:                            ║
║  [_________________] [Gerar Nova]          ║
║                                            ║
║  Tokens a Recuperar: 1,000 SOB            ║
║                                            ║
║  ⚠️  Processo leva 72 horas após aprovação ║
║                                            ║
║  [Iniciar Recuperação]  [Cancelar]        ║
╚════════════════════════════════════════════╝
```

---

### **Passo 2: Submeter Provas de Identidade** 📝

Você precisa provar que é você! Submeta **no mínimo 3 provas**:

#### 2.1 Verificação Biométrica (Score: 95)

```javascript
// Sistema captura biometria
const biometricHash = await captureBiometric();

await walletRecovery.submitProof(
  identityId,
  ProofType.BiometricVerification,
  biometricHash,
  95  // Score de confiança
);
```

**Interface:**
```
╔════════════════════════════════════════════╗
║  📸 Verificação Biométrica                ║
╠════════════════════════════════════════════╣
║                                            ║
║        [Foto do Rosto]                     ║
║                                            ║
║  ✓ Posicione seu rosto no círculo         ║
║  ✓ Mantenha boa iluminação                ║
║  ✓ Remova óculos/máscara                  ║
║                                            ║
║  [Capturar Face ID]                        ║
╚════════════════════════════════════════════╝
```

#### 2.2 Verificação de Email (Score: 75)

```javascript
// Sistema envia código para email cadastrado
await sendVerificationCode(user.email);

// Usuário insere código
await walletRecovery.submitProof(
  identityId,
  ProofType.EmailVerification,
  keccak256(verificationCode),
  75
);
```

#### 2.3 Acesso a Dispositivo Original (Score: 90)

```javascript
// Login do celular cadastrado
const deviceFingerprint = await getDeviceFingerprint();

await walletRecovery.submitProof(
  identityId,
  ProofType.DeviceOwnership,
  deviceFingerprint,
  90
);
```

#### 2.4 Documento KYC (Score: 85)

```javascript
// Upload de documento
const documentHash = await hashDocument(cpfPhoto);

await walletRecovery.submitProof(
  identityId,
  ProofType.DocumentVerification,
  documentHash,
  85
);
```

---

### **Passo 3: Guardiões Aprovam** 👥

Seus **3 guardiões** recebem notificação e precisam votar. **2 de 3** devem aprovar:

```javascript
// Cada guardião vota
await walletRecovery.voteRecovery(
  identityId,
  true,  // aprovar
  "Confirmo que é o João mesmo, falei com ele ontem"
);
```

**Interface do Guardião:**
```
╔════════════════════════════════════════════╗
║  🛡️ Pedido de Recuperação - João Silva    ║
╠════════════════════════════════════════════╣
║                                            ║
║  Carteira comprometida em: 01/11/2025     ║
║  Tipo de ataque: Login Impossível          ║
║                                            ║
║  Provas submetidas: 4/3 ✓                 ║
║  • Biometria: 95% ✓                       ║
║  • Email: 75% ✓                           ║
║  • Dispositivo: 90% ✓                     ║
║  • Documento: 85% ✓                       ║
║                                            ║
║  Score médio: 86% ✓                       ║
║                                            ║
║  Votos: 1/2 (você + Maria)                ║
║                                            ║
║  [✓ Aprovar] [✗ Rejeitar]                 ║
╚════════════════════════════════════════════╝
```

---

### **Passo 4: Aprovação Automática** ✅

Quando as condições são satisfeitas, o sistema **aprova automaticamente**:

- ✅ 3+ provas submetidas
- ✅ Score médio ≥ 70%
- ✅ 2+ guardiões aprovaram

```javascript
// Sistema verifica e aprova automaticamente
if (avgScore >= 70 && guardianApprovals >= 2) {
  process.status = RecoveryStatus.Approved;
  process.executesAt = now + 72 hours;
  
  emit RecoveryApproved(identityId, executesAt);
}
```

**Notificação:**
```
╔════════════════════════════════════════════╗
║  ✅ Recuperação Aprovada!                 ║
╠════════════════════════════════════════════╣
║                                            ║
║  Sua recuperação foi aprovada.             ║
║                                            ║
║  ⏰ Período de espera: 72 horas           ║
║  🕐 Executa em: 04/11/2025 14:30          ║
║                                            ║
║  Durante esse período:                     ║
║  • Qualquer cidadão pode contestar        ║
║  • Se houver fraude, será bloqueado       ║
║  • Você será notificado                    ║
║                                            ║
║  [Ver Detalhes]  [OK]                     ║
╚════════════════════════════════════════════╝
```

---

### **Passo 5: Período de Contestação (72 horas)** ⏰

**Segurança extra:** Se alguém suspeitar que é fraude, pode contestar:

```javascript
// Se for realmente um hacker tentando
await walletRecovery.contestRecovery(
  identityId,
  "Este não é o João! Eu sei que ele está viajando"
);
```

**O que acontece:**
- 🛑 Recuperação pausada
- 🔍 Validadores investigam
- ⚖️ Decidem se é legítimo

**Se você for o usuário legítimo:** Não se preocupe! As provas mostrarão que é você de verdade.

---

### **Passo 6: Execução (Migração dos Tokens)** 🎉

Após 72 horas **SEM contestação**, você ou qualquer um pode executar:

```javascript
await walletRecovery.executeRecovery(identityId);

// Sistema migra tokens automaticamente
ISovereignCurrency(sobContract).migrateTokens(
  "0xHACKER...",    // De: carteira roubada
  "0xNOVA...",      // Para: sua nova carteira
  1000              // Quantidade
);
```

**Resultado Final:**
```
╔════════════════════════════════════════════╗
║  🎉 Recuperação Concluída!                ║
╠════════════════════════════════════════════╣
║                                            ║
║  ✅ 1,000 SOB migrados com sucesso        ║
║                                            ║
║  De:   0x742d...8f3a [BLOQUEADA]          ║
║  Para: 0x9f3c...21ab [ATIVA]              ║
║                                            ║
║  Nova carteira configurada:                ║
║  • Adicionada à sua identidade            ║
║  • Tokens disponíveis para uso            ║
║  • Carteira antiga permanece bloqueada    ║
║                                            ║
║  ⚠️ Recomendações:                        ║
║  1. Configure novos guardiões              ║
║  2. Atualize dispositivos conhecidos      ║
║  3. Ative 2FA em todas contas             ║
║                                            ║
║  [Ir para Carteira]  [Configurar]         ║
╚════════════════════════════════════════════╝
```

---

## 🔒 Segurança do Processo

### Proteção Contra Atacantes

| Tentativa do Hacker | Como o Sistema Bloqueia |
|---------------------|-------------------------|
| Hacker tenta recuperar | ❌ Não tem outra carteira da identidade |
| Hacker submete provas falsas | ❌ Score baixo (< 70%) |
| Hacker forja biometria | ❌ Guardiões rejeitam |
| Hacker suborna 1 guardião | ❌ Precisa de 2/3 (maioria) |
| Hacker passa de tudo | ❌ 72h para usuário real contestar |

### Rate Limiting

Para evitar ataques de força bruta:

- 🚫 **Máximo 3 tentativas** em 24 horas
- ⏰ Se falhar 3x, aguarda **24 horas**
- 🔍 Tentativas suspeitas alertam validadores

---

## 📊 Timeline Típica

```
Dia 0 (Roubo)
00:00 → Hacker rouba carteira
00:08 → Sistema detecta login impossível
00:09 → Carteira bloqueada automaticamente
00:15 → Você recebe alerta de bloqueio

Dia 0 (Recuperação)
01:00 → Você inicia recuperação
01:10 → Submete biometria (95%)
01:15 → Submete email (75%)
01:20 → Submete dispositivo (90%)
02:00 → Guardião 1 aprova
03:30 → Guardião 2 aprova
03:31 → Sistema aprova automaticamente

Dia 3 (Execução)
03:31 → Período de contestação (72h)
        Nenhuma contestação
        
Dia 3
03:32 → Você executa recuperação
03:33 → Tokens migrados ✅
03:34 → Acesso restaurado 🎉
```

**Total: ~3 dias** (pode ser mais rápido se validador aprovar manualmente)

---

## ❓ FAQ

### 1. E se eu perder TODAS as 5 carteiras?

Use **Social Recovery** com guardiões. Eles podem criar nova identidade e transferir tokens.

### 2. E se os guardiões não responderem?

- Validador pode aprovar com mais provas (score 90%+)
- Ou adicione novos guardiões através de outra carteira

### 3. Posso acelerar as 72 horas?

Não diretamente, mas:
- Validador pode aprovar após análise detalhada
- Em emergências comprovadas (vida em risco)

### 4. E se contestarem minha recuperação legítima?

- Validadores analisam **todas as provas**
- Se você for legítimo, será aprovado
- Contestador malicioso pode ser penalizado

### 5. Quanto custa?

- Gas da recuperação: ~$5-10
- Tokens retornam 100% (sem taxas)

### 6. Posso recuperar várias vezes?

- Sim, sem limite
- Mas cada carteira só pode ser recuperada 1x
- Crie nova carteira para cada recuperação

---

## 🛠️ Exemplo Completo (Código)

```javascript
// 1. Iniciar recuperação
const identityId = "0x123...";
const compromisedWallet = "0xHACKER...";
const newWallet = "0xNOVA...";
const tokensToRecover = 1000;

await walletRecovery.initiateRecovery(
  identityId,
  compromisedWallet,
  newWallet,
  tokensToRecover
);

// 2. Submeter provas
await walletRecovery.submitProof(
  identityId,
  ProofType.BiometricVerification,
  biometricHash,
  95
);

await walletRecovery.submitProof(
  identityId,
  ProofType.EmailVerification,
  emailCodeHash,
  75
);

await walletRecovery.submitProof(
  identityId,
  ProofType.DeviceOwnership,
  deviceFingerprint,
  90
);

// 3. Guardiões votam
// (cada guardião executa)
await walletRecovery.voteRecovery(
  identityId,
  true,
  "Confirmo identidade"
);

// 4. Sistema aprova automaticamente
// (se condições satisfeitas)

// 5. Aguardar 72h

// 6. Executar recuperação
await walletRecovery.executeRecovery(identityId);

console.log("✅ Tokens recuperados com sucesso!");
```

---

## 📱 Interface do Usuário (Dashboard)

```
╔═══════════════════════════════════════════════════════╗
║  🏠 Dashboard - João Silva                            ║
╠═══════════════════════════════════════════════════════╣
║                                                        ║
║  💰 Saldo Total: 1,000 SOB                            ║
║                                                        ║
║  🔐 Carteiras Ativas:                                 ║
║  • 0x9f3c...21ab [PRIMÁRIA] ✅                        ║
║  • 0x4e8b...67cd [SECUNDÁRIA] ✅                      ║
║  • 0x742d...8f3a [BLOQUEADA] 🚨                       ║
║                                                        ║
║  🚨 Alerta de Segurança:                              ║
║  ┌────────────────────────────────────────────────┐   ║
║  │ Carteira 0x742d...8f3a foi bloqueada           │   ║
║  │ Motivo: Login Impossível (São Paulo → Moscou)  │   ║
║  │ Data: 01/11/2025 00:09                         │   ║
║  │                                                 │   ║
║  │ [Iniciar Recuperação] [Detalhes]              │   ║
║  └────────────────────────────────────────────────┘   ║
║                                                        ║
║  👥 Guardiões: Maria, Pedro, Ana                      ║
║                                                        ║
╚═══════════════════════════════════════════════════════╝
```

---

## 🎯 Resumo

1. ✅ **Sistema detecta fraude** automaticamente (< 1 min)
2. ✅ **Tokens ficam protegidos** (carteira bloqueada)
3. ✅ **Você recupera através de outra carteira** da identidade
4. ✅ **Submete provas** (biometria, email, dispositivo)
5. ✅ **Guardiões aprovam** (2 de 3)
6. ✅ **72h de segurança** (contestação)
7. ✅ **Tokens migram para nova carteira**

**Você nunca perde seus tokens!** 🎉
