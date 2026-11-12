import localizeMessage from "../../localization/localizeMessage";

export const getApiErrorMessage = (error, {
  details = false,
  fallback = "Something went wrong. Please try again.",
} = {}) => {
  if (details) {
    const body = error?.response?.data;
    const errors = body?.errors;
    const messages = Array.isArray(errors)
      ? errors : errors && typeof errors === "object" ? Object.values(errors).flat() : [];
    const message = messages.filter((message) => typeof message === "string").map(localizeMessage).join(" ")
      || body?.message;
    if (message) return localizeMessage(message);
    // Client-side validation and export errors already contain actionable text.
    if (!error?.response && error?.message && error.message !== "Network Error" && !["ERR_NETWORK", "ECONNABORTED", "ETIMEDOUT"].includes(error.code)) {
      return localizeMessage(error.message);
    }
  }
  // Network / connection error
  if (!error?.response) {
    return localizeMessage("Unable to connect to the server. Please check your internet connection and try again.");
  }

  const status = error.response.status;

  if (status >= 500) {
    return localizeMessage("Something went wrong on our side. Please try again later.");
  }

  if (status === 401) {
    return localizeMessage("Your session has expired. Please login again.");
  }

  if (status === 403) {
    return localizeMessage("You don't have permission to perform this action.");
  }

  if (status === 404) {
    return localizeMessage("The requested resource could not be found.");
  }

  return localizeMessage(
    error.response.data?.message ||
    fallback
  );
};

export function requireApiSuccess(response, fallback) {
  if (response.data?.succeeded === false) {
    const error = new Error(response.data.message || fallback);
    error.response = response;
    throw error;
  }
  return response.data;
}
