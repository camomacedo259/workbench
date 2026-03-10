import * as vscode from "vscode";

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100,
    );
    this.statusBarItem.command = "ctm-workbench.status";
    this.update("Unknown");
    this.statusBarItem.show();
  }

  update(status: string) {
    const icon = status.includes("Up")
      ? "🟢"
      : status.includes("Paused")
        ? "🟡"
        : "🔴";
    this.statusBarItem.text = `${icon} Workbench: ${status.split(" ").slice(0, 2).join(" ").trim()}`;
  }

  dispose() {
    this.statusBarItem.dispose();
  }
}
