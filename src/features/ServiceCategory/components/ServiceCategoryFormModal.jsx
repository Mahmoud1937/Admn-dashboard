import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getServiceCategorySchema } from "../schema/serviceCategorySchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import FormModalShell from "../../../shared/components/FormModalShell";
import ImageUploadField from "../../../shared/components/ImageUploadField";
import TextField from "../../../shared/components/TextField";
import FormActions from "../../../shared/components/FormActions";
import useServiceCategoriesText from "../../../localization/useServiceCategoriesText";

export default function ServiceCategoryFormModal({ isOpen, category, onSave, onClose, isSaving, serverErrors }) {
  const t = useServiceCategoriesText();
  const fieldError = (error) => error?.message ? (error.type === "server" ? error.message : t(error.message)) : undefined;
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
    resolver: zodResolver(getServiceCategorySchema(!isEditMode)),
    defaultValues: {
      enName: "",
      arName: "",
      logo: null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        enName: category?.enName ?? "",
        arName: category?.arName ?? "",
        logo: isEditMode ? category?.imageUrl ?? null : null,
      });
      // Reset the image preview when switching between add and edit.
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
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setValue("logo", file, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    onSave({
      id: category?.id,
      enName: data.enName,
      arName: data.arName,
      image,
    });
  };

  return (
    <FormModalShell
      title={t(isEditMode ? "Edit Service Category" : "Add Service Category")}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      closeLabel={t("Close")}
      formClassName="max-h-[70vh] overflow-y-auto pe-1 custom-scrollbar"
    >
      <ImageUploadField
        allowSvg
        preview={preview}
        onImageChange={handleImageChange}
        alt={t("Service category logo")}
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
        autoFocus
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
