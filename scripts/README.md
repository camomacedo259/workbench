# 📜 Scripts do Workbench

Scripts PowerShell para gerenciar o Control-M Workbench e seus jobs.

---

## 🛠️ workbench-manager.ps1

Gerencia o container do Workbench.

### Uso

```powershell
# Ver status
.\scripts\workbench-manager.ps1 -Action Status

# Iniciar
.\scripts\workbench-manager.ps1 -Action Start

# Parar
.\scripts\workbench-manager.ps1 -Action Stop

# Reiniciar
.\scripts\workbench-manager.ps1 -Action Restart

# Ver logs
.\scripts\workbench-manager.ps1 -Action Logs

# Acessar shell
.\scripts\workbench-manager.ps1 -Action Shell

# Criar backup
.\scripts\workbench-manager.ps1 -Action Backup -BackupName "before-update"

# Abrir no navegador
.\scripts\workbench-manager.ps1 -Action Open

# Ver métricas
.\scripts\workbench-manager.ps1 -Action Stats

# Informações detalhadas
.\scripts\workbench-manager.ps1 -Action Info
```

---

## 🎯 ctm-utils.ps1

Utilitários para criar, validar e deployar jobs.

### Uso

```powershell
# Criar novo job (template simples)
.\scripts\ctm-utils.ps1 -Action Create -JobName "MeuJob"

# Criar job com template específico
.\scripts\ctm-utils.ps1 -Action Create -JobName "JobAgendado" -TemplateName "scheduled"

# Criar flow ETL
.\scripts\ctm-utils.ps1 -Action Create -JobName "ETLFlow" -TemplateName "flow"

# Validar JSON
.\scripts\ctm-utils.ps1 -Action Validate -JobFile "jobs\meu-job.json"

# Build do job
.\scripts\ctm-utils.ps1 -Action Build -JobFile "jobs\meu-job.json"

# Deploy do job
.\scripts\ctm-utils.ps1 -Action Deploy -JobFile "jobs\meu-job.json"

# Executar job
.\scripts\ctm-utils.ps1 -Action Run -JobFile "jobs\meu-job.json"

# Ver templates disponíveis
.\scripts\ctm-utils.ps1 -Action Template
```

### Templates Disponíveis

- **simple**: Job simples com comando
- **scheduled**: Job com agendamento
- **flow**: Flow com 3 jobs (ETL - Extract, Transform, Load)

---

## 🚀 Exemplos Práticos

### Workflow Completo

```powershell
# 1. Verificar se Workbench está rodando
.\scripts\workbench-manager.ps1 -Action Status

# 2. Se não estiver, iniciar
.\scripts\workbench-manager.ps1 -Action Start

# 3. Criar um novo job
.\scripts\ctm-utils.ps1 -Action Create -JobName "BackupDB" -FolderName "Production"

# 4. Editar o job no VS Code (abre automaticamente)

# 5. Validar JSON
.\scripts\ctm-utils.ps1 -Action Validate -JobFile "jobs\BackupDB.json"

# 6. Deploy
.\scripts\ctm-utils.ps1 -Action Deploy -JobFile "jobs\BackupDB.json"

# 7. Ver logs
.\scripts\workbench-manager.ps1 -Action Logs
```

### Backup Antes de Mudanças

```powershell
# Criar backup
.\scripts\workbench-manager.ps1 -Action Backup -BackupName "before-production-deploy"

# Deploy de jobs
.\scripts\ctm-utils.ps1 -Action Deploy -JobFile "jobs\production-flow.json"

# Se algo der errado, restaurar do backup
docker stop workbench
docker rm workbench
docker run -dt --name workbench controlm-workbench-backup:before-production-deploy
```

---

## ⚡ Atalhos no VS Code

Você pode executar esses scripts via **Tasks** no VS Code:

1. Pressione `Ctrl + Shift + P`
2. Digite "Run Task"
3. Escolha a task desejada

Ou use o menu: **Terminal** → **Run Task**

---

## 💡 Dicas

1. **Sempre valide** antes de fazer deploy
2. **Crie backups** antes de mudanças importantes
3. **Use templates** para acelerar a criação de jobs
4. **Monitore logs** durante testes
5. **Organize jobs** em pastas lógicas

---

## 📂 Estrutura de Diretórios

```
Workbench/
├── scripts/
│   ├── workbench-manager.ps1    # Gerenciar container
│   └── ctm-utils.ps1             # Gerenciar jobs
├── jobs/                         # Seus jobs aqui
│   └── example-flow.json         # Exemplo
└── WORKBENCH-VSCODE-GUIDE.md    # Documentação completa
```

---

## 🆘 Solução de Problemas

### Script não executa

```powershell
# Permitir execução de scripts (PowerShell como Admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Container não encontrado

```powershell
# Verificar containers existentes
docker ps -a

# Se o nome for diferente, use:
.\scripts\workbench-manager.ps1 -Action Status -ContainerName "nome-do-seu-container"
```

### Erro de permissão no Docker

```powershell
# Reiniciar Docker
Restart-Service -Name "com.docker.service" -Force

# Ou via Docker Desktop: Settings → Reset to factory defaults
```

---

**Criado em**: março de 2026  
**Ambiente**: Windows 10 + PowerShell + Docker + VS Code
