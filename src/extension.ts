'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

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
        //profilerDriverPath = path.join(<string>(process.env["USERPROFILE"]), "Projects", "ExternalProfilerDriver",
        //        "ExternalProfilerDriver","ExternalProfilerDriver","bin","Debug","ExternalProfilerDriver.exe");
        profilerDriverPath = path.join(<string>(process.env["USERPROFILE"]), "Work", "delete","main.exe");
        
        if (! fs.existsSync(profilerDriverPath)) {
            console.log("Cannot find path to external profiler driver");
            console.log(`path is ${profilerDriverPath}"`);
        } else {
            console.log("Found the profiler driver!");
        }
    }

    //status.command = "extension.talkD3js";
    //context.subscriptions.push(status);
    let extensionPath = context.extensionPath;
    let mediaPath = path.join(extensionPath, 'resources');
    let tmpfile = path.join(os.tmpdir(),'out.txt');
    let currentPanel : vscode.WebviewPanel | undefined = undefined;
    currentPanel = vscode.window.createWebviewPanel("testType", "Testing Panel", vscode.ViewColumn.Two, { enableScripts : true } );
 
    let d3Extension : d3x.D3Extension = new d3x.D3Extension(extensionPath, tmpfile, <string>(profilerDriverPath), currentPanel);
    d3Extension.testOutput("Trying to output to channel");
    context.subscriptions.push(d3Extension); // add to disposables - when the extension is done these will be deleted

    console.log(`Extension "callVTune" is now active, running from ${extensionPath}.`);
    console.log(`Media path ${fs.existsSync(mediaPath)?"":"not "}found.`);

    //let localPath = vscode.Uri.file(path.join(mediaPath, 'kitten.jpg')).with({ scheme : 'vscode-resource'});

    //let currentPanel : vscode.WebviewPanel | undefined = undefined;
    let textEditor = vscode.window.activeTextEditor;
    if (!textEditor) {
      // TODO: Check for actual Python contents
      vscode.window.showErrorMessage("No document selected.");
      //return;
    } else {
      let doc = textEditor.document;
      if (!doc) {
         vscode.window.showErrorMessage("Please invoke this command from a Python file.");
         return;
      } 
      vscode.window.showInformationMessage(`The texteditor has ${doc.fileName} open`);
    }
    let createPanelDisposable = vscode.commands.registerCommand('extension.testD3js', () => {


       if (currentPanel) {
         currentPanel.reveal(vscode.ViewColumn.Two);
       } else {
         currentPanel = vscode.window.createWebviewPanel("testType", "Panel display", vscode.ViewColumn.Two, { enableScripts : true } );
         currentPanel.title = "Testing Panel";
         d3Extension.testOutput("Trying to output to channel");
         currentPanel.webview.html = getHtmlContent(extensionPath);

         currentPanel.onDidDispose(
             () => { currentPanel = undefined; },
             undefined,
             context.subscriptions
         );
         currentPanel.webview.onDidReceiveMessage(msg => {
            vscode.window.showInformationMessage(`Seems like I got a message ${msg.command}!`);
         }, undefined, context.subscriptions);
       }
       //vscode.window.showInformationMessage('Displaying a d3-powered view!');
    });

    // Communicating with the webview (this message is handled in the html javascript)
    let talkPanelDisposable = vscode.commands.registerCommand("extension.talkD3js", () => {
       // window.showInformationMessage("Profiling...");
       // d3Extension.testOutput("Trying to output to channel"); // have output directed to a "channel" (these appear on the Debug Console)
        if (!currentPanel) {
            //vscode.window.showInformationMessage('Need to have the webview open');
        } else {
            //vscode.window.showInformationMessage('Sending a message to the webview');
            //currentPanel.webview.postMessage({ command : 'refactor'});
        }
    });

    // this is an example of how an extension can invoke annother command, either from the same extension, from another or from the VSCode core
    let calltestPanelDisposable = vscode.commands.registerCommand("extension.calltestD3js", () => {
        //vscode.window.showInformationMessage("Going to try to invoke the command");
        vscode.commands.executeCommand("extension.testD3js");
    });

    context.subscriptions.push(vscode.commands.registerCommand('extension.refactor', () => {
        if (currentPanel) {
            currentPanel.webview.postMessage({ command : 'refactor'});
            vscode.window.showInformationMessage("Going to try to invoke the command");
        }
    }));
    context.subscriptions.push(createPanelDisposable);
    context.subscriptions.push(talkPanelDisposable);
    context.subscriptions.push(calltestPanelDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
    /* empty */
}

export function getHtmlContent(extensionPath : string) : string {
    let resourcePath = path.join(extensionPath, 'resources');
    // Async read
    //let datajson = fs.readFile(path.join(resourcePath, "/data/data2.json"), "utf8", 
    //                function(err, contents){console.log(`data found ${contents}.`);});

    let htmlTemplate = fs.readFileSync(path.join(resourcePath, "index.html"), "utf8");
    let datajson = fs.readFileSync(path.join(resourcePath, "/data/data2.json"), "utf8");
    console.log(`data found ${datajson}.`);
    const columns = [
                    ['KindofOpen', 4],
                    ['Closedx', 2],
                    ['InProgress', 2],
                    ['Testing', 5],
                    ['Other', 1],
    ];

    let result = interpolateTemplate(htmlTemplate, {
        columnsFromHost : JSON.stringify(columns),// kind of stupid, but haven't found a better way yet
        columnsFromHost2 : datajson
    });
    
    return result;
}
