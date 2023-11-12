import * as vscode from 'vscode';
import { CapsLockDecoration } from './decoration';
import { extName, configKey, configDefaultValue } from '../config';

class CursorTextDecoration extends CapsLockDecoration {
    buildDecoration(): void {
        if (this.decorationType !== null) {
            this.decorationType.dispose();
        }
        const config = vscode.workspace.getConfiguration(extName);
        const contentText = config.get(configKey.cursor_text, configDefaultValue.cursor_text);
        const color = config.get(configKey.cursor_text_color, configDefaultValue.cursor_text_color);
        this.decorationType = vscode.window.createTextEditorDecorationType({
            before: {
                contentText: contentText,
                color: color,
                margin: '0,0,0,0px'
            },
            isWholeLine: false,
            overviewRulerLane: vscode.OverviewRulerLane.Right
        });
    }

    showDecoration(): void {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.selection) {
            if (this.decorationType === null) {
                this.buildDecoration();
            }
            const options = [{ range: new vscode.Range(editor.selection.active, editor.selection.active.translate(0, 1)) }];
            editor.setDecorations(this.decorationType, options);
        }
    }
    hideDecoration(): void {
        if (this.decorationType) {
            vscode.window.activeTextEditor?.setDecorations(this.decorationType, []);
        }
    }
    removeDecoration(): void {
        if (this.decorationType !== null) {
            this.decorationType.dispose();
        }
        this.decorationType = null;
    }
}

const cursorTextDecoration: CursorTextDecoration = new CursorTextDecoration();

export { cursorTextDecoration, CursorTextDecoration };