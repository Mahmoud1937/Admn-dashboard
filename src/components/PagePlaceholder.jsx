const PagePlaceholder = ({ title, description }) => (
  <div>
    <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
    {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    <div className="mt-6 grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white py-24 text-sm text-slate-400">
      {title} page coming soon
    </div>
  </div>
);

export default PagePlaceholder;
