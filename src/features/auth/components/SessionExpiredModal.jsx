// src/features/auth/components/SessionExpiredModal.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import { useTranslation } from "react-i18next";

export function SessionExpiredModal() {
  const { t } = useTranslation("common");
  const { sessionExpiredReason, clearSessionExpiredReason } = useAuth();
  const navigate = useNavigate();

  if (!sessionExpiredReason) return null;

  const handleClose = () => {
    clearSessionExpiredReason();
    navigate("/login", { replace: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
        <h2 className="text-lg font-semibold mb-2">{t("Session expired")}</h2>
        <p className="text-gray-600 mb-4">{t("Please sign in again to continue.")}</p>
        <button
          onClick={handleClose}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {t("Sign in")}
        </button>
      </div>
    </div>
  );
}
