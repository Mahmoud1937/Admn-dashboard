import axios from "axios";
import { getTokenExpiryTime, isTokenExpired } from "../utils/jwt.js";

export const TOKEN_KEY = "token";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const MUST_CHANGE_PASSWORD_KEY = "mustChangePassword";

const REFRESH_MARGIN_MS = 60_000;
const MAX_TIMER_MS = 2_147_483_647;
let authHandlers = {};
let authSession = 0;
let refreshPromise = null;
let refreshSession = null;
let refreshTimer = null;
let serverClock = null;

function readServerClock(date) {
  // Require an explicit timezone; never interpret server time in the device's zone.
  const isIsoTime = typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(date);
  const timestamp = isIsoTime ? Date.parse(date) : NaN;
  return Number.isFinite(timestamp)
    ? { timestamp, receivedAt: performance.now() }
    : null;
}

function estimatedServerTime(clock = serverClock) {
  return clock ? clock.timestamp + performance.now() - clock.receivedAt : null;
}

function cancelRefreshTimer() {
  clearTimeout(refreshTimer);
  refreshTimer = null;
}

function watchSession() {
  globalThis.document?.addEventListener?.("visibilitychange", resynchronizeSession);
  globalThis.window?.addEventListener?.("pageshow", resynchronizeSession);
}

function unwatchSession() {
  globalThis.document?.removeEventListener?.("visibilitychange", resynchronizeSession);
  globalThis.window?.removeEventListener?.("pageshow", resynchronizeSession);
}

function resynchronizeSession(event) {
  if (event.type === "pageshow" && !event.persisted) return;
  if (globalThis.document?.visibilityState === "hidden" || !getToken()) return;
  // A suspended browser may pause its monotonic clock. Get a fresh reference.
  serverClock = null;
  cancelRefreshTimer();
  if (localStorage.getItem(REFRESH_TOKEN_KEY)?.trim()) {
    void refreshAccessToken().catch(() => {});
  }
}

function scheduleRefresh(fromRefresh = false) {
  cancelRefreshTimer();
  const token = getToken();
  const expiresAt = getTokenExpiryTime(token);
  const now = estimatedServerTime();
  if (expiresAt === null || now === null ||
      !localStorage.getItem(REFRESH_TOKEN_KEY)?.trim()) return;
  const delay = Math.max(0, expiresAt - now - REFRESH_MARGIN_MS);
  // Keep a newly rotated short-lived token; 401/403 recovery can renew it later.
  if (fromRefresh && delay === 0) return;

  const session = authSession;
  refreshTimer = setTimeout(() => {
    if (session !== authSession || getToken() !== token) return;
    refreshTimer = null;
    if (delay > MAX_TIMER_MS) {
      scheduleRefresh(fromRefresh);
      return;
    }
    void refreshAccessToken(session).catch(() => {});
  }, Math.min(delay, MAX_TIMER_MS));
}

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token, serverDate = null) => {
  authSession += 1;
  cancelRefreshTimer();
  serverClock = readServerClock(serverDate);
  localStorage.setItem(TOKEN_KEY, token);
  watchSession();
  scheduleRefresh();
};
export const clearToken = () => {
  authSession += 1;
  cancelRefreshTimer();
  serverClock = null;
  unwatchSession();
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
export const getMustChangePassword = () =>
  localStorage.getItem(MUST_CHANGE_PASSWORD_KEY) === "true";
export const setMustChangePassword = (value) => {
  if (value) localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, "true");
  else localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
};

const axiosInstance = axios.create({
  baseURL: "https://medicard-api-v2.medicardeg.com/api/",
  headers: { "Content-Type": "application/json" },
});

const isAuthRequest = (url = "") =>
  ["authadmin/login", "authadmin/logout", "authadmin/refresh-token"].some(
    (path) => url.toLowerCase().includes(path)
  );

export const registerAuthHandlers = (handlers) => {
  authHandlers = handlers ?? {};
  if (!handlers) {
    cancelRefreshTimer();
    unwatchSession();
  } else if (getToken()) {
    watchSession();
    scheduleRefresh(true);
  }
};

const refreshAccessToken = (expectedSession = authSession) => {
  if (expectedSession !== authSession) {
    return Promise.reject(new axios.Cancel("Authentication session changed"));
  }
  if (refreshPromise) {
    if (refreshSession === expectedSession) return refreshPromise;
    // Let an older session's rotation settle before starting the new session's.
    return refreshPromise.catch(() => {}).then(() => refreshAccessToken(expectedSession));
  }
  const session = authSession;
  const token = getToken();
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  refreshSession = session;

  const pending = (async () => {
    if (!refreshToken?.trim()) throw new Error("Missing refresh token");
    // Base Axios keeps this request outside the retry interceptor.
    const response = await axios.post(
      `${axiosInstance.defaults.baseURL}AuthAdmin/refresh-token`,
      { refreshToken },
      { timeout: 15_000 }
    );
    if (
      session !== authSession || getToken() !== token ||
      localStorage.getItem(REFRESH_TOKEN_KEY) !== refreshToken
    ) throw new axios.Cancel("Authentication session changed");

    const body = response.data;
    const clock = readServerClock(
      response.headers?.get?.("x-server-local-time") ?? response.headers?.["x-server-local-time"]
    );
    const data = body?.data;
    if (
      body?.succeeded !== true || data?.success !== true ||
      typeof data?.token !== "string" ||
      isTokenExpired(data.token, estimatedServerTime(clock || serverClock)) ||
      typeof data?.refreshToken !== "string" || !data.refreshToken.trim()
    ) throw new Error("Invalid refresh response");

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    if (clock) serverClock = clock;
    watchSession();
    scheduleRefresh(true);
    authHandlers.onTokenRefreshed?.(data.token);
    return data.token;
  })().catch((error) => {
    if (
      session === authSession && getToken() === token &&
      localStorage.getItem(REFRESH_TOKEN_KEY) === refreshToken
    ) {
      clearToken();
      authHandlers.onSessionExpired?.("refresh-failed");
    }
    throw error;
  }).finally(() => {
    if (refreshPromise === pending) {
      refreshPromise = null;
      refreshSession = null;
    }
  });
  refreshPromise = pending;
  return pending;
};

export const restoreAuthSession = () => {
  const token = getToken();
  if (!token) return Promise.resolve(null);
  watchSession();
  if (serverClock || !localStorage.getItem(REFRESH_TOKEN_KEY)?.trim()) {
    scheduleRefresh(true);
    return Promise.resolve(token);
  }
  // Reloads have no in-memory time reference. Use the existing refresh endpoint.
  return refreshAccessToken();
};

axiosInstance.interceptors.request.use(async (config) => {
  const session = config._authSession ?? authSession;
  if (session !== authSession) throw new axios.Cancel("Authentication session changed");
  let token = getToken();
  const authRequest = isAuthRequest(config.url);
  if (
    getMustChangePassword() &&
    !authRequest &&
    !config.url?.toLowerCase().includes("authadmin/change-password")
  ) {
    throw new axios.Cancel("Password change required");
  }
  if (!token && !authRequest) {
    throw new axios.Cancel("Authentication required");
  }
  if (token && !authRequest && !config._authRetried &&
      isTokenExpired(token, estimatedServerTime())) {
    token = await refreshAccessToken();
  }
  if (session !== authSession) throw new axios.Cancel("Authentication session changed");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  config._tokenUsed = token || null;
  config._authSession = session;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error?.config;
    if (
      ![401, 403].includes(error?.response?.status) || !request || isAuthRequest(request.url) ||
      request._authRetried || request._authSession !== authSession || !getToken()
    ) {
      throw error;
    }
    request._authRetried = true;
    // A delayed 401/403 can reuse a token another request already renewed.
    if (request._tokenUsed === getToken()) await refreshAccessToken();
    return axiosInstance(request);
  }
);

export default axiosInstance;
