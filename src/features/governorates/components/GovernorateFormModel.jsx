import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import TextField from "../../../shared/components/TextField";
import { governorateSchema } from "../schema/governorateSchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";

export default function GovernorateFormModal({
  isOpen,
  governorate,
  onSave,
  onClose,
  isSaving,
  serverErrors,
}) {
  const { t } = useTranslation("adminPages");
  const isEditMode = !!governorate;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(governorateSchema),
    defaultValues: { enName: "", arName: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        enName: governorate?.enName ?? "",
        arName: governorate?.arName ?? "",
      });
    }
  }, [isOpen, governorate, reset]);

  useEffect(() => {
    applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onSave({
      id: governorate?.id,
      enName: data.enName,
      arName: data.arName,
    });
  };

  return (
    <FormModalShell
      title={isEditMode ? t("Edit Governorate") : t("Add Governorate")}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextField
        label={t("English Name")}
        required
        autoFocus
        {...register("enName")}
        error={errors.enName?.message}
      />

      <TextField
        label={t("Arabic Name")}
        required
        {...register("arName")}
        error={errors.arName?.message}
      />

      <FormActions
        onCancel={onClose}
        isSaving={isSaving}
        submitLabel={isEditMode ? t("Save Changes") : t("Add Governorate")}
      />
    </FormModalShell>
  );
}