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

const DESKTOP_QUERY = "(min-width: 768px)";

function getInitials(name = "") {
  return name.trim().slice(0, 2).toUpperCase();
}

function ProviderAvatar({ imageUrl, name, size = "h-10 w-10", onPreview }) {
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
      label={name}
      onPreview={onPreview}
      size={size}
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
  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => onEdit?.(provider)}
        className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
        title="Edit"
      >
        <FontAwesomeIcon icon={faPenToSquare} />
      </button>

      {provider.isActive ? (
        <button
          onClick={() => onToggleStatus?.(provider)}
          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
          title="Deactivate"
        >
          <FontAwesomeIcon icon={faBan} />
        </button>
      ) : (
        <button
          onClick={() => onToggleStatus?.(provider)}
          className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
          title="Activate"
        >
          <FontAwesomeIcon icon={faCheck} />
        </button>
      )}
    </div>
  );
}

export default function ProvidersTable({ providers, onEdit, onToggleStatus }) {
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  return (
    <>
      {/* ---------- Mobile: stacked cards (below md) ---------- */}
      {!isDesktop && (
        <div className="divide-y divide-slate-100">
          {providers.map((provider) => {
            const { en: categoryEn } = splitBilingualName(provider.categoryName);
            const hasSpecialist =
              provider.specialistNameEn || provider.specialistNameAr;

            return (
              <div key={provider.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <ProviderAvatar
                      imageUrl={provider.imageUrl}
                      name={provider.enName}
                      size="h-11 w-11"
                      onPreview={(url, label) => setPreviewImage({ url, label })}
                    />
                    <div
                      onClick={() => navigate(`/providers/${provider.id}`)}
                      className="min-w-0 cursor-pointer"
                    >
                      <p className="truncate font-semibold text-slate-900">{provider.enName}</p>
                      <p className="truncate text-xs text-slate-400">{provider.arName}</p>
                    </div>
                  </div>

                  <StatusBadge isActive={provider.isActive} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div>
                    <p className="text-slate-400">Category</p>
                    <p className="text-slate-700">{categoryEn || "-"}</p>
                  </div>

                  <div>
                    <p className="text-slate-400">Specialist</p>
                    <p className="text-slate-700">
                      {hasSpecialist ? provider.specialistNameEn ?? "-" : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Hotline</p>
                    <p className="text-slate-700">{provider.hotLine ?? "-"}</p>
                  </div>

                  <div>
                    <p className="text-slate-400">Branches</p>
                    <p className="text-slate-700">{provider.branchCount ?? 0}</p>
                  </div>

                  <div>
                    <p className="text-slate-400">Join Date</p>
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
        <table className="w-full min-w-[1100px] table-fixed text-center text-sm">
        <thead className="sticky top-0 z-10 bg-slate-100">
            <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
              <th className="w-[260px] px-4 py-2.5 text-center">Provider</th>
              <th className="w-[180px] px-6 py-2.5 text-center">Category</th>
              <th className="hidden w-[190px] px-6 py-2.5 text-center lg:table-cell">Specialist</th>
              <th className="w-[150px] px-6 py-2.5 text-center">Hotline</th>
              <th className="hidden w-[110px] px-6 py-2.5 text-center lg:table-cell">Branches</th>
              <th className="w-[130px] px-6 py-2.5 text-center">Status</th>
              <th className="hidden w-[140px] px-6 py-2.5 text-center xl:table-cell">Join Date</th>
              <th className="w-[120px] px-6 py-2.5 text-center">Actions</th>
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
                  <td className="px-4 py-2">
                    <div className="mx-auto w-full max-w-[220px]">
                      <div
                        onClick={() => navigate(`/providers/${provider.id}`)}
                        className="relative flex cursor-pointer items-center justify-between gap-3 rounded-[7px] px-2 py-1.5 transition-colors duration-200 hover:bg-white/70"
                      >
                        <ProviderAvatar
                          imageUrl={provider.imageUrl}
                          name={provider.enName}
                          onPreview={(url, label) => setPreviewImage({ url, label })}
                        />
                        <div
                          onClick={() => navigate(`/providers/${provider.id}`)}
                          className="min-w-0 cursor-pointer"
                        >
                          <p className="truncate font-semibold text-slate-900 text-end">{provider.enName}</p>
                          <p className="truncate text-xs text-slate-400 text-end">{provider.arName}</p>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-2">
                    <p className="truncate text-center text-slate-900">{categoryEn}</p>
                    <p className="truncate text-center text-xs text-slate-400">{categoryAr}</p>
                  </td>

                  <td className="hidden px-6 py-2 lg:table-cell">
                    {hasSpecialist ? (
                      <>
                        <p className="truncate text-center text-slate-900">{provider.specialistNameEn ?? "-"}</p>
                        <p className="truncate text-center text-xs text-slate-400">{provider.specialistNameAr ?? "-"}</p>
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
                    <StatusBadge isActive={provider.isActive} />
                  </td>

                  <td className="hidden px-6 py-2 text-center text-slate-600 xl:table-cell">
                    {formatDateNumeric(provider.createdAt)}
                  </td>

                  <td className="px-6 py-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
                      <RowActions provider={provider} onEdit={onEdit} onToggleStatus={onToggleStatus} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <ImageLightbox
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
}
