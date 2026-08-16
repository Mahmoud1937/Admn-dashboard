import toast from "react-hot-toast";

export function handleMutationError(error, fallback, setServerErrors) {
  const backendErrors = error?.response?.data?.errors;

  if (Array.isArray(backendErrors) && backendErrors.length > 0) {
    setServerErrors(null);
    toast.error(backendErrors.join(" "));
    return;
  }

  if (backendErrors && typeof backendErrors === "object") {
    setServerErrors(backendErrors);
    return;
  }

  setServerErrors(null);
  toast.error(error?.response?.data?.message || fallback);
}