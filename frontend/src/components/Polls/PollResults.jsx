import React, { useState, useEffect } from 'react';
import Header from '../Home/Header';
import '../../styles/Polls/PollResults.css';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';

const PollResults = ({ user }) => {
  const { pollId } = useParams();
  
  // Separate states for poll metadata and options
  const [pollMetadata, setPollMetadata] = useState(null);
  const [pollOptions, setPollOptions] = useState([]);
  const [isBlockchainPoll, setIsBlockchainPoll] = useState(false);
  const [contractInfo, setContractInfo] = useState(null);

  useEffect(() => {
    const fetchPollResults = async () => {
      try {
        // Fetch poll results from the backend
        const response = await axios.get(`/polls/${pollId}/results`);
        const pollData = response.data.poll;
        const optionsData = response.data.options;

        setPollMetadata(pollData);
        setPollOptions(optionsData);
        setIsBlockchainPoll(pollData.type === 'blockchain');
      } catch (error) {
        console.error('Error fetching poll results:', error);
      }
    };

    fetchPollResults();
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
    const loadBlockchainPollResults = async () => {
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
        let totalVotes = 0;

        for (let i = 0; i < pollData[4]; i++) {
          const option = await pollContract.getOption(pollId, i);
          const voteCount = option[1].toNumber();
          totalVotes += voteCount;
          options.push({ id: i, text: option[0], voteCount: voteCount });
        }

        setPollMetadata({
          id: pollData[0].toNumber(),
          title: pollData[2],
          description: pollData[3],
          totalVotes: totalVotes,
        });
        setPollOptions(options);
      } catch (error) {
        console.error('Error loading blockchain poll results:', error);
      }
    };

    if (isBlockchainPoll && contractInfo) {
      loadBlockchainPollResults();
    }
  }, [pollId, isBlockchainPoll, contractInfo]);

  if (!pollMetadata || pollOptions.length === 0) {
    return <div>Loading...</div>;
  }

  const totalVotes = isBlockchainPoll
    ? pollMetadata.totalVotes
    : pollOptions.reduce((sum, option) => sum + parseInt(option.votes_count || 0), 0);

  return (
    <div>
      <Header user={user} />
      <main className="poll-results-container">
        <h2>Results for: {pollMetadata.title}</h2>
        <p>{pollMetadata.description}</p>
        <ul className="results-list">
          {pollOptions.map((option) => {
            const voteCount = isBlockchainPoll
              ? option.voteCount
              : parseInt(option.votes_count || 0);

            const percentage =
              totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(2) + '%' : '0%';

            return (
              <li key={option.id}>
                <span>{option.text}</span>
                <span>{voteCount} votes</span>
                <span>{percentage}</span>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
};

export default PollResults;
