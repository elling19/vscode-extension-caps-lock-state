import * as vscode from 'vscode';
import { CapsLockDecoration } from "./decoration";
import { extName, configKey, configDefaultValue } from '../config';

class LineBackgroundColorDecoration extends CapsLockDecoration {
    buildDecoration(): void {
        if (this.decorationType !== null) {
            this.decorationType.dispose();
        }
        const config = vscode.workspace.getConfiguration(extName);
        const lineBackgroundColor = config.get(configKey.line_background_color, configDefaultValue.line_background_color);
        if (this.decorationType !== null) {
            this.decorationType.dispose();
        }
        this.decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: lineBackgroundColor,
        });
    }

    showDecoration(): void {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.selection) {
            const currentPosition = editor.selection.active;
            const options = [
                {
                    range: new vscode.Range(currentPosition.with({ character: 0 }), currentPosition.with({ character: Number.MAX_VALUE })),
                },
            ];
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

const lineBackgroundColorDecoration: LineBackgroundColorDecoration = new LineBackgroundColorDecoration();

export { lineBackgroundColorDecoration, LineBackgroundColorDecoration };