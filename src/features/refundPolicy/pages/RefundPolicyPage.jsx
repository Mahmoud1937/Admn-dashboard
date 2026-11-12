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
      subtitle={t("Manage bilingual refund policy content")}
      enDescription={t("Write the English version of the Refund Policy below.")}
      arDescription={t("Write the Arabic version of the Refund Policy below.")}
      enPlaceholder={t("No English refund policy yet.")}
      arPlaceholder={t("No Arabic refund policy yet.")}
      enEditorPlaceholder={t("Write English refund policy...")}
      arEditorPlaceholder={t("Write Arabic refund policy...")}
    /></LocalizedPage>
  );
}
