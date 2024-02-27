import * as vscode from 'vscode';
import path from 'path';
import { spawn } from 'child_process';
import { extName, configKey, configDefaultValue } from './config';
import { displayController } from './decoration';


export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('caps-lock-state', () => {

	});
	context.subscriptions.push(disposable);
	const displayMethod: string = vscode.workspace.getConfiguration().get(`${extName}.${configKey.choose_display_method}`, configDefaultValue.choose_display_method);
	displayController.addOrUpdateByDisplayMethodName(displayMethod);
	const delayTime: number = vscode.workspace.getConfiguration().get(`${extName}.${configKey.delay_time}`, configDefaultValue.delay_time);
	// listen config change
	vscode.workspace.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration(`${extName}.${configKey.choose_display_method}`)) {
			const displayMethod: string = vscode.workspace.getConfiguration().get(`${extName}.${configKey.choose_display_method}`, 'method_background_color');
			displayController.removeAll();
			displayController.addOrUpdateByDisplayMethodName(displayMethod);
		} else if (event.affectsConfiguration(`${extName}.${configKey.delay_time}`)) {
			vscode.window.showInformationMessage('Your changes require a VSCode restart to take effect.', 'Restart').then(choice => {
                if (choice === 'Restart') {
                    // restart VSCode
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            });
		}
		else {
			displayController.updateAll();
		}
	});
	// get caps lock state from caps_lock_listener executable file.
	let capsLockState = 0;
	const extensionPath = context.extensionPath;
	let executablePath;
	const args = [];
	if (process.platform === 'win32') {
		executablePath = path.join(extensionPath, 'caps_lock_listener.exe');
		args.push(delayTime.toString());
	} else if (process.platform === 'darwin') {
		executablePath = path.join(extensionPath, 'macos_listener');
		args.push('capslock');
	}
	else {
		// todo: fix linux environment
		executablePath = path.join(extensionPath, 'caps_lock_listener');
		args.push(delayTime.toString());
	}
	const child = spawn(executablePath, args);
	child.stdout.on('data', (data) => {
		capsLockState = parseInt(data.toString().trim());
		if (capsLockState === 1) {
			displayController.show();
		} else {
			displayController.hide();
		}
	});
	child.stderr.on('data', (data) => {
		vscode.window.showErrorMessage(`cursor - config: ${data}`);
	});
	child.on('close', (code) => {
		console.log(`child process exited with code ${code} `);
		vscode.window.showErrorMessage(`cursor - config exited with code: ${code} `);
	});
	// when cursor position changed
	vscode.window.onDidChangeTextEditorSelection(() => {
		if (capsLockState === 1) {
			displayController.show();
		} else {
			displayController.hide();
		}
	});
}

export function deactivate() { }
