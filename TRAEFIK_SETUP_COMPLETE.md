# Traefik Setup - Complete! ✅

## O que foi configurado

### 1. **Arquivos Criados**
- ✅ `traefik/traefik.yml` - Configuração estática
- ✅ `traefik/dynamic.yml` - Routers, services e middlewares
- ✅ `docker-compose.traefik.yml` - Container Traefik
- ✅ `traefik/.env.example` - Template de variáveis
- ✅ `TRAEFIK_GUIDE.md` - Guia completo de uso

### 2. **Serviços Configurados**
- ✅ Frontend (Next.js) → `revolucao-cibernetica.local`
- ✅ Grafana → `grafana.revolucao-cibernetica.local`
- ✅ Prometheus → `prometheus.revolucao-cibernetica.local`
- ✅ IPFS Gateway → `ipfs.revolucao-cibernetica.local`
- ✅ Traefik Dashboard → `traefik.revolucao-cibernetica.local:8080`
- ✅ Whoami (teste) → `whoami.revolucao-cibernetica.local`

### 3. **Recursos Implementados**

#### SSL/TLS Automático
- ✅ Let's Encrypt HTTP Challenge
- ✅ Suporte para DNS Challenge (wildcards)
- ✅ Auto-renovação de certificados
- ✅ Redirecionamento HTTP → HTTPS

#### Middlewares de Segurança
- ✅ Security Headers (HSTS, CSP, X-Frame-Options, etc.)
- ✅ Rate Limiting (100 req/s, burst 50)
- ✅ Circuit Breaker
- ✅ Compression (Gzip)
- ✅ Basic Authentication (dashboard/prometheus)

#### Observabilidade
- ✅ Métricas Prometheus em `/metrics`
- ✅ Access Logs (JSON format)
- ✅ Error Logs (JSON format)
- ✅ Health Checks dos backends

#### Service Discovery
- ✅ Auto-detecção via Docker labels
- ✅ Load Balancing
- ✅ Health Checks automáticos

### 4. **Comandos Makefile**
```bash
make traefik              # Iniciar Traefik
make traefik-down         # Parar Traefik
make traefik-logs         # Ver logs
make traefik-certs        # Ver certificados SSL
make traefik-hosts        # Adicionar ao /etc/hosts
make all-services         # Tudo (app + monitoring + traefik)
make all-services-down    # Parar tudo
```

---

## Quick Start

### 1. Adicionar Domínios Locais
```bash
make traefik-hosts
# Ou manualmente:
sudo nano /etc/hosts
# Adicionar:
127.0.0.1 revolucao-cibernetica.local
127.0.0.1 traefik.revolucao-cibernetica.local
127.0.0.1 grafana.revolucao-cibernetica.local
127.0.0.1 prometheus.revolucao-cibernetica.local
127.0.0.1 ipfs.revolucao-cibernetica.local
127.0.0.1 whoami.revolucao-cibernetica.local
```

### 2. Iniciar Serviços
```bash
# Opção 1: Apenas Traefik (requer serviços já rodando)
make traefik

# Opção 2: Tudo de uma vez (RECOMENDADO)
make all-services
```

### 3. Testar
```bash
# Dashboard (com auth: admin/revolucao)
https://traefik.revolucao-cibernetica.local:8080

# Aplicação
https://revolucao-cibernetica.local

# Teste simples
https://whoami.revolucao-cibernetica.local
```

---

## Arquitetura

```
Internet/Browser
       ↓
   Traefik (80/443)
       ↓
   ┌───────────────────────┐
   │  Auto Service Discovery  │
   │  (Docker Labels)         │
   └───────────────────────┘
       ↓
   ┌───────────────────────┐
   │  SSL/TLS (Let's Encrypt) │
   │  Middlewares              │
   │  Load Balancing           │
   └───────────────────────┘
       ↓
   ┌──────────┬──────────┬──────────┐
   │ Frontend │ Grafana  │ Prometheus│
   └──────────┴──────────┴──────────┘
```

---

## Labels do Traefik (Exemplo)

```yaml
services:
  frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`revolucao-cibernetica.local`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.frontend.loadbalancer.server.port=3000"
      - "traefik.http.routers.frontend.middlewares=security-headers@file,compression@file"
```

---

## Certificados SSL

### Desenvolvimento (Self-Signed)
Navegadores mostrarão aviso, mas funciona. Aceite o certificado.

### Produção (Let's Encrypt)
1. Configure DNS apontando para seu servidor
2. Edite `traefik/traefik.yml`:
   ```yaml
   certificatesResolvers:
     letsencrypt:
       acme:
         email: "admin@revolucao-cibernetica.org"
         caServer: "https://acme-v02.api.letsencrypt.org/directory"
   ```
3. Reinicie Traefik: `make traefik-down && make traefik`

### Wildcards (DNS Challenge)
Para `*.revolucao-cibernetica.org`:
1. Configure provider DNS (Cloudflare, AWS Route53, etc.)
2. Adicione credenciais em `traefik/.env`
3. Habilite DNS Challenge em `traefik/traefik.yml`

---

## Segurança

### Headers Configurados
- ✅ **HSTS** - Strict Transport Security (2 anos)
- ✅ **CSP** - Content Security Policy
- ✅ **X-Frame-Options** - Proteção contra clickjacking
- ✅ **X-Content-Type-Options** - Previne MIME sniffing
- ✅ **Referrer-Policy** - Controle de referrer
- ✅ **Permissions-Policy** - Controle de APIs do browser

### Rate Limiting
- **Average**: 100 requisições/segundo
- **Burst**: 50 requisições adicionais
- **Window**: 1 segundo

### Autenticação
Dashboard e Prometheus protegidos com Basic Auth:
- **User**: admin
- **Password**: revolucao

Gerar nova senha:
```bash
htpasswd -nb admin your-password
```

---

## Monitoramento

### Métricas Prometheus
- Endpoint: `http://traefik:8080/metrics`
- Métricas: requests, durations, status codes, backends

### Dashboard Grafana
- Import ID: **17346** (Traefik Official Dashboard)
- Fonte de dados: Prometheus

### Logs
```bash
# Logs em tempo real
make traefik-logs

# Arquivos de log
tail -f traefik/logs/traefik.log
tail -f traefik/logs/access.log
```

---

## Troubleshooting

### 502 Bad Gateway
```bash
# Verificar se backend está rodando
docker ps | grep revolucao-cibernetica-app

# Verificar health check
docker inspect revolucao-cibernetica-app | grep Health

# Ver logs do backend
docker logs revolucao-cibernetica-app
```

### Certificados não gerados
```bash
# Ver logs do Traefik
make traefik-logs

# Verificar acme.json
ls -la traefik/letsencrypt/acme.json

# Testar com staging primeiro
# Editar traefik/traefik.yml:
caServer: "https://acme-staging-v02.api.letsencrypt.org/directory"
```

### DNS não resolve
```bash
# Verificar /etc/hosts
cat /etc/hosts | grep revolucao-cibernetica

# Adicionar se necessário
make traefik-hosts
```

---

## Próximos Passos

1. ✅ **Configuração Local Completa**
2. 🌐 **Configurar DNS Real** (produção)
3. 🔐 **Ativar Let's Encrypt Produção**
4. 📊 **Importar Dashboard Grafana** (ID: 17346)
5. 🚨 **Configurar Alertas** (CPU, RAM, SSL expiration)
6. 🔒 **Revisar Security Headers**
7. 📈 **Monitorar Métricas** e otimizar

---

## Referências

- 📚 [Documentação Oficial Traefik](https://doc.traefik.io/traefik/)
- 🔐 [Let's Encrypt](https://letsencrypt.org/)
- 🔒 [Security Headers](https://securityheaders.com/)
- 🧪 [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- 📊 [Dashboard Grafana](https://grafana.com/grafana/dashboards/17346)

---

**Status**: ✅ Configuração Completa  
**Pronto para**: Testes Locais e Deploy em Produção  
**Desenvolvido por**: Revolução Cibernética 🚀
