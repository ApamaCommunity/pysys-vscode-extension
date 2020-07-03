import * as vscode from "vscode";

interface PysysTaskDefinition extends vscode.TaskDefinition {
    task: string;
}

export class PysysTaskProvider implements vscode.TaskProvider {

    constructor() { return; }

    provideTasks(): vscode.ProviderResult<vscode.Task[]> {
        return [];
    }

    resolveTask(_task: vscode.Task): vscode.Task | undefined {
        const task: vscode.Task = _task.definition.task;
        if(task) {
            const definition: PysysTaskDefinition = <any>_task.definition;
            return new vscode.Task(
                definition,
                definition.task,
                "pysys",
                new vscode.ShellExecution(`python3 -m pysys ${definition.task}`)
            );
        }
        return undefined
    }

    public async runPysysTest(cwd: string, workspace?: vscode.WorkspaceFolder, extraargs?:string[]): Promise<vscode.Task | undefined> {
		// let localargs : string[] = this.config.args.concat(['-p',this.config.port.toString()]);
        // console.log(extraargs);
        let localargs: string[] = [];
		if( extraargs ) {
		    localargs = extraargs;
        }

        let folder: vscode.WorkspaceFolder | undefined;
        if(workspace) {
            folder = workspace;
        } else {
            if( vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length === 1) {
                folder = vscode.workspace.workspaceFolders[0];
            } else {
                folder = await vscode.window.showWorkspaceFolderPick();
            }
        }
        if(folder) {
            let task : vscode.Task = new vscode.Task(
                {type: "pysys", task: "run"},
                folder,
                "pysys run",
                "pysys",
                new vscode.ShellExecution(`python3 -m pysys run ${localargs.join(" ")}`, [], {
                    cwd
                }),
                ["pysys"]
            );
            task.group = "test";
            return task;
        }
		return undefined;
	}
}
