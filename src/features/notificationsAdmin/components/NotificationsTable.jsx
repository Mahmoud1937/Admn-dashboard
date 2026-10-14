import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCalendarDays,
  faChevronDown,
  faClock,
  faHourglassHalf,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import { formatDate } from "../../../utils/formatDate";

function TableSkeleton() {
  return (
    <div className="divide-y divide-slate-100" aria-busy="true">
      <div className="h-11 bg-slate-100" />
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-5 px-5 py-5">
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
          <div className="hidden h-4 flex-1 animate-pulse rounded bg-slate-100 md:block" />
          <div className="hidden h-4 flex-1 animate-pulse rounded bg-slate-100 lg:block" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function NotificationIcon({ imageUrl }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageUrl && !imageFailed) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 bg-slate-50 object-cover"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-800 ring-1 ring-blue-100">
      <FontAwesomeIcon icon={faBell} aria-hidden="true" />
    </span>
  );
}

function MessagePreview({ value, language }) {
  const isArabic = language === "AR";

  return (
    <div className="flex min-w-0 items-start gap-2">
      <span
        className={`inline-flex shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
          isArabic
            ? "bg-teal-50 text-teal-700"
            : "bg-blue-50 text-blue-700"
        }`}
      >
        {language}
      </span>
      <span
        dir={isArabic ? "rtl" : "ltr"}
        title={value || undefined}
        className={`line-clamp-2 min-w-0 break-words text-sm leading-5 text-slate-600 ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function ScheduleCell({ scheduledAt, durationDay }) {
  const date = scheduledAt ? new Date(scheduledAt) : null;
  const hasDate =
    date &&
    !Number.isNaN(date.getTime()) &&
    !String(scheduledAt).startsWith("0001");

  return (
    <div className="space-y-1.5">
      {hasDate ? (
        <>
          <div className="flex items-center gap-2 whitespace-nowrap font-medium text-slate-700">
            <FontAwesomeIcon icon={faCalendarDays} className="w-3.5 text-blue-700" />
            {formatDate(scheduledAt)}
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap text-xs text-slate-500">
            <FontAwesomeIcon icon={faClock} className="w-3.5 text-teal-600" />
            {date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
        </>
      ) : (
        <span className="text-slate-400">Not scheduled</span>
      )}
      {durationDay != null && (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
          <FontAwesomeIcon icon={faHourglassHalf} className="text-[10px]" />
          Repeats after {durationDay} {durationDay === 1 ? "day" : "days"}
        </span>
      )}
    </div>
  );
}

function ExpandedMessage({ language, value }) {
  const isArabic = language === "Arabic";

  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {language} message
      </p>
      <p
        dir={isArabic ? "rtl" : "ltr"}
        className={`whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function NotificationRow({ notification, expanded, onToggle, canDelete, onDelete }) {
  const {
    notificationId,
    title,
    imageUrl,
    messageEn,
    messageAr,
    scheduledAt,
    durationDay,
  } = notification;
  const detailsId = `notification-details-${notificationId}`;

  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 ${
          expanded ? "bg-blue-50/40" : "bg-white"
        }`}
      >
        <td className="px-5 py-4 align-top">
          <div className="flex items-start gap-3">
            <NotificationIcon imageUrl={imageUrl} />
            <div className="min-w-0 pt-0.5">
              <p dir="auto" title={title} className="line-clamp-2 break-words font-semibold text-slate-900">
                {title || "Untitled notification"}
              </p>
              <p className="mt-1 text-xs text-slate-400">#{notificationId}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-4 align-top">
          <MessagePreview language="EN" value={messageEn} />
        </td>
        <td className="px-4 py-4 align-top">
          <MessagePreview language="AR" value={messageAr} />
        </td>
        <td className="px-4 py-4 align-top text-sm">
          <ScheduleCell scheduledAt={scheduledAt} durationDay={durationDay} />
        </td>
        <td className="px-4 py-4 align-top">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              aria-label={expanded ? "Hide notification details" : "Show notification details"}
              aria-expanded={expanded}
              aria-controls={expanded ? detailsId : undefined}
              onClick={(event) => {
                event.stopPropagation();
                onToggle();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`text-xs transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>
            {canDelete && (
              <button
                type="button"
                aria-label={`Delete notification ${title || notificationId}`}
                title="Delete notification"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(notification);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-red-500"
              >
                <FontAwesomeIcon icon={faTrash} className="text-xs" />
              </button>
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr id={detailsId} className="border-b border-slate-200 bg-slate-50/70">
          <td colSpan={5} className="px-5 py-4">
            <div className="grid gap-3 md:grid-cols-2">
              <ExpandedMessage language="English" value={messageEn} />
              <ExpandedMessage language="Arabic" value={messageAr} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function NotificationsTable({
  items,
  isLoading,
  isError = false,
  error,
  onRetry,
  onDelete,
  canDelete = true,
  hasActiveFilters = false,
}) {
  const [expandedId, setExpandedId] = useState(null);

  if (isLoading) return <TableSkeleton />;
  if (isError) {
    return <QueryErrorState title="Unable to load notifications" error={error} onRetry={onRetry} />;
  }
  if (!items?.length) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <TableEmptyState
          icon={faBell}
          title="No notifications found"
          hasActiveFilters={hasActiveFilters}
          emptyMessage="No notifications have been created yet."
        />
      </div>
    );
  }

  return (
    <ScrollableTable className="scroll-table min-h-[360px]">
      <table className="w-full min-w-[980px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[25%]" />
          <col className="w-[22%]" />
          <col className="w-[22%]" />
          <col className="w-[20%]" />
          <col className="w-[11%]" />
        </colgroup>
        <thead className="sticky top-0 z-10 bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-[0_1px_0_0_rgb(226,232,240)]">
          <tr>
            <th scope="col" className="px-5 py-3.5">Notification</th>
            <th scope="col" className="px-4 py-3.5">English message</th>
            <th scope="col" className="px-4 py-3.5">Arabic message</th>
            <th scope="col" className="px-4 py-3.5">Schedule</th>
            <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((notification) => (
            <NotificationRow
              key={notification.notificationId}
              notification={notification}
              expanded={expandedId === notification.notificationId}
              onToggle={() =>
                setExpandedId((currentId) =>
                  currentId === notification.notificationId
                    ? null
                    : notification.notificationId
                )
              }
              canDelete={canDelete}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </ScrollableTable>
  );
}
