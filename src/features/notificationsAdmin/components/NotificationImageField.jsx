import localizeMessage from "../../../localization/localizeMessage";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { imageFileSchema } from "../../offer-sliders/schema/sliderSchema";

export default function NotificationImageField({
  id,
  name,
  value,
  onChange,
  onBlur,
  inputRef,
  error,
  disabled = false,
  currentImageUrl = null,
  onPreviewChange,
}) {
  const { t } = useTranslation("adminPages");
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const imageRemoved = value === "";
  const previewUrl = imageRemoved ? null : value instanceof File ? preview : currentImageUrl;

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    onPreviewChange?.(null);
  }, [onPreviewChange]);

  useEffect(() => {
    if (!value && fileInputRef.current) fileInputRef.current.value = "";
  }, [value]);

  const changeImage = (file) => {
    if (disabled) return;
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = file && imageFileSchema.safeParse(file).success ? URL.createObjectURL(file) : null;
    previewRef.current = url;
    setPreview(url);
    onPreviewChange?.(url);
    onChange(file);
    if (!file && fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">{t("Image (optional)")}</label>
      <input
        id={id}
        name={name}
        type="file"
        aria-label={t("Choose Image")}
        accept="image/jpeg,image/png,image/webp"
        ref={(element) => {
          fileInputRef.current = element;
          inputRef?.(element);
        }}
        onBlur={onBlur}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) changeImage(file);
        }}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-help ${id}-error` : `${id}-help`}
        className="peer sr-only"
      />
      <label htmlFor={id} className={`flex items-center gap-3 rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-700 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
        <span className="shrink-0 rounded-md bg-blue-50 px-3 py-2 font-medium text-blue-900">{t("Choose Image")}</span>
        <span dir="auto" className="truncate">{value instanceof File ? value.name : t("No file chosen")}</span>
      </label>
      <p id={`${id}-help`} className="text-xs text-gray-500">{t("JPG, PNG, or WebP. Maximum 5 MB.")}</p>
      {currentImageUrl && !imageRemoved && <p className="text-xs text-gray-500">{t("Choose a new image to replace the current one, or remove it below.")}</p>}
      {imageRemoved && <p role="status" className="text-xs text-gray-500">{t("Image removed from this form.")}</p>}
      {error && <p id={`${id}-error`} role="alert" className="text-xs text-red-600">{localizeMessage(error)}</p>}
      {previewUrl && <img src={previewUrl} alt={t("Notification image preview")} className="max-h-40 rounded-xl border border-gray-200 object-contain" />}
      <div className="flex flex-wrap items-center gap-3">
        {(value || (currentImageUrl && !imageRemoved)) && (
          <button type="button" onClick={() => changeImage(currentImageUrl ? "" : null)} disabled={disabled} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50">
            <FontAwesomeIcon icon={faTrashCan} aria-hidden="true" />
            {t("Remove image")}
          </button>
        )}
        {currentImageUrl && (value || imageRemoved) && (
          <button type="button" onClick={() => changeImage(null)} disabled={disabled} className="text-xs font-medium text-slate-600 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
            {imageRemoved ? t("Undo removal") : t("Cancel replacement")}
          </button>
        )}
      </div>
    </div>
  );
}
