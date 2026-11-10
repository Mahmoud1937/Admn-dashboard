import { useExcelExport } from "../../../shared/hooks/useExcelExport";
import { exportBranches } from "../services/providerBranchesService";
import useProviderDetailsText from "../../../localization/useProviderDetailsText";
import useLanguage from "../../../localization/useLanguage";

export function useExportBranches() {
  const tr = useProviderDetailsText();
  const { language } = useLanguage();
  return useExcelExport({
    request: exportBranches,
    fallbackFilename: "branches.xlsx",
    errorMessage: tr("Unable to export branches. Please try again."),
    invalidFileMessage: tr("The server did not return an Excel file."),
    emptyFileMessage: tr("No Excel file was returned. Please try again."),
    networkErrorMessage: language === "ar" ? tr("Unable to export branches. Please try again.") : undefined,
  });
}
