import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class JobFileItem extends vscode.TreeItem {
  constructor(public readonly filePath: string) {
    super(path.basename(filePath), vscode.TreeItemCollapsibleState.None);
    this.description = "Job";
    this.tooltip = filePath;
    this.resourceUri = vscode.Uri.file(filePath);
    this.contextValue = "jobFile";
    this.command = {
      command: "vscode.open",
      title: "Abrir",
      arguments: [vscode.Uri.file(filePath)],
    };
  }
}

export class JobsTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
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
      return this.getJobFiles();
    }
    return [];
  }

  private getJobFiles(): vscode.TreeItem[] {
    const items: vscode.TreeItem[] = [];

    try {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) return items;

      const jobsPath = path.join(
        workspaceFolder.uri.fsPath,
        this.config.get<string>("jobsPath") || "jobs",
      );

      if (!fs.existsSync(jobsPath)) {
        return [
          {
            label: "📁 Criar pasta de jobs",
            collapsibleState: vscode.TreeItemCollapsibleState.None,
          },
        ];
      }

      const files = fs.readdirSync(jobsPath).filter((f) => f.endsWith(".json"));

      if (files.length === 0) {
        items.push({
          label: "➕ Criar novo job",
          collapsibleState: vscode.TreeItemCollapsibleState.None,
          command: { command: "ctm-job.create", title: "Create" },
        });
        return items;
      }

      items.push({
        label: "➕ Novo Job",
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        command: { command: "ctm-job.create", title: "Create" },
      });

      for (const file of files) {
        items.push(new JobFileItem(path.join(jobsPath, file)));
      }
    } catch (error) {
      console.error("Erro ao listar jobs:", error);
    }

    return items;
  }
}
