import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormModalShell from "../../../shared/components/FormModalShell";
import ImageUploadField from "../../../shared/components/ImageUploadField";
import FormActions from "../../../shared/components/FormActions";
import TextField from "../../../shared/components/TextField";
import { medicineSchema } from "../schema/medicineSchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import { getMedicineUnitName, MEDICINE_UNITS } from "../constants/medicineUnits";
import useMedicinesText from "../../../localization/useMedicinesText";

export default function MedicineFormModal({
  isOpen,
  medicine,
  onSave,
  onClose,
  isSaving,
  serverErrors,
}) {
  const t = useMedicinesText();
  const fieldError = (error) => error?.message ? (error.type === "server" ? error.message : t(error.message)) : undefined;
  const isEditMode = !!medicine;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageError, setImageError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      enName: "",
      arName: "",
      medicinePrice: "",
      medicineForm: "",
      unit: "",
      isLocal: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        enName: medicine?.enName ?? "",
        arName: medicine?.arName ?? "",
        medicinePrice: medicine?.medicinePrice ?? "",
        medicineForm: medicine?.medicineForm ?? "",
        unit: getMedicineUnitName(medicine?.unit ?? medicine?.Unit),
        isLocal: medicine?.isLocal == null ? "" : String(medicine.isLocal),
        isActive: medicine?.isActive ?? true,
      });

      // Restore the image preview when switching between add and edit.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreview(medicine?.medicineImageUrl || null);
      setImage(null);
      setImageError(null);
    }
  }, [isOpen, medicine, reset]);

  // Handle server-side validation errors
  useEffect(() => {
    if (!serverErrors) return;

    // MedicineImageUrl is not a React Hook Form field.
    // It belongs to the custom image uploader, so handle it separately.
    const imageServerError = serverErrors.MedicineImageUrl;

    if (imageServerError) {
      // The existing uploader stores backend image errors outside React Hook Form.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImageError({ message:
        Array.isArray(imageServerError)
          ? imageServerError[0]
          : imageServerError,
        server: true,
      });
    }

    // Apply all other backend errors to React Hook Form fields.
    const formErrors = Object.fromEntries(
      Object.entries(serverErrors).filter(
        ([field]) => field !== "MedicineImageUrl"
      )
    );

    applyServerErrors(formErrors, setError);
  }, [serverErrors, setError]);

  if (!isOpen) return null;

const handleImageChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    setImageError({ message: "Please select a valid image file (PNG, JPG, or WEBP)." });
    return;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    setImageError({ message: "Image size can't exceed 5MB." });
    return;
  }

  setImage(file);
  setPreview(URL.createObjectURL(file));
  setImageError(null);
};

  const onSubmit = (data) => {
    if (!image && !preview) {
      setImageError({ message: "Image is required." });
      return;
    }

    onSave({
      id: medicine?.id,
      enName: data.enName,
      arName: data.arName,
      medicinePrice: Number(data.medicinePrice),
      medicineForm: data.medicineForm.trim(),
      unit: data.unit,
      isLocal: data.isLocal,
      isActive: data.isActive,
      image,
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!image && !preview) {
      setImageError({ message: "Image is required." });
    } else {
      setImageError(null);
    }

    handleSubmit(onSubmit)(e);
  };

  return (
    <FormModalShell
      title={t(isEditMode ? "Edit Medicine" : "Add Medicine")}
      onClose={onClose}
      onSubmit={handleFormSubmit}
      closeLabel={t("Close")}
      formClassName="max-h-[70vh] overflow-y-auto pe-1 custom-scrollbar"
    >
      {/* Image */}
<ImageUploadField
  preview={preview}
  onImageChange={handleImageChange}
  label={t("Upload Image")}
  alt={t("Medicine")}
  labels={{
    formats: t("PNG, JPEG, or WebP"),
    processing: t("Processing..."),
    compressing: t("Compressing image..."),
    dragAndDrop: t("or drag and drop an image here"),
    formatsOnly: (formats) => t("{{formats}} only", { formats }),
    dropError: (formats) => t("Please drop an image file ({{formats}})", { formats }),
  }}
  error={imageError && (imageError.server ? imageError.message : t(imageError.message))}
/>




      

      {/* English Name */}
      <TextField
        label={t("English Name")}
        required
        autoFocus
        {...register("enName")}
        error={fieldError(errors.enName)}
      />

      {/* Arabic Name */}
      <TextField
        label={t("Arabic Name")}
        required
        dir="rtl"
        style={{ textAlign: "right" }}
        {...register("arName")}
        error={fieldError(errors.arName)}
      />

      {/* Price */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {t("Price")} <span className="text-red-500">*</span>
        </label>

        <input
          type="text"
          inputMode="decimal"
          {...register("medicinePrice")}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400 ${
            errors.medicinePrice
              ? "border-red-400"
              : "border-slate-200"
          }`}
        />

        {errors.medicinePrice && (
          <p className="mt-1 text-xs text-red-500">
            {fieldError(errors.medicinePrice)}
          </p>
        )}
      </div>

      {/* Form */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {t("Form")} <span className="text-red-500">*</span>
        </label>

        <input
          type="text"
          {...register("medicineForm")}
          placeholder={t("e.g. Tablet, Capsule, Syrup")}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400 ${
            errors.medicineForm
              ? "border-red-400"
              : "border-slate-200"
          }`}
        />

        {errors.medicineForm && (
          <p className="mt-1 text-xs text-red-500">
            {fieldError(errors.medicineForm)}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="medicine-unit" className="mb-1.5 block text-sm font-medium text-slate-700">
          {t("Unit")} <span className="text-red-500">*</span>
        </label>
        <select
          id="medicine-unit"
          {...register("unit")}
          disabled={isSaving}
          aria-invalid={Boolean(errors.unit)}
          aria-describedby={errors.unit ? "medicine-unit-error" : undefined}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 ${errors.unit ? "border-red-400" : "border-slate-200"}`}
        >
          <option value="" disabled>{t("Select unit")}</option>
          {MEDICINE_UNITS.map((unit) => (
            <option key={unit} value={unit}>{t(unit)}</option>
          ))}
        </select>
        {errors.unit && (
          <p id="medicine-unit-error" role="alert" className="mt-1 text-xs text-red-500">
            {fieldError(errors.unit)}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="medicine-is-local" className="mb-1.5 block text-sm font-medium text-slate-700">
          {t("Origin")} <span className="text-red-500">*</span>
        </label>
        <select
          id="medicine-is-local"
          {...register("isLocal")}
          disabled={isSaving}
          aria-invalid={Boolean(errors.isLocal)}
          aria-describedby={errors.isLocal ? "medicine-is-local-error" : undefined}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 ${errors.isLocal ? "border-red-400" : "border-slate-200"}`}
        >
          <option value="" disabled>{t("Select origin")}</option>
          <option value="true">{t("local")}</option>
          <option value="false">{t("Imported")}</option>
        </select>
        {errors.isLocal && (
          <p id="medicine-is-local-error" role="alert" className="mt-1 text-xs text-red-500">
            {fieldError(errors.isLocal)}
          </p>
        )}
      </div>

      {/* Actions */}
      <FormActions
        onCancel={onClose}
        isSaving={isSaving}
        submitLabel={t(isEditMode ? "Save Changes" : "Add Medicine")}
        savingLabel={t("Saving...")}
        cancelLabel={t("Cancel")}
      />
    </FormModalShell>
  );
}
