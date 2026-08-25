import { useEffect, useRef, useState, useCallback } from "react";
import {
  FileText,
  Save,
  Pencil,
  X,
  Globe,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Baseline,
  Highlighter,
  ListOrdered,
  List,
  Indent,
  Outdent,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  Link as LinkIcon,
  RemoveFormatting,
  ChevronDown,
} from "lucide-react";

const HEADINGS = [
  {
    label: "Heading 1",
    tag: "H1",
    className: "text-2xl font-bold",
  },
  {
    label: "Heading 2",
    tag: "H2",
    className: "text-xl font-bold",
  },
  {
    label: "Heading 3",
    tag: "H3",
    className: "text-lg font-semibold",
  },
  {
    label: "Normal",
    tag: "P",
    className: "text-sm",
  },
];

const COLORS = [
  "#111827",
  "#DC2626",
  "#EA580C",
  "#CA8A04",
  "#16A34A",
  "#0891B2",
  "#2563EB",
  "#7C3AED",
];

// Only inline-style commands are reliably reflected by
// document.queryCommandState. Block-level state (headings, lists,
// blockquote, code) is tracked manually via `blockState` below,
// because execCommand's own state queries for those are unreliable
// once we start moving nodes around ourselves.
const COMMANDS_TO_TRACK = ["bold", "italic", "underline", "strikeThrough"];

/**
 * How many "real" characters (i.e. ignoring HTML tags) does this
 * rich-text HTML value contain? Used both for the live counter in
 * the toolbar footer and for the min-length validation on save.
 */
function getPlainTextLength(html) {
  if (!html) return 0;
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length;
}

function ToolbarButton({ icon: Icon, label, onMouseDown, active }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={onMouseDown}
      className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
        active
          ? "bg-blue-100 text-blue-700"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />;
}

function ColorPopover({ label, onPick, onClose }) {
  const popRef = useRef(null);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={popRef}
      className="absolute z-20 top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-4 gap-1 w-36"
    >
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            onPick(color);
            onClose();
          }}
          className="w-6 h-6 rounded-full border border-gray-200"
          style={{ backgroundColor: color }}
          aria-label={`${label} ${color}`}
        />
      ))}
    </div>
  );
}

function RichTextArea({
  lang,
  value,
  onChange,
  placeholder,
  error,
  resetKey,
  minLength = 0,
}) {
  const ref = useRef(null);

  const [headingOpen, setHeadingOpen] = useState(false);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Unified block-level state: which heading/list/quote/code the
  // caret currently sits inside. This is what drives the "active"
  // highlight on the toolbar icons for those block-level tools,
  // since execCommand's queryCommandState is not reliable for them.
  const [blockState, setBlockState] = useState({
    heading: "P",
    list: null, // "UL" | "OL" | null
    quote: false,
    code: false,
  });

  const [activeCommands, setActiveCommands] = useState({});

  const isRTL = lang === "ar";
  const direction = isRTL ? "rtl" : "ltr";

  /**
   * Apply direction to all block elements inside editor.
   *
   * This is important because document.execCommand can create
   * new <p>, <div>, <li>, <blockquote>, etc. without inheriting
   * the correct direction.
   */
  const applyDirectionToBlocks = useCallback(() => {
    if (!ref.current) return;

    const blocks = ref.current.querySelectorAll(
      "p, div, h1, h2, h3, h4, h5, h6, li, blockquote, pre"
    );

    blocks.forEach((block) => {
      block.dir = direction;
      block.style.direction = direction;
      block.style.unicodeBidi = "isolate";
    });
  }, [direction]);

  /**
   * Load HTML from backend / reset the editor.
   *
   * IMPORTANT: this only runs when `resetKey` changes (i.e. a real
   * external reload, like initial server data arriving or switching
   * language tabs). It must NOT depend on `value`, otherwise every
   * keystroke triggers onChange -> parent setState -> new `value` prop
   * -> this effect re-fires -> innerHTML gets overwritten -> the caret
   * jumps back to the start of the editor on every character typed.
   */
  useEffect(() => {
    if (!ref.current) return;

    ref.current.innerHTML = value || "";

    applyDirectionToBlocks();

    setCharCount(ref.current.textContent?.length || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  /**
   * Emit HTML to parent.
   */
  const emit = useCallback(() => {
    if (!ref.current) return;

    applyDirectionToBlocks();

    const html = ref.current.innerHTML;

    onChange(html);

    setCharCount(ref.current.textContent?.length || 0);
  }, [onChange, applyDirectionToBlocks]);

  /**
   * Walk up from the caret and figure out, in one pass, which
   * heading/list/quote/code block(s) it's currently inside. Keeps
   * the toolbar's "Normal / Heading X" label AND the list/quote/code
   * active-highlight in sync with wherever the cursor actually is.
   */
  const syncBlockState = useCallback(() => {
    if (!ref.current) return;

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) return;

    let node = selection.getRangeAt(0).startContainer;

    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }

    let heading = "P";
    let list = null;
    let quote = false;
    let code = false;

    let cursor = node;

    while (cursor && cursor !== ref.current) {
      const tag = cursor.tagName;

      if (tag && heading === "P" && HEADINGS.some((h) => h.tag === tag)) {
        heading = tag;
      }

      if (tag === "UL" || tag === "OL") {
        list = tag;
      }

      if (tag === "BLOCKQUOTE") {
        quote = true;
      }

      if (tag === "PRE") {
        code = true;
      }

      cursor = cursor.parentElement;
    }

    setBlockState({ heading, list, quote, code });
  }, []);

  const syncActiveCommands = useCallback(() => {
    const next = {};
    for (const cmd of COMMANDS_TO_TRACK) {
      next[cmd] = document.queryCommandState(cmd);
    }
    setActiveCommands(next);
  }, []);

  /**
   * Wrap the current block (or selection) in a <ul>/<ol>, or unwrap if already inside one.
   */
  const toggleList = useCallback(
    (tag) => {
      if (!ref.current) return;
      ref.current.focus();

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      let node = sel.anchorNode;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

      // Walk up to find if we're inside an existing list of the same type
      let listAncestor = null;
      let cursor = node;
      while (cursor && cursor !== ref.current) {
        if (cursor.tagName === "UL" || cursor.tagName === "OL") {
          listAncestor = cursor;
          break;
        }
        cursor = cursor.parentElement;
      }

      // Already inside the same type → unwrap
      if (listAncestor && listAncestor.tagName === tag) {
        const fragment = document.createDocumentFragment();
        while (listAncestor.firstChild)
          fragment.appendChild(listAncestor.firstChild);
        listAncestor.parentNode.replaceChild(fragment, listAncestor);
      } else if (listAncestor) {
        // Inside a different list type → change tag
        const replacement = document.createElement(tag);
        replacement.innerHTML = listAncestor.innerHTML;
        listAncestor.parentNode.replaceChild(replacement, listAncestor);
      } else {
        // No list → wrap current block in a list
        let block = node;
        while (
          block &&
          block !== ref.current &&
          !["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "PRE", "LI"].includes(
            block.tagName
          )
        ) {
          block = block.parentElement;
        }

        const li = document.createElement("li");

        if (!block || block === ref.current) {
          // The caret sits directly in the editor root (e.g. a brand
          // new, still-empty editor) — there is no wrapping block
          // element to swap out. Move the root's own children into
          // the <li> and APPEND the list, rather than trying to
          // replace `ref.current` itself: replacing it would rip the
          // actual contentEditable node out of the DOM and silently
          // break editing/typing/character-count from that point on.
          while (ref.current.firstChild) li.appendChild(ref.current.firstChild);
          const list = document.createElement(tag);
          list.appendChild(li);
          ref.current.appendChild(list);
        } else {
          // Move the block's children into the li
          while (block.firstChild) li.appendChild(block.firstChild);
          const list = document.createElement(tag);
          list.appendChild(li);
          block.parentNode.replaceChild(list, block);
        }
      }

      applyDirectionToBlocks();
      emit();
      syncBlockState();
      syncActiveCommands();
    },
    [applyDirectionToBlocks, emit, syncBlockState, syncActiveCommands]
  );

  /**
   * Toggle blockquote / pre (code block).
   */
  const toggleBlock = useCallback(
    (tag) => {
      if (!ref.current) return;
      ref.current.focus();

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      let node = sel.anchorNode;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

      let block = node;
      while (block && block !== ref.current && block.tagName !== tag) {
        block = block.parentElement;
      }

      // Already inside this tag → unwrap
      if (block && block.tagName === tag && block !== ref.current) {
        const fragment = document.createDocumentFragment();
        while (block.firstChild) fragment.appendChild(block.firstChild);
        block.parentNode.replaceChild(fragment, block);
      } else {
        document.execCommand("formatBlock", false, tag);
      }

      applyDirectionToBlocks();
      emit();
      syncBlockState();
      syncActiveCommands();
    },
    [applyDirectionToBlocks, emit, syncBlockState, syncActiveCommands]
  );

  /**
   * Execute editor command (for the inline/style commands that
   * execCommand still handles fine: bold, italic, color, alignment,
   * headings, indent, link, clear formatting).
   */
  const exec = useCallback(
    (command, arg = null) => {
      if (!ref.current) return;

      ref.current.focus();

      document.execCommand(command, false, arg);

      applyDirectionToBlocks();

      emit();

      syncBlockState();
      syncActiveCommands();
    },
    [applyDirectionToBlocks, emit, syncBlockState, syncActiveCommands]
  );

  const applyHeading = (tag) => {
    exec("formatBlock", tag);

    setHeadingOpen(false);
  };

  /**
   * Insert link.
   */
  const insertLink = () => {
    const url = window.prompt("Enter URL");

    if (!url) return;

    exec("createLink", url);
  };

  /**
   * Handle input manually.
   */
  const handleInput = () => {
    applyDirectionToBlocks();

    emit();
  };

  const activeHeadingLabel =
    HEADINGS.find((h) => h.tag === blockState.heading)?.label || "Normal";

  return (
    <div
      className={`border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/40 ${
        error
          ? "border-red-400 focus-within:border-red-500"
          : "border-gray-200 focus-within:border-blue-500"
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5 relative">
        {/* Heading */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setHeadingOpen((value) => !value)}
            className="flex items-center gap-1 h-8 px-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
          >
            {activeHeadingLabel}

            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {headingOpen && (
            <div className="absolute z-20 top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40">
              {HEADINGS.map((heading) => (
                <button
                  key={heading.tag}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyHeading(heading.tag)}
                  className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 ${
                    heading.className
                  } ${
                    heading.tag === blockState.heading
                      ? "text-blue-600"
                      : "text-gray-900"
                  }`}
                >
                  {heading.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* Text formatting */}
        <ToolbarButton
          icon={Bold}
          label="Bold"
          active={activeCommands.bold}
          onMouseDown={(e) => { e.preventDefault(); exec("bold"); }}
        />

        <ToolbarButton
          icon={Italic}
          label="Italic"
          active={activeCommands.italic}
          onMouseDown={(e) => { e.preventDefault(); exec("italic"); }}
        />

        <ToolbarButton
          icon={Underline}
          label="Underline"
          active={activeCommands.underline}
          onMouseDown={(e) => { e.preventDefault(); exec("underline"); }}
        />

        <ToolbarButton
          icon={Strikethrough}
          label="Strikethrough"
          active={activeCommands.strikeThrough}
          onMouseDown={(e) => { e.preventDefault(); exec("strikeThrough"); }}
        />

        {/* Text color */}
        <div className="relative">
          <ToolbarButton
            icon={Baseline}
            label="Text color"
            onMouseDown={(e) => { e.preventDefault(); setTextColorOpen((v) => !v); }}
          />

          {textColorOpen && (
            <ColorPopover
              label="Text color"
              onPick={(color) => exec("foreColor", color)}
              onClose={() => setTextColorOpen(false)}
            />
          )}
        </div>

        {/* Highlight */}
        <div className="relative">
          <ToolbarButton
            icon={Highlighter}
            label="Highlight"
            onMouseDown={(e) => { e.preventDefault(); setHighlightOpen((v) => !v); }}
          />

          {highlightOpen && (
            <ColorPopover
              label="Highlight"
              onPick={(color) => exec("hiliteColor", color)}
              onClose={() => setHighlightOpen(false)}
            />
          )}
        </div>

        <Divider />

        {/* Lists — wired to the custom toggleList (not execCommand) so the
            active state can be tracked reliably, and so lists behave
            consistently across the EN/RTL and AR/RTL editors. */}
        <ToolbarButton
          icon={ListOrdered}
          label="Numbered list"
          active={blockState.list === "OL"}
          onMouseDown={(e) => { e.preventDefault(); toggleList("OL"); }}
        />

        <ToolbarButton
          icon={List}
          label="Bulleted list"
          active={blockState.list === "UL"}
          onMouseDown={(e) => { e.preventDefault(); toggleList("UL"); }}
        />

        <ToolbarButton
          icon={Outdent}
          label="Decrease indent"
          onMouseDown={(e) => { e.preventDefault(); exec("outdent"); }}
        />

        <ToolbarButton
          icon={Indent}
          label="Increase indent"
          onMouseDown={(e) => { e.preventDefault(); exec("indent"); }}
        />

        <Divider />

        {/* Alignment */}
        <ToolbarButton
          icon={AlignLeft}
          label="Align left"
          onMouseDown={(e) => { e.preventDefault(); exec("justifyLeft"); }}
        />

        <ToolbarButton
          icon={AlignCenter}
          label="Align center"
          onMouseDown={(e) => { e.preventDefault(); exec("justifyCenter"); }}
        />

        <ToolbarButton
          icon={AlignRight}
          label="Align right"
          onMouseDown={(e) => { e.preventDefault(); exec("justifyRight"); }}
        />

        <Divider />

        {/* Quote — wired to toggleBlock so it can toggle on/off and light up */}
        <ToolbarButton
          icon={Quote}
          label="Quote"
          active={blockState.quote}
          onMouseDown={(e) => { e.preventDefault(); toggleBlock("BLOCKQUOTE"); }}
        />

        {/* Code — same fix as Quote */}
        <ToolbarButton
          icon={Code}
          label="Code"
          active={blockState.code}
          onMouseDown={(e) => { e.preventDefault(); toggleBlock("PRE"); }}
        />

        {/* Link */}
        <ToolbarButton
          icon={LinkIcon}
          label="Insert link"
          onMouseDown={(e) => { e.preventDefault(); insertLink(); }}
        />

        {/* Clear formatting */}
        <ToolbarButton
          icon={RemoveFormatting}
          label="Clear formatting"
          onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); }}
        />
      </div>

      {/* Editable Area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        dir={direction}
        onInput={handleInput}
        onBlur={emit}
        onKeyUp={() => { syncBlockState(); syncActiveCommands(); }}
        onMouseUp={() => { syncBlockState(); syncActiveCommands(); }}
        data-placeholder={placeholder}
        style={{
          direction,
          unicodeBidi: "isolate",
        }}
        className={`min-h-[380px] max-h-[480px] overflow-y-auto px-4 py-3 text-sm text-gray-800 leading-relaxed focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 ${
          isRTL
            ? "text-right [&_blockquote]:border-r-4 [&_blockquote]:pr-3 [&_ul]:pr-5 [&_ol]:pr-5"
            : "text-left [&_blockquote]:border-l-4 [&_blockquote]:pl-3 [&_ul]:pl-5 [&_ol]:pl-5"
        } [&_blockquote]:border-gray-300 [&_blockquote]:text-gray-500 [&_pre]:bg-gray-100 [&_pre]:rounded [&_pre]:p-2 [&_pre]:font-mono [&_pre]:text-xs [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ol]:list-decimal [&_li]:my-0.5`}
      />

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-100 text-xs">
        <span
          className={
            error
              ? "text-red-500 font-medium"
              : "text-gray-400"
          }
        >
          {error || ""}
        </span>

        <span
          className={
            minLength > 0 && charCount < minLength
              ? "text-red-500 font-medium"
              : "text-gray-400"
          }
        >
          {minLength > 0
            ? `${charCount} characters (minimum ${minLength})`
            : `${charCount} characters`}
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
        style={{
          direction,
          unicodeBidi: "isolate",
        }}
        className={`min-h-[380px] max-h-[480px] overflow-y-auto px-4 py-3 text-sm leading-relaxed ${
          hasContent ? "text-gray-800" : "text-gray-400"
        } ${
          isRTL
            ? "text-right [&_blockquote]:border-r-4 [&_blockquote]:pr-3 [&_ul]:pr-5 [&_ol]:pr-5"
            : "text-left [&_blockquote]:border-l-4 [&_blockquote]:pl-3 [&_ul]:pl-5 [&_ol]:pl-5"
        } [&_blockquote]:border-gray-300 [&_blockquote]:text-gray-500 [&_pre]:bg-gray-100 [&_pre]:rounded [&_pre]:p-2 [&_pre]:font-mono [&_pre]:text-xs [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ol]:list-decimal [&_li]:my-0.5`}
        // Content comes from our own backend / our own editor, not
        // arbitrary user-supplied HTML from a third party.
        dangerouslySetInnerHTML={{
          __html: hasContent ? value : placeholder,
        }}
      />

      <div className="flex items-center justify-end px-3 py-1.5 border-t border-gray-100 text-xs text-gray-400">
        Read-only — click "Update" to edit
      </div>
    </div>
  );
}

export default function TermsAndConditionsEditor({
  initialValue = {
    en: "",
    ar: "",
  },
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
  minLengthMessage = (min) =>
    `Please enter at least ${min} characters.`,
}) {
  const [activeLang, setActiveLang] =
    useState("en");

  const [content, setContent] = useState({
    en: initialValue?.en ?? "",
    ar: initialValue?.ar ?? "",
  });

  const [isInitialized, setIsInitialized] =
    useState(false);

  const [resetKey, setResetKey] = useState(0);

  // View is read-only by default; "Update" switches it into edit mode.
  const [isEditing, setIsEditing] = useState(false);

  // Client-side "min length" errors, keyed by language. Separate from
  // `serverErrors` (which come back from the API after a failed save) so
  // we can catch this before ever hitting the network.
  const [validationErrors, setValidationErrors] = useState({
    en: "",
    ar: "",
  });

  const previousInitialValue = useRef(null);

  /**
   * Sync backend data when it arrives.
   */
  useEffect(() => {
    if (loading) return;

    if (!initialValue) return;

    const nextValue = {
      en: initialValue?.en ?? "",
      ar: initialValue?.ar ?? "",
    };

    const previous =
      previousInitialValue.current;

    const changed =
      !previous ||
      previous.en !== nextValue.en ||
      previous.ar !== nextValue.ar;

    if (changed) {
      previousInitialValue.current =
        nextValue;

      setContent(nextValue);

      setIsInitialized(true);

      setResetKey(
        (value) => value + 1
      );
    }
  }, [initialValue, loading]);

  const saveDisabled =
    saving ||
    loading ||
    !isInitialized;

  const handleSave = () => {
    if (saveDisabled) return;

    // Enforce the minimum content length client-side before we ever
    // touch the network.
    const nextValidationErrors = { en: "", ar: "" };

    if (minLength > 0) {
      if (getPlainTextLength(content.en) < minLength) {
        nextValidationErrors.en = minLengthMessage(minLength);
      }
      if (getPlainTextLength(content.ar) < minLength) {
        nextValidationErrors.ar = minLengthMessage(minLength);
      }
    }

    const hasValidationErrors =
      nextValidationErrors.en || nextValidationErrors.ar;

    setValidationErrors(nextValidationErrors);

    if (hasValidationErrors) {
      // Jump to whichever language tab is failing so the error is
      // actually visible.
      if (nextValidationErrors[activeLang]) {
        // already on the right tab
      } else if (nextValidationErrors.en) {
        setActiveLang("en");
      } else if (nextValidationErrors.ar) {
        setActiveLang("ar");
      }
      return;
    }

    onSave?.({
      en: content.en,
      ar: content.ar,
    });

    // Optimistically drop back into read-only view. If the save fails,
    // `serverErrors` will still be set and visible next time "Update"
    // is pressed.
    setIsEditing(false);
  };

  const handleUpdateClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Revert any unsaved edits back to the last known server value.
    if (previousInitialValue.current) {
      setContent(previousInitialValue.current);
    }

    setResetKey((value) => value + 1);

    setValidationErrors({ en: "", ar: "" });

    setIsEditing(false);
  };

  const getFieldError = (field) => {
    // A client-side validation error (e.g. below the minimum length)
    // takes priority since it's the more actionable, up-to-date one.
    if (validationErrors[field]) {
      return validationErrors[field];
    }

    if (!serverErrors) return "";

    const value = serverErrors[field];

    if (Array.isArray(value)) {
      return value[0] || "";
    }

    return value || "";
  };

  const updateContent = (field, html) => {
    setContent((current) => ({
      ...current,
      [field]: html,
    }));

    // Clear that field's min-length error live, as soon as it's fixed,
    // instead of making the user hit "Save" again to find out.
    if (
      validationErrors[field] &&
      getPlainTextLength(html) >= minLength
    ) {
      setValidationErrors((current) => ({
        ...current,
        [field]: "",
      }));
    }
  };

  const activeError =
    getFieldError(activeLang);

  return (
    <div className="max-w-9xl mx-auto p-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-700 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {title}
            </h1>

            <p className="text-sm text-gray-500">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Actions */}
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saveDisabled}
              title={
                loading
                  ? "Waiting for content to load..."
                  : undefined
              }
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />

              {loading
                ? "Loading..."
                : saving
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleUpdateClick}
            disabled={loading || !isInitialized}
            title={
              loading
                ? "Waiting for content to load..."
                : undefined
            }
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />

            {loading ? "Loading..." : "Update"}
          </button>
        )}
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Language Tabs */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            {/* English */}
            <button
              type="button"
              onClick={() =>
                setActiveLang("en")
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeLang === "en"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Globe className="w-4 h-4" />

              English
            </button>

            {/* Arabic */}
            <button
              type="button"
              onClick={() =>
                setActiveLang("ar")
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeLang === "ar"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Globe className="w-4 h-4" />

              العربية
            </button>
          </div>

          {/* Version */}
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />

            {activeLang === "en"
              ? "English version"
              : "Arabic version"}
          </span>
        </div>

        <div className="p-4">
          {/* Description */}
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-[10px] font-bold flex items-center justify-center">
              {activeLang === "en"
                ? "EN"
                : "AR"}
            </span>
<p
  dir={activeLang === "ar" ? "rtl" : "ltr"}
  className="text-sm text-gray-600"
>
  {activeLang === "en"
    ? enDescription
    : arDescription}
</p>
          </div>

          {/* Loading */}
          {loading || !isInitialized ? (
            <div className="min-h-[380px] flex items-center justify-center border border-gray-200 rounded-lg text-sm text-gray-400">
              Loading content...
            </div>
          ) : !isEditing ? (
            // Read-only view of whatever came back from the GET request.
            <ReadOnlyContent
              lang={activeLang}
              value={
                activeLang === "en" ? content.en : content.ar
              }
              placeholder={
                activeLang === "en"
                  ? enPlaceholder
                  : arPlaceholder
              }
            />
          ) : activeLang === "en" ? (
            <RichTextArea
              key="terms-editor-en"
              lang="en"
              value={content.en}
              resetKey={resetKey}
              error={activeError}
              minLength={minLength}
              onChange={(html) => updateContent("en", html)}
              placeholder={enEditorPlaceholder}
            />
          ) : (
            <RichTextArea
              key="terms-editor-ar"
              lang="ar"
              value={content.ar}
              resetKey={resetKey}
              error={activeError}
              minLength={minLength}
              onChange={(html) => updateContent("ar", html)}
              placeholder={arEditorPlaceholder}
            />
          )}
        </div>
      </div>
    </div>
  );
}