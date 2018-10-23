'use strict';

import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';

export class D3Extension
{
    private _output : vscode.OutputChannel;
    private _rootPath : string;
    private _tmpfile : string;
    private _profilerBinPath : string;
    private _result : string;
    private _panel: vscode.WebviewPanel|undefined;

    constructor(rootPath : string, tmpfile : string,  binPath : string, panel: vscode.WebviewPanel | undefined) {
        this._output = vscode.window.createOutputChannel("D3Extension");
        this._rootPath = rootPath;
        this._profilerBinPath = binPath;
        this._tmpfile = tmpfile;
        this._result  = "";
        this._panel = panel;
        console.log("Created D3Extension instance");
    }

    testOutput(message : string) : void {
        this._output.clear();
        let channel : vscode.OutputChannel = this._output;
        let errString : string = "";

        /*
        let p = cp.spawn('ping', ['-n', '10', 'www.google.com']);
        p.stdout.on("data", (data : string | Buffer) : void => {
            channel.append(data.toString());
        });
        p.stderr.on("data", (data : string | Buffer) : void => {
            errString += data.toString();
            channel.append(data.toString());
        });

        p.on('exit', (exitCode : number) : void => {
            if (exitCode === 0) {
                vscode.window.showInformationMessage("Ping concluded");
            } else {
                vscode.window.showErrorMessage(`ping finished with error ${errString}.`);
            }
        });
        */
      // let p = cp.spawn(this._profilerBinPath, ['-p']);
       let p = cp.spawn(this._profilerBinPath, [this._tmpfile]);
       p.stdout.on("data", (data : string | Buffer) : void => {
           channel.append(data.toString());
       });
       p.stderr.on("data", (data : string | Buffer) : void => {
           errString += data.toString();
           channel.append(data.toString());
       });

       p.on('exit', (exitCode : number) : void => {
           if (exitCode === 0) {
            vscode.window.showInformationMessage("Profiler collection concluded");
            // read the file here?
            console.log(`the file to be read is ${this._tmpfile}`);
            this._result = fs.readFileSync(this._tmpfile, "utf8");
            
            if (this._panel) {
                this._panel.reveal(vscode.ViewColumn.Two);
                this._panel.webview.postMessage({ command : 'refactor'});
              }
            
           } else {
               vscode.window.showErrorMessage(`Error while driving profiler: ${errString}.`);

           }
       });

        // this._output.appendLine(`Received a message: ${message}.`);
    }

    dispose() : void {
        this._output.dispose();
    }
}
