import localizeMessage from "../../localization/localizeMessage";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function RowActions({ onEdit, onDelete, editLabel = "Edit", deleteLabel = "Delete" }) {
  useTranslation("common");
  return (
    <div className="flex items-center justify-center gap-2">
      {onEdit && (
        <button
          onClick={onEdit}
          className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
          title={localizeMessage(editLabel)}
          aria-label={localizeMessage(editLabel)}
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
          title={localizeMessage(deleteLabel)}
          aria-label={localizeMessage(deleteLabel)}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      )}
    </div>
  );
}
