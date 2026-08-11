import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

export default function ProvidersHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Providers Directory</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage healthcare providers and their credentials.
        </p>
      </div>

      <button
        onClick={() => navigate("/providers/new")}
        className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        <FontAwesomeIcon icon={faPlus} />
        Add Provider
      </button>
    </div>
  );
}