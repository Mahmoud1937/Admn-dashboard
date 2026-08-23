import axios from "axios";

const TOKEN_KEY = "token";

const STATIC_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOCIsImp0aSI6IjM0NDQ2Zjg3LTM1NjgtNDU3OC04OWMxLTIzNGIzMmI1NWZmOSIsImZpcnN0TmFtZSI6InlvdXNlZiIsImxhc3ROYW1lIjoiYWttYWwiLCJjYXJkTnVtYmVyIjoiIiwiaXNTZXJ2aWNlUHJvdmlkZXIiOmZhbHNlLCJleHAiOjE3ODc2ODc2MzcsImlzcyI6Ik1lZGlDYXJkUGxhdGZvcm0iLCJhdWQiOiJNZWRpQ2FyZFVzZXJzIn0.wNJ-UyRs1xvJK50uWM4k0iC8MUi8h5VztLcPdn_UHQE";

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