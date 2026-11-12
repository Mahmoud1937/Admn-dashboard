import localizeMessage from "../../../../localization/localizeMessage";
import { useTranslation } from "react-i18next";
import {
  User,
  Phone,
  CreditCard,
  Building2,
  Users,
  Clock,
  MessageSquare,
  Flag,
  UserCheck,
} from "lucide-react";
import StatusBadge from "../../../../shared/components/StatusBadge";
import ProviderSelect from "../../../../shared/components/ProviderSelect";
import TicketTypeSelect from "../../../../shared/components/TicketTypeSelect";
import EmployeeGroupSelect from "../../../../shared/components/EmployeeGroupSelect";
import { formatDateTimeShort } from "../../../../utils/formatDate";
import {
  PRIORITY_TONE,
  namePair,
} from "../../utils/ticketDetailsUtils";
import { PRIORITY_OPTIONS } from "../../constants/ticketOptions";
import DetailItem from "./DetailItem";

const RTL_TEXT_PATTERN = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;

const employeeName = (employee, fallback = "-") => {
  if (!employee) return fallback;

  const firstLastName = [employee.firstName, employee.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const englishName = firstLastName || employee.enName?.trim();
  const arabicName = employee.arName?.trim();

  if (!englishName && !arabicName) return fallback;

  return (
    <span className="block w-full text-start">
      <span className="block truncate">{englishName || arabicName}</span>
      {englishName && arabicName && (
        <span
          className="mt-0.5 block truncate text-xs font-normal text-slate-500"
          dir="rtl"
          style={{ direction: "rtl", textAlign: "start", unicodeBidi: "isolate" }}
        >
          {arabicName}
        </span>
      )}
    </span>
  );
};

export default function TicketDetailsOverview({
  ticket,
  isEditing,
  editValues,
  visibleFieldErrors,
  onEditValueChange,
}) {
  const { t } = useTranslation("adminPages");
  const closedByEmployee =
    ticket.closedByEmployee || (ticket.isClosed ? ticket.createdByEmployee : null);
  const closedByEmployeeGroup =
    ticket.closedByEmployeeGroup ||
    (ticket.isClosed ? ticket.createdByEmployeeGroup : null);
  const clientName = ticket.userName || "-";
  const clientNameDirection = RTL_TEXT_PATTERN.test(clientName)
    ? "rtl"
    : "ltr";

  return (
    <div className="grid gap-x-6 gap-y-4 text-[9px] sm:grid-cols-2">
      <DetailItem icon={User} label={t("Client")}>
        <span
          className="block truncate text-sm"
          dir={clientNameDirection}
          title={clientName}
        >
          {clientName}
        </span>
      </DetailItem>

      <DetailItem icon={Phone} label={t("Phone")}>
        <span className="block truncate">{ticket.userPhoneNumber || "-"}</span>
      </DetailItem>

      <DetailItem
        icon={CreditCard}
        label={t("Card Number")}
        value={
          <span className="font-mono tracking-wide">
            {isEditing && editValues
              ? editValues.cardNumber || "-"
              : ticket.cardNumber || "-"}
          </span>
        }
      />

      <DetailItem icon={MessageSquare} label={t("Ticket Type")}>
        {isEditing && editValues ? (
          <TicketTypeSelect
            queryKey={["ticket-details", "ticket-types"]}
            value={editValues.ticketTypeId}
            onChange={(value) => onEditValueChange("ticketTypeId", value)}
            placeholder={
              editValues.ticketTypeId
                ? namePair(ticket.ticketType)
                : t("Select ticket type")
            }
            error={localizeMessage(visibleFieldErrors.ticketTypeId)}
            highlighted
          />
        ) : (
          <span className="block truncate">{namePair(ticket.ticketType)}</span>
        )}
      </DetailItem>

      <DetailItem icon={Building2} label={t("Provider")}>
        {isEditing && editValues ? (
          <ProviderSelect
            queryKey={["ticket-details", "providers"]}
            value={editValues.providerId}
            onChange={(value) => onEditValueChange("providerId", value)}
            placeholder={
              editValues.providerId ? namePair(ticket.provider) : t("No provider")
            }
            error={localizeMessage(visibleFieldErrors.providerId)}
            highlighted
          />
        ) : (
          <span className="block truncate">{namePair(ticket.provider)}</span>
        )}
      </DetailItem>

      <DetailItem icon={Users} label={t("Assigned Group")}>
        {isEditing && editValues ? (
          <EmployeeGroupSelect
            queryKey={["ticket-details", "employee-groups"]}
            value={editValues.assignedToGroupId}
            onChange={(value) => onEditValueChange("assignedToGroupId", value)}
                clearable
            placeholder={
              editValues.assignedToGroupId
                ? namePair(ticket.assignedToGroup)
                : t("No assigned group")
            }
            error={localizeMessage(visibleFieldErrors.assignedToGroupId)}
            highlighted
          />
        ) : (
          <span className="block truncate">
            {namePair(ticket.assignedToGroup)}
          </span>
        )}
      </DetailItem>

      <DetailItem icon={Flag} label={t("Priority")}>
        {isEditing && editValues ? (
          <>
            <select
              value={editValues.priority}
              onChange={(e) => onEditValueChange("priority", e.target.value)}
              className={`w-full rounded-lg border bg-blue-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 ${
                visibleFieldErrors.priority
                  ? "border-red-400"
                  : "border-slate-200"
              }`}
            >
              {PRIORITY_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {t(label)}
                </option>
              ))}
            </select>
            {visibleFieldErrors.priority && (
              <p className="mt-1 text-xs text-red-500">
                {localizeMessage(visibleFieldErrors.priority)}
              </p>
            )}
          </>
        ) : (
          <StatusBadge tone={PRIORITY_TONE[ticket.priority] || "neutral"}>
            {t(PRIORITY_OPTIONS.find(option => Number(option.value) === ticket.priority)?.label || ticket.priorityName || "-")}
          </StatusBadge>
        )}
      </DetailItem>

      <DetailItem
        icon={Clock}
        label={t("Created At")}
        value={formatDateTimeShort(ticket.createdAt)}
      />
      <DetailItem
        icon={User}
        label={t("Created By")}
        value={employeeName(ticket.createdByEmployee, ticket.createdByName)}
      />
      <DetailItem
        icon={Users}
        label={t("Created By Group")}
        value={employeeName(ticket.createdByEmployeeGroup)}
      />

      <section className="border-t border-slate-200 pt-4 sm:col-span-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {t("Closed")}
        </p>
        <div className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <DetailItem
            icon={UserCheck}
            label={t("Closed By")}
            value={employeeName(closedByEmployee)}
          />
          <DetailItem
            icon={Users}
            label={t("Closed By Group")}
            value={employeeName(closedByEmployeeGroup)}
          />
        </div>
      </section>
    </div>
  );
}
