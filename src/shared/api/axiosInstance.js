import axios from "axios";
import { isTokenExpired } from "../utils/jwt.js";

export const TOKEN_KEY = "token";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const MUST_CHANGE_PASSWORD_KEY = "mustChangePassword";

let authHandlers = {};
let authSession = 0;
let refreshPromise = null;

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  authSession += 1;
  refreshPromise = null;
  localStorage.setItem(TOKEN_KEY, token);
};
export const clearToken = () => {
  authSession += 1;
  refreshPromise = null;
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
  ["authadmin/login", "authadmin/logout"].some(
    (path) => url.toLowerCase().includes(path)
  );

export const registerAuthHandlers = (handlers) => {
  authHandlers = handlers ?? {};
};

const refreshAccessToken = () => {
  if (refreshPromise) return refreshPromise;
  const session = authSession;
  const token = getToken();
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  refreshPromise = (async () => {
    if (!refreshToken?.trim()) throw new Error("Missing refresh token");
    // Base Axios keeps this request outside the retry interceptor.
    const { data: body } = await axios.post(
      `${axiosInstance.defaults.baseURL}AuthAdmin/refresh-token`,
      { refreshToken }
    );
    if (
      session !== authSession || getToken() !== token ||
      localStorage.getItem(REFRESH_TOKEN_KEY) !== refreshToken
    ) throw new axios.Cancel("Authentication session changed");

    const data = body?.data;
    if (
      body?.succeeded !== true || data?.success !== true ||
      typeof data?.token !== "string" || isTokenExpired(data.token) ||
      typeof data?.refreshToken !== "string" || !data.refreshToken.trim()
    ) throw new Error("Invalid refresh response");

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
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
    if (session === authSession) refreshPromise = null;
  });
  return refreshPromise;
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
  if (token && !authRequest && isTokenExpired(token)) {
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
      error?.response?.status !== 401 || !request || isAuthRequest(request.url) ||
      request._authRetried || request._authSession !== authSession || !getToken()
    ) {
      throw error;
    }
    request._authRetried = true;
    // A delayed 401 can reuse a token another request already renewed.
    if (request._tokenUsed === getToken()) await refreshAccessToken();
    return axiosInstance(request);
  }
);

export default axiosInstance;
