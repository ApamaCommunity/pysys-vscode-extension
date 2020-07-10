import * as vscode from "vscode";
import * as path from "path";
import { PysysProject } from "../pysys/pysys";
import { Uri } from "vscode";

export async function pickWorkspaceFolder(): Promise<vscode.WorkspaceFolder | undefined> {
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length === 1) {
        return vscode.workspace.workspaceFolders[0];
    } else {
        return await vscode.window.showWorkspaceFolderPick();
    }
}

export async function pickDirectory(folder: vscode.Uri): Promise<string | undefined> {
    let ws_contents : [string,vscode.FileType, boolean?][] = await vscode.workspace.fs.readDirectory(folder);
    const newDirLabel: string = "$(file-directory-create) add new directory";

    for(let item of ws_contents) {
        const isProject = await folderIsPysys(vscode.Uri.file(`${folder.fsPath}/${item[0]}`));
        item.push(isProject);
    }

    let directories: vscode.QuickPickItem[] = [{
            label: newDirLabel,
            picked: true
        },
        ...ws_contents.filter( (curr) => {
            return (curr[1] === vscode.FileType.Directory && curr[2] === false);
        })
        .map(x => {
            return {
                label: `$(file-directory) ${x[0]}`,
            };
        })
    ];

    const result = await vscode.window.showQuickPick(directories, {
        placeHolder: "Pick directory",
        ignoreFocusOut: true,
    });

    let projectDir: string | undefined = undefined;
    if (result) {
        if (result.label === newDirLabel) {
            const dirName: string | undefined = await vscode.window.showInputBox({
                placeHolder: "Directory name",
                ignoreFocusOut: true
            });
            if (dirName) {
                projectDir = path.join(folder.fsPath, dirName);
                await vscode.workspace.fs.createDirectory(vscode.Uri.file(projectDir));
            }
        } else {
            projectDir = path.join(folder.fsPath, result.label.split("$(file-directory) ")[1]);
        }
    }

    return projectDir;
}

async function folderIsPysys(folder: vscode.Uri): Promise<boolean | undefined> {
    try {
        const contents : [string,vscode.FileType][] = await vscode.workspace.fs.readDirectory(folder);
        for (let item of contents) {
            if(item[0] === "pysysproject.xml" || item[0] === "pysystest.xml") {
                return true;
            }
        }
        return false;
    } catch (e) {
        return undefined;
    }
    
}

export async function buildProjectDirectory(project: PysysProject): Promise<{ [id: string]: string[] }> {
    let testPattern: vscode.RelativePattern = new vscode.RelativePattern(project.ws, `**/${project.label}/**/pysystest.xml`);
    let tests: vscode.Uri[] = await vscode.workspace.findFiles(testPattern);

    let directories: { [id: string]: string[] } = {};
    directories["."] = [];

    for (let test of tests) {
        const relPath: string = path.relative(path.join(project.ws.uri.fsPath, project.label), path.dirname(test.fsPath));
        if (relPath.includes("/")) {
            const dir = relPath.split("/")[0];
            const test = relPath.split("/")[1];
            if (directories[dir]) {
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
        .reduce((Obj: { [id: string]: string[] }, key: string) => {
            Obj[key] = directories[key].sort();
            return Obj;
        }, {});
}



export enum structureType { project, directory, test };

export async function getStructure(root: vscode.Uri): Promise<[vscode.Uri, structureType][]> {
    // this will give the contents of the current directory checking the subdir for pysystest.xml
    // [uri , type]
    let currentLevel: [vscode.Uri, structureType][] = [];

    //read directories and files
    const contents: [string, vscode.FileType][] = await vscode.workspace.fs.readDirectory(root);

    // now foreach entry - a tuple of dirname and type
    for (const entry of contents) {
        if (entry[1] === vscode.FileType.Directory) {
            // ok this is a directory, but does it contain a test
            let sType : structureType = structureType.directory;
            const children: [string, vscode.FileType][] = await vscode.workspace.fs.readDirectory(Uri.file( path.join(root.fsPath, entry[0])));
            for (const child of children) {
                if (child[1] === vscode.FileType.File && child[0] === 'pysystest.xml') {
                    sType = structureType.test;
                    break; //short circuit loop
                } 
            }
            currentLevel.push([Uri.file(entry[0]), sType]);
        }
    }
    return currentLevel;
}




