import { CapsLockDecoration } from './decoration';
import { CursorTextDecoration } from "./cursor_text_decoration";
import { GutterIconDecoration } from "./gutter_icon_decoration";
import { StatusBarDecoration } from "./status_bar_decoration";
import { LineBackgroundColorDecoration } from "./line_background_decoration";


class DisplayController {
    private createMethodMap: { [key: string]: new () => CapsLockDecoration } = {
        'method_cursor_text': CursorTextDecoration,
        'method_gutter_icon': GutterIconDecoration,
        'method_status_bar': StatusBarDecoration,
        'method_background_color': LineBackgroundColorDecoration
    };

    private createMethod(type: string): CapsLockDecoration {
        const constructor = this.createMethodMap[type.toLowerCase()];
        if (constructor) {
            return new constructor();
        } else {
            throw new Error(`Unsupported method type: ${type}`);
        }
    }

    private methodMap: Map<string, CapsLockDecoration> = new Map();
    private getDisplayType(display: CapsLockDecoration): string {
        return display.constructor.name;
    }

    addOrUpdateByDisplayMethodName(methodName: string): void {
        const display = this.createMethod(methodName);
        this.addOrUpdateByDisplay(display);
    }

    addOrUpdateByDisplay(display: CapsLockDecoration): void {
        const methodType = this.getDisplayType(display);
        this.methodMap.set(methodType, display);
        this.show();
    }

    updateAll(): void {
        this.methodMap.forEach(method => {
            method.buildDecoration();
        });
    }

    removeByDisplay(display: CapsLockDecoration): void {
        const methodType = this.getDisplayType(display);
        this.methodMap.get(methodType)?.removeDecoration();
        this.methodMap.delete(methodType);
    }

    removeAll(): void {
        this.methodMap.forEach(method => {
            method.hideDecoration();
            method.removeDecoration();
        });
        this.methodMap.clear();
    }

    show(): void {
        this.methodMap.forEach(method => {
            method.showDecoration();
        });
    }

    hide(): void {
        this.methodMap.forEach(method => {
            method.hideDecoration();
        });
    }
}

const displayController: DisplayController = new DisplayController();
export { displayController };