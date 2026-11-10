import { useExcelExport } from "../../../shared/hooks/useExcelExport";
import { exportServices } from "../services/ServicesService";

export function useExportServices(t = (text) => text) {
  return useExcelExport({
    request: exportServices,
    fallbackFilename: "services.xlsx",
    errorMessage: t("Unable to export services. Please try again."),
    invalidFileMessage: t("The server did not return an Excel file."),
    emptyFileMessage: t("No Excel file was returned. Please try again."),
    networkErrorMessage: t("Unable to connect to the server. Please check your internet connection and try again."),
  });
}
