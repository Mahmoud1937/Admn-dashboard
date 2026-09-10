import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendar,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'

const dateFieldClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const pad = (n) => String(n).padStart(2, '0')

// hmm — "2026-09-10" -> "10/09/2026"
const isoToDisplay = (iso) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return [d, m, y].every(Boolean) ? `${d}/${m}/${y}` : ''
}

const isValidDate = (d, m, y) => {
  if (y < 100 || y > 9999) return false
  if (m < 1 || m > 12) return false
  if (d < 1 || d > 31) return false
  const dt = new Date(Date.UTC(y, m - 1, d))
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  )
}

// "10/09/2026" -> "2026-09-10" or null when invalid
const displayToIso = (str) => {
  if (str.length !== 10) return null
  const [dd, mm, yyyy] = str.split('/')
  const d = Number(dd)
  const m = Number(mm)
  const y = Number(yyyy)
  if (!isValidDate(d, m, y)) return null
  return `${y}-${pad(m)}-${pad(d)}`
}

// Progressive mask built from a raw numeric-only string. Blocks impossible
// ranges as early as possible (day 01-31, month 01-12, 4-digit year), while
// keeping the day/month slashes inserted automatically.
const buildMasked = (digits) => {
  const d = digits.slice(0, 2)
  const m = digits.slice(2, 4)
  const y = digits.slice(4, 8)

  let day = ''
  if (d.length > 0) {
    const d1 = d[0]
    if (d1 < '0' || d1 > '3') return ''
    day = d1
    if (d.length === 2) {
      const d2 = d[1]
      if (d1 === '0' && d2 === '0') return day // reject 00
      if (d1 === '3' && d2 > '1') return day // reject 32-39
      day += d2
    }
  }

  let month = ''
  if (d.length >= 2 && m.length > 0) {
    const m1 = m[0]
    if (m1 === '0') {
      month = '0'
      if (m.length === 2 && m[1] === '0') return `${day}/${month}` // reject 00
      if (m.length === 2) month += m[1]
    } else if (m1 === '1') {
      month = '1'
      if (m.length === 2 && m[1] > '2') return `${day}/${month}` // reject 13-19
      if (m.length === 2) month += m[1]
    } else {
      return day // month first digit must be 0 or 1
    }
  }

  let year = ''
  if (m.length >= 2 && y.length > 0) {
    if (y[0] === '0') return `${day}/${month}` // no leading-zero years
    year = y.slice(0, 4)
  }

  let out = day
  if (month) out += `/${month}`
  if (year) out += `/${year}`
  return out
}

const monthLabel = (viewDate) =>
  `${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`

// Builds the day grid for the given month view. Each cell is either null
// (leading blank day) or a { iso, day } object.
const buildMonthGrid = (viewDate) => {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null)

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ iso: `${year}-${pad(month + 1)}-${pad(day)}`, day })
  }

  return cells
}

function Calendar({ viewDate, selectedIso, minIso, onSelect, onPrev, onNext }) {
  const cells = buildMonthGrid(viewDate)

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous month"
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          <FontAwesomeIcon icon={faChevronLeft} size="xs" />
        </button>

        <span className="text-sm font-medium text-slate-700">
          {monthLabel(viewDate)}
        </span>

        <button
          type="button"
          onClick={onNext}
          aria-label="Next month"
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          <FontAwesomeIcon icon={faChevronRight} size="xs" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className="text-center text-[11px] font-medium uppercase text-slate-400"
          >
            {label}
          </span>
        ))}

        {cells.map((cell, index) => {
          if (!cell) return <span key={`empty-${index}`} />

          const isSelected = cell.iso === selectedIso
          const isDisabled = minIso ? cell.iso < minIso : false

          return (
            <button
              key={cell.iso}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(cell.iso)}
              className={[
                'mx-auto flex h-8 w-8 items-center justify-center rounded-md text-sm',
                isSelected
                  ? 'bg-blue-900 text-white'
                  : isDisabled
                    ? 'cursor-not-allowed text-slate-300'
                    : 'text-slate-700 hover:bg-blue-50 hover:text-blue-900',
              ].join(' ')}
            >
              {cell.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DatePicker({ value, onChange, minDate, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [text, setText] = useState(() => isoToDisplay(value))
  const [prevValue, setPrevValue] = useState(value)
  const [viewDate, setViewDate] = useState(() => {
    const base = value ? new Date(`${value}T00:00:00`) : new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const rootRef = useRef(null)

  if (value !== prevValue) {
    setPrevValue(value)
    setText(isoToDisplay(value))
  }

  useEffect(() => {
    if (!isOpen) return

    const handleMouseDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen])

  const commit = (iso) => {
    onChange(iso)
    setText(isoToDisplay(iso))
    if (iso) {
      const base = new Date(`${iso}T00:00:00`)
      setViewDate(new Date(base.getFullYear(), base.getMonth(), 1))
    }
  }

  const handleTextChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
    const formatted = buildMasked(digits)

    setText(formatted)

    if (!formatted) {
      commit('')
      return
    }

    if (formatted.length === 10) {
      const iso = displayToIso(formatted)
      if (iso && (!minDate || iso >= minDate)) {
        commit(iso)
      }
    }
  }

  const handleBlur = () => {
    const iso = displayToIso(text)
    if (iso && (!minDate || iso >= minDate)) {
      commit(iso)
    } else {
      setText(isoToDisplay(value))
    }
  }

  const toggleOpen = () => {
    if (!isOpen) setIsOpen(true)
    else setIsOpen(false)
  }

  const openCalendar = () => {
    if (value) {
      const base = new Date(`${value}T00:00:00`)
      setViewDate(new Date(base.getFullYear(), base.getMonth(), 1))
    }
    setIsOpen(true)
  }

  const handleSelect = (iso) => {
    commit(iso)
    setIsOpen(false)
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd/mm/yyyy"
          value={text}
          onChange={handleTextChange}
          onFocus={openCalendar}
          onBlur={handleBlur}
          onClick={openCalendar}
          className={`${dateFieldClass} cursor-pointer pr-9`}
        />
        <button
          type="button"
          aria-label="Toggle calendar"
          onClick={toggleOpen}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <FontAwesomeIcon icon={faCalendar} size="sm" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full z-40 mt-1 w-[18rem] max-w-[calc(100vw-1.5rem)] rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <Calendar
            viewDate={viewDate}
            selectedIso={value}
            minIso={minDate}
            onSelect={handleSelect}
            onPrev={() =>
              setViewDate(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
              )
            }
            onNext={() =>
              setViewDate(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
              )
            }
          />
        </div>
      )}
    </div>
  )
}

export default function DateRangeFilterFields({
  draft,
  onDraftChange,
  fromLabel = 'From date',
  toLabel = 'To date',
  fromField = 'fromDate',
  toField = 'toDate',
  stacked = true,
}) {
  const setField = (field) => (value) =>
    onDraftChange((prev) => ({ ...prev, [field]: value }))

  return (
    <div className={`${stacked ? 'space-y-4' : 'space-y-3'}`}>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          {fromLabel}
        </label>
        <DatePicker
          value={draft[fromField] || ''}
          onChange={setField(fromField)}
          className="w-full"
        />
      </div>
      <div className={stacked ? '' : 'mb-3'}>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          {toLabel}
        </label>
        <DatePicker
          value={draft[toField] || ''}
          minDate={draft[fromField] || undefined}
          onChange={setField(toField)}
          className="w-full"
        />
      </div>
    </div>
  )
}