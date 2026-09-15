import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import RowActions from "../../../shared/components/RowActions";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import AvatarImage from "../../../shared/components/AvatarImage";
import ScrollableTable from "../../../shared/components/ScrollableTable";

export default function ServiceCategoriesTable({ categories, hasActiveFilters, onEdit, onDeleteRequest }) {
  if (categories.length === 0) {
    return (
      <TableEmptyState
        icon={faLayerGroup}
        title="No service categories found"
        hasActiveFilters={hasActiveFilters}
        emptyMessage="Get started by adding a new service category."
      />
    );
  }

  return (
    <ScrollableTable maxHeight="60vh">

    <table className="w-full text-left text-sm">
     <thead className="bg-slate-100 sticky top-0 z-10">
        <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
          <th className="px-6 py-3">Logo</th>
          <th className="px-6 py-3">English Name</th>
          <th className="px-6 py-3">Arabic Name</th>
          <th className="px-6 py-3 text-center">Actions</th>
        </tr>
      </thead>

      <tbody>
        {categories.map((category) => (
          <tr key={category.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
            <td className="px-6 py-3">
              <AvatarImage src={category.imageUrl} alt={category.enName} loading="lazy" />
            </td>
            <td className="px-6 py-3 font-medium text-slate-900">{category.enName}</td>
            <td className="px-6 py-3 text-slate-600">{category.arName}</td>
            <td className="px-6 py-3">
              <RowActions onEdit={() => onEdit(category)} onDelete={() => onDeleteRequest(category)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </ScrollableTable>
  );
}
