import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import AvatarImage from "../../../shared/components/AvatarImage";
import RowActions from "../../../shared/components/RowActions";

export default function CategoriesTable({ categories, hasActiveFilters, onEdit, onDeleteRequest }) {
  if (categories.length === 0) {
    return (
      <TableEmptyState
        icon={faLayerGroup}
        title="No categories found"
        hasActiveFilters={hasActiveFilters}
        emptyMessage="Get started by adding a new category."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead>
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
                <AvatarImage src={category.imageUrl} alt={category.enName} />
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
    </div>
  );
}