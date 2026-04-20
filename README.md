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

> For other display methods, see [Other Display Methods](LEGACY_SETTINGS.md).

#### Example (`settings.json`)

```json
{
  "caps-lock-state.editorCursor.foreground": "#00ff00",
  "caps-lock-state.delay_time": 20
}
```

## Known Issues

### Cursor invisible in some input areas

The extension hides the native editor cursor by setting it to transparent and renders a custom cursor via the Decoration API. However, `editorCursor.foreground` is a global setting that affects all Monaco editor instances. The Decoration API can only render in file editors, so cursors in the following areas will be invisible:

- **Copilot Chat** input box
- **SCM (Git)** commit message box
- **Search Editor** (the editor view, not the search bar)

Cursors in the following areas are **not affected**:

- Search bar, Settings page, Command Palette (HTML `<input>` elements)
- Terminal (uses `terminalCursor.foreground`)

### Cursor color not restored after uninstall

After uninstalling the extension, a leftover `editorCursor.foreground` entry may remain in your settings. To fix:

1. Open Command Palette (`Ctrl+Shift+P`) → **Preferences: Open User Settings (JSON)**
2. Delete the `editorCursor.foreground` line inside `workbench.colorCustomizations`:

```json
"workbench.colorCustomizations": {
    "editorCursor.foreground": "#00ff00"  // ← delete this line
}
```

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, please [submit an issue](https://github.com/elling19/vscode-extension-caps-lock-state/issues) or [create a pull request](https://github.com/elling19/vscode-extension-caps-lock-state/pulls).

## License

This project is licensed under the [MIT License](https://github.com/elling19/vscode-extension-caps-lock-state/blob/master/LICENSE).