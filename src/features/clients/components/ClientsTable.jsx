import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faBan, faCheck, faUsers } from "@fortawesome/free-solid-svg-icons";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import StatusBadge from "../../../shared/components/StatusBadge";
import { formatDate } from "../../../utils/formatDate";

const ImagePreviewModal = ({ src, name, onClose }) => (
  <div
    onClick={onClose}
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
  >
    <div className="relative max-h-[85vh] max-w-lg" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={onClose}
        className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow hover:text-slate-900"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
      <img
        src={src}
        alt={name}
        className="max-h-[85vh] max-w-lg rounded-xl object-contain shadow-lg"
      />
    </div>
  </div>
);

export default function ClientsTable({ clients, isLoading, onToggleBlock }) {
  const navigate = useNavigate();
  const [previewClient, setPreviewClient] = useState(null);

  if (isLoading) {
    return <div className="py-10 text-center text-sm text-slate-400">Loading clients...</div>;
  }

  if (!clients.length) {
    return (
      <TableEmptyState
        icon={faUsers}
        title="No clients found"
        hasActiveFilters={false}
        emptyMessage="There are no clients to display."
      />
    );
  }

  return (
    <ScrollableTable maxHeight="60vh">
      <table className="min-w-[1300px] w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Client</th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Gender</th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">National ID</th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Passport No.</th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Card Number</th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Card Expires</th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Birth Date</th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Join Date</th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Activated At</th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, idx) => {
            const fullName = client.userName ?? "";
            const hasImage = client.clientImage && !client.clientImage.endsWith("medicardeg.com/");

            return (
              <tr
                key={client.clientId}
                className={`border-b border-slate-50 last:border-0 transition-all hover:bg-primary-600/10 hover:text-primary-600 ${
                  idx % 2 === 1 ? "bg-slate-50/40" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div
                    onClick={() => navigate(`/clients/${client.clientId}`)}
                    className="flex cursor-pointer items-center gap-3 whitespace-nowrap rounded-[7px] px-2 py-1.5 transition-colors duration-200 hover:bg-white/70"
                  >
                    {hasImage ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewClient(client);
                        }}
                        title="View photo"
                        className="h-8 w-8 shrink-0 overflow-hidden rounded-full ring-offset-2 hover:ring-2 hover:ring-blue-400"
                      >
                        <img
                          src={client.clientImage}
                          alt={fullName}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-500">
                        {fullName.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                    <p className="text-sm font-medium text-slate-700">{fullName || "-"}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{client.phoneNumber || "-"}</td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{client.isMale ? "Male" : "Female"}</td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{client.nationalId || "-"}</td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{client.passportNumber || "-"}</td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{client.cardNumber || "No Card"}</td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{formatDate(client.expiredAt)}</td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{formatDate(client.birthDate)}</td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{formatDate(client.joinDate)}</td>
                <td className="px-4 py-3 text-sm text-slate-500 text-center">
                  {client.activatedAt ? formatDate(client.activatedAt) : "-"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <StatusBadge tone={client.isBlocked ? "danger" : "success"}>
                      {client.isBlocked ? "Blocked" : "Active"}
                    </StatusBadge>
                    <button
                      onClick={() => onToggleBlock?.(client)}
                      title={client.isBlocked ? "Activate" : "Block"}
                      className={`rounded-lg p-1.5 hover:bg-slate-100 ${
                        client.isBlocked ? "text-slate-400 hover:text-green-700" : "text-slate-400 hover:text-red-700"
                      }`}
                    >
                      <FontAwesomeIcon icon={client.isBlocked ? faCheck : faBan} size="sm" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {previewClient && (
        <ImagePreviewModal
          src={previewClient.clientImage}
          name={previewClient.userName ?? ""}
          onClose={() => setPreviewClient(null)}
        />
      )}
    </ScrollableTable>
  );
}