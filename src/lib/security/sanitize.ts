// Filename sanitization
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'file.bin';
  }

  // Remove null bytes and control characters
  let clean = filename.replace(/\0/g, '').replace(/[\x00-\x1f\x7f]/g, '');

  // Remove path separators and traversal patterns
  clean = clean.replace(/[\/\\]/g, '_').replace(/\.{2,}/g, '.');

  // Replace characters not safe in filenames across OSes
  clean = clean.replace(/[:*?"<>|]/g, '_').trim();

  // Separate base name and extension
  const lastDotIndex = clean.lastIndexOf('.');
  let baseName = '';
  let ext = '';

  if (lastDotIndex > 0 && lastDotIndex < clean.length - 1) {
    baseName = clean.slice(0, lastDotIndex);
    ext = clean.slice(lastDotIndex).toLowerCase();
  } else if (lastDotIndex === 0) {
    baseName = 'file';
    ext = clean.toLowerCase();
  } else {
    baseName = clean;
    ext = '.bin';
  }

  // Fallback if baseName became empty
  baseName = baseName.trim().replace(/^\.+/, '') || 'file';

  // Limit max length to 255 chars including extension
  const maxBaseLength = Math.max(1, 255 - ext.length);
  if (baseName.length > maxBaseLength) {
    baseName = baseName.slice(0, maxBaseLength);
  }

  return `${baseName}${ext}`;
}

// URL validation for SSRF prevention
export function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost and loopbacks
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return false;
    }

    // Block unrouted / any address
    if (hostname === '0.0.0.0') {
      return false;
    }

    // Block private IPv4 ranges:
    // 10.0.0.0/8
    if (hostname.startsWith('10.')) {
      return false;
    }

    // 192.168.0.0/16
    if (hostname.startsWith('192.168.')) {
      return false;
    }

    // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
    if (hostname.startsWith('172.')) {
      const parts = hostname.split('.');
      if (parts.length === 4) {
        const second = parseInt(parts[1], 10);
        if (!isNaN(second) && second >= 16 && second <= 31) {
          return false;
        }
      }
    }

    // Link-local / metadata endpoints (169.254.0.0/16)
    if (hostname.startsWith('169.254.') || hostname === '169.254.169.254') {
      return false;
    }

    // Block IPv6 private and link-local ranges
    if (
      hostname.startsWith('fc') ||
      hostname.startsWith('fd') ||
      hostname.startsWith('fe80:') ||
      hostname === '[::1]'
    ) {
      return false;
    }

    // Block internal and local top-level domains
    if (
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.lan')
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// Allowed file types
export const ALLOWED_FILE_TYPES: Record<
  string,
  { mimeTypes: string[]; maxSize: number; extensions: string[] }
> = {
  image: {
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    maxSize: 10 * 1024 * 1024, // 10MB
    extensions: ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
  },
  document: {
    mimeTypes: [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSize: 25 * 1024 * 1024, // 25MB
    extensions: ['.pdf', '.txt', '.md', '.docx'],
  },
  code: {
    mimeTypes: [
      'text/plain',
      'application/javascript',
      'text/javascript',
      'text/typescript',
      'text/x-python',
      'text/css',
      'text/html',
    ],
    maxSize: 5 * 1024 * 1024, // 5MB
    extensions: [
      '.js',
      '.ts',
      '.tsx',
      '.jsx',
      '.py',
      '.css',
      '.html',
      '.json',
      '.yaml',
      '.yml',
      '.sh',
      '.sql',
      '.go',
      '.rs',
      '.java',
      '.cpp',
      '.c',
      '.h',
    ],
  },
};

// Validate file upload
export function validateFile(file: {
  name: string;
  size: number;
  type: string;
}): { valid: boolean; error?: string; category?: string } {
  if (!file || typeof file.size !== 'number' || file.size <= 0) {
    return { valid: false, error: 'File is empty or invalid' };
  }

  const lastDot = file.name.lastIndexOf('.');
  const ext = lastDot !== -1 ? file.name.slice(lastDot).toLowerCase() : '';
  const mimeType = file.type?.toLowerCase() || '';

  for (const [category, config] of Object.entries(ALLOWED_FILE_TYPES)) {
    const extMatch = ext && config.extensions.includes(ext);
    const mimeMatch = mimeType && config.mimeTypes.includes(mimeType);

    if (extMatch || mimeMatch) {
      if (file.size > config.maxSize) {
        const maxMb = Math.round(config.maxSize / (1024 * 1024));
        return {
          valid: false,
          error: `File size exceeds the limit of ${maxMb}MB for ${category} files`,
          category,
        };
      }
      return { valid: true, category };
    }
  }

  return {
    valid: false,
    error: 'Unsupported file type or extension',
  };
}

// Strip potentially dangerous content from AI tool output
export function sanitizeToolOutput(output: string, maxLength: number = 50_000): string {
  if (!output || typeof output !== 'string') {
    return '';
  }

  // Remove null bytes
  const sanitized = output.replace(/\0/g, '');

  if (sanitized.length > maxLength) {
    return sanitized.slice(0, maxLength);
  }

  return sanitized;
}
