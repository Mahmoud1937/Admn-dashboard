import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

function ProviderLogoUpload({
  currentImageUrl,
  currentFileName,
  selectedFile,
  onImageChange,
  disabled,
  error,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (!files?.[0]) return;

    // نبعتها بنفس شكل الـ event اللي بيبعته الـ <input onChange>
    // عشان handleImageChange في الفورم يشتغل زي ما هو من غير أي تعديل
    onImageChange({ target: { files } });
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setDragCounter((prev) => prev + 1);
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const next = prev - 1;
      if (next <= 0) setIsDragging(false);
      return next;
    });
  };

  const handleDragOver = (e) => {
    // لازم عشان المتصفح يسمح بالـ drop، من غيرها الـ drop بيتلغي
    // والملف بيتفتح في تاب جديد بدل ما يتحمل
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="mb-6">
      <label className="mb-2 block text-sm font-medium text-slate-700">
        Provider Logo <span className="text-red-500">*</span>
      </label>

      <label
        htmlFor="logo-upload"
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        className={`flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition
          ${isDragging
            ? "border-blue-400 bg-blue-50"
            : currentImageUrl
              ? "border-blue-300 bg-blue-50"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100"
          }
          ${disabled ? "cursor-not-allowed opacity-60" : ""}
        `}
      >
        {currentImageUrl ? (
          <>
            <img
              src={currentImageUrl}
              alt="Provider Logo"
              className="mb-3 h-24 w-24 rounded-lg border bg-white p-2 object-contain"
            />

            <p className="text-sm font-medium text-slate-700">
              {currentFileName || "Current Logo"}
            </p>

            {selectedFile && (
              <p className="mt-1 text-xs text-slate-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            )}

            <span className="mt-3 rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white">
              Change Image
            </span>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faImage} className="mb-3 text-3xl text-slate-400" />

            <p className="text-sm text-slate-600">
              <span className="font-semibold">Click to upload</span> or drag & drop
            </p>

            <p className="mt-1 text-xs text-slate-400">PNG, JPG (Max 5MB)</p>
          </>
        )}
      </label>

      <input
        id="logo-upload"
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={onImageChange}
        disabled={disabled}
      />

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default ProviderLogoUpload;