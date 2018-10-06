'use strict';

import * as vscode from 'vscode';

const htmlContent : string =`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="with=device-width, initial-scale=1.0">
  </head>
  <body>
    <h1>Testing...(fixed metas in headers) </h1>
  </body>
</html>
`;

export function activate(context: vscode.ExtensionContext) {

    console.log(`Extension "testd3" is now active, running from ${context.extensionPath}.`);

    let disposable = vscode.commands.registerCommand('extension.testD3js', () => {
       commandHandler();
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
    /* empty */
}

function commandHandler() {
    // Open a webview
    let panel = vscode.window.createWebviewPanel("testType",
    "Panel display",
    vscode.ViewColumn.Two
    );
    panel.title = "Testing Panel";
    panel.webview.html = htmlContent;
    // Display a message box to the user
    vscode.window.showInformationMessage('[aspirational] displaying a d3-powered view!');
}
