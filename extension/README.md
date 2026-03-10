# Control-M Workbench Manager - Extensão VS Code

Extensão para gerenciar o Container Workbench e Deploy de Jobs diretamente do VS Code.

📖 Documentação completa no repositório do projeto | ⚡ Quick Start incluído no pacote principal

## 🚀 Instalação

## ✅ Pré-requisitos

Antes de instalar e usar a extensão no VS Code, garanta:

1. **VS Code** versão `1.70` ou superior
2. **Runtime de container** instalado:

- **Docker Desktop**

3. Docker Desktop em execução.

4. A imagem do Workbench deve ser carregada pela própria extensão (comando **Setup Docker Image do Workbench**) usando o arquivo empacotado dentro da extensão.
5. O `ctm-cli` pode ser usado em modo offline pelo pacote embutido da extensão (`assets/tools/ctm-cli.tgz`).

6. Porta/local de acesso liberado para abrir a interface:

- `https://localhost:8443/automation-api/startHere.html`

Observações:

- A extensão usa somente Docker.
- Para a imagem, use o comando **Setup Docker Image do Workbench** para evitar configuração manual.

### Desenvolvimento

```bash
cd extension
npm install
npm run esbuild
```

### Como Extensão Instalada

1. Abra VS Code
2. Pressione `Ctrl + Shift + X`
3. Busque: "Control-M Workbench Manager"
4. Clique em "Install"

## 🧭 Primeiro Uso (Passo a Passo)

1. Abra um workspace/pasta de projeto no VS Code.
2. Confirme que o Docker Desktop está aberto e respondendo.
3. Abra a Command Palette (`Ctrl + Shift + P`) e execute `Control-M: Setup Docker Image do Workbench`.
4. Aguarde o carregamento da imagem empacotada.
5. Execute `Control-M: Ver Status do Workbench` para validar o runtime.
6. Execute `Control-M: Iniciar Workbench`.
7. Execute `Control-M: Abrir Workbench` para abrir `https://localhost:8443/automation-api/startHere.html`.
8. (Opcional) No painel lateral `Control-M`, use os atalhos rápidos: `Logs`, `Reiniciar`, `Backup`.
9. Para jobs, abra/crie a pasta de jobs (`./Workbench/jobs`) e use `Control-M: Criar Novo Job`.
10. Valide e publique jobs com `Control-M: Validar Job` e `Control-M: Deploy Job`.
11. Use `Control-M: Abrir Deploy na Web` para abrir a URL de deploy da Automation API.

Fluxo recomendado no dia a dia:

1. `Ver Status`
2. `Iniciar Workbench`
3. `Abrir Workbench`
4. `Validar Job`
5. `Deploy Job`

---

## 📋 Funcionalidades

### Gerenciamento do Workbench

- **Status** - Ver status do container
- **Iniciar/Parar/Reiniciar** - Controlar o container
- **Abrir** - Abre a interface web em `https://localhost:8443/automation-api/startHere.html`
- **Logs** - Ver logs em tempo real
- **Backup** - Criar backup do container
- **Despausar** - Se container estiver pausado

### Gerenciamento de Jobs

- **Criar Job** - Cria novo job com template
- **Validar Job** - Valida JSON do job
- **Deploy Job** - Faz deploy do job para o Workbench
- **Abrir Deploy na Web** - Abre `https://localhost:8443/automation-api`
- **Build Job** - Build do job
- **Executar Job** - Executa o job

### Tree Views

- **Workbench Status** - Status e ações rápidas do container
- **Jobs** - Lista de jobs e ações
- **Atalhos** - Comandos rápidos

### Status Bar

Mostra status do Workbench na barra inferior (clique para atualizar)

### Imagem Docker Empacotada

- **Setup Docker Image do Workbench** - Carrega imagem empacotada (`assets/docker/*.tar`, `*.tar.gz`, `*.tar.xz` ou `*.xz`)
- Se não encontrar arquivo empacotado, o comando falha com erro (modo offline, sem pull)

---

## ⚙️ Configurações

Acesse: `File` → `Preferences` → `Settings` → `Control-M Workbench`

- `containerName` - Nome do container Docker (default: `workbench`)
- `imageName` - Nome da imagem Docker (default: `controlm-workbench:9.19.200`)
- `bundledImageRelativePath` - Caminho relativo do tar/tar.gz na extensão
- `bundledCtmCliRelativePath` - Caminho relativo do pacote `ctm-cli.tgz` na extensão
- `automationApiUrl` - URL base da Automation API (default: `https://localhost:8443/automation-api`)
- `scriptPath` - Caminho dos scripts (default: `./Workbench/scripts`)
- `jobsPath` - Caminho dos jobs (default: `./Workbench/jobs`)
- `autoRefresh` - Atualizar automaticamente (default: `true`)
- `refreshInterval` - Intervalo de atualização em ms (default: `30000`)

---

## 🎯 Atalhos de Teclado

Configure em `Ctrl + K, Ctrl + S`:

```json
[
  {
    "key": "ctrl+shift+w",
    "command": "ctm-workbench.open"
  },
  {
    "key": "ctrl+shift+l",
    "command": "ctm-workbench.logs"
  },
  {
    "key": "ctrl+shift+d",
    "command": "ctm-job.deploy"
  }
]
```

---

## 📦 Estrutura do Projeto

```
extension/
├── package.json              # Metadados da extensão
├── tsconfig.json            # Configuração TypeScript
├── src/
│   ├── extension.ts        # Ponto de entrada principal
│   ├── commands/
│   │   ├── workbench.ts    # Comandos do Workbench
│   │   └── jobs.ts         # Comandos de Jobs
│   ├── providers/
│   │   ├── statusProvider.ts   # Tree view do status
│   │   └── jobsTree.ts         # Tree view de jobs
│   └── ui/
│       └── statusBar.ts    # Gerenciador da status bar
├── snippets/
│   └── control-m.json      # Snippets para jobs
└── assets/
    ├── icon.png            # Ícone principal
    └── icon.svg            # Ícone SVG
```

---

## 🔧 Desenvolvimento

### Compilar

```bash
npm run compile      # Compilar uma vez
npm run watch       # Watch mode
npm run esbuild     # Build com esbuild
```

### Test

```bash
npm test
```

### Lint

```bash
npm run lint
```

---

## 📝 Snippets JSON

Digite nos arquivos JSON da pasta jobs:

- `ctm-job` - Job simples
- `ctm-job-schedule` - Job agendado
- `ctm-flow` - Flow com dependências

---

## 🐛 Solução de Problemas

### Extensão não aparece

1. Verificar se o VS Code versão 1.70+
2. Recarregar janela: `Ctrl + Shift + P` → "Reload Window"

### Comandos não funcionam

1. Abrir Command Palette: `Ctrl + Shift + P`
2. Executar: "Control-M: Ver Status"

### Tree views vazias

1. Verificar se workspace está aberto
2. Criar a pasta de jobs: `./Workbench/jobs`

---

## 📚 Recursos

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Control-M Docs](https://docs.bmc.com/docs/automation-api/monthly)

---

## 📄 Licença

Veja `LICENSE` neste pacote da extensão.

---

**Versão**: 1.0.11  
**Criado**: março 2026  
**Ambiente**: VS Code 1.70+ | Windows 10/11 | Docker Desktop
