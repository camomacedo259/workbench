<#
.SYNOPSIS
    Utilitários para Control-M Jobs
.DESCRIPTION
    Scripts para criar, validar e deployar jobs do Control-M
.EXAMPLE
    .\ctm-utils.ps1 -Action Create -JobName "MeuJob"
    .\ctm-utils.ps1 -Action Validate -JobFile "job.json"
    .\ctm-utils.ps1 -Action Deploy -JobFile "job.json"
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('Create', 'Validate', 'Deploy', 'Build', 'Run', 'Template')]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [string]$JobName = "NewJob",
    
    [Parameter(Mandatory=$false)]
    [string]$JobFile,
    
    [Parameter(Mandatory=$false)]
    [string]$FolderName = "MyFolder",
    
    [Parameter(Mandatory=$false)]
    [string]$TemplateName = "simple"
)

# Cores
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Error { Write-Host $args -ForegroundColor Red }

$ContainerName = "workbench"
$JobsPath = ".\jobs"

# Criar diretório de jobs se não existir
if (-not (Test-Path $JobsPath)) {
    New-Item -Path $JobsPath -ItemType Directory | Out-Null
}

# Templates de jobs
$templates = @{
    simple = @"
{
  "$FolderName": {
    "Type": "Folder",
    "$JobName": {
      "Type": "Job:Command",
      "Command": "echo 'Hello from $JobName'",
      "RunAs": "workbench",
      "Host": "localhost"
    }
  }
}
"@
    
    scheduled = @"
{
  "$FolderName": {
    "Type": "Folder",
    "$JobName": {
      "Type": "Job:Command",
      "Command": "echo 'Scheduled job'",
      "RunAs": "workbench",
      "Host": "localhost",
      "When": {
        "RuleBasedCalendars": {
          "Included": [
            {
              "Name": "Weekdays"
            }
          ]
        },
        "FromTime": "0800",
        "ToTime": "1700"
      }
    }
  }
}
"@
    
    flow = @"
{
  "$FolderName": {
    "Type": "Folder",
    "Job1_Extract": {
      "Type": "Job:Command",
      "Command": "echo 'Extracting data'",
      "RunAs": "workbench",
      "Host": "localhost"
    },
    "Job2_Transform": {
      "Type": "Job:Command",
      "Command": "echo 'Transforming data'",
      "RunAs": "workbench",
      "Host": "localhost",
      "When": {
        "JobSucceeded": {
          "JobName": "Job1_Extract"
        }
      }
    },
    "Job3_Load": {
      "Type": "Job:Command",
      "Command": "echo 'Loading data'",
      "RunAs": "workbench",
      "Host": "localhost",
      "When": {
        "JobSucceeded": {
          "JobName": "Job2_Transform"
        }
      }
    }
  }
}
"@
}

# Executar ação
switch ($Action) {
    'Create' {
        $fileName = "$JobsPath\$JobName.json"
        
        if (Test-Path $fileName) {
            Write-Error "❌ Arquivo já existe: $fileName"
            exit 1
        }
        
        $templates[$TemplateName] | Out-File -FilePath $fileName -Encoding UTF8
        Write-Success "✅ Job criado: $fileName"
        Write-Info "📝 Abrindo no VS Code..."
        code $fileName
    }
    
    'Validate' {
        if (-not $JobFile) {
            Write-Error "❌ Especifique o arquivo com -JobFile"
            exit 1
        }
        
        if (-not (Test-Path $JobFile)) {
            Write-Error "❌ Arquivo não encontrado: $JobFile"
            exit 1
        }
        
        Write-Info "🔍 Validando JSON..."
        
        try {
            Get-Content $JobFile | ConvertFrom-Json | Out-Null
            Write-Success "✅ JSON válido!"
            
            # Mostrar estrutura
            Write-Info "`n📋 Estrutura do job:"
            $job = Get-Content $JobFile | ConvertFrom-Json
            $job | ConvertTo-Json -Depth 10
            
        } catch {
            Write-Error "❌ JSON inválido: $($_.Exception.Message)"
            exit 1
        }
    }
    
    'Deploy' {
        if (-not $JobFile) {
            Write-Error "❌ Especifique o arquivo com -JobFile"
            exit 1
        }
        
        if (-not (Test-Path $JobFile)) {
            Write-Error "❌ Arquivo não encontrado: $JobFile"
            exit 1
        }
        
        Write-Info "🚀 Fazendo deploy do job..."
        
        # Copiar arquivo para o container
        $containerPath = "/tmp/job-deploy.json"
        docker cp $JobFile "$ContainerName`:$containerPath"
        
        # Deploy
        docker exec -it $ContainerName ctm deploy $containerPath
        
        if ($?) {
            Write-Success "`n✅ Deploy realizado com sucesso!"
        } else {
            Write-Error "`n❌ Falha no deploy"
        }
    }
    
    'Build' {
        if (-not $JobFile) {
            Write-Error "❌ Especifique o arquivo com -JobFile"
            exit 1
        }
        
        if (-not (Test-Path $JobFile)) {
            Write-Error "❌ Arquivo não encontrado: $JobFile"
            exit 1
        }
        
        Write-Info "🔨 Fazendo build do job..."
        
        $containerPath = "/tmp/job-build.json"
        docker cp $JobFile "$ContainerName`:$containerPath"
        
        docker exec -it $ContainerName ctm build $containerPath
        
        if ($?) {
            Write-Success "`n✅ Build realizado com sucesso!"
        } else {
            Write-Error "`n❌ Falha no build"
        }
    }
    
    'Run' {
        if (-not $JobFile) {
            Write-Error "❌ Especifique o arquivo com -JobFile"
            exit 1
        }
        
        if (-not (Test-Path $JobFile)) {
            Write-Error "❌ Arquivo não encontrado: $JobFile"
            exit 1
        }
        
        Write-Info "▶️  Executando job..."
        
        $containerPath = "/tmp/job-run.json"
        docker cp $JobFile "$ContainerName`:$containerPath"
        
        docker exec -it $ContainerName ctm run $containerPath
        
        if ($?) {
            Write-Success "`n✅ Job executado!"
        } else {
            Write-Error "`n❌ Falha na execução"
        }
    }
    
    'Template' {
        Write-Info "📋 Templates disponíveis:`n"
        
        Write-Host "1. simple    " -ForegroundColor Cyan -NoNewline
        Write-Host "- Job simples com comando"
        
        Write-Host "2. scheduled " -ForegroundColor Cyan -NoNewline
        Write-Host "- Job com agendamento"
        
        Write-Host "3. flow      " -ForegroundColor Cyan -NoNewline
        Write-Host "- Flow com 3 jobs (ETL)"
        
        Write-Info "`nUso:"
        Write-Host ".\ctm-utils.ps1 -Action Create -JobName 'MeuJob' -TemplateName 'simple'"
    }
}
