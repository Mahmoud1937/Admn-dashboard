export const getApiErrorMessage = (error, {
  details = false,
  fallback = "Something went wrong. Please try again.",
} = {}) => {
  if (details) {
    const body = error?.response?.data;
    const errors = body?.errors;
    const messages = Array.isArray(errors)
      ? errors : errors && typeof errors === "object" ? Object.values(errors).flat() : [];
    return messages.filter((message) => typeof message === "string").join(" ")
      || body?.message || error?.message || fallback;
  }
  // Network / connection error
  if (!error.response) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  const status = error.response.status;

  if (status >= 500) {
    return "Something went wrong on our side. Please try again later.";
  }

  if (status === 401) {
    return "Your session has expired. Please login again.";
  }

  if (status === 403) {
    return "You don't have permission to perform this action.";
  }

  if (status === 404) {
    return "The requested resource could not be found.";
  }

  return (
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
