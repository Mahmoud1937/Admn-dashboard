import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import FormActions from "../../../shared/components/FormActions";
import FormModalShell from "../../../shared/components/FormModalShell";
import TextField from "../../../shared/components/TextField";
import { subscriptionTypeSchema } from "../schema/subscriptionTypeSchema";

const EMPTY_VALUES = {
  nameEn: "",
  nameAr: "",
  priceBefore: "",
  discountPercentage: "",
  descriptionEn: "",
  descriptionAr: "",
};

export default function SubscriptionTypeFormModal({
  isOpen,
  subscriptionType,
  onSave,
  onClose,
  isSaving,
  serverErrors,
}) {
  const isEditMode = !!subscriptionType;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subscriptionTypeSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        nameEn: subscriptionType?.nameEn ?? "",
        nameAr: subscriptionType?.nameAr ?? "",
        priceBefore:
          subscriptionType?.priceBefore != null
            ? String(subscriptionType.priceBefore)
            : "",
        discountPercentage:
          subscriptionType?.discountPercentage != null
            ? String(subscriptionType.discountPercentage)
            : "",
        descriptionEn: subscriptionType?.descriptionEn ?? "",
        descriptionAr: subscriptionType?.descriptionAr ?? "",
      });
    }
  }, [isOpen, reset, subscriptionType]);

  useEffect(() => {
    applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onSave({
      id: subscriptionType?.id,
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      priceBefore: Number(data.priceBefore),
      discountPercentage: Number(data.discountPercentage),
      descriptionAr: data.descriptionAr,
      descriptionEn: data.descriptionEn,
    });
  };

  return (
    <FormModalShell
      title={isEditMode ? "Edit Subscription Type" : "Add Subscription Type"}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      formClassName="max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar"
    >
      <TextField
        label="English Name"
        required
        autoFocus
        {...register("nameEn")}
        error={errors.nameEn?.message}
      />

      <TextField
        label="Arabic Name"
        required
        dir="rtl"
        {...register("nameAr")}
        error={errors.nameAr?.message}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <TextField
          label="Price Before"
          required
          type="number"
          min="1"
          step="0.01"
          inputMode="decimal"
          {...register("priceBefore")}
          error={errors.priceBefore?.message}
        />

        <TextField
          label="Discount %"
          required
          type="number"
          min="1"
          max="100"
          step="0.01"
          inputMode="decimal"
          {...register("discountPercentage")}
          error={errors.discountPercentage?.message}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          English Description <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("descriptionEn")}
          rows={3}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400 ${
            errors.descriptionEn ? "border-red-400" : "border-slate-200"
          }`}
        />
        {errors.descriptionEn && (
          <p className="mt-1 text-xs text-red-500">
            {errors.descriptionEn.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Arabic Description <span className="text-red-500">*</span>
        </label>
        <textarea
          dir="rtl"
          {...register("descriptionAr")}
          rows={3}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400 ${
            errors.descriptionAr ? "border-red-400" : "border-slate-200"
          }`}
        />
        {errors.descriptionAr && (
          <p className="mt-1 text-xs text-red-500">
            {errors.descriptionAr.message}
          </p>
        )}
      </div>

      <FormActions
        onCancel={onClose}
        isSaving={isSaving}
        submitLabel={isEditMode ? "Save Changes" : "Add Subscription Type"}
      />
    </FormModalShell>
  );
}