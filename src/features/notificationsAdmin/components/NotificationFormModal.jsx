import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faPaperPlane,
  faBell,
  faSpinner,
  faImage,
  faBolt,
  faClock,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

import {
  notificationSchema,
  defaultNotificationValues,
  toPayload,
} from "../schema/notificationSchema";

import { DatePicker } from "../../../shared/components/DateRangeFilterFields";

const inputBase =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition-colors duration-200 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

const FOCUS_TONES = {
  blue: "focus:border-[#1b4477] focus:ring-[#1b4477]/15",
  teal: "focus:border-[#2caba2] focus:ring-[#2caba2]/20",
};

// Small self-contained animations (turned off for users who prefer reduced motion).
const ANIMATION_CSS = `
@keyframes notificationOverlayIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes notificationModalIn {
  from { opacity: 0; transform: translateY(14px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes notificationSectionIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes notificationPreviewIn {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.notification-overlay-in { animation: notificationOverlayIn 0.2s ease-out backwards; }
.notification-modal-in { animation: notificationModalIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
.notification-form-sections > * { animation: notificationSectionIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
.notification-form-sections > *:nth-child(2) { animation-delay: 70ms; }
.notification-form-sections > *:nth-child(3) { animation-delay: 140ms; }
.notification-preview-in { animation: notificationPreviewIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
@media (prefers-reduced-motion: reduce) {
  .notification-overlay-in,
  .notification-modal-in,
  .notification-form-sections > *,
  .notification-preview-in { animation: none; }
}
`;

function SectionHeading({ title, description }) {
  return (
    <div className="mb-4 flex items-start gap-2.5">
      <span
        aria-hidden="true"
        className="mt-0.5 h-8 w-1 shrink-0 rounded-full bg-gradient-to-b from-[#1b4477] to-[#2caba2]"
      />

      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

const getToday = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// "2026-10-15" + "14:30" -> "Oct 15, 2026 at 2:30 PM"
const formatSchedule = (date, time) => {
  const [year, month, day] = String(date).split("-").map(Number);
  const [hour, minute] = String(time).split(":").map(Number);

  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    return `${date} ${time}`;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${MONTHS[month - 1]} ${day}, ${year} at ${hour12}:${String(
    minute
  ).padStart(2, "0")} ${suffix}`;
};

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  counter,
  required,
}) {
  const labelClassName = "text-sm font-medium text-gray-700";

  const labelContent = (
    <>
      {label}

      {required && (
        <span className="ml-1 text-red-500" aria-hidden="true">
          *
        </span>
      )}
    </>
  );

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        {htmlFor ? (
          <label htmlFor={htmlFor} className={labelClassName}>
            {labelContent}
          </label>
        ) : (
          <span className={labelClassName}>{labelContent}</span>
        )}

        {counter}
      </div>

      {children}

      {error ? (
        <p
          id={htmlFor ? `${htmlFor}-error` : undefined}
          role="alert"
          className="mt-1.5 text-xs font-medium text-red-600"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function CharacterCounter({ value, max }) {
  const length = (value || "").length;
  const percentage = max ? length / max : 0;

  let className = "text-gray-400";

  if (percentage >= 1) {
    className = "text-red-600";
  } else if (percentage >= 0.9) {
    className = "text-amber-600";
  }

  return (
    <span className={`text-xs tabular-nums ${className}`}>
      {length}/{max}
    </span>
  );
}

function LanguageTabs({ language, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
          language === "en"
            ? "bg-[#1b4477] text-white shadow-sm"
            : "text-gray-500 hover:bg-white hover:text-gray-700"
        }`}
      >
        English
      </button>

      <button
        type="button"
        onClick={() => onChange("ar")}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
          language === "ar"
            ? "bg-[#2caba2] text-white shadow-sm"
            : "text-gray-500 hover:bg-white hover:text-gray-700"
        }`}
      >
        Arabic
      </button>
    </div>
  );
}

function NotificationImage({ imageUrl }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  const isValidUrl =
    imageUrl && /^https?:\/\/.+/i.test(imageUrl.trim());

  if (!isValidUrl || hasError) {
    return null;
  }

  return (
    <img
      key={imageUrl}
      src={imageUrl}
      alt=""
      className="mt-3 h-28 w-full rounded-xl border border-gray-100 object-cover"
      onError={() => setHasError(true)}
    />
  );
}

function PhonePreview({ title, message, imageUrl, lang }) {
  const isArabic = lang === "ar";

  const currentTime = useMemo(
    () =>
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  return (
    <div className="mx-auto w-full min-w-0 max-w-[300px]">
      <div className="overflow-hidden rounded-[2rem] border-[5px] border-gray-800 bg-gradient-to-b from-slate-100 to-slate-200 shadow-xl">
        <div className="px-3 pt-3">
          <div className="mx-auto h-1.5 w-16 rounded-full bg-gray-800/70" />

          <div className="py-5 text-center text-[11px] font-medium text-gray-500">
            {currentTime}
          </div>
        </div>

        <div className="px-3">
          <div
            key={lang}
            dir={isArabic ? "rtl" : "ltr"}
            className="notification-preview-in w-full min-w-0 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-sm backdrop-blur"
          >
            <div
              dir="ltr"
              className={`mb-2 flex w-full min-w-0 items-center justify-between gap-2 text-[11px] text-gray-500 ${
                isArabic ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex min-w-0 items-center gap-2 ${
                  isArabic ? "flex-row-reverse" : ""
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#1b4477] text-white">
                  <FontAwesomeIcon icon={faBell} className="text-[9px]" />
                </span>
                <span className="font-semibold text-gray-600">Medicard</span>
              </div>

              <div
                className={`flex shrink-0 items-center gap-1 ${
                  isArabic ? "flex-row-reverse" : ""
                }`}
              >
                <span>•</span>
                <span>now</span>
              </div>
            </div>

            <p
              dir={isArabic ? "rtl" : "ltr"}
              className={`w-full min-w-0 whitespace-normal break-words text-sm font-semibold leading-snug text-gray-900 ${isArabic ? "text-right" : "text-left"}`}
            >
              {title || "Notification title"}
            </p>

            <p
              dir={isArabic ? "rtl" : "ltr"}
              className={`mt-1 w-full min-w-0 whitespace-normal break-words text-xs leading-relaxed text-gray-600 ${isArabic ? "text-right" : "text-left"}`}
            >
              {message || "Your notification message will appear here."}
            </p>

            <NotificationImage imageUrl={imageUrl} />
          </div>

          <div className="h-24" />
        </div>

        <div className="pb-2">
          <div className="mx-auto h-1 w-24 rounded-full bg-gray-700/60" />
        </div>
      </div>
    </div>
  );
}

function DeliveryOption({
  value,
  currentValue,
  title,
  description,
  icon,
  register,
}) {
  const selected = currentValue === value;

  return (
    <label
      className={`group relative cursor-pointer rounded-xl border p-3.5 transition-all duration-200 motion-safe:hover:-translate-y-0.5 ${
        selected
          ? "border-[#1b4477] bg-blue-50/70 shadow-md shadow-blue-900/10 ring-1 ring-[#1b4477]"
          : "border-gray-200 bg-white hover:border-[#1b4477]/40 hover:bg-blue-50/30 hover:shadow-sm"
      }`}
    >
      <input
        type="radio"
        value={value}
        {...register("sendMode")}
        className="sr-only"
      />

      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 motion-safe:group-hover:scale-110 ${
            selected
              ? "bg-[#1b4477] text-white shadow-md shadow-blue-900/20"
              : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-[#1b4477]"
          }`}
        >
          <FontAwesomeIcon icon={icon} className="text-sm" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p
              className={`text-sm font-semibold ${
                selected
                  ? "text-blue-900"
                  : "text-gray-800"
              }`}
            >
              {title}
            </p>

            {selected && (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2caba2] text-white shadow-sm">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="text-[9px]"
                />
              </span>
            )}
          </div>

          <p
            className={`mt-0.5 text-xs ${
              selected
                ? "text-blue-700"
                : "text-gray-500"
            }`}
          >
            {description}
          </p>
        </div>
      </div>
    </label>
  );
}

function DeliverySection({
  register,
  values,
  errors,
  setValue,
  border,
}) {
  const sendMode = values?.sendMode;
  const today = getToday();

  const updateScheduledAt = (date, time) => {
    setValue(
      "scheduledAt",
      date && time ? `${date}T${time}` : "",
      {
        shouldValidate: true,
        shouldDirty: true,
      }
    );
  };

  const handleDateChange = (date) => {
    setValue("scheduledDate", date, {
      shouldDirty: true,
    });

    updateScheduledAt(date, values?.scheduledTime);
  };

  const handleTimeChange = (event) => {
    const time = event.target.value;

    setValue("scheduledTime", time, {
      shouldDirty: true,
    });

    updateScheduledAt(values?.scheduledDate, time);
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50/80 to-blue-50/40 p-4">
      <SectionHeading
        title="Delivery"
        description="Choose when this notification should be delivered."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DeliveryOption
          value="now"
          currentValue={sendMode}
          title="Send now"
          description="Deliver immediately"
          icon={faBolt}
          register={register}
        />

        <DeliveryOption
          value="schedule"
          currentValue={sendMode}
          title="Schedule"
          description="Choose a date and time"
          icon={faClock}
          register={register}
        />
      </div>

      {sendMode === "schedule" && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
          <Field
            label="Send at"
            required
            error={errors.scheduledAt?.message}
          >
            <input
              type="hidden"
              {...register("scheduledAt")}
            />

            <input
              type="hidden"
              {...register("scheduledDate")}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <span className="mb-1.5 block text-xs font-medium text-gray-600">
                  Date
                </span>

                <DatePicker
                  value={values?.scheduledDate ?? ""}
                  minDate={today}
                  onChange={handleDateChange}
                />
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-600">
                  Time
                </span>

                <input
                  type="time"
                  {...register("scheduledTime")}
                  onChange={handleTimeChange}
                  className={`${inputBase} ${border(
                    "scheduledAt"
                  )}`}
                />
              </label>
            </div>
          </Field>
        </div>
      )}

      <div className="mt-4">
        <Field
          label="Notification visibility"
          htmlFor="notification-duration"
          error={errors.durationDay?.message}
          hint="How many days this notification should remain visible in the app."
        >
          <div className="relative max-w-[220px]">
            <input
              id="notification-duration"
              aria-invalid={!!errors.durationDay}
              aria-describedby={
                errors.durationDay
                  ? "notification-duration-error"
                  : undefined
              }
              type="number"
              min={1}
              max={365}
              step={1}
              inputMode="numeric"
              onWheel={(e) => e.currentTarget.blur()}
              onKeyDown={(e) => {
                if (
                  ["e", "E", "+", "-", "."].includes(e.key)
                ) {
                  e.preventDefault();
                }
              }}
              {...register("durationDay")}
              placeholder="e.g. 3"
              className={`${inputBase} pr-14 ${border(
                "durationDay"
              )}`}
            />

            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              days
            </span>
          </div>
        </Field>
      </div>
    </section>
  );
}

function PreviewPanel({
  title,
  messageEn,
  messageAr,
  imageUrl,
}) {
  const [language, setLanguage] = useState("en");

  const message =
    language === "ar" ? messageAr : messageEn;

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            Live preview
          </p>

          <LanguageTabs
            language={language}
            onChange={setLanguage}
          />
        </div>

        <PhonePreview
          lang={language}
          title={title}
          message={message}
          imageUrl={imageUrl}
        />

        <p className="mx-auto mt-4 max-w-[280px] text-center text-[11px] leading-relaxed text-gray-400">
          Preview is approximate and may vary slightly
          depending on the device.
        </p>
      </div>
    </aside>
  );
}

export default function NotificationFormModal({
  open,
  onClose,
  onSubmit,
  isSaving,
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    setFocus,
    formState: {
      errors,
      submitCount,
    },
  } = useForm({
    resolver: zodResolver(notificationSchema),
    mode: "onTouched",
    defaultValues: {
      ...defaultNotificationValues,
      scheduledDate: "",
      scheduledTime: "",
    },
  });

  const title = useWatch({
    control,
    name: "title",
  });

  const messageEn = useWatch({
    control,
    name: "messageEn",
  });

  const messageAr = useWatch({
    control,
    name: "messageAr",
  });

  const imageUrl = useWatch({
    control,
    name: "imageUrl",
  });

  const sendMode = useWatch({
    control,
    name: "sendMode",
  });

  const scheduledDate = useWatch({
    control,
    name: "scheduledDate",
  });

  const scheduledTime = useWatch({
    control,
    name: "scheduledTime",
  });

  const durationDay = useWatch({
    control,
    name: "durationDay",
  });

  const values = {
    title,
    messageEn,
    messageAr,
    imageUrl,
    sendMode,
    scheduledDate,
    scheduledTime,
    durationDay,
  };

  useEffect(() => {
    if (!open) return;

    reset({
      ...defaultNotificationValues,
      scheduledDate: "",
      scheduledTime: "",
    });

    requestAnimationFrame(() => {
      setFocus("title");
    });
  }, [open, reset, setFocus]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        !isSaving
      ) {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [open, isSaving, onClose]);

  useEffect(() => {
    if (sendMode !== "schedule") {
      setValue("scheduledAt", "");
      setValue("scheduledDate", "");
      setValue("scheduledTime", "");
    }
  }, [sendMode, setValue]);

  if (!open) return null;

  const border = (name, tone = "blue") =>
    errors[name]
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
      : `border-gray-300 hover:border-gray-400 ${FOCUS_TONES[tone]}`;

  const submitForm = handleSubmit((formValues) => {
    onSubmit(toPayload(formValues));
  });

  const deliverySummary =
    sendMode === "schedule" &&
    scheduledDate &&
    scheduledTime
      ? `Scheduled for ${formatSchedule(
          scheduledDate,
          scheduledTime
        )} (your local time)`
      : "Will be sent immediately";

  const showFormError =
    submitCount > 0 && Object.keys(errors).length > 0;

  return (
    <div
      className="notification-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isSaving
        ) {
          onClose();
        }
      }}
    >
      <style>{ANIMATION_CSS}</style>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-modal-title"
        aria-describedby="notification-modal-description"
        className="notification-modal-in flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <header className="relative flex shrink-0 items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50/70 via-white to-teal-50/50 px-6 py-4">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1b4477] via-blue-500 to-[#2caba2]"
          />

          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1b4477] text-white shadow-lg shadow-blue-900/20">
              <FontAwesomeIcon icon={faBell} />
            </span>

            <div className="min-w-0">
              <h2
                id="notification-modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                New notification
              </h2>

              <p
                id="notification-modal-description"
                className="mt-0.5 text-xs text-gray-500"
              >
                Create and send a notification to app
                users
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 motion-safe:hover:rotate-90"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </header>

        <form
          onSubmit={submitForm}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* Content */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 overflow-y-auto p-6 lg:grid-cols-[minmax(0,1fr)_310px]">
            {/* Form */}
            <div className="notification-form-sections min-w-0 space-y-6">
              {/* Content */}
              <section>
                <SectionHeading
                  title="Content"
                  description="Write the content users will see in the notification."
                />

                <div className="space-y-4">
                  <Field
                    label="Title"
                    htmlFor="notification-title"
                    required
                    error={errors.title?.message}
                    counter={
                      <CharacterCounter
                        value={title}
                        max={100}
                      />
                    }
                  >
                    <input
                      id="notification-title"
                      aria-invalid={!!errors.title}
                      aria-describedby={
                        errors.title
                          ? "notification-title-error"
                          : undefined
                      }
                      {...register("title")}
                      placeholder="e.g. Official holiday announcement"
                      autoComplete="off"
                      className={`${inputBase} ${border(
                        "title"
                      )}`}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <Field
                      label="Message (English)"
                      htmlFor="notification-message-en"
                      required
                      error={
                        errors.messageEn?.message
                      }
                      counter={
                        <CharacterCounter
                          value={messageEn}
                          max={500}
                        />
                      }
                    >
                      <textarea
                        id="notification-message-en"
                        aria-invalid={!!errors.messageEn}
                        aria-describedby={
                          errors.messageEn
                            ? "notification-message-en-error"
                            : undefined
                        }
                        {...register("messageEn")}
                        rows={5}
                        dir="ltr"
                        placeholder="Write the English message…"
                        className={`${inputBase} resize-none border-l-4 border-l-[#1b4477] leading-relaxed ${border(
                          "messageEn"
                        )}`}
                      />
                    </Field>

                    <Field
                      label="Message (Arabic)"
                      htmlFor="notification-message-ar"
                      required
                      error={
                        errors.messageAr?.message
                      }
                      counter={
                        <CharacterCounter
                          value={messageAr}
                          max={500}
                        />
                      }
                    >
                      <textarea
                        id="notification-message-ar"
                        aria-invalid={!!errors.messageAr}
                        aria-describedby={
                          errors.messageAr
                            ? "notification-message-ar-error"
                            : undefined
                        }
                        {...register("messageAr")}
                        rows={5}
                        dir="rtl"
                        placeholder="Write the Arabic message…"
                        className={`${inputBase} resize-none border-l-4 border-l-[#2caba2] leading-relaxed ${border(
                          "messageAr",
                          "teal"
                        )}`}
                      />
                    </Field>
                  </div>
                </div>
              </section>

              {/* Media */}
              <section>
                <SectionHeading
                  title="Media"
                  description="Optionally attach an image to make the notification more engaging."
                />

                <Field
                  label="Image URL"
                  htmlFor="notification-image-url"
                  error={
                    errors.imageUrl?.message
                  }
                  hint="Use a publicly accessible image URL. Recommended landscape format."
                >
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400"
                    />

                    <input
                      id="notification-image-url"
                      aria-invalid={!!errors.imageUrl}
                      aria-describedby={
                        errors.imageUrl
                          ? "notification-image-url-error"
                          : undefined
                      }
                      {...register("imageUrl")}
                      placeholder="https://example.com/image.jpg"
                      autoComplete="off"
                      className={`${inputBase} pl-9 ${border(
                        "imageUrl"
                      )}`}
                    />
                  </div>
                </Field>
              </section>

              {/* Delivery */}
              <DeliverySection
                register={register}
                values={values}
                errors={errors}
                setValue={setValue}
                border={border}
              />
            </div>

            {/* Preview */}
            <PreviewPanel
              title={title}
              messageEn={messageEn}
              messageAr={messageAr}
              imageUrl={imageUrl}
            />
          </div>

          {/* Footer */}
          <footer className="flex shrink-0 flex-col gap-3 border-t border-gray-200 bg-gray-50/80 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-medium text-gray-600">
                <FontAwesomeIcon
                  icon={sendMode === "schedule" ? faClock : faBolt}
                  className={
                    sendMode === "schedule"
                      ? "text-[#2caba2]"
                      : "text-amber-500"
                  }
                />
                {deliverySummary}
              </p>

              {sendMode === "schedule" &&
                !(
                  scheduledDate &&
                  scheduledTime
                ) && (
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    Select a date and time before
                    scheduling.
                  </p>
                )}

              {showFormError && (
                <p
                  role="alert"
                  className="mt-0.5 text-[11px] font-medium text-red-600"
                >
                  Please fix the highlighted fields to
                  continue.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="group inline-flex min-w-[150px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#1b4477] to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-blue-950 hover:to-[#1b4477] hover:shadow-lg hover:shadow-blue-900/25 focus:outline-none focus:ring-2 focus:ring-[#1b4477]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-blue-400 disabled:bg-none disabled:opacity-70 disabled:shadow-none motion-safe:hover:-translate-y-0.5"
              >
                <FontAwesomeIcon
                  icon={
                    isSaving
                      ? faSpinner
                      : faPaperPlane
                  }
                  spin={isSaving}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />

                {isSaving
                  ? sendMode === "schedule"
                    ? "Scheduling…"
                    : "Sending…"
                  : sendMode === "schedule"
                    ? "Schedule"
                    : "Send notification"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}