import ImageUploadField from "../../../shared/components/ImageUploadField";

function ProviderLogoUpload({
  currentImageUrl,
  selectedFile,
  onImageChange,
  disabled,
  error,
}) {
  return (
    <div className="mb-6">
      <label className="mb-2 block text-sm font-medium text-slate-700">
        Provider Logo <span className="text-red-500">*</span>
      </label>

      <ImageUploadField
        preview={currentImageUrl}
        onImageChange={onImageChange}
        label={selectedFile ? "Change Logo" : "Upload Logo"}
        alt="Provider Logo"
        error={error}
        disabled={disabled}
      />
    </div>
  );
}

export default ProviderLogoUpload;