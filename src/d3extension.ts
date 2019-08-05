'use strict';

import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import {getHtmlContent} from './extension';

export class D3Extension
{
    private _output : vscode.OutputChannel;
    private _rootPath : string;
    private _profilerBinPath : string;
    private _result : string;
    private _panel: vscode.WebviewPanel|undefined;
    private _status : vscode.StatusBarItem ;

    constructor(rootPath : string, binPath : string, panel: vscode.WebviewPanel | undefined) {
        this._output = vscode.window.createOutputChannel("Python profiler");
        this._rootPath = rootPath;
        this._profilerBinPath = binPath;
        this._result  = "";
        this._panel = panel;
        this._status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 25);

        console.log(`Created D3Extension instance, will be running from ${this._profilerBinPath}`);
    }
   
    testOutput(message : string, fname? : string) : void {
        this._status.text = "Profiler starting ... ";
        this._status.show();
        this._output.clear();
        let channel : vscode.OutputChannel = this._output;
        let errString : string = "";

        if (!fname) {
            vscode.window.showErrorMessage("Profiler needs a script name to run.");
            return;
        }

        channel.appendLine("Profiler starting...");

        channel.appendLine(`------> Should be running profiler like: ${this._profilerBinPath} (on ${fname})`);
        // TODO -- Can we pick up the interpreter from the python extension/user preferences/registry?
        let p = cp.spawn('dotnet', [this._profilerBinPath, '-d', os.tmpdir(), '-j', '--', 'C:\\Users\\perf\\appdata\\local\\continuum\\anaconda3\\python.exe', fname]);

        p.stdout.on("data", (data : string | Buffer) : void => {
           channel.append(data.toString());
           this._status.text = "Profiler running ..."; this._status.show();
       });
       p.stderr.on("data", (data : string | Buffer) : void => {
           errString += data.toString();
           // TODO --- I'm getting errors, what are they?
           // this._status.text = "Profiler encountered error..."; this._status.show();
           channel.append(`From driver: ${data.toString()}`);
       });

       p.on('exit', (exitCode : number) : void => {
           channel.appendLine("Profiler signaled completion!");
           if (exitCode === 0) {
             channel.append(`I should be showing results now`);
            if (this._panel) {
                channel.append("Generating html content...");
                this._panel.reveal(vscode.ViewColumn.Two);
                this._panel.webview.html = getHtmlContent(this._rootPath);
            }
             channel.append("Results should be showing now...");
             this._status.text = "Profiler Done!"; this._status.show();
           } else {
             vscode.window.showErrorMessage(`Error while driving profiler: ${errString}.`);
           }
       });

    }

    dispose() : void {
        this._output.dispose();
    }
}
