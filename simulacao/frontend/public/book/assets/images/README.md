# 🎨 Imagens - Revolução Cibernética

## 📁 Estrutura de Diretórios

```
assets/images/
├── capa-revolucao-cibernetica.png  ← IMAGEM DA CAPA (loading overlay)
├── favicon.ico
└── ... (outras imagens)
```

## 🌀 Capa para Loading Overlay

### Arquivo Necessário
**Nome**: `capa-revolucao-cibernetica.png`
**Localização**: `/assets/images/capa-revolucao-cibernetica.png`

### Especificações Recomendadas
- **Formato**: PNG (com transparência) ou JPG
- **Resolução**: 1200x1600px (proporção 3:4) ou similar
- **Tamanho**: < 500KB (otimizado para web)
- **Conteúdo**: Imagem da capa com elementos visuais cibernéticos

### Design Atual
A imagem fornecida mostra:
- Silhuetas humanas em wireframe roxo/azul
- Triângulos geométricos sobrepondo
- Raios/relâmpagos no fundo
- Estética cyberpunk/sci-fi
- Paleta de cores: roxo, azul ciano, preto

### Como Adicionar
1. Salvar a imagem como `capa-revolucao-cibernetica.png`
2. Colocar em `/assets/images/`
3. O loading overlay irá carregar automaticamente

### Alternativa (temporário)
Se a imagem não estiver disponível, o código usa um fallback e o loading ainda funcionará.

## 🔧 Uso no Código

O loading overlay usa esta imagem em:
```javascript
// assets/scripts/loading-overlay.js
coverImage: 'assets/images/capa-revolucao-cibernetica.png'
```

E renderiza ela de duas formas:
1. **Backdrop desfocado**: `filter: blur(60px)` - fundo desfocado
2. **Imagem principal**: com efeitos de glow e shadow

## 📐 CSS Aplicado

```css
.loading-cover {
    filter: drop-shadow(0 0 40px rgba(138, 43, 226, 0.6));
    animation: pulse 3s ease-in-out infinite;
}

.loading-backdrop {
    filter: blur(60px);
    opacity: 0.15;
}
```

## ✨ Efeitos Visuais
- Glow roxo pulsante
- Sombra luminosa
- Fundo desfocado da mesma imagem
- Animação de fade-in ao carregar
- Fade-out suave ao concluir

---

**Nota**: Esta imagem é crítica para a experiência de carregamento!
