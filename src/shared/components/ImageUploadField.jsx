import { useState } from "react";
import AvatarImage from "./AvatarImage";
import { compressImage } from "../utils/compressImage";

export default function ImageUploadField({
  preview,
  onImageChange,
  label = "Upload Logo",
  alt,
  error,
  disabled = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [, setDragCounter] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [dropError, setDropError] = useState(null);

  const processFile = async (file) => {
    if (!file) return;

    setIsCompressing(true);

    try {
      const compressed = await compressImage(file);
      const finalFile = compressed.size < file.size ? compressed : file;

      const dt = new DataTransfer();
      dt.items.add(finalFile);

      onImageChange({ target: { files: dt.files } });
    } catch (err) {
      console.error("Image compression failed, using original file:", err);
      const dt = new DataTransfer();
      dt.items.add(file);
      onImageChange({ target: { files: dt.files } });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setDropError("Please drop an image file (PNG, JPEG, or WebP)");
      return;
    }

    setDropError(null);
    processFile(file);
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
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDropError(null);
    processFile(file);
  };

  return (
    <div className="mb-4 flex flex-col items-center gap-3">
      <div
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-4 transition-colors
          ${isDragging ? "border-blue-400 bg-blue-50" : "border-transparent"}
          ${disabled || isCompressing ? "cursor-not-allowed opacity-60" : ""}
        `}
      >
        <AvatarImage src={preview} alt={alt} size="h-24 w-24" />

        <label
          className={`rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600
            ${disabled || isCompressing ? "cursor-not-allowed" : "cursor-pointer hover:bg-slate-50"}
          `}
        >
          {isCompressing ? "Processing..." : label}
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileInputChange}
            disabled={disabled || isCompressing}
            className="hidden"
          />
        </label>

        <p className="text-[11px] text-slate-400">
          {isCompressing ? "Compressing image..." : "or drag and drop an image here"}
        </p>
      </div>

      {dropError && <p className="text-xs text-red-500">{dropError}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}