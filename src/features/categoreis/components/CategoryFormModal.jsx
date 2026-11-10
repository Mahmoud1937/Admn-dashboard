import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import ImageUploadField from "../../../shared/components/ImageUploadField";
import TextField from "../../../shared/components/TextField";
import { getCategorySchema } from "../schema/categorySchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import useProviderCategoriesText from "../../../localization/useProviderCategoriesText";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function CategoryFormModal({ isOpen, category, onSave, onClose, isSaving, serverErrors }) {
  const t = useProviderCategoriesText();
  const isEditMode = !!category;
  const fieldError = (error) => error?.message
    ? error.type === "server" ? error.message : t(error.message)
    : undefined;

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
      // Reset the preview and selected file with the form when the modal opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      setError("logo", { type: "manual", message: "Logo must be a PNG, JPG, WEBP, or SVG image" });
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
      title={t(category ? "Edit Category" : "Add Category")}
      onClose={onClose}
      closeLabel={t("Close")}
      onSubmit={handleSubmit(onSubmit)}
      formClassName="max-h-[70vh] overflow-y-auto pe-1 custom-scrollbar"
    >
      <ImageUploadField
        allowSvg
        preview={preview}
        onImageChange={handleImageChange}
        alt={t("Category logo")}
        label={t("Upload Logo")}
        labels={{
          formatsWithSvg: t("PNG, JPEG, WebP, or SVG"),
          processing: t("Processing..."),
          compressing: t("Compressing image..."),
          dragAndDrop: t("or drag and drop an image here"),
          formatsOnly: (formats) => t("{{formats}} only", { formats }),
          dropError: (formats) => t("Please drop an image file ({{formats}})", { formats }),
        }}
        error={fieldError(errors.logo)}
        disabled={isSaving}
      />

      <TextField
        label={t("English Name")}
        required
        {...register("enName")}
        error={fieldError(errors.enName)}
      />

      <TextField
        label={t("Arabic Name")}
        required
        dir="rtl"
        style={{ textAlign: "right" }}
        {...register("arName")}
        error={fieldError(errors.arName)}
      />

      <FormActions onCancel={onClose} isSaving={isSaving} submitLabel={t("Save")} savingLabel={t("Saving...")} cancelLabel={t("Cancel")} />
    </FormModalShell>
  );
}
