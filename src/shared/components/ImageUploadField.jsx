import AvatarImage from "./AvatarImage";

export default function ImageUploadField({ preview, onImageChange, label = "Upload Logo", alt }) {
  return (
    <div className="mb-4 flex flex-col items-center gap-3">
      <AvatarImage src={preview} alt={alt} size="h-24 w-24" />
      <label className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
        {label}
        <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
      </label>
    </div>
  );
}