import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export default function FilterPanelHeader({ title = "Filters", onClose }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  );
}