'use strict';

import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
import {getHtmlContent} from './extension';



export class D3Extension
{
    private _output : vscode.OutputChannel;
    private _rootPath : string;
    private _tmpfile : string;
    private _profilerBinPath : string;
    private _result : string;
    private _panel: vscode.WebviewPanel|undefined;
    private _status : vscode.StatusBarItem ;
    constructor(rootPath : string, tmpfile : string,  binPath : string, panel: vscode.WebviewPanel | undefined) {
        this._output = vscode.window.createOutputChannel("D3Extension");
        this._rootPath = rootPath;
        this._profilerBinPath = binPath;
        this._tmpfile = tmpfile;
        this._result  = "";
        this._panel = panel;
        this._status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 25);

        console.log("Created D3Extension instance");
    }

   
    testOutput(message : string) : void {
        this._status.text = "Profiler starting ... ";
        this._status.show();
        this._output.clear();
        let channel : vscode.OutputChannel = this._output;
        let errString : string = "";

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
            // read the file here?
            console.log(`the file to be read is ${this._tmpfile}`);
            this._result = fs.readFileSync(this._tmpfile, "utf8");
            
            if (this._panel) {
                this._panel.reveal(vscode.ViewColumn.Two);
                this._panel.webview.html = getHtmlContent(this._rootPath);
                //this._panel.webview.postMessage({ command : 'refactor'});
                this._status.text = "Done!";
                this._status.show();
                console.log("Done sending command");
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
