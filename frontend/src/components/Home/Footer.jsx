import React from 'react';
import '../../styles/Home/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {new Date().getFullYear()} eVote. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
