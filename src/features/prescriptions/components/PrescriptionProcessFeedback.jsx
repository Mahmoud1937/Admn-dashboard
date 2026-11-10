import { useEffect, useRef } from "react";
import usePrescriptionsText from "../../../localization/usePrescriptionsText";

function getProcessErrorMessages(error, t) {
  if (!error?.response) return [t("We couldn't connect to the server. Please check your internet connection and try again.")];
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
  return details.length ? details : [error.response.data?.message || t("Failed to process prescription.")];
}

export default function PrescriptionProcessFeedback({ error, validationError, active = true }) {
  const t = usePrescriptionsText();
  const feedbackRef = useRef(null);
  useEffect(() => {
    if (active && (error || validationError)) feedbackRef.current?.scrollIntoView({ block: "nearest" });
  }, [active, error, validationError]);

  if (!error && !validationError) return null;
  return (
    <div ref={feedbackRef} className="space-y-3">
      {validationError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{t(validationError)}</p>}
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          <ul className="list-disc space-y-1 ps-5">
            {getProcessErrorMessages(error, t).map((message, index) => <li key={`${index}-${message}`}>{message}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
