'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    console.log('Extension "testd3" is now active!');

    let disposable = vscode.commands.registerCommand('extension.testD3js', () => {
        // Display a message box to the user
        vscode.window.showInformationMessage('Should be displaying a d3-powered view!');
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
    /* empty */
}
