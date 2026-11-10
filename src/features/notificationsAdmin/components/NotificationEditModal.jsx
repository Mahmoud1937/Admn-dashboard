import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormModalShell from "../../../shared/components/FormModalShell";
import FormActions from "../../../shared/components/FormActions";
import NotificationImageField from "./NotificationImageField";
import {
  toUpdateNotificationPayload,
  updateNotificationSchema,
} from "../schema/notificationSchema";

const fieldClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function Field({ id, label, error, required = false, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function NotificationEditModal({ notification, onClose, onSubmit, isSaving }) {
  const { t } = useTranslation("adminPages");
  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(updateNotificationSchema),
    defaultValues: {
      title: "",
      messageEn: "",
      messageAr: "",
      imageUrl: null,
      durationDay: "",


    },
  });

  useEffect(() => {
    if (!notification) return;
    reset({
      title: notification.title ?? "",
      messageEn: notification.messageEn ?? "",
      messageAr: notification.messageAr ?? "",
      imageUrl: null,

      durationDay: notification.durationDay == null ? "" : String(notification.durationDay),
    });
  }, [notification, reset]);

  if (!notification) return null;

  const submit = handleSubmit((values) => {
    onSubmit({
      notificationId: notification.notificationId,
      ...toUpdateNotificationPayload(values),
    });
  });

  return (
    <FormModalShell title={t("Edit notification")} onClose={onClose} onSubmit={submit} className="max-h-[90vh] max-w-xl overflow-y-auto">
      <div className="space-y-4">
        <Field id="edit-notification-title" label={t("Title")} required error={errors.title?.message}>
          <input id="edit-notification-title" maxLength={100} {...register("title")} className={fieldClassName} />
        </Field>
        <Field id="edit-notification-en" label={t("English message")} required error={errors.messageEn?.message}>
          <textarea id="edit-notification-en" rows={3} maxLength={500} {...register("messageEn")} className={fieldClassName} />
        </Field>
        <Field id="edit-notification-ar" label={t("Arabic message")} required error={errors.messageAr?.message}>
          <textarea id="edit-notification-ar" rows={3} maxLength={500} dir="ltr" {...register("messageAr")} className={fieldClassName} />
        </Field>
        <Controller
          name="imageUrl"
          control={control}
          render={({ field }) => (
            <NotificationImageField
              key={notification.notificationId}
              id="edit-notification-image"
              name={field.name}
              value={field.value}
              inputRef={field.ref}
              onBlur={field.onBlur}
              onChange={(file) => setValue("imageUrl", file, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
              currentImageUrl={notification.imageUrl}
              disabled={isSaving}
              error={errors.imageUrl?.message}
            />
          )}
        />
        <Field id="edit-notification-duration" label={t("Repeat after (days)")} error={errors.durationDay?.message}>
          <input id="edit-notification-duration" type="number" min="1" max="365" step="1" {...register("durationDay")} className={fieldClassName} />
        </Field>
        <FormActions onCancel={onClose} isSaving={isSaving} submitLabel={t("Save changes")} />
      </div>
    </FormModalShell>
  );
}
