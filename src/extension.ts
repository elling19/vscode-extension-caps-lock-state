import * as vscode from 'vscode';
import path from 'path';
import { spawn } from 'child_process';
import { chmodSync, statSync } from 'fs';
import { extName, configKey, configDefaultValue, setExtensionPath } from './config';
import { displayController } from './decoration';
import { Lamp } from './decoration/lamp';

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

export async function activate(context: vscode.ExtensionContext) {
	// 初始化扩展路径
	setExtensionPath(context.extensionPath);

	// 如果当前不使用 cursor_color 模式，清理可能遗留的透明光标
	const displayMethod: string = vscode.workspace.getConfiguration().get(`${extName}.${configKey.display_method}`, configDefaultValue.display_method);
	if (displayMethod !== 'method_cursor_color') {
		const config = vscode.workspace.getConfiguration();
		const cc = { ...config.get<Record<string, any>>('workbench.colorCustomizations', {}) };
		if (cc['editorCursor.foreground'] === '#00000000') {
			delete cc['editorCursor.foreground'];
			await config.update('workbench.colorCustomizations', cc, vscode.ConfigurationTarget.Global);
		}
	}

	// 创建 Lamp 指示灯（始终显示在 status bar，所有模式通用）
	const lamp = new Lamp();
	context.subscriptions.push(lamp);

	let featureEnabled = true;
	/** toggle 关闭后，等待用户回到编辑器时自动恢复 */
	let pendingRestore = false;
	let currentDisplayMethod = displayMethod;

	/** 激活 cursor_color 效果 */
	function activateDisplay(): void {
		displayController.addOrUpdateByDisplayMethodName(currentDisplayMethod);
		if (capsLockState === 1) {
			displayController.show();
		} else {
			displayController.hide();
		}
	}

	// 注册 toggle 命令（点击灯或快捷键触发）
	context.subscriptions.push(
		vscode.commands.registerCommand('caps-lock-state.toggle', () => {
			featureEnabled = !featureEnabled;
			lamp.setEnabled(featureEnabled);
			if (featureEnabled) {
				pendingRestore = false;
				activateDisplay();
			} else {
				// cursor_color 模式下标记自动恢复
				pendingRestore = currentDisplayMethod === 'method_cursor_color';
				displayController.removeAll();
			}
		})
	);

	displayController.addOrUpdateByDisplayMethodName(currentDisplayMethod);
	const delayTime: number = vscode.workspace.getConfiguration().get(`${extName}.${configKey.delay_time}`, configDefaultValue.delay_time);
	// listen config change
	vscode.workspace.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration(`${extName}.${configKey.display_method}`)) {
			currentDisplayMethod = vscode.workspace.getConfiguration().get(`${extName}.${configKey.display_method}`, configDefaultValue.display_method);
			if (featureEnabled) {
				displayController.removeAll();
				displayController.addOrUpdateByDisplayMethodName(currentDisplayMethod);
			}
		} else if (event.affectsConfiguration(`${extName}.${configKey.delay_time}`)) {
			vscode.window.showInformationMessage('Your changes require a VSCode restart to take effect.', 'Restart').then(choice => {
                if (choice === 'Restart') {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            });
		}
		else if (event.affectsConfiguration(extName)) {
			if (featureEnabled) {
				displayController.updateAll();
			}
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
		lamp.setCapsLockState(capsLockState === 1);
		if (!featureEnabled) { return; }
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

	// 窗口焦点监听：cursor_color 模式下，失焦时挂起（恢复真实光标），聚焦时恢复
	vscode.window.onDidChangeWindowState((state) => {
		if (!featureEnabled || currentDisplayMethod !== 'method_cursor_color') { return; }
		if (state.focused) {
			activateDisplay();
		} else {
			displayController.removeAll();
		}
	});

	// when cursor position changed / user returns to editor
	vscode.window.onDidChangeTextEditorSelection(() => {
		// 用户从 Git/Chat/Terminal 面板回到编辑器，自动恢复 cursor_color
		if (pendingRestore) {
			pendingRestore = false;
			featureEnabled = true;
			lamp.setEnabled(true);
			activateDisplay();
			return;
		}
		if (!featureEnabled) { return; }
		if (capsLockState === 1) {
			displayController.show();
		} else {
			displayController.hide();
		}
	});
}

export function deactivate() {
	displayController.removeAll();
}
