import * as vscode from 'vscode';
import {
    CursorStyleName,
    getEditorCursorStyle,
    readCursorBlinking,
    needsCharacterRange,
    buildDecorationOptions,
    buildEolDecoration,
} from './cursor_style';
import { resolveThemeCursorColor } from './theme_color';

const TRANSPARENT = '#00000000';
const BLINK_ON_MS = 530;
const BLINK_OFF_MS = 530;

class CursorManager {
    private decorationTypes: Map<CursorStyleName, vscode.TextEditorDecorationType> = new Map();
    private color = '';
    /** 变量 A：主题光标颜色，CapsLock OFF 时使用 */
    private defaultColor = '';
    /** 用户在 colorCustomizations 中手动设置的颜色（非本插件写入） */
    private userOverrideColor: string | null = null;
    private blinkTimer: ReturnType<typeof setTimeout> | null = null;
    private blinkCycleStart = 0;
    private blinkVisible = true;
    private active = false;
    private writingConfig = false;
    private disposables: vscode.Disposable[] = [];

    isActivated(): boolean {
        return this.active;
    }

    isRealCursorTransparent(): boolean {
        const config = vscode.workspace.getConfiguration();
        const colorCustomizations = config.get<Record<string, unknown>>('workbench.colorCustomizations', {});
        const cursorForeground = colorCustomizations['editorCursor.foreground'];
        if (typeof cursorForeground !== 'string') {
            return false;
        }
        return cursorForeground.trim().toLowerCase() === TRANSPARENT;
    }

    /**
     * 激活光标管理器：
     * 1. 读取用户自定义颜色（如果有）
     * 2. 清除自定义 → 读取主题光标颜色 → 存为 defaultColor（变量 A）
      * 3. 写入透明色隐藏真实光标
     * 4. 用装饰器接管光标渲染
     */
    activate(): void {
        if (this.active) { return; }
        this.active = true;

        // Step 1: 读取 colorCustomizations 中的值
        const config = vscode.workspace.getConfiguration();
        const cc = config.get<Record<string, any>>('workbench.colorCustomizations', {});
        const existingColor = cc['editorCursor.foreground'] || null;

        // 如果有非透明的用户自定义颜色，保存下来
        if (existingColor && typeof existingColor === 'string' && existingColor.trim().toLowerCase() !== TRANSPARENT) {
            this.userOverrideColor = existingColor;
            this.defaultColor = existingColor;
        } else {
            this.userOverrideColor = null;
            // 无用户自定义 → 从主题文件读取光标颜色
            this.defaultColor = resolveThemeCursorColor();
        }

        // Step 3: 设透明隐藏真实光标（仅写一次配置）
        this.hideRealCursor();

        // Step 4: 初始化装饰器（默认使用 defaultColor 即变量 A）
        this.color = this.defaultColor;
        this.rebuildAllDecorationTypes();
        this.startBlink();
        this.registerListeners();
        this.render();
    }

    /**
     * CapsLock ON：切换装饰器到自定义颜色 B
     */
    setColor(color: string): void {
        if (!this.active || this.color === color) { return; }
        this.color = color;
        this.rebuildAllDecorationTypes();
        this.resetBlinkCycle();
        this.render();
    }

    /**
     * CapsLock OFF：切换装饰器回 defaultColor（变量 A）
     */
    resetColor(): void {
        if (!this.active) { return; }
        if (this.color === this.defaultColor) { return; }
        this.color = this.defaultColor;
        this.rebuildAllDecorationTypes();
        this.resetBlinkCycle();
        this.render();
    }

    deactivate(): void {
        if (!this.active) { return; }
        this.active = false;
        this.stopBlink();
        this.clearAllDecorations();
        this.disposeAllDecorationTypes();
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.restoreRealCursor();
    }

    /* ─── decoration type cache ────────────── */

    private readonly ALL_STYLES: CursorStyleName[] = [
        'line', 'line-thin', 'block', 'block-outline', 'underline', 'underline-thin'
    ];

    private rebuildAllDecorationTypes(): void {
        this.disposeAllDecorationTypes();
        for (const style of this.ALL_STYLES) {
            this.decorationTypes.set(
                style,
                vscode.window.createTextEditorDecorationType(buildDecorationOptions(this.color, style))
            );
        }
    }

    private disposeAllDecorationTypes(): void {
        this.decorationTypes.forEach(dt => dt.dispose());
        this.decorationTypes.clear();
    }

    private clearAllDecorations(): void {
        for (const editor of vscode.window.visibleTextEditors) {
            this.decorationTypes.forEach(dt => editor.setDecorations(dt, []));
        }
    }

    // 隐藏 VS Code 内置光标（设置为透明色）
    private hideRealCursor(): void {
        if (this.writingConfig) { console.log('[CursorManager] hideRealCursor skipped: writingConfig'); return; }
        const config = vscode.workspace.getConfiguration();
        const cc = { ...config.get<Record<string, any>>('workbench.colorCustomizations', {}) };
        if (cc['editorCursor.foreground'] === TRANSPARENT) { return; }
        cc['editorCursor.foreground'] = TRANSPARENT;
        this.writingConfig = true;
        config.update('workbench.colorCustomizations', cc, vscode.ConfigurationTarget.Global).then(
            () => { this.writingConfig = false; this.render(); },
            () => { this.writingConfig = false; }
        );
    }

    // 将光标颜色恢复为主题颜色
    private restoreRealCursor(): void {
        if (this.writingConfig) { console.log('[CursorManager] restoreRealCursor skipped: writingConfig'); return; }
        const config = vscode.workspace.getConfiguration();
        const cc = { ...config.get<Record<string, any>>('workbench.colorCustomizations', {}) };
        if (this.userOverrideColor) {
            cc['editorCursor.foreground'] = this.userOverrideColor;
        } else {
            delete cc['editorCursor.foreground'];
        }
        this.writingConfig = true;
        config.update('workbench.colorCustomizations', cc, vscode.ConfigurationTarget.Global).then(
            () => { this.writingConfig = false; },
            () => { this.writingConfig = false; }
        );
    }


    // 处理主题切换事件
    private handleThemeChange(): void {
        if (!this.active) { return; }
        if (this.userOverrideColor) { return; }

        const oldDefault = this.defaultColor;
        this.defaultColor = resolveThemeCursorColor();

        if (this.color === oldDefault) {
            this.color = this.defaultColor;
        }

        this.rebuildAllDecorationTypes();
        this.render();
    }


    // 注册 VS Code 事件监听器
    private registerListeners(): void {
        this.disposables.push(
            vscode.window.onDidChangeTextEditorSelection(() => {
                if (!this.active) { return; }
                this.resetBlinkCycle();
                this.render();
            }),
            vscode.window.onDidChangeActiveTextEditor(() => {
                if (!this.active) { return; }
                this.hideRealCursor();
                this.resetBlinkCycle();
                this.render();
            }),
            vscode.window.onDidChangeTextEditorOptions(e => {
                if (!this.active) { return; }
                this.resetBlinkCycle();
                this.render();
            }),
            vscode.window.onDidChangeVisibleTextEditors(() => {
                if (!this.active) { return; }
                this.render();
            }),
            vscode.workspace.onDidChangeConfiguration(e => {
                if (!this.active) { return; }
                if (e.affectsConfiguration('editor.cursorBlinking')) {
                    this.startBlink();
                    this.render();
                }
            }),
            vscode.window.onDidChangeActiveColorTheme(() => {
                if (!this.active) { return; }
                this.handleThemeChange();
            }),
        );
    }

    // 光标闪烁控制
    private startBlink(): void {
        this.stopBlink();
        if (readCursorBlinking() === 'solid') {
            this.blinkVisible = true;
            return;
        }
        this.blinkCycleStart = Date.now();
        this.blinkVisible = true;
        this.scheduleNextBlinkEdge();
    }

    // 重置闪烁周期（如光标位置变化时）
    private resetBlinkCycle(): void {
        if (this.blinkTimer === null) { return; }
        clearTimeout(this.blinkTimer);
        this.blinkCycleStart = Date.now();
        this.blinkVisible = true;
        this.scheduleNextBlinkEdge();
    }

    // 停止闪烁
    private stopBlink(): void {
        if (this.blinkTimer !== null) {
            clearTimeout(this.blinkTimer);
            this.blinkTimer = null;
        }
        this.blinkVisible = true;
    }

    private scheduleNextBlinkEdge(): void {
        if (!this.active) { return; }

        const cycleMs = BLINK_ON_MS + BLINK_OFF_MS;
        const elapsedMs = Date.now() - this.blinkCycleStart;
        const phaseMs = ((elapsedMs % cycleMs) + cycleMs) % cycleMs;
        const shouldBeVisible = phaseMs < BLINK_ON_MS;

        if (this.blinkVisible !== shouldBeVisible) {
            this.blinkVisible = shouldBeVisible;
            this.render();
        }

        const msUntilEdge = shouldBeVisible ? (BLINK_ON_MS - phaseMs) : (cycleMs - phaseMs);
        this.blinkTimer = setTimeout(() => {
            this.scheduleNextBlinkEdge();
        }, Math.max(1, msUntilEdge));
    }

    // 渲染光标装饰
    private render(): void {
        if (!this.active) { return; }
        const activeEditor = vscode.window.activeTextEditor;

        for (const editor of vscode.window.visibleTextEditors) {
            const style = getEditorCursorStyle(editor);
            const matchDt = this.decorationTypes.get(style);
            const isActiveHidden = editor === activeEditor && !this.blinkVisible;

            this.decorationTypes.forEach((dt, dtStyle) => {
                if (dt === matchDt && !isActiveHidden) {
                    editor.setDecorations(dt, this.buildDecorations(editor, dtStyle));
                } else {
                    editor.setDecorations(dt, []);
                }
            });
        }
    }

    // 根据光标样式构建装饰项
    private buildDecorations(editor: vscode.TextEditor, style: CursorStyleName): vscode.DecorationOptions[] {
        const items: vscode.DecorationOptions[] = [];
        const charRange = needsCharacterRange(style);

        for (const sel of editor.selections) {
            const pos = sel.active;
            if (!charRange) {
                items.push({ range: new vscode.Range(pos, pos) });
                continue;
            }
            const lineText = editor.document.lineAt(pos.line).text;
            if (pos.character < lineText.length) {
                items.push({ range: new vscode.Range(pos, pos.translate(0, 1)) });
            } else {
                items.push(buildEolDecoration(pos, this.color, style));
            }
        }
        return items;
    }
}

export const cursorManager = new CursorManager();
