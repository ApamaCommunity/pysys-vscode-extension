import * as vscode from "vscode"
import * as path from "path";

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