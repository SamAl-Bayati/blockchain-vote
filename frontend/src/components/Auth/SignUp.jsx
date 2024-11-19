import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Auth/Auth.css';

const SignUp = ({ setUser }) => {
  const [firstName, setFirstName] = useState(''); // For 'firstName'
  const [lastName, setLastName] = useState(''); // For 'lastName'
  const [email, setEmail] = useState(''); // For 'email'
  const [password, setPassword] = useState(''); // For 'password'
  const [confirmPassword, setConfirmPassword] = useState(''); // For 'confirmPassword'
  const [phoneNumber, setPhoneNumber] = useState(''); // For 'phoneNumber'

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const response = await axios.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
      });

      console.log('Registration successful:', response.data);

      setUser({
        id: response.data.user.id,
        email: response.data.user.email,
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        displayName: response.data.user.displayName,
      });

      navigate('/polls');
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          {/* First Name */}
          <div className="form-group">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          {/* Last Name */}
          <div className="form-group">
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="auth-button">
            Register
          </button>
        </form>

        {/* Link to Sign In */}
        <p className="auth-link">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
