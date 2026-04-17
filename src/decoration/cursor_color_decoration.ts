import * as vscode from 'vscode';
import { CapsLockDecoration } from "./decoration";
import { extName, configKey, configDefaultValue } from '../config';
import { cursorManager } from '../cursor';

class CursorColorDecoration extends CapsLockDecoration {
    buildDecoration(): void {
        if (!cursorManager.isActivated()) {
            cursorManager.activate();
        }
    }

    showDecoration(): void {
        const config = vscode.workspace.getConfiguration(extName);
        const capsColor = config.get(configKey['editorCursor.foreground'], configDefaultValue['editorCursor.foreground']);
        cursorManager.setColor(capsColor);
    }

    hideDecoration(): void {
        cursorManager.resetColor();
    }

    removeDecoration(): void {
        cursorManager.deactivate();
    }
}

export { CursorColorDecoration };
