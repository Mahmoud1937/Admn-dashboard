import axios from "axios";

const TOKEN_KEY = "token";

const STATIC_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNCIsImp0aSI6IjBjNzUzYjU0LWIxNjQtNGM2Ny1hYTcxLTAyOGExZmVjZTRjOCIsImJyYW5jaE5hbWUiOiJzaGFmZWV5IiwiZW1haWwiOiJzaGFmZWV5QGdtYWlsLmNvbSIsInByb3ZpZGVySWQiOiI1NSIsInByb3ZpZGVyQnJhbmNoSWQiOiIzNCIsImlzU2VydmljZVByb3ZpZGVyIjp0cnVlLCJhY2NvdW50VHlwZSI6IlByb3ZpZGVyQnJhbmNoIiwiZXhwIjoxNzg3NjgzMDMyLCJpc3MiOiJNZWRpQ2FyZFBsYXRmb3JtIiwiYXVkIjoiTWVkaUNhcmRVc2VycyJ9.4aIoyz0uxusKKQnlGrhO2ySJbPDEEgwQsURBebGhfQU";

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