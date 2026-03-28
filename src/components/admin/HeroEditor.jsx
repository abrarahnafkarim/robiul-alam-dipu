import React, { useState, useEffect, useRef } from 'react';
import { getHeroData, updateHeroData, uploadFile } from '../../services/db';
import { inputStyle, labelStyle, cardStyle, primaryBtnStyle, primaryBtnDisabledOverrides, toggleBtnStyle, messageStyle, validateFile, sanitizeUrl, colors } from './adminStyles';
import { FiSave, FiUpload, FiLink, FiImage, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';

const HeroEditor = () => {
  const [data, setData] = useState({
    greeting: "WELCOME TO MY WORLD",
    name: "SYED MOHAMMAD ROBIUL ALAM",
    title: "A Web Designer",
    description: "Far far away, behind the word mountains, far from the countries.",
    photoUrl: "/hero-transparent-fixed.png"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageSource, setImageSource] = useState('upload');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    getHeroData()
      .then(res => { if (res) setData(prev => ({ ...prev, ...res })); })
      .catch(err => console.warn('Hero fetch error:', err.message))
      .finally(() => setLoading(false));
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      let finalPhotoUrl = data.photoUrl;
      if (imageSource === 'upload' && file) {
        finalPhotoUrl = await uploadFile(file, 'heroImages');
      } else if (imageSource === 'url' && imageUrlInput.trim()) {
        finalPhotoUrl = sanitizeUrl(imageUrlInput.trim());
        if (!finalPhotoUrl) throw new Error('Invalid URL provided.');
      }
      const updatedData = { ...data, photoUrl: finalPhotoUrl };
      await updateHeroData(updatedData);
      setData(updatedData);
      setFile(null);
      if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
      setMessage({ text: 'Hero section saved successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({ text: err.message || 'Error saving. Check your connection.', type: 'error' });
    }
    setSaving(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '2rem', color: colors.textMuted }}>
      <FiLoader size={20} style={{ animation: 'editorSpin 0.8s linear infinite' }} color={colors.primary} />
      <span>Loading hero data…</span>
      <style>{`@keyframes editorSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      <h2 style={{ color: colors.primary, marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiImage size={22} /> Edit Hero Section
      </h2>

      {message.text && (
        <div style={messageStyle(message.type)}>
          {message.type === 'success' ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={labelStyle}>Greeting Text</label>
          <input type="text" value={data.greeting} onChange={e => setData({...data, greeting: e.target.value})} style={inputStyle} placeholder="e.g. WELCOME TO MY WORLD"
            onFocus={e => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 3px ${colors.primaryBg}`; }}
            onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input type="text" value={data.name} onChange={e => setData({...data, name: e.target.value})} style={inputStyle} placeholder="Your full name"
            onFocus={e => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 3px ${colors.primaryBg}`; }}
            onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <div>
          <label style={labelStyle}>Professional Title</label>
          <input type="text" value={data.title || ''} onChange={e => setData({...data, title: e.target.value})} style={inputStyle} placeholder="e.g. Web Developer"
            onFocus={e => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 3px ${colors.primaryBg}`; }}
            onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea value={data.description} onChange={e => setData({...data, description: e.target.value})} rows="4" style={{...inputStyle, resize: 'vertical'}} placeholder="A short description about yourself"
            onFocus={e => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 3px ${colors.primaryBg}`; }}
            onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Image Section */}
        <div style={cardStyle}>
          <label style={{...labelStyle, marginBottom: '0.75rem'}}>Hero Image</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button type="button" onClick={() => setImageSource('upload')} style={toggleBtnStyle(imageSource === 'upload')}>
              <FiUpload size={14} /> Upload File
            </button>
            <button type="button" onClick={() => setImageSource('url')} style={toggleBtnStyle(imageSource === 'url')}>
              <FiLink size={14} /> Paste URL
            </button>
          </div>

          {imageSource === 'upload' ? (
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <button type="button" onClick={() => fileInputRef.current?.click()} style={{
                ...inputStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: colors.textMuted, border: `1px dashed ${colors.border}`,
              }}>
                <FiUpload size={16} /> {file ? file.name : 'Choose an image file…'}
              </button>
            </div>
          ) : (
            <input type="url" value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} style={inputStyle} placeholder="https://example.com/image.jpg"
              onFocus={e => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 3px ${colors.primaryBg}`; }}
              onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; }}
            />
          )}

          {(previewUrl || data.photoUrl) && (
            <div style={{ marginTop: '0.75rem' }}>
              <img
                src={previewUrl || data.photoUrl}
                alt="Hero preview"
                style={{ height: '120px', borderRadius: '8px', objectFit: 'contain', backgroundColor: colors.surface }}
              />
            </div>
          )}
        </div>

        <button type="submit" disabled={saving} style={{
          ...primaryBtnStyle,
          ...(saving ? primaryBtnDisabledOverrides : {}),
        }}>
          {saving ? <><FiLoader size={16} style={{ animation: 'editorSpin 0.8s linear infinite' }} /> Saving…</> : <><FiSave size={16} /> Save Changes</>}
        </button>
      </form>
    </div>
  );
};

export default HeroEditor;
