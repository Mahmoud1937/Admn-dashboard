/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  TOKEN_KEY,
  getToken,
  setToken as persistToken,
  clearToken as removeToken,
  setRefreshToken as persistRefreshToken,
  clearRefreshToken as removeRefreshToken,
  refreshAccessToken,
  registerSessionExpiredHandler,
} from "../../../shared/api/axiosInstance";
import { getUserFromToken, isTokenExpired } from "../../../shared/utils/jwt";

const AuthContext = createContext(null);

const isAdminUser = (user) =>
  Boolean(user?.employeeId || user?.employeeName || user?.accountType);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);
  const [sessionExpiredReason, setSessionExpiredReason] = useState(null);

  const login = useCallback((newToken, refreshToken) => {
    removeToken();
    removeRefreshToken();
    persistToken(newToken);
    if (refreshToken) persistRefreshToken(refreshToken);
    setTokenState(newToken);
    setSessionExpiredReason(null);
    setIsAuthInitializing(false);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    removeRefreshToken();
    setTokenState(null);
  }, []);

  const clearSessionExpiredReason = useCallback(
    () => setSessionExpiredReason(null),
    []
  );

  // axiosInstance calls this exactly once, synchronously, whenever it
  // decides the session is over (refresh failed, or an endpoint keeps
  // rejecting a current, valid token).
  useEffect(() => {
    registerSessionExpiredHandler((reason) => {
      setSessionExpiredReason(reason);
      setTokenState(null);
    });
  }, []);

  // One-time startup check: is the stored token still good, or can it be
  // refreshed via the stored refresh token? No proactive setTimeout
  // scheduling — expiry after this point is handled reactively by the
  // response interceptor on the next real request.
  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      const storedToken = getToken();
      const user = storedToken ? getUserFromToken(storedToken) : null;

      if (!storedToken || !isAdminUser(user)) {
        removeToken();
        removeRefreshToken();
        if (!cancelled) setIsAuthInitializing(false);
        return;
      }

      if (!isTokenExpired(storedToken)) {
        if (!cancelled) {
          setTokenState(storedToken);
          setIsAuthInitializing(false);
        }
        return;
      }

      try {
        const refreshedToken = await refreshAccessToken();
        if (!cancelled) setTokenState(refreshedToken);
      } catch {
        removeToken();
        removeRefreshToken();
      } finally {
        if (!cancelled) setIsAuthInitializing(false);
      }
    };

    initializeAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const user = token ? getUserFromToken(token) : null;
    return {
      token,
      user,
      isAuthenticated: isAdminUser(user),
      isAuthInitializing,
      sessionExpiredReason,
      clearSessionExpiredReason,
      login,
      logout,
    };
  }, [token, isAuthInitializing, sessionExpiredReason, clearSessionExpiredReason, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

// Re-exported so other modules can react to storage-key changes if needed.
export { TOKEN_KEY };