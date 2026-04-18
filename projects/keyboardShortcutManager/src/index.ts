import { KeyboardShortcutManager } from "./keyboardShortcutManager";

console.log("Hello from KeyboardShortcutManager!");

function simulateKey(
    manager: KeyboardShortcutManager,
    key: string,
    options: Partial<KeyboardEvent> = {}
) {
    const event = {
        key,
        ctrlKey: options.ctrlKey ?? false,
        shiftKey: options.shiftKey ?? false,
        altKey: options.altKey ?? false,
        metaKey: options.metaKey ?? false,
    } as KeyboardEvent;

    manager.handleKeyDown(event);
}

function runTests() {
    console.log("Running KeyboardShortcutManager Tests...\n");

    const manager = new KeyboardShortcutManager();

    // 1️⃣ Register Ctrl+S
    let saveCalled = false;
    manager.register("Ctrl+S", () => {
        saveCalled = true;
        console.log("Save triggered");
    });

    simulateKey(manager, "s", { ctrlKey: true });

    console.log("Test 1 - Ctrl+S works:", saveCalled ? "PASS" : "FAIL");


    // 2️⃣ Register Ctrl+Shift+P
    let commandPalette = false;
    manager.register("Ctrl+Shift+P", () => {
        commandPalette = true;
        console.log("Command palette opened");
    });

    simulateKey(manager, "p", { ctrlKey: true, shiftKey: true });

    console.log("Test 2 - Ctrl+Shift+P works:", commandPalette ? "PASS" : "FAIL");


    // 3️⃣ Unregister shortcut
    manager.unregister("Ctrl+S");
    saveCalled = false;

    simulateKey(manager, "s", { ctrlKey: true });

    console.log("Test 3 - Unregister works:", saveCalled ? "FAIL" : "PASS");


    // 4️⃣ Disable manager
    manager.disable();

    let undoCalled = false;
    manager.register("Ctrl+Z", () => {
        undoCalled = true;
    });

    simulateKey(manager, "z", { ctrlKey: true });

    console.log("Test 4 - Disable manager:", undoCalled ? "FAIL" : "PASS");


    // 5️⃣ Enable again
    manager.enable();

    simulateKey(manager, "z", { ctrlKey: true });

    console.log("Test 5 - Enable manager:", undoCalled ? "PASS" : "FAIL");


    console.log("\nAll tests finished.");
}

runTests();