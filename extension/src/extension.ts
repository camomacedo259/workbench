import * as vscode from "vscode";
import { WorkbenchCommands } from "./commands/workbench";
import { JobCommands } from "./commands/jobs";
import { WorkbenchStatusProvider } from "./providers/statusProvider";
import { JobsTreeProvider } from "./providers/jobsTree";
import { StatusBarManager } from "./ui/statusBar";

let statusBarManager: StatusBarManager;

export function activate(context: vscode.ExtensionContext) {
  console.log("Control-M Workbench Manager ativado");

  const config = vscode.workspace.getConfiguration("ctm-workbench");

  // Inicializar gerenciador de status bar
  statusBarManager = new StatusBarManager();

  // Registrar providers de tree view
  const workbenchProvider = new WorkbenchStatusProvider(config);
  const jobsProvider = new JobsTreeProvider(config);

  vscode.window.registerTreeDataProvider(
    "ctm-workbench-explorer",
    workbenchProvider,
  );
  vscode.window.registerTreeDataProvider("ctm-jobs-explorer", jobsProvider);

  // Comandos do Workbench
  const workbenchCommands = new WorkbenchCommands(
    config,
    statusBarManager,
    context.extensionPath,
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ctm-workbench.setupDockerImage", () =>
      workbenchCommands.setupDockerImage(),
    ),
    vscode.commands.registerCommand("ctm-workbench.status", () =>
      workbenchCommands.status(),
    ),
    vscode.commands.registerCommand("ctm-workbench.start", () =>
      workbenchCommands.start(),
    ),
    vscode.commands.registerCommand("ctm-workbench.stop", () =>
      workbenchCommands.stop(),
    ),
    vscode.commands.registerCommand("ctm-workbench.restart", () =>
      workbenchCommands.restart(),
    ),
    vscode.commands.registerCommand("ctm-workbench.unpause", () =>
      workbenchCommands.unpause(),
    ),
    vscode.commands.registerCommand("ctm-workbench.open", () =>
      workbenchCommands.open(),
    ),
    vscode.commands.registerCommand("ctm-workbench.logs", () =>
      workbenchCommands.logs(),
    ),
    vscode.commands.registerCommand("ctm-workbench.backup", () =>
      workbenchCommands.backup(),
    ),
  );

  // Comandos de Jobs
  const jobCommands = new JobCommands(
    config,
    context.extensionPath,
    context.globalStorageUri.fsPath,
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ctm-job.create", () =>
      jobCommands.create(),
    ),
    vscode.commands.registerCommand("ctm-job.validate", () =>
      jobCommands.validate(),
    ),
    vscode.commands.registerCommand("ctm-job.deploy", () =>
      jobCommands.deploy(),
    ),
    vscode.commands.registerCommand("ctm-job.openDeployWeb", () =>
      jobCommands.openDeployWeb(),
    ),
    vscode.commands.registerCommand("ctm-job.openMonitorWeb", () =>
      jobCommands.openMonitorWeb(),
    ),
    vscode.commands.registerCommand("ctm-job.build", () => jobCommands.build()),
    vscode.commands.registerCommand("ctm-job.run", () => jobCommands.run()),
    vscode.commands.registerCommand(
      "ctm-job.validateFile",
      (item: { resourceUri?: vscode.Uri }) =>
        jobCommands.validate(item?.resourceUri),
    ),
    vscode.commands.registerCommand(
      "ctm-job.deployFile",
      (item: { resourceUri?: vscode.Uri }) =>
        jobCommands.deploy(item?.resourceUri),
    ),
    vscode.commands.registerCommand(
      "ctm-job.runFile",
      (item: { resourceUri?: vscode.Uri }) =>
        jobCommands.run(item?.resourceUri),
    ),
  );

  // Auto-refresh se configurado
  if (config.get("autoRefresh")) {
    const interval = config.get<number>("refreshInterval") || 30000;
    setInterval(() => {
      workbenchProvider.refresh();
      jobsProvider.refresh();
    }, interval);
  }

  vscode.window.showInformationMessage(
    "✅ Control-M Workbench Manager iniciado!",
  );
}

export function deactivate() {
  console.log("Control-M Workbench Manager desativado");
}
