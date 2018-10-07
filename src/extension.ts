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

    let disposable = vscode.commands.registerCommand('extension.testD3js', () => {
       currentPanel = createOrShowPanel(currentPanel, kittenPath);
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
    /* empty */
}

function createOrShowPanel(_panel : vscode.WebviewPanel | undefined, imgUri : vscode.Uri ) 
: vscode.WebviewPanel
{
    let panel : vscode.WebviewPanel;
    if (_panel == undefined) {
        // Open a webview
        panel = vscode.window.createWebviewPanel("testType",
            "Panel display",
            vscode.ViewColumn.Two,
            { enableScripts : true }
        );
    } else {
        panel = _panel;
    }

    panel.title = "Testing Panel";
    panel.webview.html = getHtmlContent(imgUri);

    // Display a message box to the user
    vscode.window.showInformationMessage('[aspirational] displaying a d3-powered view!');
    return panel;
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
    <h1>Testing...(fixed metas in headers) </h1>
    <img src="${imgUri}" width="300" />

    <h2>Local lines counter</h2>
    <div id="lines-of-code-counter">0</div>

    <script>
        const counter = document.getElementById("lines-of-code-counter");

        let count = 0;
        setInterval( () => {
            counter.textContent = count++;
        }, 100);
    </script>
  </body>
</html>
`;
    return htmlContent;
}