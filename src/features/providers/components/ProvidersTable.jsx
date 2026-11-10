import TableActionsCell from "../../../shared/components/TableActionsCell";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faBan,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import StatusBadge from "./StatusBadge";
import { splitBilingualName } from "../../../shared/utils/splitBilingualName";
import LazyImageCell from "../../../shared/components/LazyImageCell";
import ImageLightbox from "../../../shared/components/ImageLightbox";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { getProviderMedicardCashback } from "../utils/providerFormHelpers";
import { useTranslation } from "react-i18next";

const DESKTOP_QUERY = "(min-width: 768px)";

function getInitials(name = "") {
  return name.trim().slice(0, 2).toUpperCase();
}

function BilingualName({ english, arabic, rtl, align = "center", strong = false, fallback = "", primaryClassName = "text-slate-900" }) {
  const primary = rtl ? (arabic || english) : (english || arabic);
  const primaryIsArabic = rtl ? Boolean(arabic) : !english && Boolean(arabic);
  const secondary = english && arabic ? (rtl ? english : arabic) : null;
  const textAlign = align === "start" ? (rtl ? "text-right" : "text-left") : "text-center";

  return (
    <div className="min-w-0">
      <p dir={primaryIsArabic ? "rtl" : "ltr"} className={`truncate ${textAlign} ${strong ? "font-semibold" : ""} ${primaryClassName}`}>
        {primary || fallback}
      </p>
      {secondary && (
        <p dir={rtl ? "ltr" : "rtl"} className={`truncate ${textAlign} text-xs text-slate-400`}>
          {secondary}
        </p>
      )}
    </div>
  );
}

function ProviderAvatar({ imageUrl, name, size = "h-10 w-10", onPreview }) {
  const { t } = useTranslation("providers");
  const imageAlt = typeof name === "string" && name.trim()
    ? name.trim()
    : t("providerImage");

  if (!imageUrl) {
    return (
      <div className={`flex-shrink-0 ${size} overflow-hidden rounded-lg`}>
        <div className="flex h-full w-full items-center justify-center bg-slate-200 text-sm font-semibold text-slate-600">
          {getInitials(name)}
        </div>
      </div>
    );
  }

  return (
    <LazyImageCell
      url={imageUrl}
      label={imageAlt}
      onPreview={onPreview}
      size={size}
      noImageLabel={t("noImage")}
      previewLabel={t("previewImage")}
    />
  );
}

function formatDateNumeric(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function RowActions({ provider, onEdit, onToggleStatus }) {
  const { t } = useTranslation("providers");
  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {onEdit && (
        <button
          onClick={() => onEdit(provider)}
          className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
          title={t("edit")}
          aria-label={t("edit")}
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>
      )}

      {onToggleStatus && (provider.isActive ? (
        <button
          onClick={() => onToggleStatus(provider)}
          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
          title={t("deactivate")}
          aria-label={t("deactivate")}
        >
          <FontAwesomeIcon icon={faBan} />
        </button>
      ) : (
        <button
          onClick={() => onToggleStatus(provider)}
          className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
          title={t("activate")}
          aria-label={t("activate")}
        >
          <FontAwesomeIcon icon={faCheck} />
        </button>
      ))}
    </div>
  );
}

export default function ProvidersTable({ providers, onEdit, onToggleStatus }) {
  const { t, i18n } = useTranslation("providers");
  const rtl = i18n.dir() === "rtl";
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  return (
    <>
      {/* ---------- Mobile: stacked cards (below md) ---------- */}
      {!isDesktop && (
        <div className="divide-y divide-slate-100">
          {providers.map((provider) => {
            const { ar: categoryAr, en: categoryEn } = splitBilingualName(provider.categoryName);
            const hasSpecialist =
              provider.specialistNameEn || provider.specialistNameAr;

            return (
              <div key={provider.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <ProviderAvatar
                      imageUrl={provider.imageUrl}
                      name={rtl ? (provider.arName || provider.enName) : (provider.enName || provider.arName)}
                      size="h-11 w-11"
                      onPreview={(url, label) => setPreviewImage({ url, label })}
                    />
                    <div
                      onClick={() => navigate(`/providers/${provider.id}`)}
                      className="min-w-0 cursor-pointer"
                    >
                      <BilingualName english={provider.enName} arabic={provider.arName} rtl={rtl} align="start" strong />
                    </div>
                  </div>

                  <StatusBadge isActive={provider.isActive} activeLabel={t("active")} inactiveLabel={t("inactive")} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div>
                    <p className="text-slate-400">{t("id")}</p>
                    <p className="tabular-nums text-slate-700">{provider.id ?? "-"}</p>
                  </div>

                  <div>
                    <p className="text-slate-400">{t("category")}</p>
                    <BilingualName english={categoryEn} arabic={categoryAr} rtl={rtl} align="start" fallback="-" primaryClassName="text-slate-700" />
                  </div>

                  <div>
                    <p className="text-slate-400">{t("specialist")}</p>
                    {hasSpecialist ? (
                      <BilingualName english={provider.specialistNameEn} arabic={provider.specialistNameAr} rtl={rtl} align="start" primaryClassName="text-slate-700" />
                    ) : <p className="text-slate-700">-</p>}
                  </div>

                  <div>
                    <p className="text-slate-400">{t("hotline")}</p>
                    <p className="text-slate-700">{provider.hotLine ?? "-"}</p>
                  </div>

                  <div>
                    <p className="text-slate-400">{t("branches")}</p>
                    <p className="text-slate-700">{provider.branchCount ?? 0}</p>
                  </div>

                  <div>
                    <p className="text-slate-400">{t("class")}</p>
                    <p className="text-slate-700">{provider.class ?? "-"}</p>
                  </div>

                  <div>
                    <p className="text-slate-400">{t("cashback")}</p>
                    <p className="text-slate-700">{getProviderMedicardCashback(provider)}</p>
                  </div>

                  <div>
                    <p className="text-slate-400">{t("joinDate")}</p>
                    <p className="text-slate-700">{formatDateNumeric(provider.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end border-t border-slate-50 pt-2">
                  <RowActions provider={provider} onEdit={onEdit} onToggleStatus={onToggleStatus} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------- Desktop/tablet: table (md and up) ---------- */}
      {isDesktop && (
        <table className="w-full min-w-[1480px] table-fixed text-center text-sm">
        <thead className="sticky top-0 z-10 bg-slate-100">
            <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-700">
              <th scope="col" className="w-[80px] px-4 py-2.5 text-center">{t("id")}</th>
              <th className="w-[260px] px-4 py-2.5 text-center">{t("provider")}</th>
              <th className="w-[180px] px-6 py-2.5 text-center">{t("category")}</th>
              <th className="w-[110px] px-4 py-2.5 text-center">{t("class")}</th>
              <th className="w-[160px] px-4 py-2.5 text-center">{t("cashback")}</th>
              <th className="hidden w-[190px] px-6 py-2.5 text-center lg:table-cell">{t("specialist")}</th>
              <th className="w-[150px] px-6 py-2.5 text-center">{t("hotline")}</th>
              <th className="hidden w-[110px] px-6 py-2.5 text-center lg:table-cell">{t("branches")}</th>
              <th className="w-[130px] px-6 py-2.5 text-center">{t("status")}</th>
              <th className="hidden w-[140px] px-6 py-2.5 text-center xl:table-cell">{t("joinDate")}</th>
              <TableActionsCell as="th" side={rtl ? "left" : "right"} style={rtl ? { boxShadow: "8px 0 8px -8px rgb(15 23 42 / 12%)" } : undefined} className="w-[120px] px-6 py-2.5 text-center">{t("actions")}</TableActionsCell>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => {
              const { ar: categoryAr, en: categoryEn } = splitBilingualName(provider.categoryName);
              const hasSpecialist =
                provider.specialistNameEn || provider.specialistNameAr;

              return (
                <tr
                  key={provider.id}
                  className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/60"
                >
                  <td className="px-4 py-2 text-center tabular-nums text-slate-600">{provider.id ?? "-"}</td>
                  <td className="px-4 py-2">
                    <div className="mx-auto w-full max-w-[220px]">
                      <div
                        onClick={() => navigate(`/providers/${provider.id}`)}
                        className="group relative flex cursor-pointer items-center gap-3 rounded-[7px] px-2 py-1.5 transition-colors duration-200 hover:bg-slate-100"
                      >
                        <ProviderAvatar
                          imageUrl={provider.imageUrl}
                          name={rtl ? (provider.arName || provider.enName) : (provider.enName || provider.arName)}
                          onPreview={(url, label) => setPreviewImage({ url, label })}
                        />
                        <div
                          onClick={() => navigate(`/providers/${provider.id}`)}
                          className="min-w-0 flex-1 cursor-pointer"
                        >
                          <BilingualName english={provider.enName} arabic={provider.arName} rtl={rtl} align="start" strong />
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-2">
                    <BilingualName english={categoryEn} arabic={categoryAr} rtl={rtl} />
                  </td>

                  <td className="px-4 py-2 text-center text-slate-600">
                    {provider.class ?? "-"}
                  </td>

                  <td className="px-4 py-2 text-center text-slate-600">
                    {getProviderMedicardCashback(provider)}
                  </td>

                  <td className="hidden px-6 py-2 lg:table-cell">
                    {hasSpecialist ? (
                      <>
                        <BilingualName english={provider.specialistNameEn} arabic={provider.specialistNameAr} rtl={rtl} />
                      </>
                    ) : (
                      <p className="text-center text-slate-400">-</p>
                    )}
                  </td>

                  <td className="truncate px-6 py-2 text-center text-slate-600">{provider.hotLine ?? "-"}</td>

                  <td className="hidden px-6 py-2 text-center text-slate-600 lg:table-cell">
                    {provider.branchCount ?? 0}
                  </td>

                  <td className="px-6 py-2 text-center">
                    <StatusBadge isActive={provider.isActive} activeLabel={t("active")} inactiveLabel={t("inactive")} />
                  </td>

                  <td className="hidden px-6 py-2 text-center text-slate-600 xl:table-cell">
                    {formatDateNumeric(provider.createdAt)}
                  </td>

                  <TableActionsCell side={rtl ? "left" : "right"} style={rtl ? { boxShadow: "8px 0 8px -8px rgb(15 23 42 / 12%)" } : undefined} className="px-6 py-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
                      <RowActions provider={provider} onEdit={onEdit} onToggleStatus={onToggleStatus} />
                    </div>
                  </TableActionsCell>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <ImageLightbox
        image={previewImage}
        onClose={() => setPreviewImage(null)}
        closeLabel={t("closeImage")}
      />
    </>
  );
}
