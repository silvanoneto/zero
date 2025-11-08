# Sugestão de Commit Message

```bash
git add .
git commit -m "feat: GitHub Pages deploy com localStorage para modo demo

- Configurado GitHub Actions workflow para build e deploy automático
- Adaptado Next.js para exportação estática com DEMO_MODE
- Implementado LocalStorageAdapter para substituir blockchain/IPFS
- Criados hooks adaptados (useProposals, useCreateProposal)
- Adicionadas 3 propostas demo pré-carregadas
- Documentação completa em GITHUB_PAGES.md

O frontend agora pode ser acessado via GitHub Pages com:
✅ Interface totalmente funcional
✅ Criar e visualizar propostas
✅ Dados persistem no navegador (localStorage)
✅ Deploy automático ao fazer push

Arquivos criados:
- frontend/src/hooks/useLocalStorage.ts
- frontend/.env.production
- GITHUB_PAGES.md
- frontend/GITHUB_PAGES_DEPLOY.md
- test-gh-pages-build.sh
- SETUP_GITHUB_PAGES_SUMMARY.md

Arquivos modificados:
- .github/workflows/gh-pages.yml
- frontend/next.config.mjs
- frontend/package.json
- frontend/.env.local.example
- frontend/src/hooks/useProposals.ts
- frontend/src/hooks/useCreateProposal.ts"
```

## Próximos Comandos

```bash
# Ver status
git status

# Fazer commit
git add .
git commit -m "feat: GitHub Pages deploy com localStorage para modo demo"

# Push para trigger o deploy
git push origin main

# Acompanhar deploy
# Vá em: https://github.com/<seu-usuario>/revolucao-cibernetica/actions

# Após ~5-10 minutos, acesse:
# https://<seu-usuario>.github.io/revolucao-cibernetica/
```
