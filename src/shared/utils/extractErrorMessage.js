// src/shared/utils/extractErrorMessage.js

// Returns { fieldErrors: {camelCaseKey: [msg,...]} | null, generalErrors: [msg,...] }
export function parseServerErrors(err, fallbackMessage) {
  const data = err?.response?.data;
  if (!data) return { fieldErrors: null, generalErrors: [err?.message || fallbackMessage] };

  const { errors } = data;

  // field-keyed errors -> { Email: ["msg"], UserName: ["msg"] }
  if (errors && !Array.isArray(errors) && typeof errors === "object" && Object.keys(errors).length > 0) {
    const fieldErrors = {};
    Object.entries(errors).forEach(([key, messages]) => {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      fieldErrors[camelKey] = Array.isArray(messages) ? messages : [messages];
    });
    return { fieldErrors, generalErrors: [] };
  }

  // array of general error strings -> ["msg1", "msg2"]
  if (Array.isArray(errors) && errors.length > 0) {
    return { fieldErrors: null, generalErrors: errors };
  }

  return { fieldErrors: null, generalErrors: [data.message || data.title || fallbackMessage] };
}