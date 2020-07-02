import * as vscode from 'vscode';
import {PysysTreeItem, PysysProject, PysysWorkspace, PysysTest} from './pysys';
import {PysysRunner} from '../utils/pysysRunner';
import * as path from 'path';
import { promises } from 'dns';
import { O_DIRECTORY } from 'constants';
import { dir } from 'console';

export class PysysProjectView implements vscode.TreeDataProvider<PysysTreeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<PysysTreeItem | undefined> = new vscode.EventEmitter<PysysTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<PysysTreeItem | undefined> = this._onDidChangeTreeData.event;

    private workspaceList: PysysWorkspace[] = []; 
    
    constructor(private logger: vscode.OutputChannel, private workspaces: vscode.WorkspaceFolder[], private context?: vscode.ExtensionContext) {

        workspaces.forEach( ws => this.workspaceList.push(new PysysWorkspace(ws.name,vscode.TreeItemCollapsibleState.Collapsed, ws)));
        this.registerCommands();
    }
    
    registerCommands(): void {
        if (this.context !== undefined) {
            this.context.subscriptions.push.apply(this.context.subscriptions, [
                vscode.commands.registerCommand('pysys.refresh', () => {
                    this.refresh();
                }),

                vscode.commands.registerCommand('pysys.createProject', async (element?: PysysWorkspace) => {

                    let folder = undefined;
                    //check for a single workspace 
                    if( vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length === 1) {
                        folder = vscode.workspace.workspaceFolders[0];
                    } else {
                        folder = await vscode.window.showWorkspaceFolderPick();
                    }

                    if (folder !== undefined) {
                        let ws_contents = await vscode.workspace.fs.readDirectory(folder.uri);
                        
                        let directories: string[] = ["add new directory", 
                            ...ws_contents.filter( (curr) => {
                                if (curr[1] === vscode.FileType.Directory){
                                    return curr[0];
                                }
                            })
                            .map(x => x[0])
                        ];

                        const result = await vscode.window.showQuickPick(directories, {
                            placeHolder: 'Choose directory for pysys project'
                        });

                        if(result) {
                            let projectDir : string = folder.uri.fsPath;

                            if(result == "add new directory") {
                                const dirName = await vscode.window.showInputBox({
                                    placeHolder: "directory name"
                                });
                                if (dirName) {
                                    projectDir = path.join(folder.uri.fsPath,dirName);
                                    await vscode.workspace.fs.createDirectory(vscode.Uri.file(projectDir));
                                } 
                            } else {
                                if(result) projectDir = path.join(folder.uri.fsPath,result);
                            }
    
                            let makeProjectCmd = new PysysRunner("makeProject", "python3 -m pysys", this.logger);
                            let makeProject = await makeProjectCmd.run(projectDir,["makeproject"]);

                            this.refresh();
                        }
                    }
                }),

                vscode.commands.registerCommand('pysys.createTest', async (element?: PysysProject) => {
                    if(element) {
                        const testName = await vscode.window.showInputBox({
                            placeHolder: 'Choose a test name'
                        });

                        if(testName) {
                            let makeTestCmd = new PysysRunner("makeTest", "python3 -m pysys", this.logger);
                            let makeTest = await makeTestCmd.run(`${element.ws.uri.fsPath}/${element.label}`,[`make ${testName}`]);
                            this.refresh();
                        }

                    } else {
                        //TODO
                    }
                }),

                vscode.commands.registerCommand('pysys.runProject', async (element?: PysysProject) => {
                    if(element) {
                        const task = await this.runPysysTest(`${element.ws.uri.fsPath}/${element.label}`, element.ws);
                        if(task) {
                            await vscode.tasks.executeTask(task);
                        }
                    }
                })
            ]);
        }
    }

    refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
    }
    
    async runPysysTest(cwd: string, workspace?: vscode.WorkspaceFolder, extraargs?:string[]): Promise<vscode.Task | undefined> {
		// let localargs : string[] = this.config.args.concat(['-p',this.config.port.toString()]);
        //console.log(extraargs);
        let localargs: string[] = []
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
            let task = new vscode.Task(
                {type: "shell", task: ""},
                folder,
                "pysys run",
                "pysys",
                new vscode.ShellExecution("python3 -m pysys run", localargs, {
                    cwd
                }),
                ["pysys"]
            );
            task.group = 'test';
            return task;
        }
		return undefined;
	}

    getTreeItem(element: PysysTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: PysysProject): Promise<undefined | PysysWorkspace[] | PysysProject[] | PysysTest[]> {
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