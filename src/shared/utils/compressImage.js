const COMPRESSION_SIZE_THRESHOLD = 512 * 1024;

const getImageDimensions = async (file) => {
    const bytes = new Uint8Array(await file.arrayBuffer());

    if (
        bytes.length >= 24 &&
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47
    ) {
        const view = new DataView(bytes.buffer);
        return {
            width: view.getUint32(16),
            height: view.getUint32(20),
        };
    }

    if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
        let offset = 2;

        while (offset + 8 < bytes.length) {
            if (bytes[offset] !== 0xff) {
                offset += 1;
                continue;
            }

            while (bytes[offset] === 0xff) offset += 1;
            const marker = bytes[offset];
            offset += 1;

            if (marker === 0xd8 || marker === 0xd9) continue;

            const segmentLength = (bytes[offset] << 8) | bytes[offset + 1];
            if (segmentLength < 2 || offset + segmentLength > bytes.length) break;

            const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
            if (isStartOfFrame) {
                return {
                    height: (bytes[offset + 3] << 8) | bytes[offset + 4],
                    width: (bytes[offset + 5] << 8) | bytes[offset + 6],
                };
            }

            offset += segmentLength;
        }
    }

    if (
        bytes.length >= 30 &&
        String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
        String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    ) {
        let offset = 12;

        while (offset + 8 <= bytes.length) {
            const chunk = String.fromCharCode(...bytes.slice(offset, offset + 4));
            const chunkSize = new DataView(bytes.buffer, bytes.byteOffset + offset + 4, 4).getUint32(0, true);
            const dataOffset = offset + 8;

            if (chunk === "VP8X" && dataOffset + 10 <= bytes.length) {
                return {
                    width: 1 + bytes[dataOffset + 4] + (bytes[dataOffset + 5] << 8) + (bytes[dataOffset + 6] << 16),
                    height: 1 + bytes[dataOffset + 7] + (bytes[dataOffset + 8] << 8) + (bytes[dataOffset + 9] << 16),
                };
            }

            if (chunk === "VP8 " && dataOffset + 10 <= bytes.length) {
                return {
                    width: (bytes[dataOffset + 6] | (bytes[dataOffset + 7] << 8)) & 0x3fff,
                    height: (bytes[dataOffset + 8] | (bytes[dataOffset + 9] << 8)) & 0x3fff,
                };
            }

            if (chunk === "VP8L" && dataOffset + 5 <= bytes.length && bytes[dataOffset] === 0x2f) {
                return {
                    width: 1 + bytes[dataOffset + 1] + ((bytes[dataOffset + 2] & 0x3f) << 8),
                    height: 1 + (bytes[dataOffset + 2] >> 6) + (bytes[dataOffset + 3] << 2) + ((bytes[dataOffset + 4] & 0x0f) << 10),
                };
            }

            offset = dataOffset + chunkSize + (chunkSize % 2);
        }
    }

    return null;
};

export const compressImage = async (file, {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    mimeType = "image/webp",
} = {}) => {
    if (!file.type.startsWith("image/")) {
        return file;
    }

    try {
        const dimensions = await getImageDimensions(file);
        const needsResize = dimensions && (dimensions.width > maxWidth || dimensions.height > maxHeight);
        const needsSizeCompression = file.type !== "image/webp" && file.size > COMPRESSION_SIZE_THRESHOLD;

        if (dimensions && !needsResize && !needsSizeCompression) {
            return file;
        }

        const bitmap = await createImageBitmap(file);
        const { width, height } = bitmap;
        const resizeRequired = width > maxWidth || height > maxHeight;

        if (!resizeRequired && (file.type === "image/webp" || file.size <= COMPRESSION_SIZE_THRESHOLD)) {
            bitmap.close();
            return file;
        }

        const targetRatio = resizeRequired
            ? Math.min(maxWidth / width, maxHeight / height)
            : 1;
        const targetWidth = Math.round(width * targetRatio);
        const targetHeight = Math.round(height * targetRatio);

        let currentCanvas = document.createElement("canvas");
        currentCanvas.width = width;
        currentCanvas.height = height;

        const ctx0 = currentCanvas.getContext("2d");
        ctx0.imageSmoothingEnabled = true;
        ctx0.imageSmoothingQuality = "high";
        ctx0.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        let currentWidth = width;
        let currentHeight = height;

        while (currentWidth * 0.5 > targetWidth) {
            const nextWidth = Math.round(currentWidth * 0.5);
            const nextHeight = Math.round(currentHeight * 0.5);

            const nextCanvas = document.createElement("canvas");
            nextCanvas.width = nextWidth;
            nextCanvas.height = nextHeight;

            const ctx = nextCanvas.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(currentCanvas, 0, 0, nextWidth, nextHeight);

            currentCanvas = nextCanvas;
            currentWidth = nextWidth;
            currentHeight = nextHeight;
        }

        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = targetWidth;
        finalCanvas.height = targetHeight;

        const finalCtx = finalCanvas.getContext("2d");
        finalCtx.imageSmoothingEnabled = true;
        finalCtx.imageSmoothingQuality = "high";
        finalCtx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);

        const blob = await new Promise((resolve, reject) => {
            finalCanvas.toBlob(
                (b) => (b ? resolve(b) : reject(new Error("Compression failed"))),
                mimeType,
                quality
            );
        });

        const ext = mimeType.split("/")[1];
        const newName = file.name.replace(/\.[^/.]+$/, `.${ext}`);
        const compressedFile = new File([blob], newName, {
            type: mimeType,
            lastModified: Date.now(),
        });

        return compressedFile.size < file.size ? compressedFile : file;
    } catch {
        return file;
    }
};
