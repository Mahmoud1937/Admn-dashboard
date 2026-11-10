import TableActionsCell from "../../../shared/components/TableActionsCell";
import { faStethoscope } from "@fortawesome/free-solid-svg-icons";
import RowActions from "../../../shared/components/RowActions";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import useServicesAdminText from "../../../localization/useServicesAdminText";

function BilingualName({ en, ar, primary = false, rtl = false }) {
  const mainName = rtl ? ar : en;
  const secondaryName = rtl ? en : ar;
  return (
    <div className="min-w-0 max-w-[280px] leading-tight">
      <p dir={rtl ? "rtl" : "ltr"}
        className={`truncate ${
          primary ? "font-semibold text-slate-900" : "font-medium text-slate-800"
        }`}
      >
        {mainName || secondaryName || "—"}
      </p>
      {mainName && secondaryName && (
        <p
          dir={rtl ? "ltr" : "rtl"}
          lang={rtl ? "en" : "ar"}
          className="mt-0.5 truncate text-xs text-slate-500"
        >
          {secondaryName}
        </p>
      )}
    </div>
  );
}

export default function ServicesTable({
  services,
  hasActiveFilters,
  onEdit,
  onDeleteRequest,
  rtl = false,
}) {
  const t = useServicesAdminText();
  if (services.length === 0) {
    return (
      <TableEmptyState
        icon={faStethoscope}
        title={t("No services found")}
        hasActiveFilters={hasActiveFilters}
        emptyMessage={t("Get started by adding a new service.")}
        filterMessage={t("Try a different search term.")}
      />
    );
  }

  const showActions = !!(onEdit || onDeleteRequest);

  return (
    <ScrollableTable maxHeight="60vh">
      <table className={`w-full min-w-[820px] text-sm ${rtl ? "text-right" : "text-left"}`}>
        <thead className="sticky top-0 z-10 bg-slate-100">
          <tr className="border-b border-slate-200 text-xs font-medium text-slate-700">
            <th className="px-6 py-3">{t("Service")}</th>
            <th className="px-4 py-3">{t("Category")}</th>
            <th className="px-4 py-3">{t("CPT")}</th>
            <th className="px-4 py-3">{t("Instructions")}</th>
            {showActions && <TableActionsCell as="th" side={rtl ? "left" : "right"} className="px-6 py-3 text-center">{t("Actions")}</TableActionsCell>}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {services.map((service) => (
            <tr
              key={service.id}
              className="transition-colors hover:bg-slate-50"
            >
              <td className="px-6 py-3.5">
                <BilingualName
                  en={service.enName}
                  ar={service.arName}
                  primary
                  rtl={rtl}
                />
              </td>

              <td className="px-4 py-3.5">
                <BilingualName
                  en={service.categoryNameEn}
                  ar={service.categoryNameAr}
                  rtl={rtl}
                />
              </td>

              <td className="whitespace-nowrap px-4 py-3.5">
                {service.cpt ? (
                  <span dir="ltr" className="inline-flex rounded-md bg-slate-100 px-2 py-1 font-mono text-xs tabular-nums text-slate-700">
                    {service.cpt}
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>

              <td
                className="max-w-xs truncate px-4 py-3.5 text-slate-600"
                title={service.serviceInstruction || ""}
              >
                {service.serviceInstruction || (
                  <span className="text-slate-400">—</span>
                )}
              </td>

              {showActions && (
                <TableActionsCell side={rtl ? "left" : "right"} hoverColor="var(--color-slate-50)" className="px-6 py-3.5">
                  <RowActions
                    onEdit={onEdit ? () => onEdit(service) : undefined}
                    onDelete={
                      onDeleteRequest
                        ? () => onDeleteRequest(service)
                        : undefined
                    }
                    editLabel={t("Edit")}
                    deleteLabel={t("Delete")}
                  />
                </TableActionsCell>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollableTable>
  );
}
