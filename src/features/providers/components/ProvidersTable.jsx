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
function getInitials(name = "") {
  return name.trim().slice(0, 2).toUpperCase();
}
function ProviderAvatar({ imageUrl, name }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className="
        flex-shrink-0
        h-10
        w-10
        overflow-hidden
        rounded-lg
      "
    >
      {!imageUrl || hasError ? (
        <div className="flex h-full w-full items-center justify-center bg-slate-200 text-sm font-semibold text-slate-600">
          {getInitials(name)}
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </div>
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
export default function ProvidersTable({ providers,onEdit, onToggleStatus,}) {
  const navigate = useNavigate();
  return ( 
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
          <th className="px-4 py-2.5 text-center">Provider </th>
          <th className="px-6 py-2.5 text-center">Category</th>
          <th className="px-6 py-2.5 text-center">Specialist</th>
          <th className="px-6 py-2.5 text-center">Hotline</th>
          <th className="px-6 py-2.5 text-center">Branches</th>
          <th className="px-6 py-2.5 text-center">Status</th>
          <th className="px-6 py-2.5 text-center">Join Date</th>
          <th className="px-6 py-2.5 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {providers.map((provider) => {
          const {
            ar: categoryAr,
            en: categoryEn,
          } = splitBilingualName(provider.categoryName);

          const hasSpecialist = provider.specialistNameEn || provider.specialistNameAr;
          return (
            <tr
              key={provider.id}
              className="border-b border-slate-100 last:border-0 transition-all hover:bg-primary-600/10 hover:text-primary-600"
            >
              {/* Provider */}
              <td className="px-4 py-2  flex justify-center">
                <div onClick={() =>
                 navigate(`/providers/${provider.id}`)
                  }
                  className="w-[70%] cursor-pointer"
                >
                  <div className="relative flex items-center  justify-between gap-3 rounded-[7px] px-2 py-1.5 transition-colors duration-200 hover:bg-white/70">
                    <ProviderAvatar
                      imageUrl={provider.imageUrl}
                      name={provider.enName}
                    />

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900 text-end">
                        {provider.enName}
                      </p>

                      <p className="truncate text-xs text-slate-400 text-end">
                        {provider.arName}
                      </p>
                    </div>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="px-6 py-2">
                <p className="text-center text-slate-900"> {categoryEn} </p>
                <p className="text-center text-xs text-slate-400">{categoryAr} </p>
              </td>

              {/* Specialist */}
              <td className="px-6 py-2">
                {hasSpecialist ? (
                  <>
                    <p className="text-center text-slate-900"> {provider.specialistNameEn ?? "-"}</p>
                    <p className="text-center text-xs text-slate-400"> {provider.specialistNameAr ?? "-"}</p>
                  </>
                ) : (
                  <p className="text-center text-slate-400"> - </p>
                )}
              </td>

              {/* Hotline */}
              <td className="px-6 py-2 text-slate-600">
                {provider.hotLine ?? "-"}
              </td>
              {/* Branches */}
              <td className="px-6 py-2 text-slate-600">
                {provider.branchCount ?? 0}
              </td>
              {/* Status */}
              <td className="px-6 py-2">
                <StatusBadge
                  isActive={provider.isActive}
                />
              </td>
              {/* Join Date */}
              <td className="px-6 py-2 text-slate-600">
                {formatDateNumeric(provider.createdAt)}
              </td>

              {/* Actions */}
              <td
                className="px-6 py-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit?.(provider)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                    title="Edit"
                  >
                    <FontAwesomeIcon icon={faPenToSquare}
                    />
                  </button>

                  {provider.isActive ? (
                    <button
                      onClick={() =>
                        onToggleStatus?.(provider)
                      }
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Deactivate"
                    >
                      <FontAwesomeIcon icon={faBan} />
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        onToggleStatus?.(provider)
                      }
                      className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                      title="Activate"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}