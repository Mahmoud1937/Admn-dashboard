import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://medicard-api-v2.medicardeg.com/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  config.headers.Authorization = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwianRpIjoiYjMwYzUyNDYtMjRjZi00NTc3LWIzNDktNTlmMTkwOTI3MWYwIiwiYnJhbmNoTmFtZSI6ItmB2LHYuSDZhdiv2YrZhtipINmG2LXYsSIsImVtYWlsIjoiZXphYnlfbmFzckBtZWRpY2FyZC5jb20iLCJwcm92aWRlcklkIjoiNCIsInByb3ZpZGVyQnJhbmNoSWQiOiI3IiwiaXNTZXJ2aWNlUHJvdmlkZXIiOnRydWUsImFjY291bnRUeXBlIjoiUHJvdmlkZXJCcmFuY2giLCJleHAiOjE3ODY2NDg4MTMsImlzcyI6Ik1lZGlDYXJkUGxhdGZvcm0iLCJhdWQiOiJNZWRpQ2FyZFVzZXJzIn0.kza9ny1Kf3x0J_-jI0H0vzCnYHlMHHXWR08jvE_QMn4";

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;