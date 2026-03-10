import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";

export class JobCommands {
  constructor(
    private config: vscode.WorkspaceConfiguration,
    private extensionPath: string,
    private globalStoragePath: string,
  ) {}

  async create() {
    const jobName = await vscode.window.showInputBox({
      prompt: "Nome do job",
      value: "NewJob",
    });

    if (!jobName) return;

    const template = await vscode.window.showQuickPick(
      ["simple", "scheduled", "flow"],
      { placeHolder: "Escolha um template" },
    );

    if (!template) return;

    try {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("❌ Nenhum workspace aberto");
        return;
      }

      const jobsPath = path.join(
        workspaceFolder.uri.fsPath,
        this.config.get<string>("jobsPath") || "jobs",
      );

      if (!fs.existsSync(jobsPath)) {
        fs.mkdirSync(jobsPath, { recursive: true });
      }

      const jobFile = path.join(jobsPath, `${jobName}.json`);
      const content = this.getTemplate(template, jobName);

      fs.writeFileSync(jobFile, content);

      const doc = await vscode.workspace.openTextDocument(jobFile);
      await vscode.window.showTextDocument(doc);

      vscode.window.showInformationMessage(`✅ Job criado: ${jobFile}`);
    } catch (error) {
      vscode.window.showErrorMessage(`❌ Erro ao criar job: ${error}`);
    }
  }

  async validate(fileUri?: vscode.Uri) {
    const filePath =
      fileUri?.fsPath ?? vscode.window.activeTextEditor?.document.fileName;
    if (!filePath || !filePath.endsWith(".json")) {
      vscode.window.showErrorMessage("❌ Abra um arquivo JSON do job");
      return;
    }

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);

      vscode.window.showInformationMessage("✅ JSON válido!");

      const jobs = this.extractJobs(parsed);
      if (jobs.length > 0) {
        vscode.window.showInformationMessage(
          `📋 ${jobs.length} job(s) encontrado(s)`,
        );
      }
    } catch (error) {
      vscode.window.showErrorMessage(`❌ JSON inválido: ${error}`);
    }
  }

  async deploy(fileUri?: vscode.Uri) {
    const filePath =
      fileUri?.fsPath ?? vscode.window.activeTextEditor?.document.fileName;
    if (!filePath || !filePath.endsWith(".json")) {
      vscode.window.showErrorMessage("❌ Abra um arquivo JSON do job");
      return;
    }

    try {
      await this.runJobCommand(
        filePath,
        "deploy",
        "Control-M Deploy",
        "Deploy",
      );
    } catch (error) {
      vscode.window.showErrorMessage(`❌ Erro no deploy: ${error}`);
    }
  }

  async build(fileUri?: vscode.Uri) {
    const filePath =
      fileUri?.fsPath ?? vscode.window.activeTextEditor?.document.fileName;
    if (!filePath || !filePath.endsWith(".json")) {
      vscode.window.showErrorMessage("❌ Abra um arquivo JSON do job");
      return;
    }

    try {
      await this.runJobCommand(filePath, "build", "Control-M Build", "Build");
    } catch (error) {
      vscode.window.showErrorMessage(`❌ Erro no build: ${error}`);
    }
  }

  async run(fileUri?: vscode.Uri) {
    const filePath =
      fileUri?.fsPath ?? vscode.window.activeTextEditor?.document.fileName;
    if (!filePath || !filePath.endsWith(".json")) {
      vscode.window.showErrorMessage("❌ Abra um arquivo JSON do job");
      return;
    }

    try {
      await this.runJobCommand(filePath, "run", "Control-M Run", "Run");
    } catch (error) {
      vscode.window.showErrorMessage(`❌ Erro na execução: ${error}`);
    }
  }

  async openDeployWeb() {
    const url = this.getDeployWebUrl();
    try {
      const opened = await vscode.env.openExternal(vscode.Uri.parse(url));
      if (!opened) {
        const terminal = vscode.window.createTerminal("Control-M Browser");
        terminal.sendText(`start "${url}"`);
        terminal.show();
        vscode.window.showWarningMessage(
          "⚠️ Não foi possível abrir automaticamente. Tentando via terminal...",
        );
        return;
      }

      vscode.window.showInformationMessage(`🌐 Abrindo Deploy Web: ${url}`);
    } catch (error) {
      const terminal = vscode.window.createTerminal("Control-M Browser");
      terminal.sendText(`start "${url}"`);
      terminal.show();
      vscode.window.showWarningMessage(
        `⚠️ Erro ao abrir URL automaticamente. Tentando via terminal: ${error}`,
      );
    }
  }

  async openMonitorWeb() {
    const filePath = vscode.window.activeTextEditor?.document.fileName;
    const folderName = filePath
      ? this.extractFolderNameFromFile(filePath)
      : null;

    if (!folderName) {
      vscode.window.showErrorMessage(
        "❌ Não foi possível extrair o nome da pasta do arquivo JSON.",
      );
      return;
    }

    try {
      const ctmExecution = this.resolveCtmExecution();
      if (!ctmExecution) {
        vscode.window.showErrorMessage(
          "❌ ctm-cli não encontrado. Tente novamente após configurar.",
        );
        return;
      }

      vscode.window.showInformationMessage(
        `📊 Buscando status da pasta: ${folderName}...`,
      );

      const nodePath = this.resolveNodePath();
      const ctmRoot = path.join(this.globalStoragePath, "ctm-cli");
      const ctmMain = path.join(ctmRoot, "package", "bin", "ctm-main.js");
      const shimPath = path.join(
        this.extensionPath,
        "assets",
        "tools",
        "ctm-crypto-shim.js",
      );

      const cmdOrder = `"${nodePath}" -r "${shimPath}" "${ctmMain}" run order workbench ${folderName}`;
      let monitorUrl = this.getMonitorWebUrl();

      try {
        const output = execSync(cmdOrder, {
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
        }).trim();

        if (output) {
          const orderResult = JSON.parse(output);
          if (orderResult && orderResult.monitorPageURI) {
            monitorUrl = orderResult.monitorPageURI.trim();
            vscode.window.showInformationMessage(
              `✅ runId capturado. Abrindo Monitor...`,
            );
          }
        }
      } catch (parseErr) {
        vscode.window.showWarningMessage(
          `⚠️ Não foi possível extrair runId. Abrindo sem runId: ${parseErr}`,
        );
      }

      const opened = await vscode.env.openExternal(
        vscode.Uri.parse(monitorUrl),
      );
      if (!opened) {
        const terminal = vscode.window.createTerminal("Control-M Browser");
        terminal.sendText(`start "${monitorUrl}"`);
        terminal.show();
        vscode.window.showWarningMessage(
          "⚠️ Não foi possível abrir automaticamente. Tentando via terminal...",
        );
        return;
      }

      vscode.window.showInformationMessage(
        `🌐 Abrindo Monitor Web: ${monitorUrl}`,
      );
    } catch (error) {
      const fallbackUrl = this.getMonitorWebUrl();
      const terminal = vscode.window.createTerminal("Control-M Browser");
      terminal.sendText(`start "${fallbackUrl}"`);
      terminal.show();
      vscode.window.showWarningMessage(
        `⚠️ Erro ao executar comando. Abrindo versão básica: ${error}`,
      );
    }
  }

  private getTemplate(template: string, jobName: string): string {
    const templates: { [key: string]: string } = {
      simple: JSON.stringify(
        {
          MyFolder: {
            Type: "Folder",
            [jobName]: {
              Type: "Job:Command",
              Command: "echo 'Hello from Control-M'",
              RunAs: "workbench",
              Host: "localhost",
            },
          },
        },
        null,
        2,
      ),
      scheduled: JSON.stringify(
        {
          MyFolder: {
            Type: "Folder",
            [jobName]: {
              Type: "Job:Command",
              Command: 'echo "Scheduled job"',
              RunAs: "workbench",
              Host: "localhost",
              When: {
                RuleBasedCalendars: {
                  Included: [{ Name: "Weekdays" }],
                },
                FromTime: "0800",
                ToTime: "1700",
              },
            },
          },
        },
        null,
        2,
      ),
      flow: JSON.stringify(
        {
          MyFolder: {
            Type: "Folder",
            Job1_Extract: {
              Type: "Job:Command",
              Command: 'echo "Extracting..."',
              RunAs: "workbench",
              Host: "localhost",
            },
            Job2_Transform: {
              Type: "Job:Command",
              Command: 'echo "Transforming..."',
              RunAs: "workbench",
              Host: "localhost",
              When: {
                JobSucceeded: { JobName: "Job1_Extract" },
              },
            },
          },
        },
        null,
        2,
      ),
    };

    return templates[template] || "{}";
  }

  private extractJobs(obj: unknown): string[] {
    const jobs: string[] = [];

    const traverse = (current: unknown) => {
      if (typeof current !== "object" || current === null) return;

      for (const [key, value] of Object.entries(current)) {
        if (typeof value === "object" && value !== null) {
          const type = (value as Record<string, unknown>).Type;
          if (type && (type === "Job:Command" || type === "Job:Script")) {
            jobs.push(key);
          } else {
            traverse(value);
          }
        }
      }
    };

    traverse(obj);
    return jobs;
  }

  private async runJobCommand(
    filePath: string,
    subcommand: "deploy" | "build" | "run",
    terminalName: string,
    actionName: string,
  ) {
    if (!this.getRuntimeOrNotify()) {
      return;
    }

    const ctmExecution = this.resolveCtmExecution();
    if (!ctmExecution) {
      vscode.window.showErrorMessage(
        "❌ ctm-cli não encontrado. Inclua assets/tools/ctm-cli.tgz na extensão ou instale 'ctm' no PATH.",
      );
      return;
    }

    const automationApiUrl = this.getAutomationApiUrl();

    const terminal = vscode.window.createTerminal(terminalName);
    for (const setupCmd of ctmExecution.setupCommands) {
      terminal.sendText(setupCmd);
    }
    terminal.sendText(
      `${ctmExecution.commandPrefix} environment workbench::add ${automationApiUrl}`,
    );
    terminal.sendText(
      `${ctmExecution.commandPrefix} environment set workbench`,
    );
    terminal.sendText(
      `${ctmExecution.commandPrefix} ${subcommand} "${filePath}"`,
    );
    terminal.show();

    if (subcommand === "deploy") {
      const jobIds = this.extractDeployJobIdsFromFile(filePath);
      if (jobIds.length > 0) {
        const preview = jobIds.slice(0, 5).join(", ");
        const suffix = jobIds.length > 5 ? ` (+${jobIds.length - 5})` : "";
        vscode.window.showInformationMessage(
          `🚀 ${actionName} iniciado. Job IDs: ${preview}${suffix}`,
        );
        return;
      }
    }

    if (subcommand === "run") {
      const choice = await vscode.window.showInformationMessage(
        `🚀 ${actionName} iniciado...`,
        "Abrir Monitor Web",
      );
      if (choice === "Abrir Monitor Web") {
        await this.openMonitorWeb();
      }
      return;
    }

    vscode.window.showInformationMessage(`🚀 ${actionName} iniciado...`);
  }

  private extractDeployJobIdsFromFile(filePath: string): string[] {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      const ids: string[] = [];

      const traverse = (current: unknown, currentFolder?: string) => {
        if (typeof current !== "object" || current === null) {
          return;
        }

        for (const [key, value] of Object.entries(current)) {
          if (typeof value !== "object" || value === null) {
            continue;
          }

          const type = (value as Record<string, unknown>).Type;
          if (
            type === "Folder" ||
            type === "SubFolder" ||
            type === "SmartFolder"
          ) {
            traverse(value, key);
            continue;
          }

          if (type === "Job:Command" || type === "Job:Script") {
            ids.push(currentFolder ? `${currentFolder}/${key}` : key);
            continue;
          }

          traverse(value, currentFolder);
        }
      };

      traverse(parsed);
      return ids;
    } catch {
      return [];
    }
  }

  private resolveCtmExecution(): {
    commandPrefix: string;
    setupCommands: string[];
  } | null {
    const bundledCli = this.findBundledCtmCli();
    const nodeExe = process.execPath;

    if (bundledCli) {
      const ctmRoot = path.join(this.globalStoragePath, "ctm-cli");
      const ctmMain = path.join(ctmRoot, "package", "bin", "ctm-main.js");
      const shimPath = path.join(
        this.extensionPath,
        "assets",
        "tools",
        "ctm-crypto-shim.js",
      );

      const bundledEsc = this.psSingleQuote(bundledCli);
      const ctmRootEsc = this.psSingleQuote(ctmRoot);
      const ctmMainEsc = this.psSingleQuote(ctmMain);
      const nodeExeEsc = this.psSingleQuote(nodeExe);
      const shimPathEsc = this.psSingleQuote(shimPath);
      const nodeExeLooksValid = /node(\\.exe)?$/i.test(path.basename(nodeExe));

      const setupCommands = [
        `$ctmCliTgz = '${bundledEsc}'`,
        `$ctmCliRoot = '${ctmRootEsc}'`,
        `$ctmCliMain = '${ctmMainEsc}'`,
        `$ctmNode = $null`,
        "$ctmNodeFromPath = (Get-Command node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1)",
        "if ($ctmNodeFromPath) { $ctmNode = $ctmNodeFromPath }",
        ...(nodeExeLooksValid
          ? [`if (-not $ctmNode) { $ctmNode = '${nodeExeEsc}' }`]
          : []),
        "if (-not $ctmNode) { Write-Host '❌ Node.js não encontrado para executar ctm-cli embutido.'; exit 1 }",
        "if (!(Test-Path $ctmCliTgz)) { Write-Host '❌ ctm-cli.tgz não encontrado na extensão.'; exit 1 }",
        "if (!(Test-Path $ctmCliMain)) {",
        "  New-Item -ItemType Directory -Path $ctmCliRoot -Force | Out-Null",
        "  Write-Host '📦 Preparando ctm-cli local da extensão...'",
        "  tar -xf $ctmCliTgz -C $ctmCliRoot",
        "}",
      ];

      return {
        commandPrefix: `& $ctmNode -r '${shimPathEsc}' '${ctmMainEsc}'`,
        setupCommands,
      };
    }

    if (this.commandExists("ctm")) {
      return {
        commandPrefix: "ctm",
        setupCommands: [],
      };
    }

    return null;
  }

  private findBundledCtmCli(): string | null {
    const configuredRelative =
      this.config.get<string>("bundledCtmCliRelativePath") ||
      "assets/tools/ctm-cli.tgz";
    const configuredAbsolute = path.join(
      this.extensionPath,
      configuredRelative,
    );

    if (fs.existsSync(configuredAbsolute)) {
      return configuredAbsolute;
    }

    const toolsDir = path.join(this.extensionPath, "assets", "tools");
    if (!fs.existsSync(toolsDir)) {
      return null;
    }

    const fallback = fs
      .readdirSync(toolsDir)
      .find(
        (fileName) =>
          fileName.toLowerCase().startsWith("ctm") && fileName.endsWith(".tgz"),
      );

    return fallback ? path.join(toolsDir, fallback) : null;
  }

  private psSingleQuote(value: string): string {
    return value.replace(/'/g, "''");
  }

  private getAutomationApiUrl(): string {
    return (
      this.config.get<string>("automationApiUrl") ||
      "https://localhost:8443/automation-api"
    );
  }

  private getDeployWebUrl(): string {
    return (
      this.config.get<string>("deployWebUrl") ||
      `${this.getAutomationApiUrl().replace(/\/$/, "")}/startHere.html`
    );
  }

  private getMonitorWebUrl(): string {
    return (
      this.config.get<string>("monitorWebUrl") ||
      "https://localhost:8443/SelfService"
    );
  }

  private extractFolderNameFromFile(filePath: string): string | null {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);

      const folderNames = Object.keys(parsed).filter(
        (key) =>
          typeof parsed[key] === "object" &&
          parsed[key] !== null &&
          ["Folder", "SubFolder", "SmartFolder"].includes(parsed[key].Type),
      );

      return folderNames.length > 0 ? folderNames[0] : null;
    } catch {
      return null;
    }
  }

  private resolveNodePath(): string {
    try {
      const fromPath = execSync(
        "Get-Command node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1",
        { encoding: "utf-8", shell: "powershell" },
      ).trim();
      if (fromPath) return fromPath;
    } catch {
      // fallback
    }
    return process.execPath;
  }

  private getRuntimeOrNotify(): "docker" | null {
    if (this.runtimeReady("docker")) {
      return "docker";
    }

    if (this.commandExists("docker")) {
      vscode.window.showErrorMessage(
        "❌ Docker encontrado, mas não está respondendo. Abra o Docker Desktop e tente novamente.",
      );
      return null;
    }

    vscode.window.showErrorMessage(
      "❌ Docker não encontrado. Instale o Docker Desktop e tente novamente.",
    );
    return null;
  }

  private commandExists(commandName: string): boolean {
    try {
      execSync(`${commandName} --version`, { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }

  private runtimeReady(runtime: "docker"): boolean {
    if (!this.commandExists(runtime)) {
      return false;
    }

    try {
      execSync(`${runtime} info`, { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }
}
