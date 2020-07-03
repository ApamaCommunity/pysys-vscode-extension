import * as vscode from "vscode";
import semver = require("semver");

import {PysysProjectView} from "./pysys/pysysView";
import { PysysRunner } from "./utils/pysysRunner";
import { PysysTaskProvider } from "./utils/pysysTaskProvider";

export async function activate(context: vscode.ExtensionContext): Promise<void> {

	const logger: vscode.OutputChannel = vscode.window.createOutputChannel("Pysys Extension");
	logger.show();
	logger.appendLine("Started Pysys Extension");


	// here we check for python and pysys - extracting versions
	let pythonVersion: string = "";
	let pysysVersion: string = "";
	let versionCmd: PysysRunner = new PysysRunner("version", "python3 -m pysys", logger);
	let versionOutput: any = await versionCmd.run(".",[]);
	let versionlines: string[]  = versionOutput.stdout.split("\n");
	const pat : RegExp = new RegExp(/PySys.System.Test.Framework\s+\(version\s+([^\s]+)\s+on\s+Python\s+([^)]+)\)/);
	for (let index: number = 0; index < versionlines.length; index++) {
		const line : string = versionlines[index];
		if ( pat.test(line) ) {
			pysysVersion = RegExp.$1;
			pythonVersion = RegExp.$2;
		}
	}

	// todo: here we need to also check for Apama - we can do this by checking to see if the extension
	// configuration exists - softwareag.apama.apamahome
	// if it does, we can try the test below to see if we can run with no modifications
	// otherwise we should ask whether to use the python/pysys included in here
	// we would do this by setting up the commands to run similarly to the apama extension where
	// we source the environment && run the command

	// check config
	// check user prefs - need to save them
	// set up commands similar to apama extension (use them in PysysRunner instead of hard coded ones)

	// semver.lt(corrVersion , "10.5.3") - we can use semver to restrict capabilities if required.
	// we should consider adding an element to the status bar at the bottom to show what versions
	// we are running with
	logger.appendLine( `PYSYS(${pysysVersion}) & PYTHON(${pythonVersion})` );


	if(vscode.workspace.workspaceFolders !== undefined) {
		const myClonedArray : vscode.WorkspaceFolder[] = [...vscode.workspace.workspaceFolders];

		vscode.window.registerTreeDataProvider(
			"pysysProjects",
			new PysysProjectView(logger, myClonedArray, context)
		);
		
		const taskprov = new PysysTaskProvider();
		context.subscriptions.push(vscode.tasks.registerTaskProvider("pysys", taskprov))
	}
}

export function deactivate():void {
	return;
}
