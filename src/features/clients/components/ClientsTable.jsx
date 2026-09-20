import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faCheck, faUsers } from "@fortawesome/free-solid-svg-icons";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import StatusBadge from "../../../shared/components/StatusBadge";
import LazyImageCell from "../../../shared/components/LazyImageCell";
import ImageLightbox from "../../../shared/components/ImageLightbox";
import { formatDate } from "../../../utils/formatDate";

export default function ClientsTable({ clients, isLoading, onToggleBlock }) {
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);

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
      <table className="min-w-[1300px] w-full text-center text-sm">
        <thead className="sticky top-0 z-10 bg-slate-100">
          <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3 text-center me-[15px]">Client</th>
            <th className="px-4 py-3 text-center">Phone</th>
            <th className="px-4 py-3 text-center">Gender</th>
            <th className="px-4 py-3 text-center">National ID</th>
            <th className="px-4 py-3 text-center">Passport No.</th>
            <th className="px-4 py-3 text-center">Card Number</th>
            <th className="px-4 py-3 text-center">Card Expires</th>
            <th className="px-4 py-3 text-center">Birth Date</th>
            <th className="px-4 py-3 text-center">Join Date</th>
            <th className="px-4 py-3 text-center">Activated At</th>
            <th className="px-4 py-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const fullName = client.userName ?? "";
            const hasImage = client.clientImage && !client.clientImage.endsWith("medicardeg.com/");

            return (
              <tr
                key={client.clientId}
                className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/60"
              >
                <td className="px-4 py-3">
                  <div
                    onClick={() => navigate(`/clients/${client.clientId}`)}
                    className="flex cursor-pointer items-center ms-[48px] gap-3 whitespace-nowrap rounded-[7px] px-2 py-1.5 transition-colors duration-200 hover:bg-white/70"
                  >
                    {hasImage ? (
                      <LazyImageCell
                        url={client.clientImage}
                        label={fullName}
                        onPreview={(url, label) =>
                          setPreviewImage({ url, label })
                        }
                        size="h-8 w-8"
                      />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-500 ">
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

      <ImageLightbox
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </ScrollableTable>
  );
}
