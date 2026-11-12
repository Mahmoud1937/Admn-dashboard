import { getActiveLanguage } from "../../../localization/i18n";
import localizeMessage from "../../../localization/localizeMessage";
import { useTranslation } from "react-i18next";
import TableActionsCell from "../../../shared/components/TableActionsCell";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faUsers,
  faUserSlash,
  faBan,
  faCheck,
  faPenToSquare,
  faKey,
  faUserShield
} from "@fortawesome/free-solid-svg-icons";
import ClientAvatar from "../../../shared/components/ClientAvatar";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import StatusBadge from "../../../shared/components/StatusBadge";
import Skeleton from "../../../shared/components/Skeleton";

/* ---------- helpers ---------- */
const isPlaceholder = (v) =>
  !v || v.startsWith("EMP-") || v.endsWith("@invalid.local");

const getEmployeeName = (e) =>
  [e.firstName ?? e.employeeFirstName, e.lastName ?? e.employeeLastName]
    .filter(Boolean)
    .join(" ")
    .trim() ||
  e.fullName?.trim() ||
  e.name?.trim() ||
  e.employeeName?.trim() ||
  "";

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return localizeMessage("Just now");
  if (min < 60) return new Intl.RelativeTimeFormat(getActiveLanguage(), { numeric: "auto" }).format(-min, "minute");
  const hr = Math.floor(min / 60);
  if (hr < 24) return new Intl.RelativeTimeFormat(getActiveLanguage(), { numeric: "auto" }).format(-hr, "hour");
  const day = Math.floor(hr / 24);
  if (day < 30) return new Intl.RelativeTimeFormat(getActiveLanguage(), { numeric: "auto" }).format(-day, "day");
  return new Date(date).toLocaleDateString(getActiveLanguage() === "ar" ? "ar-EG" : "en-GB");
};

const fullDate = (d) => new Date(d).toLocaleString(getActiveLanguage() === "ar" ? "ar-EG" : "en-GB");

/* ---------- small pieces ---------- */
function GroupBadge({ name }) {
  if (!name) return <span className="text-slate-400">-</span>;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
      <FontAwesomeIcon icon={faUsers} className="text-[10px] text-slate-400" />
      {name}
    </span>
  );
}

function ContactLine({ icon, value }) {
  if (isPlaceholder(value)) return null;
  return (
    <div className="flex items-center gap-2 text-slate-600">
      <FontAwesomeIcon icon={icon} className="w-3 text-xs text-slate-400" />
      <span className="truncate">{value}</span>
    </div>
  );
}

function SkeletonRow({ showActions }) {
  return (
    <Skeleton as="tr" className="border-b border-slate-200 last:border-b-0">
      <td className="px-4 py-4"><div className="h-4 w-8 rounded bg-slate-200" /></td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="h-3.5 w-32 rounded bg-slate-200" />
            <div className="h-3 w-24 rounded bg-slate-100" />
          </div>
        </div>
      </td>
      <td className="px-4 py-4"><div className="h-3.5 w-28 rounded bg-slate-200" /></td>
      <td className="px-4 py-4"><div className="h-6 w-28 rounded-md bg-slate-200" /></td>
      <td className="px-4 py-4"><div className="h-3.5 w-16 rounded bg-slate-200" /></td>
      <td className="px-4 py-4"><div className="h-6 w-20 rounded-full bg-slate-200" /></td>
      {showActions && (
        <TableActionsCell className="px-4 py-4">
          <div className="mx-auto h-6 w-20 rounded bg-slate-200" />
        </TableActionsCell>
      )}
    </Skeleton>
  );
}

const TH = "px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider";

/* ---------- table ---------- */
export default function EmployeesTable({
  employees = [],
  isLoading,
  onToggleStatus,
  onEdit,
  onResetPassword,
  togglingEmployeeId,
  onManagePermissions,
  canUpdate = false,
  canManagePermissions = false,
}) {
  const { t } = useTranslation("adminPages");
  const showActions = canUpdate || canManagePermissions;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <ScrollableTable maxHeight="70vh">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100 text-left text-slate-700 shadow-[0_1px_0_0_rgb(226,232,240)]">
            <tr>
              <th className={`${TH} w-16`}>{t("ID")}</th>
              <th className={`${TH} text-start`}>{t("Employee")}</th>
              <th className={`${TH} text-start`}>{t("Contact")}</th>
              <th className={TH}>{t("Group")}</th>
              <th className={TH}>{t("Last Login")}</th>
              <th className={TH}>{t("Status")}</th>
              {showActions && <TableActionsCell as="th" className={TH}>{t("Actions")}</TableActionsCell>}
            </tr>
          </thead>

          <tbody className="bg-white">
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} showActions={showActions} />
              ))}

            {!isLoading && employees.length === 0 && (
              <tr>
                <td colSpan={showActions ? 7 : 6} className="px-4 py-16">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FontAwesomeIcon icon={faUserSlash} className="text-3xl" />
                    <p className="text-sm font-medium text-slate-500">{t("No employees found")}</p>
                    <p className="text-xs">{t("Try changing your search or filter")}</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              employees.map((e) => {
                const id = e.employeeId ?? e.id;
                const name = getEmployeeName(e);
                const hasContact = !isPlaceholder(e.phoneNumber) || !isPlaceholder(e.email);

                return (
                  <tr
                    key={id}
                    className={`border-b border-slate-200 transition-colors last:border-b-0 ${
                      e.isBlocked
                        ? "bg-red-50/40 hover:bg-red-100/60"
                        : "hover:bg-blue-50/60"
                    }`}
                  >
                    <td className="px-4 py-3.5 text-slate-400">#{id ?? "-"}</td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <ClientAvatar
                          name={name}
                          colorSeed={id}
                          sizeClass="h-10 w-10"
                          textClass="text-sm font-semibold"
                        />
                        <div className="min-w-0">
                          <p dir="auto" className="truncate font-medium text-slate-900">
                            {name || <span className="text-slate-400">{t("Unnamed")}</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {hasContact ? (
                        <div className="max-w-[260px] space-y-1 ">
                          <ContactLine icon={faPhone} value={e.phoneNumber} />
                          <ContactLine icon={faEnvelope} value={e.email} />
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <GroupBadge name={e.groupName || e.employeeGroupName} />
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {e.lastLoginDate ? (
                        <span title={fullDate(e.lastLoginDate)} className="text-slate-600">
                          {timeAgo(e.lastLoginDate)}
                        </span>
                      ) : (
                        <span className="text-slate-400">{t("Never")}</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge
                        tone={e.isBlocked ? "danger" : "emerald"}
                        size="sm"
                      >
                        <span
                          className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                            e.isBlocked ? "bg-red-500" : "bg-emerald-500"
                          }`}
                        />
                        {e.isBlocked ? t("Blocked") : t("Active")}
                      </StatusBadge>
                    </td>

                    {showActions && (
                      <TableActionsCell
                        backgroundColor={e.isBlocked ? "color-mix(in oklab, var(--color-red-50) 40%, transparent)" : undefined}
                        hoverColor={e.isBlocked
                          ? "color-mix(in oklab, var(--color-red-100) 60%, transparent)"
                          : "color-mix(in oklab, var(--color-blue-50) 60%, transparent)"}
                        className="px-4 py-3.5"
                      >
                        <div className="flex items-center justify-center gap-1">
                          {canUpdate && (
                            <>
                              <button
                                type="button"
                                onClick={() => onEdit?.(e)}
                                title={t("Edit employee")}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <FontAwesomeIcon icon={faPenToSquare} size="sm" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onResetPassword?.(e)}
                                title={t("Reset password")}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                              >
                                <FontAwesomeIcon icon={faKey} size="sm" />
                              </button>
                            </>
                          )}
                          {canManagePermissions && (
                            <button
                              type="button"
                              onClick={() => onManagePermissions?.(e)}
                              title={t("Manage permissions")}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              <FontAwesomeIcon icon={faUserShield} size="sm" />
                            </button>
                          )}
                          {canUpdate && (
                            <button
                              type="button"
                              onClick={() => onToggleStatus?.(e)}
                              disabled={togglingEmployeeId === id}
                              title={e.isBlocked ? t("Activate") : t("Block")}
                              className={`rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 ${
                                e.isBlocked
                                  ? "hover:text-green-700"
                                  : "hover:text-red-700"
                              }`}
                            >
                              <FontAwesomeIcon
                                icon={e.isBlocked ? faCheck : faBan}
                                size="sm"
                              />
                            </button>
                          )}
                        </div>
                      </TableActionsCell>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </ScrollableTable>
    </div>
  );
}
