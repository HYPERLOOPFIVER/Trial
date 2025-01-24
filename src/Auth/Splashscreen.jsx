// SplashScreen.js
import React, { useEffect, useState } from 'react';
import './SplashScreen.css'; // Add CSS styles for splash screen animation

const SplashScreen = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // Hide splash screen after 3 seconds
    }, 3000); // Adjust time to fit the animation

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`splash-screen ${loading ? 'active' : ''}`}>
      <div className="splash-content">
        <div className="logo">
          <h1>Prep<span>Economics</span></h1>
        </div>
        {loading && <div className="loader"></div>}
      </div>
    </div>
  );
};

export default SplashScreen;
