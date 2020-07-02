import * as vscode from 'vscode';
import {PysysTreeItem, PysysProject, PysysWorkspace, PysysTest} from './pysys';
import { promises } from 'dns';

export class PysysProjectView implements vscode.TreeDataProvider<PysysTreeItem> {

    private workspaceList: PysysWorkspace[] = []; 

    constructor(private workspaces: vscode.WorkspaceFolder[]) {
        workspaces.forEach( ws => this.workspaceList.push(new PysysWorkspace(ws.name,vscode.TreeItemCollapsibleState.Collapsed, ws)));
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