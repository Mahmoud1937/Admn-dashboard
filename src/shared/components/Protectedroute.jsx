import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../features/auth/context/Authcontext";
import { isTokenExpired } from "../utils/jwt";
import QueryErrorState from "./QueryErrorState";

const isAuthDebugEnabled = () =>
  import.meta.env.DEV && window.localStorage.getItem("debugAuth") === "1";

const authDebug = (event, details = {}) => {
  if (isAuthDebugEnabled()) {
    console.info(`[protected-route] ${event}`, details);
  }
};

export default function ProtectedRoute() {
  const {
    token,
    isAuthenticated,
    isAuthInitializing,
    isPermissionsInitializing,
    permissionsInitializationError,
    refreshPermissions,
    mustChangePassword,
    logout,
  } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const hasValidToken = isAuthenticated && !isTokenExpired(token);

  authDebug("render", {
    path: location.pathname,
    hasToken: Boolean(token),
    isAuthenticated,
    isAuthInitializing,
    tokenExpired: token ? isTokenExpired(token) : null,
  });

  useEffect(() => {
    if (isAuthInitializing) return;

    if (!hasValidToken) {
      authDebug("invalid auth state; invoking logout", {
        path: location.pathname,
        hasToken: Boolean(token),
        isAuthenticated,
        isAuthInitializing,
        tokenExpired: token ? isTokenExpired(token) : null,
      });
      queryClient.cancelQueries();
      queryClient.clear();

      if (token) {
        logout();
      }
    }
  }, [
    hasValidToken,
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
          aria-label="Loading your session"
        />
      </div>
    );
  }

  if (!hasValidToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (permissionsInitializationError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <QueryErrorState
            title="Unable to load your permissions"
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

  return <Outlet />;
}
