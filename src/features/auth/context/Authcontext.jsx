/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  TOKEN_KEY,
  getToken,
  setToken as persistToken,
  clearToken as removeToken,
  setRefreshToken as persistRefreshToken,
  clearRefreshToken as removeRefreshToken,
  refreshAccessToken,
  invalidateAuthSession,
  registerSessionExpiredHandler,
  registerTokenRefreshedHandler,
  getMustChangePassword,
  setMustChangePassword as persistMustChangePassword,
} from "../../../shared/api/axiosInstance";
import { getUserFromToken, isTokenExpired } from "../../../shared/utils/jwt";
import { clearDashboardFilters } from "../../../shared/utils/dashboardFilterSession";
import { getEmployeeById } from "../../employees/services/employeesService";
import { getPermissions } from "../../employees/permissions/services/permissionsService";
import {
  clearPersistedPermissions,
  normalizePermissions,
  resolvePermissionCodes,
} from "../utils/permissionSession";

const AuthContext = createContext(null);

const isAdminUser = (user) =>
  Boolean(user?.employeeId || user?.employeeName || user?.accountType);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const permissionLoadRunRef = useRef(0);
  const [token, setTokenState] = useState(null);
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);
  const [isPermissionsInitializing, setIsPermissionsInitializing] =
    useState(true);
  const [permissionsInitializationError, setPermissionsInitializationError] =
    useState(null);
  const [sessionExpiredReason, setSessionExpiredReason] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [mustChangePassword, setMustChangePasswordState] = useState(
    getMustChangePassword
  );

  const updatePermissions = useCallback((permissionCodes) => {
    const normalizedPermissions = normalizePermissions(permissionCodes);
    setPermissions(normalizedPermissions);
    return normalizedPermissions;
  }, []);

  const loadPermissionsForEmployee = useCallback(
    async (employeeId) => {
      if (employeeId == null || employeeId === "") {
        throw new Error("The authenticated employee ID is unavailable.");
      }

      const runId = ++permissionLoadRunRef.current;
      setPermissions([]);
      setPermissionsInitializationError(null);
      setIsPermissionsInitializing(true);

      try {
        const [employee, permissionCatalog] = await Promise.all([
          queryClient.fetchQuery({
            queryKey: ["employee-details", String(employeeId)],
            queryFn: () => getEmployeeById(employeeId),
            staleTime: 0,
          }),
          queryClient.fetchQuery({
            queryKey: ["permissions"],
            queryFn: getPermissions,
            staleTime: 30 * 60 * 1000,
          }),
        ]);

        const resolvedPermissions = resolvePermissionCodes(
          employee?.permissionIds,
          permissionCatalog
        );

        if (runId === permissionLoadRunRef.current) {
          updatePermissions(resolvedPermissions);
        }

        return resolvedPermissions;
      } catch (error) {
        if (runId === permissionLoadRunRef.current) {
          setPermissions([]);
          setPermissionsInitializationError(error);
        }
        throw error;
      } finally {
        if (runId === permissionLoadRunRef.current) {
          setIsPermissionsInitializing(false);
        }
      }
    },
    [queryClient, updatePermissions]
  );

  const refreshPermissions = useCallback(() => {
    const storedToken = getToken();
    const authenticatedUser = storedToken
      ? getUserFromToken(storedToken)
      : null;

    if (!storedToken || !isAdminUser(authenticatedUser)) {
      const error = new Error("No authenticated employee session is available.");
      setPermissions([]);
      setPermissionsInitializationError(error);
      setIsPermissionsInitializing(false);
      return Promise.reject(error);
    }

    return loadPermissionsForEmployee(authenticatedUser.employeeId);
  }, [loadPermissionsForEmployee]);

  const login = useCallback(
    (
      newToken,
      refreshToken,
      needsPasswordChange = false,
      loginPermissions = []
    ) => {
      invalidateAuthSession();
      permissionLoadRunRef.current += 1;
      clearDashboardFilters();
      removeToken();
      removeRefreshToken();
      clearPersistedPermissions();
      persistToken(newToken);
      if (refreshToken) persistRefreshToken(refreshToken);
      persistMustChangePassword(needsPasswordChange);
      setTokenState(newToken);
      updatePermissions(loginPermissions);
      setPermissionsInitializationError(null);
      setIsPermissionsInitializing(false);
      setMustChangePasswordState(Boolean(needsPasswordChange));
      setSessionExpiredReason(null);
      setIsAuthInitializing(false);
    },
    [updatePermissions]
  );

  const logout = useCallback(() => {
    invalidateAuthSession();
    permissionLoadRunRef.current += 1;
    clearDashboardFilters();
    removeToken();
    removeRefreshToken();
    clearPersistedPermissions();
    persistMustChangePassword(false);
    setTokenState(null);
    setPermissions([]);
    setPermissionsInitializationError(null);
    setIsPermissionsInitializing(false);
    setMustChangePasswordState(false);
  }, []);

  const clearSessionExpiredReason = useCallback(
    () => setSessionExpiredReason(null),
    []
  );

  useEffect(() => {
    registerTokenRefreshedHandler((refreshedToken) => {
      setTokenState(refreshedToken);
    });
    registerSessionExpiredHandler((reason) => {
      invalidateAuthSession();
      permissionLoadRunRef.current += 1;
      queryClient.cancelQueries();
      queryClient.clear();
      clearDashboardFilters();
      clearPersistedPermissions();
      persistMustChangePassword(false);
      setSessionExpiredReason(reason);
      setTokenState(null);
      setPermissions([]);
      setPermissionsInitializationError(null);
      setIsPermissionsInitializing(false);
      setMustChangePasswordState(false);
    });

    return () => {
      registerTokenRefreshedHandler(null);
      registerSessionExpiredHandler(null);
    };
  }, [queryClient]);

  useEffect(() => {
    let cancelled = false;

    const clearInvalidSession = () => {
      if (cancelled) return;
      invalidateAuthSession();
      permissionLoadRunRef.current += 1;
      queryClient.cancelQueries();
      queryClient.clear();
      clearDashboardFilters();
      removeToken();
      removeRefreshToken();
      persistMustChangePassword(false);

      if (!cancelled) {
        setTokenState(null);
        setPermissions([]);
        setPermissionsInitializationError(null);
        setIsPermissionsInitializing(false);
        setMustChangePasswordState(false);
        setIsAuthInitializing(false);
      }
    };

    const initializeAuth = async () => {
      clearPersistedPermissions();
      setIsAuthInitializing(true);
      setIsPermissionsInitializing(true);
      setPermissionsInitializationError(null);

      let activeToken = getToken();
      let user = activeToken ? getUserFromToken(activeToken) : null;

      if (!activeToken || !isAdminUser(user)) {
        clearInvalidSession();
        return;
      }

      if (isTokenExpired(activeToken)) {
        try {
          activeToken = await refreshAccessToken();
          user = getUserFromToken(activeToken);
        } catch {
          if (getToken() === activeToken) clearInvalidSession();
          return;
        }
      }

      if (!isAdminUser(user)) {
        clearInvalidSession();
        return;
      }

      if (cancelled || getToken() !== activeToken) return;
      setTokenState(activeToken);

      try {
        await loadPermissionsForEmployee(user.employeeId);
      } catch {
        // Keep the valid auth session. ProtectedRoute renders the retryable
        // permission initialization error instead of protected content.
      } finally {
        if (!cancelled) setIsAuthInitializing(false);
      }
    };

    initializeAuth();
    return () => {
      cancelled = true;
      permissionLoadRunRef.current += 1;
    };
  }, [loadPermissionsForEmployee, queryClient]);

  const user = token ? getUserFromToken(token) : null;
  const isAuthenticated = isAdminUser(user);
  const permissionSet = useMemo(() => new Set(permissions), [permissions]);
  const hasPermission = useCallback(
    (permissionCode) =>
      isAuthenticated &&
      typeof permissionCode === "string" &&
      permissionSet.has(permissionCode),
    [isAuthenticated, permissionSet]
  );

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      isAuthInitializing,
      isPermissionsInitializing,
      permissionsInitializationError,
      mustChangePassword,
      permissions,
      hasPermission,
      updatePermissions,
      refreshPermissions,
      sessionExpiredReason,
      clearSessionExpiredReason,
      login,
      logout,
    }),
    [
      token,
      user,
      isAuthenticated,
      isAuthInitializing,
      isPermissionsInitializing,
      permissionsInitializationError,
      mustChangePassword,
      permissions,
      hasPermission,
      updatePermissions,
      refreshPermissions,
      sessionExpiredReason,
      clearSessionExpiredReason,
      login,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { TOKEN_KEY };
