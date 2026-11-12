import localizeMessage from "../../../localization/localizeMessage";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
  const { t } = useTranslation("adminPages");
  const isEditMode = !!subscriptionType;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subscriptionTypeSchema),
    defaultValues: EMPTY_VALUES,
  });

  const descriptionEn = useWatch({ control, name: "descriptionEn" }) || "";
  const descriptionAr = useWatch({ control, name: "descriptionAr" }) || "";

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
      title={isEditMode ? t("Edit Subscription Type") : t("Add Subscription Type")}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      formClassName="max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar"
    >
      <TextField
        label={t("English Name")}
        required
        autoFocus
        {...register("nameEn")}
        error={localizeMessage(errors.nameEn?.message)}
      />

      <TextField
        label={t("Arabic Name")}
        required
        dir="rtl"
        {...register("nameAr")}
        error={localizeMessage(errors.nameAr?.message)}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <TextField
          label={t("Price Before")}
          required
          type="number"
          min="1"
          step="0.01"
          inputMode="decimal"
          {...register("priceBefore")}
          error={localizeMessage(errors.priceBefore?.message)}
        />

        <TextField
          label={t("Discount %")}
          required
          type="number"
          min="1"
          max="100"
          step="0.01"
          inputMode="decimal"
          {...register("discountPercentage")}
          error={localizeMessage(errors.discountPercentage?.message)}
        />
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700">
            {t("English Description")} <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] text-slate-400">
            {descriptionEn.length} / 500
          </span>
        </div>
        <textarea
          dir="ltr"
          {...register("descriptionEn")}
          maxLength={500}
          rows={5}
          className={`h-36 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-100 ${
            errors.descriptionEn ? "border-red-400" : "border-slate-200"
          }`}
        />
        {errors.descriptionEn && (
          <p className="mt-1 text-xs text-red-500">
            {localizeMessage(errors.descriptionEn.message)}
          </p>
        )}
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700">
            {t("Arabic Description")} <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] text-slate-400">
            {descriptionAr.length} / 500
          </span>
        </div>
        <textarea
          dir="rtl"
          {...register("descriptionAr")}
          maxLength={500}
          rows={5}
          className={`h-36 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-100 ${
            errors.descriptionAr ? "border-red-400" : "border-slate-200"
          }`}
        />
        {errors.descriptionAr && (
          <p className="mt-1 text-xs text-red-500">
            {localizeMessage(errors.descriptionAr.message)}
          </p>
        )}
      </div>

      <FormActions
        onCancel={onClose}
        isSaving={isSaving}
        submitLabel={isEditMode ? t("Save Changes") : t("Add Subscription Type")}
      />
    </FormModalShell>
  );
}
