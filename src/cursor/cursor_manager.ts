import * as vscode from "vscode";

const CURSOR_KEY = "editorCursor.foreground";
const CC_KEY = "workbench.colorCustomizations";

/**
 * 仅在 CapsLock 状态切换时写一次 editorCursor.foreground。
 *
 * - 激活时记录用户原本设置的光标颜色 (userOverrideColor)，停用 / OFF 时还原。
 */
class CursorManager {
  private active = false;
  /** 用户在 colorCustomizations 中原本设置的颜色；null 表示未设置（使用主题默认）。*/
  private userOverrideColor: string | null = null;
  /** 当前已写入的颜色，避免重复写配置。*/
  private currentWritten: string | null = null;

  isActivated(): boolean {
    return this.active;
  }

  activate(): void {
    if (this.active) {
      return;
    }
    this.active = true;

    const cc = vscode.workspace
      .getConfiguration()
      .get<Record<string, unknown>>(CC_KEY, {});
    const existing = cc[CURSOR_KEY];
    this.userOverrideColor = typeof existing === "string" ? existing : null;
    this.currentWritten = this.userOverrideColor;
  }

  /**
   * 初始化时清除旧配置，确保版本升级时插件完全接管光标颜色
   */
  async cleanupLegacyConfig(): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    const cc = { ...config.get<Record<string, unknown>>(CC_KEY, {}) };

    // 如果存在 editorCursor.foreground，删除它
    if (CURSOR_KEY in cc) {
      delete cc[CURSOR_KEY];
      try {
        await config.update(CC_KEY, cc, vscode.ConfigurationTarget.Global);
        console.log("Cleaned up legacy editorCursor.foreground configuration");
      } catch (error) {
        console.error("Failed to clean up legacy configuration:", error);
      }
    }
  }

  /** CapsLock ON：切换为自定义颜色 */
  setColor(color: string): void {
    if (!this.active) {
      return;
    }
    void this.writeCursorColor(color);
  }

  /** CapsLock OFF：还原为用户原本的颜色（或删除 key 让主题接管）*/
  resetColor(): void {
    if (!this.active) {
      return;
    }

    void this.writeCursorColor(this.userOverrideColor);
  }

  deactivate(): void {
    if (!this.active) {
      return;
    }
    this.active = false;
    void this.writeCursorColor(this.userOverrideColor);
  }

  /**
   * 写入 / 删除 editorCursor.foreground。
   * - color 为 null → 删除该 key
   * - 与当前已写入值一致则跳过，避免无意义的配置写入。
   */
  private async writeCursorColor(color: string | null): Promise<void> {
    if (color === this.currentWritten) {
      return;
    }

    const config = vscode.workspace.getConfiguration();
    const cc = { ...config.get<Record<string, unknown>>(CC_KEY, {}) };

    if (color === null) {
      if (!(CURSOR_KEY in cc)) {
        this.currentWritten = null;
        return;
      }
      delete cc[CURSOR_KEY];
    } else {
      if (cc[CURSOR_KEY] === color) {
        this.currentWritten = color;
        return;
      }
      cc[CURSOR_KEY] = color;
    }

    try {
      await config.update(CC_KEY, cc, vscode.ConfigurationTarget.Global);
      this.currentWritten = color;
    } catch {
      // 写入失败保持原状，下次切换时会重试
    }
  }
}

export const cursorManager = new CursorManager();
