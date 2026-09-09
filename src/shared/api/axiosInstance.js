import axios from "axios";

const TOKEN_KEY = "token";

const STATIC_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOCIsImp0aSI6ImY1Zjg5NzdiLWE5Y2MtNDU1YS1iMDIyLWRlMjc2ZWQ1YWQzZSIsImZpcnN0TmFtZSI6InlvdXNlZiIsImxhc3ROYW1lIjoiYWttYWwiLCJjYXJkTnVtYmVyIjoiIiwiaXNTZXJ2aWNlUHJvdmlkZXIiOmZhbHNlLCJleHAiOjE3ODkxNjE3NzAsImlzcyI6Ik1lZGlDYXJkUGxhdGZvcm0iLCJhdWQiOiJNZWRpQ2FyZFVzZXJzIn0.uiDyvF2Y_OIq0pZppQNyLXiHDPD-JvPEOf9qStfjn64";

// Always use the static token for testing
localStorage.setItem(TOKEN_KEY, STATIC_TOKEN);

const axiosInstance = axios.create({
  baseURL: "https://medicard-api-v2.medicardeg.com/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;