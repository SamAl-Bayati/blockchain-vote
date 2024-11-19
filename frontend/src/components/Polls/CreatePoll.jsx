import React, { useState } from 'react';
import axios from 'axios';
import Header from '../Home/Header';
import '../../styles/Polls/CreatePoll.css';

const CreatePoll = ({ user }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);

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
    try {
      await axios.post('/polls', {
        title,
        description,
        options,
      });
      // Redirect to polls list
      window.location.href = '/polls';
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  return (
    <div>
      <Header user={user} />
      <main className="create-poll-container">
        <h2>Create a New Poll</h2>
        <form onSubmit={handleSubmit}>
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
                  <button type="button" onClick={() => removeOption(index)}>Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addOption}>Add Option</button>
          </div>
          <button type="submit">Create Poll</button>
        </form>
      </main>
    </div>
  );
};

export default CreatePoll;
