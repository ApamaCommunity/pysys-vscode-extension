import * as vscode from "vscode";
import {PysysTreeItem, PysysProject, PysysWorkspace, PysysTest, PysysDirectory} from "./pysys";
import {PysysRunner} from "../utils/pysysRunner";
import {PysysTaskProvider, PysysTaskDefinition} from "../utils/pysysTaskProvider";
import {pickWorkspaceFolder, pickDirectory} from "../utils/fsUtils"
import * as path from "path";
import { promises } from "dns";
import { O_DIRECTORY } from "constants";
import { dir } from "console";
import { loadavg } from "os";

export class PysysProjectView implements vscode.TreeDataProvider<PysysTreeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<PysysTreeItem | undefined> = new vscode.EventEmitter<PysysTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<PysysTreeItem | undefined> = this._onDidChangeTreeData.event;

    private workspaceList: PysysWorkspace[] = [];
    private taskProvider: PysysTaskProvider;

    private config: vscode.WorkspaceConfiguration;
    private interpreter: string | undefined;

    constructor(private logger: vscode.OutputChannel,
        private workspaces: vscode.WorkspaceFolder[],
        private context?: vscode.ExtensionContext) {
        
        this.config = vscode.workspace.getConfiguration("pysys"); 
        this.interpreter = this.config.get("defaultInterpreterPath");
        workspaces.forEach( ws => this.workspaceList.push(new PysysWorkspace(ws.name,vscode.TreeItemCollapsibleState.Collapsed, ws, ws.uri.fsPath)));
        this.registerCommands();
        this.taskProvider = new PysysTaskProvider(workspaces[0]);
    }

    registerCommands(): void {
        if (this.context !== undefined) {
            this.context.subscriptions.push.apply(this.context.subscriptions, [
                vscode.commands.registerCommand("pysys.refresh", () => {
                    this.refresh();
                }),

                vscode.commands.registerCommand("pysys.createProject", async (element?: PysysWorkspace) => {
                    if(element) {
                        const folder = await pickWorkspaceFolder();

                        if (folder !== undefined) {
                            const projectDir = await pickDirectory(folder.uri);
                            if(projectDir) {
                                let makeProjectCmd : PysysRunner= new PysysRunner("makeProject", `${this.interpreter}`, this.logger);
                                let makeProject : string = await makeProjectCmd.run(projectDir,["makeproject"]);
                            }
                            this.refresh();
                        }
                    }
                }),

                vscode.commands.registerCommand("pysys.createTest", async (element?: PysysProject | PysysDirectory) => {
                    if(element) {
                        let projectDir;

                        if(element instanceof PysysProject) {

                            const result = await vscode.window.showQuickPick(["Add test", "Pick directory"], {
                                placeHolder: "Choose an option",
                                ignoreFocusOut: true,
                            });

                            if(result == "Pick directory") {
                                const folder = await pickWorkspaceFolder();
                                if (folder !== undefined) {
                                    projectDir = await pickDirectory(vscode.Uri.file(path.join(folder.uri.fsPath, element.label)));
                                }
                            } else {
                                projectDir = `${element.fsPath}`;
                            }
                        } else {
                            projectDir = `${element.fsPath}`
                        }
                        if(projectDir) {
                            const testName: string | undefined = await vscode.window.showInputBox({
                                placeHolder: "Choose a test name"
                            });
    
                            if(testName) {
                                let makeTestCmd : PysysRunner= new PysysRunner("makeTest", `${this.interpreter}`, this.logger);
                                try {
                                    let makeTest : string = await makeTestCmd.run(`${projectDir}`,[`make ${testName}`]);
                                } catch (error) {
                                    this.logger.appendLine(error)
                                }
                                
                                this.refresh();
                            }
                        }
                    }
                }),

                vscode.commands.registerCommand("pysys.editProject", async (element?: PysysProject) => {
                    if(element) {
                        const setting: vscode.Uri = vscode.Uri.parse(`${element.fsPath}/pysysproject.xml`)
                        vscode.workspace.openTextDocument(setting)
                            .then(doc => {
                                vscode.window.showTextDocument(doc)
                            });
                    }
                }),

                vscode.commands.registerCommand("pysys.runProject", async (element?: PysysProject) => {
                    if(element) {
                        const task : vscode.Task | undefined =
                            await this.taskProvider.runPysysTest(`${element.fsPath}`, element.ws);
                        if(task) {
                            await vscode.tasks.executeTask(task);
                        }
                    }
                }),

                vscode.commands.registerCommand("pysys.runProjectCustom", async (element?: PysysProject) => {
                    if(element) {
                        await this.taskProvider.runCustom(element);
                    }
                }),

                vscode.commands.registerCommand("pysys.editTest", async (element?: PysysTest) => {
                    if(element) {
                        const setting: vscode.Uri = vscode.Uri.parse(`${element.fsPath}/run.py`)
                        vscode.workspace.openTextDocument(setting)
                            .then(doc => {
                                vscode.window.showTextDocument(doc)
                            });
                    }
                }),

                vscode.commands.registerCommand("pysys.runTest", async (element?: PysysTest) => {
                    if(element) {
                        const task : vscode.Task | undefined =
                            await this.taskProvider.runPysysTest(`${element.fsPath}`, element.ws, [element.label]);
                        if(task) {
                            await vscode.tasks.executeTask(task);
                        }
                    }
                }),

                vscode.commands.registerCommand("pysys.openTaskConfig", async (element?: PysysWorkspace) => {
                    if(element) {
                        const setting: vscode.Uri = vscode.Uri.parse(`${element.fsPath}/.vscode/tasks.json`)
                        vscode.workspace.openTextDocument(setting)
                            .then(doc => {
                                vscode.window.showTextDocument(doc)
                            });
                    }
                }),

                vscode.commands.registerCommand("pysys.runDirectory", async (element?: PysysDirectory) => {
                    if(element) {
                        const task : vscode.Task | undefined =
                            await this.taskProvider.runPysysTest(`${element.fsPath}`, element.ws);
                        if(task) {
                            await vscode.tasks.executeTask(task);
                        }
                    }
                }),

                vscode.commands.registerCommand("pysys.runDirectoryCustom", async (element?: PysysDirectory) => {
                    if(element) {
                        await this.taskProvider.runCustom(element);
                    }
                }),
            ]);
        }
    }

    refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
    }


    getTreeItem(element: PysysTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: PysysDirectory | PysysProject | PysysWorkspace): Promise<undefined | PysysWorkspace[] | PysysProject[] | PysysTest[]> {
        if(element instanceof PysysWorkspace) {
            element.items = await element.scanProjects();
            return element.items;
        }

        else if(element instanceof PysysProject) {
            element.items = await element.scanTestsAndDirectories();
            return element.items;
        }

        else if(element instanceof PysysDirectory) {
            element.items = await element.scanTests();
            return element.items;
        }

        return this.workspaceList;
    }
}