import { useEffect, useRef, useState } from "react";
import { useTicketDetailsQuery } from "../hooks/useTicketDetailsQuery";
import {
  buildTicketUpdatePayload,
  getEditValues,
  getGeneralServerErrorMessage,
  getServerFieldErrors,
  validateEditValues,
} from "../utils/ticketDetailsUtils";
import { COLOR_STYLES } from "../utils/ticketColors";
import TicketDetailsHeader from "./ticket-details/TicketDetailsHeader";
import TicketDetailsOverview from "./ticket-details/TicketDetailsOverview";
import TicketTimeline from "./ticket-details/TicketTimeline";

function Section({ title, right, children }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-24 rounded-xl bg-slate-200/70" />
      <div className="h-28 rounded-xl bg-slate-200/70" />
      <div className="h-40 rounded-xl bg-slate-200/70" />
    </div>
  );
}

export default function TicketDetailsModal({
  ticketId,
  headerColor,
  onClose,
  onUpdate,
  isSaving,
  serverErrors,
}) {
  const { data, isLoading, isError } = useTicketDetailsQuery(
    ticketId,
    !!ticketId
  );
  const ticket = data?.data;
  const timelines = ticket?.ticketTimelines ?? [];
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dismissedServerFields, setDismissedServerFields] = useState(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const previousServerErrors = useRef(serverErrors);
  const isTicketClosed = ticket?.isClosed === true;
  const canEditTicket = Boolean(ticket) && !isTicketClosed && Boolean(onUpdate);
  const isEditingView = isEditing && canEditTicket;
  const headerStyle = headerColor ? COLOR_STYLES[headerColor] : null;

  // slide-in animation
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // close on Escape (but never while editing)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isEditingView) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditingView, onClose]);

  useEffect(() => {
    if (serverErrors !== previousServerErrors.current) {
      setDismissedServerFields(new Set());
      previousServerErrors.current = serverErrors;
    }
  }, [serverErrors]);
  const serverFieldErrors = isEditingView
    ? getServerFieldErrors(serverErrors, dismissedServerFields)
    : {};
  const visibleFieldErrors = { ...serverFieldErrors, ...fieldErrors };
  const serverErrorMessage = getGeneralServerErrorMessage(serverErrors);

  const setEditValue = (name, value) => {
    const fieldsToClear = name === "isClosed" ? ["isClosed"] : [name];

    setFieldErrors((current) =>
      fieldsToClear.reduce(
        (next, fieldName) => ({ ...next, [fieldName]: "" }),
        current
      )
    );
    setDismissedServerFields((current) => {
      const next = new Set(current);
      fieldsToClear.forEach((fieldName) => next.add(fieldName));
      return next;
    });

    setEditValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const startEditing = () => {
    if (!ticket || isTicketClosed) return;

    setEditValues(getEditValues(ticket, timelines));
    setFieldErrors({});
    setDismissedServerFields(new Set());
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditValues(null);
    setFieldErrors({});
    setDismissedServerFields(new Set());
  };

  const handleUpdate = () => {
    if (!ticket || isTicketClosed || !editValues || !onUpdate) return;

    const errors = validateEditValues(editValues);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    onUpdate(buildTicketUpdatePayload(editValues), {
      onSuccess: cancelEditing,
    });
  };

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop */}
      <div
        // onClick={() => {
        //   if (!isEditingView) onClose();
        // }}
        className={`absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-slate-50 shadow-2xl ring-1 ring-black/5 transition-transform duration-300 ease-out sm:rounded-l-2xl ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
{/* Header (takes the color of the column the ticket was opened from) */}
{/* Header (takes the color of the column the ticket was opened from) */}
<div
  className={`shrink-0 border-b border-slate-200 ${
    headerStyle ? `border-t-4 ${headerStyle.bar}` : ""
  }`}
>
<TicketDetailsHeader
  ticketId={ticketId}
  isClosed={ticket?.isClosed}
  colorStyle={headerStyle}
  onClose={onClose}
/>
</div>

{/* Status bar (edit mode only) */}
{isEditingView && editValues && (
  <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-3">
    <div className="flex items-center gap-3">
      <label
        htmlFor="ticket-status"
        className="text-[11px] font-semibold uppercase tracking-wide text-slate-400"
      >
        Status
      </label>
      <select
        id="ticket-status"
        value={editValues.isClosed}
        onChange={(e) => setEditValue("isClosed", e.target.value)}
        className={`rounded-lg border bg-blue-50 px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 ${
          visibleFieldErrors.isClosed ? "border-red-400" : "border-slate-200"
        }`}
      >
        <option value="false">Open</option>
        <option value="true">Closed</option>
      </select>
    </div>
    {visibleFieldErrors.isClosed && (
      <p className="mt-1 text-xs text-red-500">
        {visibleFieldErrors.isClosed}
      </p>
    )}
  </div>
)}

        {/* Body */}
        <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-5">
          {isLoading && <LoadingSkeleton />}

          {isError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-600">
              Failed to load ticket details.
            </p>
          )}

          {!isLoading && !isError && ticket && (
            <div className="space-y-6">
              {/* Details */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <TicketDetailsOverview
                  ticket={ticket}
                  isEditing={isEditingView}
                  editValues={editValues}
                  visibleFieldErrors={visibleFieldErrors}
                  onEditValueChange={setEditValue}
                />
              </div>

              {/* Description */}
              <Section
                title="Description"
                right={
                  isEditingView && editValues ? (
                    <span className="text-[11px] text-slate-400">
                      {editValues.description.length} / 500
                    </span>
                  ) : null
                }
              >
                {isEditingView && editValues ? (
                  <>
                    <textarea
                      value={editValues.description}
                      readOnly
                      maxLength={500}
                      rows={5}
                      dir="auto"
                      className={`h-32 w-full resize-none rounded-xl border bg-slate-100 p-3.5 text-sm leading-6 text-slate-600 outline-none ${
                        visibleFieldErrors.description
                          ? "border-red-400"
                          : "border-slate-200"
                      }`}
                    />
                    {visibleFieldErrors.description && (
                      <p className="mt-1 text-xs text-red-500">
                        {visibleFieldErrors.description}
                      </p>
                    )}
                  </>
                ) : (
                  <p
                    dir="auto"
                    className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm"
                  >
                    {ticket.description || "-"}
                  </p>
                )}
              </Section>

              {/* Reply */}
              {isEditingView && editValues && (
                <Section
                  title="Reply"
                  right={
                    <span className="text-[11px] text-slate-400">
                      {editValues.reply.length} / 500
                    </span>
                  }
                >
                  <textarea
                    value={editValues.reply}
                    onChange={(e) => setEditValue("reply", e.target.value)}
                    maxLength={500}
                    rows={5}
                    placeholder="Write your reply..."
                    dir="auto"
                    className={`h-36 w-full resize-none rounded-xl border bg-blue-50 p-3.5 text-sm leading-6 text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 ${
                      visibleFieldErrors.reply
                        ? "border-red-400"
                        : "border-blue-100"
                    }`}
                  />
                  {visibleFieldErrors.reply && (
                    <p className="mt-1 text-xs text-red-500">
                      {visibleFieldErrors.reply}
                    </p>
                  )}
                </Section>
              )}

              {/* Activity */}
              <Section title="Activity">
                <TicketTimeline
                  key={`${ticket.id}-${ticket.isClosed}-${timelines.length}`}
                  timelines={timelines}
                />
              </Section>

              {isEditingView && serverErrorMessage && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-600">
                  {serverErrorMessage}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-2.5 border-t border-slate-200 bg-white px-5 py-3.5 sm:rounded-bl-2xl">
          {ticket && canEditTicket && !isEditingView && (
            <button
              type="button"
              onClick={startEditing}
              className="cursor-pointer rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
            >
              Update
            </button>
          )}
          {ticket && canEditTicket && isEditingView && (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
      </aside>
    </div>
  );
}
