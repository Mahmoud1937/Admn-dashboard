import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SlidersHeader({ onAddClick }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sliders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage homepage banner sliders in both languages.
        </p>
      </div>

      <button
        onClick={onAddClick}
        className="inline-flex items-center gap-2 rounded-md bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
      >
        <FontAwesomeIcon icon={faPlus} />
        Add Slider
      </button>
    </div>
  );
}