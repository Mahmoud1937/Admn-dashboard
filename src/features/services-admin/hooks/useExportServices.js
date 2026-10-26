import { useExcelExport } from "../../../shared/hooks/useExcelExport";
import { exportServices } from "../services/ServicesService";

export function useExportServices() {
  return useExcelExport({
    request: exportServices,
    fallbackFilename: "services.xlsx",
    errorMessage: "Unable to export services. Please try again.",
  });
}
