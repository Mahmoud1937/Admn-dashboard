import TermsAndConditionsEditor from "../../termsAndConditions/components/Termsandconditionseditor";
import { usePrivacyPolicyMutation, usePrivacyPolicyQuery } from "../hooks/usePrivacyPolicy";

export default function PrivacyPolicyPage() {
  const { data, isLoading, isFetching } = usePrivacyPolicyQuery();
  const { mutate, isPending, serverErrors } = usePrivacyPolicyMutation();

  return (
    <TermsAndConditionsEditor
      initialValue={data || { en: "", ar: "" }}
      onSave={(payload) => mutate(payload)}
      saving={isPending}
      loading={isLoading || isFetching}
      serverErrors={serverErrors}
      title="Privacy Policy"
      subtitle="Manage bilingual privacy policy content"
      enDescription="Write the English version of the Privacy Policy below."
      arDescription="اكتب النسخة العربية من سياسة الخصوصية بالأسفل."
      enPlaceholder="No English privacy policy yet."
      arPlaceholder="لا يوجد سياسة خصوصية بالعربية بعد."
      enEditorPlaceholder="Write English privacy policy..."
      arEditorPlaceholder="اكتب سياسة الخصوصية بالعربية..."
    />
  );
}
