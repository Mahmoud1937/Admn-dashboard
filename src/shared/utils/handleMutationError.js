import toast from "react-hot-toast";

export function handleMutationError(error, fallback, setServerErrors, messages = {}) {
  // Network Error
  if (!error?.response) {
    setServerErrors(null);

    toast.error(
      messages.networkError ?? "Unable to connect to the server. Please check your internet connection and try again."
    );

    return;
  }

  const status = error.response.status;
  const backendErrors = error?.response?.data?.errors;

  // Server Error
  if (status >= 500) {
    setServerErrors(null);

    toast.error(
      messages.serverError ?? "Something went wrong on our side. Please try again later."
    );

    return;
  }

  // Unauthorized
  if (status === 401) {
    setServerErrors(null);

    toast.error(
      messages.sessionExpired ?? "Your session has expired. Please login again."
    );

    return;
  }

  // Forbidden
  if (status === 403) {
    setServerErrors(null);

    toast.error(
      messages.forbidden ?? "You don't have permission to perform this action."
    );

    return;
  }

  // Backend validation errors - array
  if (Array.isArray(backendErrors) && backendErrors.length > 0) {
    setServerErrors(null);

    toast.error(backendErrors.join(" "));

    return;
  }

  // Backend validation errors - object
  if (backendErrors && typeof backendErrors === "object") {
    setServerErrors(backendErrors);

    return;
  }

  // Normal backend message
  setServerErrors(null);

  toast.error(
    error?.response?.data?.message || fallback
  );
}
