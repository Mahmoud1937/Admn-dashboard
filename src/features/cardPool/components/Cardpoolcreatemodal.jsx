import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cardPoolSchema } from "../schema/cardPoolSchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";

const CardPoolCreateModal = ({ isOpen, onClose, onSave, isSaving, serverErrors }) => {
 const {
  register,
  handleSubmit,
  reset,
  setError,
  formState: { errors },
} = useForm({
  resolver: zodResolver(cardPoolSchema),
  defaultValues: {
    count: "",
  },
});

useEffect(() => {
  if (isOpen) {
    reset({ count: "" });
  }
}, [isOpen, reset]);

  useEffect(() => {
    if (serverErrors) applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  if (!isOpen) return null;

  const submitHandler = (values) => {
    onSave({ count: Number(values.count) });
  };

  return (
    <FormModalShell
      title="Create Card Pool"
      onClose={onClose}
      onSubmit={handleSubmit(submitHandler)}
      className="max-w-sm"
      formClassName="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number of Cards <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
   
  
          {...register("count", { valueAsNumber: true ,    onChange: (e) => {
      const value = Number(e.target.value);

      if (value > 10000) {
        e.target.value = "10000";
      }
    }, })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="1 - 10,000"
        />
        {errors.count && (
          <p className="text-red-500 text-sm mt-1">{errors.count.message}</p>
        )}
      </div>

      {serverErrors && Object.keys(errors).length === 0 && (
        <p className="text-red-500 text-sm">
          {typeof serverErrors === "string" ? serverErrors : "Something went wrong"}
        </p>
      )}

      <FormActions onCancel={onClose} isSaving={isSaving} submitLabel="Create" savingLabel="Creating..." />
    </FormModalShell>
  );
};

export default CardPoolCreateModal;