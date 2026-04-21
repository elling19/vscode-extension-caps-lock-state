[![Nodejs Version](https://img.shields.io/badge/nodejs-20.10.0-green)](https://nodejs.org)

# Caps Lock State (Beta)

> Real-time Caps Lock state monitoring for Visual Studio Code.

Currently only tested on **Windows**.

![Cursor Color](https://raw.githubusercontent.com/elling19/vscode-extension-caps-lock-state/master/docs/md_cursor_color.gif)


## Configuration

Open **Settings** (`Ctrl+,`) and search for **Caps Lock State** to customize:

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `caps-lock-state.delay_time` | integer | `20` | Polling interval for detecting Caps Lock state changes (ms). |
| `caps-lock-state.editorCursor.foreground` | string | `#00ff00` | Cursor color when Caps Lock is ON. |


#### Known Issues

**Cursor invisible in some input areas:** The extension hides the native cursor by setting it to transparent and renders a custom cursor via the Decoration API. However, `editorCursor.foreground` is a global setting that affects all Monaco editor instances. The Decoration API can only render in file editors, so cursors in **Copilot Chat** input box, **SCM (Git)** commit message box, and **Search Editor** will be invisible. Cursors in Search bar, Settings page, Command Palette, and Terminal are not affected.

**Cursor color not restored after uninstall:** A leftover `editorCursor.foreground` entry may remain in your settings. Open Command Palette (`Ctrl+Shift+P`) → **Preferences: Open User Settings (JSON)** and delete the `editorCursor.foreground` line inside `workbench.colorCustomizations`.

## Legacy Settings

Legacy (old-version) settings are documented in [LEGACY_SETTINGS.md](./LEGACY_SETTINGS.md).

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, please [submit an issue](https://github.com/elling19/vscode-extension-caps-lock-state/issues) or [create a pull request](https://github.com/elling19/vscode-extension-caps-lock-state/pulls).

## License

This project is licensed under the [MIT License](https://github.com/elling19/vscode-extension-caps-lock-state/blob/master/LICENSE).