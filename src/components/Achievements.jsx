import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { getAchievements } from '../services/db';

const isVideoUrl = (url) => {
  if (!url) return false;
  return url.includes('youtube.com/watch') || url.includes('youtu.be/') || url.includes('vimeo.com/') || /\.(mp4|webm|ogg)(\?|$)/i.test(url);
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  let videoId = null;
  if (url.includes('youtube.com/watch')) {
    try { videoId = new URL(url).searchParams.get('v'); } catch { return null; }
  } else if (url.includes('youtu.be/')) {
    try { videoId = new URL(url).pathname.slice(1); } catch { return null; }
  }
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
};

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    getAchievements().then(data => {
      if (data && data.length > 0) {
        setAchievements(data);
      }
    }).catch(() => {});
  }, []);

  const renderMedia = (item) => {
    if (!item.mediaUrl) return null;

    const embedUrl = getYouTubeEmbedUrl(item.mediaUrl);
    if (embedUrl) {
      return (
        <div style={{ height: '200px', overflow: 'hidden' }}>
          <iframe
            src={embedUrl}
            title={item.title}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      );
    }

    if (isVideoUrl(item.mediaUrl)) {
      return (
        <div style={{ height: '200px', overflow: 'hidden' }}>
          <video
            src={item.mediaUrl}
            controls
            preload="metadata"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      );
    }

    return (
      <div style={{ height: '200px', overflow: 'hidden' }}>
        <img
          src={item.mediaUrl}
          alt={item.title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>
    );
  };

  // Check if description contains HTML tags (from rich text editor)
  const isHtmlContent = (text) => /<[a-z][\s\S]*>/i.test(text);

  return (
    <section className="section" style={{ backgroundColor: 'var(--color-surface)' }} id="achievements">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>My Achievements</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto' }}>A showcase of awards, recognitions, and milestones in my journey.</p>
        </div>

        <div className="grid grid-cols-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {achievements.map((item, index) => (
            <motion.div 
              key={item.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: index * 0.1 }}
              style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', transition: 'var(--transition)', cursor: 'pointer' }}
              whileHover={{ y: -5, boxShadow: 'var(--shadow-lg)' }}
            >
              {renderMedia(item)}
              <div style={{ padding: '1.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>{item.date}</span>
                <h3 style={{ margin: '0.5rem 0', fontSize: '1.25rem' }}>{item.title}</h3>
                {isHtmlContent(item.description) ? (
                  <div
                    style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-light)' }}
                    className="rich-content"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.description) }}
                  />
                ) : (
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>{item.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;
