export const compressImage = async (file, {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.75,
    mimeType = "image/webp",
} = {}) => {
    if (!file.type.startsWith("image/")) {
        return file;
    }


    const bitmap = await createImageBitmap(file);

    let { width, height } = bitmap;

    if (width <= maxWidth && height <= maxHeight) {

        bitmap.close();
        return file;
    }

    const targetRatio = Math.min(maxWidth / width, maxHeight / height);
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

    return new File([blob], newName, {
        type: mimeType,
        lastModified: Date.now(),
    });
};

export const prepareUploadFile = async (file, options = {}) => {
    if (!file?.type.startsWith("image/")) {
        return file;
    }

    const compressed = await compressImage(file, options);

    return compressed.size < file.size ? compressed : file;
};