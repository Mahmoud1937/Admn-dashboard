import TermsAndConditionsEditor from "../../termsAndConditions/components/Termsandconditionseditor";
import { useRefundPolicyMutation, useRefundPolicyQuery } from "../hooks/useRefundPolicy";

export default function RefundPolicyPage() {
  const { data, isLoading, isFetching } = useRefundPolicyQuery();
  const { mutate, isPending, serverErrors } = useRefundPolicyMutation();

  return (
    <TermsAndConditionsEditor
      initialValue={data || { en: "", ar: "" }}
      onSave={(payload) => mutate(payload)}
      saving={isPending}
      loading={isLoading || isFetching}
      serverErrors={serverErrors}
      title="Refund Policy"
      subtitle="Manage bilingual refund policy content"
      enDescription="Write the English version of the Refund Policy below."
      arDescription="اكتب النسخة العربية من سياسة الاسترداد بالأسفل."
      enPlaceholder="No English refund policy yet."
      arPlaceholder="لا يوجد سياسة استرداد بالعربية بعد."
      enEditorPlaceholder="Write English refund policy..."
      arEditorPlaceholder="اكتب سياسة الاسترداد بالعربية..."
    />
  );
}
