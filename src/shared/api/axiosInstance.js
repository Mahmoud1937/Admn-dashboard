import axios from "axios";

const TOKEN_KEY = "token";

const STATIC_TOKEN ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxOCIsImp0aSI6ImM0YTY3YjQ2LTZjNmMtNDNhZi05MDBhLTRjZTg3MzgxYWFiZSIsImZpcnN0TmFtZSI6ItmF2K3ZhdmI2K8iLCJsYXN0TmFtZSI6Itin2YTYtNin2YHYudmKINmF2KjYr9mKINiz2LnYryDYudiv2Kgg2KfYrdmF2K8g2YXYrdmF2K8iLCJjYXJkTnVtYmVyIjoiIiwiaXNTZXJ2aWNlUHJvdmlkZXIiOmZhbHNlLCJleHAiOjE3OTAxMDIxMjYsImlzcyI6Ik1lZGlDYXJkUGxhdGZvcm0iLCJhdWQiOiJNZWRpQ2FyZFVzZXJzIn0.AWVb430ycI2x19GF16_XMhrEySv5asFfUYgvD34of7k"

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