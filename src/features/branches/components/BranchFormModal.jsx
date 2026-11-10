import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../../../shared/components/TextField";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import { createBranchSchema, updateBranchSchema } from "../schema/branchSchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import GovernorateSelect from "../../cities/components/GovernorateSelect";
import CitySelect from "./CitySelect";
import useProviderDetailsText from "../../../localization/useProviderDetailsText";
import useLanguage from "../../../localization/useLanguage";


const EMPTY_VALUES = {
  branchName: "",
  governorateId: "",
  cityId: "",
  email: "",
  mapUrl: "",
  fullAddress: "",
  kilo: "",
  isActive: true,
};

function branchToFormValues(branch) {
  if (!branch) return EMPTY_VALUES;
  return {
    branchName: branch.branchName ?? "",
    governorateId: branch.governorateId ? String(branch.governorateId) : "",
    cityId: branch.cityId ? String(branch.cityId) : "",
    email: branch.email ?? "",
    mapUrl: branch.mapUrl ?? "",
    fullAddress: branch.fullAddress ?? "",
    kilo: branch.kilo == null ? "" : String(branch.kilo),
    isActive: branch.isActive ?? true,
  };
}

export default function BranchFormModal({
  isOpen,
  branch,
  providerId,
  createMutation,
  updateMutation,
  onClose,
  localized = false,
}) {
  const tr = useProviderDetailsText(localized);
  const { direction, language } = useLanguage();
  const rtl = localized && direction === "rtl";
  const fieldError = (error) => error?.message
    ? error.type === "server" ? error.message : tr(error.message)
    : undefined;
  const selectLabels = localized ? {
    clearSelection: tr("Clear selection"),
    openOptions: tr("Open options"),
    closeOptions: tr("Close options"),
    loading: tr("Loading..."),
    loadingMore: tr("Loading more..."),
    unableToLoadOptions: tr("Unable to load options."),
    noResults: tr("No results found."),
    tryAgain: tr("Try again"),
  } : undefined;
  const bilingualOptionLabel = (item) => rtl
    ? `${item.arName} - ${item.enName}`
    : `${item.enName} - ${item.arName}`;
  const isEditMode = !!branch;
  const schema = isEditMode ? updateBranchSchema : createBranchSchema;
  const mutation = isEditMode ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (isOpen) {
      reset(branchToFormValues(branch));
    }
  }, [isOpen, branch, reset]);

  const governorateId = watch("governorateId");

  if (!isOpen) return null;

  const onSubmit = (data) => {
    const payload = {
      ...(isEditMode && { id: branch.id }),
      providerId,
      branchName: data.branchName,
      governorateId: Number(data.governorateId),
      cityId: Number(data.cityId),
      email: data.email,
      mapUrl: data.mapUrl || "",
      fullAddress: data.fullAddress || "",
      kilo: data.kilo === "" ? null : (data.kilo),
      isActive: data.isActive,
    };

    mutation.mutate(payload, {
      onError: (error) => {
        const backendErrors = error?.response?.data?.errors;
        if (backendErrors && !Array.isArray(backendErrors) && typeof backendErrors === "object") {
          applyServerErrors(backendErrors, setError);
        }
      },
    });
  };
 
  return (
    <FormModalShell
      title={tr(isEditMode ? "Edit Branch" : "Add Branch")}
      closeLabel={tr("Close")}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl"
      formClassName={`max-h-[70vh] overflow-y-auto custom-scrollbar ${rtl ? "pl-1" : "pr-1"}`}
    >
      <TextField
        label={tr("Branch Name")}
        required
        autoFocus
        {...register("branchName")}
      />
      {errors.branchName && (
        <p className="-mt-3 mb-3 text-xs text-red-500">{fieldError(errors.branchName)}</p>
      )}

   <div className="mb-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {tr("Governorate")} <span className="text-red-500">*</span>
          </label>
          <Controller
            name="governorateId"
            control={control}
            render={({ field }) => (
              <GovernorateSelect
                key={localized ? language : "default"}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  setValue("cityId", "");
                }}
                placeholder={tr("Select Governorate")}
                searchPlaceholder={tr("Search governorates...")}
                labels={selectLabels}
                language={localized ? language : undefined}
                rtl={rtl}
                getOptionLabel={bilingualOptionLabel}
                error={fieldError(errors.governorateId)}
              />
            )}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {tr("City")} <span className="text-red-500">*</span>
          </label>
          <Controller
            name="cityId"
            control={control}
            render={({ field }) => (
              <CitySelect
                key={localized ? language : "default"}
                governorateId={governorateId}
                value={field.value}
                onChange={field.onChange}
                placeholder={tr("Select city")}
                searchPlaceholder={tr("Search cities...")}
                chooseFirstPlaceholder={tr("Choose Governorate First ")}
                labels={selectLabels}
                language={localized ? language : undefined}
                rtl={rtl}
                getOptionLabel={bilingualOptionLabel}
                disabled={!governorateId}
                error={fieldError(errors.cityId)}
              />
            )}
          />
        </div>
      </div>

      <div className="mb-4" />

      <TextField label={tr("Full Address")} required {...register("fullAddress")} />
      {errors.fullAddress && (
        <p className="-mt-3 mb-3 text-xs text-red-500">{fieldError(errors.fullAddress)}</p>
      )}

      <TextField
        label={tr("Road kilometer marker")}
        placeholder={tr("e.g. 82")}
        inputMode="decimal"
        sanitize={false}
        error={fieldError(errors.kilo)}
        {...register("kilo")}
      />

      <TextField
        label={tr("Map URL")}
        required
        maxLength={2048}
        sanitize={false}
        {...register("mapUrl")}
      />
      {errors.mapUrl && (
        <p className="-mt-3 mb-3 text-xs text-red-500">{fieldError(errors.mapUrl)}</p>
      )}

      <TextField label={tr("Email")} required {...register("email")} />
      {errors.email && (
        <p className="-mt-3 mb-3 text-xs text-red-500">{fieldError(errors.email)}</p>
      )}

      {isEditMode && (
        <label className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            {...register("isActive")}
            className="h-4 w-4 rounded border-slate-300"
          />
          {tr("Active")}
        </label>
      )}

      <FormActions
        onCancel={onClose}
        isSaving={mutation.isPending}
        submitLabel={tr(isEditMode ? "Save Changes" : "Add Branch")}
        cancelLabel={tr("Cancel")}
        savingLabel={tr("Saving...")}
      />
    </FormModalShell>
  );
}
