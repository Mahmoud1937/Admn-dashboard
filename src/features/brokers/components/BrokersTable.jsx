import { useTranslation } from "react-i18next";
import TableActionsCell from "../../../shared/components/TableActionsCell";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faUserTie } from "@fortawesome/free-solid-svg-icons";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import { formatDate } from "../../../utils/formatDate";

export default function BrokersTable({ brokers, searchTerm, onEdit, onDelete }) {
  const { t } = useTranslation("adminPages");
  if (!brokers.length) {
    return (
      <TableEmptyState
        icon={faUserTie}
        title={t("No brokers found")}
        hasActiveFilters={!!searchTerm}
        emptyMessage={t("No brokers have been added yet.")}
      />
    );
  }

  return (
    <ScrollableTable className="scroll-table">
      <table className="w-full min-w-[650px] text-center text-sm">
        <thead className="sticky top-0 z-10 bg-slate-100">
          <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-700">
     
            <th className="px-4 py-3">{t("Name")}</th>
            <th className="px-4 py-3">{t("Phone Number")}</th>
            <th className="px-4 py-3">{t("Joined")}</th>
            {(onEdit || onDelete) && <TableActionsCell as="th" className="px-4 py-3">{t("Actions")}</TableActionsCell>}
          </tr>
        </thead> 
        <tbody>
          {brokers.map((broker) => (
            <tr key={broker.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/60">
        
              <td dir="auto" className="px-4 py-3 font-medium text-slate-900">{broker.name}</td>
              <td dir="ltr" className="px-4 py-3 text-slate-700">{broker.phoneNumber || "-"}</td>
              <td className="px-4 py-3 text-slate-600">{formatDate(broker.joinAt)}</td>
              {(onEdit || onDelete) && (
                <TableActionsCell className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    {onEdit && (
                      <button type="button" onClick={() => onEdit(broker)} title={t("Edit broker")} aria-label={t("Edit {{name}}", { name: broker.name })} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-700">
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </button>
                    )}
                    {onDelete && (
                      <button type="button" onClick={() => onDelete(broker)} title={t("Delete broker")} aria-label={t("Delete {{name}}", { name: broker.name })} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                </TableActionsCell>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollableTable>
  );
}
