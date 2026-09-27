import axios from "axios";

export const TOKEN_KEY = "token";
export const REFRESH_TOKEN_KEY = "refreshToken";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setRefreshToken = (refreshToken) =>
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
export const clearRefreshToken = () => localStorage.removeItem(REFRESH_TOKEN_KEY);

const axiosInstance = axios.create({
  baseURL: "https://medicard-api-v2.medicardeg.com/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

const isAuthRequest = (url = "") => {
  const normalizedUrl = url.toLowerCase();
  return (
    normalizedUrl.includes("authadmin/login") ||
    normalizedUrl.includes("authadmin/refresh-token")
  );
};

// ---- Session-expired signal, consumed by AuthProvider ----
// No window events: AuthProvider registers a plain callback once on mount.
let onSessionExpired = null;
export const registerSessionExpiredHandler = (handler) => {
  onSessionExpired = handler;
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
    (t) => now - t < REFRESH_WINDOW_MS
  );
  return refreshAttemptTimestamps.length >= MAX_REFRESH_ATTEMPTS;
};

export const refreshAccessToken = () => {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.reject(new Error("missing-refresh-token"));
  if (refreshLimitExceeded()) return Promise.reject(new Error("refresh-attempt-limit"));

  refreshAttemptTimestamps.push(Date.now());

  // Uses the base axios client so this call can never recursively enter
  // this instance's own interceptors.
  refreshPromise = axios
    .post(
      `${axiosInstance.defaults.baseURL}AuthAdmin/refresh-token`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    )
    .then((response) => {
      const authData = response?.data?.data;
      const accessToken = authData?.token;
      const nextRefreshToken = authData?.refreshToken;

      if (!accessToken) throw new Error("refresh-response-missing-token");

      setToken(accessToken);
      if (nextRefreshToken) setRefreshToken(nextRefreshToken);

      return accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

// ---- Request interceptor: attach token + tag request with the token used ----
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    const authRequest = isAuthRequest(config.url);

    if (!token && !authRequest) {
      return Promise.reject(new axios.Cancel("Authentication required"));
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Tags the request with the exact token it was sent with, so the
    // response interceptor can tell "stale token, already refreshed
    // elsewhere" apart from "current token, genuinely rejected".
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

    // Login/refresh failures are credential errors, never session-expiry.
    if (isAuthRequest(originalRequest.url)) {
      return Promise.reject(error);
    }

    const currentToken = getToken();

    // Case A: storage already has a newer token than the one this request
    // was sent with — another request already refreshed it. Just retry
    // with the current token; never trigger a second refresh for this.
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

    // Case B: already retried with the latest token and it's STILL 401 —
    // the endpoint genuinely rejects a current, valid token. Not a
    // token-expiry issue; stop instead of looping.
    if (originalRequest._retriedWithNewToken || originalRequest._refreshed) {
      handleRefreshFailure("retried-request-returned-401");
      return Promise.reject(error);
    }

    // Case C: first 401 for a request that used the current token —
    // refresh once, then retry this request.
    originalRequest._refreshed = true;
    return refreshAccessToken().then(
      (accessToken) => {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      },
      (refreshError) => {
        handleRefreshFailure(refreshError?.message || "refresh-failed");
        return Promise.reject(refreshError);
      }
    );
  }
);

export default axiosInstance;