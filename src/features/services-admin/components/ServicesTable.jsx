import { faStethoscope } from "@fortawesome/free-solid-svg-icons";
import RowActions from "../../../shared/components/RowActions";
import TableEmptyState from "../../../shared/components/TableEmptyState";

export default function ServicesTable({ services, hasActiveFilters, onEdit, onDeleteRequest }) {
  if (services.length === 0) {
    return (
      <TableEmptyState
        icon={faStethoscope}
        title="No services found"
        hasActiveFilters={hasActiveFilters}
        emptyMessage="Get started by adding a new service."
      />
    );
  }

  return (
    <div className="scroll-table">
      <table className="w-full text-center text-sm">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
            <th className="px-6 py-3">English Name</th>
            <th className="px-6 py-3">Arabic Name</th>
            <th className="px-6 py-3">Category</th>
            <th className="px-6 py-3">CPT</th>
            <th className="px-6 py-3">Instructions</th>
            <th className="px-6 py-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {services.map((service) => (
            <tr key={service.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
              <td className="px-6 py-3 font-medium text-slate-900">{service.enName}</td>
              <td className="px-6 py-3 text-slate-600">{service.arName}</td>
              <td className="px-6 py-3 text-slate-600">{service.categoryNameEn || "—"}</td>
              <td className="px-6 py-3 text-slate-600">{service.cpt || "—"}</td>
              <td
                className="max-w-xs truncate px-6 py-3 text-slate-600"
                title={service.serviceInstruction || ""}
              >
                {service.serviceInstruction || "—"}
              </td>
              <td className="px-6 py-3">
                <RowActions onEdit={() => onEdit(service)} onDelete={() => onDeleteRequest(service)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}