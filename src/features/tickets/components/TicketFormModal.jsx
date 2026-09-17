import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormActions from "../../../shared/components/FormActions";
import FormModalShell from "../../../shared/components/FormModalShell";
import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import TextField from "../../../shared/components/TextField";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import { getClients } from "../../clients/services/clientsService";
import { getProviderLookup } from "../../providers/services/providersService";
import { getTicketTypes } from "../../ticket-types/services/ticketTypesService";
import { getEmployeeGroups } from "../services/ticketsService";
import { ticketSchema } from "../schema/ticketSchema";

const EMPTY_VALUES = {
  ticketTypeId: "",
  userId: "",
  providerId: "",
  assignedToGroupId: "",
  userPhoneNumber: "",
  priority: "1",
  description: "",
};

const optionLabel = (item) =>
  item?.enName && item?.arName
    ? `${item.enName} - ${item.arName}`
    : item?.enName || item?.arName || "";

const clientLabel = (client) => client.userName || "";

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400";

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
            <SearchableAsyncSelect
              queryKey={["ticket-form", "ticket-types"]}
              fetchItems={(pageNumber, pageSize, searchTerm) =>
                getTicketTypes(pageNumber, pageSize, searchTerm)
              }
              value={field.value}
              onChange={field.onChange}
              getOptionLabel={optionLabel}
              getOptionValue={(item) => item.id}
              placeholder="Select ticket type"
              searchPlaceholder="Search ticket types..."
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
            <SearchableAsyncSelect
              queryKey={["ticket-form", "clients"]}
              fetchItems={(pageNumber, pageSize, searchTerm) =>
                getClients({ pageNumber, pageSize, searchTerm })
              }
              value={field.value}
              onChange={field.onChange}
              getOptionLabel={clientLabel}
              getOptionValue={(item) => item.clientId}
              placeholder="Select client"
              searchPlaceholder="Search clients..."
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
            <SearchableAsyncSelect
              queryKey={["ticket-form", "providers"]}
              fetchItems={(pageNumber, pageSize, searchTerm) =>
                getProviderLookup({ pageNumber, pageSize, searchTerm })
              }
              value={field.value}
              onChange={field.onChange}
              getOptionLabel={optionLabel}
              getOptionValue={(item) => item.id}
              placeholder="No provider"
              searchPlaceholder="Search providers..."
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
            <SearchableAsyncSelect
              queryKey={["ticket-form", "employee-groups"]}
              fetchItems={(pageNumber, pageSize, searchTerm) =>
                getEmployeeGroups(pageNumber, pageSize, searchTerm)
              }
              value={field.value}
              onChange={field.onChange}
              getOptionLabel={optionLabel}
              getOptionValue={(item) => item.id}
              placeholder="No assigned group"
              searchPlaceholder="Search employee groups..."
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
          <option value="0">Low</option>
          <option value="1">Medium</option>
          <option value="2">High</option>
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
