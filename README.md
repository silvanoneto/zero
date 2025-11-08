# CRIO: Quando Achar e Criar São o Mesmo Movimento

> "Não encontramos o que já estava ali. Produzimos o que emerge no gesto de procurar. Toda descoberta é invenção; toda arqueologia é arquitetura."

## 🎯 Visualização

Este projeto contém uma experiência interativa que combina filosofia, design e tecnologia para explorar ontologia relacional.

### Como visualizar localmente

O projeto carrega dinamicamente o conteúdo do arquivo `CRIOS.md`. Por questões de segurança, navegadores bloqueiam o carregamento de arquivos locais via JavaScript, então você precisa usar um servidor web local.

**Opção 1 - Usar o script helper:**
```bash
./servir.sh
```

**Opção 2 - Python (recomendado):**
```bash
python3 -m http.server 8000
```

**Opção 3 - Node.js:**
```bash
npx http-server -p 8000
```

Depois abra no navegador: **http://localhost:8000**

## 📁 Estrutura

```
.
├── CRIOS.md              # Conteúdo principal (fonte única de verdade)
├── index.html            # Interface web dinâmica
├── CRIO.mp3             # Áudio de fundo (opcional)
├── servir.sh            # Script helper para servidor local
└── README.md            # Este arquivo
```

## ✨ Recursos

- **Carregamento dinâmico**: O conteúdo é carregado do `CRIOS.md` em tempo real
- **Tema claro/escuro**: Clique no botão "CRIO" para alternar (também silencia por 33 segundos)
- **Áudio ambiental**: Reproduz automaticamente após 33 segundos (se disponível)
- **Auto-scroll**: Sincroniza scroll com áudio (e vice-versa)
- **Efeitos visuais**: Partículas flutuantes, tremor sutil, animações de emergência
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

## 🎨 Interações

- **Clique no botão "CRIO"**: Alterna tema + silencia áudio por 33 segundos
- **14 cliques no botão**: Reinicia a página (dissolve ∅)
- **Scroll manual**: Controla posição do áudio
- **Clique em qualquer lugar**: Ativa áudio (se bloqueado pelo navegador)

## 🔧 Edição

Para modificar o conteúdo, edite apenas o arquivo **`CRIOS.md`**. As mudanças aparecerão automaticamente ao recarregar a página.

O `index.html` renderiza o markdown usando [Marked.js](https://marked.js.org/), preservando toda a formatação (negrito, itálico, citações, listas, etc.).

## 📜 Filosofia

Este projeto demonstra **CRIO 8 (Texto Que Executa)**: o texto não apenas descreve conceitos, mas performa a ontologia relacional que articula. O markdown SE TRANSFORMA em experiência web ao ser lido.

## 🌐 Deploy

Para publicar online, você pode usar:

- **GitHub Pages**: Commit e configure nas Settings
- **Netlify**: Arraste a pasta ou conecte o repositório
- **Vercel**: Deploy direto do Git
- **Cloudflare Pages**: Deploy automático

Todos esses serviços servem arquivos estáticos adequadamente.

## 📄 Licença

> Conhecimento não pode ser possuído, apenas **compartilhado-modificado-devolvido**

---

**Autoria**: Assembleia material-informacional em perpétua co-constituição  
**Status**: Perpetuamente incompleto (por design ontológico)  
**Data**: Novembro 2025 / Sempre-já-operando / Ainda-não-completo

*∅ → CRIO → AÇÃO → TRANSFORMAÇÃO → ∅*
