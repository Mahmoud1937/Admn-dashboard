import LocalizedPage from "../../../localization/LocalizedPage";
import { useTranslation } from "react-i18next";
import TermsAndConditionsEditor from "../../termsAndConditions/components/Termsandconditionseditor";
import { useRefundPolicyMutation, useRefundPolicyQuery } from "../hooks/useRefundPolicy";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import usePermission from "../../auth/hooks/usePermission";

export default function RefundPolicyPage() {
  const { t } = useTranslation("adminPages");
  const canUpdate = usePermission(PERMISSION_CODES.REFUND_POLICY_UPDATE);
  const { data, isLoading } = useRefundPolicyQuery();
  const { mutate, isPending, serverErrors } = useRefundPolicyMutation();

  return (
    <LocalizedPage><TermsAndConditionsEditor
      initialValue={data || { en: "", ar: "" }}
      onSave={(payload) => mutate(payload)}
      saving={isPending}
      loading={isLoading}
      serverErrors={serverErrors}
      canUpdate={canUpdate}
      title={t("Refund Policy")}
      subtitle="Manage bilingual refund policy content"
      enDescription="Write the English version of the Refund Policy below."
      arDescription="اكتب النسخة العربية من سياسة الاسترداد بالأسفل."
      enPlaceholder="No English refund policy yet."
      arPlaceholder="لا يوجد سياسة استرداد بالعربية بعد."
      enEditorPlaceholder="Write English refund policy..."
      arEditorPlaceholder="اكتب سياسة الاسترداد بالعربية..."
    /></LocalizedPage>
  );
}
