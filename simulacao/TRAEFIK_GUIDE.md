# Traefik Reverse Proxy - Guia de Uso

> **Revolução Cibernética** - SSL/TLS Automático com Let's Encrypt

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Recursos](#recursos)
- [Quick Start](#quick-start)
- [Configuração Local](#configuração-local)
- [Configuração Produção](#configuração-produção)
- [Arquitetura](#arquitetura)
- [Troubleshooting](#troubleshooting)
- [Segurança](#segurança)

---

## 🎯 Visão Geral

O Traefik é um reverse proxy moderno que automaticamente gerencia SSL/TLS via Let's Encrypt e roteia tráfego HTTP/HTTPS para os serviços do ecossistema.

### Principais Funcionalidades

✅ **SSL/TLS Automático** - Certificados Let's Encrypt  
✅ **Service Discovery** - Auto-detecta containers Docker  
✅ **Load Balancing** - Distribui carga entre instâncias  
✅ **Health Checks** - Monitora saúde dos backends  
✅ **Middlewares** - Segurança, compressão, rate limiting  
✅ **Métricas Prometheus** - Observabilidade completa  

---

## 🚀 Quick Start

### 1. Preparar Ambiente Local

```bash
# Adicionar domínios ao /etc/hosts (macOS/Linux)
make traefik-hosts

# Ou manualmente:
sudo nano /etc/hosts
# Adicionar:
127.0.0.1 revolucao-cibernetica.local
127.0.0.1 www.revolucao-cibernetica.local
127.0.0.1 traefik.revolucao-cibernetica.local
127.0.0.1 grafana.revolucao-cibernetica.local
127.0.0.1 prometheus.revolucao-cibernetica.local
127.0.0.1 ipfs.revolucao-cibernetica.local
127.0.0.1 whoami.revolucao-cibernetica.local
```

### 2. Iniciar Traefik

```bash
# Opção 1: Apenas Traefik
make traefik

# Opção 2: Todos os serviços (app + monitoring + traefik)
make all-services
```

### 3. Acessar Serviços

```bash
# Dashboard Traefik (HTTP - Desenvolvimento)
http://localhost:8090
# Login: admin / revolucao

# Dashboard Traefik (HTTPS - com autenticação)
https://traefik.revolucao-cibernetica.local
# Login: admin / revolucao

# Aplicação Principal
https://revolucao-cibernetica.local

# Monitoramento
https://grafana.revolucao-cibernetica.local
https://prometheus.revolucao-cibernetica.local

# IPFS Gateway
https://ipfs.revolucao-cibernetica.local

# Teste (whoami)
https://whoami.revolucao-cibernetica.local
```

---

## ⚙️ Configuração Local

### Estrutura de Arquivos

```
traefik/
├── traefik.yml          # Configuração estática
├── dynamic.yml          # Configuração dinâmica (routers, services)
├── letsencrypt/         # Certificados SSL
│   └── acme.json        # Storage Let's Encrypt (mode 600)
├── logs/                # Logs do Traefik
│   ├── traefik.log
│   └── access.log
└── .env.example         # Template de variáveis
```

### Configuração Básica

O Traefik usa **auto-discovery** via Docker labels. Exemplo:

```yaml
# docker-compose.yml
services:
  frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`revolucao-cibernetica.local`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.frontend.loadbalancer.server.port=3000"
```

### Entry Points

- **web (80)**: HTTP - Redireciona para HTTPS
- **websecure (443)**: HTTPS com TLS
- **traefik (8090)**: Dashboard e API (porta externa 8090 → interna 8080)

---

## 🌐 Configuração Produção

### 1. DNS e Domínio

```bash
# Configurar DNS A Records apontando para seu servidor:
revolucao-cibernetica.org          → IP_DO_SERVIDOR
*.revolucao-cibernetica.org        → IP_DO_SERVIDOR
```

### 2. Variáveis de Ambiente

```bash
# Copiar template
cp traefik/.env.example traefik/.env

# Editar variáveis
nano traefik/.env
```

```env
# traefik/.env
ACME_EMAIL=admin@revolucao-cibernetica.org
DOMAIN=revolucao-cibernetica.org
TZ=America/Sao_Paulo

# Para DNS Challenge (wildcards)
CF_API_EMAIL=your-email@cloudflare.com
CF_DNS_API_TOKEN=your-cloudflare-token
```

### 3. Certificados SSL

#### HTTP Challenge (Recomendado)

```yaml
# traefik/traefik.yml
certificatesResolvers:
  letsencrypt:
    acme:
      email: "admin@revolucao-cibernetica.org"
      storage: "/letsencrypt/acme.json"
      caServer: "https://acme-v02.api.letsencrypt.org/directory"
      httpChallenge:
        entryPoint: web
```

#### DNS Challenge (Para Wildcards)

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: "admin@revolucao-cibernetica.org"
      storage: "/letsencrypt/acme.json"
      dnsChallenge:
        provider: cloudflare
        resolvers:
          - "1.1.1.1:53"
          - "8.8.8.8:53"
```

Providers suportados: Cloudflare, AWS Route53, Google Cloud DNS, etc.

### 4. Firewall

```bash
# Abrir portas necessárias
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8090/tcp  # Dashboard (opcional, use VPN ou restrinja IP)
```

---

## 🏗️ Arquitetura

### Fluxo de Requisições

```
Internet → Traefik (80/443) → Service Discovery → Backend Service
                ↓
           Let's Encrypt
           Middlewares
           Load Balancing
```

### Componentes

#### 1. **Routers**
Definem regras de roteamento (Host, Path, Headers)

```yaml
routers:
  frontend:
    rule: "Host(`revolucao-cibernetica.local`)"
    service: frontend
    entryPoints:
      - websecure
```

#### 2. **Services**
Definem backends e load balancing

```yaml
services:
  frontend:
    loadBalancer:
      servers:
        - url: "http://revolucao-cibernetica-app:3000"
      healthCheck:
        path: /api/health
        interval: "10s"
```

#### 3. **Middlewares**
Transformam requisições/respostas

```yaml
middlewares:
  security-headers:
    headers:
      frameDeny: true
      contentTypeNosniff: true
      sslRedirect: true
      stsSeconds: 63072000
  
  rate-limit:
    rateLimit:
      average: 100
      burst: 50
```

---

## 🔧 Troubleshooting

### Certificados SSL não gerados

```bash
# Verificar logs
make traefik-logs

# Verificar acme.json
make traefik-certs

# Testar staging primeiro (evitar rate limit)
# traefik/traefik.yml
caServer: "https://acme-staging-v02.api.letsencrypt.org/directory"
```

### 502 Bad Gateway

```bash
# Verificar se backend está rodando
docker ps | grep revolucao-cibernetica

# Verificar health checks
docker inspect revolucao-cibernetica-app | grep Health

# Verificar logs do serviço
docker logs revolucao-cibernetica-app
```

### Dashboard não acessível

```bash
# Verificar se Traefik está rodando
docker ps | grep traefik

# Testar conectividade (HTTP)
curl http://localhost:8090/dashboard/

# Testar conectividade (HTTPS)
curl -k https://traefik.revolucao-cibernetica.local/

# Verificar /etc/hosts
cat /etc/hosts | grep revolucao-cibernetica
```

### Rate Limit atingido

```bash
# Ajustar em traefik/dynamic.yml
rate-limit:
  rateLimit:
    average: 200  # Aumentar de 100 para 200
    burst: 100    # Aumentar de 50 para 100
```

---

## 🔒 Segurança

### Headers de Segurança

Configurados automaticamente via middleware `security-headers`:

```yaml
headers:
  # HTTPS obrigatório
  sslRedirect: true
  forceSTSHeader: true
  stsSeconds: 63072000  # 2 anos
  stsPreload: true
  
  # Proteções XSS/Clickjacking
  frameDeny: true
  contentTypeNosniff: true
  browserXssFilter: true
  
  # Content Security Policy
  contentSecurityPolicy: "default-src 'self'"
  
  # Permissions Policy
  permissionsPolicy: "camera=(), microphone=(), geolocation=()"
```

### Autenticação Básica

```bash
# Gerar hash de senha
htpasswd -nb admin your-password

# Output:
admin:$apr1$H6uskkkW$IgXLP6ewTrSuBkTrqE8wj/

# Adicionar ao traefik/dynamic.yml
auth:
  basicAuth:
    users:
      - "admin:$apr1$H6uskkkW$IgXLP6ewTrSuBkTrqE8wj/"
```

### TLS Moderno

```yaml
tls:
  options:
    default:
      minVersion: VersionTLS12
      cipherSuites:
        - TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
        - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
        - TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305
```

### Rate Limiting

Protege contra DDoS e abuse:

```yaml
rate-limit:
  rateLimit:
    average: 100    # 100 req/s
    burst: 50       # Burst de 50
    period: 1s
```

### Circuit Breaker

Protege backends sobrecarregados:

```yaml
circuit-breaker:
  circuitBreaker:
    expression: "NetworkErrorRatio() > 0.5 || ResponseCodeRatio(500, 600, 0, 600) > 0.3"
```

---

## 📊 Monitoramento

### Métricas Prometheus

Traefik expõe métricas na porta interna 8080 (externa 8090):

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'traefik'
    static_configs:
      - targets: ['traefik:8080']  # Porta interna do container
    metrics_path: '/metrics'
```

**Métricas principais:**
- `traefik_entrypoint_requests_total`
- `traefik_entrypoint_request_duration_seconds`
- `traefik_service_requests_total`
- `traefik_service_request_duration_seconds`
- `traefik_service_server_up`
- `traefik_service_open_connections`

### Dashboard Grafana

Dashboard ID: **17346** (Traefik Official)

```bash
# Importar via Grafana UI:
# Dashboards → Import → ID: 17346
```

---

## 📚 Comandos Úteis

```bash
# Iniciar Traefik
make traefik

# Parar Traefik
make traefik-down

# Ver logs em tempo real
make traefik-logs

# Ver certificados SSL
make traefik-certs

# Adicionar domínios ao /etc/hosts
make traefik-hosts

# Iniciar tudo (app + monitoring + traefik)
make all-services

# Parar tudo
make all-services-down

# Status dos containers
docker ps | grep traefik

# Validar configuração
docker-compose -f docker-compose.traefik.yml config

# Recarregar configuração dinâmica (sem restart)
# Traefik detecta mudanças em dynamic.yml automaticamente!
```

---

## 🌐 URLs de Referência

- **Documentação Oficial**: https://doc.traefik.io/traefik/
- **Let's Encrypt**: https://letsencrypt.org/
- **SSL Labs Test**: https://www.ssllabs.com/ssltest/
- **Security Headers**: https://securityheaders.com/

---

## 🎓 Próximos Passos

1. ✅ **Testar localmente** com domínios `.local`
2. 🌐 **Configurar DNS** para produção
3. 🔐 **Habilitar certificados SSL** reais
4. 📊 **Importar dashboard Grafana** (ID: 17346)
5. 🚨 **Configurar alertas** no Prometheus
6. 🔒 **Revisar políticas de segurança**
7. 📈 **Monitorar métricas** e ajustar rate limits

---

**Desenvolvido com ❤️ pela Revolução Cibernética**
