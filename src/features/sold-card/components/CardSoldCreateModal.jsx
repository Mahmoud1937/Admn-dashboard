import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faXmark, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cardSoldSchema } from "../schema/cardSoldSchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";

const defaultValues = (mode) => ({
  mode,

  count: undefined,
  cardNumbers: [{ value: "" }],
  clientName: "",
  clientPhone: "",
  proofPayment: undefined,
});

const CardSoldCreateModal = ({ isOpen, onClose, onSave, isSaving, serverErrors }) => {
  const [mode, setMode] = useState("count");

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cardSoldSchema),
    defaultValues: defaultValues("count"),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "cardNumbers",
  });

  const proofPayment = watch("proofPayment");

  useEffect(() => {
    if (isOpen) {
      setMode("count");
      reset(defaultValues("count"));
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (serverErrors) applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  const switchMode = (newMode) => {
    setMode(newMode);
    reset(defaultValues(newMode));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Sell Cards</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon={faXmark} size="lg" />
          </button>
        </div>

        <div className="mb-4 flex rounded-lg border border-gray-200 p-1 text-sm">
          <button
            type="button"
            onClick={() => switchMode("count")}
            className={`flex-1 rounded-md py-1.5 ${mode === "count" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
          >
            By Count
          </button>
          <button
            type="button"
            onClick={() => switchMode("numbers")}
            className={`flex-1 rounded-md py-1.5 ${mode === "numbers" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
          >
            By Card Numbers
          </button>
        </div>

        <form onSubmit={handleSubmit(submitHandler)} noValidate className="space-y-4">
          <input type="hidden" {...register("mode")} value={mode} />

          {mode === "count" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Count <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  {...register("count", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1 - 10,000"
                />
                {errors.count && (
                  <p className="text-red-500 text-sm mt-1">{errors.count.message}</p>
                )}
              </div>
            </>
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
            <label className="block text-sm font-medium text-gray-700 mb-1  ">
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
            <label className="block text-sm font-medium text-gray-700 mb-1 ">
              Proof of Payment <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setValue("proofPayment", e.target.files?.[0], { shouldValidate: true })}
              className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:text-blue-700 hover:file:bg-blue-100"
            />
            {proofPayment && (
              <p className="mt-1 text-xs text-gray-500 ">{proofPayment.name}</p>
            )}
            {errors.proofPayment && (
              <p className="text-red-500 text-sm mt-1 ">{errors.proofPayment.message}</p>
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
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Saving..." : "Sell"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardSoldCreateModal;