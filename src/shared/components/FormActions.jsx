export default function FormActions({ onCancel, isSaving, submitLabel, savingLabel = "Saving..." }) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSaving}
        className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {isSaving ? savingLabel : submitLabel}
      </button>
    </div>
  );
}