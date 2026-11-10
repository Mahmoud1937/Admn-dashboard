import LocalizedPage from "../../../localization/LocalizedPage";
import TermsAndConditionsEditor from "../components/Termsandconditionseditor";
import { useTermsAndConditionsMutation, useTermsAndConditionsQuery } from "../hooks/Usetermsandconditions";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import usePermission from "../../auth/hooks/usePermission";

export default function TermsAndConditionsPage() {
  const canUpdate = usePermission(PERMISSION_CODES.TERMS_AND_CONDITIONS_UPDATE);
  const {
    data,
    isLoading,
  } = useTermsAndConditionsQuery();

  const {
    mutate,
    isPending,
    serverErrors,
  } = useTermsAndConditionsMutation();

  const handleSave = (payload) => {
    mutate(payload);
  };

  return (
    <LocalizedPage><TermsAndConditionsEditor
      initialValue={
        data || {
          en: "",
          ar: "",
        }
      }
      onSave={handleSave}
      saving={isPending}
      loading={isLoading}
      serverErrors={serverErrors}
      canUpdate={canUpdate}
    /></LocalizedPage>
  );
}
