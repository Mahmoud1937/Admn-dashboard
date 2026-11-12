import localizeMessage from "../../../localization/localizeMessage";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormActions from "../../../shared/components/FormActions";
import FormModalShell from "../../../shared/components/FormModalShell";
import TextField from "../../../shared/components/TextField";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import { ticketTypeSchema } from "../schema/ticketTypeSchema";

export default function TicketTypeFormModal({
  isOpen,
  ticketType,
  onSave,
  onClose,
  isSaving,
  serverErrors,
}) {
  const { t } = useTranslation("adminPages");
  const isEditMode = !!ticketType;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ticketTypeSchema),
    defaultValues: {
      enName: "",
      arName: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        enName: ticketType?.enName ?? "",
        arName: ticketType?.arName ?? "",
      });
    }
  }, [isOpen, reset, ticketType]);

  useEffect(() => {
    applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onSave({
      id: ticketType?.id,
      arName: data.arName,
      enName: data.enName,
    });
  };

  return (
    <FormModalShell
      title={isEditMode ? t("Edit Ticket Type") : t("Add Ticket Type")}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextField
        label={t("English Name")}
        required
        autoFocus
        {...register("enName")}
        error={localizeMessage(errors.enName?.message)}
      />

      <TextField
        label={t("Arabic Name")}
        required
        dir="rtl"
        {...register("arName")}
        error={localizeMessage(errors.arName?.message)}
      />

      <FormActions
        onCancel={onClose}
        isSaving={isSaving}
        submitLabel={isEditMode ? t("Save Changes") : t("Add Ticket Type")}
      />
    </FormModalShell>
  );
}
