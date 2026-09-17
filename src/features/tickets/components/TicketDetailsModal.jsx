import { useState } from "react";
import {
  X,
  User,
  Phone,
  CreditCard,
  Building2,
  Users,
  Clock,
  MessageSquare,
  CheckCircle2,
  FileText,
  Flag,
} from "lucide-react";
import StatusBadge from "../../../shared/components/StatusBadge";
import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { formatDateTimeShort } from "../../../utils/formatDate";
import { getClients } from "../../clients/services/clientsService";
import { getProviderLookup } from "../../providers/services/providersService";
import { getTicketTypes } from "../../ticket-types/services/ticketTypesService";
import { useTicketDetailsQuery } from "../hooks/useTicketDetailsQuery";
import { getEmployeeGroups } from "../services/ticketsService";

const PRIORITY_TONE = {
  0: "neutral",
  1: "warning",
  2: "danger",
};

const TAG_STYLES = {
  amber: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-600",
};

const CIRCLE_STYLES = {
  amber: "bg-amber-100 text-amber-600",
  green: "bg-emerald-100 text-emerald-600",
  red: "bg-red-100 text-red-600",
  blue: "bg-blue-100 text-blue-600",
};

// Maps a timeline step to a tag color: closed => green, otherwise by status
const stepTagColor = (item, isClosed) => {
  if (isClosed) return "green";
  if (item.status === 2) return "red";
  if (item.status === 1) return "blue";
  return "amber";
};

const namePair = (item) => {
  if (!item) return "-";
  return [item.enName, item.arName].filter(Boolean).join(" - ") || "-";
};

const optionLabel = (item) =>
  item?.enName && item?.arName
    ? `${item.enName} - ${item.arName}`
    : item?.enName || item?.arName || "";

const clientLabel = (client) => client.userName || "";

const getServerErrorMessage = (serverErrors) => {
  if (!serverErrors || typeof serverErrors !== "object") return "";

  return Object.values(serverErrors)
    .flat()
    .filter(Boolean)
    .join(" ");
};

function DetailItem({ icon: Icon, label, value, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-100">
        {Icon && <Icon size={15} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <div className="mt-0.5 min-w-0 text-sm font-semibold text-slate-800">
          {children || <span className="block truncate">{value || "-"}</span>}
        </div>
      </div>
    </div>
  );
}

const getEditValues = (ticket, timelines) => ({
  status: String(timelines.at(-1)?.status ?? 1),
  isClosed: String(Boolean(ticket.isClosed)),
  userId: ticket.userId ?? "",
  ticketTypeId: ticket.ticketType?.id ?? "",
  providerId: ticket.provider?.id ?? "",
  assignedToGroupId: ticket.assignedToGroup?.id ?? "",
  userPhoneNumber: ticket.userPhoneNumber ?? "",
  priority: String(ticket.priority ?? 1),
  description: ticket.description ?? "",
  reply: timelines.at(-1)?.reply ?? "",
});

export default function TicketDetailsModal({
  ticketId,
  onClose,
  onUpdate,
  isSaving,
  serverErrors,
}) {
  const { data, isLoading, isError } = useTicketDetailsQuery(ticketId, !!ticketId);
  const ticket = data?.data;
  const timelines = ticket?.ticketTimelines ?? [];
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState(null);
  const [replyError, setReplyError] = useState("");
  const serverErrorMessage = getServerErrorMessage(serverErrors);

  const setEditValue = (name, value) => {
    if (name === "reply" && value.trim()) {
      setReplyError("");
    }

    setEditValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const startEditing = () => {
    if (!ticket) return;

    setEditValues(getEditValues(ticket, timelines));
    setReplyError("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditValues(null);
    setReplyError("");
  };

  const handleUpdate = () => {
    if (!ticket || !editValues) return;

    if (!editValues.reply?.trim()) {
      setReplyError("Reply is required");
      return;
    }

    const payload = {
      reply: editValues.reply.trim(),
      status: Number(editValues.status ?? 1),
      isClosed: editValues.isClosed === "true",
      ticketTypeId: editValues.ticketTypeId === "" ? null : Number(editValues.ticketTypeId),
      userId: editValues.userId === "" ? null : Number(editValues.userId),
      providerId: editValues.providerId === "" ? null : Number(editValues.providerId),
      assignedToGroupId:
        editValues.assignedToGroupId === ""
          ? null
          : Number(editValues.assignedToGroupId),
      userPhoneNumber: editValues.userPhoneNumber ?? "",
      priority: Number(editValues.priority ?? 1),
      description: editValues.description ?? "",
    };

    onUpdate(payload, {
      onSuccess: cancelEditing,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-[2px] sm:p-4"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
      >
        {/* Header */}
        <div className="flex items-start justify-between bg-blue-900 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Ticket Details
            </h3>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
              <span>Ticket ID</span>
              <span className="rounded-md bg-white  px-2 py-0.5 font-mono text-xs font-semibold text-blue-900">
                #{ticketId}
              </span>
              {ticket && !isEditing && (
                <StatusBadge tone={ticket.isClosed ? "success" : "warning"}>
                  {ticket.isClosed ? "Closed" : "Open"}
                </StatusBadge>
              )}
              {ticket && isEditing && editValues && (
                <select
                  value={editValues.isClosed}
                  onChange={(e) => setEditValue("isClosed", e.target.value)}
                  className="rounded-md border border-white/20 bg-white px-2 py-0.5 text-xs font-semibold text-blue-900 outline-none"
                >
                  <option value="false">Open</option>
                  <option value="true">Closed</option>
                </select>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 custom-scrollbar">
          {isLoading && (
            <p className="py-8 text-center text-sm text-slate-400">
              Loading ticket details...
            </p>
          )}

          {isError && (
            <p className="py-8 text-center text-sm text-red-500">
              Failed to load ticket details.
            </p>
          )}

          {!isLoading && !isError && ticket && (
            <div className="space-y-6">
              {/* Overview */}
              <div className="grid gap-x-6 gap-y-4 rounded-xl border border-slate-100 bg-slate-50/70 p-5 sm:grid-cols-2">
                <DetailItem icon={User} label="Client">
                  {isEditing && editValues ? (
                    <SearchableAsyncSelect
                      queryKey={["ticket-details", "clients"]}
                      fetchItems={(pageNumber, pageSize, searchTerm) =>
                        getClients({ pageNumber, pageSize, searchTerm })
                      }
                      value={editValues.userId}
                      onChange={(value) => setEditValue("userId", value)}
                      getOptionLabel={clientLabel}
                      getOptionValue={(item) => item.clientId}
                      placeholder={ticket.userName || "Select client"}
                      searchPlaceholder="Search clients..."
                    />
                  ) : (
                    <span className="block truncate">
                      {ticket.userName || "-"}
                    </span>
                  )}
                </DetailItem>
                <DetailItem
                  icon={Phone}
                  label="Phone"
                >
                  {isEditing && editValues ? (
                    <input
                      type="text"
                      value={editValues.userPhoneNumber}
                      onChange={(e) =>
                        setEditValue("userPhoneNumber", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="block truncate">
                      {ticket.userPhoneNumber || "-"}
                    </span>
                  )}
                </DetailItem>
                <DetailItem
                  icon={CreditCard}
                  label="Card Number"
                  value={
                    <span className="font-mono tracking-wide">
                      {ticket.cardNumber}
                    </span>
                  }
                />
                <DetailItem
                  icon={MessageSquare}
                  label="Ticket Type"
                >
                  {isEditing && editValues ? (
                    <SearchableAsyncSelect
                      queryKey={["ticket-details", "ticket-types"]}
                      fetchItems={(pageNumber, pageSize, searchTerm) =>
                        getTicketTypes(pageNumber, pageSize, searchTerm)
                      }
                      value={editValues.ticketTypeId}
                      onChange={(value) => setEditValue("ticketTypeId", value)}
                      getOptionLabel={optionLabel}
                      getOptionValue={(item) => item.id}
                      placeholder={namePair(ticket.ticketType)}
                      searchPlaceholder="Search ticket types..."
                    />
                  ) : (
                    <span className="block truncate">
                      {namePair(ticket.ticketType)}
                    </span>
                  )}
                </DetailItem>
                <DetailItem
                  icon={Building2}
                  label="Provider"
                >
                  {isEditing && editValues ? (
                    <SearchableAsyncSelect
                      queryKey={["ticket-details", "providers"]}
                      fetchItems={(pageNumber, pageSize, searchTerm) =>
                        getProviderLookup({ pageNumber, pageSize, searchTerm })
                      }
                      value={editValues.providerId}
                      onChange={(value) => setEditValue("providerId", value)}
                      getOptionLabel={optionLabel}
                      getOptionValue={(item) => item.id}
                      placeholder={namePair(ticket.provider)}
                      searchPlaceholder="Search providers..."
                    />
                  ) : (
                    <span className="block truncate">
                      {namePair(ticket.provider)}
                    </span>
                  )}
                </DetailItem>
                <DetailItem
                  icon={Users}
                  label="Assigned Group"
                >
                  {isEditing && editValues ? (
                    <SearchableAsyncSelect
                      queryKey={["ticket-details", "employee-groups"]}
                      fetchItems={(pageNumber, pageSize, searchTerm) =>
                        getEmployeeGroups(pageNumber, pageSize, searchTerm)
                      }
                      value={editValues.assignedToGroupId}
                      onChange={(value) =>
                        setEditValue("assignedToGroupId", value)
                      }
                      getOptionLabel={optionLabel}
                      getOptionValue={(item) => item.id}
                      placeholder={namePair(ticket.assignedToGroup)}
                      searchPlaceholder="Search employee groups..."
                    />
                  ) : (
                    <span className="block truncate">
                      {namePair(ticket.assignedToGroup)}
                    </span>
                  )}
                </DetailItem>
                <DetailItem icon={Flag} label="Priority">
                  {isEditing && editValues ? (
                    <select
                      value={editValues.priority}
                      onChange={(e) => setEditValue("priority", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-400"
                    >
                      <option value="0">Low</option>
                      <option value="1">Medium</option>
                      <option value="2">High</option>
                    </select>
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
                <DetailItem label="Created By" value={ticket.createdByName} />
                <DetailItem label="Closed By" value={ticket.closedByName} />
                <DetailItem
                  label="Closed By Employee"
                  value={namePair(ticket.closedByEmployee)}
                />
              </div>

              {/* Description */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Description
                </p>
                {isEditing && editValues ? (
                  <textarea
                    value={editValues.description}
                    onChange={(e) =>
                      setEditValue("description", e.target.value)
                    }
                    rows={4}
                    className="w-full rounded-xl border border-slate-100 bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm outline-none focus:border-blue-400"
                  />
                ) : (
                  <p className="rounded-xl border border-slate-100 bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
                    {ticket.description || "-"}
                  </p>
                )}
              </div>

              {/* Timeline */}
              <div key={`${ticket.id}-${ticket.isClosed}-${timelines.length}`}>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Timeline
                </p>

                {timelines.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                    No timeline data available.
                  </p>
                ) : (
                  <div className="relative rounded-xl border border-slate-200 px-4 py-4">
                    {timelines.map((item, i) => {
                      const author = item.createdByName || item.createdBy || "-";
                      const tagColor = stepTagColor(item, ticket.isClosed);
                      const isUsed = tagColor === "green" || tagColor === "blue";
                      const isLastTimelineItem = i === timelines.length - 1;

                      return (
                        <div key={item.id} className="relative pb-4 last:pb-0 pl-9">
                          {i < timelines.length - 1 && (
                            <div className="absolute top-8 bottom-0 left-[15px] w-px bg-slate-200" />
                          )}

                          <div
                            className={`absolute top-0 left-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              CIRCLE_STYLES[tagColor] || CIRCLE_STYLES.blue
                            }`}
                          >
                            {isUsed ? <CheckCircle2 size={16} /> : <FileText size={16} />}
                          </div>

                          <p className="text-[15px] font-semibold text-slate-900">
                            {item.statusName || `Status ${item.status}`}
                          </p>

                          {isEditing && editValues && isLastTimelineItem ? (
                            <>
                              <textarea
                                value={editValues.reply}
                                onChange={(e) =>
                                  setEditValue("reply", e.target.value)
                                }
                                rows={3}
                                className={`mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm leading-6 text-slate-700 outline-none focus:border-blue-400 ${
                                  replyError ? "border-red-400" : "border-slate-200"
                                }`}
                              />
                              {replyError && (
                                <p className="mt-1 text-xs text-red-500">
                                  {replyError}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="mt-1.5 text-sm leading-6 text-slate-700">
                              {item.reply || "-"}
                            </p>
                          )}

                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock size={12} />
                            <span>{formatDateTimeShort(item.createdAt)}</span>
                          </div>

                          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                            <span className="shrink-0 text-slate-400">by</span>
                            <span className="truncate text-slate-700" title={author}>
                              {author}
                            </span>
                            <span
                              className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                TAG_STYLES[tagColor] || TAG_STYLES.blue
                              }`}
                            >
                              {item.statusName || `Status ${item.status}`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {isEditing && serverErrorMessage && (
                <p className="text-xs text-red-500">{serverErrorMessage}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
          >
            Close
          </button>
          {ticket && !isEditing && (
            <button
              type="button"
              onClick={startEditing}
              className="cursor-pointer rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
            >
              Update
            </button>
          )}
          {ticket && isEditing && (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isSaving}
                className="cursor-pointer rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
