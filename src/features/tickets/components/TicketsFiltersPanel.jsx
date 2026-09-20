import FilterPanel from "../../../shared/components/FilterPanel";
import FilterPanelFooter from "../../../shared/components/FilterPanelFooter";
import FilterPanelHeader from "../../../shared/components/FilterPanelHeader";
import ProviderSelect from "../../../shared/components/ProviderSelect";
import TicketTypeSelect from "../../../shared/components/TicketTypeSelect";
import EmployeeGroupSelect from "../../../shared/components/EmployeeGroupSelect";
import { fieldClass } from "../utils/ticketDetailsUtils";

export default function TicketsFiltersPanel({
  draft,
  onChange,
  onApply,
  onClear,
  onClose,
  panelRef,
}) {
  const set = (field) => (e) =>
    onChange((prev) => ({ ...prev, [field]: e.target.value }));

  const setValue = (field) => (value) =>
    onChange((prev) => ({ ...prev, [field]: value }));

  return (
    <FilterPanel panelRef={panelRef} onClose={onClose} className="sm:w-96">
      <FilterPanelHeader onClose={onClose} />

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Ticket Type
        </label>
        <TicketTypeSelect
          queryKey={["tickets", "ticket-types"]}
          value={draft.ticketTypeId}
          onChange={setValue("ticketTypeId")}
          placeholder="All ticket types"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Provider
        </label>
        <ProviderSelect
          queryKey={["tickets", "providers"]}
          value={draft.providerId}
          onChange={setValue("providerId")}
          placeholder="All providers"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Employee Group
        </label>
        <EmployeeGroupSelect
          queryKey={["tickets", "employee-groups"]}
          value={draft.employeeGroupId}
          onChange={setValue("employeeGroupId")}
          placeholder="All employee groups"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Priority
        </label>
        <select
          value={draft.priority}
          onChange={set("priority")}
          className={fieldClass}
        >
          <option value="">All priorities</option>
          <option value="0">Low</option>
          <option value="1">Medium</option>
          <option value="2">High</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Status
        </label>
        <select
          value={draft.isClosed}
          onChange={set("isClosed")}
          className={fieldClass}
        >
          <option value="">All statuses</option>
          <option value="false">Open</option>
          <option value="true">Closed</option>
        </select>
      </div>

      <FilterPanelFooter onClear={onClear} onApply={onApply} />
    </FilterPanel>
  );
}