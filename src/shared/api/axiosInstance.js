import axios from "axios";

const TOKEN_KEY = "token";

const STATIC_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NCIsImp0aSI6IjNkOTlmZDNjLTM1NGYtNGRlYS05M2JmLTcwMWVhNTgzNDUxYiIsImZpcnN0TmFtZSI6InNoYWZlZXlVc2VyIiwibGFzdE5hbWUiOiJzaGFmZWV5IiwiY2FyZE51bWJlciI6IiIsImlzU2VydmljZVByb3ZpZGVyIjpmYWxzZSwiZXhwIjoxNzg5NjgxMTczLCJpc3MiOiJNZWRpQ2FyZFBsYXRmb3JtIiwiYXVkIjoiTWVkaUNhcmRVc2VycyJ9.EeaLJqNDbFYiash0Ql240OtLpMPsHEUzd0SBFfXXAsA";

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