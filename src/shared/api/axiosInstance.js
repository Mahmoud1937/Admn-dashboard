import axios from "axios";

const TOKEN_KEY = "token";

const STATIC_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNCIsImp0aSI6IjExYzkyMjY5LTI3MGEtNDlhYS05OGVlLWU2MjY1ZWViZjY5YSIsImJyYW5jaE5hbWUiOiJzaGFmZWV5IiwiZW1haWwiOiJzaGFmZWV5QGdtYWlsLmNvbSIsInByb3ZpZGVySWQiOiI1NSIsInByb3ZpZGVyQnJhbmNoSWQiOiIzNCIsImlzU2VydmljZVByb3ZpZGVyIjp0cnVlLCJhY2NvdW50VHlwZSI6IlByb3ZpZGVyQnJhbmNoIiwiZXhwIjoxNzg4NDc3Mjk5LCJpc3MiOiJNZWRpQ2FyZFBsYXRmb3JtIiwiYXVkIjoiTWVkaUNhcmRVc2VycyJ9.uHrr7WJTevX4X_2rsbH3LmL2o6s9E3Mo69vj8Fje3GM";

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