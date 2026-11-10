import { useTranslation } from "react-i18next";
import TableActionsCell from "../../../shared/components/TableActionsCell";
import { faUserDoctor } from "@fortawesome/free-solid-svg-icons";
import RowActions from "../../../shared/components/RowActions";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import ScrollableTable from "../../../shared/components/ScrollableTable";

export default function SpecialistsTable({ specialists, hasActiveFilters, onEdit, onDeleteRequest }) {
  const { t } = useTranslation("adminPages");
  if (specialists.length === 0) {
    return (
      <TableEmptyState
        icon={faUserDoctor}
        title={t("No specialists found")}
        hasActiveFilters={hasActiveFilters}
        emptyMessage={t("Get started by adding a new specialist.")}
      />
    );
  }

  return (
  <ScrollableTable maxHeight="60vh">
      <table className="w-full min-w-[500px] text-center text-sm">
   <thead className="sticky top-0 z-10 bg-slate-100">
        <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-700">
          <th className="px-6 py-3">{t("English Name")}</th>
          <th className="px-6 py-3">{t("Arabic Name")}</th>
          <TableActionsCell as="th" className="px-6 py-3 text-center">{t("Actions")}</TableActionsCell>
        </tr>
      </thead>

      <tbody>
        {specialists.map((specialist) => (
          <tr key={specialist.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/60">
            <td className="px-6 py-3 font-medium text-slate-900">{specialist.enName}</td>
            <td className="px-6 py-3 text-slate-600">{specialist.arName}</td>
            <TableActionsCell className="px-6 py-3">
              <RowActions onEdit={onEdit ? () => onEdit(specialist) : undefined} onDelete={onDeleteRequest ? () => onDeleteRequest(specialist) : undefined} />
            </TableActionsCell>
          </tr>
        ))}
      </tbody>
    </table>
  </ScrollableTable>
  );
}
