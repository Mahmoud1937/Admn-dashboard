import ImageUploadField from "../../../shared/components/ImageUploadField";
import useProviderDetailsText from "../../../localization/useProviderDetailsText";

function ProviderLogoUpload({
  currentImageUrl,
  selectedFile,
  onImageChange,
  disabled,
  error,
}) {
  const tr = useProviderDetailsText();
  return (
    <div className="mb-6">
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {tr("Provider Logo")} <span className="text-red-500">*</span>
      </label>

      <ImageUploadField
        preview={currentImageUrl}
        onImageChange={onImageChange}
        label={tr(selectedFile ? "Change Logo" : "Upload Logo")}
        alt={tr("Provider Logo")}
        error={error}
        disabled={disabled}
        labels={{
          formats: tr("PNG, JPEG, or WebP"),
          processing: tr("Processing..."),
          compressing: tr("Compressing image..."),
          dragAndDrop: tr("or drag and drop an image here"),
          formatsOnly: (formats) => tr("{{formats}} only", { formats }),
          dropError: (formats) => tr("Please drop an image file ({{formats}})", { formats }),
        }}
      />
    </div>
  );
}

export default ProviderLogoUpload;
