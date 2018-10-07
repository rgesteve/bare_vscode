'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {

    let extensionPath = context.extensionPath;
    let mediaPath = path.join(extensionPath, 'media');

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
         currentPanel.webview.html = getHtmlContent(kittenPath);
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

    context.subscriptions.push(createPanelDisposable);
    context.subscriptions.push(talkPanelDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
    /* empty */
}

function getHtmlContent(imgUri : vscode.Uri) : string {
    let htmlContent : string =`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="with=device-width, initial-scale=1.0">
  </head>
  <body>
    <h1>The kitten with scripts</h1>
    <img src="${imgUri}" width="300" />

    <h2>Local lines counter</h2>
    <div id="lines-of-code-counter">0</div>

    <h2>Latest communication from host</h2>
    <div id="latest-comm"></div>

    <script>
    (function () {
        const vscode = acquireVsCodeApi();
        const counter = document.getElementById("lines-of-code-counter");
        const commMsg = document.getElementById("latest-comm");

        let count = 0;
        setInterval( () => {
            counter.textContent = count++;
            if ((count % 25) === 0) {
                console.log("Sending a message to the host...");
                vscode.postMessage({
                    command: 'alert',
                    text: 'communicating with host'
                });
            }
        }, 500);

        // Handle a message inside the webview
        window.addEventListener('message', event => {
            const message = event.data; // the message data the host sent
            commMsg.textContent = "Just received a message at time [" + count + "]";
            console.log("This should be displayed in the developer tools if they're open");
        });
    })();
    </script>
  </body>
</html>
`;
    return htmlContent;
}