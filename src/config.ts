const extName = "caps-lock-state";
const configKey = {
    delay_time: "delay_time",
    choose_display_method: "choose_display_method",
    cursor_text: "cursor_text",
    cursor_text_color: "cursor_text_color",
    line_background_color: "line_background_color",
    status_bar_text: "status_bar_text",
};
const configDefaultValue = {
    delay_time: 20,
    choose_display_method: "method_background_color",
    cursor_text: "Caps On",
    cursor_text_color: "red",
    line_background_color: "rgba(255,0,0,0.7)",
    status_bar_text: "🔒 Caps Lock ON!"
};

// 存储扩展路径，在 activate 时初始化
let extensionPath: string = '';

function setExtensionPath(path: string): void {
    extensionPath = path;
}

function getExtensionPath(): string {
    return extensionPath;
}

export { extName, configKey, configDefaultValue, setExtensionPath, getExtensionPath };
