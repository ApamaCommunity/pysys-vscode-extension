module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/extension.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/extension.ts":
/*!**************************!*\
  !*** ./src/extension.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __webpack_require__(/*! vscode */ "vscode");
const pysysView_1 = __webpack_require__(/*! ./pysys/pysysView */ "./src/pysys/pysysView.ts");
const pysysEnvironment_1 = __webpack_require__(/*! ./utils/pysysEnvironment */ "./src/utils/pysysEnvironment.ts");
const pysysTaskProvider_1 = __webpack_require__(/*! ./utils/pysysTaskProvider */ "./src/utils/pysysTaskProvider.ts");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = vscode.window.createOutputChannel("Pysys Extension");
        logger.show();
        logger.appendLine("Started Pysys Extension");
        const pysysEnv = new pysysEnvironment_1.PysysEnvironment(logger);
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
        if (vscode.workspace.workspaceFolders !== undefined) {
            const myClonedArray = [...vscode.workspace.workspaceFolders];
            vscode.window.registerTreeDataProvider("pysysProjects", new pysysView_1.PysysProjectView(logger, myClonedArray, context));
            const taskprov = new pysysTaskProvider_1.PysysTaskProvider();
            context.subscriptions.push(vscode.tasks.registerTaskProvider("pysys", taskprov));
        }
    });
}
exports.activate = activate;
function deactivate() {
    return;
}
exports.deactivate = deactivate;


/***/ }),

/***/ "./src/pysys/pysys.ts":
/*!****************************!*\
  !*** ./src/pysys/pysys.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PysysWorkspace = exports.PysysProject = exports.PysysDirectory = exports.PysysTest = void 0;
const vscode = __webpack_require__(/*! vscode */ "vscode");
const path = __webpack_require__(/*! path */ "path");
const fsUtils_1 = __webpack_require__(/*! ../utils/fsUtils */ "./src/utils/fsUtils.ts");
const resourcesPath = path.join(__dirname, '..', '..', 'resources');
class PysysTest extends vscode.TreeItem {
    constructor(label, collapsibleState, ws, parent, fsPath) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.ws = ws;
        this.parent = parent;
        this.fsPath = fsPath;
        this.items = [];
        this.contextValue = "test";
        this.iconPath = {
            light: path.join(__dirname, '..', '..', 'resources', 'light', 'power.svg'),
            dark: path.join(__dirname, '..', '..', 'resources', 'dark', 'power.svg')
        };
    }
}
exports.PysysTest = PysysTest;
class PysysDirectory extends vscode.TreeItem {
    constructor(label, collapsibleState, ws, parent, fsPath, items) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.ws = ws;
        this.parent = parent;
        this.fsPath = fsPath;
        this.items = items;
        this.contextValue = "directory";
        this.iconPath = {
            light: path.join(__dirname, '..', '..', 'resources', 'light', 'folder.svg'),
            dark: path.join(__dirname, '..', '..', 'resources', 'dark', 'folder.svg')
        };
    }
    scanTestsAndDirectories() {
        return __awaiter(this, void 0, void 0, function* () {
            const alldirectories = yield fsUtils_1.getStructure(vscode.Uri.file(this.fsPath));
            let result = [];
            let entry;
            for (const [u, t] of alldirectories) {
                const label = path.basename(u.fsPath);
                if (t === fsUtils_1.structureType.directory) {
                    result.push(new PysysDirectory(label, vscode.TreeItemCollapsibleState.Collapsed, this.ws, this.parent, `${this.fsPath}/${label}`, []));
                }
                else {
                    result.push(new PysysTest(label, vscode.TreeItemCollapsibleState.None, this.ws, this.parent, `${this.fsPath}/${label}`));
                }
            }
            return result;
        });
    }
}
exports.PysysDirectory = PysysDirectory;
class PysysProject extends vscode.TreeItem {
    constructor(label, collapsibleState, ws, parent, fsPath) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.ws = ws;
        this.parent = parent;
        this.fsPath = fsPath;
        this.items = [];
        this.contextValue = "project";
        this.iconPath = {
            light: path.join(__dirname, '..', '..', 'resources', 'light', 'project.svg'),
            dark: path.join(__dirname, '..', '..', 'resources', 'dark', 'project.svg')
        };
    }
    scanTestsAndDirectories() {
        return __awaiter(this, void 0, void 0, function* () {
            //const alldirectories : [vscode.Uri , structureType][] = await getStructure(vscode.Uri.file(path.join(this.ws.uri.fsPath,this.label)));
            const alldirectories = yield fsUtils_1.getStructure(vscode.Uri.file(this.fsPath));
            let result = [];
            let entry;
            for (const [u, t] of alldirectories) {
                const label = path.basename(u.fsPath);
                if (t === fsUtils_1.structureType.directory) {
                    result.push(new PysysDirectory(label, vscode.TreeItemCollapsibleState.Collapsed, this.ws, this.fsPath, `${this.fsPath}/${label}`, []));
                }
                else {
                    result.push(new PysysTest(label, vscode.TreeItemCollapsibleState.None, this.ws, this.fsPath, `${this.fsPath}/${label}`));
                }
            }
            return result;
        });
    }
}
exports.PysysProject = PysysProject;
class PysysWorkspace extends vscode.TreeItem {
    constructor(label, collapsibleState, ws, fsPath) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.ws = ws;
        this.fsPath = fsPath;
        this.workspaceList = [];
        this.items = [];
        this.contextValue = "workspace";
        this.parent = undefined;
        this.iconPath = {
            light: path.join(__dirname, '..', '..', 'resources', 'dark', 'folder.svg'),
            dark: path.join(__dirname, '..', '..', 'resources', 'dark', 'folder.svg')
        };
    }
    scanProjects() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            let projectsPattern = new vscode.RelativePattern(this.ws, "**/pysysproject.xml");
            let projectNames = yield vscode.workspace.findFiles(projectsPattern);
            for (let index = 0; index < projectNames.length; index++) {
                const project = projectNames[index];
                const label = path.relative(this.ws.uri.fsPath, path.dirname(project.fsPath));
                let current = new PysysProject(label, vscode.TreeItemCollapsibleState.Collapsed, this.ws, `${this.fsPath}/${label}`, `${this.fsPath}/${label}`);
                result.push(current);
            }
            return result;
        });
    }
}
exports.PysysWorkspace = PysysWorkspace;

/* WEBPACK VAR INJECTION */}.call(this, "/"))

/***/ }),

/***/ "./src/pysys/pysysView.ts":
/*!********************************!*\
  !*** ./src/pysys/pysysView.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PysysProjectView = void 0;
const vscode = __webpack_require__(/*! vscode */ "vscode");
const pysys_1 = __webpack_require__(/*! ./pysys */ "./src/pysys/pysys.ts");
const pysysRunner_1 = __webpack_require__(/*! ../utils/pysysRunner */ "./src/utils/pysysRunner.ts");
const pysysTaskProvider_1 = __webpack_require__(/*! ../utils/pysysTaskProvider */ "./src/utils/pysysTaskProvider.ts");
const fsUtils_1 = __webpack_require__(/*! ../utils/fsUtils */ "./src/utils/fsUtils.ts");
const path = __webpack_require__(/*! path */ "path");
class PysysProjectView {
    constructor(logger, workspaces, context) {
        this.logger = logger;
        this.workspaces = workspaces;
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.workspaceList = [];
        this.config = vscode.workspace.getConfiguration("pysys");
        this.interpreter = this.config.get("defaultInterpreterPath");
        this.registerCommands();
        this.buildStatusBar();
        this.taskProvider = new pysysTaskProvider_1.PysysTaskProvider();
        this.isFlatStructure = false;
        const collapedState = workspaces.length === 1 ?
            vscode.TreeItemCollapsibleState.Expanded :
            vscode.TreeItemCollapsibleState.Collapsed;
        workspaces.forEach(ws => this.workspaceList.push(new pysys_1.PysysWorkspace(ws.name, collapedState, ws, ws.uri.fsPath)));
        vscode.workspace.onDidChangeConfiguration((e) => __awaiter(this, void 0, void 0, function* () {
            if (e.affectsConfiguration('pysys.defaultInterpreterPath')) {
                this.taskProvider = new pysysTaskProvider_1.PysysTaskProvider();
            }
        }));
    }
    registerCommands() {
        if (this.context !== undefined) {
            this.context.subscriptions.push.apply(this.context.subscriptions, [
                vscode.commands.registerCommand("pysys.refresh", () => {
                    this.refresh();
                }),
                vscode.commands.registerCommand("pysys.createProject", (element) => __awaiter(this, void 0, void 0, function* () {
                    if (element) {
                        const folder = yield fsUtils_1.pickWorkspaceFolder();
                        if (folder !== undefined) {
                            const result = yield vscode.window.showQuickPick([
                                "$(diff-insert) Add project",
                                "$(file-directory) Use existing directory"
                            ], {
                                placeHolder: "Choose",
                                ignoreFocusOut: true,
                            });
                            let projectDir;
                            if (result === "$(diff-insert) Add project") {
                                const projectName = yield vscode.window.showInputBox({
                                    placeHolder: "enter a project name"
                                });
                                if (projectName) {
                                    projectDir = path.join(folder.uri.fsPath, projectName);
                                    yield vscode.workspace.fs.createDirectory(vscode.Uri.file(projectDir));
                                }
                            }
                            else if (result === "$(file-directory) Use existing directory") {
                                projectDir = yield fsUtils_1.pickDirectory(folder.uri);
                            }
                            if (projectDir) {
                                let makeProjectCmd = new pysysRunner_1.PysysRunner("makeProject", `${this.interpreter}`, this.logger);
                                let makeProject = yield makeProjectCmd.run(projectDir, ["makeproject"]);
                            }
                            this.refresh();
                        }
                    }
                })),
                vscode.commands.registerCommand("pysys.createDir", (element) => __awaiter(this, void 0, void 0, function* () {
                    if (element) {
                        let projectDir;
                        // on the project we can create a test directly under it, or we can create a folder
                        // that will contain tests (or other directories)
                        projectDir = `${element.fsPath}`; //same for project and directory
                        if (projectDir) {
                            const dirName = yield vscode.window.showInputBox({
                                placeHolder: "enter a directory"
                            });
                            if (dirName) {
                                let newDir = vscode.Uri.file(path.join(projectDir, dirName));
                                vscode.workspace.fs.createDirectory(newDir);
                                this.refresh();
                            }
                        }
                    }
                })),
                vscode.commands.registerCommand("pysys.createTest", (element) => __awaiter(this, void 0, void 0, function* () {
                    if (element) {
                        let projectDir = `${element.fsPath}`;
                        let askAgain = false;
                        let testName;
                        do {
                            testName = yield vscode.window.showInputBox({
                                placeHolder: "Choose a test name"
                            });
                            if (testName === undefined) {
                                return;
                            }
                            const namePattern = new vscode.RelativePattern(element.parent, `**/${testName}/pysystest.xml`);
                            const tests = yield vscode.workspace.findFiles(namePattern);
                            askAgain = tests.length > 0 ? true : false;
                            if (askAgain) {
                                vscode.window.showWarningMessage("test name already exists in project - pick something else");
                            }
                        } while (askAgain);
                        if (testName) {
                            let makeTestCmd = new pysysRunner_1.PysysRunner("makeTest", `${this.interpreter}`, this.logger);
                            try {
                                let makeTest = yield makeTestCmd.run(`${projectDir}`, [`make ${testName}`]);
                            }
                            catch (error) {
                                this.logger.appendLine(error);
                            }
                            this.refresh();
                        }
                    }
                })),
                vscode.commands.registerCommand("pysys.editProject", (element) => __awaiter(this, void 0, void 0, function* () {
                    if (element) {
                        //const setting: vscode.Uri = vscode.Uri.parse(`${element.fsPath}/pysysproject.xml`);
                        const setting = vscode.Uri.parse(path.join(element.fsPath, 'pysysproject.xml'));
                        let doc = yield vscode.workspace.openTextDocument(setting.fsPath);
                        if (doc) {
                            vscode.window.showTextDocument(doc);
                        }
                    }
                })),
                vscode.commands.registerCommand("pysys.runProject", (element) => __awaiter(this, void 0, void 0, function* () {
                    if (element) {
                        const task = yield this.taskProvider.runPysysTest(`${element.fsPath}`, element.ws);
                        if (task) {
                            yield vscode.tasks.executeTask(task);
                        }
                    }
                })),
                vscode.commands.registerCommand("pysys.runProjectCustom", (element) => __awaiter(this, void 0, void 0, function* () {
                    if (element) {
                        yield this.taskProvider.runCustom(element);
                    }
                })),
                vscode.commands.registerCommand("pysys.editTest", (element) => __awaiter(this, void 0, void 0, function* () {
                    if (element) {
                        const setting = vscode.Uri.parse(path.join(element.fsPath, 'run.py'));
                        let doc = yield vscode.workspace.openTextDocument(setting.fsPath);
                        if (doc) {
                            vscode.window.showTextDocument(doc);
                        }
                    }
                })),
                vscode.commands.registerCommand("pysys.runTest", (element) => __awaiter(this, void 0, void 0, function* () {
                    if (element) {
                        // to support flat view
                        const label = element.label.split("/");
                        const task = yield this.taskProvider.runPysysTest(`${element.fsPath}`, element.ws, [label[label.length - 1]]);
                        if (task) {
                            yield vscode.tasks.executeTask(task);
                        }
                    }
                })),
                vscode.commands.registerCommand("pysys.openTaskConfig", (element) => __awaiter(this, void 0, void 0, function* () {
                    if (element) {
                        const setting = vscode.Uri.parse(`${element.fsPath}/.vscode/tasks.json`);
                        vscode.workspace.openTextDocument(setting)
                            .then(doc => {
                            vscode.window.showTextDocument(doc);
                        }, (reason) => __awaiter(this, void 0, void 0, function* () {
                            yield fsUtils_1.createTaskConfig(element.ws);
                            vscode.commands.executeCommand("pysys.openTaskConfig", element);
                        }));
                    }
                })),
                vscode.commands.registerCommand("pysys.runDirectory", (element) => __awaiter(this, void 0, void 0, function* () {
                    if (element) {
                        const task = yield this.taskProvider.runPysysTest(`${element.fsPath}`, element.ws);
                        if (task) {
                            yield vscode.tasks.executeTask(task);
                        }
                    }
                })),
                vscode.commands.registerCommand("pysys.runDirectoryCustom", (element) => __awaiter(this, void 0, void 0, function* () {
                    if (element) {
                        yield this.taskProvider.runCustom(element);
                    }
                })),
                vscode.commands.registerCommand("pysys.openShell", (element) => __awaiter(this, void 0, void 0, function* () {
                    if (element) {
                        const terminals = vscode.window.terminals;
                        const name = `pysys - ${path.relative(element.ws.uri.fsPath, element.fsPath)}`;
                        for (let term of terminals) {
                            if (term.name === name) {
                                term.show(false);
                                return;
                            }
                        }
                        const term = vscode.window.createTerminal({
                            name,
                            cwd: `${element.fsPath}`
                        });
                        term.show(false);
                    }
                })),
                vscode.commands.registerCommand("pysys.toggleFlatView", (element) => __awaiter(this, void 0, void 0, function* () {
                    if (element) {
                        this.isFlatStructure = !this.isFlatStructure;
                        this.refresh();
                    }
                })),
            ]);
        }
    }
    buildStatusBar() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.context !== undefined) {
                let versionCmd = new pysysRunner_1.PysysRunner("version", `${this.interpreter} --version`, this.logger);
                let versionOutput = yield versionCmd.run(".", []);
                let versionlines = versionOutput.stdout.split("\n");
                const pat = new RegExp(/PySys.System.Test.Framework\s+\(version\s+([^\s]+)\s+on\s+Python\s+([^)]+)\)/);
                let version;
                for (let index = 0; index < versionlines.length; index++) {
                    const line = versionlines[index];
                    if (pat.test(line)) {
                        version = RegExp.$1;
                    }
                }
                if (version) {
                    let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
                    statusBar.text = `Pysys ${version}`;
                    statusBar.show();
                    this.context.subscriptions.push(statusBar);
                }
            }
        });
    }
    listTests(ws) {
        return __awaiter(this, void 0, void 0, function* () {
            let testPattern = new vscode.RelativePattern(ws.uri.fsPath, "**/pysystest.xml");
            let testNames = yield vscode.workspace.findFiles(testPattern);
            let result = [];
            testNames.forEach(test => {
                const label = path.relative(ws.uri.fsPath, path.dirname(test.fsPath));
                let current = new pysys_1.PysysTest(label, vscode.TreeItemCollapsibleState.None, ws, `${ws.uri.fsPath}/${label}`, `${ws.uri.fsPath}/${label}`);
                result.push(current);
            });
            return result;
        });
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (element instanceof pysys_1.PysysWorkspace) {
                if (this.isFlatStructure) {
                    return yield this.listTests(element.ws);
                }
                else {
                    element.items = yield element.scanProjects();
                    return element.items;
                }
            }
            else if (element instanceof pysys_1.PysysProject) {
                element.items = yield element.scanTestsAndDirectories();
                return element.items;
            }
            else if (element instanceof pysys_1.PysysDirectory) {
                element.items = yield element.scanTestsAndDirectories();
                return element.items;
            }
            return this.workspaceList;
        });
    }
}
exports.PysysProjectView = PysysProjectView;


/***/ }),

/***/ "./src/utils/fsUtils.ts":
/*!******************************!*\
  !*** ./src/utils/fsUtils.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskConfig = exports.getStructure = exports.structureType = exports.buildProjectDirectory = exports.pickDirectory = exports.pickWorkspaceFolder = void 0;
const vscode = __webpack_require__(/*! vscode */ "vscode");
const path = __webpack_require__(/*! path */ "path");
const vscode_1 = __webpack_require__(/*! vscode */ "vscode");
function pickWorkspaceFolder() {
    return __awaiter(this, void 0, void 0, function* () {
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length === 1) {
            return vscode.workspace.workspaceFolders[0];
        }
        else {
            return yield vscode.window.showWorkspaceFolderPick();
        }
    });
}
exports.pickWorkspaceFolder = pickWorkspaceFolder;
function pickDirectory(folder) {
    return __awaiter(this, void 0, void 0, function* () {
        let ws_contents = yield vscode.workspace.fs.readDirectory(folder);
        const newDirLabel = "$(file-directory-create) add new directory";
        for (let item of ws_contents) {
            const isProject = yield folderIsPysys(vscode.Uri.file(`${folder.fsPath}/${item[0]}`));
            item.push(isProject);
        }
        let directories = [{
                label: newDirLabel,
                picked: true
            },
            ...ws_contents.filter((curr) => {
                return (curr[1] === vscode.FileType.Directory && curr[2] === false);
            })
                .map(x => {
                return {
                    label: `$(file-directory) ${x[0]}`,
                };
            })
        ];
        const result = yield vscode.window.showQuickPick(directories, {
            placeHolder: "Pick directory",
            ignoreFocusOut: true,
        });
        let projectDir = undefined;
        if (result) {
            if (result.label === newDirLabel) {
                const dirName = yield vscode.window.showInputBox({
                    placeHolder: "Directory name",
                    ignoreFocusOut: true
                });
                if (dirName) {
                    projectDir = path.join(folder.fsPath, dirName);
                    yield vscode.workspace.fs.createDirectory(vscode.Uri.file(projectDir));
                }
            }
            else {
                projectDir = path.join(folder.fsPath, result.label.split("$(file-directory) ")[1]);
            }
        }
        return projectDir;
    });
}
exports.pickDirectory = pickDirectory;
function folderIsPysys(folder) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const contents = yield vscode.workspace.fs.readDirectory(folder);
            for (let item of contents) {
                if (item[0] === "pysysproject.xml" || item[0] === "pysystest.xml") {
                    return true;
                }
            }
            return false;
        }
        catch (e) {
            return undefined;
        }
    });
}
function buildProjectDirectory(project) {
    return __awaiter(this, void 0, void 0, function* () {
        let testPattern = new vscode.RelativePattern(project.ws, `**/${project.label}/**/pysystest.xml`);
        let tests = yield vscode.workspace.findFiles(testPattern);
        let directories = {};
        directories["."] = [];
        for (let test of tests) {
            const relPath = path.relative(path.join(project.ws.uri.fsPath, project.label), path.dirname(test.fsPath));
            if (relPath.includes("/")) {
                const dir = relPath.split("/")[0];
                const test = relPath.split("/")[1];
                if (directories[dir]) {
                    directories[dir].push(test);
                }
                else {
                    directories[dir] = [test];
                }
            }
            else {
                directories["."].push(relPath);
            }
        }
        return Object.keys(directories)
            .sort()
            .reduce((Obj, key) => {
            Obj[key] = directories[key].sort();
            return Obj;
        }, {});
    });
}
exports.buildProjectDirectory = buildProjectDirectory;
var structureType;
(function (structureType) {
    structureType[structureType["project"] = 0] = "project";
    structureType[structureType["directory"] = 1] = "directory";
    structureType[structureType["test"] = 2] = "test";
})(structureType = exports.structureType || (exports.structureType = {}));
;
function getStructure(root) {
    return __awaiter(this, void 0, void 0, function* () {
        // this will give the contents of the current directory checking the subdir for pysystest.xml
        // [uri , type]
        let currentLevel = [];
        //read directories and files
        const contents = yield vscode.workspace.fs.readDirectory(root);
        // now foreach entry - a tuple of dirname and type
        for (const entry of contents) {
            if (entry[1] === vscode.FileType.Directory) {
                // ok this is a directory, but does it contain a test
                let sType = structureType.directory;
                const children = yield vscode.workspace.fs.readDirectory(vscode_1.Uri.file(path.join(root.fsPath, entry[0])));
                for (const child of children) {
                    if (child[1] === vscode.FileType.File && child[0] === 'pysystest.xml') {
                        sType = structureType.test;
                        break; //short circuit loop
                    }
                }
                currentLevel.push([vscode_1.Uri.file(entry[0]), sType]);
            }
        }
        return currentLevel;
    });
}
exports.getStructure = getStructure;
function createTaskConfig(ws) {
    return __awaiter(this, void 0, void 0, function* () {
        const taskFile = path.join(ws.uri.fsPath, '.vscode', 'tasks.json');
        const taskFileURI = vscode.Uri.file(taskFile);
        let contents = '{\"version\": \"2.0.0\",\"tasks\": []}';
        const config = JSON.parse(contents);
        const wsedit = new vscode.WorkspaceEdit();
        wsedit.createFile(taskFileURI, { ignoreIfExists: true });
        wsedit.insert(taskFileURI, new vscode.Position(0, 0), JSON.stringify(config, null, 4));
        yield vscode.workspace.applyEdit(wsedit);
    });
}
exports.createTaskConfig = createTaskConfig;


/***/ }),

/***/ "./src/utils/pysysEnvironment.ts":
/*!***************************************!*\
  !*** ./src/utils/pysysEnvironment.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PysysEnvironment = void 0;
const vscode = __webpack_require__(/*! vscode */ "vscode");
const pysysRunner_1 = __webpack_require__(/*! ./pysysRunner */ "./src/utils/pysysRunner.ts");
class PysysEnvironment {
    constructor(logger) {
        this.logger = logger;
        this.config = vscode.workspace.getConfiguration("pysys");
        if (!this.config.get("defaultInterpreterPath")) {
            this.updateConfig();
        }
    }
    updateConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const apamaConfig = vscode.workspace.getConfiguration("softwareag.apama");
            const apamahome = apamaConfig.get("apamahome");
            if (apamahome) {
                //todo set interpreter to run with apama
            }
            let pysysInterpreter = yield this.getPysysInterpreter();
            if (pysysInterpreter) {
                yield this.config.update("defaultInterpreterPath", pysysInterpreter, true);
                yield this.config.update("defaultInterpreterPath", pysysInterpreter, false);
            }
            else {
                const installed = yield this.installPysys();
                if (installed) {
                    let pysysInterpreter = yield this.getPysysInterpreter();
                    yield this.config.update("defaultInterpreterPath", pysysInterpreter, true);
                    yield this.config.update("defaultInterpreterPath", pysysInterpreter, false);
                }
            }
        });
    }
    getPysysInterpreter() {
        return __awaiter(this, void 0, void 0, function* () {
            // here we check for python and pysys - extracting versions
            let pysysVersion = "";
            let cmds = ["pysys", "py -3 -m pysys", "python -m pysys", "python3 -m pysys"];
            //check if pysys is isnstalled
            for (let cmd of cmds) {
                try {
                    let versionCmd = new pysysRunner_1.PysysRunner("version", `${cmd} --version`, this.logger);
                    let versionOutput = yield versionCmd.run(".", []);
                    return cmd;
                }
                catch (e) {
                    continue;
                }
            }
            // todo move this to it's own function, above needs to rerun
            return undefined;
        });
    }
    installPysys() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let versionCmd = new pysysRunner_1.PysysRunner("version", `python3 --version`, this.logger);
                let versionOutput = yield versionCmd.run(".", []);
                const choice = yield vscode.window.showInformationMessage("Pysys not found, would you like to install it ?", "Install Pysys", "ignore");
                if (choice === "Install Pysys") {
                    let installCmd = new pysysRunner_1.PysysRunner("install", `python3 -m pip install`, this.logger);
                    try {
                        let makeProject = yield installCmd.run(".", ["pysys"]);
                        vscode.window.showInformationMessage("Pysys installed!");
                        return true;
                    }
                    catch (e) {
                        vscode.window.showErrorMessage("Error when installing Pysys");
                    }
                }
            }
            catch (e) {
                vscode.window.showErrorMessage("No python installation found, please visit https://www.python.org/downloads/");
            }
            return false;
        });
    }
    getPysysVersion(versionOutput) {
        let versionlines = versionOutput.stdout.split("\n");
        const pat = new RegExp(/PySys.System.Test.Framework\s+\(version\s+([^\s]+)\s+on\s+Python\s+([^)]+)\)/);
        for (let index = 0; index < versionlines.length; index++) {
            const line = versionlines[index];
            if (pat.test(line)) {
                return RegExp.$1;
            }
        }
    }
}
exports.PysysEnvironment = PysysEnvironment;


/***/ }),

/***/ "./src/utils/pysysRunner.ts":
/*!**********************************!*\
  !*** ./src/utils/pysysRunner.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PysysAsyncRunner = exports.PysysRunner = void 0;
const vscode_1 = __webpack_require__(/*! vscode */ "vscode");
const util_1 = __webpack_require__(/*! util */ "util");
const child_process_1 = __webpack_require__(/*! child_process */ "child_process");
// tslint:disable-next-line: typedef
const exec = util_1.promisify(__webpack_require__(/*! child_process */ "child_process").exec);
class PysysRunner {
    constructor(name, command, logger) {
        this.name = name;
        this.command = command;
        this.logger = logger;
        this.stdout = "";
        this.stderr = "";
    }
    run(workingDir, args) {
        return __awaiter(this, void 0, void 0, function* () {
            // if fails returns promise.reject including err
            return yield exec(this.command + " " + args.join(" "), { cwd: workingDir });
        });
    }
}
exports.PysysRunner = PysysRunner;
class PysysAsyncRunner {
    constructor(name, command, logger) {
        this.name = name;
        this.command = command;
        this.logger = logger;
        this.stdout = "";
        this.stderr = "";
    }
    //
    // if you call this withShell = true it will run the command under that shell
    // this means the process may need to be managed separately as it may get detached
    // when you kill the parent (correlator behaves that way)
    // i use engine_management to control the running correlator
    //
    // tODO: pipes configuration might be worth passing as an argument
    //
    start(args, withShell, defaultHandlers) {
        this.logger = vscode_1.window.createOutputChannel(this.name);
        // this.logger.show();
        // n.B. this potentially will leave the correlator running - future work required...
        if (this.child && !this.child.killed) {
            this.logger.appendLine(this.name + " already started, stopping...");
            this.child.kill("SIGKILL");
        }
        this.logger.appendLine("Starting " + this.name);
        this.child = child_process_1.spawn(this.command + args.join(" "), {
            shell: withShell,
            stdio: ["pipe", "pipe", "pipe"]
        });
        // running with process Id
        this.logger.appendLine(this.name + " started, PID:" + this.child.pid);
        // notify the logger if it stopped....
        this.child.once("exit", (exitCode) => this.logger.appendLine(this.name + " stopped, exit code: " + exitCode));
        if (defaultHandlers) {
            if (this.child.stdout !== null) {
                this.child.stdout.setEncoding("utf8");
                this.child.stdout.on("data", (data) => {
                    if (this.logger) {
                        this.logger.append(data);
                    }
                });
            }
        }
        return this.child;
    }
    stop() {
        return new Promise((resolve) => {
            if (this.child && !this.child.killed) {
                this.child.once("exit", () => {
                    resolve();
                });
                this.logger.appendLine("Process " + this.name + " stopping...");
                this.child.kill("SIGINT");
                const attemptedToKill = this.child;
                setTimeout(() => {
                    if (!attemptedToKill.killed) {
                        this.logger.appendLine("Failed to stop shell in 5 seconds, killing...");
                        attemptedToKill.kill("SIGKILL");
                    }
                }, 5000);
            }
            else {
                resolve();
            }
        });
    }
}
exports.PysysAsyncRunner = PysysAsyncRunner;


/***/ }),

/***/ "./src/utils/pysysTaskProvider.ts":
/*!****************************************!*\
  !*** ./src/utils/pysysTaskProvider.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PysysTaskProvider = void 0;
const vscode = __webpack_require__(/*! vscode */ "vscode");
const path = __webpack_require__(/*! path */ "path");
class PysysTaskProvider {
    constructor() {
        this.config = vscode.workspace.getConfiguration("pysys");
        this.interpreter = this.config.get("defaultInterpreterPath");
    }
    provideTasks() {
        return [this.runTest()];
    }
    resolveTask(_task) {
        const task = _task.definition.task;
        if (task) {
            const definition = _task.definition;
            return new vscode.Task(definition, definition.task, "pysys", new vscode.ShellExecution(`${this.interpreter} ${definition.task} ${definition.extraargs.join(' ')}`, {
                cwd: definition.cwd
            }));
        }
        return undefined;
    }
    runTest() {
        const task = new vscode.Task({ "type": "pysys",
            "task": "run",
            "cwd": "path_to/{PYSYS_PROJECT}",
            "project": "{PYSYS_PROJECT}",
            "extraargs": [] }, "run", "pysys", new vscode.ShellExecution(`${this.interpreter} run --help`), []);
        task.group = 'pysys';
        return task;
    }
    writeTaskConfig(definition, ws) {
        return __awaiter(this, void 0, void 0, function* () {
            const taskFile = path.join(ws.uri.fsPath, '.vscode', 'tasks.json');
            const taskFileURI = vscode.Uri.file(taskFile);
            let contents = '{\"version\": \"2.0.0\",\"tasks\": []}'; //default if !exists
            let tfExists;
            try {
                yield vscode.workspace.fs.stat(taskFileURI);
                let doc = yield vscode.workspace.openTextDocument(taskFileURI);
                contents = doc.getText(); //get existing
                tfExists = true;
            }
            catch (err) {
                tfExists = false;
            }
            const config = JSON.parse(contents);
            for (let task of config.tasks) {
                if (task.label === definition.label) {
                    return;
                }
            }
            config.tasks.push(definition);
            if (config) {
                if (tfExists) {
                    vscode.workspace.fs.writeFile(taskFileURI, Buffer.from(JSON.stringify(config, null, 4), 'utf8'));
                }
                else {
                    const wsedit = new vscode.WorkspaceEdit();
                    yield wsedit.createFile(taskFileURI, { ignoreIfExists: true });
                    yield wsedit.insert(taskFileURI, new vscode.Position(0, 0), JSON.stringify(config, null, 4));
                    yield vscode.workspace.applyEdit(wsedit);
                }
                vscode.window.showTextDocument(taskFileURI);
            }
        });
    }
    runPysysTest(cwd, workspace, extraargs) {
        return __awaiter(this, void 0, void 0, function* () {
            // let localargs : string[] = this.config.args.concat(['-p',this.config.port.toString()]);
            // console.log(extraargs);
            let localargs = [];
            if (extraargs) {
                localargs = extraargs;
            }
            let folder;
            if (workspace) {
                folder = workspace;
            }
            else {
                if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length === 1) {
                    folder = vscode.workspace.workspaceFolders[0];
                }
                else {
                    folder = yield vscode.window.showWorkspaceFolderPick();
                }
            }
            if (folder) {
                let task = new vscode.Task({ type: "pysys", task: "run" }, folder, "pysys run", "pysys", new vscode.ShellExecution(`${this.interpreter} run ${localargs.join(" ")}`, [], {
                    cwd
                }), ["pysys"]);
                task.group = "test";
                return task;
            }
            return undefined;
        });
    }
    runCustom(element) {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = yield vscode.tasks.fetchTasks();
            let args;
            const projectDefinition = element.label;
            for (let task of tasks) {
                if (task.definition.project === projectDefinition) {
                    args = task.definition.extraargs;
                }
            }
            const cwd = element.fsPath;
            if (args) {
                const task = yield this.runPysysTest(cwd, element.ws, args);
                if (task) {
                    yield vscode.tasks.executeTask(task);
                }
            }
            else {
                const definition = {
                    type: "pysys",
                    task: "run",
                    cwd,
                    project: `${projectDefinition}`,
                    extraargs: [],
                    problemMatcher: ["$pysys"],
                    label: `pysys: run /${projectDefinition}`
                };
                const out = yield this.writeTaskConfig(definition, element.ws);
            }
        });
    }
}
exports.PysysTaskProvider = PysysTaskProvider;


/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),

/***/ "vscode":
/*!*************************!*\
  !*** external "vscode" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("vscode");

/***/ })

/******/ });
//# sourceMappingURL=extension.js.map