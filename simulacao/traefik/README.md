# Traefik - Reverse Proxy Configuration

## 🌐 Acessos Configurados

### Sites Públicos (SEM autenticação)
- **Frontend**: https://revolucao-cibernetica.local
- **IPFS Gateway**: https://ipfs.revolucao-cibernetica.local
- **Grafana**: https://grafana.revolucao-cibernetica.local (usa login próprio do Grafana)

### Ferramentas Administrativas (COM autenticação)
- **Traefik Dashboard**: https://traefik.revolucao-cibernetica.local
- **Prometheus**: https://prometheus.revolucao-cibernetica.local

**Credenciais:**
- **Usuário**: `admin`
- **Senha**: `revolucao`

## 🔐 Segurança

### Autenticação Básica
O middleware `auth` usa Basic Authentication para proteger ferramentas administrativas.

Para gerar novas senhas com htpasswd:
```bash
# Instalar apache2-utils (Ubuntu/Debian) ou httpd-tools (RHEL/CentOS)
apt-get install apache2-utils  # ou: yum install httpd-tools

# Gerar nova senha
htpasswd -nb admin nova_senha_aqui
```

Copie o output e substitua em `traefik/dynamic.yml` no middleware `auth`.

### Certificados SSL

Atualmente usando certificados **mkcert** para desenvolvimento local.

Para criar novos certificados:
```bash
# Instalar mkcert
brew install mkcert  # macOS
# ou: sudo apt install mkcert  # Linux

# Instalar CA local
mkcert -install

# Gerar certificados para os domínios
cd traefik/certs
mkcert revolucao-cibernetica.local \
       "*.revolucao-cibernetica.local" \
       ipfs.revolucao-cibernetica.local \
       traefik.revolucao-cibernetica.local \
       prometheus.revolucao-cibernetica.local \
       grafana.revolucao-cibernetica.local
```

### Para produção (Let's Encrypt)
Descomente as linhas `certResolver: letsencrypt` em `dynamic.yml` e configure em `traefik.yml`:

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: seu-email@example.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
```

## 🔧 Middlewares Disponíveis

### `auth`
Autenticação básica HTTP (usuário/senha).

### `security-headers`
Headers de segurança HTTP:
- SSL Redirect
- HSTS
- Frame Options
- XSS Protection
- Content Security Policy

### `rate-limit`
Limitação de taxa:
- 100 requisições/segundo (média)
- Burst de 50 requisições

### `compression`
Compressão gzip/brotli automática.

### `cors`
CORS headers para APIs.

### `circuit-breaker`
Circuit breaker para proteção contra serviços instáveis.

### `retry`
Retry automático com backoff exponencial.

## 📝 Configuração

### Arquivos
- `traefik.yml`: Configuração estática (entrypoints, providers, API)
- `dynamic.yml`: Configuração dinâmica (routers, services, middlewares)
- `certs/`: Certificados SSL

### Editar Configuração
1. Edite `dynamic.yml` para adicionar/modificar routers/services
2. Traefik recarrega automaticamente (file provider watch)
3. Não precisa reiniciar o container

### Logs
```bash
# Ver logs do Traefik
docker logs traefik -f

# Access logs (se habilitado)
docker exec traefik cat /var/log/traefik/access.log
```

## 🐛 Troubleshooting

### "Certificado não confiável" no navegador
```bash
# Reinstalar CA do mkcert
mkcert -install

# Verificar se certificados existem
ls -la traefik/certs/
```

### "502 Bad Gateway"
- Verifique se o serviço backend está rodando: `docker ps`
- Verifique logs do serviço: `docker logs <container>`
- Verifique configuração em `dynamic.yml`

### "404 Not Found"
- Verifique a regra do router em `dynamic.yml`
- Verifique o `/etc/hosts` tem o domínio configurado
- Use `docker logs traefik` para debug

### Autenticação não funciona
```bash
# Regenerar senha
htpasswd -nb admin nova_senha

# Atualizar em dynamic.yml e verificar
docker logs traefik -f
```

## 🔗 Links Úteis

- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Middlewares Reference](https://doc.traefik.io/traefik/middlewares/overview/)
- [Routers Configuration](https://doc.traefik.io/traefik/routing/routers/)
- [Let's Encrypt Setup](https://doc.traefik.io/traefik/https/acme/)
