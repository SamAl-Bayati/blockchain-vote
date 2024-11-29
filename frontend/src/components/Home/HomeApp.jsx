import React from 'react';
import Header from './Header';
import Footer from './Footer';
import '../../styles/Home/global.css';

const HomeApp = ({ user, onLogout }) => {
  return (
    <div className="home-container">
      <Header user={user} onLogout={onLogout} />
      <main className="home-main">
        <h2>Welcome to eVote</h2>
        <p>Create and participate in polls securely using blockchain technology.</p>
      </main>
      <Footer />
    </div>
  );
};

export default HomeApp;
