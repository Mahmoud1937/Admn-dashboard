import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cardMissedSchema } from "../schema/cardMissedSchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";

const CardMissedCreateModal = ({ isOpen, onClose, onSave, isSaving, serverErrors }) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cardMissedSchema),
    defaultValues: { cardNumber: "", missingType: undefined },
  });

  useEffect(() => {
    if (isOpen) reset({ cardNumber: "", missingType: undefined });
  }, [isOpen, reset]);

  useEffect(() => {
    if (serverErrors) applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  if (!isOpen) return null;

  const submitHandler = (values) => {
    onSave({ cardNumber: values.cardNumber, missingType: Number(values.missingType) });
  };

  return (
    <FormModalShell
      title="Report Missed / Damaged Card"
      onClose={onClose}
      onSubmit={handleSubmit(submitHandler)}
      className="max-w-sm"
      formClassName="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={12}
          {...register("cardNumber")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="12-digit card number"
        />
        {errors.cardNumber && (
          <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type <span className="text-red-500">*</span>
        </label>
        <select
          {...register("missingType", { valueAsNumber: true })}
          defaultValue=""
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="" disabled>
            Select type
          </option>
          <option value={0}>Missed</option>
          <option value={1}>Damaged</option>
        </select>
        {errors.missingType && (
          <p className="text-red-500 text-sm mt-1">{errors.missingType.message}</p>
        )}
      </div>

      {serverErrors && Object.keys(errors).length === 0 && (
        <p className="text-red-500 text-sm">
          {typeof serverErrors === "string" ? serverErrors : "Something went wrong"}
        </p>
      )}

      <FormActions onCancel={onClose} isSaving={isSaving} submitLabel="Report" savingLabel="Saving..." />
    </FormModalShell>
  );
};

export default CardMissedCreateModal;