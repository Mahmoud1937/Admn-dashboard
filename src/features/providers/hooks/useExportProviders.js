import { useExcelExport } from "../../../shared/hooks/useExcelExport";
import { exportProviders } from "../services/providersService";

export function useExportProviders() {
  return useExcelExport({
    request: exportProviders,
    fallbackFilename: "providers.xlsx",
    errorMessage: "Unable to export providers. Please try again.",
  });
}
