# 🔄 Live Reload - Guia Rápido

## O que é?

Live reload permite que você veja mudanças no código **instantaneamente** no browser, sem precisar apertar F5 ou recompilar manualmente.

## Como usar?

### 1. Inicie o ambiente de desenvolvimento

```bash
make dev
# ou: npm run dev
# ou: ./dev.sh
```

### 2. Acesse o projeto

- **Local:** http://localhost:8000/riz∅ma.html
- **Rede local:** http://192.168.15.5:8000/riz∅ma.html
- **Painel de controle:** http://localhost:3001

### 3. Edite e veja as mudanças

1. Edite qualquer arquivo:
   - `src/*.ts` (TypeScript)
   - `*.html` (HTML)
   - `*.css` (Estilos)
   - `assets/*` (JSON, imagens, áudio)

2. Salve o arquivo (Cmd+S / Ctrl+S)

3. **Browser atualiza automaticamente!** 🎉

## O que acontece por trás?

```
┌─────────────────────────────────────────────────────┐
│  1. Você edita src/riz∅ma-full.ts                   │
│  2. TypeScript detecta mudança                       │
│  3. Recompila para dist/riz∅ma-full.js               │
│  4. Browser-sync detecta mudança em dist/            │
│  5. Injeta mudanças no browser (sem reload!)         │
│     ou recarrega a página (se necessário)            │
└─────────────────────────────────────────────────────┘
```

## Arquivos monitorados

- `dist/**/*.js` (JavaScript compilado)
- `*.html` (Páginas HTML)
- `*.css` (Estilos)
- `assets/**/*` (Assets: JSON, áudio, etc.)

## Painel de controle (Browser-sync UI)

Acesse **http://localhost:3001** para:

- Ver quais dispositivos estão conectados
- Sincronizar scroll entre dispositivos
- Sincronizar cliques e formulários
- Ver histórico de mudanças
- Ajustar configurações

## Testar em outros dispositivos

O browser-sync expõe o servidor na rede local:

1. No celular/tablet, conecte na mesma rede Wi-Fi
2. Acesse: http://192.168.15.5:8000/riz∅ma.html
3. Edite código no computador
4. **Veja mudanças no celular automaticamente!**

## Comandos úteis

```bash
make dev       # Inicia ambiente com live reload
make stop      # Para todos os servidores
make status    # Verifica se está rodando
make logs      # Mostra logs em tempo real
```

## Troubleshooting

### Browser não atualiza?

1. Verifique se há erros de compilação TypeScript
2. Limpe cache do browser (Cmd+Shift+R / Ctrl+Shift+F5)
3. Verifique console do browser (F12)

### Porta 8000 já em uso?

```bash
make stop      # Para processo na porta 8000
make dev       # Inicia novamente
```

### Ver logs de compilação?

```bash
tail -f .dev-server.log
# ou: make logs
```

## Performance

- **Recompilação TypeScript:** ~100-500ms
- **Detecção de mudança:** Instantâneo
- **Injeção no browser:** ~50-200ms
- **Reload completo (se necessário):** ~500ms

## Diferença vs servidor HTTP simples

| Recurso | `make server` | `make dev` |
|---------|---------------|------------|
| Serve arquivos | ✅ | ✅ |
| Compila TypeScript | ❌ | ✅ (watch) |
| Live reload | ❌ | ✅ |
| Sincronização multi-device | ❌ | ✅ |
| Painel de controle | ❌ | ✅ |
| Hot module replacement | ❌ | ⚠️ (parcial) |

