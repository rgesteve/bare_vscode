'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// utilities
function interpolateTemplate(template: string, params : Object) {
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${template}\`;`)(...vals);
}

export function activate(context: vscode.ExtensionContext) {

    let extensionPath = context.extensionPath;
    let mediaPath = path.join(extensionPath, 'resources');

    let d3Extension : D3Extension = new D3Extension(extensionPath);
    context.subscriptions.push(d3Extension);

    console.log(`Extension "testd3" is now active, running from ${extensionPath}.`);
    console.log(`Media path ${fs.existsSync(mediaPath)?"":"not "}found.`);

    let kittenPath = vscode.Uri.file(path.join(mediaPath, 'kitten.jpg')).with({ scheme : 'vscode-resource'});

    let currentPanel : vscode.WebviewPanel | undefined = undefined;

    let createPanelDisposable = vscode.commands.registerCommand('extension.testD3js', () => {
       if (currentPanel) {
         currentPanel.reveal(vscode.ViewColumn.Two);
       } else {
         currentPanel = vscode.window.createWebviewPanel("testType", "Panel display", vscode.ViewColumn.Two, { enableScripts : true } );
         currentPanel.title = "Testing Panel";
         currentPanel.webview.html = getHtmlContent(extensionPath, kittenPath);

         currentPanel.onDidDispose(
             () => { currentPanel = undefined; },
             undefined,
             context.subscriptions
         );
         currentPanel.webview.onDidReceiveMessage(msg => {
            vscode.window.showInformationMessage(`Seems like I got a message ${msg.command}!`);
         }, undefined, context.subscriptions);
       }
       // Display a message box to the user
       vscode.window.showInformationMessage('[aspirational] displaying a d3-powered view!');
    });

    let talkPanelDisposable = vscode.commands.registerCommand("extension.talkD3js", () => {
        if (!currentPanel) {
            vscode.window.showInformationMessage('Need to have the webview open');
        } else {
            vscode.window.showInformationMessage('Sending a message to the webview');
            currentPanel.webview.postMessage({ command : 'refactor'});
        }
    });

    let invokePanelDisposable = vscode.commands.registerCommand("extension.invokeD3js", () => {
        vscode.window.showInformationMessage("Should've started invoking command");
        d3Extension.testOutput("Trying to output to channel");
    });

    context.subscriptions.push(createPanelDisposable);
    context.subscriptions.push(talkPanelDisposable);
    context.subscriptions.push(invokePanelDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
    /* empty */
}

function getHtmlContent(extensionPath : string, _imgUri: vscode.Uri) : string {
    let resourcePath = path.join(extensionPath, 'resources');
    let htmlTemplate = fs.readFileSync(path.join(resourcePath, "index.html"), "utf8");

    let result = interpolateTemplate(htmlTemplate, {
        imgUri: _imgUri                                                                                                                                                            
    });

    return result;
}

class D3Extension
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
        this._output.appendLine(`Received a message: ${message}.`);
    }

    dispose() : void {
        this._output.dispose();
    }
}