import * as vscode from "vscode";
import {PysysRunner} from "./pysysRunner";

export class PysysEnvironment {
    private config: vscode.WorkspaceConfiguration;

    constructor (private logger: vscode.OutputChannel) {
            this.config = vscode.workspace.getConfiguration("pysys");

            if(!this.config.get("defaultInterpreterPath")) {
                this.updateConfig();
            }
    }

    private async updateConfig() {
        const apamaConfig = vscode.workspace.getConfiguration("softwareag.apama");
        const apamahome: string | undefined = apamaConfig.get("apamahome");
        
        if(apamahome) {
            //todo set interpreter to run with apama
        }

        let pysysInterpreter = await this.getPysysInterpreter();
        if(pysysInterpreter) {
            await this.config.update("defaultInterpreterPath", pysysInterpreter, true);
            await this.config.update("defaultInterpreterPath", pysysInterpreter, false);
        } else {
            const installed: boolean = await this.installPysys();
            if(installed) {
                let pysysInterpreter = await this.getPysysInterpreter();
                await this.config.update("defaultInterpreterPath", pysysInterpreter, true);
                await this.config.update("defaultInterpreterPath", pysysInterpreter, false);
            }
        }
    }

    private async getPysysInterpreter(): Promise<string | undefined> {
        // here we check for python and pysys - extracting versions
        let pysysVersion: string = "";
        let cmds: string[] = ["pysys", "py -3 -m pysys", "python -m pysys", "python3 -m pysys"];

        //check if pysys is isnstalled
        for(let cmd of cmds) {
            try {
                let versionCmd: PysysRunner = new PysysRunner("version", `${cmd} --version`, this.logger);
                let versionOutput: any = await versionCmd.run(".",[]);
                
                return cmd;
            } catch (e) {
                continue;
            }
        }

        // todo move this to it's own function, above needs to rerun

        return undefined;
    }

    private async installPysys(): Promise<boolean> {
        try {
            let versionCmd: PysysRunner = new PysysRunner("version", `python3 --version`, this.logger);
            let versionOutput: any = await versionCmd.run(".",[]);

            const choice = await vscode.window.showInformationMessage(
                "Pysys not found, would you like to install it ?",
                "Install Pysys", "ignore");   
            
            if(choice === "Install Pysys") {
                let installCmd : PysysRunner= new PysysRunner("install", `python3 -m pip install`, this.logger);
                try {
                    let makeProject : string = await installCmd.run(".",["pysys"]);
                    vscode.window.showInformationMessage("Pysys installed!");
                    return true;
                } catch (e) {
                    vscode.window.showErrorMessage("Error when installing Pysys");
                }
            }
        } catch (e) {
            vscode.window.showErrorMessage("No python installation found, please visit https://www.python.org/downloads/");
        }
        return false;
    }

    private getPysysVersion(versionOutput: any): string | undefined {
        let versionlines: string[]  = versionOutput.stdout.split("\n");
        const pat : RegExp = new RegExp(/PySys.System.Test.Framework\s+\(version\s+([^\s]+)\s+on\s+Python\s+([^)]+)\)/);
        for (let index: number = 0; index < versionlines.length; index++) {
            const line : string = versionlines[index];
            if ( pat.test(line) ) {
                return RegExp.$1;
            }
        }
    }
}