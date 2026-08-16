import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

export default function ProvidersHeader() {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-2xl">Providers Directory</h1>
        <p className="mt-1 text-sm text-slate-500 sm:sm-sm">
          Manage healthcare providers and their credentials.
        </p>
      </div>

      <button
        onClick={() => navigate("/providers/new")}
        className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 sm:px-4 sm:py-2.5 sm:text-sm"
      >
        <FontAwesomeIcon icon={faPlus} />
        Add Provider
      </button>
    </div>
  );
}