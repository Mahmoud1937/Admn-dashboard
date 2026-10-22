import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import ImageUploadField from "../../../shared/components/ImageUploadField";
import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import TextField from "../../../shared/components/TextField";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import { getProviderPackageCategories, getProviderPackageServices } from "../services/providerPackagesService";
import {
  createProviderPackageSchema,
  defaultProviderPackageValues,
  updateProviderPackageSchema,
} from "../schema/providerPackageSchema";

const textareaClassName =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400";

function PackageImageField({ file, label, onChange, error }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!(file instanceof File)) return undefined;
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <ImageUploadField
      label={label}
      alt={label}
      preview={file instanceof File ? preview : file || null}
      onImageChange={(event) => onChange(event.target.files?.[0] ?? null)}
      error={error}
    />
  );
}

const getUpdateValues = (providerPackage) => {
  const before = Number(providerPackage.priceBefore);
  const after = Number(providerPackage.priceAfter);
  const backendDiscount = providerPackage.totalDiscount;
  const percentage =
    backendDiscount != null && Number.isFinite(Number(backendDiscount))
      ? Number(backendDiscount)
      : before > 0 && Number.isFinite(after)
        ? Number(((((before - after) / before) * 100).toFixed(2)))
        : 0;

  return {
    nameAr: providerPackage.packageArName || "",
    nameEn: providerPackage.packageEnName || "",
    descriptionAr: providerPackage.descriptionAr || "",
    descriptionEn: providerPackage.descriptionEn || "",
    priceBefore: String(providerPackage.priceBefore ?? ""),
    discountPercentage: String(percentage),
    imageAr: providerPackage.imageAr || null,
    imageEn: providerPackage.imageEn || null,
    serviceIds: (providerPackage.services ?? []).map((service) => ({
      id: service.serviceId,
      label: service.serviceEnName || service.serviceArName || String(service.serviceId),
    })),
  };
};

/**
 * variant="modal"  -> centered modal (used for "Add package")
 * variant="drawer" -> renders only the <form> (body + footer) so it can live
 *                     inside a side drawer shell (used for "Edit package")
 */
export default function ProviderPackageFormModal({
  providerId,
  providerPackage,
  onSave,
  onClose,
  isSaving,
  serverErrors,
  variant = "modal",
}) {
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(providerPackage ? updateProviderPackageSchema : createProviderPackageSchema),
    defaultValues: providerPackage ? getUpdateValues(providerPackage) : defaultProviderPackageValues,
    mode: "onChange",
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const categoryId = selectedCategory?.providerId === providerId ? selectedCategory?.id ?? "" : "";

  useEffect(() => {
    applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  const discountField = register("discountPercentage");

  const submit = (values) => {
    onSave({
      ...(providerPackage ? { packageId: providerPackage.packageId } : {}),
      providerId: Number(providerId),
      nameAr: values.nameAr,
      nameEn: values.nameEn,
      imageAr: values.imageAr,
      imageEn: values.imageEn,
      descriptionAr: values.descriptionAr,
      descriptionEn: values.descriptionEn,
      priceBefore: Number(values.priceBefore),
      discountPercentage: Number(values.discountPercentage),
      serviceIds: values.serviceIds.map((service) => service.id),
    });
  };

  const fields = (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Arabic name"
          required
          dir="rtl"
          error={errors.nameAr?.message}
          {...register("nameAr")}
        />
        <TextField
          label="English name"
          required
          error={errors.nameEn?.message}
          {...register("nameEn")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Arabic description <span className="text-red-500">*</span>
          </label>
          <textarea
            dir="rtl"
            rows={3}
            className={textareaClassName}
            {...register("descriptionAr")}
          />
          {errors.descriptionAr && (
            <p className="mt-1 text-xs text-red-500">{errors.descriptionAr.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            English description <span className="text-red-500">*</span>
          </label>
          <textarea rows={3} className={textareaClassName} {...register("descriptionEn")} />
          {errors.descriptionEn && (
            <p className="mt-1 text-xs text-red-500">{errors.descriptionEn.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="imageAr"
          control={control}
          render={({ field }) => (
            <PackageImageField
              file={field.value}
              label={providerPackage ? "Change Arabic image" : "Upload Arabic image *"}
              onChange={field.onChange}
              error={errors.imageAr?.message}
            />
          )}
        />
        <Controller
          name="imageEn"
          control={control}
          render={({ field }) => (
            <PackageImageField
              file={field.value}
              label={providerPackage ? "Change English image" : "Upload English image *"}
              onChange={field.onChange}
              error={errors.imageEn?.message}
            />
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Price Before"
          required
          inputMode="decimal"
          sanitize={false}
          error={errors.priceBefore?.message}
          {...register("priceBefore")}
        />
        <TextField
          label="Discount %"
          required
          inputMode="decimal"
          sanitize={false}
          error={errors.discountPercentage?.message}
          {...discountField}
          onChange={(event) => {
            if (Number(event.target.value) > 100) {
              event.target.value = getValues("discountPercentage");
            }
            discountField.onChange(event);
          }}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Service category <span className="text-red-500">*</span>
        </label>
        <SearchableAsyncSelect
          key={providerId}
          queryKey={["provider-package-categories", providerId]}
          fetchItems={(pageNumber, pageSize, search) =>
            getProviderPackageCategories({ providerId, pageNumber, pageSize, search })
          }
          value={categoryId}
          onChange={(id) => {
            if (!isSaving) setSelectedCategory({ providerId, id });
          }}
          getOptionLabel={(category) => category.name}
          placeholder="Select a service category"
          searchPlaceholder="Search provider categories..."
          disabled={isSaving || !providerId}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Services <span className="text-red-500">*</span>
        </label>
        <Controller
          name="serviceIds"
          control={control}
          render={({ field }) => (
            <>
              <SearchableAsyncSelect
                key={`${providerId}-${categoryId}-${field.value.length}`}
                queryKey={["provider-package-services", providerId, categoryId]}
                fetchItems={(pageNumber, pageSize, searchTerm) =>
                  getProviderPackageServices({
                    providerId,
                    categoryId,
                    pageNumber,
                    pageSize,
                    search: searchTerm,
                  })
                }
                value=""
                onChange={(id, service) => {
                  if (isSaving || !categoryId || !service || field.value.some((item) => item.id === Number(id))) return;
                  field.onChange([
                    ...field.value,
                    {
                      id: Number(id),
                      label: service.serviceNameEn || service.serviceNameAr || service.serviceName || String(id),
                    },
                  ]);
                }}
                getOptionValue={(service) => service.id}
                getOptionLabel={(service) =>
                  [service.serviceNameEn, service.serviceNameAr].filter(Boolean).join(" - ") || service.serviceName || String(service.id)
                }
                placeholder={categoryId ? "Select services" : "Choose a category first"}
                searchPlaceholder="Search provider services..."
                disabled={isSaving || !providerId || !categoryId}
                clearable={false}
                error={errors.serviceIds?.message}
              />
              {field.value.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {field.value.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => field.onChange(field.value.filter((item) => item.id !== service.id))}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100"
                      aria-label={`Remove ${service.label}`}
                    >
                      {service.label} ×
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        />
      </div>
    </>
  );

  const actions = (
    <FormActions
      onCancel={onClose}
      isSaving={isSaving}
      submitLabel={providerPackage ? "Save Changes" : "Add Package"}
    />
  );

  if (variant === "drawer") {
    return (
      <form
        onSubmit={handleSubmit(submit)}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          {fields}
        </div>
        <div className="shrink-0 border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6">
          {actions}
        </div>
      </form>
    );
  }

  return (
    <FormModalShell
      title={providerPackage ? "Edit Package" : "Add Package"}
      onClose={onClose}
      onSubmit={handleSubmit(submit)}
      className="max-h-[90vh] max-w-3xl overflow-y-auto"
      formClassName="space-y-4"
    >
      {fields}
      {actions}
    </FormModalShell>
  );
}
