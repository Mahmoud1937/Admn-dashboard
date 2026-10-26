import ProviderBranchesTab from "../components/ProviderBranchesTab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useExportBranches } from "../hooks/useExportBranches";
import usePermission from "../../auth/hooks/usePermission";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";

export default function BranchesPage() {
  const canExport = usePermission(PERMISSION_CODES.PROVIDER_BRANCHES_READ);
  const { exportToExcel, isExporting, exportError } = useExportBranches();

  return (
    <div className="space-y-4">
      {canExport && exportError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {exportError}
        </p>
      )}
      <ProviderBranchesTab
        readOnly
        renderFilterActions={canExport ? (filters) => (
          <button
            type="button"
            onClick={() => exportToExcel(filters)}
            disabled={isExporting}
            aria-busy={isExporting}
            title="Export branches to Excel"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FontAwesomeIcon icon={isExporting ? faSpinner : faFileExcel} spin={isExporting} />
            {isExporting ? "Exporting..." : "Export"}
          </button>
        ) : undefined}
      />
    </div>
  );
}
