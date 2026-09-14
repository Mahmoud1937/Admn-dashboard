import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cardSoldSchema } from "../schema/cardSoldSchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import ImageUploadField from "../../../shared/components/ImageUploadField";

const defaultValues = (mode) => ({
  mode,
  count: "",
  cardNumbers: [{ value: "" }],
  clientName: "",
  clientPhone: "",
  proofPayment: undefined,
});

const CardSoldCreateModal = ({ isOpen, onClose, onSave, isSaving, serverErrors, clearServerErrors }) => {
  const [mode, setMode] = useState("count");

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cardSoldSchema),
    defaultValues: defaultValues("count"),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "cardNumbers",
  });

  const [proofPreview, setProofPreview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode("count");
      setProofPreview(null);
      reset(defaultValues("count"));
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (serverErrors) applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setProofPreview(null);
    reset(defaultValues(newMode));
    clearServerErrors?.();
  };

  const handleProofChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (proofPreview) URL.revokeObjectURL(proofPreview);
    setProofPreview(URL.createObjectURL(file));
    setValue("proofPayment", file, { shouldValidate: true });
    clearServerErrors?.();
  };

  if (!isOpen) return null;

  const submitHandler = (values) => {
    if (values.mode === "count") {
      onSave({
        type: "count",
        payload: {
          count: Number(values.count),
          clientName: values.clientName,
          clientPhone: values.clientPhone,
          proofPayment: values.proofPayment,
        },
      });
    } else {
      onSave({
        type: "numbers",
        payload: {
          cardNumbers: values.cardNumbers.map((c) => c.value.trim()).filter(Boolean),
          clientName: values.clientName,
          clientPhone: values.clientPhone,
          proofPayment: values.proofPayment,
        },
      });
    }
  };

  return (
    <FormModalShell
      title="Sell Cards"
      onClose={onClose}
      onSubmit={handleSubmit(submitHandler)}
      className="max-w-md"
      formClassName="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
    >
<div className="mb-4 flex rounded-lg border border-gray-200 p-1 text-sm">
  <button
    type="button"
    onClick={() => switchMode("count")}
    className={`flex-1 rounded-md py-1.5 ${mode === "count" ? "bg-blue-900 text-white" : "text-gray-500 hover:bg-gray-50"
      }`}
  >
    By Count
  </button>
  <button
    type="button"
    onClick={() => switchMode("numbers")}
    className={`flex-1 rounded-md py-1.5 ${mode === "numbers" ? "bg-blue-900 text-white" : "text-gray-500 hover:bg-gray-50"
      }`}
  >
    By Card Numbers
  </button>
</div>

      <input type="hidden" {...register("mode")} value={mode} />

      {mode === "count" ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Count <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
        
         
            {...register("count", { valueAsNumber: true ,    onChange: (e) => {
      const value = Number(e.target.value);

      if (value > 10000) {
        e.target.value = "10000";
      }
    },})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1 - 10,000"
          />




          {errors.count && (
            <p className="text-red-500 text-sm mt-1">{errors.count.message}</p>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Numbers <span className="text-red-500">*</span>
          </label>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  {...register(`cardNumbers.${index}.value`)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Card number ${index + 1} (12 digits)`}
                />
                <button
                  type="button"
                  onClick={() => fields.length > 1 && remove(index)}
                  disabled={fields.length === 1}
                  className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed px-2"
                  title="Remove"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => append({ value: "" })}
            className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Card Number
          </button>

          {errors.cardNumbers?.message && (
            <p className="text-red-500 text-sm mt-1">{errors.cardNumbers.message}</p>
          )}
          {Array.isArray(errors.cardNumbers) &&
            errors.cardNumbers.map(
              (e, i) =>
                e?.value && (
                  <p key={i} className="text-red-500 text-sm mt-1">
                    Card number {i + 1}: {e.value.message}
                  </p>
                )
            )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Client Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("clientName")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Client name"
        />
        {errors.clientName && (
          <p className="text-red-500 text-sm mt-1">{errors.clientName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Client Phone <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("clientPhone")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="01xxxxxxxxx"
        />
        {errors.clientPhone && (
          <p className="text-red-500 text-sm mt-1">{errors.clientPhone.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Proof of Payment <span className="text-red-500">*</span>
        </label>
        <ImageUploadField
          preview={proofPreview}
          onImageChange={handleProofChange}
          label="Upload Proof of Payment"
          alt="Proof of payment"
          error={errors.proofPayment?.message}
          disabled={isSaving}
        />
      </div>

      {serverErrors && Object.keys(errors).length === 0 && (
        <p className="text-red-500 text-sm">
          {typeof serverErrors === "string" ? serverErrors : "Something went wrong"}
        </p>
      )}

      <FormActions onCancel={onClose} isSaving={isSaving} submitLabel="Sell" savingLabel="Saving..." />
    </FormModalShell>
  );
};

export default CardSoldCreateModal;
