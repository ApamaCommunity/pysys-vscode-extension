import * as vscode from "vscode";
import {PysysRunner} from "./pysysRunner";

export class pysysEnvironment {
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

        const pysysInterpreter = await this.getPysysInterpreter();
        if(pysysInterpreter) {
            this.logger.appendLine(pysysInterpreter)
            this.config.update("defaultInterpreterPath", pysysInterpreter, true);
        }
    }

    private async getPysysInterpreter(): Promise<string | undefined> {
        // here we check for python and pysys - extracting versions
        let pysysVersion: string = "";
        let cmds: string[] = ["pysys", "py -3 -m pysys", "python -m pysys", "python3 -m pysys"];

        for(let cmd of cmds) {
            try {
                let versionCmd: PysysRunner = new PysysRunner("version", `${cmd} --version`, this.logger);
                let versionOutput: any = await versionCmd.run(".",[]);

                return cmd;
            } catch (e) {
                continue;
            }
        }

        return undefined;
        // let versionlines: string[]  = versionOutput.stdout.split("\n");
        // const pat : RegExp = new RegExp(/PySys.System.Test.Framework\s+\(version\s+([^\s]+)\s+on\s+Python\s+([^)]+)\)/);
        // for (let index: number = 0; index < versionlines.length; index++) {
        //     const line : string = versionlines[index];
        //     if ( pat.test(line) ) {
        //         return pysysVersion = RegExp.$1;
        //     }
        // }
    }
}