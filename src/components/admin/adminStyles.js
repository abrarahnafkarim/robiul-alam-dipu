// ═══════════════════════════════════════════════════════════════
// Shared Admin Design System — Single source of truth for all
// admin panel styles, reusable UI elements, and constants.
// ═══════════════════════════════════════════════════════════════

// ──────────────── Color Tokens ────────────────
export const colors = {
  bg: '#0F172A',
  surface: '#1E293B',
  surfaceHover: '#273548',
  border: '#334155',
  borderFocus: '#D4AF37',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textDim: '#64748B',
  primary: '#D4AF37',
  primaryHover: '#E5C24A',
  primaryBg: 'rgba(212, 175, 55, 0.1)',
  primaryBorder: 'rgba(212, 175, 55, 0.3)',
  success: '#22C55E',
  successBg: 'rgba(34, 197, 94, 0.1)',
  error: '#EF4444',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  info: '#3B82F6',
  infoBg: 'rgba(59, 130, 246, 0.1)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.1)',
};

// ──────────────── Typography ────────────────
export const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.bg,
  color: colors.text,
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
};

export const inputFocusStyle = {
  borderColor: colors.primary,
  boxShadow: `0 0 0 3px ${colors.primaryBg}`,
};

export const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: '600',
  fontSize: '0.8rem',
  color: colors.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.75px',
  fontFamily: "'Inter', system-ui, sans-serif",
};

// ──────────────── Layout ────────────────
export const cardStyle = {
  backgroundColor: colors.bg,
  padding: '1.5rem',
  borderRadius: '12px',
  border: `1px solid ${colors.border}`,
};

export const sectionStyle = {
  backgroundColor: colors.surface,
  padding: '1.5rem',
  borderRadius: '12px',
  border: `1px solid ${colors.border}`,
};

// ──────────────── Buttons ────────────────
export const primaryBtnStyle = {
  padding: '0.75rem 1.75rem',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: colors.primary,
  color: colors.bg,
  fontWeight: '700',
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontFamily: "'Inter', system-ui, sans-serif",
};

export const primaryBtnDisabledOverrides = {
  cursor: 'not-allowed',
  opacity: 0.6,
};

export const secondaryBtnStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: `1px solid ${colors.border}`,
  backgroundColor: 'transparent',
  color: colors.textMuted,
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontFamily: "'Inter', system-ui, sans-serif",
};

export const dangerBtnStyle = {
  ...secondaryBtnStyle,
  borderColor: colors.error,
  color: colors.error,
};

export const editBtnStyle = {
  ...secondaryBtnStyle,
  borderColor: colors.info,
  color: colors.info,
};

// ──────────────── Toggle Button Group ────────────────
export const toggleBtnStyle = (isActive) => ({
  padding: '0.45rem 1rem',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.8rem',
  backgroundColor: isActive ? colors.primary : colors.border,
  color: isActive ? colors.bg : colors.textMuted,
  fontWeight: '600',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  fontFamily: "'Inter', system-ui, sans-serif",
});

// ──────────────── Item Card (list rows) ────────────────
export const itemCardStyle = (isEditing) => ({
  display: 'flex',
  gap: '1rem',
  padding: '1rem 1.25rem',
  backgroundColor: isEditing ? colors.primaryBg : colors.bg,
  borderRadius: '10px',
  border: `1px solid ${isEditing ? colors.primary : colors.border}`,
  alignItems: 'center',
  transition: 'all 0.2s ease',
});

// ──────────────── Message / Toast ────────────────
export const messageStyle = (type) => ({
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  marginBottom: '1.5rem',
  backgroundColor: type === 'success' ? colors.successBg : colors.errorBg,
  border: `1px solid ${type === 'success' ? colors.success : colors.error}`,
  color: type === 'success' ? colors.success : colors.error,
  fontSize: '0.9rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontFamily: "'Inter', system-ui, sans-serif",
});

// ──────────────── Validation Helpers ────────────────
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

export const validateFile = (file) => {
  if (!file) return { valid: false, error: 'No file selected.' };

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return { valid: false, error: `Unsupported file type: ${file.type || 'unknown'}. Use JPEG, PNG, WebP, GIF, MP4, or WebM.` };
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: `Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 10MB.` };
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return { valid: false, error: `Video too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 50MB.` };
  }

  return { valid: true, error: null, isImage, isVideo };
};

// ──────────────── URL Validation ────────────────
export const isVideoUrl = (url) => {
  if (!url) return false;
  return (
    url.includes('youtube.com/watch') ||
    url.includes('youtu.be/') ||
    url.includes('vimeo.com/') ||
    /\.(mp4|webm|ogg)(\?|$)/i.test(url)
  );
};

export const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  let videoId = null;
  if (url.includes('youtube.com/watch')) {
    try { videoId = new URL(url).searchParams.get('v'); } catch { return null; }
  } else if (url.includes('youtu.be/')) {
    try { videoId = new URL(url).pathname.slice(1); } catch { return null; }
  }
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
};

export const sanitizeUrl = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    return parsed.href;
  } catch {
    return '';
  }
};
