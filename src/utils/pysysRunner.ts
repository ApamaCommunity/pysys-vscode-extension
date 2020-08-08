import { OutputChannel, window } from "vscode";
import { promisify } from "util";
import { ChildProcess, spawn } from "child_process";

// tslint:disable-next-line: typedef
const exec = promisify(require("child_process").exec);

export class PysysRunner {

  stdout: string = "";
  stderr: string = "";

  constructor(public name: string, public command: string, private logger: OutputChannel) {
  }

  async run(workingDir: string, args: string[]): Promise<any> {
    // if fails returns promise.reject including err
    return await exec(this.command + " " + args.join(" "), { cwd: workingDir });
  }
}


export class PysysAsyncRunner {

  stdout: string = "";
  stderr: string = "";
  child?: ChildProcess;

  constructor(public name: string, public command: string, private logger: OutputChannel) {
  }

  //
  // if you call this withShell = true it will run the command under that shell
  // this means the process may need to be managed separately as it may get detached
  // when you kill the parent (correlator behaves that way)
  // i use engine_management to control the running correlator
  //
  // tODO: pipes configuration might be worth passing as an argument
  //
  public start(args: string[], withShell: boolean, defaultHandlers: boolean): ChildProcess {
    this.logger = window.createOutputChannel(this.name);
    // this.logger.show();

    // n.B. this potentially will leave the correlator running - future work required...
    if (this.child && !this.child.killed) {
      this.logger.appendLine(this.name + " already started, stopping...");
      this.child.kill("SIGKILL");
    }

    this.logger.appendLine("Starting " + this.name);
    this.child = spawn(this.command + args.join(" "), {
      shell: withShell,
      stdio: ["pipe", "pipe", "pipe"]
    });

    // running with process Id
    this.logger.appendLine(this.name + " started, PID:" + this.child.pid);


    // notify the logger if it stopped....
    this.child.once("exit",
      (exitCode) => this.logger.appendLine(this.name + " stopped, exit code: " + exitCode)
    );

    if( defaultHandlers ) {
      if(this.child.stdout !== null ) {
        this.child.stdout.setEncoding("utf8");
        this.child.stdout.on("data", (data: string) => {
          if (this.logger) {
            this.logger.append(data);
          }
        });
    }
  }

    return this.child;
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.child && !this.child.killed) {
        this.child.once("exit", () => {
          resolve();
        });

        this.logger.appendLine("Process "+ this.name + " stopping...");
        this.child.kill("SIGINT");
        const attemptedToKill: ChildProcess = this.child;
        setTimeout(() => {
          if (!attemptedToKill.killed) {
            this.logger.appendLine("Failed to stop shell in 5 seconds, killing...");
            attemptedToKill.kill("SIGKILL");
          }
        }, 5000);
      } else {
        resolve();
      }
    });
  }
}