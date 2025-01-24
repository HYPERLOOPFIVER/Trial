import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Auth/Navbar'; // Assuming Navbar is in the same folder level
import Signup from './Auth/Signup';
import Login from './Auth/Login';
import Dashboard from './Auth/Dashboard';
import Nce from './Auth/Nce';
import Course from './Auth/H';
import Attend from './Auth/Ac';
import Cca from './Auth/Createcourse';
import Asign from './Auth/Asignm';
import Yc from './Auth/Yc';
import SplashScreen from './Auth/Splashscreen'; // Import the SplashScreen component

const AppContent = () => {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);

  // Show splash screen for 3 seconds when the route changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false); // Hide splash screen after 3 seconds
    }, 3000); // Adjust time as necessary

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const showNavbar = !['/signup', '/login', '/'].includes(location.pathname);

  return (
    <>
      {/* Display the splash screen while transitioning */}
      {showSplash && <SplashScreen />}

      {/* Conditionally render Navbar based on the route */}
      {showNavbar && <Navbar />}

      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Course />} />
        <Route path="/attend" element={<Attend />} />
        <Route path="/cca" element={<Cca />} />
        <Route path="/asign" element={<Asign />} />
        <Route path="/yc" element={<Yc />} />
        <Route path="/nce" element={<Nce />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
