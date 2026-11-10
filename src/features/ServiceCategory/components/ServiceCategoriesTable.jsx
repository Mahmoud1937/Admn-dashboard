import TableActionsCell from "../../../shared/components/TableActionsCell";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import RowActions from "../../../shared/components/RowActions";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import AvatarImage from "../../../shared/components/AvatarImage";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import useServiceCategoriesText from "../../../localization/useServiceCategoriesText";

export default function ServiceCategoriesTable({ categories, hasActiveFilters, onEdit, onDeleteRequest, rtl = false }) {
  const t = useServiceCategoriesText();
  if (categories.length === 0) {
    return (
      <TableEmptyState
        icon={faLayerGroup}
        title={t("No service categories found")}
        hasActiveFilters={hasActiveFilters}
        emptyMessage={t("Get started by adding a new service category.")}
        filterMessage={t("Try a different search term.")}
      />
    );
  }

  return (
    <ScrollableTable maxHeight="60vh">

    <table className="w-full text-center text-sm">
     <thead className="sticky top-0 z-10 bg-slate-100">
        <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-700">
          <th className="px-6 py-3">{t("Logo")}</th>
          <th className="px-6 py-3">{t("English Name")}</th>
          <th className="px-6 py-3">{t("Arabic Name")}</th>
          <TableActionsCell as="th" side={rtl ? "left" : "right"} className="px-6 py-3 text-center">{t("Actions")}</TableActionsCell>
        </tr>
      </thead>

      <tbody>
        {categories.map((category) => (
          <tr key={category.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/60">
            <td className="px-6 py-3"><div className="flex justify-center">
              <AvatarImage src={category.imageUrl} alt={rtl ? (category.arName || category.enName) : category.enName} loading="lazy" />
            </div></td>
            <td dir="ltr" className="px-6 py-3 font-medium text-slate-900">{category.enName}</td>
            <td dir="rtl" className="px-6 py-3 text-slate-600">{category.arName}</td>
            <TableActionsCell side={rtl ? "left" : "right"} className="px-6 py-3">
              <RowActions onEdit={onEdit ? () => onEdit(category) : undefined} onDelete={onDeleteRequest ? () => onDeleteRequest(category) : undefined} editLabel={t("Edit")} deleteLabel={t("Delete")} />
            </TableActionsCell>
          </tr>
        ))}
      </tbody>
    </table>
    </ScrollableTable>
  );
}
