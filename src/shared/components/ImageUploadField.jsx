import { useState } from "react";
import AvatarImage from "./AvatarImage";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function validateFile(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Please select a valid image file (PNG, JPG, or WEBP).";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Image size can't exceed 5MB.";
  }
  return "";
}

export default function ImageUploadField({ preview, onImageChange, label = "Upload Logo", alt }) {
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setFileError(error);
      e.target.value = ""; // reset so the same invalid file can be re-selected after a fix
      return;
    }

    setFileError("");
    onImageChange(e);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setFileError(error);
      return;
    }

    setFileError("");
    // Reuse the same handler contract as the file input: an event-like
    // object exposing target.files, so the parent's onImageChange doesn't
    // need to know whether the image came from a click or a drop.
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
    // Required to allow dropping; without preventDefault the browser
    // rejects the drop and opens the file in a new tab instead.
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
            onChange={handleChange}
            className="hidden"
          />
        </label>
        <p className="text-[11px] text-slate-400">or drag and drop an image here</p>
      </div>
      {fileError && <p className="text-xs text-red-500">{fileError}</p>}
    </div>
  );
}