import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

export default function FormActions({
  onCancel,
  isSaving,
  submitLabel,
  savingLabel,
  cancelLabel,
  showCancel = true,
  submitFirst = false,
  submitDisabled = false,
  submitIcon,
  className = "flex items-center justify-end gap-3 border-t border-slate-100 pt-4",
  submitClassName = "rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60",
  cancelClassName = "text-sm font-medium text-slate-500 hover:text-slate-700",
  children,
}) {
  const { t } = useTranslation("common");
  const cancel = showCancel && (
    <button type="button" onClick={onCancel} className={cancelClassName}>{cancelLabel ?? t("Cancel")}</button>
  );
  const submit = (
    <button type="submit" disabled={isSaving || submitDisabled} className={submitClassName}>
      {submitIcon && <FontAwesomeIcon icon={isSaving ? faSpinner : submitIcon} spin={Boolean(isSaving)} />}
      {isSaving ? savingLabel ?? t("Saving...") : submitLabel}
    </button>
  );
  return (
    <div className={className}>
      {children}
      {submitFirst ? submit : cancel}
      {submitFirst ? cancel : submit}
    </div>
  );
}
