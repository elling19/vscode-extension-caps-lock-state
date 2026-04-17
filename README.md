[![Nodejs Version](https://img.shields.io/badge/nodejs-20.10.0-green)](https://nodejs.org)

# Caps Lock State (Beta)

> Real-time Caps Lock state monitoring for Visual Studio Code.

Currently only tested on **Windows**.

## Demo

![Demo](https://raw.githubusercontent.com/elling19/vscode-extension-caps-lock-state/master/docs/md_1.gif)

## Installation

1. Open Visual Studio Code
2. Open the Extensions view (`Ctrl+Shift+X`)
3. Search for **Caps Lock State**
4. Click **Install**

---

## Usage

The extension works out of the box — once installed, it automatically changes the editor cursor color when Caps Lock is ON.

### Configuration

Open **Settings** (`Ctrl+,`) and search for **Caps Lock State** to customize:

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `caps-lock-state.editorCursor.foreground` | string | `#00ff00` | Cursor foreground color when Caps Lock is ON. Accepts any CSS color value. |
| `caps-lock-state.delay_time` | integer | `20` | Polling interval for detecting Caps Lock state changes (ms). |

> For other display methods, see [Other Display Methods](#other-display-methods).

#### Example (`settings.json`)

```json
{
  "caps-lock-state.editorCursor.foreground": "#00ff00",
  "caps-lock-state.delay_time": 20
}
```

## Other Display Methods

The default display method is **Cursor Color**. You can switch to other styles by setting `caps-lock-state.display_method` in your `settings.json`:

### 1. Cursor Text

Shows a text decoration before the cursor position when Caps Lock is ON.

```json
{
  "caps-lock-state.display_method": "method_cursor_text",
  "caps-lock-state.cursor_text": "🔒",
  "caps-lock-state.cursor_text_color": "red"
}
```

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `caps-lock-state.cursor_text` | string | `🔒` | Text shown before cursor. e.g. `🔒`, `⬤`, `CAPS` |
| `caps-lock-state.cursor_text_color` | string | `red` | Text color. e.g. `#ff0000`, `red`, `rgba(255,0,0,1)` |

### 2. Status Bar

Shows a text indicator in the status bar when Caps Lock is ON.

```json
{
  "caps-lock-state.display_method": "method_status_bar",
  "caps-lock-state.status_bar_text": "🔒 Caps Lock ON!"
}
```

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `caps-lock-state.status_bar_text` | string | `🔒 Caps Lock ON!` | Status bar text. e.g. `🔒 Caps Lock ON!`, `⚠ CAPS`, `[A]` |

### 3. Line Background

Highlights the current line with a background color when Caps Lock is ON.

```json
{
  "caps-lock-state.display_method": "method_background_color",
  "caps-lock-state.line_background_color": "rgba(255, 0, 0, 0.7)"
}
```

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `caps-lock-state.line_background_color` | string | `rgba(255,0,0,0.7)` | Background color. e.g. `#ff0000b3`, `rgba(255,0,0,0.7)`, `red` |

### 4. Gutter Icon

Shows a lock icon in the editor gutter when Caps Lock is ON. No additional parameters.

```json
{
  "caps-lock-state.display_method": "method_gutter_icon"
}
```

## Uninstall

1. Open the Extensions view (`Ctrl+Shift+X`)
2. Find **Caps Lock State** and click **Uninstall**
3. If the cursor color looks different from expected, open Command Palette (`Ctrl+Shift+P`) → **Preferences: Open User Settings (JSON)**, and delete the `editorCursor.foreground` line inside `workbench.colorCustomizations`:

```json
"workbench.colorCustomizations": {
    "editorCursor.foreground": "#00ff00"  // ← delete this line
}
```

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, please [submit an issue](https://github.com/elling19/vscode-extension-caps-lock-state/issues) or [create a pull request](https://github.com/elling19/vscode-extension-caps-lock-state/pulls).

## License

This project is licensed under the [MIT License](https://github.com/elling19/vscode-extension-caps-lock-state/blob/master/LICENSE).