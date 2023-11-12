abstract class CapsLockDecoration {
    protected decorationType: any | null = null;
    abstract showDecoration(): void;
    abstract hideDecoration(): void;
    abstract removeDecoration(): void;
    abstract buildDecoration(): void;
    constructor() { this.buildDecoration(); }
}

export { CapsLockDecoration };