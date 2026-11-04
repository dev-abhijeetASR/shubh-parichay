/**
 * Optimizes an uploaded image file using Canvas:
 * - Scales down large images (e.g. 12MP/48MP smartphone photos) to max 1200x1500px
 * - Compresses to a clean, high-quality JPEG Data URL (~150KB instead of 5-15MB)
 * - Ensures instant decoding, smooth localStorage persistence, and flawless PDF printing
 */
export function optimizeImageFile(file, maxWidth = 1200, maxHeight = 1500, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        // Fallback to raw data URL if image loading fails
        resolve(e.target.result);
      };
      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale down if dimensions exceed bounds
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(optimizedDataUrl);
        } catch {
          // Fallback to original data URL if canvas throws
          resolve(e.target.result);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
