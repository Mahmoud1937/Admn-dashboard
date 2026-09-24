import { ticketSchema } from "../schema/ticketSchema";

export const PRIORITY_TONE = {
  0: "neutral",
  1: "warning",
  2: "danger",
};

export const TAG_STYLES = {
  amber: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-violet-100 text-violet-700",
};

export const CIRCLE_STYLES = {
  amber: "bg-amber-100 text-amber-600",
  green: "bg-emerald-100 text-emerald-600",
  red: "bg-red-100 text-red-600",
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-violet-100 text-violet-600",
};

const TICKET_STATUS = {
  1: { label: "Created", color: "blue" },
  2: { label: "Closed", color: "green" },
  3: { label: "Assigned", color: "purple" },
  4: { label: "Reply", color: "amber" },
};

const KNOWN_ERROR_FIELDS = new Set([
  "reply",
  "status",
  "isClosed",
  "ticketTypeId",
  "userId",
  "providerId",
  "assignedToGroupId",
  "userPhoneNumber",
  "priority",
  "description",
]);

const REQUIRED_UPDATE_MESSAGES = {
  reply: "Reply is required",
  isClosed: "Ticket state is required",
};

export const getTicketStatus = (status) =>
  TICKET_STATUS[status] || { label: `Status ${status}`, color: "amber" };

export const namePair = (item) => {
  if (!item) return "-";
  return [item.enName, item.arName].filter(Boolean).join(" - ") || "-";
};

export const optionLabel = (item) =>
  item?.enName && item?.arName
    ? `${item.enName} - ${item.arName}`
    : item?.enName || item?.arName || "";

export const clientLabel = (client) => client?.userName || "";

export const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400";

const normalizeFieldKey = (fieldName) =>
  String(fieldName || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();

const FIELD_NAME_BY_KEY = new Map(
  [...KNOWN_ERROR_FIELDS].map((fieldName) => [
    normalizeFieldKey(fieldName),
    fieldName,
  ])
);

const toFieldName = (fieldName) =>
  FIELD_NAME_BY_KEY.get(normalizeFieldKey(fieldName)) ||
  (fieldName
    ? fieldName.charAt(0).toLowerCase() + fieldName.slice(1)
    : "");

export const getServerFieldErrors = (serverErrors, dismissedFields) => {
  if (!serverErrors || typeof serverErrors !== "object") return {};

  return Object.fromEntries(
    Object.entries(serverErrors)
      .map(([fieldName, messages]) => [
        toFieldName(fieldName),
        Array.isArray(messages) ? messages.filter(Boolean).join(" ") : messages,
      ])
      .filter(
        ([fieldName]) =>
          KNOWN_ERROR_FIELDS.has(fieldName) && !dismissedFields.has(fieldName)
      )
  );
};

export const getGeneralServerErrorMessage = (serverErrors) => {
  if (!serverErrors || typeof serverErrors !== "object") return "";

  return Object.entries(serverErrors)
    .filter(([fieldName]) => {
      const localFieldName = toFieldName(fieldName);
      return !KNOWN_ERROR_FIELDS.has(localFieldName);
    })
    .flatMap(([, messages]) =>
      Array.isArray(messages) ? messages : [messages]
    )
    .filter(Boolean)
    .join(" ");
};

export const getEditValues = (ticket, timelines) => {
  const currentStatus = timelines.at(-1)?.status;

  return {
    status:
      Number(currentStatus) === 1
        ? ""
        : String(currentStatus ?? 3),
    isClosed: String(Boolean(ticket.isClosed)),
    userId: ticket.userId ?? "",
    ticketTypeId: ticket.ticketType?.id ?? "",
    providerId: ticket.provider?.id ?? "",
    assignedToGroupId: ticket.assignedToGroup?.id ?? "",
    userPhoneNumber: ticket.userPhoneNumber ?? "",
    priority: String(ticket.priority ?? 1),
    description: ticket.description ?? "",
    reply: timelines.at(-1)?.reply ?? "",
  };
};

const hasPayloadValue = (value) =>
  value !== "" && value !== null && value !== undefined;

const optionalNumber = (value) =>
  hasPayloadValue(value) ? Number(value) : undefined;

const getFirstFieldError = (fieldErrors, fieldName) =>
  fieldErrors[fieldName]?.[0] || "";

export const validateEditValues = (values) => {
  const result = ticketSchema.safeParse({
    ticketTypeId: values.ticketTypeId,
    userId: values.userId,
    providerId: values.providerId,
    assignedToGroupId: values.assignedToGroupId,
    userPhoneNumber: values.userPhoneNumber,
    priority: values.priority,
    description: values.description,
  });

  const errors = {};

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    [
      "ticketTypeId",
      "userId",
      "userPhoneNumber",
      "priority",
      "description",
    ].forEach((fieldName) => {
      const message = getFirstFieldError(fieldErrors, fieldName);
      if (message) errors[fieldName] = message;
    });
  }

  Object.entries(REQUIRED_UPDATE_MESSAGES).forEach(([fieldName, message]) => {
    if (!hasPayloadValue(values[fieldName])) {
      errors[fieldName] = message;
    }
  });

  if (
    values.isClosed !== "true" &&
    !["3", "4"].includes(String(values.status))
  ) {
    errors.status = "Please select a valid status";
  }

  if (
    hasPayloadValue(values.isClosed) &&
    !["true", "false"].includes(String(values.isClosed))
  ) {
    errors.isClosed = "Please select a valid ticket state";
  }

  return errors;
};

const removeEmptyPayloadValues = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => hasPayloadValue(value))
  );

export const buildTicketUpdatePayload = (editValues) =>
  removeEmptyPayloadValues({
    reply: editValues.reply.trim(),
    status:
      editValues.isClosed === "true"
        ? 2
        : Number(editValues.status ?? 3),
    isClosed: editValues.isClosed === "true",
    ticketTypeId: Number(editValues.ticketTypeId),
    userId: Number(editValues.userId),
    providerId: optionalNumber(editValues.providerId),
    assignedToGroupId: optionalNumber(editValues.assignedToGroupId),
    userPhoneNumber: editValues.userPhoneNumber.trim(),
    priority: Number(editValues.priority ?? 1),
    description: editValues.description.trim(),
  });
