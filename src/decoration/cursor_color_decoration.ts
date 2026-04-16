import * as vscode from 'vscode';
import { CapsLockDecoration } from "./decoration";
import { extName, configKey, configDefaultValue } from '../config';

class CursorColorDecoration extends CapsLockDecoration {
    private originalColor: string | undefined = undefined;
    private isShowing: boolean = false;

    buildDecoration(): void {
        // 无需创建 decorationType，本装饰通过修改 colorCustomizations 实现
    }

    showDecoration(): void {
        if (this.isShowing) { return; }
        this.isShowing = true;

        const config = vscode.workspace.getConfiguration(extName);
        const cursorColor = config.get(configKey.cursor_color, configDefaultValue.cursor_color);
        this.writeCursorColor(cursorColor);
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

    private writeCursorColor(color: string | null): void {
        const config = vscode.workspace.getConfiguration();
        const colorCustomizations: Record<string, any> = { ...config.get<Record<string, any>>('workbench.colorCustomizations', {}) };

        // 保存用户原有光标颜色（仅一次）
        if (this.originalColor === undefined) {
            this.originalColor = colorCustomizations['editorCursor.foreground'] || null;
        }

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
        this.writeCursorColor(this.originalColor || null);
    }
}

export { CursorColorDecoration };
