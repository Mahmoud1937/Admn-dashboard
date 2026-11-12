import { useTranslation } from "react-i18next";
import TableActionsCell from "../../../shared/components/TableActionsCell";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCalendarDays,
  faChevronDown,
  faClock,
  faPenToSquare,
  faPaperPlane,
  faPowerOff,
  faRotate,
  faTrash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import { formatDate } from "../../../utils/formatDate";
import Skeleton, { SkeletonTable } from "../../../shared/components/Skeleton";

function TableSkeleton() {
  return (
    <SkeletonTable
      rows={5}
      rowClassName="flex items-center gap-5 px-6 py-5"
      header={<div className="h-11 bg-slate-50" />}
    >
      <Skeleton className="h-10 w-10 shrink-0 rounded-lg bg-slate-100" />
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-40 rounded bg-slate-100" />
        <Skeleton className="h-3 w-24 rounded bg-slate-100" />
      </div>
      <Skeleton className="hidden h-3.5 flex-1 rounded bg-slate-100 md:block" />
      <Skeleton className="hidden h-3.5 flex-1 rounded bg-slate-100 lg:block" />
      <Skeleton className="h-3.5 w-24 rounded bg-slate-100" />
    </SkeletonTable>
  );
}

function NotificationIcon({ imageUrl, isActive }) {
  const [failedUrl, setFailedUrl] = useState(null);

  if (imageUrl && failedUrl !== imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={`h-10 w-10 shrink-0 rounded-lg border bg-slate-50 object-cover ${
          isActive === true ? "border-blue-200" : "border-slate-200"
        }`}
        onError={() => setFailedUrl(imageUrl)}
      />
    );
  }

  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${
        isActive === true
          ? "bg-blue-50 text-blue-700 ring-blue-100"
          : "bg-slate-100 text-slate-400 ring-slate-200/60"
      }`}
    >
      <FontAwesomeIcon icon={faBell} className="text-sm" aria-hidden="true" />
    </span>
  );
}

function StatusPill({ isActive }) {
  const { t } = useTranslation("adminPages");
  if (typeof isActive !== "boolean") return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
        isActive
          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
          : "bg-slate-50 text-slate-500 ring-slate-500/15"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {isActive ? t("Active") : t("Inactive")}
    </span>
  );
}

function MessagePreview({ value, language }) {
  const { t } = useTranslation("adminPages");
  const isArabic = language === "AR";

  return (
    <div className="min-w-0">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {isArabic ? t("Arabic") : t("English")}
      </p>
      <p
        dir={isArabic ? "rtl" : "ltr"}
        title={value || undefined}
        className={`line-clamp-2 break-words text-sm leading-5 text-slate-600 ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        {value || <span className="text-slate-300">—</span>}
      </p>
    </div>
  );
}

function ScheduleCell({ scheduledAt, durationDay }) {
  const { t, i18n } = useTranslation("adminPages");
  const date = scheduledAt ? new Date(scheduledAt) : null;
  const hasDate =
    date &&
    !Number.isNaN(date.getTime()) &&
    !String(scheduledAt).startsWith("0001");

  return (
    <div className="space-y-1.5">
      {hasDate ? (
        <>
          <div className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-slate-800">
            <FontAwesomeIcon
              icon={faCalendarDays}
              className="w-3.5 text-slate-400"
            />
            {formatDate(scheduledAt)}
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap text-xs text-slate-500">
            <FontAwesomeIcon icon={faClock} className="w-3.5 text-slate-400" />
            {date.toLocaleTimeString(i18n.resolvedLanguage === "ar" ? "ar-EG" : "en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
        </>
      ) : (
        <span className="text-sm text-slate-400">{t("Not scheduled")}</span>
      )}
      {durationDay != null && (
        <div className="flex items-center gap-2 whitespace-nowrap text-xs text-slate-500">
          <FontAwesomeIcon icon={faRotate} className="w-3.5 text-slate-400" />
          {t("Every")} {durationDay} {durationDay === 1 ? t("day") : t("days")}
        </div>
      )}
    </div>
  );
}

function ExpandedMessage({ language, value }) {
  const { t } = useTranslation("adminPages");
  const isArabic = language === "Arabic";

  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {t(isArabic ? "Arabic message" : "English message")}
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

function ActionButton({ label, title, onClick, tone = "neutral", iconClass = "text-slate-400", disabled, children, ...rest }) {
  const tones = {
    neutral:
      "hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-slate-500",
    blue: "hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-blue-600",
    green:
      "hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-emerald-600",
    amber:
      "hover:bg-amber-50 hover:text-amber-700 focus-visible:outline-amber-600",
    red: "hover:bg-red-50 hover:text-red-600 focus-visible:outline-red-500",
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={title ?? label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50 ${iconClass} ${tones[tone]}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function NotificationRow({ notification, expanded, onToggle, canEdit, onEdit, canToggle, onToggleActive, isToggling, canDelete, onDelete, canSend, onSendNow, isSending, sendingId }) {
  const { t } = useTranslation("adminPages");
  const {
    notificationId,
    title,
    imageUrl,
    messageEn,
    messageAr,
    scheduledAt,
    durationDay,
    isActive,
  } = notification;
  const detailsId = `notification-details-${notificationId}`;
  const label = title || notificationId;
  const isSendingThis = isSending && String(sendingId) === String(notificationId);

  return (
    <>
      <tr
        onClick={onToggle}
        className={`group cursor-pointer border-b border-slate-100 transition-colors ${
          expanded ? "bg-slate-50" : "bg-white hover:bg-slate-50/70"
        }`}
      >
        <td className="relative px-6 py-4 align-top">
          {expanded && (
            <span className="absolute inset-y-0 left-0 w-0.5 bg-blue-900" aria-hidden="true" />
          )}
          <div className="flex items-start gap-3">
            <NotificationIcon imageUrl={imageUrl} isActive={isActive} />
            <div className="min-w-0">
              <p
                dir="auto"
                title={title}
                className="line-clamp-2 break-words text-sm font-semibold text-slate-900"
              >
                {title || t("Untitled notification")}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="text-xs tabular-nums text-slate-400">
                  #{notificationId}
                </span>
                <StatusPill isActive={isActive} />
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-4 align-top">
          <MessagePreview language="EN" value={messageEn} />
        </td>
        <td className="px-4 py-4 align-top">
          <MessagePreview language="AR" value={messageAr} />
        </td>
        <td className="px-4 py-4 align-top">
          <ScheduleCell scheduledAt={scheduledAt} durationDay={durationDay} />
        </td>
        <TableActionsCell
          backgroundColor={expanded ? "var(--color-slate-50)" : undefined}
          hoverColor={expanded ? "var(--color-slate-50)" : "color-mix(in oklab, var(--color-slate-50) 70%, transparent)"}
          className="px-4 py-4 align-top"
        >
          <div className="flex items-center justify-end gap-0.5">
            {canSend && (
              <ActionButton
                tone="blue"
                iconClass="text-blue-700"
                label={t("Send notification {{name}} now", { name: label })}
                title={isSendingThis ? t("Sending...") : t("Send now")}
                disabled={isSending}
                aria-busy={isSendingThis}
                onClick={(event) => {
                  event.stopPropagation();
                  onSendNow(notification);
                }}
              >
                <FontAwesomeIcon icon={isSendingThis ? faSpinner : faPaperPlane} spin={isSendingThis} className="text-xs" />
              </ActionButton>
            )}
            {canEdit && (
              <ActionButton
                tone="blue"
                label={t("Edit notification {{name}}", { name: label })}
                title={t("Edit notification")}
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(notification);
                }}
              >
                <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
              </ActionButton>
            )}
            {canToggle && (
              <ActionButton
                tone={isActive === false ? "green" : "amber"}
                iconClass={isActive === true ? "text-blue-700" : "text-slate-400"}
                label={t(isActive === true ? "Deactivate notification {{name}}" : isActive === false ? "Activate notification {{name}}" : "Toggle status of notification {{name}}", { name: label })}
                title={
                  isActive === true
                    ? t("Deactivate notification")
                    : isActive === false
                      ? t("Activate notification")
                      : t("Toggle notification status")
                }
                disabled={isToggling}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleActive(notification);
                }}
              >
                <FontAwesomeIcon icon={faPowerOff} className="text-xs" />
              </ActionButton>
            )}
            {canDelete && (
              <ActionButton
                tone="red"
                label={t("Delete notification {{name}}", { name: label })}
                title={t("Delete notification")}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(notification);
                }}
              >
                <FontAwesomeIcon icon={faTrash} className="text-xs" />
              </ActionButton>
            )}
            <ActionButton
              label={expanded ? t("Hide notification details") : t("Show notification details")}
              aria-expanded={expanded}
              aria-controls={expanded ? detailsId : undefined}
              onClick={(event) => {
                event.stopPropagation();
                onToggle();
              }}
            >
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`text-xs transition-transform duration-200 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </ActionButton>
          </div>
        </TableActionsCell>
      </tr>
      {expanded && (
        <tr id={detailsId} className="border-b border-slate-200 bg-slate-50">
          <td colSpan={5} className="px-6 pb-5 pt-1">
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
  onEdit,
  onToggleActive,
  canEdit = false,
  canToggle = false,
  isToggling = false,
  canDelete = true,
  onSendNow,
  canSend = false,
  isSending = false,
  sendingId,
  hasActiveFilters = false,
}) {
  const { t } = useTranslation("adminPages");
  const [expandedId, setExpandedId] = useState(null);

  if (isLoading) return <TableSkeleton />;
  if (isError) {
    return <QueryErrorState title={t("Unable to load notifications")} error={error} onRetry={onRetry} />;
  }
  if (!items?.length) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <TableEmptyState
          icon={faBell}
          title={t("No notifications found")}
          hasActiveFilters={hasActiveFilters}
          emptyMessage={t("No notifications have been created yet.")}
        />
      </div>
    );
  }

  return (
    <ScrollableTable className="scroll-table min-h-[360px]">
      <table className="w-full min-w-[1120px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[24%]" />
          <col className="w-[21%]" />
          <col className="w-[21%]" />
          <col className="w-[16%]" />
          <col className="w-[18%]" />
        </colgroup>
        <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0_rgb(226,232,240)]">
          <tr>
            <th scope="col" className="px-6 py-3">{t("Notification")}</th>
            <th scope="col" className="px-4 py-3">{t("English message")}</th>
            <th scope="col" className="px-4 py-3">{t("Arabic message")}</th>
            <th scope="col" className="px-4 py-3">{t("Schedule")}</th>
            <TableActionsCell as="th" scope="col" className="px-4 py-3 text-right">{t("Actions")}</TableActionsCell>
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
              canEdit={canEdit}
              onEdit={onEdit}
              canToggle={canToggle}
              onToggleActive={onToggleActive}
              isToggling={isToggling}
              onDelete={onDelete}
              canSend={canSend}
              onSendNow={onSendNow}
              isSending={isSending}
              sendingId={sendingId}
            />
          ))}
        </tbody>
      </table>
    </ScrollableTable>
  );
}
