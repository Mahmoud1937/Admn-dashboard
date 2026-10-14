import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faCircleExclamation,
  faCircleInfo,
  faFloppyDisk,
  faPenToSquare,
  faPowerOff,
} from "@fortawesome/free-solid-svg-icons";
import { buildProviderFormValues, emptyProviderForm, PROVIDER_CLASS_OPTIONS } from "../utils/providerFormHelpers";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import TextField from "../../../shared/components/TextField";
import DateField from "./DateField";
import SpecialistSelect from "../../services-admin/components/SpecialistSelect";
import { getProviderSchema } from "../schema/providerSchema";
import ProviderLogoUpload from "../components/ProviderLogoUpload";
import ProviderCategorySelect from "./ProviderCategorySelect";

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
      {required && <span className="ml-0.5 text-red-500">*</span>}
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
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getProviderSchema(isCreateMode)),
    defaultValues: emptyProviderForm,
  });

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
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* ---------- Basic information ---------- */}
      <SectionCard
        icon={faCircleInfo}
        title={isCreateMode ? "Provider Details" : "Provider Information"}
        description="Name, category and classification of the provider."
        action={
          !isCreateMode && !isEditing && canUpdate ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:self-auto"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
              Update
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
            error={errors.logoFile?.message}
          />

          <hr className="border-slate-100" />

          {/* Names */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextField
              label="English Name"
              required
              maxLength={100}
              disabled={!canEdit}
              error={errors.enName?.message}
              {...register("enName")}
            />

            <TextField
              label="Arabic Name"
              required
              dir="rtl"
              maxLength={100}
              disabled={!canEdit}
              error={errors.arName?.message}
              {...register("arName")}
            />
          </div>

          {/* Category + Specialist */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <FieldLabel required>Category</FieldLabel>
              <Controller
                name="providerCategoryId"
                control={control}
                render={({ field }) => (
                  <ProviderCategorySelect
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!canEdit}
                    error={errors.providerCategoryId?.message}
                    className="w-full"
                  />
                )}
              />
            </div>

            <div>
              <FieldLabel>Specialist</FieldLabel>
              <Controller
                name="specialistId"
                control={control}
                render={({ field }) => (
                  <SpecialistSelect
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!canEdit}
                    error={errors.specialistId?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Class + Join date */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor={canEdit ? "provider-class" : undefined} required={canEdit}>
                Class
              </FieldLabel>
              {canEdit ? (
                <select
                  id="provider-class"
                  {...register("providerClass")}
                  className={`${selectClasses} max-w-40`}
                >
                  <option value="">Select class</option>
                  {PROVIDER_CLASS_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex w-full items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                  {provider?.class ?? "-"}
                </div>
              )}
              <FieldError message={errors.providerClass?.message} />
            </div>

            {!isCreateMode && (
              <div>
                <FieldLabel>Join Date</FieldLabel>
                <Controller
                  name="joinDate"
                  control={control}
                  render={({ field }) => (
                    <DateField
                      value={field.value}
                      onChange={field.onChange}
                      disabled
                    />
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ---------- Contact information ---------- */}
      <SectionCard
        icon={faAddressBook}
        title="Contact Information"
        description="Numbers used by members and the support team. Digits only."
      >
        {errors.contactInfo && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <FieldError message={errors.contactInfo.message} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <TextField
            label="Hotline"
            inputMode="numeric"
            sanitize={false}
            disabled={!canEdit}
            error={errors.hotLine?.message}
            {...hotLineRegister}
            onChange={handleDigitsOnlyChange(hotLineRegister)}
          />

          <TextField
            label="Phone Number"
            inputMode="numeric"
            sanitize={false}
            disabled={!canEdit}
            error={errors.phoneNumber?.message}
            {...phoneNumberRegister}
            onChange={handleDigitsOnlyChange(phoneNumberRegister)}
          />

          <TextField
            label="Landline"
            inputMode="numeric"
            sanitize={false}
            disabled={!canEdit}
            error={errors.landline?.message}
            {...landlineRegister}
            onChange={handleDigitsOnlyChange(landlineRegister)}
          />
        </div>
      </SectionCard>

      {/* ---------- Status ---------- */}
      <SectionCard
        icon={faPowerOff}
        title="Status"
        description="Inactive providers are hidden from members."
      >
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {field.value ? "Active" : "Inactive"}
                </p>
                <p className="text-xs text-slate-500">
                  {field.value
                    ? "This provider is visible and can be used."
                    : "This provider is currently disabled."}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={!!field.value}
                aria-label="Active status"
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
            {mutation.error?.response?.data?.message || "Failed to save changes."}
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
            Cancel
          </button>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs" />
            {mutation.isPending
              ? "Saving..."
              : isCreateMode
              ? "Create Provider"
              : "Save Changes"}
          </button>
        </div>
      )}
    </form>
  );
}
