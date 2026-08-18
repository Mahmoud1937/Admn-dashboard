import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import ImageUploadField from "../../../shared/components/ImageUploadField";
import TextField from "../../../shared/components/TextField";
import { getCategorySchema } from "../schema/categorySchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function CategoryFormModal({ isOpen, category, onSave, onClose, isSaving, serverErrors }) {
  const isEditMode = !!category;

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getCategorySchema(!isEditMode)),
    defaultValues: { enName: "", arName: "", logo: null },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        enName: category?.enName || "",
        arName: category?.arName || "",
        logo: isEditMode ? category?.imageUrl ?? null : null,
      });
      setPreview(category?.imageUrl || null);
      setImage(null);
    }
  }, [isOpen, category, isEditMode, reset]);

  useEffect(() => {
    applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) =>
      file.name?.toLowerCase().endsWith(ext)
    );

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || !hasValidExtension) {
      e.target.value = "";
      setError("logo", { type: "manual", message: "Logo must be a PNG, JPG, or WEBP image" });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      e.target.value = "";
      setError("logo", { type: "manual", message: "Logo size can't exceed 5MB" });
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setValue("logo", file, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    onSave({ id: category?.id, enName: data.enName, arName: data.arName, image });
  };

  return (
    <FormModalShell
      title={category ? "Edit Category" : "Add Category"}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      formClassName="max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar"
    >
      <ImageUploadField
        preview={preview}
        onImageChange={handleImageChange}
        alt="Category logo"
        error={errors.logo?.message}
        disabled={isSaving}
      />

      <TextField
        label="English Name"
        required
        {...register("enName")}
        error={errors.enName?.message}
      />

      <TextField
        label="Arabic Name"
        required
        {...register("arName")}
        error={errors.arName?.message}
      />

      <FormActions onCancel={onClose} isSaving={isSaving} submitLabel="Save" />
    </FormModalShell>
  );
}