import * as vscode from "vscode";
import {IPysysTreeItem, PysysProject, PysysWorkspace, PysysTest} from "./pysys";
import {PysysRunner} from "../utils/pysysRunner";
import * as path from "path";
import { promises } from "dns";
import { O_DIRECTORY } from "constants";
import { dir } from "console";

export class PysysProjectView implements vscode.TreeDataProvider<IPysysTreeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<IPysysTreeItem | undefined> = new vscode.EventEmitter<IPysysTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<IPysysTreeItem | undefined> = this._onDidChangeTreeData.event;

    private workspaceList: PysysWorkspace[] = [];

    constructor(private logger: vscode.OutputChannel,
        private workspaces: vscode.WorkspaceFolder[],
        private context?: vscode.ExtensionContext) {

        workspaces.forEach( ws => this.workspaceList.push(new PysysWorkspace(ws.name,vscode.TreeItemCollapsibleState.Collapsed, ws)));
        this.registerCommands();
    }

    registerCommands(): void {
        if (this.context !== undefined) {
            this.context.subscriptions.push.apply(this.context.subscriptions, [
                vscode.commands.registerCommand("pysys.refresh", () => {
                    this.refresh();
                }),

                vscode.commands.registerCommand("pysys.createProject", async (element?: PysysWorkspace) => {

                    let folder : vscode.WorkspaceFolder | undefined = undefined;
                    // check for a single workspace
                    if( vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length === 1) {
                        folder = vscode.workspace.workspaceFolders[0];
                    } else {
                        folder = await vscode.window.showWorkspaceFolderPick();
                    }

                    if (folder !== undefined) {
                        let ws_contents : [string,vscode.FileType][] = await vscode.workspace.fs.readDirectory(folder.uri);
                        const newDirLabel: string = "$(file-directory-create) add new directory"

                        let directories: vscode.QuickPickItem[] = [{
                                label: newDirLabel,
                                picked: true
                            },
                            ...ws_contents.filter( (curr) => {
                                if (curr[1] === vscode.FileType.Directory) {
                                    return curr[0];
                                }
                            })
                            .map(x => {
                                return {
                                        label: `$(file-directory) ${x[0]}`,
                                    }
                                })
                        ];

                        const result : vscode.QuickPickItem | undefined = await vscode.window.showQuickPick(directories, {
                            placeHolder: "Pick directory",
                            ignoreFocusOut: true,
                        });

                        if(result) {
                            let projectDir = undefined;

                            if(result.label === newDirLabel) {
                                const dirName : string | undefined = await vscode.window.showInputBox({
                                    placeHolder: "Directory name",
                                    ignoreFocusOut: true
                                });
                                if (dirName) {
                                    projectDir = path.join(folder.uri.fsPath,dirName);
                                    await vscode.workspace.fs.createDirectory(vscode.Uri.file(projectDir));
                                }
                            } else {
                                if(result) { projectDir = path.join(folder.uri.fsPath,result.label); }
                            }

                            if(projectDir) {
                                let makeProjectCmd : PysysRunner= new PysysRunner("makeProject", "python3 -m pysys", this.logger);
                                let makeProject : string = await makeProjectCmd.run(projectDir,["makeproject"]);
                            }

                            // we need to do some error checking on the command - we should check for errors in the
                            // make project output and do something if there are any

                            this.refresh();
                        }
                    }
                }),

                vscode.commands.registerCommand("pysys.createTest", async (element?: PysysProject) => {
                    if(element) {
                        const testName: string | undefined = await vscode.window.showInputBox({
                            placeHolder: "Choose a test name"
                        });

                        if(testName) {
                            let makeTestCmd : PysysRunner= new PysysRunner("makeTest", "python3 -m pysys", this.logger);
                            let makeTest : string = await makeTestCmd.run(`${element.ws.uri.fsPath}/${element.label}`,[`make ${testName}`]);

                            // we need to do some error checking on the command - we should check for errors in the
                            // make project output and do something if there are any

                            this.refresh();
                        }

                    } else {
                        // tODO
                    }
                }),

                vscode.commands.registerCommand("pysys.editProject", async (element?: PysysProject) => {
                    if(element) {
                        const setting: vscode.Uri = vscode.Uri.parse(`${element.ws.uri.fsPath}/${element.label}/pysysproject.xml`)
                        vscode.workspace.openTextDocument(setting)
                            .then(doc => {
                                vscode.window.showTextDocument(doc)
                            });
                    }
                }),

                vscode.commands.registerCommand("pysys.runProject", async (element?: PysysProject) => {
                    if(element) {
                        const task : vscode.Task | undefined =
                            await this.runPysysTest(`${element.ws.uri.fsPath}/${element.label}`, element.ws);
                        if(task) {
                            await vscode.tasks.executeTask(task);
                        }
                    }
                }),

                vscode.commands.registerCommand("pysys.editTest", async (element?: PysysTest) => {
                    if(element) {
                        const setting: vscode.Uri = vscode.Uri.parse(`${element.ws.uri.fsPath}/${element.parent}/${element.label}/run.py`)
                        vscode.workspace.openTextDocument(setting)
                            .then(doc => {
                                vscode.window.showTextDocument(doc)
                            });
                    }
                }),

                vscode.commands.registerCommand("pysys.runTest", async (element?: PysysTest) => {
                    if(element) {
                        const task : vscode.Task | undefined =
                            await this.runPysysTest(`${element.ws.uri.fsPath}/${element.parent}`, element.ws, [element.label]);
                        if(task) {
                            await vscode.tasks.executeTask(task);
                        }
                    }
                }),
            ]);
        }
    }

    refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
    }

    async runPysysTest(cwd: string, workspace?: vscode.WorkspaceFolder, extraargs?:string[]): Promise<vscode.Task | undefined> {
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
                {type: "shell", task: ""},
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

    getTreeItem(element: IPysysTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: PysysProject | PysysWorkspace): Promise<undefined | PysysWorkspace[] | PysysProject[] | PysysTest[]> {
        if(element instanceof PysysWorkspace) {
            element.items = await element.scanProjects();
            return element.items;
        }

        if(element instanceof PysysProject) {
            element.items = await element.scanTests();
            return element.items;
        }

        return this.workspaceList;
    }
}