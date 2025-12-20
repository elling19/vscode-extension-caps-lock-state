import * as vscode from 'vscode';
import path from 'path';
import { spawn } from 'child_process';
import { chmodSync, statSync } from 'fs';
import { extName, configKey, configDefaultValue, setExtensionPath } from './config';
import { displayController } from './decoration';

/**
 * 确保可执行文件有执行权限（仅在 Linux/macOS 上需要）
 * .vsix 打包会丢失文件权限，需要在运行时恢复
 */
function ensureExecutablePermission(filePath: string): void {
	if (process.platform === 'win32') {
		return; // Windows 不需要设置执行权限
	}
	
	try {
		const stats = statSync(filePath);
		const currentMode = stats.mode;
		// 检查是否有执行权限 (owner execute bit: 0o100)
		if ((currentMode & 0o100) === 0) {
			// 添加执行权限: owner (rwx), group (rx), others (rx)
			chmodSync(filePath, 0o755);
			console.log(`Set executable permission for: ${filePath}`);
		}
	} catch (error) {
		console.error(`Failed to set executable permission for ${filePath}:`, error);
	}
}

export function activate(context: vscode.ExtensionContext) {
	// 初始化扩展路径
	setExtensionPath(context.extensionPath);

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
	
	// 确保可执行文件有执行权限（修复 .vsix 安装后权限丢失的问题）
	ensureExecutablePermission(executablePath);
	
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
