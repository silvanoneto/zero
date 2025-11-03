# Helia Gateway - Constituição 2.0

Serviço de gateway Helia para armazenamento descentralizado de propostas e documentos da governança.

## 🎯 Funcionalidades

- ✅ Upload de arquivos para Helia
- ✅ Armazenamento descentralizado
- ✅ Retrieval via HTTP gateway
- ✅ Metadata extraction
- ✅ Rate limiting
- ✅ Authentication (opcional)

## 📦 Instalação

```bash
cd helia-gateway
npm install
```

## ⚙️ Configuração

Crie um arquivo `.env`:

```env
# Helia Configuration
HELIA_GATEWAY_URL=http://127.0.0.1:8080

# Server Configuration
PORT=8080
NODE_ENV=development

# API Keys (opcional)
API_KEY_ENABLED=false
API_KEY_SECRET=your-secret-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Pinning Service (opcional - Pinata, Web3.Storage, etc.)
PINATA_API_KEY=
PINATA_SECRET_KEY=
```

## 🚀 Executar

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm start
```

## 📡 API Endpoints

### Upload File

```http
POST /api/upload
Content-Type: multipart/form-data

file: <file>
```

**Response:**
```json
{
  "success": true,
  "cid": "QmXxxx...",
  "url": "http://localhost:8080/ipfs/QmXxxx...",
  "size": 12345,
  "type": "application/pdf"
}
```

### Upload JSON

```http
POST /api/upload/json
Content-Type: application/json

{
  "title": "Proposal Title",
  "description": "Long description...",
  "author": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "cid": "QmYyyy...",
  "url": "http://localhost:8080/ipfs/QmYyyy...",
  "data": {...}
}
```

### Get Content

```http
GET /ipfs/:cid
```

### Pin Content

```http
POST /api/pin/:cid
```

**Response:**
```json
{
  "success": true,
  "cid": "QmZzzz...",
  "pinned": true
}
```

### Unpin Content

```http
DELETE /api/pin/:cid
```

### List Pins

```http
GET /api/pins
```

**Response:**
```json
{
  "success": true,
  "pins": [
    {
      "cid": "QmXxxx...",
      "size": 12345,
      "timestamp": 1234567890
    }
  ]
}
```

## 🔐 Autenticação (Opcional)

Se `API_KEY_ENABLED=true`, inclua header:

```http
X-API-Key: your-api-key
```

## 📊 Rate Limiting

- Janela: 15 minutos (configurável)
- Limite: 100 requests (configurável)
- Headers de resposta:
  - `X-RateLimit-Limit`: Limite total
  - `X-RateLimit-Remaining`: Requests restantes
  - `X-RateLimit-Reset`: Timestamp de reset

## 🐳 Docker

```bash
# Build
docker build -t ipfs-gateway .

# Run
docker run -p 8080:8080 --env-file .env ipfs-gateway
```

### Docker Compose

```bash
docker-compose up -d
```

## 🧪 Testes

```bash
npm test
```

### Exemplos de Teste

```bash
# Upload file
curl -X POST -F "file=@proposal.pdf" http://localhost:8080/api/upload

# Upload JSON
curl -X POST -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test proposal"}' \
  http://localhost:8080/api/upload/json

# Get content
curl http://localhost:8080/ipfs/QmXxxx...

# Pin content
curl -X POST http://localhost:8080/api/pin/QmXxxx...
```

## 📈 Monitoramento

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "ipfs": "connected",
  "uptime": 12345,
  "version": "1.0.0"
}
```

### Stats

```http
GET /api/stats
```

**Response:**
```json
{
  "totalPins": 42,
  "totalSize": 1234567,
  "requests24h": 150
}
```

## 🔧 Troubleshooting

### IPFS não conecta

```bash
# Verificar se IPFS daemon está rodando
ipfs daemon

# Ou via Docker
docker run -d -p 4001:4001 -p 5001:5001 -p 8080:8080 ipfs/go-ipfs
```

### Erro de permissão

```bash
# Dar permissão de escrita
chmod -R 755 ./data
```

### Rate limit atingido

Ajuste as configurações no `.env`:
```env
RATE_LIMIT_WINDOW_MS=1800000  # 30 min
RATE_LIMIT_MAX_REQUESTS=200    # 200 requests
```

## 🌐 Deploy em Produção

### Opções de Hosting

1. **Self-hosted** (VPS/Cloud)
   - AWS EC2
   - DigitalOcean Droplet
   - Heroku
   - Railway

2. **Pinning Services** (Managed)
   - [Pinata](https://pinata.cloud) - API
   - [Web3.Storage](https://web3.storage) - Free tier
   - [Infura IPFS](https://infura.io/product/ipfs) - Scalable
   - [Fleek](https://fleek.co) - Automated

### Configuração para Produção

```env
NODE_ENV=production
PORT=80
IPFS_API_URL=/dns4/ipfs.infura.io/tcp/5001/https
PINATA_API_KEY=your-api-key
PINATA_SECRET_KEY=your-secret
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name ipfs.your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📄 Licença

MIT
