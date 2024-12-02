import React, { useState, useEffect } from 'react';
import Header from '../Home/Header';
import '../../styles/Polls/AnswerPoll.css';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';

const AnswerPoll = ({ user, onLogout }) => {
  const { pollId } = useParams();
  const navigate = useNavigate();

  const [pollMetadata, setPollMetadata] = useState(null);
  const [pollOptions, setPollOptions] = useState([]);
  const [isBlockchainPoll, setIsBlockchainPoll] = useState(false);

  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [contractInfo, setContractInfo] = useState(null);

  const [blockchainId, setBlockchainId] = useState(null);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await axios.get(`/polls/${pollId}`);
        const pollData = response.data.poll;
        const optionsData = response.data.options;

        setPollMetadata(pollData);
        setPollOptions(optionsData);
        setIsBlockchainPoll(pollData.type === 'blockchain');

        if (pollData.type === 'blockchain') {
          setBlockchainId(pollData.blockchain_id);
        }

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
    const loadBlockchainPollData = async () => {
      if (!window.ethereum) {
        alert('MetaMask is not installed. Please install MetaMask to interact with the blockchain.');
        return;
      }
      if (!contractInfo || blockchainId === null) {
        console.error('Required blockchain information is missing.');
        return;
      }

      try {
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
      if (!window.ethereum || !contractInfo || blockchainId === null) {
        alert('Blockchain information is missing or MetaMask is not installed.');
        return;
      }

      try {
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
      <Header user={user} onLogout={onLogout} />
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
          <button onClick={handleVote} disabled={isBlockchainPoll && !contractInfo}>
            Submit Vote
          </button>
        ) : (
          <button onClick={viewResults}>View Results</button>
        )}
      </main>
    </div>
  );
};

export default AnswerPoll;
