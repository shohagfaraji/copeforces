import { useEffect, useRef } from "react";

const STORAGE_KEY = "copeforces-tool-inputs-v1";
const CONTROL_SELECTOR = [
    "input:not([type='button']):not([type='submit']):not([type='reset']):not([type='file']):not([type='hidden'])",
    "textarea",
    "select",
].join(",");

function readStoredInputs() {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        return stored && typeof stored === "object" && !Array.isArray(stored)
            ? stored
            : {};
    } catch {
        return {};
    }
}

function isPersistableControl(element) {
    return (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
    );
}

function getToolCard(control, root) {
    const card = control.closest("[data-tool-id], .cf-tool-card[id]");
    return card && root.contains(card) ? card : null;
}

function getToolId(card) {
    return card.dataset.toolId || card.id;
}

function getControlKey(control, card) {
    if (control.dataset.persistKey) return control.dataset.persistKey;

    const controls = Array.from(card.querySelectorAll(CONTROL_SELECTOR)).filter(
        isPersistableControl,
    );
    const index = controls.indexOf(control);
    const type =
        control instanceof HTMLInputElement ? control.type : control.tagName;

    return `${type.toLowerCase()}:${index}`;
}

function serializeControl(control) {
    if (
        control instanceof HTMLInputElement &&
        (control.type === "checkbox" || control.type === "radio")
    ) {
        return { type: control.type, checked: control.checked };
    }

    return {
        type: control.tagName.toLowerCase(),
        value: control.value,
    };
}

function setNativeProperty(control, property, value) {
    const prototype = Object.getPrototypeOf(control);
    const setter = Object.getOwnPropertyDescriptor(prototype, property)?.set;
    setter?.call(control, value);
}

function restoreControl(control, saved) {
    if (!saved || typeof saved !== "object") return;

    if (
        control instanceof HTMLInputElement &&
        (control.type === "checkbox" || control.type === "radio")
    ) {
        if (
            typeof saved.checked !== "boolean" ||
            control.checked === saved.checked
        ) {
            return;
        }

        if (!control.disabled && (control.type === "checkbox" || saved.checked)) {
            control.click();
        } else {
            setNativeProperty(control, "checked", saved.checked);
            control.dispatchEvent(new Event("change", { bubbles: true }));
        }
        return;
    }

    if (typeof saved.value !== "string" || control.value === saved.value) return;
    if (
        control instanceof HTMLSelectElement &&
        !Array.from(control.options).some((option) => option.value === saved.value)
    ) {
        return;
    }

    setNativeProperty(control, "value", saved.value);
    const eventName =
        control instanceof HTMLSelectElement ? "change" : "input";
    control.dispatchEvent(new Event(eventName, { bubbles: true }));
}

export function usePersistentToolInputs(rootRef) {
    const storedInputsRef = useRef(null);
    const writeFrameRef = useRef(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return undefined;

        storedInputsRef.current = readStoredInputs();

        const writeStoredInputs = () => {
            writeFrameRef.current = null;
            try {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(storedInputsRef.current),
                );
            } catch {
                // Storage can be unavailable in private or restricted contexts.
            }
        };

        const scheduleWrite = () => {
            if (writeFrameRef.current !== null) return;
            writeFrameRef.current = requestAnimationFrame(writeStoredInputs);
        };

        const captureControl = (control) => {
            if (!isPersistableControl(control) || control.readOnly) return;

            const card = getToolCard(control, root);
            if (!card) return;

            const toolId = getToolId(card);
            if (!toolId) return;

            const controlKey = getControlKey(control, card);
            storedInputsRef.current[toolId] = {
                ...storedInputsRef.current[toolId],
                [controlKey]: serializeControl(control),
            };
        };

        const captureAll = () => {
            root.querySelectorAll(CONTROL_SELECTOR).forEach(captureControl);
            writeStoredInputs();
        };

        const restoreWithin = (node) => {
            const controls = [];
            if (node instanceof Element && node.matches(CONTROL_SELECTOR)) {
                controls.push(node);
            }
            if (node instanceof Element || node instanceof DocumentFragment) {
                controls.push(...node.querySelectorAll(CONTROL_SELECTOR));
            }

            controls.forEach((control) => {
                if (!isPersistableControl(control) || control.readOnly) return;
                const card = getToolCard(control, root);
                if (!card) return;

                const saved =
                    storedInputsRef.current[getToolId(card)]?.[
                        getControlKey(control, card)
                    ];
                restoreControl(control, saved);
            });
        };

        const handleInput = (event) => {
            captureControl(event.target);
            scheduleWrite();
        };

        const handleClick = () => {
            requestAnimationFrame(() => {
                root.querySelectorAll(CONTROL_SELECTOR).forEach(captureControl);
                scheduleWrite();
            });
        };

        const handlePageHide = () => captureAll();
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") captureAll();
        };

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                restoreWithin(mutation.target);
                mutation.addedNodes.forEach(restoreWithin);
            });
        });

        root.addEventListener("input", handleInput, true);
        root.addEventListener("change", handleInput, true);
        root.addEventListener("click", handleClick);
        window.addEventListener("pagehide", handlePageHide);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        observer.observe(root, { childList: true, subtree: true });

        restoreWithin(root);

        return () => {
            observer.disconnect();
            root.removeEventListener("input", handleInput, true);
            root.removeEventListener("change", handleInput, true);
            root.removeEventListener("click", handleClick);
            window.removeEventListener("pagehide", handlePageHide);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
            if (writeFrameRef.current !== null) {
                cancelAnimationFrame(writeFrameRef.current);
                writeFrameRef.current = null;
            }
        };
    }, [rootRef]);
}
