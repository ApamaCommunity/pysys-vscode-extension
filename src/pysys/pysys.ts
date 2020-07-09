import * as vscode from "vscode";
import * as path from "path";
import { PysysRunner } from "../utils/pysysRunner";
import { buildProjectDirectory } from "../utils/fsUtils"

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
        const directories = await buildProjectDirectory(this);

        let result: (PysysDirectory | PysysTest)[] = [];
        for(let key in directories) {
            if(key !== ".") {
                result.push(new PysysDirectory(
                    key,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    this.ws,
                    this.label,
                    `${this.fsPath}/${key}`,
                    []
                ))
                for(let test of directories[key]) {
                    result[result.length-1].items.push(new PysysTest(
                        test,
                        vscode.TreeItemCollapsibleState.None,
                        this.ws,
                        this.label,
                        `${this.fsPath}/${key}/${test}`
                    ))
                }
            } else {
                for(let test of directories[key]) {
                    result.push(new PysysTest(
                        test,
                        vscode.TreeItemCollapsibleState.None,
                        this.ws,
                        this.label,
                        `${this.fsPath}/${test}`
                    ))
                }
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


