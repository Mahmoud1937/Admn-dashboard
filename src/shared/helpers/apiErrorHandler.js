export const getApiErrorMessage = (error) => {
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
    "Something went wrong. Please try again."
  );
};