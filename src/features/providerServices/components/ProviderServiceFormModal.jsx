import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProviderServiceSchema, updateProviderServiceSchema } from "../schema/providerServiceSchema";
import FormModalShell from "../../../shared/components/FormModalShell";
import TextField from "../../../shared/components/TextField";
import FormActions from "../../../shared/components/FormActions";
import ServiceSelect from "./ServiceSelect";



const EMPTY_VALUES = {
  serviceId: "",
  priceBefore: "",
  discountPercentage: "",
  isSpecialOffer: false,
  isActive: true,
};

// Backend returns PascalCase field names (ASP.NET ModelState style, e.g.
// "ServiceId"). Map them to the camelCase field names used by the form.
const SERVER_FIELD_NAME_MAP = {
  ServiceId: "serviceId",
  PriceBefore: "priceBefore",
  DiscountPercentage: "discountPercentage",
};

function toFormFieldName(serverFieldName) {
  return (
    SERVER_FIELD_NAME_MAP[serverFieldName] ||
    serverFieldName.charAt(0).toLowerCase() + serverFieldName.slice(1)
  );
}

function providerServiceToFormValues(providerService) {
  if (!providerService) return EMPTY_VALUES;
  return {
    serviceId: providerService.serviceId ? String(providerService.serviceId) : "",
    priceBefore:
      providerService.priceBefore != null ? String(providerService.priceBefore) : "",
    discountPercentage:
      providerService.discountPercentage != null
        ? String(providerService.discountPercentage)
        : "",
    isSpecialOffer: providerService.isSpecialOffer ?? false,
    isActive: providerService.isActive ?? true,
  };
}

export default function ProviderServiceFormModal({
  isOpen,
  providerService,
  providerId,
  onSave,
  onClose,
  isSaving,
  serverErrors,
  onClearErrors,
}) {
  const isEditMode = !!providerService;
  const schema = isEditMode ? updateProviderServiceSchema : createProviderServiceSchema;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen) {
      reset(providerServiceToFormValues(providerService));
      onClearErrors?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, providerService, reset]);

  // Map backend validation errors (PascalCase field -> [errorCode]) onto the
  // matching form fields. Shown as-is, no client-side translation.
  useEffect(() => {
    if (!serverErrors) return;

    Object.entries(serverErrors).forEach(([field, messages]) => {
      const fieldName = toFormFieldName(field);
      const rawMessage = Array.isArray(messages) ? messages[0] : messages;
      setError(fieldName, {
        type: "server",
        message: rawMessage,
      });
    });
  }, [serverErrors, setError]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onSave({
      id: providerService?.id,
      providerId: Number(providerId),
      serviceId: Number(data.serviceId),
      priceBefore: Number(data.priceBefore),
      discountPercentage: data.discountPercentage ? Number(data.discountPercentage) : 0,
      isSpecialOffer: data.isSpecialOffer,
      isActive: data.isActive,
    });
  };

  return (
    <FormModalShell
      title={isEditMode ? "Edit Service" : "Add Service"}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Service <span className="text-red-500">*</span>
        </label>
        <Controller
          name="serviceId"
          control={control}
          render={({ field }) => (
            <ServiceSelect
              value={field.value}
              onChange={(val) =>
                field.onChange(val != null && val !== "" ? String(val) : "")
              }
              error={errors.serviceId?.message}
            />
          )}
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <TextField
            label="Price Before"
            required
            inputMode="decimal"
            {...register("priceBefore")}
          />
          {errors.priceBefore && (
            <p className="mt-1 text-xs text-red-500">{errors.priceBefore.message}</p>
          )}
        </div>
        <div>
          <TextField
            label="Discount %"
            required
            inputMode="decimal"
            {...register("discountPercentage")}
          />
          {errors.discountPercentage && (
            <p className="mt-1 text-xs text-red-500">{errors.discountPercentage.message}</p>
          )}
        </div>
      </div>

      {/* priceAfter is computed by the backend from priceBefore + discountPercentage
          (confirmed from the API response) — intentionally not an input here. */}

      <label className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          {...register("isSpecialOffer")}
          className="h-4 w-4 rounded border-slate-300"
        />
        Special Offer
      </label>

      {isEditMode && (
        <label className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            {...register("isActive")}
            className="h-4 w-4 rounded border-slate-300"
          />
          Active
        </label>
      )}

      <FormActions
        onCancel={onClose}
        isSaving={isSaving}
        submitLabel={isEditMode ? "Save Changes" : "Add Service"}
      />
    </FormModalShell>
  );
}