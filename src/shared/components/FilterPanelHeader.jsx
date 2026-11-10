import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

export default function FilterPanelHeader({ title, onClose, closeLabel }) {
  const { t } = useTranslation("common");
  const resolvedTitle = title ?? t("Filters");
  const resolvedCloseLabel = closeLabel ?? t("Close filters");
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-800">{resolvedTitle}</h3>
      <button
        type="button"
        onClick={onClose}
        aria-label={resolvedCloseLabel}
        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  );
}
