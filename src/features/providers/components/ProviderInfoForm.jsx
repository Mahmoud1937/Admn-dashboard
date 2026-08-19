import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { buildProviderFormValues, emptyProviderForm } from "../utils/providerFormHelpers";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import TextField from "../../../shared/components/TextField";
import DateField from "./DateField";
import CategorySelect from "../../services-admin/components/CategorySelect";
import SpecialistSelect from "../../services-admin/components/SpecialistSelect";
import {getProviderSchema} from "../schema/providerSchema"
import ProviderLogoUpload from "../components/ProviderLogoUpload"
import ProviderCategorySelect from "./ProviderCategorySelect";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ProviderInfoForm({
  isCreateMode,
  provider,
  isEditMode,
  mutation,
  onCancelToList,
}) {
  const [isEditing, setIsEditing] = useState(isCreateMode || isEditMode);
  const canEdit = isCreateMode || isEditing;

  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getProviderSchema (isCreateMode)),
    defaultValues: emptyProviderForm,
  });

  const hotLineRegister = register("hotLine");
  const phoneNumberRegister = register("phoneNumber1");

  // Image preview
  useEffect(() => {
    if (!imageFile) {
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
    const payload = {
      providerCategoryId: formValues.providerCategoryId,
      specialistId: formValues.specialistId || null,
      arName: formValues.arName,
      enName: formValues.enName,
      hotLine: formValues.hotLine,
      phoneNumber1: formValues.phoneNumber1,
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-8"
    >
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <h2 className="text-lg font-semibold text-slate-900">
          {isCreateMode ? "Create Provider" : "Provider Information"}
        </h2>

        {!isCreateMode && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:self-auto"
          >
            <FontAwesomeIcon icon={faPenToSquare} />
            Update
          </button>
        )}
      </div>

      {/* Logo */}
      <ProviderLogoUpload
        currentImageUrl={previewImage}
        currentFileName={imageFile?.name}
        selectedFile={imageFile}
        onImageChange={handleImageChange}
        disabled={!canEdit}
        error={errors.logoFile?.message}
      />

      {/* Join Date */}
      {!isCreateMode && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-slate-700">Join Date</label>
          <Controller
            name="joinDate"
            control={control}
            render={({ field }) => (
              <DateField value={field.value} onChange={field.onChange} disabled />
            )}
          />
        </div>
      )}

      {/* Names */}
      <div className="mb-2 grid grid-cols-1 gap-6 md:grid-cols-2">
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
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category <span className="text-red-500">*</span>
          </label>
          <Controller
            name="providerCategoryId"
            control={control}
            render={({ field }) => (
              <ProviderCategorySelect
                value={field.value}
                onChange={field.onChange}
                disabled={!canEdit}
                error={errors.providerCategoryId?.message}
              />
            )}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Specialist</label>
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

      {/* Hotline + Phone */}
      <div className="mb-2 grid grid-cols-1 gap-6 md:grid-cols-2">
        <TextField
          label="Hotline"
          required
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
          error={errors.phoneNumber1?.message}
          {...phoneNumberRegister}
          onChange={handleDigitsOnlyChange(phoneNumberRegister)}
        />
      </div>

      {/* Active Status */}
      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Active Status</label>
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => field.onChange(!field.value)}
              className={`relative h-6 w-11 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${field.value ? "bg-emerald-500" : "bg-slate-300"
                }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${field.value ? "left-5" : "left-0.5"
                  }`}
              />
            </button>
          )}
        />
      </div>

      {mutation.isError && Object.keys(errors).length === 0 && (
        <p className="mb-4 text-sm text-red-500">
          {mutation.error?.response?.data?.message || "Failed to save changes."}
        </p>
      )}
      {canEdit && (
        <div className="mt-8 flex flex-col-reverse items-stretch justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:gap-4">
          <button
            type="button"
            onClick={handleCancelEdit}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
            {isCreateMode ? "Create Provider" : "Save Info"}
          </button>
        </div>
      )}
    </form>
  );
}