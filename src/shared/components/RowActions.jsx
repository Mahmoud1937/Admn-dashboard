import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={onEdit}
        className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
        title="Edit"
      >
        <FontAwesomeIcon icon={faPenToSquare} />
      </button>
      <button
        onClick={onDelete}
        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
        title="Delete"
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  );
}