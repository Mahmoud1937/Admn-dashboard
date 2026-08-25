import { useEffect, useRef, useState, useCallback } from "react";
import {
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

export const HEADINGS = [
  { label: "Heading 1", tag: "H1", className: "text-2xl font-bold" },
  { label: "Heading 2", tag: "H2", className: "text-xl font-bold" },
  { label: "Heading 3", tag: "H3", className: "text-lg font-semibold" },
  { label: "Normal", tag: "P", className: "text-sm" },
];

export const COLORS = [
  "#111827",
  "#DC2626",
  "#EA580C",
  "#CA8A04",
  "#16A34A",
  "#0891B2",
  "#2563EB",
  "#7C3AED",
];

export function ToolbarButton({ icon: Icon, label, onClick, active }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
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

export function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />;
}

export function ColorPopover({ label, onPick, onClose }) {
  const popRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
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

export function RichTextArea({ lang, value, onChange, placeholder, error, resetKey }) {
  const ref = useRef(null);

  const [headingOpen, setHeadingOpen] = useState(false);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [currentBlock, setCurrentBlock] = useState("P");

  const isRTL = lang === "ar";
  const direction = isRTL ? "rtl" : "ltr";

  const applyDirectionToBlocks = useCallback(() => {
    if (!ref.current) return;

    const blocks = ref.current.querySelectorAll(
      "p, div, h1, h2, h3, h4, h5, h6, li, blockquote, pre"
    );

    blocks.forEach((block) => {
      block.dir = direction;
      block.style.direction = direction;
      block.style.unicodeBidi = "plaintext";
    });
  }, [direction]);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.innerHTML = value || "";

    applyDirectionToBlocks();

    setCharCount(ref.current.textContent?.length || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const emit = useCallback(() => {
    if (!ref.current) return;

    applyDirectionToBlocks();

    const html = ref.current.innerHTML;

    onChange(html);

    setCharCount(ref.current.textContent?.length || 0);
  }, [onChange, applyDirectionToBlocks]);

  const syncCurrentBlock = useCallback(() => {
    if (!ref.current) return;

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) return;

    let node = selection.getRangeAt(0).startContainer;

    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }

    while (node && node !== ref.current) {
      const tag = node.tagName;

      if (tag && HEADINGS.some((h) => h.tag === tag)) {
        setCurrentBlock(tag);
        return;
      }

      node = node.parentElement;
    }

    setCurrentBlock("P");
  }, []);

  const exec = useCallback(
    (command, arg = null) => {
      if (!ref.current) return;

      ref.current.focus();

      document.execCommand(command, false, arg);

      applyDirectionToBlocks();

      emit();

      syncCurrentBlock();
    },
    [applyDirectionToBlocks, emit, syncCurrentBlock]
  );

  const applyHeading = (tag) => {
    exec("formatBlock", tag);
    setHeadingOpen(false);
  };

  const insertLink = () => {
    const url = window.prompt("Enter URL");

    if (!url) return;

    exec("createLink", url);
  };

  const handleInput = () => {
    applyDirectionToBlocks();
    emit();
  };

  const activeHeadingLabel = HEADINGS.find((h) => h.tag === currentBlock)?.label || "Normal";

  return (
    <div
      className={`border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/40 ${
        error
          ? "border-red-400 focus-within:border-red-500"
          : "border-gray-200 focus-within:border-blue-500"
      }`}
    >
      <div className="flex items-center flex-wrap gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5 relative">
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
                  className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 ${heading.className} ${
                    heading.tag === currentBlock ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {heading.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Divider />

        <ToolbarButton icon={Bold} label="Bold" onClick={() => exec("bold")} />
        <ToolbarButton icon={Italic} label="Italic" onClick={() => exec("italic")} />
        <ToolbarButton icon={Underline} label="Underline" onClick={() => exec("underline")} />
        <ToolbarButton icon={Strikethrough} label="Strikethrough" onClick={() => exec("strikeThrough")} />

        <div className="relative">
          <ToolbarButton icon={Baseline} label="Text color" onClick={() => setTextColorOpen((v) => !v)} />
          {textColorOpen && (
            <ColorPopover
              label="Text color"
              onPick={(color) => exec("foreColor", color)}
              onClose={() => setTextColorOpen(false)}
            />
          )}
        </div>

        <div className="relative">
          <ToolbarButton icon={Highlighter} label="Highlight" onClick={() => setHighlightOpen((v) => !v)} />
          {highlightOpen && (
            <ColorPopover
              label="Highlight"
              onPick={(color) => exec("hiliteColor", color)}
              onClose={() => setHighlightOpen(false)}
            />
          )}
        </div>

        <Divider />

        <ToolbarButton icon={ListOrdered} label="Numbered list" onClick={() => exec("insertOrderedList")} />
        <ToolbarButton icon={List} label="Bulleted list" onClick={() => exec("insertUnorderedList")} />
        <ToolbarButton icon={Outdent} label="Decrease indent" onClick={() => exec("outdent")} />
        <ToolbarButton icon={Indent} label="Increase indent" onClick={() => exec("indent")} />

        <Divider />

        <ToolbarButton icon={AlignLeft} label="Align left" onClick={() => exec("justifyLeft")} />
        <ToolbarButton icon={AlignCenter} label="Align center" onClick={() => exec("justifyCenter")} />
        <ToolbarButton icon={AlignRight} label="Align right" onClick={() => exec("justifyRight")} />

        <Divider />

        <ToolbarButton icon={Quote} label="Quote" onClick={() => exec("formatBlock", "BLOCKQUOTE")} />
        <ToolbarButton icon={Code} label="Code" onClick={() => exec("formatBlock", "PRE")} />
        <ToolbarButton icon={LinkIcon} label="Insert link" onClick={insertLink} />
        <ToolbarButton icon={RemoveFormatting} label="Clear formatting" onClick={() => exec("removeFormat")} />
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        dir={direction}
        onInput={handleInput}
        onBlur={emit}
        onKeyUp={syncCurrentBlock}
        onMouseUp={syncCurrentBlock}
        data-placeholder={placeholder}
        style={{ direction, unicodeBidi: "plaintext" }}
        className={`min-h-[380px] max-h-[480px] overflow-y-auto px-4 py-3 text-sm text-gray-800 leading-relaxed focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 ${
          isRTL
            ? "text-right [&_blockquote]:border-r-4 [&_blockquote]:pr-3"
            : "text-left [&_blockquote]:border-l-4 [&_blockquote]:pl-3"
        } [&_blockquote]:border-gray-300 [&_blockquote]:text-gray-500 [&_pre]:bg-gray-100 [&_pre]:rounded [&_pre]:p-2 [&_pre]:font-mono [&_pre]:text-xs [&_a]:text-blue-600 [&_a]:underline`}
      />

      <div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-100 text-xs">
        <span className={error ? "text-red-500 font-medium" : "text-gray-400"}>{error || ""}</span>
        <span className="text-gray-400">{charCount} characters</span>
      </div>
    </div>
  );
}

export function ReadOnlyContent({ lang, value, placeholder }) {
  const isRTL = lang === "ar";
  const direction = isRTL ? "rtl" : "ltr";

  const hasContent = value && value.replace(/<[^>]*>/g, "").trim().length > 0;

  return (
    <div className="border border-gray-200 rounded-lg bg-gray-50/50 overflow-hidden">
      <div
        dir={direction}
        style={{ direction, unicodeBidi: "plaintext" }}
        className={`min-h-[380px] max-h-[480px] overflow-y-auto px-4 py-3 text-sm leading-relaxed ${
          hasContent ? "text-gray-800" : "text-gray-400"
        } ${
          isRTL
            ? "text-right [&_blockquote]:border-r-4 [&_blockquote]:pr-3"
            : "text-left [&_blockquote]:border-l-4 [&_blockquote]:pl-3"
        } [&_blockquote]:border-gray-300 [&_blockquote]:text-gray-500 [&_pre]:bg-gray-100 [&_pre]:rounded [&_pre]:p-2 [&_pre]:font-mono [&_pre]:text-xs [&_a]:text-blue-600 [&_a]:underline`}
        // Content comes from our own backend / our own editor, not arbitrary third-party HTML.
        dangerouslySetInnerHTML={{ __html: hasContent ? value : placeholder }}
      />

      <div className="flex items-center justify-end px-3 py-1.5 border-t border-gray-100 text-xs text-gray-400">
        Read-only — click "Update" to edit
      </div>
    </div>
  );
}