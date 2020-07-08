import * as vscode from "vscode";
import * as path from "path";
import { PysysRunner } from "../utils/pysysRunner";

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
        public fsPath: string
    ) {
        super(label, collapsibleState);
    }
    items: PysysTest[] = [];
    contextValue: string = "directory";

    iconPath = {
        light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'folder.svg'),
        dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'folder.svg')
    };

    async scanTests(): Promise<PysysTest[]> {

        let result: PysysTest[] = [];

        let testsPattern: vscode.RelativePattern = new vscode.RelativePattern(this.ws, `**/${this.parent}/${this.label}/**/pysystest.xml`);
        let tests: vscode.Uri[] = await vscode.workspace.findFiles(testsPattern);

        for (let index: number = 0; index < tests.length; index++) {
            const test: vscode.Uri = tests[index];
            const label: string = path.relative(path.join(this.ws.uri.fsPath, this.parent, this.label), path.dirname(test.fsPath));
            let current: PysysTest = new PysysTest(
                label,
                vscode.TreeItemCollapsibleState.None,
                this.ws,
                this.label,
                `${this.fsPath}/${label}`
            );
            result.push(current);
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

    async scanTestsAndDirectories(): Promise<PysysTest[]> {

        let result: PysysTest[] = [];

        let testPattern: vscode.RelativePattern = new vscode.RelativePattern(this.ws, `**/${this.label}/**/pysystest.xml`);
        let tests: vscode.Uri[] = await vscode.workspace.findFiles(testPattern);

        let prevDir: string | undefined;
        let currDir: string | undefined;
        for (let index: number = 0; index < tests.length; index++) {
            const test: vscode.Uri = tests[index];
            const relPath: string = path.relative(path.join(this.ws.uri.fsPath, this.label), path.dirname(test.fsPath))

            let current: PysysDirectory | PysysTest;

            if(relPath.includes("/")) {
                if((currDir = relPath.split("/")[0]) !== prevDir) {
                    current = new PysysDirectory(
                        currDir,
                        vscode.TreeItemCollapsibleState.Collapsed,
                        this.ws,
                        this.label,
                        `${this.fsPath}/${currDir}`
                    );
                    prevDir = currDir
                } else continue;
            } else {
                current = new PysysTest(
                    relPath,
                    vscode.TreeItemCollapsibleState.None,
                    this.ws,
                    this.label,
                    `${this.fsPath}/${relPath}`
                );
            }

            result.push(current);
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


