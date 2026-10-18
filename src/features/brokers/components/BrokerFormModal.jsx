import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import TextField from "../../../shared/components/TextField";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import { brokerSchema } from "../schema/brokerSchema";

export default function BrokerFormModal({ isOpen, broker, onSave, onClose, isSaving, serverErrors }) {
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm({
    resolver: zodResolver(brokerSchema),
    defaultValues: { name: "", phoneNumber: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: broker?.name ?? "", phoneNumber: broker?.phoneNumber ?? "" });
    }
  }, [isOpen, broker, reset]);

  useEffect(() => {
    applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  if (!isOpen) return null;

  return (
    <FormModalShell
      title={broker ? "Edit Broker" : "Add Broker"}
      onClose={onClose}
      onSubmit={handleSubmit((values) => onSave({ id: broker?.id, ...values }))}
    >
      <TextField
        label="Name"
        required
        autoFocus
        error={errors.name?.message}
        {...register("name")}
      />
      <TextField
        label="Phone Number"
        required
        inputMode="numeric"
        maxLength={11}
        sanitize={false}
        error={errors.phoneNumber?.message}
        {...register("phoneNumber")}
      />
      <FormActions
        onCancel={onClose}
        isSaving={isSaving}
        submitLabel={broker ? "Save Changes" : "Add Broker"}
      />
    </FormModalShell>
  );
}
