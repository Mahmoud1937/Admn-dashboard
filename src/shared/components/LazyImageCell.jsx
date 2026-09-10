import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

export default function LazyImageCell({
    url,
    label,
    onPreview,
    size = "h-14 w-24",
}) {
    const [loaded, setLoaded] = useState(false);

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
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onPreview?.(url, label);
            }}
            className={`group relative ${size} overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-gray-100`}
            title="Click to preview"
        >
            {!loaded && <span className="absolute inset-0 animate-pulse bg-gray-200" />}

            <img
                src={url}
                alt={label}
                loading="lazy"
                decoding="async"
                onLoad={() => setLoaded(true)}
                className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-110 ${
                    loaded ? "opacity-100" : "opacity-0"
                }`}
                onError={(e) => {
                    e.currentTarget.style.display = "none";
                    setLoaded(true);
                }}
            />

            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </button>
    );
}