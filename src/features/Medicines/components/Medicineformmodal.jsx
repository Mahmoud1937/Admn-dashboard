import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormModalShell from "../../../shared/components/FormModalShell";
import ImageUploadField from "../../../shared/components/ImageUploadField";
import FormActions from "../../../shared/components/FormActions";
import TextField from "../../../shared/components/TextField";
import { medicineSchema } from "../schema/medicineSchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";

export default function MedicineFormModal({
  isOpen,
  medicine,
  onSave,
  onClose,
  isSaving,
  serverErrors,
}) {
  const isEditMode = !!medicine;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageError, setImageError] = useState("");

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
        isActive: medicine?.isActive ?? true,
      });

      setPreview(medicine?.medicineImageUrl || null);
      setImage(null);
      setImageError("");
    }
  }, [isOpen, medicine, reset]);

  // Handle server-side validation errors
  useEffect(() => {
    if (!serverErrors) return;

    // MedicineImageUrl is not a React Hook Form field.
    // It belongs to the custom image uploader, so handle it separately.
    const imageServerError = serverErrors.MedicineImageUrl;

    if (imageServerError) {
      setImageError(
        Array.isArray(imageServerError)
          ? imageServerError[0]
          : imageServerError
      );
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
    setImageError("Please select a valid image file (PNG, JPG, or WEBP).");
    return;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    setImageError("Image size can't exceed 5MB.");
    return;
  }

  setImage(file);
  setPreview(URL.createObjectURL(file));
  setImageError("");
};

  const onSubmit = (data) => {
    if (!image && !preview) {
      setImageError("Image is required.");
      return;
    }

    onSave({
      id: medicine?.id,
      enName: data.enName,
      arName: data.arName,
      medicinePrice: Number(data.medicinePrice),
      medicineForm: data.medicineForm.trim(),
      isActive: data.isActive,
      image,
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!image && !preview) {
      setImageError("Image is required.");
    } else {
      setImageError("");
    }

    handleSubmit(onSubmit)(e);
  };

  return (
    <FormModalShell
      title={isEditMode ? "Edit Medicine" : "Add Medicine"}
      onClose={onClose}
      onSubmit={handleFormSubmit}
      formClassName="max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar"
    >
      {/* Image */}
<ImageUploadField
  preview={preview}
  onImageChange={handleImageChange}
  label="Upload Image"
  alt="Medicine"
  error={imageError}
/>




      

      {/* English Name */}
      <TextField
        label="English Name"
        required
        autoFocus
        {...register("enName")}
        error={errors.enName?.message}
      />

      {/* Arabic Name */}
      <TextField
        label="Arabic Name"
        required
        {...register("arName")}
        error={errors.arName?.message}
      />

      {/* Price */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Price <span className="text-red-500">*</span>
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
            {errors.medicinePrice.message}
          </p>
        )}
      </div>

      {/* Form */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Form <span className="text-red-500">*</span>
        </label>

        <input
          type="text"
          {...register("medicineForm")}
          placeholder="e.g. Tablet, Capsule, Syrup"
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400 ${
            errors.medicineForm
              ? "border-red-400"
              : "border-slate-200"
          }`}
        />

        {errors.medicineForm && (
          <p className="mt-1 text-xs text-red-500">
            {errors.medicineForm.message}
          </p>
        )}
      </div>

      {/* Actions */}
      <FormActions
        onCancel={onClose}
        isSaving={isSaving}
        submitLabel={isEditMode ? "Save Changes" : "Add Medicine"}
      />
    </FormModalShell>
  );
}