export default function ProviderAttachmentFileInput({
  className,
  dimDisabled = true,
  ...props
}) {
  const inputClassName = className ?? "block w-full rounded-lg border border-slate-200 bg-white text-sm text-slate-600 file:mr-3 file:cursor-pointer file:border-0 file:bg-blue-50 file:px-3 file:py-2.5 file:font-medium file:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
    + (dimDisabled ? " disabled:opacity-50" : "");
  return <input type="file" className={inputClassName} {...props} />;
}
