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
import ClientSelect from "../../../../shared/components/ClientSelect";
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

const employeeName = (employee, fallback = "-") => {
  if (!employee) return fallback;

  const englishName = employee.enName?.trim();
  const arabicName = employee.arName?.trim();

  if (!englishName && !arabicName) return fallback;

  return (
    <span className="block w-full text-left" dir="ltr">
      <span className="block truncate">{englishName || arabicName}</span>
      {englishName && arabicName && (
        <span
          className="mt-0.5 block truncate text-xs font-normal text-slate-500"
          dir="rtl"
          style={{ direction: "rtl", textAlign: "left", unicodeBidi: "isolate" }}
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
  const closedByEmployee =
    ticket.closedByEmployee || (ticket.isClosed ? ticket.createdByEmployee : null);
  const closedByEmployeeGroup =
    ticket.closedByEmployeeGroup ||
    (ticket.isClosed ? ticket.createdByEmployeeGroup : null);

  return (
    <div className="grid gap-x-6 gap-y-4 rounded-xl border border-slate-100 bg-slate-50/70 p-5 sm:grid-cols-2">
      <DetailItem icon={User} label="Client">
        {isEditing && editValues ? (
          <ClientSelect
            queryKey={["ticket-details", "clients"]}
            value={editValues.userId}
            onChange={(value, client) => {
              onEditValueChange("userId", value);
              onEditValueChange(
                "userPhoneNumber",
                client?.phoneNumber ?? client?.userPhoneNumber ?? ""
              );
              onEditValueChange("cardNumber", client?.cardNumber ?? "");
            }}
            fallbackLabel={ticket.userName || ""}
            placeholder={
              editValues.userId
                ? ticket.userName || "Select client"
                : "Select client"
            }
            error={visibleFieldErrors.userId}
          />
        ) : (
          <span className="block truncate">{ticket.userName || "-"}</span>
        )}
      </DetailItem>

      <DetailItem icon={Phone} label="Phone">
        {isEditing && editValues ? (
          <>
            <input
              type="text"
              value={editValues.userPhoneNumber}
              onChange={(e) =>
                onEditValueChange("userPhoneNumber", e.target.value)
              }
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 ${
                visibleFieldErrors.userPhoneNumber
                  ? "border-red-400"
                  : "border-slate-200"
              }`}
            />
            {visibleFieldErrors.userPhoneNumber && (
              <p className="mt-1 text-xs text-red-500">
                {visibleFieldErrors.userPhoneNumber}
              </p>
            )}
          </>
        ) : (
          <span className="block truncate">{ticket.userPhoneNumber || "-"}</span>
        )}
      </DetailItem>

      <DetailItem
        icon={CreditCard}
        label="Card Number"
        value={
          <span className="font-mono tracking-wide">
            {isEditing && editValues
              ? editValues.cardNumber || "-"
              : ticket.cardNumber || "-"}
          </span>
        }
      />

      <DetailItem icon={MessageSquare} label="Ticket Type">
        {isEditing && editValues ? (
          <TicketTypeSelect
            queryKey={["ticket-details", "ticket-types"]}
            value={editValues.ticketTypeId}
            onChange={(value) => onEditValueChange("ticketTypeId", value)}
            placeholder={
              editValues.ticketTypeId
                ? namePair(ticket.ticketType)
                : "Select ticket type"
            }
            error={visibleFieldErrors.ticketTypeId}
          />
        ) : (
          <span className="block truncate">{namePair(ticket.ticketType)}</span>
        )}
      </DetailItem>

      <DetailItem icon={Building2} label="Provider">
        {isEditing && editValues ? (
          <ProviderSelect
            queryKey={["ticket-details", "providers"]}
            value={editValues.providerId}
            onChange={(value) => onEditValueChange("providerId", value)}
            placeholder={
              editValues.providerId ? namePair(ticket.provider) : "No provider"
            }
            error={visibleFieldErrors.providerId}
          />
        ) : (
          <span className="block truncate">{namePair(ticket.provider)}</span>
        )}
      </DetailItem>

      <DetailItem icon={Users} label="Assigned Group">
        {isEditing && editValues ? (
          <EmployeeGroupSelect
            queryKey={["ticket-details", "employee-groups"]}
            value={editValues.assignedToGroupId}
            onChange={(value) => onEditValueChange("assignedToGroupId", value)}
            placeholder={
              editValues.assignedToGroupId
                ? namePair(ticket.assignedToGroup)
                : "No assigned group"
            }
            error={visibleFieldErrors.assignedToGroupId}
          />
        ) : (
          <span className="block truncate">
            {namePair(ticket.assignedToGroup)}
          </span>
        )}
      </DetailItem>

      <DetailItem icon={Flag} label="Priority">
        {isEditing && editValues ? (
          <>
            <select
              value={editValues.priority}
              onChange={(e) => onEditValueChange("priority", e.target.value)}
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 ${
                visibleFieldErrors.priority
                  ? "border-red-400"
                  : "border-slate-200"
              }`}
            >
              {PRIORITY_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {visibleFieldErrors.priority && (
              <p className="mt-1 text-xs text-red-500">
                {visibleFieldErrors.priority}
              </p>
            )}
          </>
        ) : (
          <StatusBadge tone={PRIORITY_TONE[ticket.priority] || "neutral"}>
            {ticket.priorityName || "-"}
          </StatusBadge>
        )}
      </DetailItem>

      <DetailItem
        icon={Clock}
        label="Created At"
        value={formatDateTimeShort(ticket.createdAt)}
      />
      <DetailItem
        icon={User}
        label="Created By"
        value={employeeName(ticket.createdByEmployee, ticket.createdByName)}
      />
      <DetailItem
        icon={Users}
        label="Created By Group"
        value={employeeName(ticket.createdByEmployeeGroup)}
      />

      <section className="sm:col-span-2 border-t border-slate-200 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Closed
        </p>
        <div className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <DetailItem
            icon={UserCheck}
            label="Closed By"
            value={employeeName(closedByEmployee)}
          />
          <DetailItem
            icon={Users}
            label="Closed By Group"
            value={employeeName(closedByEmployeeGroup)}
          />
        </div>
      </section>
    </div>
  );
}
