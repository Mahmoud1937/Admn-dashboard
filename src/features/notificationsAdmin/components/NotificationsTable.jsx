import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faBell,
  faCalendarDays,
  faClock,
  faHourglassHalf,
} from "@fortawesome/free-solid-svg-icons";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import { formatDate } from "../../../utils/formatDate";

// Small self-contained animations (disabled automatically for users who prefer reduced motion).
const ANIMATION_CSS = `
@keyframes notificationRowIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes notificationBell {
  0%, 100% { transform: rotate(0); }
  20% { transform: rotate(14deg); }
  40% { transform: rotate(-12deg); }
  60% { transform: rotate(8deg); }
  80% { transform: rotate(-5deg); }
}
.notification-row-in {
  animation: notificationRowIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}
.notification-row:hover .notification-bell {
  animation: notificationBell 0.7s ease-in-out;
  transform-origin: 50% 0;
}
@media (prefers-reduced-motion: reduce) {
  .notification-row-in,
  .notification-row:hover .notification-bell { animation: none; }
}
`;

function TableSkeleton({ rows = 6 }) {
  return (
    <div className="divide-y divide-slate-100" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-blue-50" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="hidden h-8 w-40 animate-pulse rounded-lg bg-blue-50/70 md:block" />
          <div className="hidden h-8 w-40 animate-pulse rounded-lg bg-[#2caba2]/10 md:block" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function IconButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 motion-safe:hover:scale-110 motion-safe:active:scale-95"
    >
      {children}
    </button>
  );
}

const HEAD_TONES = {
  en: "bg-blue-900",
  ar: "bg-[#2caba2]",
};

function HeadLabel({ tone, children }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <span className={`h-2 w-2 rounded-full ${HEAD_TONES[tone]}`} aria-hidden="true" />
      {children}
    </span>
  );
}

const ScheduledAt = ({ value, durationDay }) => {
  const date = value ? new Date(value) : null;
  const hasDate =
    date && !Number.isNaN(date.getTime()) && !String(value).startsWith("0001");

  return (
    <div className="space-y-1.5">
      {hasDate ? (
        <>
          <p className="flex items-center justify-center gap-2 whitespace-nowrap font-medium text-slate-800">
            <FontAwesomeIcon icon={faCalendarDays} className="w-3.5 text-xs text-blue-600" />
            {formatDate(value)}
          </p>
          <p className="flex items-center justify-center gap-2 whitespace-nowrap text-xs text-slate-500">
            <FontAwesomeIcon icon={faClock} className="w-3.5 text-[#2caba2]" />
            {date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        </>
      ) : (
        <p className="text-center text-slate-400">-</p>
      )}
      {durationDay != null && (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
            <FontAwesomeIcon icon={faHourglassHalf} className="text-[10px]" />
            {durationDay} {durationDay === 1 ? "day" : "days"}
          </span>
        </div>
      )}
    </div>
  );
};

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
  if (isLoading) return <TableSkeleton />;

  if (isError) {
    return (
      <QueryErrorState
        title="Unable to load notifications"
        error={error}
        onRetry={onRetry}
      />
    );
  }

  if (items.length === 0) {
    return (
      <TableEmptyState
        icon={faBell}
        title="No notifications found"
        hasActiveFilters={hasActiveFilters}
        emptyMessage="No notifications have been created yet."
      />
    );
  }

  return (
    <>
      <style>{ANIMATION_CSS}</style>
      <ScrollableTable className="scroll-table">
        <table className="w-full min-w-[960px] table-fixed text-left text-sm">
          <colgroup>
            <col className={canDelete ? "w-[23%]" : "w-1/4"} />
            <col className={canDelete ? "w-[23%]" : "w-1/4"} />
            <col className={canDelete ? "w-[23%]" : "w-1/4"} />
            <col className={canDelete ? "w-[23%]" : "w-1/4"} />
            {canDelete && <col className="w-[8%]" />}
          </colgroup>
          <thead>
            <tr className="border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-slate-50 to-[#2caba2]/10 text-xs font-semibold text-slate-600">
              <th className="px-6 py-3">Notification</th>
              <th className="px-4 py-3 text-center">
                <HeadLabel tone="en">English message</HeadLabel>
              </th>
              <th className="px-4 py-3 text-center">
                <HeadLabel tone="ar">Arabic message</HeadLabel>
              </th>
              <th className="px-4 py-3 text-center">Scheduled at</th>
              {canDelete && <th className="px-6 py-3 text-center">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {items.map((notification, index) => (
              <tr
                key={notification.notificationId}
                style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
                className="notification-row notification-row-in group transition-colors duration-200 hover:bg-blue-50/40"
              >
                {/* Notification */}
                <td className="px-6 py-3.5 transition-shadow duration-200 group-hover:shadow-[inset_3px_0_0_#1b4477]">
                  <div className="flex items-center gap-3">
                    {notification.imageUrl ? (
                      <img
                        src={notification.imageUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 bg-slate-50 object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900 ring-1 ring-blue-100 transition-colors duration-300 group-hover:bg-blue-900 group-hover:text-white group-hover:ring-blue-900">
                        <FontAwesomeIcon icon={faBell} className="notification-bell" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p
                        dir="auto"
                        title={notification.title}
                        className="max-w-[240px] truncate font-semibold text-slate-900 transition-colors group-hover:text-blue-900"
                      >
                        {notification.title}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        #{notification.notificationId}
                      </p>
                    </div>
                  </div>
                </td>

                {/* English message */}
                <td dir="ltr" className="px-4 py-3.5 text-center text-slate-600">
                  <p
                    title={notification.messageEn}
                    className="mx-auto line-clamp-2 max-w-[280px] break-words rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2 leading-5 transition-colors duration-200 group-hover:bg-blue-50"
                  >
                    {notification.messageEn}
                  </p>
                </td>

                {/* Arabic message */}
                <td dir="rtl" className="px-4 py-3.5 text-center text-slate-600">
                  <p
                    title={notification.messageAr}
                    className="mx-auto line-clamp-2 max-w-[280px] break-words rounded-lg border border-[#2caba2]/20 bg-[#2caba2]/5 px-3 py-2 leading-5 transition-colors duration-200 group-hover:bg-[#2caba2]/10"
                  >
                    {notification.messageAr}
                  </p>
                </td>

                {/* Scheduled at */}
                <td className="px-4 py-3.5">
                  <ScheduledAt
                    value={notification.scheduledAt}
                    durationDay={notification.durationDay}
                  />
                </td>

                {/* Actions */}
                {canDelete && (
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <IconButton
                        title="Delete notification"
                        onClick={() => onDelete(notification)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </IconButton>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTable>
    </>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faTrash,
//   faBell,
//   faCalendarDays,
//   faClock,
//   faHourglassHalf,
// } from "@fortawesome/free-solid-svg-icons";
// import TableEmptyState from "../../../shared/components/TableEmptyState";
// import QueryErrorState from "../../../shared/components/QueryErrorState";
// import { formatDate } from "../../../utils/formatDate";

// const GRID = "grid grid-cols-1 gap-4 bg-slate-50/60 p-4 sm:p-5 lg:grid-cols-2 2xl:grid-cols-3";

// // Small self-contained animations (disabled automatically for users who prefer reduced motion).
// const ANIMATION_CSS = `
// @keyframes notificationCardIn {
//   from { opacity: 0; transform: translateY(14px); }
//   to   { opacity: 1; transform: translateY(0); }
// }
// @keyframes notificationBell {
//   0%, 100% { transform: rotate(0); }
//   20% { transform: rotate(14deg); }
//   40% { transform: rotate(-12deg); }
//   60% { transform: rotate(8deg); }
//   80% { transform: rotate(-5deg); }
// }
// .notification-card-in {
//   animation: notificationCardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards;
// }
// .notification-card:hover .notification-bell {
//   animation: notificationBell 0.7s ease-in-out;
//   transform-origin: 50% 0;
// }
// @media (prefers-reduced-motion: reduce) {
//   .notification-card-in,
//   .notification-card:hover .notification-bell { animation: none; }
// }
// `;

// function CardsSkeleton({ count = 6 }) {
//   return (
//     <div className={GRID} aria-busy="true">
//       {Array.from({ length: count }).map((_, i) => (
//         <div
//           key={i}
//           className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
//         >
//           <div className="flex items-center gap-3">
//             <div className="h-10 w-10 animate-pulse rounded-xl bg-blue-50" />
//             <div className="flex-1 space-y-2">
//               <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
//               <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
//             </div>
//           </div>
//           <div className="h-16 animate-pulse rounded-xl bg-blue-50/70" />
//           <div className="h-16 animate-pulse rounded-xl bg-[#2caba2]/10" />
//         </div>
//       ))}
//     </div>
//   );
// }

// function IconButton({ title, onClick, children }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       title={title}
//       aria-label={title}
//       className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 motion-safe:hover:scale-110 motion-safe:active:scale-95"
//     >
//       {children}
//     </button>
//   );
// }

// const BADGE_TONES = {
//   en: "bg-blue-900 text-white",
//   ar: "bg-[#2caba2] text-white",
// };

// function LangBadge({ tone = "en", children }) {
//   return (
//     <span
//       className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${BADGE_TONES[tone]}`}
//     >
//       {children}
//     </span>
//   );
// }

// function ScheduledAt({ value }) {
//   const date = value ? new Date(value) : null;
//   const hasDate =
//     date && !Number.isNaN(date.getTime()) && !String(value).startsWith("0001");

//   if (!hasDate) return <span className="text-slate-400">-</span>;

//   return (
//     <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
//       <span className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-slate-800">
//         <FontAwesomeIcon icon={faCalendarDays} className="w-3.5 text-xs text-blue-600" />
//         {formatDate(value)}
//       </span>
//       <span className="flex items-center gap-2 whitespace-nowrap text-xs text-slate-500">
//         <FontAwesomeIcon icon={faClock} className="w-3.5 text-[#2caba2]" />
//         {date.toLocaleTimeString("en-US", {
//           hour: "2-digit",
//           minute: "2-digit",
//           hour12: true,
//         })}
//       </span>
//     </div>
//   );
// }

// function NotificationCard({ notification, canDelete, onDelete, index }) {
//   const { notificationId, title, imageUrl, messageEn, messageAr, durationDay, scheduledAt } =
//     notification;

//   return (
//     <article
//       style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
//       className="notification-card notification-card-in group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/10 motion-safe:hover:-translate-y-1"
//     >
//       {/* Brand accent bar */}
//       <span
//         aria-hidden="true"
//         className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-[#1b4477] via-blue-500 to-[#2caba2]"
//       />

//       {imageUrl && (
//         <div className="overflow-hidden border-b border-slate-100 bg-slate-50">
//           <img
//             src={imageUrl}
//             alt=""
//             className="h-36 w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
//             onError={(e) => (e.currentTarget.parentElement.style.display = "none")}
//           />
//         </div>
//       )}

//       <div className="flex flex-1 flex-col gap-4 p-5 pt-6">
//         <div className="flex items-start gap-3">
//           <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900 ring-1 ring-blue-100 transition-colors duration-300 group-hover:bg-blue-900 group-hover:text-white group-hover:ring-blue-900">
//             <FontAwesomeIcon icon={faBell} className="notification-bell" />
//           </span>
//           <div className="min-w-0 flex-1">
//             <h3
//               dir="auto"
//               title={title}
//               className="line-clamp-2 break-words font-semibold leading-5 text-slate-900 transition-colors group-hover:text-blue-900"
//             >
//               {title}
//             </h3>
//             <p className="mt-0.5 text-xs text-slate-500">#{notificationId}</p>
//           </div>
//           {canDelete && (
//             <IconButton title="Delete notification" onClick={() => onDelete(notification)}>
//               <FontAwesomeIcon icon={faTrash} />
//             </IconButton>
//           )}
//         </div>

//         <div className="space-y-3">
//           <div className="rounded-xl border border-blue-100 border-l-[3px] border-l-blue-900 bg-blue-50/50 p-3.5 transition-colors duration-300 group-hover:bg-blue-50">
//             <LangBadge tone="en">EN</LangBadge>
//             <p dir="ltr" className="mt-2 break-words text-sm leading-6 text-slate-700">
//               {messageEn}
//             </p>
//           </div>
//           <div className="rounded-xl border border-[#2caba2]/20 border-l-[3px] border-l-[#2caba2] bg-[#2caba2]/5 p-3.5 transition-colors duration-300 group-hover:bg-[#2caba2]/10">
//             <LangBadge tone="ar">AR</LangBadge>
//             <p dir="rtl" className="mt-2 break-words text-left text-sm leading-6 text-slate-700">
//               {messageAr}
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40 px-5 py-3">
//         <ScheduledAt value={scheduledAt} />
//         {durationDay != null && (
//           <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
//             <FontAwesomeIcon icon={faHourglassHalf} className="text-[10px]" />
//             {durationDay} {durationDay === 1 ? "day" : "days"}
//           </span>
//         )}
//       </div>
//     </article>
//   );
// }

// export default function NotificationsTable({
//   items,
//   isLoading,
//   isError = false,
//   error,
//   onRetry,
//   onDelete,
//   canDelete = true,
//   hasActiveFilters = false,
// }) {
//   if (isLoading) return <CardsSkeleton />;

//   if (isError) {
//     return (
//       <QueryErrorState
//         title="Unable to load notifications"
//         error={error}
//         onRetry={onRetry}
//       />
//     );
//   }

//   if (items.length === 0) {
//     return (
//       <TableEmptyState
//         icon={faBell}
//         title="No notifications found"
//         hasActiveFilters={hasActiveFilters}
//         emptyMessage="No notifications have been created yet."
//       />
//     );
//   }

//   return (
//     <div className={GRID}>
//       <style>{ANIMATION_CSS}</style>
//       {items.map((notification, index) => (
//         <NotificationCard
//           key={notification.notificationId}
//           notification={notification}
//           canDelete={canDelete}
//           onDelete={onDelete}
//           index={index}
//         />
//       ))}
//     </div>
//   );
// }