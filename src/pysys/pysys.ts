import * as vscode from "vscode";
import * as path from "path";

export interface IPysysTreeItem {
    label: string;
    collapsibleState: vscode.TreeItemCollapsibleState;
    ws: vscode.WorkspaceFolder;
    items: IPysysTreeItem[];
    parent: String | undefined;
    contextValue: string;
}

export class PysysTest extends vscode.TreeItem implements IPysysTreeItem {
    constructor(
        public readonly label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public ws: vscode.WorkspaceFolder,
        public parent: String
    ) {
        super(label, collapsibleState);
    }
    items: IPysysTreeItem[] = [];
    contextValue = "test";
}

export class PysysProject extends vscode.TreeItem implements IPysysTreeItem {
    constructor(
        public readonly label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public ws: vscode.WorkspaceFolder,
        public parent: String
    ) {
        super(label, collapsibleState);
    }

    items: PysysTest[] = [];
    contextValue: string = "project";

    async scanTests(): Promise<PysysTest[]> {

        let result: PysysTest[] = [];

        let projectsPattern: vscode.RelativePattern = new vscode.RelativePattern(this.ws, `**/${this.label}/**/pysystest.xml`);

        let projectNames: vscode.Uri[] = await vscode.workspace.findFiles(projectsPattern);

        for (let index: number = 0; index < projectNames.length; index++) {
            const project: vscode.Uri = projectNames[index];
            let current: PysysTest = new PysysTest(
                path.relative(path.join(this.ws.uri.fsPath, this.label), path.dirname(project.fsPath)),
                vscode.TreeItemCollapsibleState.None,
                this.ws,
                this.label
            );
            result.push(current);
        }

        return result;
    }
}



export class PysysWorkspace extends vscode.TreeItem implements IPysysTreeItem {

    private workspaceList: PysysWorkspace[] = [];

    constructor(
        public readonly label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public ws: vscode.WorkspaceFolder,
    ) {
        super(label, collapsibleState);
    }

    items: PysysProject[] = [];
    contextValue = "workspace";
    parent = undefined;

    async scanProjects(): Promise<PysysProject[]> {

        let result: PysysProject[] = [];

        let projectsPattern: vscode.RelativePattern = new vscode.RelativePattern(this.ws, "**/pysysproject.xml");

        let projectNames: vscode.Uri[] = await vscode.workspace.findFiles(projectsPattern);

        for (let index: number = 0; index < projectNames.length; index++) {
            const project: vscode.Uri = projectNames[index];
            let current: PysysProject = new PysysProject(
                path.relative(this.ws.uri.fsPath, path.dirname(project.fsPath)),
                vscode.TreeItemCollapsibleState.Collapsed,
                this.ws,
                this.label
            );
            result.push(current);
        }

        return result;
    }
}


