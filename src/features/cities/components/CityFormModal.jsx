import localizeMessage from "../../../localization/localizeMessage";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import GovernorateSelect from "./GovernorateSelect";
import TextField from "../../../shared/components/TextField";
import { citySchema } from "../schema/citySchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";

export default function CityFormModal({
  isOpen,
  city,

  onSave,
  onClose,
  isSaving,
  serverErrors,
}) {
  const { t } = useTranslation("adminPages");
  const isEditMode = !!city;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(citySchema),
    defaultValues: { enName: "", arName: "", governorateId: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        enName: city?.enName ?? "",
        arName: city?.arName ?? "",
        governorateId: city?.governorateId ? String(city.governorateId) : "",
      });
    }
  }, [isOpen, city, reset]);

  useEffect(() => {
    applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onSave({
      id: city?.id,
      enName: data.enName,
      arName: data.arName,
      governorateId: Number(data.governorateId),
    });
  };

  return (
    <FormModalShell
      title={isEditMode ? t("Edit City") : t("Add City")}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
   
    >
      <TextField
        label={t("English Name")}
        required
        autoFocus
        {...register("enName")}
        error={localizeMessage(errors.enName?.message)}
      />

      <TextField
        label={t("Arabic Name")}
        required
        {...register("arName")}
        error={localizeMessage(errors.arName?.message)}
      />

      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {t("Governorate")} <span className="text-red-500">*</span>
        </label>
        <Controller
          name="governorateId"
          control={control}
          render={({ field }) => (
            <GovernorateSelect
           
              value={field.value}
              onChange={field.onChange}
              placeholder={t("Select governorate")}
              showArName
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          )}
        />
        {errors.governorateId && (
          <p className="mt-1 text-xs text-red-500">{localizeMessage(errors.governorateId.message)}</p>
        )}
      </div>

      <FormActions
        onCancel={onClose}
        isSaving={isSaving}
        submitLabel={isEditMode ? t("Save Changes") : t("Add City")}
      />
    </FormModalShell>
  );
}