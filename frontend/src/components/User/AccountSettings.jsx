import React, { useState } from 'react';
import axios from 'axios';
import Header from '../Home/Header';
import '../../styles/User/AccountSettings.css';

const AccountSettings = ({ user }) => {
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [email, setEmail] = useState(user.email || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Implement the update user API call here
      // For now, we'll just log the data
      console.log('Updated user info:', { firstName, lastName, email });
      alert('Account settings updated successfully.');
    } catch (error) {
      console.error('Error updating account settings:', error);
    }
  };

  return (
    <div>
      <Header user={user} />
      <main className="account-settings-container">
        <h2>Account Settings</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name:</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit">Update Settings</button>
        </form>
      </main>
    </div>
  );
};

export default AccountSettings;
