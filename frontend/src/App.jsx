import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import HomeApp from './components/Home/HomeApp';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import PrivateRoute from './components/Auth/PrivateRoute';
import PollsList from './components/Polls/PollsList';
import CreatePoll from './components/Polls/CreatePoll';
import AnswerPoll from './components/Polls/AnswerPoll';
import AccountSettings from './components/User/AccountSettings';

// Configure Axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000'; // Update with your backend URL

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data on component mount
  const fetchUser = async () => {
    try {
      const res = await axios.get('/auth/user');
      console.log('Raw user data received:', res.data);
      if (res.data && res.data.user) {
        setUser({
          id: res.data.user.id,
          email: res.data.user.email,
          firstName: res.data.user.firstName,
          lastName: res.data.user.lastName,
          displayName: res.data.user.displayName,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google'; // Update with your backend URL
  };

  const handleLogout = async () => {
    try {
      await axios.get('/auth/logout');
      setUser(null);
      window.location.href = '/'; // Redirect to home after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Router>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Routes>
          <Route path="/" element={<HomeApp user={user} onLogout={handleLogout} />} />
          <Route
            path="/signin"
            element={
              user ? (
                <Navigate to="/polls" />
              ) : (
                <SignIn onLogin={handleLogin} setUser={setUser} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              user ? (
                <Navigate to="/polls" />
              ) : (
                <SignUp setUser={setUser} />
              )
            }
          />
          <Route
            path="/polls"
            element={
              <PrivateRoute user={user}>
                <PollsList user={user} onLogout={handleLogout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/polls/create"
            element={
              <PrivateRoute user={user}>
                <CreatePoll user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/polls/:pollId"
            element={
              <PrivateRoute user={user}>
                <AnswerPoll user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/account"
            element={
              <PrivateRoute user={user}>
                <AccountSettings user={user} />
              </PrivateRoute>
            }
          />
          {/* Add other routes as needed */}
        </Routes>
      )}
    </Router>
  );
}

export default App;
