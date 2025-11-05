# 🚀 Guia Rápido de Acesso - Revolução Cibernética

## ✅ Status dos Serviços

Todos os serviços estão rodando corretamente:

- ✅ **Traefik** (Reverse Proxy)
- ✅ **Frontend Next.js** (revolucao-cibernetica-app)
- ✅ **Helia Gateway** (IPFS/P2P)

## 🌐 Como Acessar

### Opção 1: Acesso Direto (Porta 3000) - Recomendado para desenvolvimento
```
http://localhost:3000
```

### Opção 2: Acesso via Traefik com HTTPS (Porta 443)
```
https://revolucao-cibernetica.local
```

**⚠️ Problema:** Certificado SSL autoassinado (mkcert) não é confiado pelo Firefox.

## 🔒 Configurar Certificados SSL no Firefox

### Passo 1: Instalar mkcert (se ainda não tiver)
```bash
# macOS
brew install mkcert

# Instalar CA local
mkcert -install
```

### Passo 2: Verificar se os certificados existem
```bash
ls -la traefik/certs/
```

Deve ver algo como:
```
revolucao-cibernetica.local+4.pem
revolucao-cibernetica.local+4-key.pem
```

### Passo 3: Adicionar exceção no Firefox

1. Abra o Firefox
2. Acesse: `https://revolucao-cibernetica.local`
3. Clique em **"Avançado"**
4. Clique em **"Aceitar o risco e continuar"**

**Ou** adicione o certificado CA do mkcert no Firefox:

1. Firefox → Preferências → Privacidade e Segurança
2. Certificados → Ver certificados
3. Autoridades → Importar
4. Navegue até: `~/Library/Application Support/mkcert/rootCA.pem` (macOS)
5. Marque "Confiar neste CA para identificar sites"

## 🎯 URLs Disponíveis

### Sites Públicos (sem autenticação)
- **Frontend Principal**: https://revolucao-cibernetica.local
- **IPFS Gateway**: https://ipfs.revolucao-cibernetica.local
- **Grafana**: https://grafana.revolucao-cibernetica.local

### Ferramentas Admin (usuário: admin / senha: revolucao)
- **Traefik Dashboard**: https://traefik.revolucao-cibernetica.local
- **Prometheus**: https://prometheus.revolucao-cibernetica.local

### Teste de conectividade
- **Whoami**: https://whoami.revolucao-cibernetica.local

## 🔧 Comandos Úteis

### Ver status dos containers
```bash
docker ps
```

### Ver logs do Traefik
```bash
docker logs traefik -f
```

### Ver logs do Frontend
```bash
docker logs revolucao-cibernetica-app -f
```

### Reiniciar Traefik
```bash
docker-compose -f docker-compose.traefik.yml restart traefik
```

### Parar tudo
```bash
make stop
```

### Iniciar tudo
```bash
make all-services
```

## 🐛 Problemas Comuns

### "Não foi possível conectar"
✅ **Solução:** Traefik está rodando agora! Use as URLs acima.

### "Certificado não confiável"
✅ **Solução:** 
1. Use `http://localhost:3000` (acesso direto sem SSL)
2. Ou aceite a exceção no Firefox (passos acima)
3. Ou instale os certificados mkcert (recomendado)

### "502 Bad Gateway"
- Verifique se o serviço backend está rodando: `docker ps`
- Veja os logs: `docker logs revolucao-cibernetica-app`

### "Pedindo autenticação"
- Sites públicos NÃO pedem mais autenticação ✅
- Dashboard do Traefik e Prometheus SIM (admin/revolucao)

## 📚 Arquivos de Configuração

- `traefik/traefik.yml` - Configuração estática
- `traefik/dynamic.yml` - Routers, services, middlewares
- `traefik/README.md` - Documentação completa do Traefik

## ✨ Mudanças Recentes

1. ✅ **Autenticação removida** dos sites públicos (frontend, IPFS, Grafana)
2. ✅ **Health check desabilitado** no frontend (Next.js não tem /api/health)
3. ✅ **Traefik iniciado** e funcionando corretamente
4. ✅ **Todos os domínios** configurados no `/etc/hosts`

---

**🎉 Tudo pronto!** Acesse: http://localhost:3000 ou https://revolucao-cibernetica.local (aceite o certificado)
