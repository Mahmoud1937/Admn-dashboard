import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import { DatePicker } from "../../../shared/components/DateRangeFilterFields";

const optionalNumber = z.string().refine(
  (value) => value.trim() === "" || (Number.isFinite(Number(value)) && Number(value) >= 0),
  "Enter a valid non-negative number",
);

const dateFields = {
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
};

const validateDateRange = (schema) => schema.refine(
  ({ startDate, endDate }) => !startDate || !endDate || endDate >= startDate,
  { path: ["endDate"], message: "End date must be on or after the start date" },
);

const createSchema = validateDateRange(z.object({
  ...dateFields,
  priceIncreaseBy: optionalNumber,
  discountPercentage: optionalNumber,
  copy: z.boolean(),
}));

const updateSchema = validateDateRange(z.object(dateFields));

const defaultValues = {
  startDate: "",
  endDate: "",
  priceIncreaseBy: "",
  discountPercentage: "",
  copy: false,
};

const fieldClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

function Field({ id, label, error, children, required = false }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function PriceListFormModal({
  isOpen,
  priceList,
  providerId,
  hasPriceLists,
  onSave,
  onClose,
  isSaving,
  serverError,
}) {
  const isEditMode = Boolean(priceList);
  const { register, control, handleSubmit, reset, resetField, formState: { errors } } = useForm({
    resolver: zodResolver(isEditMode ? updateSchema : createSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) {
      reset(priceList ? {
        ...defaultValues,
        startDate: priceList.startAt?.slice(0, 10) ?? "",
        endDate: priceList.endAt?.slice(0, 10) ?? "",
      } : defaultValues);
    }
  }, [isOpen, priceList, reset]);

  const startDate = useWatch({ control, name: "startDate" });
  const copy = useWatch({ control, name: "copy" });
  const shouldCopyServices = !isEditMode && hasPriceLists && copy;

  useEffect(() => {
    if (!shouldCopyServices) {
      resetField("priceIncreaseBy");
      resetField("discountPercentage");
    }
  }, [shouldCopyServices, resetField]);

  if (!isOpen) return null;

  const onSubmit = (values) => {
    if (isEditMode) {
      onSave({ id: priceList.id, startDate: values.startDate, endDate: values.endDate });
      return;
    }

    onSave({
      providerId: Number(providerId),
      startDate: values.startDate,
      endDate: values.endDate,
      priceIncreaseBy: values.priceIncreaseBy.trim() || null,
      discountPercentage: values.discountPercentage.trim() || null,
      copy: hasPriceLists ? values.copy : null,
    });
  };

  return (
    <FormModalShell title={isEditMode ? "Edit Price List" : "Create Price List"} onClose={onClose} onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="price-list-start-date" label="Start date" required error={errors.startDate?.message}>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker id="price-list-start-date" value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>
          <Field id="price-list-end-date" label="End date" required error={errors.endDate?.message}>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DatePicker id="price-list-end-date" value={field.value} minDate={startDate || undefined} onChange={field.onChange} />
              )}
            />
          </Field>
          {shouldCopyServices && (
            <>
              <Field id="price-list-increase" label="Price increase by" error={errors.priceIncreaseBy?.message}>
                <input id="price-list-increase" type="number" min="0" step="any" inputMode="decimal" {...register("priceIncreaseBy")} className={fieldClassName} />
              </Field>
              <Field id="price-list-discount" label="Discount percentage" error={errors.discountPercentage?.message}>
                <input id="price-list-discount" type="number" min="0" step="any" inputMode="decimal" {...register("discountPercentage")} className={fieldClassName} />
              </Field>
            </>
          )}
        </div>

        {!isEditMode && hasPriceLists && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" {...register("copy")} className="h-4 w-4 rounded border-slate-300" />
            Copy services from the existing price list
          </label>
        )}

        {serverError && <p role="alert" className="text-sm text-red-600">{serverError}</p>}

        <FormActions onCancel={onClose} isSaving={isSaving} submitLabel={isEditMode ? "Save Changes" : "Create Price List"} />
      </div>
    </FormModalShell>
  );
}
