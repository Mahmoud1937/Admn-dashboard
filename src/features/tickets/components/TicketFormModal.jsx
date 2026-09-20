import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormActions from "../../../shared/components/FormActions";
import FormModalShell from "../../../shared/components/FormModalShell";
import ClientSelect from "../../../shared/components/ClientSelect";
import ProviderSelect from "../../../shared/components/ProviderSelect";
import TicketTypeSelect from "../../../shared/components/TicketTypeSelect";
import EmployeeGroupSelect from "../../../shared/components/EmployeeGroupSelect";
import TextField from "../../../shared/components/TextField";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import { ticketSchema } from "../schema/ticketSchema";
import { fieldClass } from "../utils/ticketDetailsUtils";
import { PRIORITY_OPTIONS } from "../constants/ticketOptions";

const EMPTY_VALUES = {
  ticketTypeId: "",
  userId: "",
  providerId: "",
  assignedToGroupId: "",
  userPhoneNumber: "",
  priority: "1",
  description: "",
};

export default function TicketFormModal({
  isOpen,
  onSave,
  onClose,
  isSaving,
  serverErrors,
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (isOpen) {
      reset(EMPTY_VALUES);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onSave({
      ticketTypeId: Number(data.ticketTypeId),
      userId: Number(data.userId),
      providerId: data.providerId ? Number(data.providerId) : null,
      assignedToGroupId: data.assignedToGroupId
        ? Number(data.assignedToGroupId)
        : null,
      userPhoneNumber: data.userPhoneNumber,
      priority: Number(data.priority),
      description: data.description,
    });
  };

  return (
    <FormModalShell
      title="Add Ticket"
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      formClassName="max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar"
    >
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Ticket Type <span className="text-red-500">*</span>
        </label>
        <Controller
          name="ticketTypeId"
          control={control}
          render={({ field }) => (
            <TicketTypeSelect
              queryKey={["ticket-form", "ticket-types"]}
              value={field.value}
              onChange={field.onChange}
              placeholder="Select ticket type"
              error={errors.ticketTypeId?.message}
            />
          )}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Client <span className="text-red-500">*</span>
        </label>
        <Controller
          name="userId"
          control={control}
          render={({ field }) => (
            <ClientSelect
              queryKey={["ticket-form", "clients"]}
              value={field.value}
              onChange={field.onChange}
              placeholder="Select client"
              error={errors.userId?.message}
            />
          )}
        />
      </div>

      <TextField
        label="User Phone Number"
        required
        inputMode="numeric"
        sanitize={false}
        {...register("userPhoneNumber")}
        error={errors.userPhoneNumber?.message}
      />

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Provider
        </label>
        <Controller
          name="providerId"
          control={control}
          render={({ field }) => (
            <ProviderSelect
              queryKey={["ticket-form", "providers"]}
              value={field.value}
              onChange={field.onChange}
              placeholder="No provider"
              error={errors.providerId?.message}
            />
          )}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Assigned Group
        </label>
        <Controller
          name="assignedToGroupId"
          control={control}
          render={({ field }) => (
            <EmployeeGroupSelect
              queryKey={["ticket-form", "employee-groups"]}
              value={field.value}
              onChange={field.onChange}
              placeholder="No assigned group"
              error={errors.assignedToGroupId?.message}
            />
          )}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Priority <span className="text-red-500">*</span>
        </label>
        <select {...register("priority")} className={fieldClass}>
          {PRIORITY_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.priority && (
          <p className="mt-1 text-xs text-red-500">{errors.priority.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400 ${
            errors.description ? "border-red-400" : "border-slate-200"
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      <FormActions
        onCancel={onClose}
        isSaving={isSaving}
        submitLabel="Add Ticket"
      />
    </FormModalShell>
  );
}
