import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../../../shared/components/TextField";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import { useCitiesByGovernorate } from "../hooks/UsecCtiesByGovernorate";
import { createBranchSchema, updateBranchSchema } from "../schema/branchSchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";

const EMPTY_VALUES = {
  branchName: "",
  governorateId: "",
  cityId: "",
  email: "",
  userName: "",
  password: "",
  mapUrl: "",
  latitude: "",
  longitude: "",
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
    userName: branch.userName ?? "",
    password: "",
    mapUrl: branch.mapUrl ?? "",
    latitude: branch.latitude ?? "",
    longitude: branch.longitude ?? "",
    fullAddress: branch.fullAddress ?? "",
    isActive: branch.isActive ?? true,
  };
}

export default function BranchFormModal({
  isOpen,
  branch,
  providerId,
  governorates,
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
  const { cities, isLoading: isCitiesLoading } = useCitiesByGovernorate(governorateId);

  if (!isOpen) return null;

  const governorateRegister = register("governorateId");

  const handleGovernorateChange = (e) => {
    governorateRegister.onChange(e);
    setValue("cityId", "");
  };

  const onSubmit = (data) => {
  const payload = {
  ...(isEditMode && { id: branch.id }),
  providerId,
  branchName: data.branchName,
  governorateId: Number(data.governorateId),
  cityId: Number(data.cityId),
  email: data.email,
  userName: data.userName,
  password: data.password ? data.password : undefined,
  mapUrl: data.mapUrl || "",
  latitude: data.latitude,
  longitude: data.longitude,
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

      <div className="mb-1 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Governorate <span className="text-red-500">*</span>
          </label>
          <select
            {...governorateRegister}
            onChange={handleGovernorateChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
          >
            <option value="">Select governorate</option>
            {governorates.map((governorate) => (
              <option key={governorate.id} value={governorate.id}>
                {governorate.enName}
              </option>
            ))}
          </select>
          {errors.governorateId && (
            <p className="mt-1 text-xs text-red-500">{errors.governorateId.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            City <span className="text-red-500">*</span>
          </label>
          <select
            {...register("cityId")}
            disabled={!governorateId || isCitiesLoading}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">
              {isCitiesLoading ? "Loading..." : "Select city"}
            </option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.enName}
              </option>
            ))}
          </select>
          {errors.cityId && (
            <p className="mt-1 text-xs text-red-500">{errors.cityId.message}</p>
          )}
        </div>
      </div>

      <div className="mb-4" />

      <TextField label="Full Address" required {...register("fullAddress")} />
      {errors.fullAddress && (
        <p className="-mt-3 mb-3 text-xs text-red-500">{errors.fullAddress.message}</p>
      )}

      <TextField label="Map URL" required {...register("mapUrl")} />
      {errors.mapUrl && (
        <p className="-mt-3 mb-3 text-xs text-red-500">{errors.mapUrl.message}</p>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <TextField label="Latitude" required {...register("latitude")} />
          {errors.latitude && (
            <p className="mt-1 text-xs text-red-500">{errors.latitude.message}</p>
          )}
        </div>
        <div>
          <TextField label="Longitude" required {...register("longitude")} />
          {errors.longitude && (
            <p className="mt-1 text-xs text-red-500">{errors.longitude.message}</p>
          )}
        </div>
      </div>

      <TextField label="Email" required {...register("email")} />
      {errors.email && (
        <p className="-mt-3 mb-3 text-xs text-red-500">{errors.email.message}</p>
      )}

      <TextField label="Username" required {...register("userName")} />
      {errors.userName && (
        <p className="-mt-3 mb-3 text-xs text-red-500">{errors.userName.message}</p>
      )}

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Password {!isEditMode && <span className="text-red-500">*</span>}
          {isEditMode && (
            <span className="ml-1 text-xs font-normal text-slate-400">
              (leave blank to keep current password)
            </span>
          )}
        </label>
        <input
          type="password"
          {...register("password")}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

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