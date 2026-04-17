import * as vscode from 'vscode';

export type CursorStyleName = 'line' | 'line-thin' | 'block' | 'block-outline' | 'underline' | 'underline-thin';

const STYLE_MAP: Record<number, CursorStyleName> = {
    [vscode.TextEditorCursorStyle.Line]: 'line',
    [vscode.TextEditorCursorStyle.LineThin]: 'line-thin',
    [vscode.TextEditorCursorStyle.Block]: 'block',
    [vscode.TextEditorCursorStyle.BlockOutline]: 'block-outline',
    [vscode.TextEditorCursorStyle.Underline]: 'underline',
    [vscode.TextEditorCursorStyle.UnderlineThin]: 'underline-thin',
};

export function getEditorCursorStyle(editor: vscode.TextEditor): CursorStyleName {
    return STYLE_MAP[editor.options.cursorStyle as number] || 'line';
}

export function readCursorBlinking(): string {
    return vscode.workspace.getConfiguration('editor').get<string>('cursorBlinking', 'blink');
}

export function needsCharacterRange(style: CursorStyleName): boolean {
    return style !== 'line' && style !== 'line-thin';
}

export function buildDecorationOptions(color: string, style: CursorStyleName): vscode.DecorationRenderOptions {
    switch (style) {
        case 'line':
            return { borderColor: color, borderStyle: 'none none none solid', borderWidth: '0 0 0 2px' };
        case 'line-thin':
            return { borderColor: color, borderStyle: 'none none none solid', borderWidth: '0 0 0 1px' };
        case 'block':
            return { backgroundColor: color };
        case 'block-outline':
            return { borderColor: color, borderStyle: 'solid', borderWidth: '1px' };
        case 'underline':
            return { borderColor: color, borderStyle: 'none none solid none', borderWidth: '0 0 2px 0' };
        case 'underline-thin':
            return { borderColor: color, borderStyle: 'none none solid none', borderWidth: '0 0 1px 0' };
    }
}

export function buildEolDecoration(pos: vscode.Position, color: string, style: CursorStyleName): vscode.DecorationOptions {
    let after: vscode.ThemableDecorationAttachmentRenderOptions;
    switch (style) {
        case 'block':
            after = { contentText: '\u00a0', backgroundColor: color };
            break;
        case 'block-outline':
            after = { contentText: '\u00a0', border: `1px solid ${color}` };
            break;
        case 'underline':
            after = { contentText: '\u00a0', textDecoration: `underline ${color} 2px` };
            break;
        case 'underline-thin':
            after = { contentText: '\u00a0', textDecoration: `underline ${color} 1px` };
            break;
        default:
            after = {};
    }
    return {
        range: new vscode.Range(pos, pos),
        renderOptions: { after },
    };
}
