import * as vscode from 'vscode';
import path from 'path';
import { CapsLockDecoration } from "./decoration";

class GutterIconDecoration extends CapsLockDecoration {
    buildDecoration(): void {
        if (this.decorationType !== null) {
            this.decorationType.dispose();
        }
        const iconPath = path.join(__dirname, 'capslock.png');
        this.decorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath: iconPath,
            gutterIconSize: "20px",
            overviewRulerLane: vscode.OverviewRulerLane.Right,
        });
    }

    showDecoration(): void {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.selection) {
            const cursorLineNumber = editor.selection.active.line;
            const options = [{ range: new vscode.Range(cursorLineNumber, 0, cursorLineNumber, 0) }];
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

const gutterIconDecoration: GutterIconDecoration = new GutterIconDecoration();

export { gutterIconDecoration, GutterIconDecoration };