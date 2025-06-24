
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/GeneralNavbar.css';

const GeneralNavbar = () => {
  return (
    <nav className="navbar">
      <div className="logo-section">
        <img src="/logo.png" alt="logo" className="logo" />
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/explore">Explore Venues</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/about">About Us</Link></li>
      </ul>
      <div className="nav-buttons">
        <button className="btn white-btn">Sign In</button>
        <button className="btn white-btn">Log In</button>
      </div>
    </nav>
  );
};

export default GeneralNavbar;

