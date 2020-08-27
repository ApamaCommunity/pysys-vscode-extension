import * as vscode from "vscode";
import { PysysDirectory, PysysProject, PysysTest } from "../pysys/pysys";
import path = require("path");
import semver = require("semver");

export interface PysysTaskDefinition extends vscode.TaskDefinition {
    type: string;
    task: string;
    cwd: string;
    tests: string;
    extraargs: string[];
    problemMatcher: string[];
    label: string
}

export class PysysTaskProvider implements vscode.TaskProvider {

    private config: vscode.WorkspaceConfiguration;
    private interpreter: string;
    public version: string;

    constructor(version: string, interpreter: string) {
        this.config = vscode.workspace.getConfiguration("pysys");
        this.interpreter = interpreter;
        this.version = version;
    }

    provideTasks(): vscode.ProviderResult<vscode.Task[]> {
        return [this.runTest()];
    }

    resolveTask(_task: vscode.Task): vscode.Task | undefined {
        const task: vscode.Task = _task.definition.task;
        if (task) {
            const definition: PysysTaskDefinition = <any>_task.definition;

            if (semver.lt(this.version, "1.6.0")) {
                return new vscode.Task(
                    definition,
                    definition.task,
                    "pysys",
                    new vscode.ShellExecution(`${this.interpreter} ${definition.task} ${definition.extraargs.join(' ')}`, {
                        cwd: definition.cwd
                    })
                );
            }
            return new vscode.Task(
                definition,
                definition.task,
                "pysys",
                new vscode.ShellExecution(`${this.interpreter} ${definition.task} ${definition.extraargs.join(' ')}`, {
                    cwd: definition.cwd,
                    env: { PYSYS_CONSOLE_FAILURE_ANNOTATIONS: '@testFile@:@testFileLine@: @category@: @outcome@ - @outcomeReason@ (@testIdAndCycle@)' }
                }),
                "$pysys"
            );
        }
        return undefined;
    }

    private runTest() {
        const task = new vscode.Task(
            {
                "type": "pysys",
                "task": "run",
                "cwd": "path_to/{PYSYS_PROJECT}",
                "project": "{PYSYS_PROJECT}",
                "extraargs": []
            },
            "run",
            "pysys",
            new vscode.ShellExecution(`${this.interpreter} run --help`),
            []
        );
        task.group = 'pysys';
        return task;
    }

    public async writeTaskConfig(definition: PysysTaskDefinition, ws: vscode.WorkspaceFolder) {
        const taskFile: string = path.join(ws.uri.fsPath, '.vscode', 'tasks.json');
        const taskFileURI = vscode.Uri.file(taskFile);
        let contents: string = '{\"version\": \"2.0.0\",\"tasks\": []}'; //default if !exists
        let tfExists: boolean;

        try {
            await vscode.workspace.fs.stat(taskFileURI);
            let doc = await vscode.workspace.openTextDocument(taskFileURI);
            contents = doc.getText(); //get existing
            tfExists = true;
        } catch (err) {
            tfExists = false;
        }

        const config = JSON.parse(contents);

        for (let task of config.tasks) {
            if (task.label === definition.label) {
                return;
            }
        }
        config.tasks.push(definition);

        if (config) {
            if (tfExists) {
                vscode.workspace.fs.writeFile(taskFileURI, Buffer.from(JSON.stringify(config, null, 4), 'utf8'));
            } else {
                const wsedit = new vscode.WorkspaceEdit();
                await wsedit.createFile(taskFileURI, { ignoreIfExists: true });
                await wsedit.insert(taskFileURI, new vscode.Position(0, 0), JSON.stringify(config, null, 4));
                await vscode.workspace.applyEdit(wsedit);
            }
            vscode.window.showTextDocument(taskFileURI);
        }
    }

    public async runPysysTest(cwd: string, workspace?: vscode.WorkspaceFolder, extraargs?: string[]): Promise<vscode.Task | undefined> {
        // let localargs : string[] = this.config.args.concat(['-p',this.config.port.toString()]);
        // console.log(extraargs);
        let localargs: string[] = [];
        if (extraargs) {
            localargs = extraargs;
        }

        let folder: vscode.WorkspaceFolder | undefined;
        if (workspace) {
            folder = workspace;
        } else {
            if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length === 1) {
                folder = vscode.workspace.workspaceFolders[0];
            } else {
                folder = await vscode.window.showWorkspaceFolderPick();
            }
        }
        if (folder) {
            if (semver.lt(this.version, "1.6.0")) {
                let task: vscode.Task = new vscode.Task(
                    { type: "pysys", task: "run" },
                    folder,
                    "pysys run",
                    "pysys",
                    new vscode.ShellExecution(`${this.interpreter} run ${localargs.join(" ")}`, [], {
                        cwd
                    }),
                    []
                );
                task.group = "test";
                return task;
            } else {
                let task: vscode.Task = new vscode.Task(
                    { type: "pysys", task: "run" },
                    folder,
                    "pysys run",
                    "pysys",
                    new vscode.ShellExecution(`${this.interpreter} run ${localargs.join(" ")}`, [], {
                        cwd,
                        env: { PYSYS_CONSOLE_FAILURE_ANNOTATIONS: '@testFile@:@testFileLine@: @category@: @outcome@ - @outcomeReason@ (@testIdAndCycle@)' }
                    }),
                    ["pysys"]
                );
                task.group = "test";
                return task;
            }
        }
        return undefined;
    }

    public async runCustom(element: PysysDirectory | PysysProject | PysysTest) {
        const tasks: vscode.Task[] = await vscode.tasks.fetchTasks();

        const testsDir: string = path.relative(element.ws.uri.fsPath, element.fsPath);
        let args: string[] | undefined;

        for (let task of tasks) {
            if (task.definition.tests === testsDir) {
                args = task.definition.extraargs;
            }
        }

        const cwd: string = element.fsPath;
        if (args) {
            const task: vscode.Task | undefined =
                await this.runPysysTest(cwd, element.ws, args);
            if (task) {
                await vscode.tasks.executeTask(task);
            }
        } else {
            const definition: PysysTaskDefinition = {
                type: "pysys",
                task: "run",
                cwd,
                tests: testsDir,
                extraargs: [],
                problemMatcher: ["$pysys"],
                label: `pysys: run ${testsDir}`
            };

            const out = await this.writeTaskConfig(definition, element.ws);
        }
    }
}
