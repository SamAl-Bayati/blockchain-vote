import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../Home/Header';
import '../../styles/Polls/PollResults.css';
import { useParams } from 'react-router-dom';

const PollResults = ({ user }) => {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);

  useEffect(() => {
    axios.get(`/polls/${pollId}/results`)
      .then(response => setPoll(response.data))
      .catch(error => console.error(error));
  }, [pollId]);

  if (!poll) {
    return <div>Loading...</div>;
  }

  const totalVotes = poll.options.reduce((sum, option) => sum + parseInt(option.votes_count), 0);

  return (
    <div>
      <Header user={user} />
      <main className="poll-results-container">
        <h2>Results for: {poll.poll.title}</h2>
        <p>{poll.poll.description}</p>
        <ul className="results-list">
          {poll.options.map(option => (
            <li key={option.id}>
              <span>{option.text}</span>
              <span>{option.votes_count} votes</span>
              <span>
                {totalVotes > 0
                  ? ((option.votes_count / totalVotes) * 100).toFixed(2) + '%'
                  : '0%'}
              </span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default PollResults;
