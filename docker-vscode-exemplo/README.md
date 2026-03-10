# 🐳 Guia: Docker + VS Code - Integração Completa

## ✅ Componentes Instalados

- **WSL 2**: Ubuntu (configurado)
- **Docker Desktop**: v29.1.3
- **Extensões VS Code**:
  - Docker (ms-azuretools.vscode-docker)
  - Dev Containers (ms-vscode-remote.remote-containers)
  - WSL (ms-vscode-remote.remote-wsl)

---

## 🚀 Como Usar Docker no VS Code

### 1. **Visualizar Containers, Imagens e Volumes**

Pressione `Ctrl + Shift + E` e clique no ícone do Docker na barra lateral esquerda. Você verá:

- 📦 Containers (ativos e parados)
- 🖼️ Imagens
- 📁 Volumes
- 🌐 Networks

### 2. **Executar Comandos Docker Direto do VS Code**

- **Clique com botão direito** em qualquer Dockerfile ou docker-compose.yml
- Opções disponíveis:
  - Build Image
  - Compose Up
  - Compose Down
  - Run Container

### 3. **Comandos Úteis no Terminal Integrado** (`Ctrl + '`)

```powershell
# Listar containers ativos
docker ps

# Listar todas as imagens
docker images

# Ver logs de um container
docker logs <container_id>

# Executar comando dentro do container
docker exec -it <container_id> sh

# Parar todos os containers
docker stop $(docker ps -aq)

# Limpar sistema (cuidado!)
docker system prune -a
```

---

## 📦 Testando Este Projeto de Exemplo

### Opção 1: Usando Docker Compose (recomendado)

1. Abra este projeto no VS Code
2. Clique com botão direito no arquivo `docker-compose.yml`
3. Selecione "Compose Up"
4. Acesse: http://localhost:3000

### Opção 2: Via Terminal

```powershell
# Construir e iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

### Opção 3: Apenas Docker (sem compose)

```powershell
# Build da imagem
docker build -t minha-app .

# Executar container
docker run -d -p 3000:3000 --name minha-app minha-app

# Testar
curl http://localhost:3000
```

---

## 🛠️ Recursos Avançados do VS Code + Docker

### **Dev Containers**

1. Pressione `F1` ou `Ctrl + Shift + P`
2. Digite: `Dev Containers: Open Folder in Container`
3. Selecione uma pasta com Dockerfile
4. O VS Code reiniciará dentro do container!

### **Depuração de Aplicações em Container**

1. Adicione um arquivo `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Docker: Attach to Node",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "address": "localhost",
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/app",
      "protocol": "inspector"
    }
  ]
}
```

2. Modifique o CMD no Dockerfile para modo debug:

```dockerfile
CMD ["node", "--inspect=0.0.0.0:9229", "index.js"]
```

### **Snippets Úteis**

Digite os atalhos e pressione `Tab`:

- `dockerfile` - Template básico de Dockerfile
- `docker-compose` - Template de docker-compose.yml
- `dockerignore` - Template de .dockerignore

---

## 🔧 Comandos Palette do VS Code (F1)

- `Docker: Add Docker Files to Workspace` - Adiciona Dockerfile e configurações
- `Docker: Prune System` - Limpa containers e imagens não utilizadas
- `Docker Images: Build Image` - Constrói imagem do Dockerfile atual
- `Docker Containers: View Logs` - Visualiza logs de um container

---

## 🎯 Atalhos de Teclado

| Atalho             | Ação                     |
| ------------------ | ------------------------ |
| `Ctrl + Shift + P` | Abrir Command Palette    |
| `Ctrl + '`         | Abrir Terminal Integrado |
| `Ctrl + B`         | Toggle Sidebar           |
| `F5`               | Iniciar Debug            |

---

## 📚 Próximos Passos

1. ✅ Criar seus próprios Dockerfiles
2. ✅ Experimentar diferentes imagens base (node, python, nginx, etc.)
3. ✅ Usar Docker Compose para aplicações multi-container
4. ✅ Explorar Dev Containers para ambientes de desenvolvimento isolados
5. ✅ Configurar CI/CD com Docker

---

## 🆘 Solução de Problemas

### Docker Desktop não inicia

```powershell
# Reiniciar serviços
net stop com.docker.service
net start com.docker.service
```

### Container não consegue acessar internet

```powershell
# Resetar rede do Docker
docker network prune
```

### Erro de permissões WSL

```powershell
# No PowerShell como Admin
wsl --update
wsl --shutdown
```

### Ver configurações do Docker

```powershell
docker info
docker version
```

---

## 📖 Recursos Adicionais

- [Docker Docs](https://docs.docker.com/)
- [VS Code Docker Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
- [Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)

---

**Criado em:** março de 2026  
**Ambiente:** Windows 10 + WSL 2 + Docker Desktop + VS Code
