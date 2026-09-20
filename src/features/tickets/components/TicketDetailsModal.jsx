import { useState } from "react";
import { useTicketDetailsQuery } from "../hooks/useTicketDetailsQuery";
import {
  buildTicketUpdatePayload,
  getEditValues,
  getGeneralServerErrorMessage,
  getServerFieldErrors,
  getTicketStatus,
  validateEditValues,
} from "../utils/ticketDetailsUtils";
import TicketDetailsHeader from "./ticket-details/TicketDetailsHeader";
import TicketDetailsOverview from "./ticket-details/TicketDetailsOverview";
import TicketTimeline from "./ticket-details/TicketTimeline";

export default function TicketDetailsModal({
  ticketId,
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
  const currentStatus = getTicketStatus(timelines.at(-1)?.status ?? 1);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dismissedServerFields, setDismissedServerFields] = useState(new Set());
  const serverFieldErrors = isEditing
    ? getServerFieldErrors(serverErrors, dismissedServerFields)
    : {};
  const visibleFieldErrors = { ...serverFieldErrors, ...fieldErrors };
  const serverErrorMessage = getGeneralServerErrorMessage(
    serverErrors,
    visibleFieldErrors
  );

  const setEditValue = (name, value) => {
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setDismissedServerFields((current) => {
      const next = new Set(current);
      next.add(name);
      return next;
    });

    setEditValues((current) => ({
      ...current,
      [name]: value,
      ...(name === "isClosed" && value === "true" ? { status: "2" } : {}),
    }));
  };

  const startEditing = () => {
    if (!ticket) return;

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
    if (!ticket || !editValues) return;

    const errors = validateEditValues(editValues);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    onUpdate(buildTicketUpdatePayload(editValues), {
      onSuccess: cancelEditing,
    });
  };

  // NOTE: This modal intentionally does NOT reuse FormModalShell.
  // FormModalShell is form-shaped: it always renders a title string, a single
  // close button, a <form onSubmit> wrapper, and relies on FormActions for the
  // footer. This modal instead needs a rich custom header (TicketDetailsHeader
  // with a status badge and its own X button), a non-form scrollable body, and
  // a footer that swaps between Close/Update and Cancel/Save based on
  // `isEditing`. Supporting those in the shared shell would require adding
  // header/footer slots and making the <form> optional, complicating every
  // other consumer — so the manual shell is kept here instead.
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-[2px] sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <TicketDetailsHeader
          ticketId={ticketId}
          ticket={ticket}
          isEditing={isEditing}
          editValues={editValues}
          currentStatus={currentStatus}
          visibleFieldErrors={visibleFieldErrors}
          onClose={onClose}
          onEditValueChange={setEditValue}
        />

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
              <TicketDetailsOverview
                ticket={ticket}
                isEditing={isEditing}
                editValues={editValues}
                visibleFieldErrors={visibleFieldErrors}
                onEditValueChange={setEditValue}
              />

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Description
                </p>
                {isEditing && editValues ? (
                  <>
                    <textarea
                      value={editValues.description}
                      onChange={(e) =>
                        setEditValue("description", e.target.value)
                      }
                      rows={4}
                      className={`w-full rounded-xl border bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm outline-none focus:border-blue-400 ${
                        visibleFieldErrors.description
                          ? "border-red-400"
                          : "border-slate-100"
                      }`}
                    />
                    {visibleFieldErrors.description && (
                      <p className="mt-1 text-xs text-red-500">
                        {visibleFieldErrors.description}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="rounded-xl border border-slate-100 bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
                    {ticket.description || "-"}
                  </p>
                )}
              </div>

              <TicketTimeline
                key={`${ticket.id}-${ticket.isClosed}-${timelines.length}`}
                timelines={timelines}
                isEditing={isEditing}
                editValues={editValues}
                visibleFieldErrors={visibleFieldErrors}
                onEditValueChange={setEditValue}
              />

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
