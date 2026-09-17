import FilterPanel from "../../../shared/components/FilterPanel";
import FilterPanelFooter from "../../../shared/components/FilterPanelFooter";
import FilterPanelHeader from "../../../shared/components/FilterPanelHeader";
import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getProviderLookup } from "../../providers/services/providersService";
import { getTicketTypes } from "../../ticket-types/services/ticketTypesService";
import { getEmployeeGroups } from "../services/ticketsService";

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400";

const optionLabel = (item) =>
  item?.enName && item?.arName
    ? `${item.enName} - ${item.arName}`
    : item?.enName || item?.arName || "";

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
        <SearchableAsyncSelect
          queryKey={["tickets", "ticket-types"]}
          fetchItems={(pageNumber, pageSize, searchTerm) =>
            getTicketTypes(pageNumber, pageSize, searchTerm)
          }
          value={draft.ticketTypeId}
          onChange={setValue("ticketTypeId")}
          getOptionLabel={optionLabel}
          getOptionValue={(item) => item.id}
          placeholder="All ticket types"
          searchPlaceholder="Search ticket types..."
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Provider
        </label>
        <SearchableAsyncSelect
          queryKey={["tickets", "providers"]}
          fetchItems={(pageNumber, pageSize, searchTerm) =>
            getProviderLookup({ pageNumber, pageSize, searchTerm })
          }
          value={draft.providerId}
          onChange={setValue("providerId")}
          getOptionLabel={optionLabel}
          getOptionValue={(item) => item.id}
          placeholder="All providers"
          searchPlaceholder="Search providers..."
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Employee Group
        </label>
        <SearchableAsyncSelect
          queryKey={["tickets", "employee-groups"]}
          fetchItems={(pageNumber, pageSize, searchTerm) =>
            getEmployeeGroups(pageNumber, pageSize, searchTerm)
          }
          value={draft.employeeGroupId}
          onChange={setValue("employeeGroupId")}
          getOptionLabel={optionLabel}
          getOptionValue={(item) => item.id}
          placeholder="All employee groups"
          searchPlaceholder="Search employee groups..."
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
