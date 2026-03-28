import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { getBlogs, addBlog, updateBlog, deleteBlog, uploadFile } from '../../services/db';
import {
  inputStyle, labelStyle, cardStyle, primaryBtnStyle, primaryBtnDisabledOverrides,
  toggleBtnStyle, messageStyle, itemCardStyle, editBtnStyle, dangerBtnStyle,
  validateFile, sanitizeUrl, colors,
} from './adminStyles';
import {
  FiSave, FiUpload, FiLink, FiEdit3, FiCheckCircle, FiAlertCircle,
  FiLoader, FiPlus, FiEdit2, FiTrash2, FiX, FiImage as FiImageIcon,
} from 'react-icons/fi';

const BlogEditor = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [contentSnippet, setContentSnippet] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');
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
      [{ 'align': [] }],
      ['clean'],
    ],
  }), []);

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const fetchBlogs = async () => {
    try {
      const data = await getBlogs();
      setBlogs(data);
    } catch (err) {
      console.warn('Fetch blogs failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContentSnippet('');
    setContent('');
    setFile(null);
    setCoverImageUrl('');
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

  const handleEdit = (blog) => {
    setEditingId(blog.id);
    setTitle(blog.title || '');
    setContentSnippet(blog.contentSnippet || '');
    setContent(blog.content || '');
    setCoverImageUrl(blog.coverImage || '');
    setMediaType(blog.coverImage ? 'url' : 'upload');
    setFile(null);
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      let finalCoverImage = coverImageUrl;

      if (mediaType === 'upload' && file) {
        finalCoverImage = await uploadFile(file, 'blogImages');
      } else if (mediaType === 'url' && coverImageUrl.trim()) {
        finalCoverImage = sanitizeUrl(coverImageUrl.trim());
        if (!finalCoverImage) throw new Error('Invalid cover image URL.');
      }

      // Sanitize rich text content
      const sanitizedContent = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'ol', 'ul', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'iframe', 'span', 'div', 'figure', 'figcaption', 'video', 'source'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel', 'class', 'style', 'width', 'height', 'frameborder', 'allowfullscreen', 'controls', 'type'],
        ALLOW_DATA_ATTR: false,
      });

      const blogData = {
        title: title.trim(),
        contentSnippet: contentSnippet.trim(),
        content: sanitizedContent,
        coverImage: finalCoverImage,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: Date.now(),
      };

      if (editingId) {
        await updateBlog(editingId, blogData);
        setMessage({ text: 'Blog post updated successfully!', type: 'success' });
      } else {
        await addBlog(blogData);
        setMessage({ text: 'Blog post published successfully!', type: 'success' });
      }

      resetForm();
      await fetchBlogs();
    } catch (error) {
      console.error(error);
      setMessage({ text: error.message || 'Error saving blog post.', type: 'error' });
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteBlog(id);
        await fetchBlogs();
        setMessage({ text: 'Blog post deleted.', type: 'success' });
        if (editingId === id) resetForm();
      } catch (err) {
        setMessage({ text: 'Error deleting blog post.', type: 'error' });
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
      <span>Loading blog posts…</span>
      <style>{`@keyframes editorSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      <h2 style={{ color: colors.primary, marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiEdit3 size={22} /> Blog Editor
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
            {editingId ? <><FiEdit2 size={16} /> Edit Blog Post</> : <><FiPlus size={16} /> Create New Post</>}
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
            <label style={labelStyle}>Post Title</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder="Enter post title" {...focusHandlers} />
          </div>
          <div>
            <label style={labelStyle}>Short Snippet (Preview Text)</label>
            <input required type="text" value={contentSnippet} onChange={e => setContentSnippet(e.target.value)} style={inputStyle} placeholder="A short summary for the blog card" {...focusHandlers} />
          </div>

          {/* Cover Image Section */}
          <div style={{ backgroundColor: colors.surface, padding: '1.25rem', borderRadius: '10px', border: `1px solid ${colors.border}` }}>
            <label style={{...labelStyle, marginBottom: '0.75rem'}}>Cover Image</label>

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
                  <FiUpload size={16} /> {file ? file.name : 'Choose a cover image…'}
                </button>
              </div>
            ) : (
              <input type="url" value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} style={inputStyle} placeholder="https://example.com/image.jpg" {...focusHandlers} />
            )}

            {/* Preview */}
            {(previewUrl || coverImageUrl) && (
              <div style={{ marginTop: '0.75rem' }}>
                <img
                  src={previewUrl || coverImageUrl}
                  alt="Cover preview"
                  style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'contain' }}
                  onError={e => e.target.style.display = 'none'}
                />
              </div>
            )}
          </div>

          {/* Rich Text Editor */}
          <div>
            <label style={{...labelStyle, marginBottom: '0.5rem'}}>Full Content (Rich Text)</label>
            <div className="admin-quill-wrapper">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={quillModules}
                style={{ minHeight: '350px' }}
                placeholder="Write your blog post — add images, videos, links, code blocks, and more…"
              />
            </div>
            <div style={{ height: '1rem' }} />
          </div>

          <button type="submit" disabled={saving} style={{
            ...primaryBtnStyle,
            ...(saving ? primaryBtnDisabledOverrides : {}),
          }}>
            {saving ? <><FiLoader size={16} style={{ animation: 'editorSpin 0.8s linear infinite' }} /> Saving…</> : editingId ? <><FiSave size={16} /> Update Post</> : <><FiPlus size={16} /> Publish Post</>}
          </button>
        </form>
      </div>

      {/* Existing Posts */}
      <div>
        <h3 style={{ color: colors.text, marginBottom: '1rem', fontSize: '1.05rem', fontWeight: 600 }}>
          Published Posts ({blogs.length})
        </h3>
        {blogs.length === 0 ? (
          <p style={{ color: colors.textDim }}>No posts yet. Write your first blog above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {blogs.map(blog => (
              <div key={blog.id} style={itemCardStyle(editingId === blog.id)}>
                {blog.coverImage ? (
                  <img src={blog.coverImage} alt="" style={{
                    width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px',
                    flexShrink: 0, backgroundColor: colors.surface,
                  }} onError={e => e.target.style.display = 'none'} />
                ) : (
                  <div style={{
                    width: '72px', height: '72px', backgroundColor: colors.surface, borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <FiImageIcon size={22} color={colors.textDim} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ color: colors.text, fontSize: '0.95rem' }}>{blog.title}</strong>
                  <div style={{ fontSize: '0.8rem', color: colors.primary, marginTop: '2px', fontWeight: 500 }}>{blog.date}</div>
                  <div style={{ fontSize: '0.8rem', color: colors.textDim, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {blog.contentSnippet}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button onClick={() => handleEdit(blog)} style={editBtnStyle}>
                    <FiEdit2 size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(blog.id)} style={dangerBtnStyle}>
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

export default BlogEditor;
