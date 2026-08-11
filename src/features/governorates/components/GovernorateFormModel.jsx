import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import TextField from "../../../shared/components/TextField";
import { governorateSchema } from "../schema/governorateSchema";

export default function GovernorateFormModal({ isOpen, governorate, onSave, onClose, isSaving }) {
  const isEditMode = !!governorate;

  const {
    register,
    handleSubmit,
    reset,
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
      title={isEditMode ? "Edit Governorate" : "Add Governorate"}
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
        {...register("arName")}
        error={errors.arName?.message}
      />

      <FormActions
        onCancel={onClose}
        isSaving={isSaving}
        submitLabel={isEditMode ? "Save Changes" : "Add Governorate"}
      />
    </FormModalShell>
  );
}