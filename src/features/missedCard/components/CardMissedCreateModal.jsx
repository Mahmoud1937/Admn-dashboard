import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cardMissedSchema } from "../schema/cardMissedSchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Report Missed / Damaged Card</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon={faXmark} size="lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submitHandler)} noValidate className="space-y-4">
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

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardMissedCreateModal;