# eVote

eVote is a secure, blockchain-based voting application that lets users create and participate in polls. It features a Node.js/Express backend, a React frontend, and smart contracts deployed via Hardhat on Ethereum's Sepolia Test Network.

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Usage](#usage)

## Features
- **User Authentication:** Email/password & Google OAuth.
- **Poll Management:** Create, view, and vote on polls (including blockchain-based options).
- **Real-time Results:** Live updates on poll outcomes.
- **Security:** Rate limiting, input validation, and secure session management.

## Technology Stack
- **Backend:** Node.js, Express, Passport.js, PostgreSQL, Redis, Hardhat
- **Frontend:** React, React Router, Axios, Ethers.js
- **Blockchain:** Ethereum (Sepolia Test Network)
- **Authentication:** Google OAuth 2.0 & Local Strategy

## Prerequisites
- Node.js (v14+)
- PostgreSQL
- Redis (optional for production)
- Git
- MetaMask (for blockchain interactions)
- Hardhat (for smart contract development)

## Installation

### 1. Clone the Repository
`
git clone https://github.com/SamAlbayati2/blockchain-vote.git
`
### 2. Backend Setup
```
cd backend
npm install
cp .env.example .env
```

### 3. Frontend Setup
```
cd ../frontend
npm install
cp .env.example .env
```

### 4. Smart Contract Deployment
```
cd ../backend
npm install --save-dev hardhat @nomiclabs/hardhat-waffle @nomiclabs/hardhat-ethers ethers dotenv
npx hardhat run scripts/deploy.js --network sepolia
```

### 5. Database Setup
- Create a PostgreSQL database (e.g., blockchain_vote_db) and run the provided SQL scripts to set up the necessary tables.

### Environment Variables
- Ensure both backend and frontend .env files are configured correctly. Key variables include:
- Backend: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DATABASE_URL, SESSION_SECRET, INFURA_PROJECT_ID, DEPLOYER_PRIVATE_KEY, etc.
- Frontend: REACT_APP_API_URL

### Running Locally
### 1. Start Backend
```
cd backend
npm start
```

### 2. Start Frontend
```
cd frontend
npm start
```

### Deployment
- Deploy the backend and frontend on your preferred cloud service (e.g., Render, Heroku, AWS). Configure environment variables via the platform’s dashboard and update API URLs accordingly.

### Usage
- Sign Up/In: Use email/password or Google OAuth.
- Create Poll: Choose a normal or blockchain poll.
- Vote & View Results: Participate in polls and see live results.
- Manage Account: Update personal settings securely.

### Troubleshooting
- Server Issues: Verify that environment variables are correct and required services (PostgreSQL, Redis) are running.
- Database Errors: Check your DATABASE_URL and ensure the database is accessible.
- Deployment Problems: Confirm Hardhat configurations and credentials for smart contract deployment.

