import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../features/auth/context/Authcontext";
import { isTokenExpired } from "../utils/jwt";

const isAuthDebugEnabled = () =>
  import.meta.env.DEV && window.localStorage.getItem("debugAuth") === "1";

const authDebug = (event, details = {}) => {
  if (isAuthDebugEnabled()) {
    console.info(`[protected-route] ${event}`, details);
  }
};

export default function ProtectedRoute() {
  const { token, isAuthenticated, isAuthInitializing, logout } = useAuth();
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
  }, [hasValidToken, isAuthInitializing, logout, queryClient, token]);

  if (isAuthInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Checking authentication...
      </div>
    );
  }

  if (!hasValidToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
