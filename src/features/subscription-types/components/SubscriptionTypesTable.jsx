import { faBan, faCheck, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RowActions from "../../../shared/components/RowActions";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import StatusBadge from "../../../shared/components/StatusBadge";
import { formatDate } from "../../../utils/formatDate";

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} EGP`;
const formatPercentage = (value) => `${Number(value || 0).toFixed(2)}%`;

export default function SubscriptionTypesTable({
  subscriptionTypes,
  hasActiveFilters,
  onEdit,
  onDeleteRequest,
  onToggleStatus,
  togglingId,
}) {
  if (subscriptionTypes.length === 0) {
    return (
      <TableEmptyState
        icon={faCreditCard}
        title="No subscription types found"
        hasActiveFilters={hasActiveFilters}
        emptyMessage="There are no subscription types to display."
      />
    );
  }

  return (
    <ScrollableTable maxHeight="60vh">
      <table className="w-full min-w-[1400px] text-center text-sm">
        <thead className="sticky top-0 z-10 bg-slate-100">
          <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
      
            <th className="px-6 py-3 text-center">English Name</th>
            <th className="px-6 py-3 text-center">Arabic Name</th>
            <th className="px-6 py-3 text-center">Price Before</th>
            <th className="px-6 py-3 text-center">Price After</th>
            <th className="px-6 py-3 text-center">Discount</th>
            <th className="px-6 py-3 text-center">Description</th>
            <th className="px-6 py-3 text-center">Created At</th>
            <th className="px-6 py-3 text-center">Subscriptions</th>
            <th className="px-6 py-3 text-center">Status</th>
            <th className="px-6 py-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {subscriptionTypes.map((subscriptionType) => (
            <tr
              key={subscriptionType.id}
              className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/60"
            >
  
              <td className="px-6 py-3 text-center font-medium text-slate-900">
                {subscriptionType.nameEn || "-"}
              </td>
              <td className="px-6 py-3 text-center text-slate-600" dir="rtl">
                {subscriptionType.nameAr || "-"}
              </td>
              <td className="px-6 py-3 text-slate-600">
                {formatMoney(subscriptionType.priceBefore)}
              </td>
              <td className="px-6 py-3 font-medium text-slate-900">
                {formatMoney(subscriptionType.priceAfter)}
              </td>
              <td className="px-6 py-3 text-slate-600">
                {formatPercentage(subscriptionType.discountPercentage)}
              </td>
              <td className="max-w-[320px] px-6 py-3 text-slate-600">
                <p
                  className="truncate"
                  title={
                    subscriptionType.descriptionEn ||
                    subscriptionType.descriptionAr ||
                    ""
                  }
                >
                  {subscriptionType.descriptionEn ||
                    subscriptionType.descriptionAr ||
                    "-"}
                </p>
                {subscriptionType.descriptionAr && (
                  <p
                    className="mt-0.5 truncate text-xs text-slate-400"
                    dir="rtl"
                    title={subscriptionType.descriptionAr}
                  >
                    {subscriptionType.descriptionAr}
                  </p>
                )}
              </td>
              <td className="px-6 py-3 text-slate-600">
                {formatDate(subscriptionType.createdAt)}
              </td>
              <td className="px-6 py-3 text-slate-600">
                {subscriptionType.totalUserSubscriptions ?? 0}
              </td>
              <td className="px-6 py-3">
                <div className="flex items-center justify-center gap-2">
                  <StatusBadge
                    tone={subscriptionType.isActive ? "success" : "inactive"}
                  >
                    {subscriptionType.isActive ? "Active" : "Inactive"}
                  </StatusBadge>
                  {onToggleStatus && (
                    <button
                      type="button"
                      onClick={() => onToggleStatus(subscriptionType)}
                      disabled={togglingId === subscriptionType.id}
                      title={subscriptionType.isActive ? "Deactivate" : "Activate"}
                      className={`rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 ${
                        subscriptionType.isActive
                          ? "hover:text-red-700"
                          : "hover:text-green-700"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={subscriptionType.isActive ? faBan : faCheck}
                        size="sm"
                      />
                    </button>
                  )}
                </div>
              </td>
              <td className="px-6 py-3">
                <RowActions
                  onEdit={onEdit ? () => onEdit(subscriptionType) : undefined}
                  onDelete={onDeleteRequest ? () => onDeleteRequest(subscriptionType) : undefined}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollableTable>
  );
}
