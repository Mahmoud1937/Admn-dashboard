import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faCheck, faUsers } from "@fortawesome/free-solid-svg-icons";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import StatusBadge from "../../../shared/components/StatusBadge";
import LazyImageCell from "../../../shared/components/LazyImageCell";
import ImageLightbox from "../../../shared/components/ImageLightbox";
import ClientAvatar from "../../../shared/components/ClientAvatar";
import { formatDate } from "../../../utils/formatDate";
import Skeleton, { SkeletonTable } from "../../../shared/components/Skeleton";
import useClientsText from "../../../localization/useClientsText";

function TableSkeleton({ rows = 7, label }) {
  return (
    <SkeletonTable
      rows={rows}
      label={label}
      rowClassName="flex items-center gap-5 px-6 py-4"
    >
      <Skeleton className="h-9 w-9 shrink-0 rounded-full bg-slate-100" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-40 rounded bg-slate-100" />
        <Skeleton className="h-3 w-28 rounded bg-slate-100" />
      </div>
      <Skeleton className="hidden h-3 w-32 rounded bg-slate-100 md:block" />
      <Skeleton className="hidden h-3 w-28 rounded bg-slate-100 md:block" />
      <Skeleton className="h-6 w-16 rounded-full bg-slate-100" />
    </SkeletonTable>
  );
}

const Muted = ({ children = "-" }) => (
  <span className="text-slate-400">{children}</span>
);

export default function ClientsTable({
  clients,
  isLoading,
  onToggleBlock,
  togglingClientId,
  rtl = false,
}) {
  const t = useClientsText();
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);

  if (isLoading) {
    return <TableSkeleton label={t("Loading clients...")} />;
  }

  if (!clients.length) {
    return (
      <TableEmptyState
        icon={faUsers}
        title={t("No clients found")}
        hasActiveFilters={false}
        emptyMessage={t("There are no clients to display.")}
      />
    );
  }

  return (
    <ScrollableTable maxHeight="60vh">
      <table className={`w-full min-w-[1100px] text-sm ${rtl ? "text-right" : "text-left"}`}>
        <thead className="sticky top-0 z-10 bg-slate-100">
          <tr className="border-b border-slate-200 text-xs font-medium text-slate-700">
            <th className="px-6 py-3">{t("Client")}</th>
            <th className="px-4 py-3">{t("Gender")}</th>
            <th className="px-4 py-3">{t("ID documents")}</th>
            <th className="px-4 py-3">{t("Card")}</th>
            <th className="px-4 py-3">{t("Birth date")}</th>
            <th className="px-4 py-3">{t("Joined")}</th>
            <th className="px-6 py-3 text-center">{t("Status")}</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {clients.map((client) => {
            const fullName = client.userName ?? "";
            const hasImage =
              client.clientImage &&
              !client.clientImage.endsWith("medicardeg.com/");
            const openClient = () => navigate(`/clients/${client.clientId}`);

            return (
              <tr
                key={client.clientId}
                className="transition-colors hover:bg-slate-50"
              >
                {/* Client + phone */}
                <td className="px-6 py-3">
                  <div
                    role="link"
                    tabIndex={0}
                    onClick={openClient}
                    onKeyDown={(e) => e.key === "Enter" && openClient()}
                    className="flex max-w-[300px] cursor-pointer items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  >
                    {hasImage ? (
                      <LazyImageCell
                        url={client.clientImage}
                        label={fullName}
                        onPreview={(url, label) =>
                          setPreviewImage({ url, label })
                        }
                        size="h-9 w-9"
                      />
                    ) : (
                      <ClientAvatar
                        name={fullName}
                        colorSeed={client.clientId}
                        textClass="text-md"
                      />
                    )}
                    <div className="min-w-0">
                      <p
                        dir="auto"
                        title={fullName}
                        style={{ textAlign: "start" }}
                        className="truncate font-semibold text-slate-900 hover:text-blue-800"
                      >
                        {fullName || "-"}
                      </p>
                      <p className="text-xs tabular-nums text-slate-500">
                        {client.phoneNumber || t("No phone")}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Gender */}
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {t(client.isMale ? "Male" : "Female")}
                </td>

                {/* National ID + passport */}
                <td className="whitespace-nowrap px-4 py-3">
                  <p className="tabular-nums text-slate-800">
                    {client.nationalId || <Muted />}
                  </p>
                  {client.passportNumber && (
                    <p className="text-xs text-slate-500">
                      {t("Passport")} <span dir="ltr">{client.passportNumber}</span>
                    </p>
                  )}
                </td>

                {/* Card + expiry */}
                <td className="whitespace-nowrap px-4 py-3">
                  {client.cardNumber ? (
                    <>
                      <p className="font-mono text-xs font-medium tabular-nums text-slate-800">
                        {client.cardNumber}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t("Expires")} {formatDate(client.expiredAt)}
                      </p>
                    </>
                  ) : (
                    <Muted>{t("No card")}</Muted>
                  )}
                </td>

                {/* Birth date */}
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatDate(client.birthDate)}
                </td>

                {/* Joined + activated */}
                <td className="whitespace-nowrap px-4 py-3">
                  <p className="text-slate-700">{formatDate(client.joinDate)}</p>
                  <p className="text-xs text-slate-500">
                    {client.activatedAt
                      ? `${t("Activated")} ${formatDate(client.activatedAt)}`
                      : t("Not activated")}
                  </p>
                </td>

                {/* Status + block toggle */}
                <td className="whitespace-nowrap px-6 py-3">
                  <div className="flex items-center justify-center gap-1.5">
                    <StatusBadge
                      tone={client.isBlocked ? "danger" : "emerald"}
                      size="sm"
                    >
                      <span
                        className={`me-1.5 h-1.5 w-1.5 rounded-full ${
                          client.isBlocked ? "bg-red-500" : "bg-emerald-500"
                        }`}
                      />
                      {t(client.isBlocked ? "Blocked" : "Active")}
                    </StatusBadge>

                    {onToggleBlock && (
                      <button
                        type="button"
                        onClick={() => onToggleBlock(client)}
                        disabled={togglingClientId === client.clientId}
                        title={t(client.isBlocked ? "Unblock client" : "Block client")}
                        aria-label={
                          t(client.isBlocked ? "Unblock client" : "Block client")
                        }
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                          client.isBlocked
                            ? "hover:bg-emerald-50 hover:text-emerald-600 focus-visible:ring-emerald-300"
                            : "hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-300"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={client.isBlocked ? faCheck : faBan}
                          size="sm"
                        />
                      </button>
                    )}
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
        closeLabel={t("Close image preview")}
      />
    </ScrollableTable>
  );
}
