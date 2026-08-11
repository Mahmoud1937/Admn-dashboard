
export default function ScrollableTable({ children, maxHeight = "60vh", className = "" }) {
  return (
    <div className={`overflow-y-auto custom-scrollbar ${className}`} style={{ maxHeight }}>
      {children}
    </div>
  );
}