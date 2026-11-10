import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema } from "../schema/serviceSchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import FormModalShell from "../../../shared/components/FormModalShell";
import CategorySelect from "./CategorySelect";
import TextField from "../../../shared/components/TextField";
import FormActions from "../../../shared/components/FormActions";
import useServicesAdminText from "../../../localization/useServicesAdminText";
import useLanguage from "../../../localization/useLanguage";


export default function ServiceFormModal({ isOpen, service, onSave, onClose, isSaving, serverErrors }) {
  const t = useServicesAdminText();
  const { language, direction } = useLanguage();
  const rtl = direction === "rtl";
  const fieldError = (error) => error?.message ? (error.type === "server" ? error.message : t(error.message)) : undefined;
  const isEditMode = !!service;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      enName: "",
      arName: "",
      categoryId: "",
      cpt: "",
      serviceInstruction: "",

    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        enName: service?.enName ?? "",
        arName: service?.arName ?? "",
        categoryId: service?.categoryId ? String(service.categoryId) : "",
        cpt: service?.cpt ?? "",
        serviceInstruction: service?.serviceInstruction ?? "",

      });
    }
  }, [isOpen, service, reset]);

  useEffect(() => {
    applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onSave({
      id: service?.id,
      categoryId: Number(data.categoryId),
      arName: data.arName,
      enName: data.enName,
      cpt: data.cpt?.trim() || null,
      serviceInstruction: data.serviceInstruction?.trim() || null,

    });
  };

  return (
    <FormModalShell
      title={t(isEditMode ? "Edit Service" : "Add Service")}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      formClassName="scroll-form"
      closeLabel={t("Close")}
    >
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {t("Category")} <span className="text-red-500">*</span>
        </label>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <CategorySelect
              key={language}
              localized
              value={field.value}
              onChange={field.onChange}
              placeholder={t("Select category")}
              error={fieldError(errors.categoryId)}
            />
          )}
        />
      </div>

      <TextField
        label={t("English Name")}
        required
        autoFocus
        {...register("enName")}
        error={fieldError(errors.enName)}
      />

      <TextField
        label={t("Arabic Name")}
        required
        dir="rtl"
        style={{ textAlign: "right" }}
        {...register("arName")}
        error={fieldError(errors.arName)}
      />

      <TextField
        label={t("CPT Code")}

        {...register("cpt")}
        error={fieldError(errors.cpt)}
      />

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {t("Service Instructions")}
        </label>
        <textarea
          {...register("serviceInstruction")}
          rows={3}
          dir={rtl ? "rtl" : "ltr"}
          style={rtl ? { direction: "rtl", textAlign: "right" } : undefined}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        {errors.serviceInstruction && (
          <p className="mt-1 text-xs text-red-500">{fieldError(errors.serviceInstruction)}</p>
        )}
      </div>

      <FormActions
        onCancel={onClose}
        isSaving={isSaving}
        submitLabel={t(isEditMode ? "Save Changes" : "Add Service")}
        savingLabel={t("Saving...")}
        cancelLabel={t("Cancel")}
      />
    </FormModalShell>
  );
}
