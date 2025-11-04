# 📱 WalletConnect Mobile Setup

## Por que é necessário?

O **WalletConnect** é essencial para permitir que usuários móveis conectem suas carteiras ao dApp. Sem um Project ID válido, as conexões mobile não funcionarão corretamente.

## Como obter seu próprio Project ID (GRATUITO)

### 1. Acesse o WalletConnect Cloud
🔗 https://cloud.walletconnect.com/sign-in

### 2. Crie uma conta
- Use GitHub, Google ou email
- É 100% gratuito
- Sem limite de conexões

### 3. Crie um novo projeto
- Clique em **"Create New Project"**
- Nome: `Revolução Cibernética` (ou seu preferido)
- Descrição: Breve descrição do seu dApp

### 4. Copie o Project ID
- Após criar, você verá um **Project ID** (formato: `abc123def456...`)
- Copie este ID

### 5. Configure no projeto

#### Para desenvolvimento local:
Crie um arquivo `.env.local` na pasta `frontend/`:
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=seu_project_id_aqui
```

#### Para produção (GitHub Pages):
Atualize o arquivo `frontend/.env.production`:
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=seu_project_id_aqui
```

### 6. Rebuild e teste
```bash
npm run build
npm run dev
```

## ⚠️ Project ID Padrão

Atualmente, o projeto usa um Project ID de exemplo. Isso funciona, mas:
- ⚠️ Pode ter rate limiting
- ⚠️ Compartilhado entre múltiplos projetos
- ⚠️ Sem analytics do seu dApp
- ⚠️ Pode parar de funcionar

## ✅ Benefícios do seu próprio Project ID

- ✅ **Sem limites**: Conexões ilimitadas
- ✅ **Analytics**: Veja quantos usuários conectam
- ✅ **Confiabilidade**: Não depende de IDs compartilhados
- ✅ **Profissional**: Seu dApp identificado corretamente
- ✅ **Gratuito**: Não custa nada

## 📊 Verificar se está funcionando

No console do navegador, você deve ver:
```
⚠️  Using default WalletConnect Project ID. Get your own at https://cloud.walletconnect.com
```

Quando configurar o seu próprio ID, essa mensagem desaparecerá.

## 🔒 Segurança

- ✅ O Project ID é **público** (pode estar no código)
- ✅ Não dá acesso aos fundos dos usuários
- ✅ Apenas identifica seu dApp na rede WalletConnect

## 🆘 Problemas?

### Carteiras não conectam no mobile
1. Verifique se o Project ID está correto
2. Certifique-se de que a variável começa com `NEXT_PUBLIC_`
3. Rebuild o projeto após alterar `.env`

### "Invalid Project ID"
- Verifique se copiou o ID completo (sem espaços)
- Confirme se o projeto está ativo no WalletConnect Cloud

### Desktop funciona, mobile não
- É exatamente o problema que o WalletConnect resolve
- Certifique-se de ter um Project ID válido configurado

## 📚 Recursos

- [WalletConnect Docs](https://docs.walletconnect.com/)
- [RainbowKit Docs](https://www.rainbowkit.com/docs/introduction)
- [Wagmi Docs](https://wagmi.sh/)

---

**Tempo estimado para setup**: 5 minutos ⏱️
**Custo**: Grátis 💰
**Dificuldade**: Fácil 🟢
