import React, { useState, useEffect } from 'react';
import Header from '../Home/Header';
import '../../styles/Polls/AnswerPoll.css';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';

const AnswerPoll = ({ user }) => {
  const { pollId } = useParams(); // This is the database poll ID
  const navigate = useNavigate();

  // Separate states for poll metadata and options
  const [pollMetadata, setPollMetadata] = useState(null);
  const [pollOptions, setPollOptions] = useState([]);
  const [isBlockchainPoll, setIsBlockchainPoll] = useState(false);

  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [contractInfo, setContractInfo] = useState(null);

  // New state to store blockchainId
  const [blockchainId, setBlockchainId] = useState(null);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        // Fetch poll data from the backend
        const response = await axios.get(`/polls/${pollId}`);
        const pollData = response.data.poll;
        const optionsData = response.data.options;

        setPollMetadata(pollData);
        setPollOptions(optionsData);
        setIsBlockchainPoll(pollData.type === 'blockchain');

        // Set the blockchainId if it's a blockchain poll
        if (pollData.type === 'blockchain') {
          setBlockchainId(pollData.blockchain_id);
        }

        // Check if the user has already voted (for normal polls)
        if (pollData.type === 'normal') {
          const voteCheck = await axios.get(`/polls/${pollId}/hasVoted`);
          setHasVoted(voteCheck.data.hasVoted);
        }
      } catch (error) {
        console.error('Error fetching poll:', error);
      }
    };

    fetchPoll();
  }, [pollId]);

  useEffect(() => {
    if (isBlockchainPoll) {
      const fetchContractInfo = async () => {
        try {
          const response = await axios.get('/contract-info');
          setContractInfo(response.data);
        } catch (error) {
          console.error('Error fetching contract info:', error);
        }
      };

      fetchContractInfo();
    }
  }, [isBlockchainPoll]);

  useEffect(() => {
    const loadBlockchainPollData = async () => {
      if (!window.ethereum || !contractInfo || blockchainId === null) return;

      try {
        // Request account access first
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const { chainId } = await provider.getNetwork();

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

        const pollData = await pollContract.getPoll(blockchainId);
        const options = [];

        for (let i = 0; i < pollData[4]; i++) {
          const option = await pollContract.getOption(blockchainId, i);
          options.push({ id: i, text: option[0], voteCount: option[1].toNumber() });
        }

        setPollMetadata((prev) => ({
          ...prev,
          creator: pollData[1],
          title: pollData[2],
          description: pollData[3],
        }));
        setPollOptions(options);

        // Check if user has already voted
        const hasVoted = await pollContract.voters(blockchainId, await signer.getAddress());
        setHasVoted(hasVoted);
      } catch (error) {
        console.error('Error loading blockchain poll data:', error);
      }
    };

    if (isBlockchainPoll && contractInfo && blockchainId !== null) {
      loadBlockchainPollData();
    }
  }, [blockchainId, isBlockchainPoll, contractInfo]);

  const handleVote = async () => {
    if (selectedOption === null) {
      alert('Please select an option.');
      return;
    }

    if (isBlockchainPoll) {
      if (!window.ethereum || !contractInfo || blockchainId === null) return;

      try {
        // Request account access first
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const { chainId } = await provider.getNetwork();

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

        const tx = await pollContract.vote(blockchainId, selectedOption);
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
    } else {
      // Handle normal poll voting
      try {
        await axios.post(`/polls/${pollId}/vote`, { optionId: selectedOption });
        alert('Your vote has been recorded.');
        setHasVoted(true);
      } catch (error) {
        console.error('Error voting:', error);
        alert('Error voting. See console for details.');
      }
    }
  };

  const viewResults = () => {
    navigate(`/polls/${pollId}/results`);
  };

  if (!pollMetadata || pollOptions.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header user={user} />
      <main className="answer-poll-container">
        <h2>{pollMetadata.title}</h2>
        <p>{pollMetadata.description}</p>
        <div className="options-list">
          {pollOptions.map((option) => (
            <div key={option.id} className="option-item">
              <label
                className={`option-label ${selectedOption === option.id ? 'selected' : ''} ${
                  hasVoted ? 'disabled' : ''
                }`}
                onClick={() => !hasVoted && setSelectedOption(option.id)}
              >
                <input
                  type="radio"
                  name="poll-option"
                  value={option.id}
                  checked={selectedOption === option.id}
                  readOnly
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
