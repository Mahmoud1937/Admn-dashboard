import { useEffect, useRef, useState, useCallback } from "react";
import {
  FileText, Save, Pencil, X, Globe, Bold, Italic, Underline, Strikethrough,
  Baseline, Highlighter, ListOrdered, List, Indent, Outdent, AlignLeft,
  AlignCenter, AlignRight, Quote, Code, Link as LinkIcon, RemoveFormatting,
  ChevronDown,
} from "lucide-react";

const HEADINGS = [
  { label: "Heading 1", tag: "H1", className: "text-2xl font-bold" },
  { label: "Heading 2", tag: "H2", className: "text-xl font-bold" },
  { label: "Heading 3", tag: "H3", className: "text-lg font-semibold" },
  { label: "Normal", tag: "P", className: "text-sm" },
];

const COLORS = ["#111827", "#DC2626", "#EA580C", "#CA8A04", "#16A34A", "#0891B2", "#2563EB", "#7C3AED"];
const COMMANDS_TO_TRACK = ["bold", "italic", "underline", "strikeThrough"];
const BLOCK_TAGS = ["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "BLOCKQUOTE", "PRE"];
const SPLITTABLE_BLOCK_TAGS = [...BLOCK_TAGS.filter((t) => t !== "UL" && t !== "OL"), "LI"];

const richTextClasses = (isRTL) =>
  `min-h-[380px] max-h-[480px] overflow-y-auto px-4 py-3 text-sm leading-relaxed ${
    isRTL
      ? "text-right [&_blockquote]:border-r-4 [&_blockquote]:pr-3 [&_ul]:pr-5 [&_ol]:pr-5"
      : "text-left [&_blockquote]:border-l-4 [&_blockquote]:pl-3 [&_ul]:pl-5 [&_ol]:pl-5"
  } [&_blockquote]:border-gray-300 [&_blockquote]:text-gray-500 [&_pre]:bg-gray-100 [&_pre]:rounded [&_pre]:p-2 [&_pre]:font-mono [&_pre]:text-xs [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ol]:list-decimal [&_li]:my-0.5`;

function getPlainTextLength(html) {
  if (!html) return 0;
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length;
}

// Groups loose top-level text nodes (typed before any Enter press) into a <p>,
// so block-level logic (headings/lists/quote) always has an element to grab.
// Only call right after loading content — it does not preserve a live caret.
function wrapLooseTopLevelNodes(root) {
  const children = Array.from(root.childNodes);
  let group = [];
  const flush = (before) => {
    if (!group.length) return;
    const p = document.createElement("p");
    group.forEach((n) => p.appendChild(n));
    root.insertBefore(p, before);
    group = [];
  };
  children.forEach((node) => {
    const isBlock = node.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.includes(node.tagName);
    isBlock ? flush(node) : group.push(node);
  });
  flush(null);
}

// Nearest block-level ancestor of `node` (or the editor root if none found).
function findBlockAncestor(node, root, tags = SPLITTABLE_BLOCK_TAGS) {
  let block = node;
  while (block && block !== root && !tags.includes(block.tagName)) block = block.parentElement;
  return block;
}

function ToolbarButton({ icon: Icon, label, onMouseDown, active, activeColor }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={onMouseDown}
      className={`relative w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
        active ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-4 h-4" />
      {activeColor && (
        <span
          className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full border border-gray-200"
          style={{ backgroundColor: activeColor }}
        />
      )}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />;
}

function ColorPopover({ label, onPick, onClose, currentColor, onClear }) {
  const popRef = useRef(null);
  useEffect(() => {
    const onOutside = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [onClose]);

  return (
    <div ref={popRef} className="absolute z-20 top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-4 gap-1 w-36">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPick(color);
            onClose();
          }}
          className={`w-6 h-6 rounded-full border-2 transition-all ${currentColor === color ? "border-blue-500 scale-110" : "border-gray-200"}`}
          style={{ backgroundColor: color }}
          aria-label={`${label} ${color}`}
        />
      ))}
      {currentColor && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClear();
            onClose();
          }}
          className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-red-400 transition-colors"
          style={{ backgroundColor: "#fff" }}
          aria-label={`Remove ${label}`}
        >
          <span className="text-red-500 text-xs font-bold leading-none">×</span>
        </button>
      )}
    </div>
  );
}

function RichTextArea({ lang, value, onChange, placeholder, error, resetKey, minLength = 0 }) {
  const ref = useRef(null);
  const [headingOpen, setHeadingOpen] = useState(false);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [blockState, setBlockState] = useState({ heading: "P", list: null, quote: false, code: false });
  const [activeCommands, setActiveCommands] = useState({});
  const [stickyColor, setStickyColor] = useState(null);    // text color
  const [stickyHighlight, setStickyHighlight] = useState(null); // highlight
  const savedSelection = useRef(null);

const saveSelection = useCallback(() => {
  const sel = window.getSelection();

  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

  const range = sel.getRangeAt(0);

  if (
    !ref.current ||
    !ref.current.contains(range.commonAncestorContainer)
  ) {
    return;
  }

  savedSelection.current = range.cloneRange();
}, []);

const restoreSelection = useCallback(() => {
  if (!savedSelection.current) return false;

  const sel = window.getSelection();

  try {
    sel.removeAllRanges();
    sel.addRange(savedSelection.current);
    return true;
  } catch (error) {
    console.error("Could not restore selection:", error);
    return false;
  }
}, []);

  const isRTL = lang === "ar";
  const direction = isRTL ? "rtl" : "ltr";

  // execCommand can create new blocks without inheriting direction — reapply after every change.
  const applyDirectionToBlocks = useCallback(() => {
    if (!ref.current) return;
    ref.current.querySelectorAll("p, div, h1, h2, h3, h4, h5, h6, li, blockquote, pre").forEach((block) => {
      block.dir = direction;
      block.style.direction = direction;
      block.style.unicodeBidi = "isolate";
    });
  }, [direction]);

  // Every new paragraph must be a real <p>, so heading/list/quote toggles only ever
  // grab the current line (Firefox otherwise joins lines with <br> into one block).
  useEffect(() => { document.execCommand("defaultParagraphSeparator", false, "p"); }, []);

  // Loads content on real external reloads only (resetKey), never on `value` — otherwise
  // every keystroke would reset innerHTML and jump the caret back to the start.
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = value && value.trim() ? value : "<p><br></p>";
    wrapLooseTopLevelNodes(ref.current); // safe here only: no live caret yet
    applyDirectionToBlocks();
    setCharCount(ref.current.textContent?.length || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Strips only attributes *we* add for direction bookkeeping — never the user's actual
  // formatting — so saved HTML matches the editor exactly and reloads correctly.
  const cleanHtml = useCallback((html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    tmp.querySelectorAll("[class]").forEach((el) => el.removeAttribute("class"));
    tmp.querySelectorAll("[dir]").forEach((el) => el.removeAttribute("dir"));
    tmp.querySelectorAll("[data-spread]").forEach((el) => el.removeAttribute("data-spread"));
    tmp.querySelectorAll("[style]").forEach((el) => {
      el.style.removeProperty("direction");
      el.style.removeProperty("unicode-bidi");
      if (el.getAttribute("style") === "") el.removeAttribute("style");
    });
    tmp.querySelectorAll("p, h1, h2, h3, h4, h5, h6").forEach((el) => {
      if (!el.textContent.trim()) {
        const nonBr = [...el.childNodes].filter((n) => !(n.nodeType === Node.ELEMENT_NODE && n.tagName === "BR"));
        if (!nonBr.length) el.remove();
      }
    });
    tmp.querySelectorAll("p").forEach((el) => {
      const child = el.firstElementChild;
      if (child && el.children.length === 1 && !el.textContent.trim()) el.replaceWith(child);
    });
    return tmp.innerHTML;
  }, []);

  const emit = useCallback(() => {
    if (!ref.current) return;
    applyDirectionToBlocks();
    onChange(cleanHtml(ref.current.innerHTML));
    setCharCount(ref.current.textContent?.length || 0);
  }, [onChange, applyDirectionToBlocks, cleanHtml]);

  const syncBlockState = useCallback(() => {
    if (!ref.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    let node = sel.getRangeAt(0).startContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

    let heading = "P", list = null, quote = false, code = false;
    for (let cursor = node; cursor && cursor !== ref.current; cursor = cursor.parentElement) {
      const tag = cursor.tagName;
      if (tag && heading === "P" && HEADINGS.some((h) => h.tag === tag)) heading = tag;
      if (tag === "UL" || tag === "OL") list = tag;
      if (tag === "BLOCKQUOTE") quote = true;
      if (tag === "PRE") code = true;
    }
    setBlockState({ heading, list, quote, code });
  }, []);

  const syncActiveCommands = useCallback(() => {
    const next = {};
    for (const cmd of COMMANDS_TO_TRACK) next[cmd] = document.queryCommandState(cmd);
    setActiveCommands(next);
  }, []);

  // Common tail for every block-mutating action: keep direction, saved value and toolbar state in sync.
  const afterMutation = useCallback(() => {
    applyDirectionToBlocks();
    emit();
    syncBlockState();
    syncActiveCommands();
  }, [applyDirectionToBlocks, emit, syncBlockState, syncActiveCommands]);

  const toggleList = useCallback((tag) => {
    if (!ref.current) return;
    ref.current.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    let node = sel.anchorNode;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

    const listAncestor = findBlockAncestor(node, ref.current, ["UL", "OL"]);
    const inList = listAncestor !== ref.current;

    if (inList && listAncestor.tagName === tag) {
      // Already inside the same list type → unwrap.
      const fragment = document.createDocumentFragment();
      while (listAncestor.firstChild) fragment.appendChild(listAncestor.firstChild);
      listAncestor.parentNode.replaceChild(fragment, listAncestor);
    } else if (inList) {
      // Inside a different list type → change tag.
      const replacement = document.createElement(tag);
      replacement.innerHTML = listAncestor.innerHTML;
      listAncestor.parentNode.replaceChild(replacement, listAncestor);
    } else {
      // No list → wrap current block (or, if there is none, the editor root's own
      // loose children) in a new list, without ripping the editable root out of the DOM.
      const block = findBlockAncestor(node, ref.current);
      const li = document.createElement("li");
      const list = document.createElement(tag);
      list.appendChild(li);

      if (block === ref.current) {
        while (ref.current.firstChild) li.appendChild(ref.current.firstChild);
        ref.current.appendChild(list);
      } else {
        while (block.firstChild) li.appendChild(block.firstChild);
        block.parentNode.replaceChild(list, block);
      }
    }
    afterMutation();
  }, [afterMutation]);

  const toggleBlock = useCallback((tag) => {
    if (!ref.current) return;
    ref.current.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    let node = sel.anchorNode;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

    const block = findBlockAncestor(node, ref.current, [tag]);

    if (block !== ref.current) {
      const fragment = document.createDocumentFragment();
      while (block.firstChild) fragment.appendChild(block.firstChild);
      block.parentNode.replaceChild(fragment, block);
    } else {
      document.execCommand("formatBlock", false, tag);
    }
    afterMutation();
  }, [afterMutation]);

  const exec = useCallback((command, arg = null) => {
    if (!ref.current) return;
    ref.current.focus();
    document.execCommand(command, false, arg);
    afterMutation();
  }, [afterMutation]);

  // Text color / highlight: routed through execCommand (like Bold/Italic) rather than
  // manual range surgery, so it can't silently fail on multi-block selections.
const applyColor = useCallback(
  (type, color) => {
    if (!ref.current || !savedSelection.current) return;

    const range = savedSelection.current.cloneRange();
    const root = ref.current;

    if (!root.contains(range.commonAncestorContainer)) {
      savedSelection.current = null;
      return;
    }

    if (range.collapsed) {
      savedSelection.current = null;
      return;
    }

    // Build the formatting element ourselves instead of relying on
    // execCommand(foreColor/hiliteColor), which is inconsistent in Firefox.
    const span = document.createElement("span");

    if (type === "color") {
      span.style.color = color;
    } else {
      span.style.backgroundColor = color;
    }

    try {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);

      // Merge adjacent spans carrying the same formatting.
      const parent = span.parentNode;
      if (parent) {
        const previous = span.previousSibling;
        const next = span.nextSibling;

        const sameStyle = (a, b) =>
          a &&
          b &&
          a.nodeType === Node.ELEMENT_NODE &&
          b.nodeType === Node.ELEMENT_NODE &&
          a.tagName === "SPAN" &&
          b.tagName === "SPAN" &&
          a.style.color === b.style.color &&
          a.style.backgroundColor === b.style.backgroundColor;

        if (sameStyle(previous, span)) {
          while (span.firstChild) previous.appendChild(span.firstChild);
          span.remove();
        }

        const target = previous && sameStyle(previous, span) ? previous : span;

        if (sameStyle(target, next)) {
          while (next.firstChild) target.appendChild(next.firstChild);
          next.remove();
        }
      }

      // Restore the formatted selection so the user can immediately
      // see what was changed and apply another color if desired.
      const selection = window.getSelection();
      const newRange = document.createRange();
      newRange.selectNodeContents(span.isConnected ? span : root);

      selection.removeAllRanges();
      selection.addRange(newRange);
      savedSelection.current = newRange.cloneRange();

      afterMutation();
    } catch (error) {
      console.error("Failed to apply color:", error);
    }
  },
  [afterMutation]
);
  // Places the caret `offset` chars into `el`'s first text node (or at its end).
  const placeCaretIn = (sel, el, offset) => {
    const range = document.createRange();
    const textNode = el.firstChild || el;
    if (textNode.nodeType === Node.TEXT_NODE) {
      range.setStart(textNode, Math.min(offset, textNode.textContent?.length || 0));
      range.collapse(true);
    } else {
      range.selectNodeContents(el);
      range.collapse(false);
    }
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const applyHeading = (tag) => {
    if (!ref.current) return;
    ref.current.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) { setHeadingOpen(false); return; }

    const range = sel.getRangeAt(0);
    let node = sel.anchorNode;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    const block = findBlockAncestor(node, ref.current);

    if (block === ref.current) {
      // No block to swap (text typed before any Enter). Fall back to the browser's
      // own formatBlock, which wraps whatever line the caret is on.
      document.execCommand("formatBlock", false, tag);
      afterMutation();
      setHeadingOpen(false);
      return;
    }

    const preLen = range.startOffset;
    const el = document.createElement(block.tagName === tag ? "P" : tag);
    while (block.firstChild) el.appendChild(block.firstChild);
    block.parentNode.replaceChild(el, block);
    placeCaretIn(sel, el, preLen);

    afterMutation();
    setHeadingOpen(false);
  };

  const insertLink = () => {
    const url = window.prompt("Enter URL");
    if (url) exec("createLink", url);
  };

  const handleInput = () => { applyDirectionToBlocks(); emit(); };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter" || !ref.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    let node = sel.anchorNode;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    const block = findBlockAncestor(node, ref.current);
    if (block === ref.current || !["H1", "H2", "H3", "H4", "H5", "H6"].includes(block.tagName)) return;

    // Splits the heading at the caret into [heading][new <p>], so Enter never leaves
    // the rest of the note stuck inside a heading.
    e.preventDefault();
    const p = document.createElement("P");
    const range = sel.getRangeAt(0);
    range.deleteContents();

    const afterRange = document.createRange();
    afterRange.setStart(range.endContainer, range.endOffset);
    afterRange.setEnd(block, block.childNodes.length);
    p.appendChild(afterRange.extractContents());
    block.parentNode.insertBefore(p, block.nextSibling);

    if (!block.textContent.trim() && !block.childNodes.length) {
      block.parentNode.replaceChild(document.createElement("P"), block);
    }
    placeCaretIn(sel, p, 0);
    emit();
    syncBlockState();
    syncActiveCommands();
  };

  // Wraps newly typed / pasted text in a colored span when a sticky color is active,
  // so every subsequent keystroke inherits the chosen color without needing a selection.
  const handleBeforeInput = useCallback(
    (e) => {
      const colorType = stickyColor ? "color" : stickyHighlight ? "backgroundColor" : null;
      if (!colorType || !ref.current) return;

      const inputType = e.inputType;
      const color = colorType === "color" ? stickyColor : stickyHighlight;
      const styleProp = colorType === "color" ? "color" : "backgroundColor";

      let span;

      if (inputType === "insertText" && e.data) {
        e.preventDefault();
        span = document.createElement("span");
        span.style[styleProp] = color;
        span.textContent = e.data;
      } else if (inputType === "insertFromPaste") {
        e.preventDefault();
        const html = e.clipboardData?.getData("text/html") || "";
        const text = e.clipboardData?.getData("text/plain") || e.data || "";
        span = document.createElement("span");
        span.style[styleProp] = color;
        if (html) {
          // Strip existing styles from pasted HTML and re-wrap with our color.
          const tmp = document.createElement("div");
          tmp.innerHTML = html;
          tmp.querySelectorAll("[style]").forEach((el) => {
            el.removeAttribute("style");
          });
          span.innerHTML = tmp.innerHTML;
        } else {
          span.textContent = text;
        }
      } else {
        return; // let browser handle insertParagraph, deleteContentBackward, etc.
      }

      if (!span) return;

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(span);

      // Place caret after the span so the next keystroke continues inside it.
      range.setStartAfter(span);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);

      afterMutation();
    },
    [stickyColor, stickyHighlight, afterMutation]
  );

  const activeHeadingLabel = HEADINGS.find((h) => h.tag === blockState.heading)?.label || "Normal";

  const inlineButtons = [
    { icon: Bold, label: "Bold", cmd: "bold" },
    { icon: Italic, label: "Italic", cmd: "italic" },
    { icon: Underline, label: "Underline", cmd: "underline" },
    { icon: Strikethrough, label: "Strikethrough", cmd: "strikeThrough" },
  ];
  const alignButtons = [
    { icon: AlignLeft, label: "Align left", cmd: "justifyLeft" },
    { icon: AlignCenter, label: "Align center", cmd: "justifyCenter" },
    { icon: AlignRight, label: "Align right", cmd: "justifyRight" },
  ];
  const colorTools = [
    { icon: Baseline, label: "Text color", key: "color", open: textColorOpen, setOpen: setTextColorOpen, sticky: stickyColor, setSticky: setStickyColor },
    { icon: Highlighter, label: "Highlight", key: "backgroundColor", open: highlightOpen, setOpen: setHighlightOpen, sticky: stickyHighlight, setSticky: setStickyHighlight },
  ];

  return (
    <div className={`border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/40 ${
      error ? "border-red-400 focus-within:border-red-500" : "border-gray-200 focus-within:border-blue-500"
    }`}>
      <div className="flex items-center flex-wrap gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5 relative">
        {/* Heading */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setHeadingOpen((v) => !v)}
            className={`flex items-center gap-1 h-8 px-2 text-sm rounded-md transition-colors ${
              blockState.heading !== "P" ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {activeHeadingLabel}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {headingOpen && (
            <div className="absolute z-20 top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40">
              {HEADINGS.map((h) => (
                <button
                  key={h.tag}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyHeading(h.tag)}
                  className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 ${h.className} ${
                    h.tag === blockState.heading ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {inlineButtons.map(({ icon, label, cmd }) => (
          <ToolbarButton key={cmd} icon={icon} label={label} active={activeCommands[cmd]}
            onMouseDown={(e) => { e.preventDefault(); exec(cmd); }} />
        ))}

        {colorTools.map(({ icon, label, key, open, setOpen, sticky, setSticky }) => (
          <div className="relative" key={key}>
            <ToolbarButton
              icon={icon}
              label={label}
              active={!!sticky}
              activeColor={sticky || undefined}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (sticky) {
                  setSticky(null);
                  setOpen(false);
                } else {
                  saveSelection();
                  setOpen((v) => !v);
                }
              }}
            />
            {open && (
              <ColorPopover
                label={label}
                currentColor={sticky}
                onPick={(color) => {
                  setSticky(color);
                  if (savedSelection.current && !savedSelection.current.collapsed) {
                    applyColor(key, color);
                  }
                }}
                onClear={() => setSticky(null)}
                onClose={() => setOpen(false)}
              />
            )}
          </div>
        ))}

        <Divider />

        <ToolbarButton icon={ListOrdered} label="Numbered list" active={blockState.list === "OL"}
          onMouseDown={(e) => { e.preventDefault(); toggleList("OL"); }} />
        <ToolbarButton icon={List} label="Bulleted list" active={blockState.list === "UL"}
          onMouseDown={(e) => { e.preventDefault(); toggleList("UL"); }} />
        <ToolbarButton icon={Outdent} label="Decrease indent" onMouseDown={(e) => { e.preventDefault(); exec("outdent"); }} />
        <ToolbarButton icon={Indent} label="Increase indent" onMouseDown={(e) => { e.preventDefault(); exec("indent"); }} />

        <Divider />

        {alignButtons.map(({ icon, label, cmd }) => (
          <ToolbarButton key={cmd} icon={icon} label={label} onMouseDown={(e) => { e.preventDefault(); exec(cmd); }} />
        ))}

        <Divider />

        <ToolbarButton icon={Quote} label="Quote" active={blockState.quote}
          onMouseDown={(e) => { e.preventDefault(); toggleBlock("BLOCKQUOTE"); }} />
        <ToolbarButton icon={Code} label="Code" active={blockState.code}
          onMouseDown={(e) => { e.preventDefault(); toggleBlock("PRE"); }} />
        <ToolbarButton icon={LinkIcon} label="Insert link" onMouseDown={(e) => { e.preventDefault(); insertLink(); }} />
        <ToolbarButton icon={RemoveFormatting} label="Clear formatting" onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); }} />
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        dir={direction}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBeforeInput={handleBeforeInput}
        onBlur={emit}
        onKeyUp={() => { syncBlockState(); syncActiveCommands(); }}
        onMouseUp={() => { syncBlockState(); syncActiveCommands(); }}
        data-placeholder={placeholder}
        style={{ direction, unicodeBidi: "isolate" }}
        className={`${richTextClasses(isRTL)} text-gray-800 focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400`}
      />

      <div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-100 text-xs">
        <span className={error ? "text-red-500 font-medium" : "text-gray-400"}>{error || ""}</span>
        <span className={minLength > 0 && charCount < minLength ? "text-red-500 font-medium" : "text-gray-400"}>
          {minLength > 0 ? `${charCount} characters (minimum ${minLength})` : `${charCount} characters`}
        </span>
      </div>
    </div>
  );
}

function ReadOnlyContent({ lang, value, placeholder }) {
  const isRTL = lang === "ar";
  const direction = isRTL ? "rtl" : "ltr";
  const hasContent = value && value.replace(/<[^>]*>/g, "").trim().length > 0;

  return (
    <div className="border border-gray-200 rounded-lg bg-gray-50/50 overflow-hidden">
      <div
        dir={direction}
        style={{ direction, unicodeBidi: "isolate" }}
        className={`${richTextClasses(isRTL)} ${hasContent ? "text-gray-800" : "text-gray-400"}`}
        // Content comes from our own backend / our own editor, not arbitrary third-party HTML.
        dangerouslySetInnerHTML={{ __html: hasContent ? value : placeholder }}
      />
      <div className="flex items-center justify-end px-3 py-1.5 border-t border-gray-100 text-xs text-gray-400">
        Read-only — click "Update" to edit
      </div>
    </div>
  );
}

export default function TermsAndConditionsEditor({
  initialValue = { en: "", ar: "" },
  onSave,
  saving = false,
  loading = false,
  serverErrors = null,
  title = "Terms & Conditions",
  subtitle = "Manage bilingual terms and conditions content",
  enDescription = "Write the English version of the Terms & Conditions below.",
  arDescription = "اكتب النسخة العربية من الشروط والأحكام بالأسفل.",
  enPlaceholder = "No English terms and conditions yet.",
  arPlaceholder = "لا يوجد شروط وأحكام بالعربية بعد.",
  enEditorPlaceholder = "Write English terms and conditions...",
  arEditorPlaceholder = "اكتب الشروط والأحكام بالعربية...",
  minLength = 150,
  minLengthMessage = (min) => `Please enter at least ${min} characters.`,
}) {
  const [activeLang, setActiveLang] = useState("en");
  const [content, setContent] = useState({ en: initialValue?.en ?? "", ar: initialValue?.ar ?? "" });
  const [isInitialized, setIsInitialized] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ en: "", ar: "" });
  const previousInitialValue = useRef(null);

  // Sync backend data when it arrives (and only when it actually changed).
  useEffect(() => {
    if (loading || !initialValue) return;
    const next = { en: initialValue?.en ?? "", ar: initialValue?.ar ?? "" };
    const prev = previousInitialValue.current;
    const changed = !prev || prev.en !== next.en || prev.ar !== next.ar;
    if (changed) {
      previousInitialValue.current = next;
      setContent(next);
      setIsInitialized(true);
      setResetKey((v) => v + 1);
    }
  }, [initialValue, loading]);

  const saveDisabled = saving || loading || !isInitialized;

  const handleSave = () => {
    if (saveDisabled) return;

    const nextErrors = { en: "", ar: "" };
    if (minLength > 0) {
      if (getPlainTextLength(content.en) < minLength) nextErrors.en = minLengthMessage(minLength);
      if (getPlainTextLength(content.ar) < minLength) nextErrors.ar = minLengthMessage(minLength);
    }
    setValidationErrors(nextErrors);

    if (nextErrors.en || nextErrors.ar) {
      // Jump to whichever language tab is failing so the error is actually visible.
      if (!nextErrors[activeLang]) setActiveLang(nextErrors.en ? "en" : "ar");
      return;
    }

    onSave?.({ en: content.en, ar: content.ar });
    setIsEditing(false); // optimistic; serverErrors still show next time "Update" is pressed if the save failed
  };

  const handleCancel = () => {
    if (previousInitialValue.current) setContent(previousInitialValue.current);
    setResetKey((v) => v + 1);
    setValidationErrors({ en: "", ar: "" });
    setIsEditing(false);
  };

  const getFieldError = (field) => {
    if (validationErrors[field]) return validationErrors[field]; // client-side error wins: more actionable/up to date
    const value = serverErrors?.[field];
    return Array.isArray(value) ? value[0] || "" : value || "";
  };

  const updateContent = (field, html) => {
    setContent((c) => ({ ...c, [field]: html }));
    if (validationErrors[field] && getPlainTextLength(html) >= minLength) {
      setValidationErrors((v) => ({ ...v, [field]: "" }));
    }
  };

  const activeError = getFieldError(activeLang);
  const langs = [
    { code: "en", label: "English", description: enDescription, placeholder: enPlaceholder, editorPlaceholder: enEditorPlaceholder },
    { code: "ar", label: "العربية", description: arDescription, placeholder: arPlaceholder, editorPlaceholder: arEditorPlaceholder },
  ];
  const activeMeta = langs.find((l) => l.code === activeLang);

  return (
    <div className="max-w-9xl mx-auto p-0">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-700 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-200 transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveDisabled}
              title={loading ? "Waiting for content to load..." : undefined}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {loading ? "Loading..." : saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={loading || !isInitialized}
            title={loading ? "Waiting for content to load..." : undefined}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" /> {loading ? "Loading..." : "Update"}
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            {langs.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => setActiveLang(code)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeLang === code ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Globe className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
            {activeLang === "en" ? "English version" : "Arabic version"}
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-[10px] font-bold flex items-center justify-center">
              {activeLang === "en" ? "EN" : "AR"}
            </span>
            <p dir={activeLang === "ar" ? "rtl" : "ltr"} className="text-sm text-gray-600">
              {activeMeta.description}
            </p>
          </div>

          {loading || !isInitialized ? (
            <div className="min-h-[380px] flex items-center justify-center border border-gray-200 rounded-lg text-sm text-gray-400">
              Loading content...
            </div>
          ) : !isEditing ? (
            <ReadOnlyContent lang={activeLang} value={content[activeLang]} placeholder={activeMeta.placeholder} />
          ) : (
            <RichTextArea
              key={`terms-editor-${activeLang}`}
              lang={activeLang}
              value={content[activeLang]}
              resetKey={resetKey}
              error={activeError}
              minLength={minLength}
              onChange={(html) => updateContent(activeLang, html)}
              placeholder={activeMeta.editorPlaceholder}
            />
          )}
        </div>
      </div>
    </div>
  );
}