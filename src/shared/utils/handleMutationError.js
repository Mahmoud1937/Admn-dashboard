import toast from "react-hot-toast";
import localizeMessage from "../../localization/localizeMessage";

export function handleMutationError(error, fallback, setServerErrors, messages = {}) {
  // Network Error
  if (!error?.response) {
    setServerErrors(null);

    toast.error(
      messages.networkError ?? localizeMessage("Unable to connect to the server. Please check your internet connection and try again.")
    );

    return;
  }

  const status = error.response.status;
  const backendErrors = error?.response?.data?.errors;

  // Server Error
  if (status >= 500) {
    setServerErrors(null);

    toast.error(
      messages.serverError ?? localizeMessage("Something went wrong on our side. Please try again later.")
    );

    return;
  }

  // Unauthorized
  if (status === 401) {
    setServerErrors(null);

    toast.error(
      messages.sessionExpired ?? localizeMessage("Your session has expired. Please login again.")
    );

    return;
  }

  // Forbidden
  if (status === 403) {
    setServerErrors(null);

    toast.error(
      messages.forbidden ?? localizeMessage("You don't have permission to perform this action.")
    );

    return;
  }

  // Backend validation errors - array
  if (Array.isArray(backendErrors) && backendErrors.length > 0) {
    setServerErrors(null);

    toast.error(backendErrors.map(localizeMessage).join(" "));

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
    localizeMessage(error?.response?.data?.message || fallback)
  );
}
