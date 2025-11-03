# ✅ Checklist de Deploy GitHub Pages

## Antes do Push

- [ ] Revisar mudanças nos arquivos
- [ ] Verificar se não há erros de TypeScript
- [ ] (Opcional) Testar build localmente: `./test-gh-pages-build.sh`
- [ ] (Opcional) Servir localmente: `cd frontend && npx serve out`
- [ ] Verificar `.env.production` está com `NEXT_PUBLIC_DEMO_MODE=true`

## Configuração GitHub (Uma única vez)

- [ ] Ativar GitHub Pages no repositório
  - Settings → Pages
  - Source: Deploy from a branch
  - Branch: `gh-pages`
  - Path: `/` (root)
  - Save

- [ ] Configurar permissões do workflow
  - Settings → Actions → General
  - Workflow permissions: "Read and write permissions"
  - ✓ "Allow GitHub Actions to create and approve pull requests"

## Deploy

- [ ] Commit e push:
  ```bash
  git add .
  git commit -m "feat: GitHub Pages deploy com localStorage para modo demo"
  git push origin main
  ```

- [ ] Acompanhar workflow
  - Ir em: https://github.com/SEU-USUARIO/revolucao-cibernetica/actions
  - Esperar conclusão (~5-10 minutos)
  - Verificar se todas as etapas passaram ✅

## Pós-Deploy

- [ ] Aguardar GitHub Pages processar (mais 2-5 min)
- [ ] Acessar URL: https://SEU-USUARIO.github.io/revolucao-cibernetica/
- [ ] Verificar se página carrega
- [ ] Verificar se propostas demo aparecem
- [ ] Testar criar nova proposta
- [ ] Recarregar página e verificar persistência
- [ ] Testar em aba anônima/privada
- [ ] Testar em mobile

## Troubleshooting

### Site não carrega (404)
- [ ] Verificar se workflow completou com sucesso
- [ ] Confirmar que GitHub Pages está ativo (Settings → Pages)
- [ ] Aguardar mais alguns minutos
- [ ] Verificar se branch `gh-pages` foi criado
- [ ] Limpar cache do navegador (Ctrl+Shift+R)

### Erros no workflow
- [ ] Ver logs detalhados em Actions
- [ ] Verificar se Node.js 18+ está disponível
- [ ] Confirmar que `frontend/package.json` existe
- [ ] Verificar se `npm ci` funcionou

### Propostas não aparecem
- [ ] Abrir DevTools (F12) → Console
- [ ] Verificar erros de JavaScript
- [ ] Verificar se localStorage está habilitado
- [ ] Tentar limpar localStorage:
  ```javascript
  localStorage.clear()
  location.reload()
  ```

### Build falha localmente
- [ ] Verificar versão do Node.js: `node --version` (deve ser 18+)
- [ ] Limpar cache: `cd frontend && rm -rf .next node_modules`
- [ ] Reinstalar: `npm install`
- [ ] Tentar build novamente: `npm run build`

## Validação Final

- [ ] ✅ Frontend carrega sem erros
- [ ] ✅ 3 propostas demo visíveis
- [ ] ✅ Pode criar nova proposta
- [ ] ✅ Dados persistem após reload
- [ ] ✅ Interface responsiva (mobile)
- [ ] ✅ Console sem erros críticos
- [ ] ✅ localStorage funcionando

## Documentação

- [ ] Ler `GITHUB_PAGES.md` para guia de uso
- [ ] Ler `frontend/GITHUB_PAGES_DEPLOY.md` para detalhes técnicos
- [ ] Compartilhar URL do GitHub Pages com equipe
- [ ] (Opcional) Adicionar URL no README.md

## Próximos Passos (Opcional)

- [ ] Customizar URL com domínio próprio (CNAME)
- [ ] Adicionar Google Analytics
- [ ] Implementar mais funcionalidades demo
- [ ] Adicionar testes automatizados
- [ ] Melhorar SEO e meta tags

---

## 🎉 Parabéns!

Se todos os itens estão marcados, seu frontend está no ar via GitHub Pages! 

**URL:** https://SEU-USUARIO.github.io/revolucao-cibernetica/

Compartilhe com o mundo! 🌍
