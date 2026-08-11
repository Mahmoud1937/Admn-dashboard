import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import TextField from "../../../shared/components/TextField";
import { specialistSchema } from "../schema/specialistSchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";

export default function SpecialistFormModal({ isOpen, specialist, onSave, onClose, isSaving, serverErrors }) {
  const isEditMode = !!specialist;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(specialistSchema),
    defaultValues: {
      enName: "",
      arName: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        enName: specialist?.enName ?? "",
        arName: specialist?.arName ?? "",
      });
    }
  }, [isOpen, specialist, reset]);

  useEffect(() => {
    applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onSave({
      id: specialist?.id,
      enName: data.enName,
      arName: data.arName,
    });
  };

  return (
    <FormModalShell
      title={isEditMode ? "Edit Specialist" : "Add Specialist"}
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
        submitLabel={isEditMode ? "Save Changes" : "Add Specialist"}
      />
    </FormModalShell>
  );
}