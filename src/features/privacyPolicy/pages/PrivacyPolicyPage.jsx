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
      subtitle="Manage bilingual privacy policy content"
      enDescription="Write the English version of the Privacy Policy below."
      arDescription="اكتب النسخة العربية من سياسة الخصوصية بالأسفل."
      enPlaceholder="No English privacy policy yet."
      arPlaceholder="لا يوجد سياسة خصوصية بالعربية بعد."
      enEditorPlaceholder="Write English privacy policy..."
      arEditorPlaceholder="اكتب سياسة الخصوصية بالعربية..."
    /></LocalizedPage>
  );
}
