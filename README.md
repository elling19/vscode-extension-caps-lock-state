[![Nodejs Version](https://img.shields.io/badge/nodejs-20.10.0-green)](https://nodejs.org)

# Caps Lock State (Beta)

> Real-time Caps Lock state monitoring for Visual Studio Code.

Currently only tested on **Windows**.


## Configuration

Open **Settings** (`Ctrl+,`) and search for **Caps Lock State** to customize:

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `caps-lock-state.display_method` | string | `method_cursor_color` | Choose the display method for Caps Lock state. |
| `caps-lock-state.delay_time` | integer | `20` | Polling interval for detecting Caps Lock state changes (ms). |

## Display Methods

You can switch display styles by setting `caps-lock-state.display_method` in your `settings.json`.

### 1. Cursor Color (Default)

Changes the editor cursor color when Caps Lock is ON.

![Cursor Color](https://raw.githubusercontent.com/elling19/vscode-extension-caps-lock-state/master/docs/md_cursor_color.gif)

```json
{
  "caps-lock-state.display_method": "method_cursor_color",
  "caps-lock-state.editorCursor.foreground": "#00ff00"
}
```

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `caps-lock-state.editorCursor.foreground` | string | `#00ff00` | Cursor color when Caps Lock is ON. e.g. `#00ff00`, `red`, `rgba(0,255,0,1)` |

#### Known Issues

**Cursor invisible in some input areas:** The extension hides the native cursor by setting it to transparent and renders a custom cursor via the Decoration API. However, `editorCursor.foreground` is a global setting that affects all Monaco editor instances. The Decoration API can only render in file editors, so cursors in **Copilot Chat** input box, **SCM (Git)** commit message box, and **Search Editor** will be invisible. Cursors in Search bar, Settings page, Command Palette, and Terminal are not affected.

**Cursor color not restored after uninstall:** A leftover `editorCursor.foreground` entry may remain in your settings. Open Command Palette (`Ctrl+Shift+P`) → **Preferences: Open User Settings (JSON)** and delete the `editorCursor.foreground` line inside `workbench.colorCustomizations`.

### 2. Status Bar

Shows a text indicator in the status bar when Caps Lock is ON.

![Status Bar](https://raw.githubusercontent.com/elling19/vscode-extension-caps-lock-state/master/docs/md_3.gif)

```json
{
  "caps-lock-state.display_method": "method_status_bar",
  "caps-lock-state.status_bar_text": "🔒 Caps Lock ON!"
}
```

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `caps-lock-state.status_bar_text` | string | `🔒 Caps Lock ON!` | Status bar text. e.g. `🔒 Caps Lock ON!`, `⚠ CAPS`, `[A]` |

### 3. Background Color

Highlights the current line with a background color when Caps Lock is ON.

![Line Background](https://raw.githubusercontent.com/elling19/vscode-extension-caps-lock-state/master/docs/md_2.gif)

```json
{
  "caps-lock-state.display_method": "method_background_color",
  "caps-lock-state.background_color": "rgba(255, 0, 0, 0.7)"
}
```

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `caps-lock-state.background_color` | string | `rgba(255,0,0,0.7)` | Background color. e.g. `#ff0000b3`, `rgba(255,0,0,0.7)`, `red` |

### 4. Gutter Icon

Shows a lock icon in the editor gutter when Caps Lock is ON. No additional parameters.

![Gutter Icon](https://raw.githubusercontent.com/elling19/vscode-extension-caps-lock-state/master/docs/md_5.gif)

```json
{
  "caps-lock-state.display_method": "method_gutter_icon"
}
```

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, please [submit an issue](https://github.com/elling19/vscode-extension-caps-lock-state/issues) or [create a pull request](https://github.com/elling19/vscode-extension-caps-lock-state/pulls).

## License

This project is licensed under the [MIT License](https://github.com/elling19/vscode-extension-caps-lock-state/blob/master/LICENSE).