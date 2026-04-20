const extName = "caps-lock-state";
const configKey = {
    delay_time: "delay_time",
    display_method: "display_method",
    background_color: "background_color",
    "editorCursor.foreground": "editorCursor.foreground",
};

const configDefaultValue = {
    delay_time: 20,
    display_method: "method_cursor_color",
    background_color: "rgba(255,0,0,0.7)",
    "editorCursor.foreground": "#00ff00",
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
