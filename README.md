# 🐳 Control-M Workbench + Docker + VS Code

Integração completa do Control-M Workbench com Visual Studio Code, incluindo scripts de automação, snippets, tasks e extensão nativa.

---

## 🚀 Início Rápido (5 min)

```powershell
# 1. Verificar status
.\Workbench\scripts\workbench-manager.ps1 -Action Status

# 2. Abrir interface web
.\Workbench\scripts\workbench-manager.ps1 -Action Open

# 3. Criar primeiro job
.\Workbench\scripts\ctm-utils.ps1 -Action Create -JobName "MeuJob"
```

Para mais detalhes: [QUICK-START.md](./QUICK-START.md)

---

## 📁 Estrutura do Projeto

```
Workbench/
├── 📄 README.md                    # Este arquivo
├── 📄 QUICK-START.md               # Guia rápido de 5 minutos
│
├── 📁 scripts/                     # Scripts PowerShell
│   ├── workbench-manager.ps1      # Gerenciar container
│   ├── ctm-utils.ps1              # Criar, validar e deployar jobs
│   └── README.md                  # Documentação dos scripts
│
├── 📁 jobs/                        # Seus jobs Control-M
│   └── example-flow.json          # Exemplo de flow ETL
│
├── 📁 extension/                   # Extensão VS Code nativa
│   ├── 📄 package.json            # Metadados
│   ├── 📄 README.md               # Documentação técnica
│   ├── 📄 BUILD.md                # Build & publish
│   ├── 📄 tsconfig.json           # Config TypeScript
│   ├── src/                       # Código-fonte TypeScript
│   ├── snippets/                  # Code snippets
│   └── assets/                    # Ícones
│
└── 📁 docker-vscode-exemplo/      # Exemplo para referência
    ├── Dockerfile
    ├── docker-compose.yml
    └── README.md
```

---

## ⚙️ Configuração

### Container Workbench

- **Imagem**: controlm-workbench:9.19.200
- **Portas**: 7005 (web), 8443 (https)
- **Check**: `.\Workbench\scripts\workbench-manager.ps1 -Action Status`

### Extensões VS Code Necessárias

- Docker (ms-azuretools.vscode-docker)
- Dev Containers (ms-vscode-remote.remote-containers)
- WSL (ms-vscode-remote.remote-wsl)

### VS Code Configurado

- `.vscode/settings.json` - Configurações do workspace
- `.vscode/tasks.json` - Tasks automatizadas
- `.vscode/controlm.code-snippets` - Snippets para jobs

---

## 🔧 Scripts PowerShell

### workbench-manager.ps1 - Gerenciar Container

```powershell
# Status e informações
.\Workbench\scripts\workbench-manager.ps1 -Action Status      # Ver status
.\Workbench\scripts\workbench-manager.ps1 -Action Stats       # Ver métricas
.\Workbench\scripts\workbench-manager.ps1 -Action Info        # Ver detalhes

# Controle do container
.\Workbench\scripts\workbench-manager.ps1 -Action Start       # Iniciar
.\Workbench\scripts\workbench-manager.ps1 -Action Stop        # Parar
.\Workbench\scripts\workbench-manager.ps1 -Action Restart     # Reiniciar
.\Workbench\scripts\workbench-manager.ps1 -Action Unpause     # Despausar

# Acesso
.\Workbench\scripts\workbench-manager.ps1 -Action Open        # Abrir navegador
.\Workbench\scripts\workbench-manager.ps1 -Action Shell       # Acessar shell
.\Workbench\scripts\workbench-manager.ps1 -Action Logs        # Ver logs

# Backup
.\Workbench\scripts\workbench-manager.ps1 -Action Backup -BackupName "meu-backup"
```

### ctm-utils.ps1 - Gerenciar Jobs

```powershell
# Criar jobs
.\Workbench\scripts\ctm-utils.ps1 -Action Create -JobName "MeuJob"
.\Workbench\scripts\ctm-utils.ps1 -Action Create -JobName "JobETL" -TemplateName "flow"

# Validar
.\Workbench\scripts\ctm-utils.ps1 -Action Validate -JobFile "jobs\meu-job.json"

# Build
.\Workbench\scripts\ctm-utils.ps1 -Action Build -JobFile "jobs\meu-job.json"

# Deploy
.\Workbench\scripts\ctm-utils.ps1 -Action Deploy -JobFile "jobs\meu-job.json"

# Executar
.\Workbench\scripts\ctm-utils.ps1 -Action Run -JobFile "jobs\meu-job.json"

# Templates disponíveis
.\Workbench\scripts\ctm-utils.ps1 -Action Template
```

---

## 🎨 VS Code Tasks & Snippets

### Tasks Disponíveis

Pressione `Ctrl + Shift + P` → "Run Task":

- **Workbench**: Abrir, Status, Logs, Restart, Stop, Start, Shell, Backup, Métricas
- **Control-M**: Deploy Job, Build Job

### Code Snippets

Digite no arquivo `.json` + `Ctrl + Space`:

- `ctm-job` - Job simples
- `ctm-job-schedule` - Job agendado
- `ctm-flow` - Flow com dependências
- `ctm-job-script` - Job que executa script
- `ctm-job-notify` - Job com notificações
- `ctm-docker-job` - Job Docker
- `ctm-connection` - Connection profile

---

## 🆕 Extensão VS Code Nativa

Extensão TypeScript para automação completa direto do VS Code.

### Começar com a Extensão

```powershell
# 1. Instalar e compilar
cd Workbench\extension
npm install
npm run esbuild

# 2. Testar (Debug em VS Code)
code .
# Pressione F5 para debug
```

### Recursos da Extensão

- **14 Comandos** para gerenciar Workbench e jobs
- **3 Tree Views** para navegação e status em tempo real
- **Status Bar** com indicador
- **3 Snippets** para criar jobs rapidamente
- **6 Configurações** customizáveis

### Comandos da Extensão

Pressione `Ctrl + Shift + P` → "Control-M":

**Workbench**: Status, Start, Stop, Restart, Unpause, Open, Logs, Backup

**Jobs**: Create, Deploy, Validate, Run, Delete

---

## 📚 Exemplos Práticos

### Exemplo 1: Criar e Deployar um Job

```powershell
# 1. Criar
.\Workbench\scripts\ctm-utils.ps1 -Action Create -JobName "BackupDiario"

# 2. Editar no VS Code (abre automaticamente)

# 3. Validar
.\Workbench\scripts\ctm-utils.ps1 -Action Validate -JobFile "jobs\BackupDiario.json"

# 4. Deploy
.\Workbench\scripts\ctm-utils.ps1 -Action Deploy -JobFile "jobs\BackupDiario.json"

# 5. Ver logs
.\Workbench\scripts\workbench-manager.ps1 -Action Logs
```

### Exemplo 2: Testar o Flow de Exemplo

```powershell
# Deploy do exemplo
.\Workbench\scripts\ctm-utils.ps1 -Action Deploy -JobFile "Workbench\jobs\example-flow.json"

# Acompanhar execução
.\Workbench\scripts\workbench-manager.ps1 -Action Logs

# Ver na interface web
.\Workbench\scripts\workbench-manager.ps1 -Action Open
```

### Exemplo 3: Backup Antes de Mudanças

```powershell
# Criar backup
.\Workbench\scripts\workbench-manager.ps1 -Action Backup -BackupName "before-prod"

# Fazer mudanças...
.\Workbench\scripts\ctm-utils.ps1 -Action Deploy -JobFile "jobs\production-flow.json"

# Ver backups
docker images | Select-String "workbench-backup"
```

---

## 🌐 Acesso ao Workbench

### Interface Web

- **Principal**: https://localhost:8443/automation-api/startHere.html
- **API REST**: https://localhost:8443/automation-api

### Credenciais Padrão

```
Usuário: workbench
Senha: workbench
```

---

## 🛠️ Comandos Docker Úteis

```powershell
# Ver containers
docker ps

# Logs do Workbench
docker logs -f workbench

# Acessar shell
docker exec -it workbench bash

# Ver métricas
docker stats workbench --no-stream

# Parar/Iniciar
docker stop workbench
docker start workbench

# Informações do container
docker inspect workbench
```

---

## 🆘 Solução de Problemas

### Workbench não inicia

```powershell
# Ver logs
docker logs workbench

# Reiniciar
.\Workbench\scripts\workbench-manager.ps1 -Action Restart
```

### Porta em uso

```powershell
# Ver o que usa porta 7005
Get-NetTCPConnection -LocalPort 7005
```

### Script não executa

```powershell
# Permitir execução (PowerShell como Admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Docker não responde

```powershell
# Reiniciar Docker
Restart-Service -Name "com.docker.service" -Force
```

---

## 📚 Recursos Externos

- [Documentação Control-M](https://docs.bmc.com/docs/automation-api/monthly)
- [Control-M Workbench](https://docs.bmc.com/docs/workbench/)
- [Docker Documentation](https://docs.docker.com/)
- [VS Code Docker Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)

---

## 🎓 Próximos Passos

1. Leia o [QUICK-START.md](./QUICK-START.md)
2. Teste os scripts
3. Explore a interface web
4. Crie seus próprios jobs
5. Configure agendamentos
6. Integre com seus sistemas

---

**Versão**: 1.0  
**Workbench**: 9.19.200  
**Ambiente**: Windows 10 + Docker Desktop + VS Code  
**Status**: ✅ Totalmente funcional
