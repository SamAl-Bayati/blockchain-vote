**eVote Application**

eVote is a decentralized application (dApp) that allows users to create and participate in both traditional and blockchain-based polls. It leverages blockchain technology to ensure transparency and immutability in voting, while also providing a user-friendly interface for ease of use.

**Table of Contents**

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [1\. Clone the Repository](#1-clone-the-repository)
  - [2\. Backend Setup](#2-backend-setup)
  - [3\. Smart Contract Setup](#3-smart-contract-setup)
  - [4\. Frontend Setup](#4-frontend-setup)
  - [5\. Database Setup](#5-database-setup)
- [Running the Application](#running-the-application)
  - [1\. Start the Backend Server](#1-start-the-backend-server)
  - [2\. Start the Frontend Server](#2-start-the-frontend-server)
- [Blockchain Configuration](#blockchain-configuration)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

**Features**

- **User Authentication**: Secure login and registration using Google OAuth and email/password.
- **Poll Creation**: Create both normal and blockchain-based polls with multiple options.
- **Voting Mechanism**: Vote on polls with transparent and tamper-proof results for blockchain polls.
- **Real-time Results**: View real-time voting results for all polls.
- **Account Management**: Update account settings securely.
- **Responsive Design**: User-friendly interface optimized for various devices.

**Prerequisites**

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**
- **MetaMask** Extension (for interacting with blockchain polls)
- **Hardhat** (for smart contract development and deployment)
- **Solidity Compiler** (compatible with Solidity v0.8.0)

**Installation**

**1\. Clone the Repository**
`
bash
`
Copy code

git clone <https://github.com/yourusername/evote.git>

cd evote

**2\. Backend Setup**

The backend is built with Node.js, Express, and PostgreSQL.

**a. Navigate to the Backend Directory**

bash

Copy code

cd backend

**b. Install Dependencies**

bash

Copy code

npm install

**c. Configure Environment Variables**

Create a .env file in the backend directory based on the provided .env.example:

bash

Copy code

cp .env.example .env

Edit the .env file and populate it with your configuration:

env

Copy code

NODE_ENV=development

PORT=5000

DATABASE_URL=postgresql://username:password@localhost:5432/blockchain_vote_db

SESSION_SECRET=your_session_secret

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

REDIS_URL=redis://localhost:6379

CONTRACT_ADDRESS=your_smart_contract_address

**Environment Variables Explained:**

- NODE_ENV: Set to development or production.
- PORT: Port number for the backend server.
- DATABASE_URL: PostgreSQL connection string.
- SESSION_SECRET: Secret key for session management.
- GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET: Credentials for Google OAuth.
- REDIS_URL: Redis server URL for session storage (optional, used in production).
- CONTRACT_ADDRESS: Address of the deployed smart contract.

**d. Run Database Migrations**

Ensure PostgreSQL is running and execute the necessary SQL scripts to set up the database schema.

You can use a migration tool like [Knex.js](http://knexjs.org/) or manually run the following SQL commands:

sql

Copy code

\-- Create users table

CREATE TABLE users (

id SERIAL PRIMARY KEY,

google_id VARCHAR(255) UNIQUE,

first_name VARCHAR(100),

last_name VARCHAR(100),

email VARCHAR(255) UNIQUE NOT NULL,

password VARCHAR(255),

phone_number VARCHAR(20),

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

\-- Create polls table

CREATE TABLE polls (

id SERIAL PRIMARY KEY,

user_id INTEGER REFERENCES users(id),

title VARCHAR(255) NOT NULL,

description TEXT,

type VARCHAR(50) NOT NULL,

blockchain_id INTEGER,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

\-- Create options table

CREATE TABLE options (

id SERIAL PRIMARY KEY,

poll_id INTEGER REFERENCES polls(id),

text VARCHAR(255) NOT NULL

);

\-- Create votes table

CREATE TABLE votes (

id SERIAL PRIMARY KEY,

user_id INTEGER REFERENCES users(id),

poll_id INTEGER REFERENCES polls(id),

option_id INTEGER REFERENCES options(id),

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

**Note**: Adjust the SQL scripts as needed based on your application's requirements.

**3\. Smart Contract Setup**

The smart contract is written in Solidity and managed using Hardhat.

**a. Navigate to the Contracts Directory**

bash

Copy code

cd contracts

**b. Install Dependencies**

bash

Copy code

npm install

**c. Compile the Smart Contract**

bash

Copy code

npx hardhat compile

**d. Deploy the Smart Contract**

Ensure you have a local blockchain running (e.g., Hardhat Network or Ganache). For development purposes, Hardhat provides a local network.

bash

Copy code

npx hardhat run scripts/deploy.js --network localhost

**Note**: Update deploy.js with the correct deployment script if necessary.

**e. Update the Backend Configuration**

After deploying, copy the deployed contract address and ABI to the backend .env and frontend configuration.

bash

Copy code

\# Example

CONTRACT_ADDRESS=0xYourDeployedContractAddress

Ensure the ABI is accessible to the frontend, either by copying it to the frontend directory or serving it via the backend.

**4\. Frontend Setup**

The frontend is built with React.

**a. Navigate to the Frontend Directory**

bash

Copy code

cd ../../frontend

**b. Install Dependencies**

bash

Copy code

npm install

**c. Configure Environment Variables**

Create a .env file in the frontend directory based on the provided .env.example:

bash

Copy code

cp .env.example .env

Edit the .env file and populate it with your configuration:

env

Copy code

REACT_APP_API_BASE_URL=<http://localhost:5000>

**Environment Variables Explained:**

- REACT_APP_API_BASE_URL: Base URL for the backend API.

**5\. Database Setup**

Ensure PostgreSQL is installed and running. Use the SQL scripts provided in the [Backend Setup](#2-backend-setup) section to set up the necessary tables.

**Running the Application**

**1\. Start the Backend Server**

Ensure you're in the backend directory and run:

bash

Copy code

npm start

**Development Mode**: To run the server with hot-reloading using nodemon:

bash

Copy code

npm run dev

**2\. Start the Frontend Server**

Ensure you're in the frontend directory and run:

bash

Copy code

npm start

This will launch the React application in development mode and open it in your default browser at <http://localhost:3000>.

**Blockchain Configuration**

**MetaMask Setup**

1. **Install MetaMask**: If you haven't already, install the [MetaMask](https://metamask.io/) browser extension.
2. **Switch to Sepolia Test Network**:
    - Open MetaMask.
    - Click on the network selector at the top (e.g., "Ethereum Mainnet").
    - Select "Sepolia Test Network". If it's not available, add it manually:

plaintext

Copy code

Network Name: Sepolia Test Network

RPC URL: <https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID>

Chain ID: 11155111

Currency Symbol: ETH

Block Explorer URL: <https://sepolia.etherscan.io>

1. **Fund Your Account**:
    - Obtain Sepolia ETH from a faucet.

**Smart Contract Interaction**

Ensure the smart contract is deployed on the Sepolia network and the CONTRACT_ADDRESS in your .env files (both backend and frontend) matches the deployed address.

**Environment Variables**

**Backend .env Variables**

env

Copy code

NODE_ENV=development

PORT=5000

DATABASE_URL=postgresql://username:password@localhost:5432/blockchain_vote_db

SESSION_SECRET=your_session_secret

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

REDIS_URL=redis://localhost:6379

CONTRACT_ADDRESS=your_smart_contract_address

**Frontend .env Variables**

env

Copy code

REACT_APP_API_BASE_URL=<http://localhost:5000>

**Note**: Ensure that the REACT_APP_API_BASE_URL matches the backend server's URL.

**Testing**

1. **Backend Testing**:
    - Use tools like [Postman](https://www.postman.com/) to test API endpoints.
    - Ensure that all authentication routes, poll creation, voting, and user updates work as expected.
2. **Frontend Testing**:
    - Interact with the application via the browser.
    - Test user registration, login, poll creation (both normal and blockchain), voting, and viewing results.
3. **Smart Contract Testing**:
    - Use Hardhat's testing framework to write and run unit tests for your smart contracts.
    - Example:

bash

Copy code

npx hardhat test

1. **Integration Testing**:
    - Create multiple polls and ensure each poll operates independently.
    - Verify that blockchain polls correctly interact with the smart contract and that votes are recorded on-chain.

**Troubleshooting**

- **Backend Server Not Starting**:
  - Ensure all environment variables are correctly set in the .env file.
  - Check if PostgreSQL is running and accessible.
  - Verify that the port specified in .env is not in use.
- **Frontend Not Connecting to Backend**:
  - Confirm that the REACT_APP_API_BASE_URL in the frontend .env matches the backend server's URL.
  - Check CORS settings in the backend to allow requests from the frontend's origin.
- **MetaMask Issues**:
  - Ensure MetaMask is installed and connected to the Sepolia Test Network.
  - Verify that your account has sufficient Sepolia ETH for transactions.
  - Check for any network-related errors in the browser console.
- **Smart Contract Errors**:
  - Recompile and redeploy the smart contract if there are mismatches.
  - Ensure the frontend is using the correct ABI and contract address.
  - Check the blockchain network configuration in MetaMask.
- **Database Connection Errors**:
  - Verify the DATABASE_URL in the backend .env file.
  - Ensure PostgreSQL is running and the specified database exists.
  - Check user permissions and credentials.

**Contributing**

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**
2. **Create a New Branch**

bash

Copy code

git checkout -b feature/YourFeatureName

1. **Commit Your Changes**

bash

Copy code

git commit -m "Add some feature"

1. **Push to the Branch**

bash

Copy code

git push origin feature/YourFeatureName

1. **Open a Pull Request**

Provide a clear description of the changes and the issue they address.

**License**

This project is licensed under the [MIT License](LICENSE).
