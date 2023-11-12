import * as vscode from 'vscode';
import { CapsLockDecoration } from "./decoration";
import { extName, configKey, configDefaultValue } from '../config';

class StatusBarDecoration extends CapsLockDecoration {
    buildDecoration(): void {
        if (this.decorationType !== null) {
            this.decorationType.dispose();
        }
        const config = vscode.workspace.getConfiguration(extName);
        const status_text = config.get(configKey.status_bar_text, configDefaultValue.status_bar_text);
        this.decorationType = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
        this.decorationType.color = new vscode.ThemeColor('errorForeground');
        this.decorationType.text = status_text;
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