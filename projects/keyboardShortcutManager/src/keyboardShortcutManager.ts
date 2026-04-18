export class KeyboardShortcutManager {
    private shortcutsMap = new Map<string, () => void>();
    private enableKeyboardShortcutManager: boolean;
    constructor() {
        this.enableKeyboardShortcutManager = true;
    }
    register(key: string, callback: () => void) {
        this.shortcutsMap.set(key.toLowerCase(), callback);
    }
    unregister(key: string) {
        this.shortcutsMap.delete(key.toLowerCase());
    }
    enable() {
        this.enableKeyboardShortcutManager = true;
    }
    disable() {
        this.enableKeyboardShortcutManager = false;
    }
    handleKeyDown(event: KeyboardEvent) {
        if (!this.enableKeyboardShortcutManager) return;
        const keys: string[] = [];

        if (event.ctrlKey) keys.push("ctrl");
        if (event.shiftKey) keys.push("shift");
        if (event.altKey) keys.push("alt");
        if (event.metaKey) keys.push("meta");
        keys.push(event.key.toLowerCase());
        const key = keys.sort().join('+');
        const callback = this.shortcutsMap.get(key);
        if (!callback) return;
        callback();
    }
}