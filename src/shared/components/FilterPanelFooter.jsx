export default function FilterPanelFooter({ onClear, onApply, clearLabel = "Clear all" }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={onClear}
        className="text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        {clearLabel}
      </button>
      <button
        type="button"
        onClick={onApply}
        className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
      >
        Apply
      </button>
    </div>
  );
}