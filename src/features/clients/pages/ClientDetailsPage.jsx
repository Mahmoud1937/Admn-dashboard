import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faLocationDot,
  faStar,
  faClockRotateLeft,
  faIdCard,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import useClientDetailsQuery from "../hooks/useClientDetailsQuery";
import OrderHistorySection from "../components/OrderHistorySection";
import FamilyMembersSection from "../components/FamilyMembersSection";
import ClientAvatar from "../../../shared/components/ClientAvatar";
import StatusBadge from "../../../shared/components/StatusBadge";
import { formatDate } from "../../../utils/formatDate";
import { SkeletonText } from "../../../shared/components/Skeleton";
import LocalizedPage from "../../../localization/LocalizedPage";
import useLanguage from "../../../localization/useLanguage";
import useClientsText from "../../../localization/useClientsText";

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

const AddressCard = ({ address, rtl, t }) => (
  <div className="rounded-xl border border-slate-200 p-4">
    <div className="mb-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600"
        >
          <FontAwesomeIcon icon={faLocationDot} />
        </span>
        <span className="text-sm font-semibold text-slate-700">
          {address.mainAddress}
        </span>
      </div>

      {address.isDefult && (
        <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
          <FontAwesomeIcon icon={faStar} className="text-[10px]" />
          {t("Default")}
        </span>
      )}
    </div>

    <p className="text-sm text-slate-600">
      {rtl ? `${address.governorateNameAr} - ${address.cityNameAr}` : `${address.governorateNameEn} - ${address.cityNameEn}`}
    </p>

    <p className="text-xs text-slate-400">
      {rtl ? `${address.governorateNameEn} - ${address.cityNameEn}` : `${address.governorateNameAr} - ${address.cityNameAr}`}
    </p>

    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500">
      <span className="rounded-lg bg-slate-50 px-2 py-1">
        {t("Floor")}: {address.floor ?? "-"}
      </span>
      <span className="rounded-lg bg-slate-50 px-2 py-1">
        {t("Building")}: {address.buildingNumber ?? "-"}
      </span>
      <span className="rounded-lg bg-slate-50 px-2 py-1">
        {t("Apartment")}: {address.apartmentNumber ?? "-"}
      </span>
    </div>
  </div>
);


/* ============================================================
   Client Details Page
============================================================ */

const TAB_DETAILS = "details";
const TAB_ORDERS = "orders";
const TAB_FAMILY = "family";

const TABS = [
  { key: TAB_DETAILS, label: "Client Details", icon: faIdCard },
  { key: TAB_ORDERS, label: "Order History", icon: faClockRotateLeft },
  { key: TAB_FAMILY, label: "Family Members", icon: faUsers },
];

const ClientDetailsPage = () => {
  const t = useClientsText();
  const { language, direction } = useLanguage();
  const rtl = direction === "rtl";
  const { clientId } = useParams();
  const navigate = useNavigate();

  const { client, isLoading, isError, error } = useClientDetailsQuery(clientId, language);

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = TABS.some((tab) => tab.key === requestedTab) ? requestedTab : TAB_DETAILS;

  const setActiveTab = (tab) => setSearchParams((params) => {
    const next = new URLSearchParams(params);
    next.set("tab", tab);
    return next;
  });

  if (isLoading) {
    return (
      <LocalizedPage><SkeletonText label={t("Loading client...")} lines={6} /></LocalizedPage>
    );
  }

  if (isError || !client) {
    return (
      <LocalizedPage className="p-6 text-center text-red-600">
        {t("Failed to load client")}
        {error?.response?.data?.message ? `: ${error.response.data.message}` : "."}
      </LocalizedPage>
    );
  }

  const fullName = `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim();

  const hasImage =
    client.clientImage && !client.clientImage.endsWith("medicardeg.com/");

  return (
    <LocalizedPage className="p-4 md:p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <FontAwesomeIcon icon={rtl ? faArrowRight : faArrowLeft} />
        {t("Back to clients")}
      </button>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-slate-200">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-900 text-white"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-xs" />
              {t(tab.label)}
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
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <ClientAvatar
                    name={fullName}
                    colorSeed={client.clientId}
                    sizeClass="h-16 w-16"
                    textClass="text-xl"
                  />
                )}

                <div>
                  <h1 className="text-xl font-semibold text-slate-800">
                    {fullName || "-"}
                  </h1>

                  <p className="text-sm text-slate-400">#{client.clientId}</p>
                </div>

                <div className="ms-auto">
                  <StatusBadge tone={client.isBlocked ? "danger" : "success"}>
                    {t(client.isBlocked ? "Blocked" : "Active")}
                  </StatusBadge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                <InfoField label={t("Phone")} value={client.phoneNumber} />
                <InfoField label={t("National ID")} value={client.nationalId} />
                <InfoField label={t("Passport No.")} value={client.passportNumber} />
                <InfoField
                  label={t("Card Number")}
                  value={client.cardNumber || t("No Card")}
                />
                <InfoField label={t("Card Expires")} value={formatDate(client.expiredAt)} />
                <InfoField label={t("Birth Date")} value={formatDate(client.birthDate)} />
                <InfoField label={t("Join Date")} value={formatDate(client.joinDate)} />
                <InfoField
                  label={t("Activated At")}
                  value={client.activatedAt ? formatDate(client.activatedAt) : "-"}
                />
                <InfoField label={t("Last Use")} value={formatDateTime(client.lastUseDate)} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FontAwesomeIcon icon={faLocationDot} className="text-slate-400" />
                {t("Addresses ({{count}})", { count: client.addresses?.length ?? 0 })}
              </h2>

              {!client.addresses?.length ? (
                <p className="text-sm text-slate-400">{t("No saved addresses.")}</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {client.addresses.map((address) => (
                    <AddressCard key={address.id} address={address} rtl={rtl} t={t} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === TAB_ORDERS ? (
          <OrderHistorySection userId={client.clientId} />
        ) : (
          <FamilyMembersSection clientId={client.clientId} />
        )}
      </div>
    </LocalizedPage>
  );
};

export default ClientDetailsPage;
