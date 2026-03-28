import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAboutData } from '../services/db';

const About = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [aboutData, setAboutData] = useState({
    photoUrl: "/about-me-photo.png",
    title: "My Story",
    description: "Far far away, behind the word mountains...",
    highlight: "I Do Web Design & Developement since I was 18 Years Old",
    tabs: {
      about: "I am a passionate web designer with a knack for creating beautiful, dynamic user interfaces.",
      skills: "React, Next.js, Firebase, Framer Motion, Vanilla CSS, Figma",
      experience: "Senior Frontend Developer at TechCorp (2020-Present)"
    }
  });

  useEffect(() => {
    getAboutData().then(data => {
      if (data && Object.keys(data).length > 0) {
        setAboutData(prev => ({
          ...prev,
          ...data,
          tabs: { ...prev.tabs, ...(data.tabs || {}) },
          photoUrl: data.photoUrl || prev.photoUrl,
        }));
      }
    });
  }, []);

  return (
    <section className="section" style={{ backgroundColor: 'var(--color-background)' }} id="about">
      <div className="container grid grid-cols-2" style={{ alignItems: 'center' }}>
        
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8 }} style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '150px', height: '150px', backgroundColor: 'rgba(212, 175, 55, 0.15)', zIndex: 0, border: '1px solid rgba(212, 175, 55, 0.3)' }} />
          {aboutData.photoUrl && <img src={aboutData.photoUrl} alt="About Me" style={{ width: '100%', maxWidth: '500px', height: 'auto', borderRadius: 'var(--radius-md)', position: 'relative', zIndex: 1, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8 }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            {['about', 'skills', 'experience'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.5rem 1rem', border: 'none', backgroundColor: activeTab === tab ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === tab ? 'var(--color-white)' : 'var(--color-text-light)', fontWeight: '600',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.875rem', transition: 'var(--transition)'
                }}
              >
                {tab === 'about' ? 'About Me' : tab}
              </button>
            ))}
          </div>

          <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{aboutData.title}</h2>
          <p style={{ fontSize: '1.125rem', lineHeight: '1.8', marginBottom: '2rem' }}>{aboutData.description}</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>{aboutData.highlight}</h3>

          <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', minHeight: '120px' }}>
            <p style={{ margin: 0, color: 'var(--color-text)', whiteSpace: 'pre-line' }}>{aboutData.tabs && aboutData.tabs[activeTab]}</p>
          </div>
          
        </motion.div>
      </div>
    </section>
  );
};

export default About;
