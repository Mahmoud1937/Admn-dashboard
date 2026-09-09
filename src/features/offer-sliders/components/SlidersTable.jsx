import { useState } from "react";
import {
    faTrash,
    faImage,
    faPen,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TableEmptyState from "../../../shared/components/TableEmptyState";

const ImageCell = ({ url, label, onPreview }) => {
    if (!url) {
        return (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-lg h-14 w-24 justify-center">
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
                onPreview(url, label);
            }}
            className="group relative h-14 w-24 overflow-hidden rounded-lg border border-gray-200 shadow-sm"
            title="Click to preview"
        >
            <img
                src={url}
                alt={label}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
                onError={(e) => {
                    e.currentTarget.style.display = "none";
                }}
            />

            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </button>
    );
};

const formatDate = (dateStr) => {
    if (!dateStr || dateStr.startsWith("0001")) {
        return "-";
    }

    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const ActionButton = ({
    icon,
    onClick,
    title,
    variant,
}) => {
    const colors =
        variant === "danger"
            ? "text-gray-400 hover:text-red-600 hover:bg-red-50"
            : "text-gray-400 hover:text-blue-700 hover:bg-blue-50";

    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`h-8 w-8 inline-flex items-center justify-center rounded-full transition-colors ${colors}`}
        >
            <FontAwesomeIcon icon={icon} className="text-sm" />
        </button>
    );
};

const ImageLightbox = ({ image, onClose }) => {
    if (!image) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-6"
            onClick={onClose}
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 h-9 w-9 inline-flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
                <FontAwesomeIcon icon={faXmark} />
            </button>

            <img
                src={image.url}
                alt={image.label}
                className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />

            <p className="absolute bottom-6 text-sm text-white/80">
                {image.label}
            </p>
        </div>
    );
};

const SlidersTable = ({
    sliders,
    isLoading,
    onView,
    onEdit,
    onDelete,
}) => {
    const [previewImage, setPreviewImage] = useState(null);

    if (isLoading) {
        return (
            <div className="p-10 text-center text-gray-400 text-sm">
                Loading sliders...
            </div>
        );
    }

    if (!sliders?.length) {
        return (
            <TableEmptyState
                icon={faImage}
                title="No sliders found"
                emptyMessage="Get started by adding a new slider."
            />
        );
    }

    return (
        <>
            <div className="overflow-x-auto min-w-0">
                <table className="w-full min-w-[720px] text-sm">
                    <thead>
                        <tr className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            <th className="px-4 py-3 w-10">#</th>
                            <th className="px-4 py-3">EN Image</th>
                            <th className="px-4 py-3">AR Image</th>
                            <th className="px-4 py-3">Provider</th>
                            <th className="px-4 py-3">Created</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {sliders.map((slider, index) => (
                            <tr
                                key={slider.id}
                                onClick={() => onView(slider)}
                                className="group cursor-pointer hover:bg-gray-50/80 transition-colors text-center"
                            >
                                <td className="px-4 py-3 text-gray-400 font-medium">
                                    {index + 1}
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex justify-center">
                                        <ImageCell
                                            url={slider.enImageUrl}
                                            label={`${slider.providerNameEn} - EN`}
                                            onPreview={(url, label) =>
                                                setPreviewImage({ url, label })
                                            }
                                        />
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex justify-center">
                                        <ImageCell
                                            url={slider.arImageUrl}
                                            label={`${slider.providerNameAr} - AR`}
                                            onPreview={(url, label) =>
                                                setPreviewImage({ url, label })
                                            }
                                        />
                                    </div>
                                </td>

                                <td className="px-4 py-3 text-center align-middle">
                                    <div className="flex flex-col items-center justify-center leading-tight">
                                        <p className="font-medium text-gray-900">
                                            {slider.providerNameEn}
                                        </p>

                                        <p
                                            className="mt-0.5 text-xs text-gray-400"
                                            style={{ unicodeBidi: "plaintext" }}
                                        >
                                            {slider.providerNameAr}
                                        </p>
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                        {formatDate(slider.createdAt)}
                                    </span>
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                        <ActionButton
                                            icon={faPen}
                                            title="Edit slider"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(slider);
                                            }}
                                        />

                                        <ActionButton
                                            icon={faTrash}
                                            title="Delete slider"
                                            variant="danger"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(slider);
                                            }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ImageLightbox
                image={previewImage}
                onClose={() => setPreviewImage(null)}
            />
        </>
    );
};

export default SlidersTable;