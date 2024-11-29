import React, { useState, useEffect } from 'react';
import Header from '../Home/Header';
import '../../styles/Polls/AnswerPoll.css';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';

const AnswerPoll = ({ user }) => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [contractInfo, setContractInfo] = useState(null);

  useEffect(() => {
    const fetchContractInfo = async () => {
      try {
        const response = await axios.get('/contract-info');
        setContractInfo(response.data);
      } catch (error) {
        console.error('Error fetching contract info:', error);
      }
    };

    fetchContractInfo();
  }, []);

  useEffect(() => {
    const loadPoll = async () => {
      if (!window.ethereum || !contractInfo) return;

      try {
        // Request account access first
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const { chainId } = await provider.getNetwork();
        console.log('Chain ID:', chainId);
        console.log('Type of Chain ID:', typeof chainId);

        if (chainId !== 11155111) {
          alert('Please switch your MetaMask network to Sepolia Test Network.');
          return;
        }

        const signer = provider.getSigner();

        const pollContract = new ethers.Contract(
          contractInfo.contractAddress,
          contractInfo.abi,
          signer
        );

        const pollData = await pollContract.getPoll(pollId);
        const options = [];

        for (let i = 0; i < pollData[4]; i++) {
          const option = await pollContract.getOption(pollId, i);
          options.push({ id: i, text: option[0], voteCount: option[1].toNumber() });
        }

        setPoll({
          id: pollData[0].toNumber(),
          creator: pollData[1],
          title: pollData[2],
          description: pollData[3],
          options: options,
        });

        // Check if user has already voted
        const hasVoted = await pollContract.voters(pollId, await signer.getAddress());
        setHasVoted(hasVoted);
      } catch (error) {
        console.error('Error loading poll:', error);
      }
    };

    if (contractInfo) {
      loadPoll();
    }
  }, [pollId, contractInfo]);

  const handleVote = async () => {
    if (!window.ethereum || !contractInfo) return;

    if (selectedOption === null) {
      alert('Please select an option.');
      return;
    }

    try {
      // Request account access first
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const { chainId } = await provider.getNetwork();
      console.log('Chain ID:', chainId);
      console.log('Type of Chain ID:', typeof chainId);

      if (chainId !== 11155111) {
        alert('Please switch your MetaMask network to Sepolia Test Network.');
        return;
      }

      const signer = provider.getSigner();

      const pollContract = new ethers.Contract(
        contractInfo.contractAddress,
        contractInfo.abi,
        signer
      );

      const tx = await pollContract.vote(pollId, selectedOption);
      await tx.wait();

      alert('Your vote has been recorded on the blockchain.');
      setHasVoted(true);
    } catch (error) {
      console.error('Error voting:', error);
      if (error.data && error.data.message.includes('Already voted')) {
        alert('You have already voted on this poll.');
        setHasVoted(true);
      } else {
        alert('Error voting. See console for details.');
      }
    }
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
        <h2>{poll.title}</h2>
        <p>{poll.description}</p>
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
