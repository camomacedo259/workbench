<#
.SYNOPSIS
    Gerenciador do Control-M Workbench
.DESCRIPTION
    Scripts para gerenciar o container Control-M Workbench
.EXAMPLE
    .\workbench-manager.ps1 -Action Status
    .\workbench-manager.ps1 -Action Start
    .\workbench-manager.ps1 -Action Backup -BackupName "before-update"
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('Status', 'Start', 'Stop', 'Restart', 'Logs', 'Shell', 'Backup', 'Open', 'Stats', 'Info', 'Unpause')]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [string]$BackupName = (Get-Date -Format "yyyyMMdd-HHmmss"),
    
    [Parameter(Mandatory=$false)]
    [string]$ContainerName = "workbench"
)

# Cores para output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# Banner
Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Control-M Workbench Manager         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Verificar se Docker está rodando
try {
    docker info | Out-Null
} catch {
    Write-Error "❌ Docker não está rodando! Inicie o Docker Desktop primeiro."
    exit 1
}

# Executar ação
switch ($Action) {
    'Status' {
        Write-Info "📊 Status do Workbench:"
        docker ps -a -f name=$ContainerName --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        
        $status = docker inspect $ContainerName --format '{{.State.Status}}' 2>$null
        if ($status -eq 'running') {
            Write-Success "`n✅ Workbench está RODANDO"
            Write-Info "🌐 Acesse: https://localhost:8443/automation-api/startHere.html"
        } elseif ($status -eq 'paused') {
            Write-Warning "`n⚠️  Workbench está PAUSADO"
            Write-Info "💡 Execute: .\workbench-manager.ps1 -Action Unpause"
        } elseif ($status) {
            Write-Warning "`n⚠️  Workbench está $status"
        } else {
            Write-Error "`n❌ Container não encontrado!"
        }
    }
    
    'Start' {
        Write-Info "🚀 Iniciando Workbench..."
        docker start $ContainerName
        Start-Sleep -Seconds 3
        
        $status = docker inspect $ContainerName --format '{{.State.Status}}' 2>$null
        if ($status -eq 'running') {
            Write-Success "✅ Workbench iniciado com sucesso!"
            Write-Info "🌐 Acesse: https://localhost:8443/automation-api/startHere.html"
        } else {
            Write-Error "❌ Falha ao iniciar o Workbench"
        }
    }
    
    'Stop' {
        Write-Info "⏹️  Parando Workbench..."
        docker stop $ContainerName
        Write-Success "✅ Workbench parado"
    }
    
    'Restart' {
        Write-Info "🔄 Reiniciando Workbench..."
        docker restart $ContainerName
        Start-Sleep -Seconds 5
        Write-Success "✅ Workbench reiniciado!"
        Write-Info "🌐 Acesse: https://localhost:8443/automation-api/startHere.html"
    }
    
    'Logs' {
        Write-Info "📋 Logs do Workbench (Ctrl+C para sair):`n"
        docker logs -f --tail 100 $ContainerName
    }
    
    'Shell' {
        Write-Info "🐚 Abrindo shell no container...`n"
        docker exec -it $ContainerName bash
    }
    
    'Backup' {
        Write-Info "💾 Criando backup: $BackupName"
        $imageName = "$ContainerName-backup:$BackupName"
        docker commit $ContainerName $imageName
        
        if ($?) {
            Write-Success "✅ Backup criado: $imageName"
            Write-Info "`n📦 Lista de backups:"
            docker images | Select-String "$ContainerName-backup"
        } else {
            Write-Error "❌ Falha ao criar backup"
        }
    }
    
    'Open' {
        Write-Info "🌐 Abrindo Workbench no navegador..."
        Start-Process "https://localhost:8443/automation-api/startHere.html"
        Write-Success "✅ Navegador aberto"
    }
    
    'Stats' {
        Write-Info "📊 Métricas do container:`n"
        docker stats $ContainerName --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    }
    
    'Info' {
        Write-Info "ℹ️  Informações detalhadas:`n"
        
        $info = docker inspect $ContainerName | ConvertFrom-Json
        
        Write-Host "Nome:         " -NoNewline; Write-Success $info.Name
        Write-Host "Imagem:       " -NoNewline; Write-Success $info.Config.Image
        Write-Host "Status:       " -NoNewline; Write-Success $info.State.Status
        Write-Host "Iniciado em:  " -NoNewline; Write-Success $info.State.StartedAt
        Write-Host "IP:           " -NoNewline; Write-Success $info.NetworkSettings.IPAddress
        
        Write-Host "`nPortas:"
        Write-Host "  - Interface Web: https://localhost:8443/automation-api/startHere.html" -ForegroundColor Cyan
        Write-Host "  - API REST:      https://localhost:8443/automation-api" -ForegroundColor Cyan
        
        Write-Host "`nRecursos:"
        docker stats $ContainerName --no-stream --format "  CPU: {{.CPUPerc}} | Memória: {{.MemUsage}}"
    }
    
    'Unpause' {
        Write-Info "▶️  Despausando Workbench..."
        docker unpause $ContainerName
        
        if ($?) {
            Start-Sleep -Seconds 3
            Write-Success "✅ Workbench despausado com sucesso!"
            Write-Info "🌐 Acesse: https://localhost:8443/automation-api/startHere.html"
        } else {
            Write-Error "❌ Falha ao despausar o Workbench"
        }
    }
}

Write-Host ""
