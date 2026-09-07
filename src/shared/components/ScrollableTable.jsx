import { useEffect, useRef } from "react";

export default function ScrollableTable({ children, maxHeight = "60vh", className = "" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const resetScroll = () => {
      if (containerRef.current) containerRef.current.scrollTop = 0;
    };
    window.addEventListener("table:pagination-change", resetScroll);
    return () => window.removeEventListener("table:pagination-change", resetScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-x-auto overflow-y-auto custom-scrollbar ${className}`}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
}