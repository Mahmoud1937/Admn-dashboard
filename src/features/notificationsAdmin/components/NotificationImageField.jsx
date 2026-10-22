import { useEffect, useRef, useState } from "react";
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
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const previewUrl = value instanceof File ? preview : currentImageUrl;

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
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">Image (optional)</label>
      <input
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        ref={(element) => {
          fileInputRef.current = element;
          inputRef?.(element);
        }}
        onBlur={onBlur}
        onChange={(event) => changeImage(event.target.files?.[0] ?? null)}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-help ${id}-error` : `${id}-help`}
        className="block w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-medium file:text-blue-900 hover:file:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <p id={`${id}-help`} className="text-xs text-gray-500">JPG, PNG, or WebP. Maximum 5 MB.</p>
      {currentImageUrl && <p className="text-xs text-gray-500">Choose a new image to replace the current one. Leave empty to keep it.</p>}
      {error && <p id={`${id}-error`} role="alert" className="text-xs text-red-600">{error}</p>}
      {previewUrl && <img src={previewUrl} alt="Notification image preview" className="max-h-40 rounded-xl border border-gray-200 object-contain" />}
      {value && (
        <button type="button" onClick={() => changeImage(null)} disabled={disabled} className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50">
          {currentImageUrl ? "Cancel replacement" : "Remove image"}
        </button>
      )}
    </div>
  );
}
