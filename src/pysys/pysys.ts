import * as vscode from "vscode";
import * as path from "path";
import { PysysRunner } from "../utils/pysysRunner";
import { buildProjectDirectory, getStructure, structureType } from "../utils/fsUtils";

export interface PysysTreeItem {
    label: string;
    collapsibleState: vscode.TreeItemCollapsibleState;
    ws: vscode.WorkspaceFolder;
    fsPath: string;
    items: PysysTreeItem[];
    parent: string | undefined;
    contextValue: string;
}


export class PysysTest extends vscode.TreeItem implements PysysTreeItem {
    constructor(
        public readonly label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public ws: vscode.WorkspaceFolder,
        public parent: string,
        public fsPath: string
    ) {
        super(label, collapsibleState);
    }
    items: PysysTreeItem[] = [];
    contextValue = "test";

    iconPath = {
        light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'power.svg'),
        dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'power.svg')
    };
}

export class PysysDirectory extends vscode.TreeItem implements PysysTreeItem {
    constructor(
        public readonly label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public ws: vscode.WorkspaceFolder,
        public parent: string,
        public fsPath: string,
        public items: PysysTest[]
    ) {
        super(label, collapsibleState);
    }
    contextValue: string = "directory";

    iconPath = {
        light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'folder.svg'),
        dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'folder.svg')
    };

    async scanTestsAndDirectories(): Promise<(PysysDirectory | PysysTest)[]> {

        const alldirectories : [vscode.Uri , structureType][] = await getStructure(vscode.Uri.file(this.fsPath));

        let result: (PysysDirectory | PysysTest)[] = [];

        let entry : any ; 
        for(const [u,t]  of  alldirectories) {
            const label: string = path.basename(u.fsPath);
            if(t === structureType.directory) {
                result.push(new PysysDirectory(
                    label,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    this.ws,
                    this.label,
                    `${this.fsPath}/${label}`,
                    []
                ));
            } else {
                result.push(new PysysTest(
                    label,
                    vscode.TreeItemCollapsibleState.None,
                    this.ws,
                    this.label,
                    `${this.fsPath}/${label}`
                ));
            }
        }

        return result;
    }

}

export class PysysProject extends vscode.TreeItem implements PysysTreeItem {
    constructor(
        public readonly label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public ws: vscode.WorkspaceFolder,
        public parent: string,
        public fsPath: string
    ) {
        super(label, collapsibleState);
    }

    items: PysysTest[] | PysysDirectory[] = [];
    contextValue: string = "project";

    iconPath = {
        light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'project.svg'),
        dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'project.svg')
    };

    

    async scanTestsAndDirectories(): Promise<(PysysDirectory | PysysTest)[]> {

        //const alldirectories : [vscode.Uri , structureType][] = await getStructure(vscode.Uri.file(path.join(this.ws.uri.fsPath,this.label)));
        const alldirectories : [vscode.Uri , structureType][] = await getStructure(vscode.Uri.file(this.fsPath));

        let result: (PysysDirectory | PysysTest)[] = [];

        let entry : any ; 
        for(const [u,t]  of  alldirectories) {
            const label: string = path.basename(u.fsPath);
            if(t === structureType.directory) {
                result.push(new PysysDirectory(
                    label,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    this.ws,
                    this.label,
                    `${this.fsPath}/${label}`,
                    []
                ));
            } else {
                result.push(new PysysTest(
                    label,
                    vscode.TreeItemCollapsibleState.None,
                    this.ws,
                    this.label,
                    `${this.fsPath}/${label}`
                ));
            }
        }

        return result;
    }

}

export class PysysWorkspace extends vscode.TreeItem implements PysysTreeItem {

    private workspaceList: PysysWorkspace[] = [];

    constructor(
        public readonly label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public ws: vscode.WorkspaceFolder,
        public fsPath: string,
    ) {
        super(label, collapsibleState);
    }

    items: PysysProject[] = [];
    contextValue = "workspace";
    parent = undefined;

    iconPath = {
        light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'folder.svg'),
        dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'folder.svg')
    };

    async scanProjects(): Promise<PysysProject[]> {

        let result: PysysProject[] = [];

        let projectsPattern: vscode.RelativePattern = new vscode.RelativePattern(this.ws, "**/pysysproject.xml");

        let projectNames: vscode.Uri[] = await vscode.workspace.findFiles(projectsPattern);

        for (let index: number = 0; index < projectNames.length; index++) {
            const project: vscode.Uri = projectNames[index];
            const label: string = path.relative(this.ws.uri.fsPath, path.dirname(project.fsPath));
            let current: PysysProject = new PysysProject(
                label,
                vscode.TreeItemCollapsibleState.Collapsed,
                this.ws,
                this.label,
                `${this.fsPath}/${label}`
            );
            result.push(current);
        }

        return result;
    }
}




