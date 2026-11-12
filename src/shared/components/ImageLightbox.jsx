import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import localizeMessage from "../../localization/localizeMessage";

const ImageLightbox = ({ image, onClose, closeLabel = "Close image preview" }) => {
    useTranslation("common");
    if (!image) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[60] flex cursor-pointer items-center justify-center bg-black/70 p-6"
            onClick={onClose}
        >
            <button
                type="button"
                onClick={onClose}
                aria-label={localizeMessage(closeLabel)}
                className="absolute top-5 end-5 h-9 w-9 inline-flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
                <FontAwesomeIcon icon={faXmark} />
            </button>

            <img
                src={image.url}
                alt={image.label}
                className="max-h-[80vh] max-w-[90vw] cursor-default rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />

            <p className="absolute bottom-6 text-sm text-white/80">
                {image.label}
            </p>
        </div>
    );
};

export default ImageLightbox;
