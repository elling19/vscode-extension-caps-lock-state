
const extName = "caps-lock-state";
const configKey = {
    choose_display_method: "choose_display_method",
    cursor_text: "cursor_text",
    cursor_text_color: "cursor_text_color",
    line_background_color: "line_background_color",
    status_bar_text: "status_bar_text",
};
const configDefaultValue = {
    choose_display_method: "method_background_color",
    cursor_text: "Caps On",
    cursor_text_color: "red",
    line_background_color: "rgba(255,0,0,0.7)",
    status_bar_text: "🔒 Caps Lock ON!"
};

export { extName, configKey, configDefaultValue };
