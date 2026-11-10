import { useExcelExport } from "../../../shared/hooks/useExcelExport";
import { exportProviders } from "../services/providersService";

export function useExportProviders({ errorMessage = "Unable to export providers. Please try again.", invalidFileMessage, emptyFileMessage } = {}) {
  return useExcelExport({
    request: exportProviders,
    fallbackFilename: "providers.xlsx",
    errorMessage,
    invalidFileMessage,
    emptyFileMessage,
    networkErrorMessage: errorMessage,
  });
}
