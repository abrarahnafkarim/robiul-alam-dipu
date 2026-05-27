import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { getAchievements, addAchievement, updateAchievement, deleteAchievement, uploadFile } from '../../services/db';
import {
  inputStyle, labelStyle, cardStyle, primaryBtnStyle, primaryBtnDisabledOverrides,
  toggleBtnStyle, messageStyle, itemCardStyle, editBtnStyle, dangerBtnStyle,
  validateFile, isVideoUrl, getYouTubeEmbedUrl, sanitizeUrl, colors,
} from './adminStyles';
import {
  FiSave, FiUpload, FiLink, FiAward, FiCheckCircle, FiAlertCircle,
  FiLoader, FiPlus, FiEdit2, FiTrash2, FiX, FiFilm, FiImage as FiImageIcon,
} from 'react-icons/fi';

const convertDbDateToPicker = (dateStr) => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {}
  return '';
};

const AchievementEditor = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('url');

  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean'],
    ],
  }), []);

  useEffect(() => {
    fetchAchievements();
  }, []);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const fetchAchievements = async () => {
    try {
      const data = await getAchievements();
      setAchievements(data);
    } catch (err) {
      console.warn('Fetch achievements failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDate('');
    setFile(null);
    setMediaUrl('');
    setMediaType('url');
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setMessage({ text: validation.error, type: 'error' });
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setMessage({ text: '', type: '' });
  };

  const handleEdit = (ach) => {
    setEditingId(ach.id);
    setTitle(ach.title || '');
    setDescription(ach.description || '');
    setDate(convertDbDateToPicker(ach.date));
    setMediaUrl(ach.mediaUrl || '');
    setMediaType(ach.mediaUrl ? 'url' : 'upload');
    setFile(null);
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      let finalMediaUrl = '';

      if (mediaUrl.trim()) {
        finalMediaUrl = sanitizeUrl(mediaUrl.trim());
        if (!finalMediaUrl) throw new Error('Invalid media URL.');
      }

      // Format YYYY-MM-DD to a beautiful localized date like "Dec 2023"
      let formattedDate = date.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
        const parsedDate = new Date(formattedDate);
        if (!isNaN(parsedDate.getTime())) {
          // Format as "Dec 2023"
          formattedDate = parsedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
      }

      // Sanitize rich text content
      const sanitizedDescription = DOMPurify.sanitize(description, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'ol', 'ul', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'iframe', 'span', 'div'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel', 'class', 'style', 'width', 'height', 'frameborder', 'allowfullscreen'],
        ALLOW_DATA_ATTR: false,
      });

      const achData = {
        title: title.trim(),
        description: sanitizedDescription,
        date: formattedDate,
        mediaUrl: finalMediaUrl,
        timestamp: Date.now(),
      };

      if (editingId) {
        await updateAchievement(editingId, achData);
        setMessage({ text: 'Achievement updated successfully!', type: 'success' });
      } else {
        await addAchievement(achData);
        setMessage({ text: 'Achievement added successfully!', type: 'success' });
      }

      resetForm();
      await fetchAchievements();
    } catch (error) {
      console.error(error);
      setMessage({ text: error.message || 'Error saving achievement.', type: 'error' });
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this achievement?")) {
      try {
        await deleteAchievement(id);
        await fetchAchievements();
        setMessage({ text: 'Achievement deleted.', type: 'success' });
        if (editingId === id) resetForm();
      } catch (err) {
        setMessage({ text: 'Error deleting achievement.', type: 'error' });
      }
    }
  };

  const focusHandlers = {
    onFocus: e => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 3px ${colors.primaryBg}`; },
    onBlur: e => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; },
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '2rem', color: colors.textMuted }}>
      <FiLoader size={20} style={{ animation: 'editorSpin 0.8s linear infinite' }} color={colors.primary} />
      <span>Loading achievements…</span>
      <style>{`@keyframes editorSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      <h2 style={{ color: colors.primary, marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiAward size={22} /> Achievements Editor
      </h2>

      {message.text && (
        <div style={messageStyle(message.type)}>
          {message.type === 'success' ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* Form */}
      <div ref={formRef} style={{ ...cardStyle, marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ color: colors.text, margin: 0, fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {editingId ? <><FiEdit2 size={16} /> Edit Achievement</> : <><FiPlus size={16} /> Add New Achievement</>}
          </h3>
          {editingId && (
            <button onClick={resetForm} style={{
              padding: '0.4rem 0.85rem', borderRadius: '6px', border: `1px solid ${colors.border}`,
              backgroundColor: 'transparent', color: colors.textMuted, cursor: 'pointer', fontSize: '0.8rem',
              display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              <FiX size={14} /> Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder="Achievement title" {...focusHandlers} />
          </div>

          {/* Rich Text Description */}
          <div>
            <label style={{...labelStyle, marginBottom: '0.5rem'}}>Description (Rich Text)</label>
            <div className="admin-quill-wrapper">
              <ReactQuill
                theme="snow"
                value={description}
                onChange={setDescription}
                modules={quillModules}
                style={{ minHeight: '200px' }}
                placeholder="Describe this achievement — add images, videos, links, and formatting…"
              />
            </div>
            <div style={{ height: '1rem' }} />
          </div>

          <div>
            <label style={labelStyle}>Date / Achievement Milestone</label>
            <input required type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} {...focusHandlers} />
          </div>

          {/* Media Section */}
          <div style={{ backgroundColor: colors.surface, padding: '1.25rem', borderRadius: '10px', border: `1px solid ${colors.border}` }}>
            <label style={{...labelStyle, marginBottom: '0.5rem'}}>Cover Media URL (Image or Video)</label>

            <div style={{ fontSize: '0.78rem', color: colors.textMuted, marginBottom: '0.75rem', lineHeight: '1.4' }}>
              💡 <strong>Free Image Hosting:</strong> Upload your photo for free on <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" style={{ color: colors.primary, textDecoration: 'underline', fontWeight: '600' }}>postimages.org</a> or <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" style={{ color: colors.primary, textDecoration: 'underline', fontWeight: '600' }}>imgbb.com</a>, and paste the <strong>Direct Link</strong> (the URL ending in `.png`, `.jpg`, `.jpeg`, or `.webp`) below.
            </div>

            <input 
              type="url" 
              value={mediaUrl} 
              onChange={e => setMediaUrl(e.target.value)} 
              onBlur={e => {
                const sanitized = sanitizeUrl(e.target.value.trim());
                if (sanitized) setMediaUrl(sanitized);
              }}
              style={inputStyle} 
              placeholder="https://example.com/image.jpg or YouTube URL" 
              {...focusHandlers} 
            />

            {/* Preview */}
            {mediaUrl && (
              <div style={{ marginTop: '0.75rem' }}>
                {isVideoUrl(mediaUrl) ? (
                  getYouTubeEmbedUrl(mediaUrl) ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: colors.textMuted, fontSize: '0.85rem' }}>
                      <FiFilm size={16} color={colors.primary} /> YouTube video linked
                    </div>
                  ) : (
                    <video src={mediaUrl} controls style={{ maxHeight: '150px', borderRadius: '8px' }} />
                  )
                ) : (
                  <img src={sanitizeUrl(mediaUrl) || mediaUrl} alt="Preview" style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
                )}
              </div>
            )}
          </div>

          <button type="submit" disabled={saving} style={{
            ...primaryBtnStyle,
            ...(saving ? primaryBtnDisabledOverrides : {}),
          }}>
            {saving ? <><FiLoader size={16} style={{ animation: 'editorSpin 0.8s linear infinite' }} /> Saving…</> : editingId ? <><FiSave size={16} /> Update Achievement</> : <><FiPlus size={16} /> Add Achievement</>}
          </button>
        </form>
      </div>

      {/* Existing Achievements */}
      <div>
        <h3 style={{ color: colors.text, marginBottom: '1rem', fontSize: '1.05rem', fontWeight: 600 }}>
          Existing Achievements ({achievements.length})
        </h3>
        {achievements.length === 0 ? (
          <p style={{ color: colors.textDim }}>No achievements yet. Create your first one above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {achievements.map(ach => (
              <div key={ach.id} style={itemCardStyle(editingId === ach.id)}>
                {ach.mediaUrl && (
                  isVideoUrl(ach.mediaUrl) ? (
                    <div style={{
                      width: '72px', height: '72px', backgroundColor: colors.surface, borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <FiFilm size={22} color={colors.primary} />
                    </div>
                  ) : (
                    <img src={ach.mediaUrl} alt="" style={{
                      width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px',
                      flexShrink: 0, backgroundColor: colors.surface,
                    }} />
                  )
                )}
                {!ach.mediaUrl && (
                  <div style={{
                    width: '72px', height: '72px', backgroundColor: colors.surface, borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <FiImageIcon size={22} color={colors.textDim} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ color: colors.text, fontSize: '0.95rem' }}>{ach.title}</strong>
                  <div style={{ fontSize: '0.8rem', color: colors.primary, marginTop: '2px', fontWeight: 500 }}>{ach.date}</div>
                  <div style={{ fontSize: '0.8rem', color: colors.textDim, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ach.description, { ALLOWED_TAGS: [] }) }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button onClick={() => handleEdit(ach)} style={editBtnStyle}>
                    <FiEdit2 size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(ach.id)} style={dangerBtnStyle}>
                    <FiTrash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes editorSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AchievementEditor;
