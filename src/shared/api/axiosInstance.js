import axios from "axios";
import { isTokenExpired } from "../utils/jwt";

export const TOKEN_KEY = "token";
export const REFRESH_TOKEN_KEY = "refreshToken";

const getActiveItem = (key) =>
  sessionStorage.getItem(key) ?? localStorage.getItem(key);

const clearItem = (key) => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};

const setItem = (key, value, rememberMe) => {
  clearItem(key);
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(key, value);
};

export const getToken = () => getActiveItem(TOKEN_KEY);
export const setToken = (token, rememberMe) =>
  setItem(TOKEN_KEY, token, rememberMe);
export const clearToken = () => clearItem(TOKEN_KEY);

export const getRefreshToken = () => getActiveItem(REFRESH_TOKEN_KEY);
export const setRefreshToken = (refreshToken, rememberMe) =>
  setItem(REFRESH_TOKEN_KEY, refreshToken, rememberMe);
export const clearRefreshToken = () => clearItem(REFRESH_TOKEN_KEY);

const axiosInstance = axios.create({
  baseURL: "https://medicard-api-v2.medicardeg.com/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    let token = getToken();
    const isLoginRequest = config.url?.toLowerCase().includes("authadmin/login");

    if (token && isTokenExpired(token)) {
      clearToken();
      clearRefreshToken();
      token = null;
      if (!isLoginRequest && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      if (!isLoginRequest) {
        return Promise.reject(new axios.Cancel("Token expired"));
      }
    }

    if (!token && !isLoginRequest) {
      return Promise.reject(new axios.Cancel("Authentication required"));
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// If the token is missing/expired, clear it and send the user back to login
// instead of letting every screen fail silently with 401s.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
      clearRefreshToken();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
