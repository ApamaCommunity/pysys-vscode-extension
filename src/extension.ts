import * as vscode from 'vscode';
import {PysysProjectView} from './pysys/pysysView';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('pysys-vscode-extension.helloWorld', () => {

		vscode.window.showInformationMessage('Hello World from pysys-vscode-extension!');
	});

	if(vscode.workspace.workspaceFolders !== undefined) {
		const myClonedArray = [...vscode.workspace.workspaceFolders];

		vscode.window.registerTreeDataProvider(
			'pysysProjects',
			new PysysProjectView(myClonedArray)
		);
	}

	context.subscriptions.push(disposable);
}

export function deactivate() {}
