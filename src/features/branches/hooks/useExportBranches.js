import { useExcelExport } from "../../../shared/hooks/useExcelExport";
import { exportBranches } from "../services/providerBranchesService";

export function useExportBranches() {
  return useExcelExport({
    request: exportBranches,
    fallbackFilename: "branches.xlsx",
    errorMessage: "Unable to export branches. Please try again.",
  });
}
