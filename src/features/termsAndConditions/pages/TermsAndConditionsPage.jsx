import TermsAndConditionsEditor from "../components/Termsandconditionseditor";
import { useTermsAndConditionsMutation, useTermsAndConditionsQuery } from "../hooks/Usetermsandconditions";

export default function TermsAndConditionsPage() {
  const {
    data,
    isLoading,
    isFetching,
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
    <TermsAndConditionsEditor
      initialValue={
        data || {
          en: "",
          ar: "",
        }
      }
      onSave={handleSave}
      saving={isPending}
      loading={isLoading || isFetching}
      serverErrors={serverErrors}
    />
  );
}