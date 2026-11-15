import { useEffect, useId, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheckDouble,
  faCircleExclamation,
  faRotateRight,
  faSpinner,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import useLanguage from "../localization/useLanguage";

function notificationDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    numberingSystem: "latn",
  }).format(date).replace(", ", " ");
  return { iso: date.toISOString(), text: formatted, full: formatted };
}

export default function AdminNotificationsMenu({
  notifications = [],
  unreadCount,
  isLoading = false,
  isRefreshing = false,
  error = null,
  onRetry,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelect,
  canSelect,
  filter: controlledFilter,
  onFilterChange,
  hasMore = false,
  isLoadingMore = false,
  loadMoreError = false,
  onLoadMore,
} = {}) {
  const { t } = useTranslation("navbar");
  const { language, direction } = useLanguage();
  const [open, setOpen] = useState(false);
  const [localFilter, setLocalFilter] = useState("all");
  const filter = controlledFilter ?? localFilter;
  const [pendingIds, setPendingIds] = useState([]);
  const [markingAll, setMarkingAll] = useState(false);
  const [actionError, setActionError] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const listRef = useRef(null);
  const loadMoreRef = useRef(null);
  const panelId = useId();
  const titleId = `${panelId}-title`;
  const totalUnread = unreadCount ?? (onLoadMore ? null : notifications.filter((item) => !item.isRead).length);
  const formattedUnread = totalUnread?.toLocaleString(language);
  const visibleNotifications = filter === "unread"
    ? notifications.filter((item) => !item.isRead)
    : notifications;
  const busy = markingAll || pendingIds.length > 0;

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const handleOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [open]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [open, filter]);

  useEffect(() => {
    if (!open || !hasMore || isLoading || isRefreshing || isLoadingMore || loadMoreError || error || busy || !onLoadMore) return;
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
    }, { root: listRef.current, rootMargin: "0px 0px 80px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [open, hasMore, isLoading, isRefreshing, isLoadingMore, loadMoreError, error, busy, onLoadMore]);

  const closeAndFocus = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const selectNotification = async (notification) => {
    setActionError(false);
    if (!notification.isRead && onMarkAsRead) {
      // The row may disappear after reading it in the Unread filter.
      panelRef.current?.focus();
      setPendingIds((previous) => [...previous, notification.id]);
      try {
        await onMarkAsRead(notification.id);
      } catch {
        setActionError(true);
        return;
      } finally {
        setPendingIds((previous) => previous.filter((id) => id !== notification.id));
      }
    }
    if (onSelect && (!canSelect || canSelect(notification))) {
      onSelect(notification);
      closeAndFocus();
    }
  };

  const markAllAsRead = async () => {
    setActionError(false);
    panelRef.current?.focus();
    setMarkingAll(true);
    try {
      await onMarkAllAsRead();
    } catch {
      setActionError(true);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div
      ref={menuRef}
      className="relative flex shrink-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          closeAndFocus();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={totalUnread > 0
          ? t("adminNotificationsWithUnread", { total: formattedUnread })
          : t("adminNotifications")}
        title={t("adminNotifications")}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((previous) => !previous)}
        className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${open ? "bg-blue-50 text-blue-900" : "text-slate-500 hover:bg-slate-100 hover:text-blue-900"}`}
      >
        <FontAwesomeIcon icon={faBell} className="text-lg" />
        {totalUnread > 0 && (
          <span aria-hidden="true" dir="ltr" className="absolute -end-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-white">
            {totalUnread > 99 ? "99+" : formattedUnread}
          </span>
        )}
      </button>

      {open && (
        <section
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          tabIndex={-1}
          lang={language}
          dir={direction}
          className="fixed inset-x-3 top-[4.5rem] z-40 flex max-h-[calc(100dvh-6rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-start shadow-xl outline-none sm:absolute sm:inset-x-auto sm:end-0 sm:top-full sm:mt-3 sm:w-96"
        >
          <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
            <div>
              <h2 id={titleId} className="text-sm font-semibold text-slate-900">
                {t("adminNotifications")}
              </h2>
              <p className="mt-1 text-xs text-slate-500" aria-live="polite">
                {isLoading || isRefreshing
                  ? t("loadingAdminNotifications")
                  : error
                    ? t("loadAdminNotificationsFailed")
                    : totalUnread > 0
                      ? t("unreadNotificationsSummary", { total: formattedUnread })
                      : totalUnread == null ? t("recentAdminNotifications") : t("notificationsUpToDate")}
              </p>
            </div>
            <button type="button" onClick={closeAndFocus} aria-label={t("closeNotifications")} className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 pb-3">
            <div role="group" aria-label={t("filterNotifications")} className="flex gap-1 rounded-lg bg-slate-100 p-1">
              {["all", "unread"].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={filter === value}
                  onClick={() => {
                    setLocalFilter(value);
                    onFilterChange?.(value);
                  }}
                  className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${filter === value ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  {t(value === "all" ? "allNotifications" : "unreadNotifications")}
                </button>
              ))}
            </div>
            {onMarkAllAsRead && (
              <button type="button" onClick={() => void markAllAsRead()} disabled={busy || totalUnread === 0 || isLoading || Boolean(error)} className="flex cursor-pointer items-center gap-1.5 rounded-md px-1 py-1.5 text-xs font-medium text-blue-900 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-default disabled:opacity-40">
                <FontAwesomeIcon icon={markingAll ? faSpinner : faCheckDouble} spin={markingAll} />
                {t("markAllNotificationsRead")}
              </button>
            )}
          </div>

          {actionError && (
            <p role="alert" className="border-b border-red-100 bg-red-50 px-5 py-3 text-xs text-red-700">{t("markNotificationsReadFailed")}</p>
          )}

          <div
            ref={listRef}
            role="region"
            aria-label={t("adminNotifications")}
            tabIndex={0}
            className={`max-h-[min(60dvh,28rem)] min-h-0 overflow-y-auto overscroll-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${isRefreshing ? "opacity-60" : ""}`}
            aria-busy={isLoading || isRefreshing || isLoadingMore}
          >
            {isLoading ? (
              <div role="status" className="flex items-center justify-center gap-2 px-5 py-12 text-sm text-slate-500">
                <FontAwesomeIcon icon={faSpinner} spin />
                {t("loadingAdminNotifications")}
              </div>
            ) : error ? (
              <div role="alert" className="flex flex-col items-center px-6 py-10 text-center">
                <FontAwesomeIcon icon={faCircleExclamation} className="mb-3 text-2xl text-red-400" />
                <p className="text-sm font-medium text-slate-700">{t("loadAdminNotificationsFailed")}</p>
                {onRetry && (
                  <button type="button" onClick={onRetry} className="mt-4 flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    <FontAwesomeIcon icon={faRotateRight} />
                    {t("retryNotifications")}
                  </button>
                )}
              </div>
            ) : visibleNotifications.length === 0 ? (
              <div role="status" className="flex flex-col items-center px-6 py-10 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-900">
                  <FontAwesomeIcon icon={filter === "unread" ? faCheckDouble : faBell} className="text-lg" />
                </span>
                <p className="text-sm font-semibold text-slate-800">{t(filter === "unread" ? "noUnreadNotifications" : "noAdminNotifications")}</p>
                <p className="mt-1.5 max-w-64 text-xs leading-5 text-slate-500">{t(filter === "unread" ? "noUnreadNotificationsHint" : "noAdminNotificationsHint")}</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {visibleNotifications.map((notification) => {
                  const date = notificationDate(notification.createdAt);
                  const isPending = pendingIds.includes(notification.id);
                  const interactive = Boolean((onSelect && (!canSelect || canSelect(notification))) || (!notification.isRead && onMarkAsRead));
                  const Row = interactive ? "button" : "div";
                  return (
                    <li key={notification.id}>
                      <Row
                        {...(interactive ? {
                          type: "button",
                          disabled: busy || isRefreshing,
                          onClick: () => void selectNotification(notification),
                          title: !notification.isRead && onMarkAsRead ? t("markNotificationRead") : undefined,
                        } : {})}
                        className={`flex w-full items-start gap-3 px-5 py-4 text-start ${notification.isRead ? "bg-white" : "bg-blue-50/60"} ${interactive ? "cursor-pointer transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 disabled:cursor-wait" : ""}`}
                      >
                        <span aria-hidden="true" className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${notification.isRead ? "bg-slate-100 text-slate-400" : "bg-blue-100 text-blue-900"}`}>
                          <FontAwesomeIcon icon={isPending ? faSpinner : faBell} spin={isPending} className="text-sm" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span dir="auto" className="block wrap-anywhere text-sm font-semibold leading-5 text-slate-800">{notification.title || t("notificationTitleFallback")}</span>
                          {notification.message && <span dir="auto" className="mt-1 block wrap-anywhere text-xs leading-5 text-slate-500">{notification.message}</span>}
                          {date && <time dateTime={date.iso} title={date.full} className="mt-2 block text-[11px] text-slate-400"><bdi dir="ltr">{date.text}</bdi></time>}
                        </span>
                        {!notification.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600"><span className="sr-only">{t("unreadNotification")}</span></span>}
                      </Row>
                    </li>
                  );
                })}
              </ul>
            )}
            {!isLoading && !error && hasMore && (
              <div ref={loadMoreRef} className="flex min-h-12 items-center justify-center px-5 py-3 text-center text-xs text-slate-500">
                {isLoadingMore ? (
                  <span role="status" className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faSpinner} spin />
                    {t("loadingMoreAdminNotifications")}
                  </span>
                ) : loadMoreError ? (
                  <div>
                    <p role="alert">{t("loadMoreAdminNotificationsFailed")}</p>
                    <button type="button" onClick={onLoadMore} className="mt-2 cursor-pointer rounded-lg px-3 py-2 font-medium text-blue-900 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      {t("retryNotifications")}
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
