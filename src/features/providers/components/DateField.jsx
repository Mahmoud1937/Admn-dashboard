import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";

export default function DateField({ value, onChange, disabled, className = "" }) {
  const inputRef = useRef(null);

  const displayValue = value
    ? new Date(value + "T00:00:00").toLocaleDateString("en-GB")
    : "";

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.showPicker?.() ?? inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <input
        type="text"
        readOnly
        value={displayValue}
        placeholder="dd/mm/yyyy"
        onClick={openPicker}
        disabled={disabled}
        className={
          className ||
          "w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm text-slate-900 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        }
      />
      <FontAwesomeIcon
        icon={faCalendar}
        onClick={openPicker}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="absolute inset-0 h-0 w-0 opacity-0"
        tabIndex={-1}
      />
    </div>
  );
}