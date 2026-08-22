import { useEffect, useMemo, useRef, useState } from "react";
import {
    FaArrowDown,
    FaArrowUp,
    FaExternalLinkAlt,
    FaHistory,
    FaSearch,
    FaThumbtack,
    FaTrash,
} from "react-icons/fa";
import { sections } from "../../data/sections";

const PINNED_STORAGE_KEY = "copeforces:pinned-tools:v1";
const RECENT_STORAGE_KEY = "copeforces:recent-tools:v1";
const MAX_RECENT_TOOLS = 8;
const TOOL_CARD_SELECTOR = ".cf-tool-card[id], [data-tool-id]";
const SECTION_BY_ID = new Map(sections.map((section) => [section.id, section]));

function readStoredTools(key) {
    try {
        const parsed = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(parsed)
            ? parsed.filter(
                  (item) =>
                      item &&
                      typeof item.id === "string" &&
                      typeof item.label === "string",
              )
            : [];
    } catch {
        return [];
    }
}

function writeStoredTools(key, tools) {
    try {
        localStorage.setItem(key, JSON.stringify(tools));
    } catch {
        // The workspace remains usable when storage is unavailable.
    }
}

function metadataFromCard(card) {
    const sectionElement = card.closest(".cf-section-shell");
    const section = SECTION_BY_ID.get(sectionElement?.id);
    const heading = card.querySelector("h3");
    const toolId = card.dataset.toolId || card.id;
    const toolLabel = card.dataset.toolLabel || heading?.textContent?.trim();

    if (!toolId || !section || section.id === "my-tools") return null;

    return {
        id: toolId,
        label: toolLabel || toolId,
        sectionId: section.id,
        sectionTitle: section.title,
        color: section.color,
    };
}

function ToolTile({
    tool,
    pinned = false,
    canMoveUp = false,
    canMoveDown = false,
    onPin,
    onRemove,
    onMoveUp,
    onMoveDown,
}) {
    return (
        <article
            className={`my-tool-tile ${pinned ? "is-pinned" : ""}`}
            style={{ "--my-tool-color": tool.color || "var(--accent-blue)" }}
        >
            <div className="my-tool-tile-main">
                <span className="my-tool-color-bar" aria-hidden="true" />
                <div className="min-w-0">
                    <h3 className="font-mono-cf font-bold truncate">
                        {tool.label}
                    </h3>
                    <p className="truncate" style={{ color: "var(--muted)" }}>
                        {tool.sectionTitle}
                    </p>
                </div>
            </div>

            <div className="my-tool-actions">
                <a
                    href={`#${tool.id}`}
                    className="my-tool-open"
                    aria-label={`Open ${tool.label}`}
                >
                    <FaExternalLinkAlt size={10} />
                    Open
                </a>

                {pinned ? (
                    <>
                        <button
                            type="button"
                            onClick={onMoveUp}
                            disabled={!canMoveUp}
                            aria-label={`Move ${tool.label} earlier`}
                            title="Move earlier"
                        >
                            <FaArrowUp size={10} />
                        </button>
                        <button
                            type="button"
                            onClick={onMoveDown}
                            disabled={!canMoveDown}
                            aria-label={`Move ${tool.label} later`}
                            title="Move later"
                        >
                            <FaArrowDown size={10} />
                        </button>
                        <button
                            type="button"
                            onClick={onRemove}
                            aria-label={`Unpin ${tool.label}`}
                            title="Unpin"
                        >
                            <FaTrash size={10} />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={onPin}
                            aria-label={`Pin ${tool.label}`}
                            title="Pin tool"
                        >
                            <FaThumbtack size={10} />
                        </button>
                        <button
                            type="button"
                            onClick={onRemove}
                            aria-label={`Remove ${tool.label} from recent tools`}
                            title="Remove from recent"
                        >
                            <FaTrash size={10} />
                        </button>
                    </>
                )}
            </div>
        </article>
    );
}

function EmptyState({ children }) {
    return (
        <div className="my-tools-empty" style={{ color: "var(--muted)" }}>
            {children}
        </div>
    );
}

function MyToolsContent() {
    const [catalog, setCatalog] = useState([]);
    const [pinned, setPinned] = useState(() =>
        readStoredTools(PINNED_STORAGE_KEY),
    );
    const [recent, setRecent] = useState(() =>
        readStoredTools(RECENT_STORAGE_KEY),
    );
    const recentRef = useRef(recent);
    const [toolQuery, setToolQuery] = useState("");
    const [pickerOpen, setPickerOpen] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            const cards = Array.from(
                document.querySelectorAll(TOOL_CARD_SELECTOR),
            );
            setCatalog(cards.map(metadataFromCard).filter(Boolean));
        });

        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        function rememberToolFrom(target) {
            const card = target?.closest?.(TOOL_CARD_SELECTOR);
            if (!card || card.closest("#my-tools")) return;

            const toolId = card.dataset.toolId || card.id;
            const current = recentRef.current;
            if (toolId && current[0]?.id === toolId) return;

            const tool = metadataFromCard(card);
            if (!tool) return;

            const next = [
                tool,
                ...current.filter((item) => item.id !== tool.id),
            ].slice(0, MAX_RECENT_TOOLS);

            recentRef.current = next;
            setRecent(next);
            writeStoredTools(RECENT_STORAGE_KEY, next);
        }

        function eventTargetElement(event) {
            return event.target instanceof Element
                ? event.target
                : event.target?.parentElement;
        }

        function rememberValueChange(event) {
            if (!event.isTrusted) return;
            rememberToolFrom(eventTargetElement(event));
        }

        function rememberAction(event) {
            if (!event.isTrusted) return;
            const button = eventTargetElement(event)?.closest?.("button");
            if (!button || button.disabled) return;
            rememberToolFrom(button);
        }

        function rememberSubmission(event) {
            if (!event.isTrusted) return;
            rememberToolFrom(eventTargetElement(event));
        }

        // Scrolling, focusing, and card taps emit none of these semantic events.
        document.addEventListener("input", rememberValueChange, true);
        document.addEventListener("click", rememberAction, true);
        document.addEventListener("submit", rememberSubmission, true);

        return () => {
            document.removeEventListener("input", rememberValueChange, true);
            document.removeEventListener("click", rememberAction, true);
            document.removeEventListener("submit", rememberSubmission, true);
        };
    }, []);

    const pinnedIds = useMemo(
        () => new Set(pinned.map((tool) => tool.id)),
        [pinned],
    );
    const availableTools = catalog.filter((tool) => !pinnedIds.has(tool.id));
    const visibleRecent = recent.filter((tool) => !pinnedIds.has(tool.id));
    const filteredAvailableTools = useMemo(() => {
        const query = toolQuery.trim().toLowerCase();
        const matches = query
            ? availableTools.filter((tool) =>
                  `${tool.label} ${tool.sectionTitle}`
                      .toLowerCase()
                      .includes(query),
              )
            : availableTools;
        return matches;
    }, [availableTools, toolQuery]);

    function updatePinned(next) {
        setPinned(next);
        writeStoredTools(PINNED_STORAGE_KEY, next);
    }

    function pinTool(tool) {
        if (!tool || pinnedIds.has(tool.id)) return;
        updatePinned([...pinned, tool]);
        setToolQuery("");
        setPickerOpen(false);
    }

    function removePinned(toolId) {
        updatePinned(pinned.filter((tool) => tool.id !== toolId));
    }

    function movePinned(index, direction) {
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= pinned.length) return;

        const next = [...pinned];
        [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
        updatePinned(next);
    }

    function clearRecent() {
        recentRef.current = [];
        setRecent([]);
        writeStoredTools(RECENT_STORAGE_KEY, []);
    }

    function removeRecent(toolId) {
        const next = recent.filter((tool) => tool.id !== toolId);
        recentRef.current = next;
        setRecent(next);
        writeStoredTools(RECENT_STORAGE_KEY, next);
    }

    return (
        <div className="my-tools-content">
            <div
                className="my-tools-picker"
                onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                        setPickerOpen(false);
                    }
                }}
            >
                <div
                    className="my-tools-picker-heading"
                    onPointerDown={() => setPickerOpen(false)}
                >
                    Add a tool to your workspace
                </div>
                <div className="my-tools-search-shell">
                    <FaSearch size={12} aria-hidden="true" />
                    <input
                        id="my-tools-search"
                        type="search"
                        value={toolQuery}
                        placeholder="Search by tool or section…"
                        autoComplete="off"
                        onFocus={() => setPickerOpen(true)}
                        onChange={(event) => {
                            setToolQuery(event.target.value);
                            setPickerOpen(true);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Escape") {
                                setPickerOpen(false);
                                event.currentTarget.blur();
                            }
                        }}
                    />
                </div>

                {pickerOpen && (
                    <div className="my-tools-search-results">
                        {filteredAvailableTools.length > 0 ? (
                            filteredAvailableTools.map((tool) => (
                                <button
                                    key={tool.id}
                                    type="button"
                                    className="my-tools-search-result"
                                    onClick={() => pinTool(tool)}
                                    aria-label={`Pin ${tool.label}`}
                                >
                                    <span
                                        className="my-tool-result-dot"
                                        style={{ backgroundColor: tool.color }}
                                        aria-hidden="true"
                                    />
                                    <span className="min-w-0">
                                        <strong>{tool.label}</strong>
                                        <small>{tool.sectionTitle}</small>
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="my-tools-search-none">
                                No unpinned tool matches “{toolQuery}”.
                            </div>
                        )}
                    </div>
                )}
            </div>

            <section className="my-tools-group" aria-labelledby="pinned-tools-title">
                <div className="my-tools-group-heading">
                    <div>
                        <h3 id="pinned-tools-title">
                            <FaThumbtack size={12} />
                            Pinned tools
                        </h3>
                    </div>
                    <span className="my-tools-count">{pinned.length}</span>
                </div>

                {pinned.length > 0 ? (
                    <div className="my-tools-grid">
                        {pinned.map((tool, index) => (
                            <ToolTile
                                key={tool.id}
                                tool={tool}
                                pinned
                                canMoveUp={index > 0}
                                canMoveDown={index < pinned.length - 1}
                                onMoveUp={() => movePinned(index, -1)}
                                onMoveDown={() => movePinned(index, 1)}
                                onRemove={() => removePinned(tool.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState>Pin tools for quick access.</EmptyState>
                )}
            </section>

            <section className="my-tools-group is-recent" aria-labelledby="recent-tools-title">
                <div className="my-tools-group-heading">
                    <div>
                        <h3 id="recent-tools-title">
                            <FaHistory size={12} />
                            Recently used
                        </h3>
                    </div>
                    {recent.length > 0 && (
                        <button
                            type="button"
                            className="my-tools-clear"
                            onClick={clearRecent}
                        >
                            Clear
                        </button>
                    )}
                </div>

                {visibleRecent.length > 0 ? (
                    <div className="my-tools-grid is-compact">
                        {visibleRecent.map((tool) => (
                            <ToolTile
                                key={tool.id}
                                tool={tool}
                                onPin={() => pinTool(tool)}
                                onRemove={() => removeRecent(tool.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState>Recently used tools appear here.</EmptyState>
                )}
            </section>
        </div>
    );
}

export default MyToolsContent;
