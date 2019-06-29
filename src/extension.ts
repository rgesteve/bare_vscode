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
        //profilerDriverPath = path.join(<string>(process.env["USERPROFILE"]), "Work", "delete","main.exe");
        
        //let profilerDirPath = path.join('projects','ExternalProfilerDriver', 'ExternalProfilerDriver', 'bin', 'Debug', 'netcoreapp2.0', 'publish');
        profilerDriverPath = path.join(<string>(process.env["USERPROFILE"]), "PTVS", "ExternalProfilerDriver", "ExternalProfilerDriver", "bin", "Debug", "netcoreapp2.0", "publish", "ExternalProfilerDriver.dll");
        console.log(`Testing External profiler driver in ${profilerDriverPath}.`);

        if (! fs.existsSync(profilerDriverPath)) {
            console.log("Cannot find path to external profiler driver");
            console.log(`path is ${profilerDriverPath}"`);
        } else {
            console.log("Found the profiler driver!");
        }
    }

    let extensionPath = context.extensionPath;
    let mediaPath = path.join(extensionPath, 'resources');
    let currentPanel : vscode.WebviewPanel | undefined = undefined;
    let sourcePanel : vscode.WebviewPanel | undefined = undefined;

    currentPanel = vscode.window.createWebviewPanel("testType", "Profile summary", vscode.ViewColumn.Two, { enableScripts : true } );

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
   
        /* TODO -- verify that the active document is a Python script */
    }

    let d3Extension : d3x.D3Extension = new d3x.D3Extension(extensionPath, <string>(profilerDriverPath), currentPanel);
    d3Extension.testOutput("Trying to output to channel");
    currentPanel.webview.onDidReceiveMessage(msg => {
        //vscode.window.showInformationMessage(`Seems like I got a message ${msg.command}!`);
        //sourcePanel = vscode.window.createWebviewPanel("Source", "Source Panel", vscode.ViewColumn.Three, { enableScripts : true } );
        //sourcePanel.webview.html = getSourceWebviewContent();
        let docToOpenPath : string = "C:\\Users\\clairiky\\Work\\WOS\\PTVS\\examples\\pybind\\src\\MonteCarloPi.cpp";
        if (msg.command === "should_open") {
            // should be getting name of file to open from ${msg.text}
            // the command below doesn't work, it asks user for input on what file to open
            //      vscode.commands.executeCommand("workbench.action.files.openFile", docToOpenPath);
            var uri = vscode.Uri.file(docToOpenPath);
            vscode.workspace.openTextDocument(uri).then(doc => {
                vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.One });
		        console.log('Source file opened');
		    }, err => {
		        console.log(`Failed to load '${uri.toString()}'\n\n${String(err)}`, '');
            });

        } else {
            /* empty */
        }
        // vscode.window.showInformationMessage(`Should've opened a file...`);

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
             /*
            let toDisplay = `Seems like I got a message ${msg.command}!, checking:\n`;
            if (msg.command === "should_open") {
                toDisplay += `\tShould be opening file "${msg.text}"`;
            } else {
                toDisplay += "\t*** Got a command without open directive";
            }
            vscode.window.showInformationMessage(toDisplay);
            */
           vscode.window.showInformationMessage("Testing message");
         }, undefined, context.subscriptions);
       }
    });
    context.subscriptions.push(createPanelDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
    /* empty */
}

export function getHtmlContent(extensionPath : string) : string {
    let resourcePath = path.join(extensionPath, 'resources');
    let scriptPath = vscode.Uri.file(path.join(resourcePath, 'main.js')).with({ scheme : 'vscode-resource'});
    let bundleUri = vscode.Uri.file(path.join(resourcePath, 'bundle.js')).with({ scheme: 'vscode-resource'});
    // Async read
    //let datajson = fs.readFile(path.join(resourcePath, "/data/data2.json"), "utf8", 
    //                function(err, contents){console.log(`data found ${contents}.`);});

    let htmlTemplate = fs.readFileSync(path.join(resourcePath, "index.html"), "utf8");
    let datajson = fs.readFileSync(path.join(os.tmpdir(), "output.json"), "utf8");

    let result = interpolateTemplate(htmlTemplate, {
        profileData : datajson,
        script : scriptPath,
        bundleUri : bundleUri
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
