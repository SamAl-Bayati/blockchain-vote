import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../Home/Header';
import '../../styles/Polls/AnswerPoll.css';
import { useParams, useNavigate } from 'react-router-dom';

const AnswerPoll = ({ user }) => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    axios
      .get(`/polls/${pollId}`)
      .then((response) => setPoll(response.data))
      .catch((error) => console.error(error));
  }, [pollId]);

  const handleVote = () => {
    if (!selectedOption) {
      alert('Please select an option.');
      return;
    }
    axios
      .post(`/polls/${pollId}/vote`, { optionId: selectedOption })
      .then((response) => {
        alert('Your vote has been recorded.');
        setHasVoted(true);
      })
      .catch((error) => {
        if (
          error.response &&
          error.response.data.message === 'You have already voted on this poll.'
        ) {
          alert('You have already voted on this poll.');
          setHasVoted(true);
        } else {
          console.error('Error recording vote:', error);
        }
      });
  };

  const viewResults = () => {
    navigate(`/polls/${pollId}/results`);
  };

  if (!poll) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header user={user} />
      <main className="answer-poll-container">
        <h2>{poll.poll.title}</h2>
        <p>{poll.poll.description}</p>
        <div className="options-list">
          {poll.options.map((option) => (
            <div key={option.id} className="option-item">
              <label>
                <input
                  type="radio"
                  name="poll-option"
                  value={option.id}
                  onChange={() => setSelectedOption(option.id)}
                  disabled={hasVoted}
                />
                {option.text}
              </label>
            </div>
          ))}
        </div>
        {!hasVoted ? (
          <button onClick={handleVote}>Submit Vote</button>
        ) : (
          <button onClick={viewResults}>View Results</button>
        )}
      </main>
    </div>
  );
};

export default AnswerPoll;
