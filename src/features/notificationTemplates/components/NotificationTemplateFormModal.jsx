import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faPlus,
  faFloppyDisk,
  faImage,
  faTriangleExclamation,
  faWandMagicSparkles,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import TextField from "../../../shared/components/TextField";
import NotificationPreview from "../../../shared/components/NotificationPreview";
import EventBadge from "../../../shared/components/StatusBadge";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import { getApiErrorMessage } from "../../../shared/helpers/apiErrorHandler";
import { NOTIFICATION_EVENTS, resolveNotificationEvent } from "../constants/notificationEvents";
import { notificationTemplateSchema, notificationTemplateUpdateSchema } from "../schema/notificationTemplateSchema";
import { useNotificationTemplateVariablesQuery } from "../hooks/useNotificationTemplatesQuery";
import { SkeletonText } from "../../../shared/components/Skeleton";

// Soft recommendations (push notifications get truncated on devices). Not enforced.
const TITLE_RECOMMENDED = 50;
const MESSAGE_RECOMMENDED = 150;

// "invoiceNumber" / "invoice_number" -> "Invoice Number"
const formatPlaceholderName = (name) =>
  name
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

function TemplateSection({ title, description, children }) {
  return (
    <section>
      <div className="mb-4 flex items-start gap-2.5">
        <span aria-hidden="true" className="mt-0.5 h-8 w-1 shrink-0 rounded-full bg-gradient-to-b from-[#1b4477] to-[#2caba2]" />
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function CharCounter({ id, length, recommended }) {
  const over = length > recommended;
  return (
    <span id={id} className={`text-xs tabular-nums ${over ? "font-medium text-amber-600" : "text-gray-400"}`}>
      {length}/{recommended}
    </span>
  );
}

function PlaceholderChips({ names, onInsert, disabled }) {
  if (names.length === 0) return null;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
        <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[#2caba2]" aria-hidden="true" />
        Insert variable
      </span>
      {names.map((name) => (
        <button
          key={name}
          type="button"
          disabled={disabled}
          onClick={() => onInsert(`{{${name}}}`)}
          title={`Inserts {{${name}}}`}
          aria-label={`Insert variable ${formatPlaceholderName(name)}`}
          className="group inline-flex items-center gap-1 rounded-full border border-[#1b4477]/15 bg-gradient-to-b from-white to-blue-50/60 px-2.5 py-1 text-[11px] font-medium text-[#1b4477] shadow-sm transition-all hover:-translate-y-px hover:border-[#2caba2]/60 hover:from-[#2caba2]/5 hover:to-[#2caba2]/15 hover:text-[#13705f] hover:shadow focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1b4477] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <FontAwesomeIcon icon={faPlus} className="text-[9px] opacity-50 transition-opacity group-hover:opacity-100" aria-hidden="true" />
          {formatPlaceholderName(name)}
        </button>
      ))}
    </div>
  );
}

function ImageUrlPreview({ url }) {
  const [status, setStatus] = useState("loading");
  const trimmed = (url || "").trim();

  if (!/^https?:\/\//i.test(trimmed)) return null;

  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-inset ring-gray-200">
        {status !== "error" ? (
          <img
            src={trimmed}
            alt="Notification image preview"
            onLoad={() => setStatus("ok")}
            onError={() => setStatus("error")}
            className="h-full w-full object-cover"
          />
        ) : (
          <FontAwesomeIcon icon={faImage} className="text-gray-300" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 text-xs">
        {status === "error" ? (
          <p role="alert" className="flex items-center gap-1.5 font-medium text-amber-700">
            <FontAwesomeIcon icon={faTriangleExclamation} aria-hidden="true" />
            Couldn't load this image. Check the URL.
          </p>
        ) : (
          <p className="font-medium text-gray-700">{status === "loading" ? "Loading preview..." : "Image preview"}</p>
        )}
        <p dir="ltr" title={trimmed} className="mt-0.5 truncate text-gray-400">{trimmed}</p>
      </div>
    </div>
  );
}

export default function NotificationTemplateFormModal({ template, mutation, onSave, onClose }) {
  const isEditing = Boolean(template);
  const { register, handleSubmit, control, setError, clearErrors, setValue, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(isEditing ? notificationTemplateUpdateSchema : notificationTemplateSchema),
    defaultValues: {
      notificationEvent: "",
      title: template?.title ?? "",
      imageUrl: null,
      messageAr: template?.messageAr ?? "",
      messageEn: template?.messageEn ?? "",
    },
  });
  const [title, messageAr, messageEn, notificationEvent, imageUrl] = useWatch({ control, name: ["title", "messageAr", "messageEn", "notificationEvent", "imageUrl"] });
  const variablesQuery = useNotificationTemplateVariablesQuery();

  // In edit mode the event comes from the template; in create mode from the select.
  const event = resolveNotificationEvent(isEditing ? template?.notificationEvent : notificationEvent);
  const eventVariables = variablesQuery.data?.data?.[event?.variablesKey];
  const placeholders = variablesQuery.isSuccess && Array.isArray(eventVariables)
    ? eventVariables.filter((name) => typeof name === "string" && name.length > 0)
    : [];

  const arRegister = register("messageAr");
  const enRegister = register("messageEn");
  const textareaRefs = useRef({ messageAr: null, messageEn: null });
  const imageInputRef = useRef(null);
  const imagePreviewRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const imageRemoved = imageUrl === "";
  const previewUrl = imageRemoved ? null : imagePreview ?? template?.imageUrl ?? null;

  useEffect(() => () => {
    if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current);
  }, []);

  const handleImageChange = (file, onChange) => {
    if (mutation.isPending) return;
    onChange(file);
    const imageSchema = isEditing ? notificationTemplateUpdateSchema.shape.imageUrl : notificationTemplateSchema.shape.imageUrl;
    const result = imageSchema.safeParse(file);
    if (result.success) clearErrors("imageUrl");
    else setError("imageUrl", { type: "validate", message: result.error.issues[0]?.message });

    if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current);
    const preview = result.success && file ? URL.createObjectURL(file) : null;
    imagePreviewRef.current = preview;
    setImagePreview(preview);
    if (!file && imageInputRef.current) imageInputRef.current.value = "";
  };

  useEffect(() => {
    const serverErrors = mutation.error?.response?.data?.errors;
    if (mutation.isError && serverErrors && !Array.isArray(serverErrors) && typeof serverErrors === "object") {
      applyServerErrors(serverErrors, setError);
    }
  }, [mutation.error, mutation.isError, setError]);

  const requestClose = () => {
    if (!mutation.isPending) onClose();
  };

  // Insert a placeholder at the caret position of the given message field.
  const insertPlaceholder = (field, text) => {
    const el = textareaRefs.current[field];
    const current = getValues(field) ?? "";
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    const next = current.slice(0, start) + text + current.slice(end);
    setValue(field, next, { shouldDirty: true, shouldValidate: true });
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const caret = start + text.length;
      el.setSelectionRange(caret, caret);
    });
  };

  return (
    <FormModalShell
      title={
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1b4477] text-white shadow-lg shadow-blue-900/20">
            <FontAwesomeIcon icon={faBell} />
          </span>
          {isEditing ? "Edit notification template" : "Add notification template"}
        </span>
      }
      description={isEditing ? "Update the content of this notification template." : "Create reusable Arabic and English notification content."}
      titleId="notification-template-form-title"
      closeLabel="Close notification template form"
      onClose={requestClose}
      onSubmit={handleSubmit(onSave)}
      isSaving={mutation.isPending}
      className="relative flex max-h-[92vh] max-w-5xl flex-col overflow-hidden rounded-2xl"
      formClassName="flex min-h-0 flex-1 flex-col"
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1b4477] via-blue-500 to-[#2caba2]" />
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 overflow-y-auto pb-6 lg:grid-cols-[minmax(0,1fr)_310px]">
        <fieldset disabled={mutation.isPending} aria-busy={mutation.isPending} className="min-w-0 space-y-6">
          <TemplateSection title="Content" description={isEditing ? "Update the messages users will see for this event." : "Choose an event and write the messages users will see."}>
            <div className="space-y-4">
              {isEditing ? (
                <div>
                  <p className="mb-1.5 text-sm font-medium text-slate-700">Notification event</p>
                  <EventBadge tone={event?.tone} className="gap-1.5">
                    {event?.icon && <FontAwesomeIcon icon={event.icon} aria-hidden="true" />}
                    {event?.label ?? template.notificationEvent ?? "—"}
                  </EventBadge>
                </div>
              ) : (
                <div>
                  <label htmlFor="template-notification-event" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Notification event <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="template-notification-event"
                    {...register("notificationEvent")}
                    aria-invalid={Boolean(errors.notificationEvent)}
                    aria-describedby={errors.notificationEvent ? "template-event-error" : undefined}
                    className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#1b4477] focus:ring-2 focus:ring-[#1b4477]/15 ${errors.notificationEvent ? "border-red-400" : "border-gray-300"}`}
                  >
                    <option value="">Select event</option>
                    {NOTIFICATION_EVENTS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  {event && (
                    <div className="mt-2">
                      <EventBadge tone={event.tone} className="gap-1.5">
                        <FontAwesomeIcon icon={event.icon} aria-hidden="true" />
                        {event.label}
                      </EventBadge>
                    </div>
                  )}
                  {errors.notificationEvent && <p id="template-event-error" role="alert" className="mt-1 text-xs text-red-500">{errors.notificationEvent.message}</p>}
                </div>
              )}

              <div>
                <TextField label="Title" required sanitize={false} maxLength={null} placeholder="e.g. Invoice used successfully" {...register("title")} error={errors.title?.message} />
                <div className="mt-1 flex justify-end">
                  <CharCounter id="template-title-count" length={(title ?? "").length} recommended={TITLE_RECOMMENDED} />
                </div>
              </div>

              {!event ? (
                <p role="status" className="text-xs text-gray-500">
                  {isEditing ? "Placeholder suggestions are unavailable for this event." : "Select an event to see available placeholders."}
                </p>
              ) : variablesQuery.isPending ? (
                <SkeletonText label="Loading placeholders..." lines={1} className="max-w-sm space-y-2" />
              ) : variablesQuery.isError ? (
                <div role="alert" className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <p>{getApiErrorMessage(variablesQuery.error, { details: true, fallback: "Unable to load placeholders." })}</p>
                  <button
                    type="button"
                    onClick={() => variablesQuery.refetch()}
                    disabled={variablesQuery.isFetching || mutation.isPending}
                    className="font-medium underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Retry variables
                  </button>
                </div>
              ) : placeholders.length === 0 ? (
                <p role="status" className="text-xs text-gray-500">No placeholders are available for this event.</p>
              ) : null}

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div>
                  <label htmlFor="template-message-ar" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Arabic message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="template-message-ar"
                    {...arRegister}
                    ref={(el) => {
                      arRegister.ref(el);
                      textareaRefs.current.messageAr = el;
                    }}
                    dir="ltr"
                    lang="ar"
                    rows={5}
                    placeholder="Write the Arabic message..."
                    aria-invalid={Boolean(errors.messageAr)}
                    aria-describedby={errors.messageAr ? "template-message-ar-error" : undefined}
                    className={`w-full resize-y rounded-lg border border-r-4 border-r-[#2caba2] bg-white px-3 py-2.5 text-sm leading-relaxed text-gray-800 outline-none focus:border-[#2caba2] focus:ring-2 focus:ring-[#2caba2]/20 ${errors.messageAr ? "border-red-400" : "border-gray-300"}`}
                  />
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <PlaceholderChips names={placeholders} onInsert={(text) => insertPlaceholder("messageAr", text)} disabled={mutation.isPending} />
                    <CharCounter id="template-message-ar-count" length={(messageAr ?? "").length} recommended={MESSAGE_RECOMMENDED} />
                  </div>
                  {errors.messageAr && <p id="template-message-ar-error" role="alert" className="mt-1 text-xs text-red-500">{errors.messageAr.message}</p>}
                </div>

                <div>
                  <label htmlFor="template-message-en" className="mb-1.5 block text-sm font-medium text-slate-700">
                    English message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="template-message-en"
                    {...enRegister}
                    ref={(el) => {
                      enRegister.ref(el);
                      textareaRefs.current.messageEn = el;
                    }}
                    dir="ltr"
                    lang="en"
                    rows={5}
                    placeholder="Write the English message..."
                    aria-invalid={Boolean(errors.messageEn)}
                    aria-describedby={errors.messageEn ? "template-message-en-error" : undefined}
                    className={`w-full resize-y rounded-lg border border-l-4 border-l-[#1b4477] bg-white px-3 py-2.5 text-sm leading-relaxed text-gray-800 outline-none focus:border-[#1b4477] focus:ring-2 focus:ring-[#1b4477]/15 ${errors.messageEn ? "border-red-400" : "border-gray-300"}`}
                  />
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <PlaceholderChips names={placeholders} onInsert={(text) => insertPlaceholder("messageEn", text)} disabled={mutation.isPending} />
                    <CharCounter id="template-message-en-count" length={(messageEn ?? "").length} recommended={MESSAGE_RECOMMENDED} />
                  </div>
                  {errors.messageEn && <p id="template-message-en-error" role="alert" className="mt-1 text-xs text-red-500">{errors.messageEn.message}</p>}
                </div>
              </div>
              <p className="text-xs leading-relaxed text-gray-500">
                Available placeholders are replaced with real values when the notification is sent. The character counts are recommendations; longer text may be truncated on some devices.
              </p>
            </div>
          </TemplateSection>
          <TemplateSection title="Media" description="Optionally include an image with the notification.">
            <Controller
              name="imageUrl"
              control={control}
              render={({ field }) => (
                <div className="space-y-3">
                  <label htmlFor="template-image-file" className="block text-sm font-medium text-slate-700">Image (optional)</label>
                  <input
                    id="template-image-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    name={field.name}
                    ref={(element) => {
                      field.ref(element);
                      imageInputRef.current = element;
                    }}
                    onBlur={field.onBlur}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) handleImageChange(file, field.onChange);
                    }}
                    disabled={mutation.isPending}
                    aria-invalid={Boolean(errors.imageUrl)}
                    aria-describedby={errors.imageUrl ? "template-image-help template-image-error" : "template-image-help"}
                    className="block w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-medium file:text-blue-900 hover:file:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <p id="template-image-help" className="text-xs text-gray-500">JPG, PNG, or WebP. Maximum 5 MB.</p>
                  {template?.imageUrl && !imageRemoved && <p className="text-xs text-gray-500">Choose a new image to replace the current one, or remove it below.</p>}
                  {imageRemoved && <p role="status" className="text-xs text-gray-500">Image removed from this form.</p>}
                  {errors.imageUrl && <p id="template-image-error" role="alert" className="text-xs text-red-600">{errors.imageUrl.message}</p>}
                  {imagePreview ? (
                    <img src={imagePreview} alt="Notification image preview" className="max-h-40 rounded-xl border border-gray-200 object-contain" />
                  ) : template?.imageUrl && !imageRemoved ? (
                    <ImageUrlPreview key={template.imageUrl} url={template.imageUrl} />
                  ) : null}
                  <div className="flex flex-wrap items-center gap-3">
                    {(field.value || (template?.imageUrl && !imageRemoved)) && (
                      <button type="button" onClick={() => handleImageChange(template?.imageUrl ? "" : null, field.onChange)} disabled={mutation.isPending} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50">
                        <FontAwesomeIcon icon={faTrashCan} aria-hidden="true" />
                        Remove image
                      </button>
                    )}
                    {template?.imageUrl && (field.value || imageRemoved) && (
                      <button type="button" onClick={() => handleImageChange(null, field.onChange)} disabled={mutation.isPending} className="text-xs font-medium text-slate-600 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                        {imageRemoved ? "Undo removal" : "Cancel replacement"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            />
          </TemplateSection>

          {mutation.isError && (
            <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              {getApiErrorMessage(mutation.error, { details: true, fallback: `Unable to ${isEditing ? "update" : "create"} notification template. Please try again.` })}
            </p>
          )}
        </fieldset>
        <NotificationPreview title={title} messageAr={messageAr} messageEn={messageEn} imageUrl={previewUrl} />
      </div>
      <FormActions
        onCancel={requestClose}
        isSaving={mutation.isPending}
        submitLabel={isEditing ? "Save changes" : "Add template"}
        savingLabel={isEditing ? "Saving..." : "Adding..."}
        submitIcon={isEditing ? faFloppyDisk : faPlus}
        className="-mx-6 -mb-6 flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 bg-gray-50/80 px-6 py-4"
        cancelClassName="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        submitClassName="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#1b4477] to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-blue-950 hover:to-[#1b4477] focus:outline-none focus:ring-2 focus:ring-[#1b4477]/30 disabled:cursor-not-allowed disabled:opacity-70"
      />
    </FormModalShell>
  );
}
