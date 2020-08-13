import * as vscode from "vscode";

import {PysysProjectView} from "./pysys/pysysView";
import { PysysRunner } from "./utils/pysysRunner";
import { PysysTaskProvider } from "./utils/pysysTaskProvider";

export async function activate(context: vscode.ExtensionContext): Promise<void> {

	const logger: vscode.OutputChannel = vscode.window.createOutputChannel("Pysys Extension");
	logger.show();
	logger.appendLine("Started Pysys Extension");
	logger.appendLine(vscode.env.remoteName || "local");
	let tprov: PysysTaskProvider | undefined = await buildStatusBar(logger,context);
	if(vscode.workspace.workspaceFolders !== undefined && tprov !== undefined) {
		const myClonedArray : vscode.WorkspaceFolder[] = [...vscode.workspace.workspaceFolders];
		vscode.window.registerTreeDataProvider(
			"pysysProjects",
			new PysysProjectView(logger, myClonedArray, context,tprov)
		);
	}
}
async function buildStatusBar(logger: vscode.OutputChannel, context: vscode.ExtensionContext) : Promise<PysysTaskProvider|undefined> {
	if(context !== undefined) {
		let interpreter = " python3 -m pysys "; //default - no longer configurable 
		let versionCmd: PysysRunner = new PysysRunner("version", `${interpreter} --version`, logger);
		let versionOutput: any = await versionCmd.run(".",[]);
		let version = "";
		let versionlines: string[]  = versionOutput.stdout.split("\n");
		const pat : RegExp = new RegExp(/PySys.System.Test.Framework\s+\(version\s+([^\s]+)\s+on\s+Python\s+([^)]+)\)/);

		
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
			context.subscriptions.push(statusBar);        
			let taskProvider = new PysysTaskProvider(version);
			context.subscriptions.push(vscode.tasks.registerTaskProvider("pysys", taskProvider));
			return taskProvider;
		}
	}
	return undefined;
}

export function deactivate():void {
	return;
}
