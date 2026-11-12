import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../features/auth/context/Authcontext";
import QueryErrorState from "./QueryErrorState";
import AccessDeniedPage from "./AccessDeniedPage";
import { getVisibleNavigation } from "../../sidebar/navigation";
import { PERMISSION_CODES } from "../../features/auth/constants/permissionCodes";

const isAuthDebugEnabled = () =>
  import.meta.env.DEV && window.localStorage.getItem("debugAuth") === "1";

const authDebug = (event, details = {}) => {
  if (isAuthDebugEnabled()) {
    console.info(`[protected-route] ${event}`, details);
  }
};

export default function ProtectedRoute() {
  const { t } = useTranslation("common");
  const {
    token,
    isAuthenticated,
    isAuthInitializing,
    isPermissionsInitializing,
    permissionsInitializationError,
    refreshPermissions,
    mustChangePassword,
    hasPermission,
    logout,
  } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const hasValidSession = isAuthenticated && Boolean(token);

  authDebug("render", {
    path: location.pathname,
    hasToken: Boolean(token),
    isAuthenticated,
    isAuthInitializing,
  });

  useEffect(() => {
    if (isAuthInitializing) return;

    if (!hasValidSession) {
      authDebug("invalid auth state; invoking logout", {
        path: location.pathname,
        hasToken: Boolean(token),
        isAuthenticated,
        isAuthInitializing,
      });
      queryClient.cancelQueries();
      queryClient.clear();

      if (token) {
        logout();
      }
    }
  }, [
    hasValidSession,
    isAuthInitializing,
    isAuthenticated,
    location.pathname,
    logout,
    queryClient,
    token,
  ]);

  if (
    isAuthInitializing ||
    (isAuthenticated && isPermissionsInitializing)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div
          className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600"
          role="status"
          aria-label={t("Loading your session")}
        />
      </div>
    );
  }

  if (!hasValidSession) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (permissionsInitializationError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <QueryErrorState
            title={t("Unable to load your permissions")}
            error={permissionsInitializationError}
            onRetry={() => refreshPermissions().catch(() => {})}
          />
        </div>
      </div>
    );
  }

  if (mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  // These two standalone pages have permission guards but no sidebar entry.
  const hasPageAccess = getVisibleNavigation(hasPermission).length > 0
    || hasPermission(PERMISSION_CODES.PROVIDERS_CREATE)
    || hasPermission(PERMISSION_CODES.CARDS_READ);

  if (!hasPageAccess) {
    return <AccessDeniedPage noPageAccess />;
  }

  return <Outlet />;
}
