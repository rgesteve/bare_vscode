'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import * as d3x from './d3extension';

// utilities
function interpolateTemplate(template: string, params : Object) {
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${template}\`;`)(...vals);
}

export function activate(context: vscode.ExtensionContext) {
    let profilerDriverPath : string | undefined = undefined;
    if (process.env["USERPROFILE"] !== undefined) {
        profilerDriverPath = path.join(<string>(process.env["USERPROFILE"]), "Projects", "ExternalProfilerDriver",
                "ExternalProfilerDriver","ExternalProfilerDriver","bin","Debug","ExternalProfilerDriver.exe");
        if (! fs.existsSync(profilerDriverPath)) {
            console.log("Cannot find path to external profiler driver");
        } else {
            console.log("Found the profiler driver!");
        }
    }

    let extensionPath = context.extensionPath;
    let mediaPath = path.join(extensionPath, 'resources');
    let svgPath = vscode.Uri.file(path.join(mediaPath, 'model2.svg')).with({ scheme : 'vscode-resource'});

    let d3Extension : d3x.D3Extension = new d3x.D3Extension(extensionPath, <string>(profilerDriverPath));
    context.subscriptions.push(d3Extension);

    console.log(`Extension "callVTune" is now active, running from ${extensionPath}.`);
    console.log(`Media path ${fs.existsSync(mediaPath)?"":"not "}found.`);

    let currentPanel : vscode.WebviewPanel | undefined = undefined;

    let createPanelDisposable = vscode.commands.registerCommand('extension.testD3js', () => {
       let textEditor = vscode.window.activeTextEditor;
       if (!textEditor) {
         // TODO: Check for actual Python contents
         vscode.window.showErrorMessage("No document selected.");
         return;
       } else {
         let doc = textEditor.document;
         if (!doc) {
            vscode.window.showErrorMessage("Please invoke this command from a Python file.");
            return;
         } 
         vscode.window.showInformationMessage(`The texteditor has ${doc.fileName} open`);
       }

       if (currentPanel) {
         currentPanel.reveal(vscode.ViewColumn.Two);
       } else {
         currentPanel = vscode.window.createWebviewPanel("testType", "Panel display", vscode.ViewColumn.Two, { enableScripts : true } );
         currentPanel.title = "Testing Panel";
         currentPanel.webview.html = getHtmlContent(extensionPath, svgPath);

         currentPanel.onDidDispose(
             () => { currentPanel = undefined; },
             undefined,
             context.subscriptions
         );
         currentPanel.webview.onDidReceiveMessage(msg => {
            vscode.window.showInformationMessage(`Seems like I got a message ${msg.command}!`);
         }, undefined, context.subscriptions);
       }
       vscode.window.showInformationMessage('Displaying a d3-powered view!');
    });

    // Communicating with the webview (this message is handled in the html javascript)
    let talkPanelDisposable = vscode.commands.registerCommand("extension.talkD3js", () => {
        d3Extension.testOutput("Trying to output to channel"); // have output directed to a "channel" (these appear on the Debug Console)
        if (!currentPanel) {
            vscode.window.showInformationMessage('Need to have the webview open');
        } else {
            vscode.window.showInformationMessage('Sending a message to the webview');
            currentPanel.webview.postMessage({ command : 'refactor'});
        }
    });

    // this is an example of how an extension can invoke annother command, either from the same extension, from another or from the VSCode core
    let calltestPanelDisposable = vscode.commands.registerCommand("extension.calltestD3js", () => {
        vscode.window.showInformationMessage("Going to try to invoke the command");
        vscode.commands.executeCommand("extension.testD3js");
    });

    context.subscriptions.push(createPanelDisposable);
    context.subscriptions.push(talkPanelDisposable);
    context.subscriptions.push(calltestPanelDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
    /* empty */
}

function getHtmlContent(extensionPath : string, modelPath: vscode.Uri) : string {
    let resourcePath = path.join(extensionPath, 'resources');
    let htmlTemplate = fs.readFileSync(path.join(resourcePath, "index.html"), "utf8");

    const columns = [
                    ['KindofOpen', 4],
                    ['Closedx', 2],
                    ['InProgress', 2],
                    ['Testing', 5],
                    ['Other', 1],
    ];

    let result = interpolateTemplate(htmlTemplate, {
        columnsFromHost : JSON.stringify(columns), // kind of stupid, but haven't found a better way yet
        modelPath : modelPath.toString()
    });

    return result;
}
