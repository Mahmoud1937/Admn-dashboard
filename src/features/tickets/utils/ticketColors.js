// full class names on purpose, so Tailwind can detect them
export const COLOR_STYLES = {
  red: { bar: 'border-t-red-500', header: 'bg-red-100', title: 'text-red-800', icon: 'text-red-500', badge: 'bg-red-200 text-red-800', body: 'bg-red-50' },
  amber: { bar: 'border-t-amber-500', header: 'bg-amber-100', title: 'text-amber-800', icon: 'text-amber-500', badge: 'bg-amber-200 text-amber-800', body: 'bg-amber-50' },
  green: { bar: 'border-t-emerald-500', header: 'bg-emerald-100', title: 'text-emerald-800', icon: 'text-emerald-500', badge: 'bg-emerald-200 text-emerald-800', body: 'bg-emerald-50' },
  blue: { bar: 'border-t-blue-500', header: 'bg-blue-100', title: 'text-blue-800', icon: 'text-blue-500', badge: 'bg-blue-200 text-blue-800', body: 'bg-blue-50' },
  violet: { bar: 'border-t-violet-500', header: 'bg-violet-100', title: 'text-violet-800', icon: 'text-violet-500', badge: 'bg-violet-200 text-violet-800', body: 'bg-violet-50' },
  teal: { bar: 'border-t-teal-500', header: 'bg-teal-100', title: 'text-teal-800', icon: 'text-teal-500', badge: 'bg-teal-200 text-teal-800', body: 'bg-teal-50' },
  pink: { bar: 'border-t-pink-500', header: 'bg-pink-100', title: 'text-pink-800', icon: 'text-pink-500', badge: 'bg-pink-200 text-pink-800', body: 'bg-pink-50' },
  indigo: { bar: 'border-t-indigo-500', header: 'bg-indigo-100', title: 'text-indigo-800', icon: 'text-indigo-500', badge: 'bg-indigo-200 text-indigo-800', body: 'bg-indigo-50' },
  cyan: { bar: 'border-t-cyan-500', header: 'bg-cyan-100', title: 'text-cyan-800', icon: 'text-cyan-500', badge: 'bg-cyan-200 text-cyan-800', body: 'bg-cyan-50' },
  slate: { bar: 'border-t-slate-400', header: 'bg-slate-200', title: 'text-slate-700', icon: 'text-slate-400', badge: 'bg-white text-slate-600', body: 'bg-slate-100' },
}

// colors cycled through for Assigned Group columns
const GROUP_PALETTE = [
  'blue', 'violet', 'teal', 'pink', 'indigo', 'cyan', 'amber', 'green', 'red',
]

function getPriorityColorName(title = '') {
    
  const name = title.toLowerCase()
  if (/(urgent|critical|high)/.test(name)) return 'red'
  if (/(medium|normal)/.test(name)) return 'amber'
  if (/low/.test(name)) return 'green'
  return null
}

// returns the color NAME for a column (stable per id, not per position)
export function getColumnColorName(column, groupBy) {
    
  if (column.id === 'none') return 'slate'

  if (groupBy === 'status') return column.id === 'open' ? 'amber' : 'green'

  if (groupBy === 'priority') {
    const name = getPriorityColorName(column.title)
    if (name) return name
  }

  const numericId = Number(column.id)
  const seed = Number.isNaN(numericId)
    ? [...column.id].reduce((sum, char) => sum + char.charCodeAt(0), 0)
    : numericId
  return GROUP_PALETTE[seed % GROUP_PALETTE.length]
}