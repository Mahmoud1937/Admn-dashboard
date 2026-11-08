import { useEffect, useRef } from "react";
import { getApiErrorMessage } from "../../../shared/helpers/apiErrorHandler";

function getProcessErrorMessages(error) {
  if (!error?.response) return [getApiErrorMessage(error)];
  const errors = error.response.data?.errors;
  const details = Array.isArray(errors)
    ? errors.filter((message) => typeof message === "string")
    : errors && typeof errors === "object"
      ? Object.entries(errors).flatMap(([field, messages]) =>
          (Array.isArray(messages) ? messages : [messages])
            .filter((message) => typeof message === "string")
            .map((message) => `${field}: ${message}`)
        )
      : [];
  return details.length ? details : [getApiErrorMessage(error, {
    details: true, fallback: "Failed to process prescription.",
  })];
}

export default function PrescriptionProcessFeedback({ error, validationError, active = true }) {
  const feedbackRef = useRef(null);
  useEffect(() => {
    if (active && (error || validationError)) feedbackRef.current?.scrollIntoView({ block: "nearest" });
  }, [active, error, validationError]);

  if (!error && !validationError) return null;
  return (
    <div ref={feedbackRef} className="space-y-3">
      {validationError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{validationError}</p>}
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          <ul className="list-disc space-y-1 pl-5">
            {getProcessErrorMessages(error).map((message, index) => <li key={`${index}-${message}`}>{message}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
