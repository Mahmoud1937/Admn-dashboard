import { Fragment, useState } from "react";
import { faBan, faCheck, faChevronDown, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RowActions from "../../../shared/components/RowActions";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import StatusBadge from "../../../shared/components/StatusBadge";
import { formatDate } from "../../../utils/formatDate";

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} EGP`;
const formatPercentage = (value) => `${Number(value || 0).toFixed(2)}%`;

function ExpandedDescription({ language, value }) {
  const isArabic = language === "Arabic";

  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {language} description
      </p>
      <p
        dir={isArabic ? "rtl" : "ltr"}
        className={`whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

export default function SubscriptionTypesTable({
  subscriptionTypes,
  hasActiveFilters,
  onEdit,
  onDeleteRequest,
  onToggleStatus,
  togglingId,
}) {
  const [expandedId, setExpandedId] = useState(null);

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
          <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-700">
      
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
          {subscriptionTypes.map((subscriptionType) => {
            const expanded = expandedId === subscriptionType.id;
            const detailsId = `subscription-description-${subscriptionType.id}`;
            const toggleExpanded = () =>
              setExpandedId((currentId) =>
                currentId === subscriptionType.id ? null : subscriptionType.id
              );

            return (
              <Fragment key={subscriptionType.id}>
                <tr
                  onClick={toggleExpanded}
                  className={`cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50/60 ${
                    expanded ? "bg-blue-50/40" : "bg-white"
                  }`}
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
                <button
                  type="button"
                  aria-label={expanded ? "Hide descriptions" : "Show descriptions"}
                  aria-expanded={expanded}
                  aria-controls={expanded ? detailsId : undefined}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleExpanded();
                  }}
                  className="flex w-full items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate" title={subscriptionType.descriptionEn || subscriptionType.descriptionAr || ""}>
                      {subscriptionType.descriptionEn || subscriptionType.descriptionAr || "-"}
                    </span>
                    {subscriptionType.descriptionAr && (
                      <span className="mt-0.5 block truncate text-xs text-slate-400" dir="rtl" title={subscriptionType.descriptionAr}>
                        {subscriptionType.descriptionAr}
                      </span>
                    )}
                  </span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`shrink-0 text-xs text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
              </td>
              <td className="px-6 py-3 text-slate-600">
                {formatDate(subscriptionType.createdAt)}
              </td>
              <td className="px-6 py-3 text-slate-600">
                {subscriptionType.totalUserSubscriptions ?? 0}
              </td>
              <td className="px-6 py-3" onClick={(event) => event.stopPropagation()}>
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
              <td className="px-6 py-3" onClick={(event) => event.stopPropagation()}>
                <RowActions
                  onEdit={onEdit ? () => onEdit(subscriptionType) : undefined}
                  onDelete={onDeleteRequest ? () => onDeleteRequest(subscriptionType) : undefined}
                />
              </td>
                </tr>
                {expanded && (
                  <tr id={detailsId} className="border-b border-slate-200 bg-slate-50/70">
                    <td colSpan={10} className="px-6 py-4">
                      <div className="grid gap-3 text-left md:grid-cols-2">
                        <ExpandedDescription language="English" value={subscriptionType.descriptionEn} />
                        <ExpandedDescription language="Arabic" value={subscriptionType.descriptionAr} />
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </ScrollableTable>
  );
}
