import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { IoIosArrowBack } from "react-icons/io";
const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Back Button with Icon */}
        <button className="back-button" onClick={() => navigate(-1)}>
        <IoIosArrowBack />
        </button>
        
        {/* Brand Name centered */}
        <div className="navbar-logo">
        <center>  <h1>Prep<span>Economics</span></h1></center>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
