import React, { useState } from 'react';
import axios from 'axios';
import Header from '../Home/Header';
import '../../styles/User/AccountSettings.css';

const AccountSettings = ({ user, onLogout }) => {
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [email, setEmail] = useState(user.email || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('/auth/user', {
        firstName,
        lastName,
        email,
      });
      console.log('User updated successfully:', response.data);
      alert('Account settings updated successfully.');
    } catch (error) {
      console.error('Error updating account settings:', error);
      alert('Error updating account settings.');
    }
  };

  return (
    <div>
      <Header user={user} onLogout={onLogout} />
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
