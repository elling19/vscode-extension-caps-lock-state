# Other Display Methods

The default display method is **Cursor Color**. You can switch to other styles by setting `caps-lock-state.display_method` in your `settings.json`:

## 1. Status Bar

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

## 2. Line Background

Highlights the current line with a background color when Caps Lock is ON.

```json
{
  "caps-lock-state.display_method": "method_background_color",
  "caps-lock-state.background_color": "rgba(255, 0, 0, 0.7)"
}
```

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `caps-lock-state.background_color` | string | `rgba(255,0,0,0.7)` | Background color. e.g. `#ff0000b3`, `rgba(255,0,0,0.7)`, `red` |

## 4. Gutter Icon

Shows a lock icon in the editor gutter when Caps Lock is ON. No additional parameters.

```json
{
  "caps-lock-state.display_method": "method_gutter_icon"
}
```
