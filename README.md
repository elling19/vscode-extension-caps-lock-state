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


## How It Works
it writes / restores the value of `editorCursor.foreground` inside `workbench.colorCustomizations`:

| Caps Lock state | Action |
| --- | --- |
| ON  | Write `editorCursor.foreground = <your custom color>` |
| OFF | Restore the original value (or remove the key, letting the active theme decide) |


#### Known Issues

`editorCursor.foreground` may remain in your settings after disable/uninstall.
Open Command Palette (`Ctrl+Shift+P`) → **Preferences: Open User Settings (JSON)**
and delete the `editorCursor.foreground` line inside
`workbench.colorCustomizations` if needed.

## Legacy Settings

Legacy (old-version) settings are documented in [LEGACY_SETTINGS.md](./LEGACY_SETTINGS.md).

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, please [submit an issue](https://github.com/elling19/vscode-extension-caps-lock-state/issues) or [create a pull request](https://github.com/elling19/vscode-extension-caps-lock-state/pulls).

## License

This project is licensed under the [MIT License](https://github.com/elling19/vscode-extension-caps-lock-state/blob/master/LICENSE).