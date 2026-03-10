# 🎯 Quick Start - Workbench + VS Code

Guia rápido para começar a usar o Control-M Workbench integrado ao VS Code.

---

## ⚡ 5 Minutos para Começar

### 1. Verificar se está tudo funcionando

Abra o terminal do VS Code (`Ctrl + '`) e execute:

```powershell
.\Workbench\scripts\workbench-manager.ps1 -Action Status
```

**Esperado**: ✅ Workbench está RODANDO

---

### 2. Abrir a Interface Web

```powershell
.\Workbench\scripts\workbench-manager.ps1 -Action Open
```

Ou acesse manualmente: https://localhost:8443/automation-api/startHere.html

**Credenciais padrão**:

- Usuário: `workbench`
- Senha: `workbench`

---

### 3. Criar seu primeiro Job

```powershell
.\Workbench\scripts\ctm-utils.ps1 -Action Create -JobName "MeuPrimeiroJob"
```

O VS Code abrirá automaticamente o arquivo JSON. Edite como quiser!

---

### 4. Validar o Job

```powershell
.\Workbench\scripts\ctm-utils.ps1 -Action Validate -JobFile "jobs\MeuPrimeiroJob.json"
```

**Esperado**: ✅ JSON válido!

---

### 5. Fazer Deploy

```powershell
.\Workbench\scripts\ctm-utils.ps1 -Action Deploy -JobFile "jobs\MeuPrimeiroJob.json"
```

**Pronto!** Seu job foi enviado para o Workbench. 🎉

---

## 🎨 Usando o VS Code

### Via Tasks (Recomendado)

1. Pressione `Ctrl + Shift + P`
2. Digite: "Run Task"
3. Escolha a task desejada:
   - **Workbench: Ver Status**
   - **Workbench: Ver Logs**
   - **Workbench: Abrir Interface Web**
   - **Control-M: Deploy Job** (com arquivo aberto)

### Via Snippets

1. Crie um novo arquivo `.json` na pasta `jobs/`
2. Digite `ctm-` e pressione `Ctrl + Space`
3. Escolha um snippet:
   - `ctm-job` - Job simples
   - `ctm-job-schedule` - Job agendado
   - `ctm-flow` - Flow com dependências

---

## 📚 Exemplos Prontos

### Testar com o Exemplo Incluído

```powershell
# Deploy do exemplo
.\Workbench\scripts\ctm-utils.ps1 -Action Deploy -JobFile "Workbench\jobs\example-flow.json"

# Ver logs
.\Workbench\scripts\workbench-manager.ps1 -Action Logs
```

---

## 🔥 Comandos Mais Usados

| O que fazer | Comando                                                                      |
| ----------- | ---------------------------------------------------------------------------- |
| Ver status  | `.\Workbench\scripts\workbench-manager.ps1 -Action Status`                   |
| Abrir web   | `.\Workbench\scripts\workbench-manager.ps1 -Action Open`                     |
| Ver logs    | `.\Workbench\scripts\workbench-manager.ps1 -Action Logs`                     |
| Criar job   | `.\Workbench\scripts\ctm-utils.ps1 -Action Create -JobName "Nome"`           |
| Validar     | `.\Workbench\scripts\ctm-utils.ps1 -Action Validate -JobFile "arquivo.json"` |
| Deploy      | `.\Workbench\scripts\ctm-utils.ps1 -Action Deploy -JobFile "arquivo.json"`   |
| Backup      | `.\Workbench\scripts\workbench-manager.ps1 -Action Backup`                   |

---

## 🛠️ Atalhos de Teclado (Opcional)

Para configurar atalhos personalizados:

1. `Ctrl + K, Ctrl + S` (abre Keyboard Shortcuts)
2. Clique no ícone 📄 no canto superior direito
3. Copie o conteúdo de `.vscode/keybindings-suggested.json`
4. Cole no seu `keybindings.json`

**Atalhos sugeridos**:

- `Ctrl + Alt + W` - Abrir Workbench no navegador
- `Ctrl + Alt + S` - Ver status
- `Ctrl + Alt + L` - Ver logs
- `Ctrl + Alt + D` - Deploy do arquivo atual

---

## 📖 Documentação Completa

- **Guia Principal**: [WORKBENCH-VSCODE-GUIDE.md](./WORKBENCH-VSCODE-GUIDE.md)
- **Scripts**: [scripts/README.md](./scripts/README.md)
- **Exemplo de Docker**: [docker-vscode-exemplo/README.md](./docker-vscode-exemplo/README.md)

---

## 🆘 Problemas Comuns

### Erro ERR_INVALID_HTTP_RESPONSE ou página não carrega

O container pode estar pausado. Verifique e despause:

```powershell
# Verificar se está pausado
docker ps -a -f name=workbench

# Se aparecer "(Paused)", despausar:
docker unpause workbench

# Aguardar alguns segundos e tentar novamente
```

### Container não está rodando

```powershell
.\Workbench\scripts\workbench-manager.ps1 -Action Start
```

### Porta 7005 já em uso

```powershell
# Ver o que está usando a porta
Get-NetTCPConnection -LocalPort 7005

# Parar o processo conflitante ou mudar a porta do container
```

### Script não executa (erro de política)

```powershell
# PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🎓 Próximos Passos

1. ✅ Explore a interface web: https://localhost:8443/automation-api/startHere.html
2. ✅ Crie variações dos templates disponíveis
3. ✅ Experimente criar flows complexos
4. ✅ Configure agendamentos nos jobs
5. ✅ Integre com seus scripts e ferramentas

---

**Tempo estimado de setup**: 5 minutos  
**Nível**: Iniciante  
**Ambiente**: Windows 10 + Docker + VS Code
