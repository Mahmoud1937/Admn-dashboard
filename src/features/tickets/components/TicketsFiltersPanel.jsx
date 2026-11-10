import { useTranslation } from "react-i18next";
import FilterPanel from "../../../shared/components/FilterPanel";
import FilterPanelFooter from "../../../shared/components/FilterPanelFooter";
import FilterPanelHeader from "../../../shared/components/FilterPanelHeader";
import ClientSelect from "../../../shared/components/ClientSelect";
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
  const { t } = useTranslation("adminPages");
  const set = (field) => (e) =>
    onChange((prev) => ({ ...prev, [field]: e.target.value }));

  const setValue = (field) => (value) =>
    onChange((prev) => ({ ...prev, [field]: value }));

  return (
    <FilterPanel panelRef={panelRef} onClose={onClose} className="sm:w-96">
      <FilterPanelHeader onClose={onClose} />

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          {t("Client")}
        </label>
        <ClientSelect
          queryKey={["tickets", "clients"]}
          value={draft.userId}
          onChange={setValue("userId")}
          placeholder={t("All clients")}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          {t("Ticket Type")}
        </label>
        <TicketTypeSelect
          queryKey={["tickets", "ticket-types"]}
          value={draft.ticketTypeId}
          onChange={setValue("ticketTypeId")}
          placeholder={t("All ticket types")}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          {t("Provider")}
        </label>
        <ProviderSelect
          queryKey={["tickets", "providers"]}
          value={draft.providerId}
          onChange={setValue("providerId")}
          placeholder={t("All providers")}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          {t("Employee Group")}
        </label>
        <EmployeeGroupSelect
          queryKey={["tickets", "employee-groups"]}
          value={draft.employeeGroupId}
          onChange={setValue("employeeGroupId")}
          placeholder={t("All employee groups")}
              clearable
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          {t("Priority")}
        </label>
        <select
          value={draft.priority}
          onChange={set("priority")}
          className={fieldClass}
        >
          <option value="">{t("All priorities")}</option>
          <option value="0">{t("Low")}</option>
          <option value="1">{t("Medium")}</option>
          <option value="2">{t("High")}</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          {t("Status")}
        </label>
        <select
          value={draft.isClosed}
          onChange={set("isClosed")}
          className={fieldClass}
        >
          <option value="">{t("All statuses")}</option>
          <option value="false">{t("Open")}</option>
          <option value="true">{t("Closed")}</option>
        </select>
      </div>

      <FilterPanelFooter onClear={onClear} onApply={onApply} />
    </FilterPanel>
  );
}
