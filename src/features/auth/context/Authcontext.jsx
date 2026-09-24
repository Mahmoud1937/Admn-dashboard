/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";
import {
  TOKEN_KEY,
  getToken,
  setToken as persistToken,
  clearToken as removeToken,
  setRefreshToken as persistRefreshToken,
  clearRefreshToken as removeRefreshToken,
} from "../../../shared/api/axiosInstance";
import { getUserFromToken, isTokenExpired } from "../../../shared/utils/jwt";

const AuthContext = createContext(null);

const isAdminUser = (user) =>
  Boolean(user?.employeeId || user?.employeeName || user?.accountType);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => {
    const stored = getToken();
    const user = stored ? getUserFromToken(stored) : null;

    if (!stored || isTokenExpired(stored) || !isAdminUser(user)) {
      removeToken();
      removeRefreshToken();
      return null;
    }

    return stored;
  });

  const login = (newToken, refreshToken, rememberMe) => {
    removeToken();
    removeRefreshToken();
    persistToken(newToken, rememberMe);
    if (refreshToken) persistRefreshToken(refreshToken, rememberMe);
    setTokenState(newToken);
  };

  const logout = () => {
    removeToken();
    removeRefreshToken();
    setTokenState(null);
  };

  const value = useMemo(() => {
    const user = token ? getUserFromToken(token) : null;
    return {
      token,
      user,
      isAuthenticated: isAdminUser(user),
      login,
      logout,
    };
  }, [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

// Re-exported so other modules can react to storage-key changes if needed.
export { TOKEN_KEY };
