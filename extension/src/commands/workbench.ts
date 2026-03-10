import * as vscode from "vscode";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { StatusBarManager } from "../ui/statusBar";

export class WorkbenchCommands {
  constructor(
    private config: vscode.WorkspaceConfiguration,
    private statusBar: StatusBarManager,
    private extensionPath: string,
  ) {}

  async setupDockerImage() {
    const runtime = this.getRuntimeOrNotify();
    if (!runtime) {
      return;
    }

    const imageName =
      this.config.get<string>("imageName") || "controlm-workbench:9.19.200";

    if (this.imageExists(imageName)) {
      vscode.window.showInformationMessage(`✅ Imagem já existe: ${imageName}`);
      return;
    }

    const bundledImage = this.findBundledImage();
    const terminal = vscode.window.createTerminal("Control-M Setup Container");

    if (bundledImage) {
      const loadCmds = this.buildLoadCommands(runtime, bundledImage);
      for (const cmd of loadCmds) {
        terminal.sendText(cmd);
      }
      terminal.sendText(`${runtime} image ls "${imageName}"`);
      terminal.show();
      vscode.window.showInformationMessage(
        `📦 Carregando imagem empacotada: ${path.basename(bundledImage)}`,
      );
      return;
    }

    const configuredRelative =
      this.config.get<string>("bundledImageRelativePath") ||
      "assets/docker/controlm-workbench-9.19.200.tar.gz";
    const configuredAbsolute = path.join(
      this.extensionPath,
      configuredRelative,
    );
    const dockerAssetsDir = path.join(this.extensionPath, "assets", "docker");

    vscode.window.showErrorMessage(
      `❌ Imagem compactada do Workbench não foi encontrada dentro da extensão. ` +
        `Esta instalação está em modo offline (sem download). ` +
        `Verifique o arquivo em: ${configuredAbsolute} ou em ${dockerAssetsDir}.`,
    );
  }

  async status() {
    const runtime = this.getRuntimeOrNotify();
    if (!runtime) {
      return;
    }

    try {
      const containerName =
        this.config.get<string>("containerName") || "workbench";
      const result = execSync(
        `${runtime} ps -a -f name=${containerName} --format "{{.Status}}"`,
        {
          encoding: "utf-8",
        },
      ).trim();

      const statusMsg = `Workbench: ${result || "Não encontrado"}`;
      vscode.window.showInformationMessage(statusMsg);
      this.statusBar.update(result);
    } catch (error) {
      vscode.window.showErrorMessage(`❌ Erro ao verificar status: ${error}`);
    }
  }

  async start() {
    await this.executeCommand("start", "iniciado");
  }

  async stop() {
    await this.executeCommand("stop", "parado");
  }

  async restart() {
    await this.executeCommand("restart", "reiniciado");
  }

  async unpause() {
    await this.executeCommand("unpause", "despausado");
  }

  async open() {
    const url = this.getWorkbenchStartHereUrl();
    try {
      const opened = await vscode.env.openExternal(vscode.Uri.parse(url));
      if (!opened) {
        // openExternal retornou false — tenta via terminal como fallback
        const terminal = vscode.window.createTerminal("Control-M Browser");
        terminal.sendText(`start "${url}"`);
        terminal.show();
        vscode.window.showWarningMessage(
          "⚠️ Não foi possível abrir automaticamente. Tentando via terminal...",
        );
      } else {
        vscode.window.showInformationMessage(`🌐 Abrindo Workbench: ${url}`);
      }
    } catch (error) {
      // Fallback via terminal em caso de exceção
      const terminal = vscode.window.createTerminal("Control-M Browser");
      terminal.sendText(`start "${url}"`);
      terminal.show();
      vscode.window.showWarningMessage(
        `⚠️ Erro ao abrir URL automaticamente. Tentando via terminal: ${error}`,
      );
    }
  }

  async logs() {
    const runtime = this.getRuntimeOrNotify();
    if (!runtime) {
      return;
    }

    try {
      const containerName =
        this.config.get<string>("containerName") || "workbench";
      const terminal = vscode.window.createTerminal("Workbench Logs");
      terminal.sendText(`${runtime} logs -f --tail 100 ${containerName}`);
      terminal.show();
    } catch (error) {
      vscode.window.showErrorMessage(`❌ Erro ao abrir logs: ${error}`);
    }
  }

  async backup() {
    const runtime = this.getRuntimeOrNotify();
    if (!runtime) {
      return;
    }

    const name = await vscode.window.showInputBox({
      prompt: "Nome do backup (ex: before-update)",
      value: "manual",
    });

    if (!name) return;

    try {
      const containerName =
        this.config.get<string>("containerName") || "workbench";
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupName = `${containerName}-backup:${name}-${timestamp}`;

      execSync(`${runtime} commit ${containerName} ${backupName}`);
      vscode.window.showInformationMessage(`✅ Backup criado: ${backupName}`);
    } catch (error) {
      vscode.window.showErrorMessage(`❌ Erro ao criar backup: ${error}`);
    }
  }

  private async executeCommand(runtimeCmd: string, action: string) {
    try {
      const runtime = this.getRuntimeOrNotify();
      if (!runtime) {
        return;
      }

      const containerName =
        this.config.get<string>("containerName") || "workbench";
      execSync(`${runtime} ${runtimeCmd} ${containerName}`);
      vscode.window.showInformationMessage(
        `✅ Workbench ${action} com sucesso!`,
      );
    } catch (error) {
      const errorMsg = this.formatExecError(error);
      vscode.window.showErrorMessage(
        `❌ Erro ao ${action} Workbench: ${errorMsg}`,
      );
    }
  }

  private imageExists(imageName: string): boolean {
    const runtime = this.getRuntimeOrNotify();
    if (!runtime) {
      return false;
    }

    try {
      execSync(`${runtime} image inspect ${imageName}`, {
        stdio: "ignore",
      });
      return true;
    } catch {
      return false;
    }
  }

  private buildLoadCommands(runtime: string, imagePath: string): string[] {
    const lower = imagePath.toLowerCase();
    if (lower.endsWith(".xz")) {
      // docker load não suporta .xz nativamente; descompacta via 7-Zip streaming
      const escaped = imagePath.replace(/'/g, "''");
      return [
        "$_ctm7z = (Get-Command 7z -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1)",
        "if (-not $_ctm7z) { $_ctm7z = @($env:ProgramFiles + '\\7-Zip\\7z.exe', ${env:ProgramFiles(x86)} + '\\7-Zip\\7z.exe') | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1 }",
        `if ($_ctm7z) { Write-Host '🔄 Descomprimindo e carregando imagem .xz...'; & $_ctm7z e -so '${escaped}' | ${runtime} load } else { Write-Host '❌ 7-Zip não encontrado. Instale em https://www.7-zip.org e tente novamente.' }`,
      ];
    }
    return [`${runtime} load -i "${imagePath}"`];
  }

  private findBundledImage(): string | null {
    const configuredRelative =
      this.config.get<string>("bundledImageRelativePath") ||
      "assets/docker/controlm-workbench-9.19.200.tar.gz";
    const configuredAbsolute = path.join(
      this.extensionPath,
      configuredRelative,
    );

    if (fs.existsSync(configuredAbsolute)) {
      return configuredAbsolute;
    }

    const dockerAssetsDir = path.join(this.extensionPath, "assets", "docker");
    if (!fs.existsSync(dockerAssetsDir)) {
      return null;
    }

    const candidate = fs.readdirSync(dockerAssetsDir).find((fileName) => {
      return (
        fileName.endsWith(".tar") ||
        fileName.endsWith(".tar.gz") ||
        fileName.endsWith(".tar.xz") ||
        fileName.endsWith(".xz")
      );
    });

    if (!candidate) {
      return null;
    }

    return path.join(dockerAssetsDir, candidate);
  }

  private getRuntimeOrNotify(): "docker" | null {
    if (this.runtimeReady("docker")) {
      return "docker";
    }

    if (this.commandExists("docker")) {
      vscode.window.showWarningMessage(
        "⚠️ Docker foi encontrado, mas não está respondendo. Abra o Docker Desktop e tente novamente.",
      );
      return null;
    }

    vscode.window
      .showErrorMessage(
        "❌ Docker não encontrado. Instale o Docker Desktop e tente novamente.",
        "Instalar Docker",
      )
      .then((choice) => {
        if (choice === "Instalar Docker") {
          vscode.env.openExternal(
            vscode.Uri.parse("https://www.docker.com/products/docker-desktop/"),
          );
        }
      });

    return null;
  }

  private commandExists(commandName: string): boolean {
    try {
      execSync(`${commandName} --version`, {
        stdio: "ignore",
      });
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
      execSync(`${runtime} info`, {
        stdio: "ignore",
      });
      return true;
    } catch {
      return false;
    }
  }

  private formatExecError(error: unknown): string {
    if (!error || typeof error !== "object") {
      return "erro desconhecido";
    }

    const err = error as { stderr?: Buffer | string; message?: string };
    const raw =
      typeof err.stderr === "string"
        ? err.stderr
        : err.stderr?.toString() || err.message || "erro desconhecido";

    return raw.replace(/\s+/g, " ").trim().slice(0, 280);
  }

  private getAutomationApiUrl(): string {
    return (
      this.config.get<string>("automationApiUrl") ||
      "https://localhost:8443/automation-api"
    );
  }

  private getWorkbenchStartHereUrl(): string {
    return `${this.getAutomationApiUrl().replace(/\/$/, "")}/startHere.html`;
  }
}
