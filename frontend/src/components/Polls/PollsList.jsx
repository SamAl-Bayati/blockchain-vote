import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../Home/Header';
import '../../styles/Polls/PollsList.css';

const PollsList = ({ user, onLogout }) => {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    axios.get('/polls')
      .then(response => setPolls(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <Header user={user} onLogout={onLogout} />
      <main className="polls-list-container">
        <h2>Available Polls</h2>
        <ul className="polls-list">
          {polls.map(poll => (
            <li key={poll.id}>
              <h3>{poll.title}</h3>
              <p>{poll.description}</p>
              <p>Created by: {poll.first_name} {poll.last_name}</p>
              <a href={`/polls/${poll.id}`}>View Poll</a>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default PollsList;
