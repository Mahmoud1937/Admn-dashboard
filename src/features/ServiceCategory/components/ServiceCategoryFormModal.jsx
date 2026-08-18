import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getServiceCategorySchema } from "../schema/serviceCategorySchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import FormModalShell from "../../../shared/components/FormModalShell";
import ImageUploadField from "../../../shared/components/ImageUploadField";
import TextField from "../../../shared/components/TextField";
import FormActions from "../../../shared/components/FormActions";

export default function ServiceCategoryFormModal({ isOpen, category, onSave, onClose, isSaving, serverErrors }) {
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
      title={isEditMode ? "Edit Service Category" : "Add Service Category"}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      formClassName="max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar"
    >
      <ImageUploadField
        preview={preview}
        onImageChange={handleImageChange}
        alt="Service category logo"
        error={errors.logo?.message}
        disabled={isSaving}
      />

      <TextField
        label="English Name"
        required
        autoFocus
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