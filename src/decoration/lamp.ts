import * as vscode from 'vscode';
import { extName, configKey, configDefaultValue } from '../config';

class Lamp implements vscode.Disposable {
    private statusBarItem: vscode.StatusBarItem;
    private capsLockOn = false;
    private enabled = true;
    private animating = false;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
        this.statusBarItem.command = 'caps-lock-state.toggle';
        this.update();
        this.statusBarItem.show();
    }

    setCapsLockState(on: boolean): void {
        const changed = this.capsLockOn !== on;
        this.capsLockOn = on;
        if (changed && this.enabled) {
            this.playCapsAnimation();
        } else if (!this.animating) {
            this.update();
        }
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        this.update();
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    private getCapsColor(): string {
        return vscode.workspace.getConfiguration(extName)
            .get(configKey['editorCursor.foreground'], configDefaultValue['editorCursor.foreground']);
    }

    /** CapsLock 状态切换时播放动画 */
    private playCapsAnimation(): void {
        this.animating = true;
        const targetColor = this.capsLockOn ? this.getCapsColor() : '#808080';

        // 第1帧：先显示旧状态图标
        this.statusBarItem.text = this.capsLockOn ? '$(unlock)' : '$(lock)';
        this.statusBarItem.color = targetColor;
        this.statusBarItem.backgroundColor = undefined;

        setTimeout(() => {
            // 第2帧：切换到目标状态（只切换一次）
            this.animating = false;
            this.update();
        }, 150);
    }

    private update(): void {
        if (!this.enabled) {
            // 关闭状态：空心 + 斜线，红色
            this.statusBarItem.text = '$(circle-slash)';
            this.statusBarItem.color = '#ff4444';
            this.statusBarItem.backgroundColor = undefined;
            this.statusBarItem.tooltip = this.capsLockOn
                ? 'Caps Lock: ON (feature disabled, click to enable)'
                : 'Caps Lock: OFF (feature disabled, click to enable)';
        } else if (this.capsLockOn) {
            // CapsLock ON：锁定图标，用户设置的光标颜色
            this.statusBarItem.text = '$(lock)';
            this.statusBarItem.color = this.getCapsColor();
            this.statusBarItem.backgroundColor = undefined;
            this.statusBarItem.tooltip = 'Caps Lock: ON (click to disable)';
        } else {
            // CapsLock OFF：解锁图标，灰色
            this.statusBarItem.text = '$(unlock)';
            this.statusBarItem.color = '#808080';
            this.statusBarItem.backgroundColor = undefined;
            this.statusBarItem.tooltip = 'Caps Lock: OFF';
        }
    }

    dispose(): void {
        this.statusBarItem.dispose();
    }
}

export { Lamp };
