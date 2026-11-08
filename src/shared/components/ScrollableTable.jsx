import { useEffect, useLayoutEffect, useRef } from "react";

export default function ScrollableTable({ children, maxHeight = "70vh", className = "" }) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const headers = Array.from(container.querySelectorAll(
      ":scope > table > thead > tr > [data-table-action]"
    ));
    if (headers.length === 0) return;

    // Measure adjacent action columns instead of assuming fixed widths.
    const updateOffsets = () => {
      let offset = 0;
      for (const header of headers.toReversed()) {
        container.style.setProperty(
          `--table-action-${header.dataset.tableAction}-offset`,
          `${offset}px`
        );
        offset += header.getBoundingClientRect().width;
      }
    };

    updateOffsets();
    const observer = new ResizeObserver(updateOffsets);
    headers.forEach((header) => observer.observe(header));
    return () => observer.disconnect();
  }, [children]);

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
      className={`scrollable-table min-w-0 overflow-x-auto overflow-y-auto custom-scrollbar ${className}`}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
}
