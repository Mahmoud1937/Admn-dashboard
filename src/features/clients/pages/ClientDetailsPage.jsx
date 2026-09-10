import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faLocationDot,
  faStar,
  faClockRotateLeft,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import useClientDetailsQuery from "../hooks/useClientDetailsQuery";
import OrderHistorySection from "../components/OrderHistorySection";
import StatusBadge from "../../../shared/components/StatusBadge";
import { formatDate } from "../../../utils/formatDate";

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("en-GB") : "-";

const InfoField = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm text-slate-700">{value || "-"}</p>
  </div>
);

const AddressCard = ({ address }) => (
  <div className="rounded-xl border border-slate-200 p-4">
    <div className="mb-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faLocationDot} className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-700">
          {address.mainAddress}
        </span>
      </div>

      {address.isDefult && (
        <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
          <FontAwesomeIcon icon={faStar} className="text-[10px]" />
          Default
        </span>
      )}
    </div>

    <p className="text-sm text-slate-600">
      {address.governorateNameEn} - {address.cityNameEn}
    </p>

    <p className="text-xs text-slate-400">
      {address.governorateNameAr} - {address.cityNameAr}
    </p>

    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500">
      <span>Floor: {address.floor ?? "-"}</span>
      <span>Building: {address.buildingNumber ?? "-"}</span>
      <span>Apartment: {address.apartmentNumber ?? "-"}</span>
    </div>
  </div>
);


/* ============================================================
   Client Details Page
============================================================ */

const TAB_DETAILS = "details";
const TAB_ORDERS = "orders";

const TABS = [
  { key: TAB_DETAILS, label: "Client Details", icon: faIdCard },
  { key: TAB_ORDERS, label: "Order History", icon: faClockRotateLeft },
];

const ClientDetailsPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const { client, isLoading, isError, error } = useClientDetailsQuery(clientId);

  const [activeTab, setActiveTab] = useState(TAB_DETAILS);

  if (isLoading) {
    return (
      <div className="p-6 text-center text-sm text-slate-400">
        Loading client...
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load client
        {error?.message ? `: ${error.message}` : "."}
      </div>
    );
  }

  const fullName = `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim();

  const hasImage =
    client.clientImage && !client.clientImage.endsWith("medicardeg.com/");

  return (
    <div className="p-4 md:p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Back to clients
      </button>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-slate-200">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-900 text-white"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-xs" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content — full available width */}
      <div className="w-full">
        {activeTab === TAB_DETAILS ? (
          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-6">
                {hasImage ? (
                  <img
                    src={client.clientImage}
                    alt={fullName}
                    loading="lazy"
                    decoding="async"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-xl font-medium text-slate-500">
                    {fullName.charAt(0).toUpperCase() || "?"}
                  </div>
                )}

                <div>
                  <h1 className="text-xl font-semibold text-slate-800">
                    {fullName || "-"}
                  </h1>

                  <p className="text-sm text-slate-400">#{client.clientId}</p>
                </div>

                <div className="ml-auto">
                  <StatusBadge tone={client.isBlocked ? "danger" : "success"}>
                    {client.isBlocked ? "Blocked" : "Active"}
                  </StatusBadge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                <InfoField label="Phone" value={client.phoneNumber} />
                <InfoField label="National ID" value={client.nationalId} />
                <InfoField label="Passport No." value={client.passportNumber} />
                <InfoField
                  label="Card Number"
                  value={client.cardNumber || "No Card"}
                />
                <InfoField label="Card Expires" value={formatDate(client.expiredAt)} />
                <InfoField label="Birth Date" value={formatDate(client.birthDate)} />
                <InfoField label="Join Date" value={formatDate(client.joinDate)} />
                <InfoField
                  label="Activated At"
                  value={client.activatedAt ? formatDate(client.activatedAt) : "-"}
                />
                <InfoField label="Last Use" value={formatDateTime(client.lastUseDate)} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FontAwesomeIcon icon={faLocationDot} className="text-slate-400" />
                Addresses ({client.addresses?.length ?? 0})
              </h2>

              {!client.addresses?.length ? (
                <p className="text-sm text-slate-400">No saved addresses.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {client.addresses.map((address) => (
                    <AddressCard key={address.id} address={address} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <OrderHistorySection userId={client.clientId} />
        )}
      </div>
    </div>
  );
};

export default ClientDetailsPage;
