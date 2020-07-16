import * as vscode from "vscode";
import {PysysTreeItem, PysysProject, PysysWorkspace, PysysTest, PysysDirectory} from "./pysys";
import {PysysRunner} from "../utils/pysysRunner";
import {PysysTaskProvider} from "../utils/pysysTaskProvider";
import {pickWorkspaceFolder, pickDirectory, createTaskConfig} from "../utils/fsUtils";
import * as path from "path";

export class PysysProjectView implements vscode.TreeDataProvider<PysysTreeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<PysysTreeItem | undefined> = new vscode.EventEmitter<PysysTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<PysysTreeItem | undefined> = this._onDidChangeTreeData.event;

    private workspaceList: PysysWorkspace[] = [];
    private taskProvider: PysysTaskProvider;

    private config: vscode.WorkspaceConfiguration;
    private interpreter: string | undefined;

    constructor(private logger: vscode.OutputChannel,
        private workspaces: vscode.WorkspaceFolder[],
        private context: vscode.ExtensionContext) {
        
        this.config = vscode.workspace.getConfiguration("pysys"); 
        this.interpreter = this.config.get("defaultInterpreterPath");
        this.registerCommands();
        this.buildStatusBar();
        this.taskProvider = new PysysTaskProvider();

        const collapedState = workspaces.length === 1 ? 
            vscode.TreeItemCollapsibleState.Expanded : 
            vscode.TreeItemCollapsibleState.Collapsed;

        workspaces.forEach( ws => this.workspaceList.push(
            new PysysWorkspace(ws.name, collapedState , ws, ws.uri.fsPath,context.asAbsolutePath('resources'))
        ));

        vscode.workspace.onDidChangeConfiguration(async e => {
			if(e.affectsConfiguration('pysys.defaultInterpreterPath')) {
				this.taskProvider = new PysysTaskProvider();
			}
		});
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

                            const result = await vscode.window.showQuickPick([
                                "$(diff-insert) Add project", 
                                "$(file-directory) Use existing directory"
                            ], {
                                placeHolder: "Choose",
                                ignoreFocusOut: true,
                            });

                            let projectDir: string | undefined;
                            if (result === "$(diff-insert) Add project") {
                                const projectName: string | undefined = await vscode.window.showInputBox({
                                    placeHolder: "enter a project name"
                                });

                                if (projectName) {
                                    projectDir = path.join(folder.uri.fsPath, projectName);
                                    await vscode.workspace.fs.createDirectory(vscode.Uri.file(projectDir));
                                }
                            } else if (result === "$(file-directory) Use existing directory") {
                                projectDir = await pickDirectory(folder.uri);
                            }

                            if(projectDir) {
                                let makeProjectCmd : PysysRunner= new PysysRunner("makeProject", `${this.interpreter}`, this.logger);
                                let makeProject : string = await makeProjectCmd.run(projectDir,["makeproject"]);
                            }
                            this.refresh();
                        }
                    }
                }),

                vscode.commands.registerCommand("pysys.createDir", async (element?: PysysProject | PysysDirectory) => {
                    if(element) {
                        let projectDir;

                        // on the project we can create a test directly under it, or we can create a folder
                        // that will contain tests (or other directories)

                        projectDir = `${element.fsPath}`; //same for project and directory
                        if(projectDir) {
                            
                            const dirName: string | undefined = await vscode.window.showInputBox({
                                placeHolder: "enter a directory"
                            });
    
                            if(dirName) {

                                let newDir : vscode.Uri = vscode.Uri.file(path.join(projectDir, dirName) );
                                vscode.workspace.fs.createDirectory(newDir);
                                this.refresh();
                            }
                        }
                    }
                }),

                vscode.commands.registerCommand("pysys.createTest", async (element?: PysysProject | PysysDirectory) => {
                    if(element) {

                        let projectDir = `${element.fsPath}`;
                        let askAgain: boolean = false;
                        let testName: string | undefined;
                        do {
                            testName = await vscode.window.showInputBox({
                                placeHolder: "Choose a test name"
                            });

                            if(testName === undefined) {
                                return;
                            }
    
                            const namePattern: vscode.RelativePattern = new vscode.RelativePattern(element.parent, `**/${testName}/pysystest.xml`);
                            const tests: vscode.Uri[] = await vscode.workspace.findFiles(namePattern);

                            askAgain = tests.length > 0 ? true : false;

                            if(askAgain) {
                                vscode.window.showWarningMessage("test name already exists in project - pick something else");
                            }

                        } while (askAgain);
                        
                        if(testName) {
                            let makeTestCmd : PysysRunner= new PysysRunner("makeTest", `${this.interpreter}`, this.logger);
                            try {
                                let makeTest : string = await makeTestCmd.run(`${projectDir}`,[`make ${testName}`]);
                            } catch (error) {
                                this.logger.appendLine(error);
                            }
                            
                            this.refresh();
                        }
                    }
                }),

                vscode.commands.registerCommand("pysys.editProject", async (element?: PysysProject) => {
                    if(element) {
                        //const setting: vscode.Uri = vscode.Uri.parse(`${element.fsPath}/pysysproject.xml`);
                        const setting: vscode.Uri = vscode.Uri.parse(path.join(element.fsPath, 'pysysproject.xml'));
                        let doc: vscode.TextDocument = await vscode.workspace.openTextDocument(setting.fsPath);
                        if( doc ) {
                            vscode.window.showTextDocument(doc);
                        }
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
                        const setting: vscode.Uri = vscode.Uri.parse(path.join(element.fsPath, 'run.py'));
                        let doc: vscode.TextDocument = await vscode.workspace.openTextDocument(setting.fsPath);
                        if( doc ) {
                            vscode.window.showTextDocument(doc);
                        }
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
                        const setting: vscode.Uri = vscode.Uri.parse(`${element.fsPath}/.vscode/tasks.json`);
                        vscode.workspace.openTextDocument(setting)
                            .then(doc => {
                                vscode.window.showTextDocument(doc);
                            }, async reason => {
                                await createTaskConfig(element.ws);
                                vscode.commands.executeCommand("pysys.openTaskConfig", element);
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

                vscode.commands.registerCommand("pysys.openShell", async (element?: PysysProject) => {
                    if(element) {
                        const terminals = vscode.window.terminals;
                        const name = `pysys - ${path.relative(element.ws.uri.fsPath, element.fsPath)}`;

                        for(let term of terminals) {
                            if (term.name === name) {
                                term.show(false);
                                return;
                            }
                        }

                        const term = vscode.window.createTerminal({
                            name,
                            cwd: `${element.fsPath}`
                        });
                        term.show(false);
                    }
                }),
            ]);
        }
    }

    async buildStatusBar() {
        if(this.context !== undefined) {
            let versionCmd: PysysRunner = new PysysRunner("version", `${this.interpreter} --version`, this.logger);
            let versionOutput: any = await versionCmd.run(".",[]);

            let versionlines: string[]  = versionOutput.stdout.split("\n");
            const pat : RegExp = new RegExp(/PySys.System.Test.Framework\s+\(version\s+([^\s]+)\s+on\s+Python\s+([^)]+)\)/);

            let version: string | undefined;
            for (let index: number = 0; index < versionlines.length; index++) {
            const line : string = versionlines[index];
                if ( pat.test(line) ) {
                    version = RegExp.$1;
                }
            }

            if(version) {
                let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
                statusBar.text = `Pysys ${version}`;
                statusBar.show();
                this.context.subscriptions.push(statusBar);
            }
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
            element.items = await element.scanTestsAndDirectories();
            return element.items;
        }

        return this.workspaceList;
    }
}