import * as vscode from 'vscode';

export class PysysTaskProvider implements vscode.TaskProvider {

    constructor() {}

    provideTasks(): vscode.ProviderResult<vscode.Task[]> {
        return [
            this.createProject()
        ]
    }

    resolveTask(_task: vscode.Task): vscode.Task | undefined {
        const task = _task.definition.task;
        if(task) {
            return new vscode.Task(
                _task.definition,
                task,
                "pysys"
            )
        }
    }

    private createProject(): vscode.Task {
        const task = new vscode.Task(
            {"type": "pysys"},
            "create",
            "pysys"
        )
        return task;
    }
}
