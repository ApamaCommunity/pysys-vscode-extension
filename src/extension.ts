import * as vscode from "vscode";

import {PysysProjectView} from "./pysys/pysysView";
import { PysysRunner } from "./utils/pysysRunner";
import { PysysTaskProvider } from "./utils/pysysTaskProvider";

export async function activate(context: vscode.ExtensionContext): Promise<void> {

	const logger: vscode.OutputChannel = vscode.window.createOutputChannel("Pysys Extension");
	const interpreter: string = await getPysysInterpreter(logger);

	logger.show();
	logger.appendLine("Started Pysys Extension");
	logger.appendLine(vscode.env.remoteName || "local");
	let tprov: PysysTaskProvider | undefined = await buildStatusBar(logger,context);
	if(vscode.workspace.workspaceFolders !== undefined && tprov !== undefined) {
		const myClonedArray : vscode.WorkspaceFolder[] = [...vscode.workspace.workspaceFolders];
		vscode.window.registerTreeDataProvider(
			"pysysProjects",
			new PysysProjectView(logger, myClonedArray, context,tprov, interpreter)
		);
	}
}

async function buildStatusBar(logger: vscode.OutputChannel, context: vscode.ExtensionContext) : Promise<PysysTaskProvider|undefined> {
	if(context !== undefined) {
		let interpreter = await getPysysInterpreter(logger);
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
			let taskProvider = new PysysTaskProvider(version, interpreter);
			context.subscriptions.push(vscode.tasks.registerTaskProvider("pysys", taskProvider));
			return taskProvider;
		}
	}
	return undefined;
}

async function getPysysInterpreter(logger: vscode.OutputChannel): Promise<string> {
	let pysysVersion: string = "";

	//we will normally just scan through these elements
	let cmds: string[] = ["py -3", "python3", "python"];
	let cmd_env: string = "";

	//however if there is a config entry for interpreter_path then we want to use this 
	const override_cmd = vscode.workspace.getConfiguration("pysys").get("interpreter_path","na");
	if (override_cmd !== "na" && override_cmd !== "") {
		cmds = [override_cmd];
	}

	let errorMessage: string = "No python installation found, please visit https://www.python.org/downloads/";
	for(let cmd of cmds) {
		try {
			let versionCmd: PysysRunner = new PysysRunner("version", `${cmd} -V`, logger);
			let versionOutput: any = await versionCmd.run(".",[]);

			let version: string = "";
			if( versionOutput.stdout.indexOf("ersion") >= 0 || versionOutput.stdout.indexOf("ython") >= 0) {
				version = versionOutput.stdout.match(/([.-9])+/g)[0];

			} else if (versionOutput.stderr.indexOf("ersion") >= 0 || versionOutput.stdout.indexOf("ython") >= 0) {
				version = versionOutput.stderr.match(/([.-9])+/g)[0];
			}

			let pysysVersionCmd: PysysRunner = new PysysRunner("pysys version", `${cmd} -m pysys -V`, logger);
			let installed: boolean;
			try {
				let versionOutput: any = await pysysVersionCmd.run(".",[]);
				return `${cmd} -m pysys`;
			} catch (e) {}
			
			installed = await installPysys(cmd, logger);
			if(installed) {
				return `${cmd} -m pysys`;
			} else {
				errorMessage = "Pysys not installed";
				break;
			}
			
		} catch (e) {
			continue;
		}
	}

	vscode.window.showErrorMessage(errorMessage);
	throw Error("could not resolve a pysys installation");
}

async function installPysys(pythonCmd: string, logger: vscode.OutputChannel): Promise<boolean> {
	try {
		const choice = await vscode.window.showInformationMessage(
			"Pysys not found, would you like to install it ?",
			"Install Pysys", "ignore");   
		
		if(choice === "Install Pysys") {
			let installCmd : PysysRunner= new PysysRunner("install", `${pythonCmd} -m pip install --user`, logger);
			let install : string = await installCmd.run(".",["pysys"]);
			vscode.window.showInformationMessage("Pysys installed!");
			return true;
		}
	} catch (e) {
		vscode.window.showErrorMessage(e);
	}
	return false;
}

export function deactivate():void {
	return;
}
