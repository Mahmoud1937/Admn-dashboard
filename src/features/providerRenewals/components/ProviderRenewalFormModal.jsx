import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "../../../shared/components/DateRangeFilterFields";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getApiErrorMessage } from "../../../shared/helpers/apiErrorHandler";
import { getBrokers } from "../../brokers/services/brokersService";
import { providerRenewalSchema, providerRenewalUpdateSchema } from "../schema/providerRenewalSchema";
import useProviderDetailsText from "../../../localization/useProviderDetailsText";
import useLanguage from "../../../localization/useLanguage";
import { useTranslation } from "react-i18next";

export default function ProviderRenewalFormModal({ mutation, renewal = null, canSelectBroker = false, onClose }) {
  const tr = useProviderDetailsText();
  const { language } = useLanguage();
  const { t: providerT } = useTranslation("providers");
  const dateLabels = { locale: language, weekdayLabels: providerT("weekdays", { returnObjects: true }), previousMonthLabel: tr("Previous month"), nextMonthLabel: tr("Next month"), toggleCalendarLabel: tr("Toggle calendar") };
  const fieldError = (error) => error?.type === "server" ? error.message : error?.message ? tr(error.message) : undefined;
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
    <FormModalShell title={tr(isEditMode ? "Edit renewal" : "Create renewal")} closeLabel={tr("Close")} onClose={requestClose} onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={mutation.isPending} className="min-w-0 space-y-4" aria-busy={mutation.isPending}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="renewal-start-at" className="mb-1.5 block text-sm font-medium text-slate-700">
              {tr("Start date")} <span className="text-red-500">*</span>
            </label>
            <Controller
              name="startAt"
              control={control}
              render={({ field }) => (
                <DatePicker id="renewal-start-at" value={field.value} onChange={field.onChange} {...dateLabels} />
              )}
            />
            {errors.startAt && <p role="alert" className="mt-1 text-xs text-red-500">{fieldError(errors.startAt)}</p>}
          </div>
          <div>
            <label htmlFor="renewal-end-at" className="mb-1.5 block text-sm font-medium text-slate-700">
              {tr("End date")} <span className="text-red-500">*</span>
            </label>
            <Controller
              name="endAt"
              control={control}
              render={({ field }) => (
                <DatePicker id="renewal-end-at" value={field.value} minDate={startAt || undefined} onChange={field.onChange} {...dateLabels} />
              )}
            />
            {errors.endAt && <p role="alert" className="mt-1 text-xs text-red-500">{fieldError(errors.endAt)}</p>}
          </div>
        </div>

        {!isEditMode && canSelectBroker && (
          <div>
            <span id="renewal-broker-label" className="mb-1.5 block text-sm font-medium text-slate-700">{tr("Broker (optional)")}</span>
            <div role="group" aria-labelledby="renewal-broker-label">
              <Controller
                name="brokerId"
                control={control}
                render={({ field }) => (
                  <SearchableAsyncSelect
                    key={language}
                    queryKey={["brokers", "renewal-lookup", language]}
                    fetchItems={(pageNumber, pageSize, searchTerm) => getBrokers({ pageNumber, pageSize, searchTerm })}
                    value={field.value}
                    onChange={(id) => field.onChange(id)}
                    getOptionLabel={(broker) => broker.phoneNumber ? `${broker.name} - ${broker.phoneNumber}` : broker.name}
                    getOptionValue={(broker) => broker.id}
                    placeholder={tr("Select broker (optional)")}
                    searchPlaceholder={tr("Search brokers...")}
                    labels={{ clearSelection: tr("Clear selection"), openOptions: tr("Open options"), closeOptions: tr("Close options"), loading: tr("Loading..."), loadingMore: tr("Loading more..."), unableToLoadOptions: tr("Unable to load options."), noResults: tr("No results found."), tryAgain: tr("Try again") }}
                    rtl={language === "ar"}
                    disabled={mutation.isPending}
                    error={fieldError(errors.brokerId)}
                  />
                )}
              />
            </div>
            {errors.brokerId && <p role="alert" className="mt-1 text-xs text-red-500">{fieldError(errors.brokerId)}</p>}
          </div>
        )}

        {mutation.isError && (
          <p role="alert" className="text-sm text-red-600">
            {getApiErrorMessage(mutation.error, { details: true, fallback: tr("Unable to save renewal. Please try again.") })}
          </p>
        )}
        <FormActions onCancel={requestClose} isSaving={mutation.isPending} submitLabel={tr(isEditMode ? "Save changes" : "Create renewal")} cancelLabel={tr("Cancel")} savingLabel={tr("Saving...")} />
      </fieldset>
    </FormModalShell>
  );
}
