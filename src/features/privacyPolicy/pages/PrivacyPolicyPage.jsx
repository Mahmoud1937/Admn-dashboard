import LocalizedPage from "../../../localization/LocalizedPage";
import { useTranslation } from "react-i18next";
import TermsAndConditionsEditor from "../../termsAndConditions/components/Termsandconditionseditor";
import { usePrivacyPolicyMutation, usePrivacyPolicyQuery } from "../hooks/usePrivacyPolicy";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import usePermission from "../../auth/hooks/usePermission";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation("adminPages");
  const canUpdate = usePermission(PERMISSION_CODES.PRIVACY_POLICY_UPDATE);
  const { data, isLoading } = usePrivacyPolicyQuery();
  const { mutate, isPending, serverErrors } = usePrivacyPolicyMutation();

  return (
    <LocalizedPage><TermsAndConditionsEditor
      initialValue={data || { en: "", ar: "" }}
      onSave={(payload) => mutate(payload)}
      saving={isPending}
      loading={isLoading}
      serverErrors={serverErrors}
      canUpdate={canUpdate}
      title={t("Privacy Policy")}
      subtitle={t("Manage bilingual privacy policy content")}
      enDescription={t("Write the English version of the Privacy Policy below.")}
      arDescription={t("Write the Arabic version of the Privacy Policy below.")}
      enPlaceholder={t("No English privacy policy yet.")}
      arPlaceholder={t("No Arabic privacy policy yet.")}
      enEditorPlaceholder={t("Write English privacy policy...")}
      arEditorPlaceholder={t("Write Arabic privacy policy...")}
    /></LocalizedPage>
  );
}
