import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../../../shared/components/TextField";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import { createBranchSchema, updateBranchSchema } from "../schema/branchSchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import GovernorateSelect from "../../cities/components/GovernorateSelect";
import CitySelect from "./CitySelect";


const EMPTY_VALUES = {
  branchName: "",
  governorateId: "",
  cityId: "",
  email: "",
  mapUrl: "",
  fullAddress: "",
  isActive: true,
};

function branchToFormValues(branch) {
  if (!branch) return EMPTY_VALUES;
  return {
    branchName: branch.branchName ?? "",
    governorateId: branch.governorateId ? String(branch.governorateId) : "",
    cityId: branch.cityId ? String(branch.cityId) : "",
    email: branch.email ?? "",
    mapUrl: branch.mapUrl ?? "",
    fullAddress: branch.fullAddress ?? "",
    isActive: branch.isActive ?? true,
  };
}

export default function BranchFormModal({
  isOpen,
  branch,
  providerId,
  createMutation,
  updateMutation,
  onClose,
}) {
  const isEditMode = !!branch;
  const schema = isEditMode ? updateBranchSchema : createBranchSchema;
  const mutation = isEditMode ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (isOpen) {
      reset(branchToFormValues(branch));
    }
  }, [isOpen, branch, reset]);

  const governorateId = watch("governorateId");

  if (!isOpen) return null;

  const onSubmit = (data) => {
    const payload = {
      ...(isEditMode && { id: branch.id }),
      providerId,
      branchName: data.branchName,
      governorateId: Number(data.governorateId),
      cityId: Number(data.cityId),
      email: data.email,
      mapUrl: data.mapUrl || "",
      fullAddress: data.fullAddress || "",
      isActive: data.isActive,
    };

    mutation.mutate(payload, {
      onError: (error) => {
        const backendErrors = error?.response?.data?.errors;
        if (backendErrors && !Array.isArray(backendErrors) && typeof backendErrors === "object") {
          applyServerErrors(backendErrors, setError);
        }
      },
    });
  };

  return (
    <FormModalShell
      title={isEditMode ? "Edit Branch" : "Add Branch"}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-3xl"
      formClassName="max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar"
    >
      <TextField
        label="Branch Name"
        required
        autoFocus
        {...register("branchName")}
      />
      {errors.branchName && (
        <p className="-mt-3 mb-3 text-xs text-red-500">{errors.branchName.message}</p>
      )}

      <div className="mb-1 grid grid-cols-2 gap-3 ">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Governorate <span className="text-red-500">*</span>
          </label>
          <Controller
            name="governorateId"
            control={control}
            render={({ field }) => (
              <GovernorateSelect
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  setValue("cityId", "");
                }}
                placeholder="Select governorate"
                error={errors.governorateId?.message}
              />
            )}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            City <span className="text-red-500">*</span>
          </label>
          <Controller
            name="cityId"
            control={control}
            render={({ field }) => (
              <CitySelect
                governorateId={governorateId}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select city"
                disabled={!governorateId}
                error={errors.cityId?.message}
              />
            )}
          />
        </div>
      </div>

      <div className="mb-4" />

      <TextField label="Full Address" required {...register("fullAddress")} />
      {errors.fullAddress && (
        <p className="-mt-3 mb-3 text-xs text-red-500">{errors.fullAddress.message}</p>
      )}

      <TextField
        label="Map URL"
        required
        maxLength={2048}
        sanitize={false}
        {...register("mapUrl")}
      />
      {errors.mapUrl && (
        <p className="-mt-3 mb-3 text-xs text-red-500">{errors.mapUrl.message}</p>
      )}

      <TextField label="Email" required {...register("email")} />
      {errors.email && (
        <p className="-mt-3 mb-3 text-xs text-red-500">{errors.email.message}</p>
      )}

      {isEditMode && (
        <label className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            {...register("isActive")}
            className="h-4 w-4 rounded border-slate-300"
          />
          Active
        </label>
      )}

      <FormActions
        onCancel={onClose}
        isSaving={mutation.isPending}
        submitLabel={isEditMode ? "Save Changes" : "Add Branch"}
      />
    </FormModalShell>
  );
}