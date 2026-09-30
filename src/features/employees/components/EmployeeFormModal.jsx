import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import EmployeeGroupSelect from "../../../shared/components/EmployeeGroupSelect";
import FormActions from "../../../shared/components/FormActions";
import FormModalShell from "../../../shared/components/FormModalShell";
import TextField from "../../../shared/components/TextField";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import { employeeSchema } from "../schema/employeeSchema";

export default function EmployeeFormModal({
  isOpen,
  employee,
  onSave,
  onClose,
  isSaving,
  serverErrors,
}) {
  const isEditMode = Boolean(employee);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      employeeGroupId: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    reset({
      firstName: employee?.firstName ?? "",
      lastName: employee?.lastName ?? "",
      email: employee?.email ?? "",
      phoneNumber: employee?.phoneNumber ?? "",
      employeeGroupId:
        employee?.employeeGroupId ?? employee?.groupId ?? employee?.employeeMemberId ?? "",
    });
  }, [employee, isOpen, reset]);

  useEffect(() => {
    applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  if (!isOpen) return null;

  return (
    <FormModalShell
      title={isEditMode ? "Edit Employee" : "Add Employee"}
      onClose={onClose}
      onSubmit={handleSubmit(onSave)}
    >
      <TextField
        label="First Name"
        required
        autoFocus
        {...register("firstName")}
        error={errors.firstName?.message}
      />
      <TextField
        label="Last Name"
        required
        {...register("lastName")}
        error={errors.lastName?.message}
      />
      <TextField
        label="Email"
        required
        type="email"
        sanitize={false}
        {...register("email")}
        error={errors.email?.message}
      />
      <TextField
        label="Phone Number"
        required
        sanitize={false}
        {...register("phoneNumber")}
        error={errors.phoneNumber?.message}
      />

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Employee Group <span className="text-red-500">*</span>
        </label>
        <Controller
          name="employeeGroupId"
          control={control}
          render={({ field }) => (
            <EmployeeGroupSelect
              queryKey={["employee-groups", "employee-edit"]}
              value={field.value}
              onChange={field.onChange}
              placeholder="Select employee group"
              error={errors.employeeGroupId?.message}
            />
          )}
        />
      </div>

      <FormActions
        onCancel={onClose}
        isSaving={isSaving}
        submitLabel={isEditMode ? "Save Changes" : "Add Employee"}
      />
    </FormModalShell>
  );
}
