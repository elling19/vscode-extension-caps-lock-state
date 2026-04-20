import * as vscode from 'vscode';
import { CapsLockDecoration } from "./decoration";

/**
 * @deprecated Replaced by Lamp indicator. Kept for backward compatibility.
 */
class StatusBarDecoration extends CapsLockDecoration {
    buildDecoration(): void {
        if (this.decorationType !== null) {
            this.decorationType.dispose();
        }
        this.decorationType = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
        this.decorationType.color = new vscode.ThemeColor('errorForeground');
        this.decorationType.text = '🔒 Caps Lock ON!';
    }


    showDecoration(): void {
        this.decorationType.show();
    }
    hideDecoration(): void {
        if (this.decorationType) {
            this.decorationType.hide();
        }
    }
    removeDecoration(): void {
        if (this.decorationType !== null) {
            this.decorationType.dispose();
        }
        this.decorationType = null;
    }
}

const statusBarDecoration: StatusBarDecoration = new StatusBarDecoration();

export { statusBarDecoration, StatusBarDecoration };