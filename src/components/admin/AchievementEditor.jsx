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
  const [mediaType, setMediaType] = useState('upload');

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
    setMediaType('upload');
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
    setDate(ach.date || '');
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
      let finalMediaUrl = mediaUrl;

      if (mediaType === 'upload' && file) {
        finalMediaUrl = await uploadFile(file, 'achievementMedia');
      } else if (mediaType === 'url' && mediaUrl.trim()) {
        finalMediaUrl = sanitizeUrl(mediaUrl.trim());
        if (!finalMediaUrl) throw new Error('Invalid media URL.');
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
        date: date.trim(),
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
            <label style={labelStyle}>Date / Subtitle</label>
            <input required type="text" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} placeholder="e.g. Dec 2023" {...focusHandlers} />
          </div>

          {/* Media Section */}
          <div style={{ backgroundColor: colors.surface, padding: '1.25rem', borderRadius: '10px', border: `1px solid ${colors.border}` }}>
            <label style={{...labelStyle, marginBottom: '0.75rem'}}>Cover Media (Image or Video)</label>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button type="button" onClick={() => setMediaType('upload')} style={toggleBtnStyle(mediaType === 'upload')}>
                <FiUpload size={14} /> Upload File
              </button>
              <button type="button" onClick={() => setMediaType('url')} style={toggleBtnStyle(mediaType === 'url')}>
                <FiLink size={14} /> Paste URL
              </button>
            </div>

            {mediaType === 'upload' ? (
              <div>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} style={{
                  ...inputStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  color: colors.textMuted, border: `1px dashed ${colors.border}`,
                }}>
                  <FiUpload size={16} /> {file ? file.name : 'Choose image or video…'}
                </button>
              </div>
            ) : (
              <input type="url" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} style={inputStyle} placeholder="https://example.com/image.jpg or YouTube URL" {...focusHandlers} />
            )}

            {/* Preview */}
            {(previewUrl || mediaUrl) && (
              <div style={{ marginTop: '0.75rem' }}>
                {previewUrl ? (
                  file?.type?.startsWith('video/') ? (
                    <video src={previewUrl} controls style={{ maxHeight: '150px', borderRadius: '8px' }} />
                  ) : (
                    <img src={previewUrl} alt="Preview" style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'contain' }} />
                  )
                ) : mediaUrl && isVideoUrl(mediaUrl) ? (
                  getYouTubeEmbedUrl(mediaUrl) ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: colors.textMuted, fontSize: '0.85rem' }}>
                      <FiFilm size={16} color={colors.primary} /> YouTube video linked
                    </div>
                  ) : (
                    <video src={mediaUrl} controls style={{ maxHeight: '150px', borderRadius: '8px' }} />
                  )
                ) : mediaUrl ? (
                  <img src={mediaUrl} alt="Preview" style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
                ) : null}
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
