import React, { useState, useEffect } from 'react';
import Header from '../Home/Header';
import '../../styles/Polls/PollResults.css';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers'; // Import ethers
import axios from 'axios';

const PollResults = ({ user }) => {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
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
    const loadPollResults = async () => {
      if (!window.ethereum || !contractInfo) return;

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const { chainId } = await provider.getNetwork();

        if (chainId !== 11155111) {
          alert('Please switch your MetaMask network to Sepolia Test Network.');
          return;
        }

        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const signer = provider.getSigner();

        const pollContract = new ethers.Contract(
          contractInfo.contractAddress,
          contractInfo.abi,
          signer
        );

        const pollData = await pollContract.getPoll(pollId);
        const options = [];
        let totalVotes = 0;

        for (let i = 0; i < pollData[4]; i++) {
          const option = await pollContract.getOption(pollId, i);
          const voteCount = option[1].toNumber();
          totalVotes += voteCount;
          options.push({ id: i, text: option[0], voteCount: voteCount });
        }

        setPoll({
          id: pollData[0].toNumber(),
          title: pollData[2],
          description: pollData[3],
          options: options,
          totalVotes: totalVotes,
        });
      } catch (error) {
        console.error('Error loading poll results:', error);
      }
    };

    if (contractInfo) {
      loadPollResults();
    }
  }, [pollId, contractInfo]);

  if (!poll) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header user={user} />
      <main className="poll-results-container">
        <h2>Results for: {poll.title}</h2>
        <p>{poll.description}</p>
        <ul className="results-list">
          {poll.options.map(option => (
            <li key={option.id}>
              <span>{option.text}</span>
              <span>{option.voteCount} votes</span>
              <span>
                {poll.totalVotes > 0
                  ? ((option.voteCount / poll.totalVotes) * 100).toFixed(2) + '%'
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
