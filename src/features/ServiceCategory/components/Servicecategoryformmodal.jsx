import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceCategorySchema } from "../schema/serviceCategorySchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import FormModalShell from "../../../shared/components/FormModalShell";
import ImageUploadField from "../../../shared/components/ImageUploadField";
import TextField from "../../../shared/components/TextField";
import FormActions from "../../../shared/components/FormActions";


export default function ServiceCategoryFormModal({ isOpen, category, onSave, onClose, isSaving, serverErrors }) {
  const isEditMode = !!category;

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
    resolver: zodResolver(serviceCategorySchema),
    defaultValues: {
      enName: "",
      arName: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        enName: category?.enName ?? "",
        arName: category?.arName ?? "",
      });
      setPreview(category?.imageUrl || null);
      setImage(null);
      setImageError("");
    }
  }, [isOpen, category, reset]);

  useEffect(() => {
    applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setImageError("");
  };

  const onSubmit = (data) => {
    if (!image && !preview) {
      return;
    }

    onSave({
      id: category?.id,
      enName: data.enName,
      arName: data.arName,
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
      title={isEditMode ? "Edit Service Category" : "Add Service Category"}
      onClose={onClose}
      onSubmit={handleFormSubmit}
    >
      <ImageUploadField preview={preview} onImageChange={handleImageChange} alt="Service category logo" />
      {imageError && (
        <p className="mb-4 text-center text-xs text-red-500">{imageError}</p>
      )}

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