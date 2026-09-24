import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../features/auth/context/Authcontext";
import { isTokenExpired } from "../utils/jwt";


export default function ProtectedRoute() {
  const { token, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const hasValidToken = isAuthenticated && !isTokenExpired(token);

  useEffect(() => {
    if (!hasValidToken) {
      queryClient.cancelQueries();
      queryClient.clear();

      if (token) {
        logout();
      }
    }
  }, [hasValidToken, logout, queryClient, token]);

  if (!hasValidToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
