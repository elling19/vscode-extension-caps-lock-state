import * as vscode from 'vscode';
import * as path from 'path';
import { readFileSync } from 'fs';

function stripJsonComments(text: string): string {
    let result = '';
    let i = 0;
    let inString = false;
    while (i < text.length) {
        if (inString) {
            if (text[i] === '\\') { result += text[i] + (text[i + 1] || ''); i += 2; continue; }
            if (text[i] === '"') { inString = false; }
            result += text[i++];
        } else if (text[i] === '"') {
            inString = true; result += text[i++];
        } else if (text[i] === '/' && text[i + 1] === '/') {
            while (i < text.length && text[i] !== '\n') { i++; }
        } else if (text[i] === '/' && text[i + 1] === '*') {
            i += 2; while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) { i++; } i += 2;
        } else {
            result += text[i++];
        }
    }
    return result;
}

function readColorFromTheme(filePath: string, key: string, depth = 0): string | null {
    if (depth > 5) { return null; }
    try {
        const data = JSON.parse(stripJsonComments(readFileSync(filePath, 'utf-8')).replace(/,\s*([\]}])/g, '$1'));
        if (data.colors?.[key]) { return data.colors[key]; }
        if (data.include) { return readColorFromTheme(path.resolve(path.dirname(filePath), data.include), key, depth + 1); }
    } catch { }
    return null;
}

export function resolveThemeCursorColor(): string {
    const themeName = vscode.workspace.getConfiguration('workbench').get<string>('colorTheme', '');
    if (themeName) {
        for (const ext of vscode.extensions.all) {
            const themes: any[] = ext.packageJSON?.contributes?.themes;
            if (!themes) { continue; }
            for (const t of themes) {
                if (t.label === themeName || t.id === themeName) {
                    const color = readColorFromTheme(path.join(ext.extensionPath, t.path), 'editorCursor.foreground');
                    if (color) { return color; }
                }
            }
        }
    }
    // 兜底：VS Code 内部硬编码默认值
    const kind = vscode.window.activeColorTheme.kind;
    switch (kind) {
        case vscode.ColorThemeKind.Light: return '#000000';
        case vscode.ColorThemeKind.HighContrastLight: return '#0F4A85';
        case vscode.ColorThemeKind.HighContrast: return '#FFFFFF';
        default: return '#AEAFAD';
    }
}
