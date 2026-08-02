export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
}

export async function validateImageFile(
  file: File,
  options: {
    maxSizeBytes?: number;
    minWidth?: number;
    minHeight?: number;
    allowedTypes?: string[];
  } = {}
): Promise<ImageValidationResult> {
  const maxSizeBytes = options.maxSizeBytes ?? 5 * 1024 * 1024; // 5MB default
  const minWidth = options.minWidth ?? 600;
  const minHeight = options.minHeight ?? 400;
  const allowedTypes = options.allowedTypes ?? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported image format (${file.type || 'unknown'}). Please upload JPEG, PNG, or WEBP.`,
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Image file size (${sizeMb} MB) exceeds maximum allowed size of ${maxMb} MB.`,
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          valid: false,
          error: `Image resolution (${img.width}x${img.height}px) is below minimum required quality (${minWidth}x${minHeight}px).`,
          width: img.width,
          height: img.height,
        });
      } else {
        resolve({
          valid: true,
          width: img.width,
          height: img.height,
        });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        error: 'Failed to read image file. File may be corrupted or invalid.',
      });
    };

    img.src = url;
  });
}
