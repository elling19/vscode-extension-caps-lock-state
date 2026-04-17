import * as vscode from 'vscode';
import { CapsLockDecoration } from "./decoration";
import { extName, configKey, configDefaultValue } from '../config';

class CursorColorDecoration extends CapsLockDecoration {
    // 用户原始的 editorCursor.foreground 颜色（从清理后的 colorCustomizations 读取）
    // null 表示用户未自定义，使用主题默认值
    private userOriginalColor: string | null = null;
    private isShowing: boolean = false;

    buildDecoration(): void {
        // 仅在未显示时更新原始颜色，避免读取到插件写入的值
        if (!this.isShowing) {
            const config = vscode.workspace.getConfiguration();
            const colorCustomizations = config.get<Record<string, any>>('workbench.colorCustomizations', {});
            this.userOriginalColor = colorCustomizations['editorCursor.foreground'] || null;
        }
    }

    showDecoration(): void {
        if (this.isShowing) { return; }
        this.isShowing = true;

        const config = vscode.workspace.getConfiguration(extName);
        const cursorColor = config.get(configKey['editorCursor.foreground'], configDefaultValue['editorCursor.foreground']);
        this.writeEditorCursorColor(cursorColor);
    }

    hideDecoration(): void {
        if (!this.isShowing) { return; }
        this.isShowing = false;
        this.restoreColor();
    }

    removeDecoration(): void {
        this.isShowing = false;
        this.restoreColor();
    }

    private writeEditorCursorColor(color: string | null): void {
        const config = vscode.workspace.getConfiguration();
        const colorCustomizations: Record<string, any> = { ...config.get<Record<string, any>>('workbench.colorCustomizations', {}) };

        if (color) {
            colorCustomizations['editorCursor.foreground'] = color;
        } else {
            delete colorCustomizations['editorCursor.foreground'];
        }
        config.update('workbench.colorCustomizations', colorCustomizations, vscode.ConfigurationTarget.Global).then(
            () => console.log('[CapsLock] update succeeded'),
            (err: any) => console.error('[CapsLock] update failed:', err)
        );
    }

    private restoreColor(): void {
        this.writeEditorCursorColor(this.userOriginalColor);
    }
}

export { CursorColorDecoration };
