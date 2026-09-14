import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

function getScrollableAncestor(el) {
  let node = el?.parentElement;
  while (node && node !== document.body) {
    const { overflowY, overflow } = window.getComputedStyle(node);
    if (
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflow === "auto" ||
      overflow === "scroll"
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

export default function LazyImageCell({
  url,
  label,
  onPreview,
  size = "h-14 w-24",
  rootMargin = "80px 0px",
}) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!url) return;
    const box = boxRef.current;
    if (!box) return;

    const root = getScrollableAncestor(box) ?? null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          setInView(true);
        }
      },
      { root, rootMargin }
    );

    observer.observe(box);
    return () => observer.disconnect();
  }, [rootMargin, url]);

  if (!url) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-lg ${size} justify-center`}>
        <FontAwesomeIcon icon={faImage} />
        No image
      </span>
    );
  }

  return (
    <button
      ref={boxRef}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onPreview?.(url, label);
      }}
      className={`group relative ${size} overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-gray-100 ${onPreview ? "cursor-pointer" : ""}`}
      style={{ contain: "paint" }}
      title="Click to preview"
    >
      {!loaded && <span className="absolute inset-0 animate-pulse bg-gray-200" />}

      {inView && (
        <img
          src={url}
          alt={label}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-110 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            setLoaded(true);
          }}
        />
      )}

      <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
    </button>
  );
}
