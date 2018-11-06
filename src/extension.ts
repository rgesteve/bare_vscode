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

    let extensionPath = context.extensionPath;
    let mediaPath = path.join(extensionPath, 'resources');
    let tmpfile = path.join(os.tmpdir(),'out.txt');
    let currentPanel : vscode.WebviewPanel | undefined = undefined;
    let sourcePanel : vscode.WebviewPanel | undefined = undefined;
    currentPanel = vscode.window.createWebviewPanel("testType", "Testing Panel", vscode.ViewColumn.Two, { enableScripts : true } );

    console.log(`Extension "callVTune" is now active, running from ${profilerDriverPath}.`);
    console.log(`Media path ${fs.existsSync(mediaPath)?"":"not "}found.`);

    let textEditor = vscode.window.activeTextEditor;
    if (!textEditor) {
        vscode.window.showErrorMessage("No document selected.");
        return;
    } else {
        let doc = textEditor.document;

        if (!doc || doc.languageId != "python") {
           vscode.window.showErrorMessage("Please invoke this command from a Python file.");
           return;
        } 
      vscode.window.showInformationMessage(`The texteditor has ${doc.fileName} open`);
    }

    let d3Extension : d3x.D3Extension = new d3x.D3Extension(extensionPath, tmpfile, <string>(profilerDriverPath), currentPanel);
    d3Extension.testOutput("Trying to output to channel");
    currentPanel.webview.onDidReceiveMessage(msg => {
        vscode.window.showInformationMessage(`Seems like I got a message ${msg.command}!`);
        //sourcePanel = vscode.window.createWebviewPanel("Source", "Source Panel", vscode.ViewColumn.Three, { enableScripts : true } );
        //sourcePanel.webview.html = getSourceWebviewContent();
        // var uri = vscode.Uri.file("C:\\Users\\clairiky\\Work\\WOS\\PTVS\\examples\\cython\\cython_example_proj\\__init__.py");
        // vscode.workspace.openTextDocument(uri).then(doc => {
        //     vscode.window.showTextDocument(doc);
		// 	console.log('Source file opened');
		// }, err => {
		// 	console.log(`Failed to load '${uri.toString()}'\n\n${String(err)}`, '');
		// });
     }, undefined, context.subscriptions);
    context.subscriptions.push(d3Extension); 
    let createPanelDisposable = vscode.commands.registerCommand('extension.testD3js', () => {

       if (currentPanel) {
         currentPanel.reveal(vscode.ViewColumn.Two);
       } else {
         currentPanel = vscode.window.createWebviewPanel("testType", "Testing Panel", vscode.ViewColumn.Two, { enableScripts : true } );

         d3Extension.testOutput("Trying to output to channel");
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




    context.subscriptions.push(vscode.commands.registerCommand('extension.refactor', () => {
        if (currentPanel) {
            currentPanel.webview.postMessage({ command : 'refactor'});
            vscode.window.showInformationMessage("Going to try to invoke the command");
        }
    }));
    context.subscriptions.push(createPanelDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
    /* empty */
}

export function getHtmlContent(extensionPath : string) : string {
    let resourcePath = path.join(extensionPath, 'resources');
    let scriptPath = vscode.Uri.file(path.join(resourcePath, 'main.js')).with({ scheme : 'vscode-resource'});
    // Async read
    //let datajson = fs.readFile(path.join(resourcePath, "/data/data2.json"), "utf8", 
    //                function(err, contents){console.log(`data found ${contents}.`);});

    let htmlTemplate = fs.readFileSync(path.join(resourcePath, "index.html"), "utf8");
    let datajson = fs.readFileSync(path.join(resourcePath, "/data/profile_data.json"), "utf8");
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
        columnsFromHost2 : datajson,
        script : scriptPath
    });
    
    return result;
}

function getSourceWebviewContent() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Source</title>
</head>
<body>
    <h1>Source</h1>
</body>
</html>`;
}