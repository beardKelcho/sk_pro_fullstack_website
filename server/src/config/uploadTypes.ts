export const BASE_UPLOAD_TYPES = [
  'general',
  'images',
  'videos',
  'documents',
  'site-images',
  'avatars',
] as const;

export const SITE_IMAGE_UPLOAD_TYPES = [
  'project',
  'gallery',
  'hero',
  'about',
  'video',
  'other',
] as const;

export const ALL_UPLOAD_TYPES = [...BASE_UPLOAD_TYPES, ...SITE_IMAGE_UPLOAD_TYPES] as const;

export const ALL_UPLOAD_TYPES_WITH_ALL = ['all', ...ALL_UPLOAD_TYPES] as const;

export const normalizeUploadType = (
  value: string | undefined,
  fallback: (typeof ALL_UPLOAD_TYPES)[number] = 'general'
): (typeof ALL_UPLOAD_TYPES)[number] => {
  if (value && (ALL_UPLOAD_TYPES as readonly string[]).includes(value)) {
    return value as (typeof ALL_UPLOAD_TYPES)[number];
  }

  return fallback;
};
