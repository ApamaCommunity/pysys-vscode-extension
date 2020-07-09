import * as vscode from "vscode"
import * as path from "path";
import { PysysProject } from "../pysys/pysys";

export async function pickWorkspaceFolder(): Promise<vscode.WorkspaceFolder | undefined> {
    if( vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length === 1) {
        return vscode.workspace.workspaceFolders[0];
    } else {
        return await vscode.window.showWorkspaceFolderPick();
    }
}

export async function pickDirectory(folder: vscode.Uri): Promise<string | undefined> {
    let ws_contents : [string,vscode.FileType][] = await vscode.workspace.fs.readDirectory(folder);
    const newDirLabel: string = "$(file-directory-create) add new directory"

    let directories: vscode.QuickPickItem[] = [{
            label: newDirLabel,
            picked: true
        },
        ...ws_contents.filter( async (curr) => {
            const isProject = await folderIsProject(vscode.Uri.file(folder.fsPath))
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

    const result = await vscode.window.showQuickPick(directories, {
        placeHolder: "Pick directory",
        ignoreFocusOut: true,
    });

    let projectDir: string | undefined = undefined;
    if(result) {
        if(result.label === newDirLabel) {
            const dirName : string | undefined = await vscode.window.showInputBox({
                placeHolder: "Directory name",
                ignoreFocusOut: true
            });
            if (dirName) {
                projectDir = path.join(folder.fsPath,dirName);
                await vscode.workspace.fs.createDirectory(vscode.Uri.file(projectDir));
            }
        } else {
            projectDir = path.join(folder.fsPath,result.label.split("$(file-directory) ")[1]);
        }
    }

    return projectDir
}

async function folderIsProject(folder: vscode.Uri): Promise<boolean> {
    const contents : [string,vscode.FileType][] = await vscode.workspace.fs.readDirectory(folder);
    for (let item of contents) {
        if(item[0] === "pysysproject.xml") {
            return true
        }
    }
    return false
}

export async function buildProjectDirectory(project: PysysProject): Promise<{[id: string]: string[]}> {
    let testPattern: vscode.RelativePattern = new vscode.RelativePattern(project.ws, `**/${project.label}/**/pysystest.xml`);
    let tests: vscode.Uri[] = await vscode.workspace.findFiles(testPattern);

    let directories: {[id: string]: string[]} = {};
    directories["."] = [];

    for (let test of tests) {
        const relPath: string = path.relative(path.join(project.ws.uri.fsPath, project.label), path.dirname(test.fsPath));
        if(relPath.includes("/")) {
            const dir = relPath.split("/")[0];
            const test = relPath.split("/")[1];
            if(directories[dir]) {
                directories[dir].push(test);
            } else {
                directories[dir] = [test];
            }
        }
        else {
            directories["."].push(relPath);
        }
    }

    return Object.keys(directories)
        .sort()
        .reduce((Obj: {[id: string]: string[]}, key: string) => {
            Obj[key] = directories[key].sort();
            return Obj;
        }, {})
}