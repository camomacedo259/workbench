import * as vscode from "vscode";
import { execSync } from "child_process";

export class WorkbenchStatusProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.TreeItem | undefined | null | void
  > = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();

  readonly onDidChangeTreeData: vscode.Event<
    vscode.TreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(private config: vscode.WorkspaceConfiguration) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    if (!element) {
      return await this.getRootItems();
    }
    return [];
  }

  private async getRootItems(): Promise<vscode.TreeItem[]> {
    const items: vscode.TreeItem[] = [];
    const containerName =
      this.config.get<string>("containerName") || "workbench";
    const runtime = this.resolveContainerRuntime();

    if (!runtime) {
      items.push({
        label: "❌ Docker não encontrado",
        collapsibleState: vscode.TreeItemCollapsibleState.None,
      });
      items.push({
        label: "📦 Setup Docker Image",
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        command: {
          command: "ctm-workbench.setupDockerImage",
          title: "Setup Docker Image",
          arguments: [],
        },
      });
      return items;
    }

    try {
      const status = execSync(
        `${runtime} ps -a -f name=${containerName} --format "{{.Status}}"`,
        { encoding: "utf-8" },
      ).trim();

      items.push({
        label: "📦 Setup Docker Image",
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        command: {
          command: "ctm-workbench.setupDockerImage",
          title: "Setup Docker Image",
          arguments: [],
        },
      });

      const isRunning = status.includes("Up");
      const icon = isRunning ? "🟢" : "🔴";

      items.push({
        label: `${icon} ${containerName}`,
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        command: {
          command: "ctm-workbench.status",
          title: "Status",
          arguments: [],
        },
      });

      // Quick actions
      if (isRunning) {
        items.push({
          label: "🌐 Abrir Workbench",
          collapsibleState: vscode.TreeItemCollapsibleState.None,
          command: { command: "ctm-workbench.open", title: "Abrir" },
        });
        items.push({
          label: "📋 Ver Logs",
          collapsibleState: vscode.TreeItemCollapsibleState.None,
          command: { command: "ctm-workbench.logs", title: "Logs" },
        });
        items.push({
          label: "⏹️  Parar",
          collapsibleState: vscode.TreeItemCollapsibleState.None,
          command: { command: "ctm-workbench.stop", title: "Stop" },
        });
      } else {
        items.push({
          label: "▶️  Iniciar",
          collapsibleState: vscode.TreeItemCollapsibleState.None,
          command: { command: "ctm-workbench.start", title: "Start" },
        });
      }

      items.push({
        label: "🔄 Reiniciar",
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        command: { command: "ctm-workbench.restart", title: "Restart" },
      });
      items.push({
        label: "💾 Backup",
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        command: { command: "ctm-workbench.backup", title: "Backup" },
      });
    } catch (error) {
      items.push({
        label: "❌ Erro ao carregar status",
        collapsibleState: vscode.TreeItemCollapsibleState.None,
      });
      items.push({
        label: "📦 Setup Docker Image",
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        command: {
          command: "ctm-workbench.setupDockerImage",
          title: "Setup Docker Image",
          arguments: [],
        },
      });
    }

    return items;
  }

  private resolveContainerRuntime(): "docker" | null {
    return this.runtimeReady("docker") ? "docker" : null;
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
