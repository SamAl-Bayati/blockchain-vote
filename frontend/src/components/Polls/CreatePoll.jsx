// CreatePoll.jsx

import React, { useState, useEffect } from 'react';
import Header from '../Home/Header';
import '../../styles/Polls/CreatePoll.css';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';

const CreatePoll = ({ user, onLogout }) => {
  const [pollType, setPollType] = useState('normal'); // New state for poll type
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const navigate = useNavigate();

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

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pollType === 'blockchain') {
      // Handle blockchain poll creation
      if (!window.ethereum) {
        alert('Please install MetaMask to interact with the blockchain.');
        return;
      }

      if (!contractInfo) {
        alert('Contract information not loaded yet.');
        return;
      }

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

        // Create the poll and wait for the transaction to be mined
        const tx = await pollContract.createPoll(title, description, options);
        const receipt = await tx.wait();

        // Parse the event logs to get the poll ID
        const event = receipt.events.find((event) => event.event === 'PollCreated');
        if (!event) {
          throw new Error('PollCreated event not found in transaction receipt.');
        }

        const newPollId = event.args.id.toNumber(); // Updated to match the event parameter name

        // Send poll data to the backend for synchronization
        const pollData = {
          blockchainId: newPollId, // Ensure this matches the backend's expected field
          title,
          description,
          options,
          type: 'blockchain',
        };

        await axios.post('/polls', pollData);

        alert('Blockchain poll created successfully!');
        navigate('/polls');
      } catch (error) {
        console.error('Error creating blockchain poll:', error);
        alert('Error creating blockchain poll. See console for details.');
      }
    } else {
      // Handle normal poll creation
      try {
        const pollData = {
          title,
          description,
          options,
          type: 'normal',
        };

        await axios.post('/polls', pollData);
        alert('Normal poll created successfully!');
        navigate('/polls');
      } catch (error) {
        console.error('Error creating normal poll:', error);
        alert('Error creating normal poll. See console for details.');
      }
    }
  };

  return (
    <div>
      <Header user={user} onLogout={onLogout} />
      <main className="create-poll-container">
        <h2>Create a New Poll</h2>
        <form onSubmit={handleSubmit}>
          {/* Poll Type Selection */}
          <div className="form-group">
            <label>Poll Type:</label>
            <select value={pollType} onChange={(e) => setPollType(e.target.value)}>
              <option value="normal">Normal Poll</option>
              <option value="blockchain">Blockchain Poll</option>
            </select>
          </div>

          <div className="form-group">
            <label>Title:</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Options:</label>
            {options.map((option, index) => (
              <div key={index} className="option-input">
                <input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required
                />
                {options.length > 2 && (
                  <button type="button" onClick={() => removeOption(index)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addOption}>
              Add Option
            </button>
          </div>
          <button type="submit">Create Poll</button>
        </form>
      </main>
    </div>
  );
};

export default CreatePoll;
