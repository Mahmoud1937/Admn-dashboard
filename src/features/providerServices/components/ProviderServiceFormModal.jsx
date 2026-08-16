import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProviderServiceSchema, updateProviderServiceSchema } from "../schema/providerServiceSchema";
import { useServicesLookup } from "../hooks/useServicesLookup";
import FormModalShell from "../../../shared/components/FormModalShell";
import TextField from "../../../shared/components/TextField";
import FormActions from "../../../shared/components/FormActions";




const EMPTY_VALUES = {
  serviceId: "",
  priceBefore: "",
  discountPercentage: "",
  isSpecialOffer: false,
  isActive: true,
};

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
}) {
  const isEditMode = !!providerService;
  const schema = isEditMode ? updateProviderServiceSchema : createProviderServiceSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (isOpen) {
      reset(providerServiceToFormValues(providerService));
    }
  }, [isOpen, providerService, reset]);

  const { services, isLoading: isServicesLoading } = useServicesLookup();

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
        <select
          {...register("serviceId")}
          disabled={isServicesLoading}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">
            {isServicesLoading ? "Loading services..." : "Select service"}
          </option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.enName}
            </option>
          ))}
        </select>
        {errors.serviceId && (
          <p className="mt-1 text-xs text-red-500">{errors.serviceId.message}</p>
        )}
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