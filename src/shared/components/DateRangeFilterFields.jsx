const dateFieldClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400'

export default function DateRangeFilterFields({
  draft,
  onDraftChange,
  fromLabel = 'From date',
  toLabel = 'To date',
  fromField = 'fromDate',
  toField = 'toDate',
  stacked = true,
}) {
  const setField = (field) => (e) =>
    onDraftChange((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <div className={`${stacked ? 'space-y-4' : 'space-y-3'}`}>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          {fromLabel}
        </label>
        <input
          type="date"
          value={draft[fromField] || ''}
          onChange={setField(fromField)}
          className={dateFieldClass}
        />
      </div>
      <div className={stacked ? '' : 'mb-3'}>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          {toLabel}
        </label>
        <input
          type="date"
          value={draft[toField] || ''}
          min={draft[fromField] || undefined}
          onChange={setField(toField)}
          className={dateFieldClass}
        />
      </div>
    </div>
  )
}
