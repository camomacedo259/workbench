# 🚀 Build e Deploy da Extensão

## Pré-requisitos

- Node.js 14+
- npm 6+
- VS Code 1.70+

```bash
node --version   # v14.0.0 ou superior
npm --version    # 6.0.0 ou superior
```

---

## 📦 Instalação de Dependências

```bash
cd Workbench/extension
npm install
```

---

## 🔨 Build

### Build para Desenvolvimento

```bash
npm run esbuild
```

Gera `dist/extension.js`

### Build com Watch Mode

```bash
npm run esbuild-watch
```

Recompila automaticamente ao salvar

### Build para Produção

```bash
npm run esbuild-prod
```

Minificado e otimizado

---

## 📝 Compilação TypeScript

```bash
npm run compile     # Compilar uma vez
npm run watch       # Watch mode
```

Gera `out/` com `.js` e `.map`

---

## 🧪 Testes e Lint

```bash
npm run lint        # ESLint
npm run test        # Testes Mocha
```

---

## 🎁 Empacotar Extensão

### Usando VSCE

1. Instalar `vsce`:

```bash
npm install -g vsce
```

2. Empacotar:

```bash
cd Workbench/extension
vsce package
```

Gera: `control-m-workbench-manager-1.0.0.vsix`

3. Instalar localmente:

```bash
code --install-extension control-m-workbench-manager-1.0.0.vsix
```

---

## 🌐 Publicar no Marketplace

### Criar Publisher Account

1. Ir a https://marketplace.visualstudio.com/
2. Criar conta Microsoft
3. Adicionar novo publisher

### Publicar

```bash
vsce publish -p <PAT>
```

Ou interativo:

```bash
vsce publish
```

---

## 📁 Estrutura de Arquivos

```
extension/
├── src/                        # Código-fonte TypeScript
│   ├── extension.ts           # Ponto de entrada
│   ├── commands/              # Comandos
│   │   ├── workbench.ts
│   │   └── jobs.ts
│   ├── providers/             # Tree data providers
│   │   ├── statusProvider.ts
│   │   └── jobsTree.ts
│   └── ui/                    # UI Components
│       └── statusBar.ts
├── dist/                      # Output build (esbuild)
├── out/                       # Output compiler (tsc)
├── snippets/                  # Code snippets
│   └── control-m.json
├── assets/                    # Ícones
│   ├── icon.png
│   └── icon.svg
├── package.json               # Metadados
├── tsconfig.json              # Config TypeScript
├── .gitignore
└── README.md
```

---

## 🔑 Variáveis de Ambiente

Configure no `package.json` se necessário:

```json
{
  "publisher": "SeuNome",
  "name": "control-m-workbench-manager",
  "version": "1.0.0"
}
```

---

## 🐛 Debug

### 1. Abrir pasta da extensão no VS Code

```bash
code Workbench/extension
```

### 2. Pressionar F5 ou Menu: Run → Start Debugging

Abre nova janela VS Code com a extensão carregada

### 3. Usar Console de Debug (`Ctrl + ~`)

### 4. Breakpoints no código TypeScript

---

## 📋 Checklist de Release

- [ ] Atualizar versão em `package.json`
- [ ] Atualizar `CHANGELOG.md`
- [ ] Passar testes: `npm test`
- [ ] Lint OK: `npm run lint`
- [ ] Build OK: `npm run esbuild-prod`
- [ ] Atualizar `README.md`
- [ ] Tag git: `git tag v1.0.0`
- [ ] Empacotar: `vsce package`
- [ ] Publicar: `vsce publish`

---

## 🔗 Recursos

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Publishing Extensions](https://code.visualstudio.com/docs/extensions/publish-extension)
- [VSCE Documentation](https://github.com/microsoft/vscode-vsce)
