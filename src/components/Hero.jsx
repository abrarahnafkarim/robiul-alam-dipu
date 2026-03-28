import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getHeroData } from '../services/db';

const Hero = () => {
  const [heroData, setHeroData] = useState({
    greeting: "WELCOME TO MY WORLD",
    name: "SYED MOHAMMAD ROBIUL ALAM",
    title: "A Web Designer",
    description: "Far far away, behind the word mountains, far from the countries.",
    photoUrl: "/hero-transparent-fixed.png",
  });

  useEffect(() => {
    getHeroData().then(data => {
      if (data && Object.keys(data).length > 0) {
        setHeroData(prev => ({
          greeting: data.greeting !== undefined ? data.greeting : prev.greeting,
          name: data.name !== undefined ? data.name : prev.name,
          title: data.title !== undefined ? data.title : prev.title,
          description: data.description !== undefined ? data.description : prev.description,
          photoUrl: data.photoUrl !== undefined ? data.photoUrl : prev.photoUrl,
        }));
      }
    });
  }, []);

  return (
    <section style={{
      backgroundColor: 'var(--color-background)', color: 'var(--color-text)',
      paddingTop: '5rem', paddingBottom: '0', display: 'flex', alignItems: 'flex-end', position: 'relative', overflow: 'hidden',
      borderBottom: '2px solid rgba(212, 175, 55, 0.15)'
    }}>
      <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '500px', height: '500px', backgroundColor: 'rgba(212, 175, 55, 0.03)', borderRadius: '50%', filter: 'blur(50px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', backgroundColor: 'rgba(212, 175, 55, 0.02)', borderRadius: '50%', zIndex: 0, border: '1px solid rgba(212, 175, 55, 0.1)' }} />

      <div className="container grid grid-cols-2" style={{ position: 'relative', zIndex: 1, alignItems: 'flex-end', gap: '4rem' }}>
        
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} style={{ paddingTop: '0', paddingBottom: '4rem' }}>
          <span style={{ display: 'inline-block', backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', color: 'var(--color-primary)', padding: '0.35rem 1.25rem', borderRadius: 'var(--radius-pill)', fontWeight: '600', marginBottom: '1.5rem', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase' }}>{heroData.greeting}</span>
          
          <h1 style={{ color: 'var(--color-text)', fontSize: '4.5rem', marginBottom: '1rem', lineHeight: '1.05' }}>
            {heroData.name}<br/>{heroData.title}
          </h1>
          
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '2.5rem', maxWidth: '500px' }}>
            {heroData.description}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
          {heroData.photoUrl && <img src={heroData.photoUrl} alt={heroData.name} style={{ maxWidth: '100%', height: 'auto', maxHeight: '85vh', objectFit: 'contain', objectPosition: 'bottom', display: 'block', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))' }} />}
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
