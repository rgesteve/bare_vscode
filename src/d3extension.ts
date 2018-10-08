'use strict';

import * as vscode from 'vscode';
import * as cp from 'child_process';

export class D3Extension
{
    private _output : vscode.OutputChannel;
    private _rootPath : string;

    constructor(rootPath : string) {
        this._output = vscode.window.createOutputChannel("D3Extension");
        this._rootPath = rootPath;
        console.log("Created D3Extension instance");
    }

    testOutput(message : string) : void {
        this._output.clear();
        let channel : vscode.OutputChannel = this._output;
        let errString : string = "";

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

        // this._output.appendLine(`Received a message: ${message}.`);
    }

    dispose() : void {
        this._output.dispose();
    }
}
