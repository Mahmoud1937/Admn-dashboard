import { forwardRef } from "react";
import { canInsertNumericText, isNumericInput, sanitizeNumericInput } from "../utils/numericInput";

const NumberInput = forwardRef(function NumberInput({
  className = "",
  type = "number",
  inputMode,
  step,
  maxLength,
  onChange,
  onKeyDown,
  onBeforeInput,
  onPaste,
  onDrop,
  onWheel,
  ...props
}, ref) {
  const allowDecimal = inputMode === "decimal" || step === "any" ||
    (step != null && Number(step) > 0 && !Number.isInteger(Number(step)));

  return (
    <input
      {...props}
      ref={ref}
      type={type}
      maxLength={maxLength}
      inputMode={allowDecimal ? "decimal" : "numeric"}
      step={type === "number" ? step ?? (allowDecimal ? "any" : 1) : undefined}
      onChange={(event) => {
        const numeric = sanitizeNumericInput(event.target.value, allowDecimal);
        const clean = maxLength == null ? numeric : numeric.slice(0, maxLength);
        if (event.target.value !== clean) event.target.value = clean;
        onChange?.(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented && !event.ctrlKey && !event.metaKey && !event.altKey &&
            event.key.length === 1 && !canInsertNumericText(event.currentTarget, event.key, allowDecimal)) {
          event.preventDefault();
        }
      }}
      onBeforeInput={(event) => {
        onBeforeInput?.(event);
        if (!event.defaultPrevented && event.data && !canInsertNumericText(event.currentTarget, event.data, allowDecimal)) {
          event.preventDefault();
        }
      }}
      onPaste={(event) => {
        onPaste?.(event);
        if (!event.defaultPrevented && !canInsertNumericText(event.currentTarget, event.clipboardData.getData("text"), allowDecimal)) {
          event.preventDefault();
        }
      }}
      onDrop={(event) => {
        onDrop?.(event);
        if (!event.defaultPrevented && !isNumericInput(event.dataTransfer.getData("text"), allowDecimal)) {
          event.preventDefault();
        }
      }}
      onWheel={(event) => {
        onWheel?.(event);
        if (type === "number") event.currentTarget.blur();
      }}
      className={className}
    />
  );
});

export default NumberInput;
