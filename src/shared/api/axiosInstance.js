
import axios from "axios";

export const TOKEN_KEY = "token";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const MUST_CHANGE_PASSWORD_KEY = "mustChangePassword";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setRefreshToken = (refreshToken) =>
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
export const clearRefreshToken = () =>
  localStorage.removeItem(REFRESH_TOKEN_KEY);

export const getMustChangePassword = () =>
  localStorage.getItem(MUST_CHANGE_PASSWORD_KEY) === "true";

export const setMustChangePassword = (value) => {
  if (value) {
    localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, "true");
    return;
  }

  localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
};

const axiosInstance = axios.create({
  baseURL: "https://medicard-api-v2.medicardeg.com/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- QA-only API failure switch ----
// Active only in development when explicitly enabled.
const isQaApiFailureEnabled = () =>
  import.meta.env.DEV &&
  import.meta.env.VITEQASIMULATEAPIFAILURE === "true";

const isAuthRequest = (url = "") => {
  const normalizedUrl = url.toLowerCase();

  return (
    normalizedUrl.includes("authadmin/login") ||
    normalizedUrl.includes("authadmin/refresh-token") ||
    normalizedUrl.includes("authadmin/logout")
  );
};

const isAllowedWhilePasswordChangeRequired = (url = "") => {
  const normalizedUrl = url.toLowerCase();

  return (
    normalizedUrl.includes("authadmin/change-password") ||
    normalizedUrl.includes("authadmin/logout")
  );
};

// ---- Session-expired signal, consumed by AuthProvider ----
let onSessionExpired = null;
let onTokenRefreshed = null;

export const registerSessionExpiredHandler = (handler) => {
  onSessionExpired = handler;
};

export const registerTokenRefreshedHandler = (handler) => {
  onTokenRefreshed = handler;
};

export const handleRefreshFailure = (reason = "unknown") => {
  clearToken();
  clearRefreshToken();
  onSessionExpired?.(reason);
};

// ---- Single shared in-flight refresh + circuit breaker ----
let refreshPromise = null;
let refreshAttemptTimestamps = [];

const MAX_REFRESH_ATTEMPTS = 3;
const REFRESH_WINDOW_MS = 10_000;

const refreshLimitExceeded = () => {
  const now = Date.now();

  refreshAttemptTimestamps = refreshAttemptTimestamps.filter(
    (timestamp) => now - timestamp < REFRESH_WINDOW_MS
  );

  return refreshAttemptTimestamps.length >= MAX_REFRESH_ATTEMPTS;
};

export const refreshAccessToken = () => {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return Promise.reject(new Error("missing-refresh-token"));
  }

  if (refreshLimitExceeded()) {
    return Promise.reject(new Error("refresh-attempt-limit"));
  }

  refreshAttemptTimestamps.push(Date.now());

  // Uses the base axios client to avoid recursive interceptors.
  refreshPromise = axios
    .post(
      `${axiosInstance.defaults.baseURL}AuthAdmin/refresh-token`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      const authData = response?.data?.data;
      const accessToken = authData?.token;
      const nextRefreshToken = authData?.refreshToken;

      if (!accessToken) {
        throw new Error("refresh-response-missing-token");
      }

      setToken(accessToken);

      if (nextRefreshToken) {
        setRefreshToken(nextRefreshToken);
      }

      onTokenRefreshed?.(accessToken);

      return accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

// ---- Request interceptor ----
axiosInstance.interceptors.request.use(
  (config) => {
    // QA simulation: fail requests before they reach the backend.
    if (isQaApiFailureEnabled()) {
      return Promise.reject(
        new axios.AxiosError(
          "QA_SIMULATED_API_OUTAGE",
          "ERR_NETWORK",
          config
        )
      );
    }

    const token = getToken();
    const authRequest = isAuthRequest(config.url);

    if (
      getMustChangePassword() &&
      !authRequest &&
      !isAllowedWhilePasswordChangeRequired(config.url)
    ) {
      return Promise.reject(
        new axios.Cancel("Password change required")
      );
    }

    if (!token && !authRequest) {
      return Promise.reject(
        new axios.Cancel("Authentication required")
      );
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Record the exact token used by this request.
    config._tokenUsed = token || null;

    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response interceptor ----
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error?.config;

    if (error?.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Login/refresh/logout failures are not session-expiry signals here.
    if (isAuthRequest(originalRequest.url)) {
      return Promise.reject(error);
    }

    const currentToken = getToken();

    // Case A: another request has already refreshed the token.
    if (
      currentToken &&
      originalRequest._tokenUsed !== currentToken &&
      !originalRequest._retriedWithNewToken
    ) {
      originalRequest._retriedWithNewToken = true;
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${currentToken}`;

      return axiosInstance(originalRequest);
    }

    // Case B: retry with the latest token also returned 401.
    if (
      originalRequest._retriedWithNewToken ||
      originalRequest._refreshed
    ) {
      handleRefreshFailure("retried-request-returned-401");
      return Promise.reject(error);
    }

    // Case C: first 401; refresh once, then retry.
    originalRequest._refreshed = true;

    return refreshAccessToken().then(
      (accessToken) => {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return axiosInstance(originalRequest);
      },
      (refreshError) => {
        handleRefreshFailure(
          refreshError?.message || "refresh-failed"
        );

        return Promise.reject(refreshError);
      }
    );
  }
);

export default axiosInstance;
