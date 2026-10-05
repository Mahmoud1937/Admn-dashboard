import { faStethoscope } from "@fortawesome/free-solid-svg-icons";
import RowActions from "../../../shared/components/RowActions";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import ScrollableTable from "../../../shared/components/ScrollableTable";

function BilingualName({ en, ar, primary = false }) {
  return (
    <div className="min-w-0 max-w-[280px] leading-tight">
      <p
        className={`truncate ${
          primary ? "font-semibold text-slate-900" : "font-medium text-slate-800"
        }`}
      >
        {en || "—"}
      </p>
      {ar && (
        <p
          dir="rtl"
          lang="ar"
          style={{ textAlign: "left" }}
          className="mt-0.5 truncate text-xs text-slate-500"
        >
          {ar}
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
}) {
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

  const showActions = !!(onEdit || onDeleteRequest);

  return (
    <ScrollableTable maxHeight="60vh">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50">
          <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
            <th className="px-6 py-3">Service</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">CPT</th>
            <th className="px-4 py-3">Instructions</th>
            {showActions && <th className="px-6 py-3 text-center">Actions</th>}
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
                />
              </td>

              <td className="px-4 py-3.5">
                <BilingualName
                  en={service.categoryNameEn}
                  ar={service.categoryNameAr}
                />
              </td>

              <td className="whitespace-nowrap px-4 py-3.5">
                {service.cpt ? (
                  <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 font-mono text-xs tabular-nums text-slate-700">
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
                <td className="px-6 py-3.5">
                  <RowActions
                    onEdit={onEdit ? () => onEdit(service) : undefined}
                    onDelete={
                      onDeleteRequest
                        ? () => onDeleteRequest(service)
                        : undefined
                    }
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollableTable>
  );
}