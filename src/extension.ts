import * as vscode from 'vscode';
import path from 'path';
import { spawn } from 'child_process';
import { chmodSync, statSync } from 'fs';
import { extName, configKey, configDefaultValue, setExtensionPath } from './config';
import { cursorManager } from './cursor';
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

	// 兼容旧版本: display_method 已废弃，若用户仍配置旧方法则回退到默认并提示
	const extConfig = vscode.workspace.getConfiguration(extName);
	const legacyDisplayMethod = extConfig.get<string>(configKey.display_method);
	if (legacyDisplayMethod && legacyDisplayMethod !== configDefaultValue.display_method) {
		const inspect = extConfig.inspect<string>(configKey.display_method);
		if (inspect?.globalValue !== undefined) {
			await extConfig.update(configKey.display_method, configDefaultValue.display_method, vscode.ConfigurationTarget.Global);
		}
		if (inspect?.workspaceValue !== undefined) {
			await extConfig.update(configKey.display_method, configDefaultValue.display_method, vscode.ConfigurationTarget.Workspace);
		}
		if (inspect?.workspaceFolderValue !== undefined && vscode.workspace.workspaceFolders) {
			for (const folder of vscode.workspace.workspaceFolders) {
				const folderConfig = vscode.workspace.getConfiguration(extName, folder.uri);
				const folderMethod = folderConfig.get<string>(configKey.display_method);
				if (folderMethod && folderMethod !== configDefaultValue.display_method) {
					await folderConfig.update(configKey.display_method, configDefaultValue.display_method, vscode.ConfigurationTarget.WorkspaceFolder);
				}
			}
		}
		vscode.window.showWarningMessage(
			`caps-lock-state.display_method (${legacyDisplayMethod}) has been removed. The extension now uses method_cursor_color by default.`
		);
	}

	const currentDisplayMethod = configDefaultValue.display_method;

	// 创建 Lamp 指示灯（始终显示在 status bar，所有模式通用）
	const lamp = new Lamp();
	context.subscriptions.push(lamp);

	type DisplayInitState = 'waiting' | 'initialized';

	let capsLockState: number | null = null;
	let displayInitState: DisplayInitState = 'waiting';
	let featureEnabled = true;
	const DOUBLE_TAP_WINDOW_MS = 500;
	let lastCapsStateChangeAt = 0;
	/** toggle 关闭后，等待用户回到编辑器时自动恢复 */
	let pendingRestore = false;

	/** 激活 cursor_color 效果 */
	function activateDisplay(): void {
		displayController.addOrUpdateByDisplayMethodName(currentDisplayMethod);
		if (capsLockState === 1) {
			displayController.show();
		} else {
			displayController.hide();
		}
	}

	/**
	 * 统一初始化入口：
	 * - 若真实光标已透明，则启动时立刻接管并按 OFF 渲染；
	 * - 否则等首次收到 CapsLock 状态后再接管。
	 */
	function ensureDisplayInitialized(): void {
		if (!featureEnabled || displayInitState === 'initialized') {
			return;
		}
		if (!cursorManager.isRealCursorTransparent() && capsLockState === null) {
			return;
		}
		displayInitState = 'initialized';
		activateDisplay();
	}

	function toggleFeature(): void {
		featureEnabled = !featureEnabled;
		lamp.setEnabled(featureEnabled);
		if (featureEnabled) {
			pendingRestore = false;
			if (displayInitState === 'initialized') {
				activateDisplay();
			}
		} else {
			// cursor_color 模式下标记自动恢复
			pendingRestore = currentDisplayMethod === 'method_cursor_color';
			displayController.removeAll();
		}
	}

	function handleCapsDoubleTap(now: number): void {
		if (lastCapsStateChangeAt > 0 && (now - lastCapsStateChangeAt) <= DOUBLE_TAP_WINDOW_MS) {
			lastCapsStateChangeAt = 0;
			toggleFeature();
			return;
		}
		lastCapsStateChangeAt = now;
	}

	// 注册 toggle 命令（点击灯或快捷键触发）
	context.subscriptions.push(
		vscode.commands.registerCommand('caps-lock-state.toggle', () => {
			toggleFeature();
		})
	);

	const delayTime: number = vscode.workspace.getConfiguration().get(`${extName}.${configKey.delay_time}`, configDefaultValue.delay_time);
	// listen config change
	vscode.workspace.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration(`${extName}.${configKey.delay_time}`)) {
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
	ensureDisplayInitialized();
	
	const child = spawn(executablePath, args);
	child.stdout.on('data', (data) => {
		const nextCapsLockState = parseInt(data.toString().trim(), 10);
		if (Number.isNaN(nextCapsLockState)) {
			return;
		}
		const previousCapsLockState = capsLockState;
		capsLockState = nextCapsLockState;
		if (previousCapsLockState !== null && previousCapsLockState !== nextCapsLockState) {
			handleCapsDoubleTap(Date.now());
		}
		ensureDisplayInitialized();
		lamp.setCapsLockState(capsLockState === 1);
		if (!featureEnabled) { return; }
		if (displayInitState !== 'initialized') { return; }
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
			if (displayInitState === 'initialized') {
				activateDisplay();
			}
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
			if (displayInitState === 'initialized') {
				activateDisplay();
			}
			return;
		}
		if (!featureEnabled || displayInitState !== 'initialized') { return; }
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
