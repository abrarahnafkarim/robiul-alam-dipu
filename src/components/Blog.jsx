import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { getBlogs } from '../services/db';
import { FiX, FiCalendar, FiArrowRight } from 'react-icons/fi';

const Blog = () => {
  const [blogs, setBlogs] = useState([
    { id: 1, title: 'The Future of Web Design', contentSnippet: 'Exploring the new trends in UI/UX designing...', content: '', date: 'Mar 15, 2024', coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&w=600' }
  ]);
  const [expandedBlog, setExpandedBlog] = useState(null);

  useEffect(() => {
    getBlogs().then(data => {
      if (data && data.length > 0) {
        setBlogs(data);
      }
    }).catch(() => {});
  }, []);

  const openBlog = (blog) => {
    setExpandedBlog(blog);
    document.body.style.overflow = 'hidden';
  };

  const closeBlog = () => {
    setExpandedBlog(null);
    document.body.style.overflow = '';
  };

  return (
    <>
      <section className="section" style={{ backgroundColor: 'var(--color-background)' }} id="blog">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', margin: 0 }}>Latest News</h2>
              <p style={{ margin: '0.5rem 0 0 0' }}>Thoughts, ideas, and tutorials.</p>
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '3rem' }}>
            {blogs.map((post, index) => (
              <motion.div 
                key={post.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay: index * 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {post.coverImage && (
                  <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '250px', cursor: 'pointer' }}
                    onClick={() => openBlog(post)}
                  >
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>
                    <FiCalendar size={14} />
                    {post.date}
                  </div>
                  <h3
                    style={{ fontSize: '1.5rem', margin: '0.5rem 0', cursor: 'pointer', transition: 'var(--transition)' }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text)'}
                    onClick={() => openBlog(post)}
                  >
                    {post.title}
                  </h3>
                  <p>{post.contentSnippet}</p>
                  <button
                    onClick={() => openBlog(post)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--color-primary)',
                      fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.875rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                      padding: 0, transition: 'var(--transition)',
                    }}
                  >
                    Read More <FiArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Detail Modal */}
      <AnimatePresence>
        {expandedBlog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeBlog}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              padding: '2rem', overflowY: 'auto',
            }}
          >
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3 }}
              onClick={e => e.stopPropagation()}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '780px',
                overflow: 'hidden',
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                margin: '2rem 0',
              }}
            >
              {/* Close button */}
              <button
                onClick={closeBlog}
                style={{
                  position: 'sticky', top: '1rem', float: 'right', marginRight: '1rem',
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.5)', border: 'none',
                  color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 10, backdropFilter: 'blur(4px)',
                }}
              >
                <FiX size={18} />
              </button>

              {/* Cover */}
              {expandedBlog.coverImage && (
                <img
                  src={expandedBlog.coverImage}
                  alt={expandedBlog.title}
                  style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                />
              )}

              {/* Content */}
              <div style={{ padding: '2.5rem 2rem' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.75rem',
                }}>
                  <FiCalendar size={14} />
                  {expandedBlog.date}
                </div>

                <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', lineHeight: 1.3 }}>
                  {expandedBlog.title}
                </h1>

                {expandedBlog.content ? (
                  <div
                    className="rich-content blog-content"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(expandedBlog.content) }}
                  />
                ) : (
                  <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--color-text-light)' }}>
                    {expandedBlog.contentSnippet}
                  </p>
                )}
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Blog;
