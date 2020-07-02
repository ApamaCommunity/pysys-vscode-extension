import * as vscode from "vscode";

export class PysysTaskProvider implements vscode.TaskProvider {

    constructor() { return; }

    provideTasks(): vscode.ProviderResult<vscode.Task[]> {
        return [
            this.createProject()
        ];
    }

    resolveTask(_task: vscode.Task): vscode.Task | undefined {
        const task: vscode.Task = _task.definition.task;
        if(task) {
            return new vscode.Task(
                _task.definition,
                _task.source,
                "pysys"
            );
        }
    }

    private createProject(): vscode.Task {
        const task: vscode.Task = new vscode.Task(
            {"type": "pysys"},
            "create",
            "pysys"
        );
        return task;
    }
}
