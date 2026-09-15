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
      title={isEditMode ? "Edit Ticket Type" : "Add Ticket Type"}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextField
        label="English Name"
        required
        autoFocus
        {...register("enName")}
        error={errors.enName?.message}
      />

      <TextField
        label="Arabic Name"
        required
        dir="rtl"
        {...register("arName")}
        error={errors.arName?.message}
      />

      <FormActions
        onCancel={onClose}
        isSaving={isSaving}
        submitLabel={isEditMode ? "Save Changes" : "Add Ticket Type"}
      />
    </FormModalShell>
  );
}
