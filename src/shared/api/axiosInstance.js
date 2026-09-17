import axios from "axios";

const TOKEN_KEY = "token";

const STATIC_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOCIsImp0aSI6ImE0OGQ1MGI5LWIxZTMtNDFmOC1iMWQwLTQ0ZmYwY2FiZmFjOCIsImZpcnN0TmFtZSI6InlvdXNlZiIsImxhc3ROYW1lIjoiYWttYWwiLCJjYXJkTnVtYmVyIjoiIiwiaXNTZXJ2aWNlUHJvdmlkZXIiOmZhbHNlLCJleHAiOjE3ODk4NTY4MzcsImlzcyI6Ik1lZGlDYXJkUGxhdGZvcm0iLCJhdWQiOiJNZWRpQ2FyZFVzZXJzIn0._IjtdBnp99Wd3zNkbqSIk9MsiHKS7E2LLgLcxqqcK3s";

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