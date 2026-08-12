import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import CategorySelect from "./CategorySelect";
import TextField from "../../../shared/components/TextField";
import { serviceSchema } from "../schema/serviceSchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";

export default function ServiceFormModal({ isOpen, service, categories, onSave, onClose, isSaving, serverErrors }) {
  const isEditMode = !!service;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      enName: "",
      arName: "",
      categoryId: "",
      cpt: "",
      serviceInstruction: "",

    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        enName: service?.enName ?? "",
        arName: service?.arName ?? "",
        categoryId: service?.categoryId ? String(service.categoryId) : "",
        cpt: service?.cpt ?? "",
        serviceInstruction: service?.serviceInstruction ?? "",

      });
    }
  }, [isOpen, service, reset]);

  useEffect(() => {
    applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onSave({
      id: service?.id,
      categoryId: Number(data.categoryId),
      arName: data.arName,
      enName: data.enName,
      cpt: data.cpt?.trim() || null,
      serviceInstruction: data.serviceInstruction?.trim() || null,

    });
  };

  return (
    <FormModalShell
      title={isEditMode ? "Edit Service" : "Add Service"}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      formClassName="scroll-form"
    >
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Category <span className="text-red-500">*</span>
        </label>
        <CategorySelect
          categories={categories}
          {...register("categoryId")}
          placeholder="Select category"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        {errors.categoryId && (
          <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>
        )}
      </div>

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

      <TextField
        label="CPT Code"
        {...register("cpt")}
        error={errors.cpt?.message}
      />

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Service Instructions
        </label>
        <textarea
          {...register("serviceInstruction")}
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        {errors.serviceInstruction && (
          <p className="mt-1 text-xs text-red-500">{errors.serviceInstruction.message}</p>
        )}
      </div>

      <FormActions
        onCancel={onClose}
        isSaving={isSaving}
        submitLabel={isEditMode ? "Save Changes" : "Add Service"}
      />
    </FormModalShell>
  );
}