import axios from "axios";

const TOKEN_KEY = "token";

const STATIC_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOCIsImp0aSI6IjhmYmFkNzViLTQ4ZTEtNDhlYy05NTlmLTA4NzY2ZjJlMjgwNCIsImZpcnN0TmFtZSI6InlvdXNlZiIsImxhc3ROYW1lIjoiYWttYWwiLCJjYXJkTnVtYmVyIjoiIiwiaXNTZXJ2aWNlUHJvdmlkZXIiOmZhbHNlLCJleHAiOjE3ODk2ODc3MDMsImlzcyI6Ik1lZGlDYXJkUGxhdGZvcm0iLCJhdWQiOiJNZWRpQ2FyZFVzZXJzIn0.Ed1JLeGhRgGO185-p5p3qJ2P-0pTzlncEDkm9Ym3EH4";

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