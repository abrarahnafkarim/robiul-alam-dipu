import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Achievements from '../components/Achievements';
import Blog from '../components/Blog';

import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <About />
      <Achievements />
      <Blog />
    </div>
  );
};

export default Home;
