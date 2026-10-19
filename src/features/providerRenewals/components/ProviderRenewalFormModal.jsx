import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "../../../shared/components/DateRangeFilterFields";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getApiErrorMessage } from "../../../shared/helpers/apiErrorHandler";
import { getBrokers } from "../../brokers/services/brokersService";
import { providerRenewalSchema, providerRenewalUpdateSchema } from "../schema/providerRenewalSchema";

export default function ProviderRenewalFormModal({ mutation, renewal = null, canSelectBroker = false, onClose }) {
  const isEditMode = Boolean(renewal);
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(isEditMode ? providerRenewalUpdateSchema : providerRenewalSchema),
    defaultValues: {
      startAt: renewal?.contractStartAt?.slice(0, 10) ?? "",
      endAt: renewal?.contractEndAt?.slice(0, 10) ?? "",
      brokerId: "",
    },
  });
  const startAt = useWatch({ control, name: "startAt" });
  const requestClose = () => {
    if (!mutation.isPending) onClose();
  };
  const onSubmit = (values) => {
    if (mutation.isPending) return;
    const payload = isEditMode
      ? { renewalId: renewal.id, startAt: values.startAt, endAt: values.endAt }
      : { ...values, brokerId: canSelectBroker ? values.brokerId : null };
    mutation.mutate(payload, {
      onSuccess: onClose,
    });
  };

  return (
    <FormModalShell title={isEditMode ? "Edit renewal" : "Create renewal"} onClose={requestClose} onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={mutation.isPending} className="min-w-0 space-y-4" aria-busy={mutation.isPending}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="renewal-start-at" className="mb-1.5 block text-sm font-medium text-slate-700">
              Start date <span className="text-red-500">*</span>
            </label>
            <Controller
              name="startAt"
              control={control}
              render={({ field }) => (
                <DatePicker id="renewal-start-at" value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.startAt && <p role="alert" className="mt-1 text-xs text-red-500">{errors.startAt.message}</p>}
          </div>
          <div>
            <label htmlFor="renewal-end-at" className="mb-1.5 block text-sm font-medium text-slate-700">
              End date <span className="text-red-500">*</span>
            </label>
            <Controller
              name="endAt"
              control={control}
              render={({ field }) => (
                <DatePicker id="renewal-end-at" value={field.value} minDate={startAt || undefined} onChange={field.onChange} />
              )}
            />
            {errors.endAt && <p role="alert" className="mt-1 text-xs text-red-500">{errors.endAt.message}</p>}
          </div>
        </div>

        {!isEditMode && canSelectBroker && (
          <div>
            <span id="renewal-broker-label" className="mb-1.5 block text-sm font-medium text-slate-700">Broker (optional)</span>
            <div role="group" aria-labelledby="renewal-broker-label">
              <Controller
                name="brokerId"
                control={control}
                render={({ field }) => (
                  <SearchableAsyncSelect
                    queryKey={["brokers", "renewal-lookup"]}
                    fetchItems={(pageNumber, pageSize, searchTerm) => getBrokers({ pageNumber, pageSize, searchTerm })}
                    value={field.value}
                    onChange={(id) => field.onChange(id)}
                    getOptionLabel={(broker) => broker.phoneNumber ? `${broker.name} - ${broker.phoneNumber}` : broker.name}
                    getOptionValue={(broker) => broker.id}
                    placeholder="Select broker (optional)"
                    searchPlaceholder="Search brokers..."
                    disabled={mutation.isPending}
                    error={errors.brokerId?.message}
                  />
                )}
              />
            </div>
            {errors.brokerId && <p role="alert" className="mt-1 text-xs text-red-500">{errors.brokerId.message}</p>}
          </div>
        )}

        {mutation.isError && (
          <p role="alert" className="text-sm text-red-600">
            {getApiErrorMessage(mutation.error, { details: true, fallback: "Unable to save renewal. Please try again." })}
          </p>
        )}
        <FormActions onCancel={requestClose} isSaving={mutation.isPending} submitLabel={isEditMode ? "Save changes" : "Create renewal"} />
      </fieldset>
    </FormModalShell>
  );
}
