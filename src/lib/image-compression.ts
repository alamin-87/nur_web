/**
 * Client-side image optimization and compression utility.
 * Optimizes images before upload to prevent HTTP 413 (Payload Too Large) errors
 * while preserving high visual quality for logos, products, and QR codes.
 */

export async function compressImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<File> {
  // If not an image or is SVG/GIF, return as is
  if (!file.type.startsWith("image/") || file.type.includes("svg") || file.type.includes("gif")) {
    return file;
  }

  // If already under 150KB, no need to compress
  if (file.size <= 150 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        let { width, height } = img;

        // Calculate scaled dimensions
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP or JPEG
        const targetType = file.type === "image/png" ? "image/webp" : (file.type || "image/jpeg");

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file); // If compressed is not smaller, keep original
              return;
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const compressedFile = new File([blob], cleanName, {
              type: blob.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          targetType,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    } catch {
      resolve(file);
    }
  });
}
