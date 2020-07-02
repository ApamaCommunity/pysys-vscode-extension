import * as vscode from "vscode";
import {PysysProjectView} from "./pysys/pysysView";

export function activate(context: vscode.ExtensionContext):void {

	const logger: vscode.OutputChannel = vscode.window.createOutputChannel("Pysys Extension");
	logger.show();
	logger.appendLine("Started Pysys Extension");

	if(vscode.workspace.workspaceFolders !== undefined) {
		const myClonedArray : vscode.WorkspaceFolder[] = [...vscode.workspace.workspaceFolders];

		vscode.window.registerTreeDataProvider(
			"pysysProjects",
			new PysysProjectView(logger, myClonedArray, context)
		);
	}
}

export function deactivate():void {
	return;
}
