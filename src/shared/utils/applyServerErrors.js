import { humanizeServerError } from "../constants/serverErrorMessages";


function toFieldName(backendField) {
  return backendField.charAt(0).toLowerCase() + backendField.slice(1);
}

export function applyServerErrors(serverErrors, setError) {
  if (!serverErrors) return;

  Object.entries(serverErrors).forEach(([backendField, messages]) => {
    const fieldName = toFieldName(backendField);
    const rawMessage = Array.isArray(messages) ? messages[0] : messages;
    setError(fieldName, { type: "server", message: humanizeServerError(rawMessage) });
  });
}