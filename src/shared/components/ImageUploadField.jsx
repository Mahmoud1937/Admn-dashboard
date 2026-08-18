import { useState } from "react";
import AvatarImage from "./AvatarImage";

export default function ImageUploadField({
  preview,
  onImageChange,
  label = "Upload Logo",
  alt,
  error,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    onImageChange({ target: { files: e.dataTransfer.files } });
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
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

  return (
    <div className="mb-4 flex flex-col items-center gap-3">
      <div
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-4 transition-colors ${
          isDragging ? "border-blue-400 bg-blue-50" : "border-transparent"
        }`}
      >
        <AvatarImage src={preview} alt={alt} size="h-24 w-24" />
        <label className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
          {label}
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={onImageChange}
            className="hidden"
          />
        </label>
        <p className="text-[11px] text-slate-400">or drag and drop an image here</p>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}