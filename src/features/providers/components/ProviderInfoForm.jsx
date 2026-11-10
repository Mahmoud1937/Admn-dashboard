import { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faChevronDown,
  faCircleExclamation,
  faCircleInfo,
  faFloppyDisk,
  faPenToSquare,
  faPowerOff,
} from "@fortawesome/free-solid-svg-icons";
import { buildProviderFormValues, emptyProviderForm, isPharmacyCategory, PROVIDER_CLASS_OPTIONS } from "../utils/providerFormHelpers";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import TextField from "../../../shared/components/TextField";
import DateField from "./DateField";
import SpecialistSelect from "../../services-admin/components/SpecialistSelect";
import { getProviderSchema } from "../schema/providerSchema";
import ProviderLogoUpload from "../components/ProviderLogoUpload";
import ProviderCategorySelect from "./ProviderCategorySelect";
import useProviderDetailsText from "../../../localization/useProviderDetailsText";
import useLanguage from "../../../localization/useLanguage";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/* ---------- Small presentational helpers ---------- */

function SectionCard({ icon, title, description, action, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm text-blue-600">
            <FontAwesomeIcon icon={icon} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {description && (
              <p className="text-xs text-slate-500">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function FieldLabel({ htmlFor, required, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-slate-700"
    >
      {children}
      {required && <span className="ms-0.5 text-red-500">*</span>}
    </label>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
      <FontAwesomeIcon icon={faCircleExclamation} className="text-[10px]" />
      {message}
    </p>
  );
}

/* ---------- Main component ---------- */

export default function ProviderInfoForm({
  isCreateMode,
  provider,
  isEditMode,
  mutation,
  onCancelToList,
  canUpdate = false,
}) {
  const tr = useProviderDetailsText();
  const { direction, language } = useLanguage();
  const [isEditing, setIsEditing] = useState(isCreateMode || isEditMode);
  const canEdit = isCreateMode || isEditing;

  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const {
    register,
    handleSubmit,
    control,
    subscribe,
    reset,
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: (values, context, options) => zodResolver(
      getProviderSchema(isCreateMode, isPharmacyCategory(values.providerCategoryId))
    )(values, context, options),
    defaultValues: emptyProviderForm,
  });

  const providerCategoryId = useWatch({ control, name: "providerCategoryId" });
  const isPharmacy = isPharmacyCategory(providerCategoryId);
  const fieldError = (error) => error?.message
    ? error.type === "server" ? error.message : tr(error.message)
    : undefined;
  const selectLabels = {
    clearSelection: tr("Clear selection"),
    openOptions: tr("Open options"),
    closeOptions: tr("Close options"),
    loading: tr("Loading..."),
    loadingMore: tr("Loading more..."),
    unableToLoadOptions: tr("Unable to load options."),
    noResults: tr("No results found."),
    tryAgain: tr("Try again"),
  };
  const bilingualOptionLabel = (item) => language === "ar"
    ? `${item.arName} - ${item.enName}`
    : `${item.enName} - ${item.arName}`;

  const hotLineRegister = register("hotLine");
  const phoneNumberRegister = register("phoneNumber");
  const landlineRegister = register("landline");

  // Image preview
  useEffect(() => {
    if (!imageFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewImage(provider?.imageUrl || "");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewImage(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile, provider?.imageUrl]);

  // Fill form when the provider loads/changes
  useEffect(() => {
    if (!provider) return;
    reset(buildProviderFormValues(provider));
  }, [provider, reset]);

  useEffect(() => {
    if (!mutation.isError) return undefined;

    const unsubscribe = subscribe({
      formState: { values: true },
      callback: () => {
        // Reset only the mutation result. RHF field errors are intentionally
        // preserved so relevant server/validation messages remain visible.
        mutation.reset();
      },
    });

    return unsubscribe;
  }, [mutation, subscribe]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("logoFile", {
        type: "manual",
        message: "Please select a PNG or JPG image only.",
      });
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("logoFile", {
        type: "manual",
        message: "Image size must be less than 5MB.",
      });
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setValue("logoFile", file, { shouldValidate: true });
  };

  const handleDigitsOnlyChange = (fieldRegister) => (e) => {
    e.target.value = e.target.value.replace(/\D/g, "");
    fieldRegister.onChange(e);
  };

  const onSubmit = (formValues) => {
    if (!isCreateMode && !canUpdate) return;
    const payload = {
      providerCategoryId: formValues.providerCategoryId,
      providerClass: formValues.providerClass,
      specialistId: formValues.specialistId || null,
      arName: formValues.arName,
      enName: formValues.enName,
      hotLine: formValues.hotLine,
      phoneNumber: formValues.phoneNumber,
      landline: formValues.landline || null,
      isActive: formValues.isActive,
      medicardCashback: formValues.medicardCashback,
      ...(isPharmacy ? {
        localMedicineDiscount: formValues.localMedicineDiscount,
        importedMedicineDiscount: formValues.importedMedicineDiscount,
      } : {}),
      logoFile: imageFile,
    };

    if (!isCreateMode && formValues.joinDate) {
      payload.createdAt = new Date(formValues.joinDate).toISOString();
    }

    mutation.mutate(payload, {
      onSuccess: () => {
        if (!isCreateMode) {
          setImageFile(null);
          setIsEditing(false);
        }
      },
      onError: (error) => {
        applyServerErrors(error?.response?.data?.errors, setError);
      },
    });
  };

  const handleCancelEdit = () => {
    if (isCreateMode) {
      onCancelToList?.();
      return;
    }

    reset(buildProviderFormValues(provider));
    setImageFile(null);
    setIsEditing(false);
  };

  const selectClasses =
    `w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 ${direction === "rtl" ? "pl-9" : "pr-9"} text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-700 disabled:shadow-none disabled:opacity-100`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* ---------- Basic information ---------- */}
      <SectionCard
        icon={faCircleInfo}
        title={tr(isCreateMode ? "Provider Details" : "Provider Information")}
        description={tr("Name, category and classification of the provider.")}
        action={
          !isCreateMode && !isEditing && canUpdate ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:self-auto"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
              {tr("Update")}
            </button>
          ) : null
        }
      >
        <div className="space-y-6">
          {/* Logo */}
          <ProviderLogoUpload
            currentImageUrl={previewImage}
            currentFileName={imageFile?.name}
            selectedFile={imageFile}
            onImageChange={handleImageChange}
            disabled={!canEdit}
            error={fieldError(errors.logoFile)}
          />

          <hr className="border-slate-100" />

          {/* Names */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextField
              label={tr("English Name")}
              required
              maxLength={100}
              disabled={!canEdit}
              error={fieldError(errors.enName)}
              {...register("enName")}
            />

            <TextField
              label={tr("Arabic Name")}
              required
              dir="rtl"
              style={{ direction: "rtl", textAlign: "right" }}
              maxLength={100}
              disabled={!canEdit}
              error={fieldError(errors.arName)}
              {...register("arName")}
            />
          </div>

          {/* Category + Specialist */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <FieldLabel required>{tr("Category")}</FieldLabel>
              <Controller
                name="providerCategoryId"
                control={control}
                render={({ field }) => (
                  <ProviderCategorySelect
                    key={language}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      clearErrors(["localMedicineDiscount", "importedMedicineDiscount"]);
                    }}
                    disabled={!canEdit}
                    error={fieldError(errors.providerCategoryId)}
                    className="w-full"
                    placeholder={tr("All categories")}
                    searchPlaceholder={tr("Search categories...")}
                    labels={selectLabels}
                    language={language}
                    rtl={direction === "rtl"}
                    getOptionLabel={bilingualOptionLabel}
                  />
                )}
              />
            </div>

            <div>
              <FieldLabel>{tr("Specialist")}</FieldLabel>
              <Controller
                name="specialistId"
                control={control}
                render={({ field }) => (
                  <SpecialistSelect
                    key={language}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!canEdit}
                    error={fieldError(errors.specialistId)}
                    placeholder={tr("Select specialist")}
                    searchPlaceholder={tr("Search specialists...")}
                    labels={selectLabels}
                    language={language}
                    rtl={direction === "rtl"}
                    getOptionLabel={bilingualOptionLabel}
                  />
                )}
              />
            </div>
          </div>

          {/* Class + Join date */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="provider-class" required>
                {tr("Class")}
              </FieldLabel>
              <div className="relative">
                <select
                  id="provider-class"
                  {...register("providerClass")}
                  disabled={!canEdit}
                  className={selectClasses}
                >
                  <option value="">{tr("Select class")}</option>
                  {PROVIDER_CLASS_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-xs text-slate-400 ${direction === "rtl" ? "left-3" : "right-3"}`}
                />
              </div>
              <FieldError message={fieldError(errors.providerClass)} />
            </div>

            {!isCreateMode && (
              <div>
                <FieldLabel>{tr("Join Date")}</FieldLabel>
                <Controller
                  name="joinDate"
                  control={control}
                  render={({ field }) => (
                    <DateField
                      rtl={direction === "rtl"}
                      value={field.value}
                      onChange={field.onChange}
                      disabled
                    />
                  )}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextField
              label={tr("Medicard Cashback")}
              required
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              step={1}
              sanitize={false}
              disabled={!canEdit}
              error={fieldError(errors.medicardCashback)}
              {...register("medicardCashback", { valueAsNumber: true })}
            />
          </div>

          {isPharmacy && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <TextField
                label={tr("Local Medicine Discount (%)")}
                required
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                step={1}
                sanitize={false}
                disabled={!canEdit}
                error={fieldError(errors.localMedicineDiscount)}
                {...register("localMedicineDiscount", { valueAsNumber: true })}
              />
              <TextField
                label={tr("Imported Medicine Discount (%)")}
                required
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                step={1}
                sanitize={false}
                disabled={!canEdit}
                error={fieldError(errors.importedMedicineDiscount)}
                {...register("importedMedicineDiscount", { valueAsNumber: true })}
              />
            </div>
          )}
        </div>
      </SectionCard>

      {/* ---------- Contact information ---------- */}
      <SectionCard
        icon={faAddressBook}
        title={tr("Contact Information")}
        description={tr("Numbers used by members and the support team. Digits only.")}
      >
        {errors.contactInfo && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <FieldError message={fieldError(errors.contactInfo)} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <TextField
            label={tr("Hotline")}
            inputMode="numeric"
            sanitize={false}
            disabled={!canEdit}
            error={fieldError(errors.hotLine)}
            {...hotLineRegister}
            onChange={handleDigitsOnlyChange(hotLineRegister)}
          />

          <TextField
            label={tr("Phone Number")}
            inputMode="numeric"
            sanitize={false}
            disabled={!canEdit}
            error={fieldError(errors.phoneNumber)}
            {...phoneNumberRegister}
            onChange={handleDigitsOnlyChange(phoneNumberRegister)}
          />

          <TextField
            label={tr("Landline")}
            inputMode="numeric"
            sanitize={false}
            disabled={!canEdit}
            error={fieldError(errors.landline)}
            {...landlineRegister}
            onChange={handleDigitsOnlyChange(landlineRegister)}
          />
        </div>
      </SectionCard>

      {/* ---------- Status ---------- */}
      <SectionCard
        icon={faPowerOff}
        title={tr("Status")}
        description={tr("Inactive providers are hidden from members.")}
      >
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {tr(field.value ? "Active" : "Inactive")}
                </p>
                <p className="text-xs text-slate-500">
                  {field.value
                    ? tr("This provider is visible and can be used.")
                    : tr("This provider is currently disabled.")}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={!!field.value}
                aria-label={tr("Active status")}
                disabled={!canEdit}
                onClick={() => field.onChange(!field.value)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                  field.value ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    field.value ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          )}
        />
      </SectionCard>

      {/* ---------- Server error ---------- */}
      {mutation.isError && Object.keys(errors).length === 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5" />
          <p>
            {mutation.error?.response?.data?.message || tr("Failed to save changes.")}
          </p>
        </div>
      )}

      {/* ---------- Actions ---------- */}
      {canEdit && (
        <div className="sticky bottom-0 z-10 -mx-1 flex flex-col-reverse items-stretch justify-end gap-3 rounded-xl border border-slate-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleCancelEdit}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {tr("Cancel")}
          </button>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs" />
            {mutation.isPending
              ? tr("Saving...")
              : isCreateMode
              ? tr("Create Provider")
              : tr("Save Changes")}
          </button>
        </div>
      )}
    </form>
  );
}
