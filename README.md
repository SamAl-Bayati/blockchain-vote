**eVote**

**eVote** is a secure, blockchain-based voting application that allows users to create and participate in polls. The project comprises a backend server built with Node.js and Express, a frontend application developed using React, and smart contracts deployed on the blockchain using Hardhat. This README provides comprehensive instructions on how to set up and run the project on your local machine or deploy it using a cloud service provider.

**Table of Contents**

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
    - [Smart Contract Deployment](#smart-contract-deployment)
    - [Database Setup](#database-setup)
5. [Environment Variables](#environment-variables)
6. [Running the Application Locally](#running-the-application-locally)
7. [Deployment to Cloud Services](#deployment-to-cloud-services)
    - [Backend Deployment](#backend-deployment)
    - [Frontend Deployment](#frontend-deployment)
    - [Smart Contract Deployment](#smart-contract-deployment-cloud)
8. [Usage](#usage)
9. [Troubleshooting](#troubleshooting)
10. [License](#license)

### Features

- **User Authentication:** Register and log in using email/password or Google OAuth 2.0.
- **Poll Management:** Create, view, and participate in polls.
- **Blockchain Integration:** Option to create polls that leverage blockchain technology for vote recording.
- **Real-time Results:** View live poll results with vote counts.
- **Account Settings:** Update user information securely.
- **Security:** Implements best practices including rate limiting, input validation, and secure session management.

**Technology Stack**

- **Backend:** Node.js, Express, Passport.js, PostgreSQL, Redis, Hardhat
- **Frontend:** React, React Router, Axios, Ethers.js
- **Blockchain:** Ethereum (Sepolia Test Network)
- **Authentication:** Google OAuth 2.0, Local Strategy
- **Deployment:** Supports deployment on cloud platforms like Render, Heroku, AWS, etc.

**Prerequisites**

Before you begin, ensure you have met the following requirements:

- **Node.js** (v14 or higher) and **npm** installed. Download from [Node.js Official Site](https://nodejs.org/).
- **PostgreSQL** installed and running. Download from [PostgreSQL Official Site](https://www.postgresql.org/).
- **Redis** installed (optional for production).
- **Git** installed. Download from [Git Official Site](https://git-scm.com/).
- **MetaMask** extension installed in your browser for blockchain interactions.
- **Hardhat** for smart contract development.

**Installation**

Follow these steps to set up and run the project on your local machine.

**1\. Clone the Repository**

`

git clone <https://github.com/SamAlbayati2/blockchain-vote>

`

**2\. Backend Setup**

**a. Navigate to the Backend Directory**

`

cd backend
`

**b. Install Dependencies**

Ensure you are in the backend directory and run:

`

npm install
`

**c. Configure Environment Variables**

Create a .env file in the backend directory based on the provided .env template. You can copy the sample .env and fill in your own values.

`

cp .env.example .env
`

**.env Example:**

`

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

REDIS_URL=redis://localhost:6379

NODE_ENV=development

SESSION_SECRET=your_session_secret

DATABASE_URL=postgresql://username:password@localhost:5432/blockchain_vote_db

GOOGLE_CALLBACK_URL=<http://localhost:5000/auth/google/callback>

CLIENT_URL=<http://localhost:3000>

INFURA_PROJECT_ID=your_infura_project_id

DEPLOYER_PRIVATE_KEY=your_deployer_private_key

SEPOLIA_EP=<https://sepolia.infura.io/v3/your_infura_project_id>

CONTRACT_ADDRESS=your_deployed_contract_address

ARTIFACTS_PATH=../artifacts
`

**Environment Variables Description:**

- GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET: Credentials for Google OAuth. Obtain these from the Google Developers Console.
- REDIS_URL: URL for Redis server. Required in production for session storage.
- NODE_ENV: Set to development or production.
- SESSION_SECRET: A strong secret key for session encryption.
- DATABASE_URL: Connection string for your PostgreSQL database.
- GOOGLE_CALLBACK_URL: OAuth callback URL, e.g., <http://localhost:5000/auth/google/callback>.
- CLIENT_URL: URL where the frontend is hosted, e.g., <http://localhost:3000>.
- INFURA_PROJECT_ID: Your Infura project ID for connecting to Ethereum networks.
- DEPLOYER_PRIVATE_KEY: Private key of the Ethereum account deploying the smart contract.
- SEPOLIA_EP: Ethereum Sepolia Test Network endpoint, e.g., <https://sepolia.infura.io/v3/your_infura_project_id>.
- CONTRACT_ADDRESS: Address of the deployed PollContract.
- ARTIFACTS_PATH: Path to smart contract artifacts.

**d. Database Setup**

Ensure PostgreSQL is installed and running. Create the required database and tables.

1. **Create Database:**

`

psql -U postgres
`

In the psql shell:

`

CREATE DATABASE blockchain_vote_db;

\\c blockchain_vote_db

1. **Create Tables:**

Execute the following SQL commands to create the necessary tables:

sql

Copy code

\-- Users Table

CREATE TABLE users (

id SERIAL PRIMARY KEY,

google_id VARCHAR(255),

first_name VARCHAR(255) NOT NULL,

last_name VARCHAR(255) NOT NULL,

email VARCHAR(255) NOT NULL UNIQUE,

password VARCHAR(255),

phone_number VARCHAR(50),

created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

);

\-- Polls Table

CREATE TABLE polls (

id SERIAL PRIMARY KEY,

user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

title VARCHAR(255) NOT NULL,

description TEXT,

type VARCHAR(20) NOT NULL DEFAULT 'normal',

blockchain_id INTEGER,

created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

);

\-- Options Table

CREATE TABLE options (

id SERIAL PRIMARY KEY,

poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,

text VARCHAR(255) NOT NULL,

created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

);

\-- Votes Table

CREATE TABLE votes (

id SERIAL PRIMARY KEY,

user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

option_id INTEGER NOT NULL REFERENCES options(id) ON DELETE CASCADE,

poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,

created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

);

\-- Indexes for performance

CREATE INDEX idx_options_poll_id ON options(poll_id);

CREATE INDEX idx_polls_user_id ON polls(user_id);
`

**e. Install and Configure Redis (Optional for Development)**

Redis is used for session storage in production environments. For local development, it's optional but recommended.

- **Install Redis:**
  - **macOS:**

`

brew install redis
`

- - **Ubuntu/Debian:**

`

sudo apt update

sudo apt install redis-server
`

- **Start Redis Server:**

`

redis-server
`

**f. Start the Backend Server**

Ensure you are in the backend directory and run:

`

npm start
`

The server should start on <http://localhost:5000>.

**3\. Frontend Setup**

**a. Navigate to the Frontend Directory**

Open a new terminal window/tab and navigate to the frontend directory:

`

cd frontend
`

**b. Install Dependencies**

Ensure you are in the frontend directory and run:

`

npm install
`

**c. Configure Environment Variables**

Create a .env file in the frontend directory based on the provided .env template.

`

cp .env.example .env
`

**.env Example:**

`

REACT_APP_API_URL=<http://localhost:5000>
`

**Environment Variables Description:**

- REACT_APP_API_URL: URL where the backend server is running, e.g., <http://localhost:5000>.

**d. Start the Frontend Application**

Ensure you are in the frontend directory and run:

`

npm start
`

The frontend should start on <http://localhost:3000> and automatically open in your default browser.

**4\. Smart Contract Deployment**

**a. Navigate to the Backend Directory**

Ensure you are in the backend directory:

`

cd backend
`

**b. Install Hardhat and Dependencies**

If not already installed, install Hardhat and necessary plugins:

`

npm install --save-dev hardhat @nomiclabs/hardhat-waffle @nomiclabs/hardhat-ethers ethers dotenv
`

**c. Configure Hardhat**

Ensure the hardhat.config.js file is properly set with your Infura project ID and deployer private key in the .env file.

`

require('@nomiclabs/hardhat-waffle');

require('@nomiclabs/hardhat-ethers');

require('dotenv').config();

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

module.exports = {

solidity: '0.8.0',

networks: {

sepolia: {

url: \`<https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}\`>,

accounts: \[\`${DEPLOYER_PRIVATE_KEY}\`\],

},

},

};
`

**d. Deploy the Smart Contract**

Run the deployment script using Hardhat:

`

npx hardhat run scripts/deploy.js --network sepolia
`
**Output:**

`

PollContract deployed to: 0xYourContractAddress
`
Copy the deployed contract address and update the CONTRACT_ADDRESS in your backend .env file.

**5\. Database Setup**

If you followed the [Database Setup](#database-setup) section in the Backend Setup, your PostgreSQL database should be ready with the necessary tables.

**Environment Variables**

Ensure that both the backend and frontend have their respective .env files configured with the necessary environment variables. Refer to the [Backend Setup](#backend-setup) and [Frontend Setup](#frontend-setup) sections for detailed information.

**Running the Application Locally**

After completing the installation steps:

1. **Start the Backend Server:**

`

cd backend

npm start
`
1. **Start the Frontend Application:**

Open a new terminal window/tab:

`

cd frontend

npm start
`

1. **Access the Application:**

Open your browser and navigate to <http://localhost:3000>.

**Deployment to Cloud Services**

You can deploy the backend and frontend to cloud service providers like [Render](https://render.com/), [Heroku](https://www.heroku.com/), [AWS](https://aws.amazon.com/), etc. Below are general guidelines for deploying to cloud platforms.

**1\. Backend Deployment**

**a. Choose a Cloud Provider**

For example, using **Render**:

1. **Create an Account:** Sign up at [Render](https://render.com/).
2. **Create a New Web Service:**
    - Connect your GitHub repository.
    - Select the backend directory.
    - Choose Node.js as the environment.
    - Set environment variables in Render based on your .env file.
3. **Deploy:**

Render will automatically build and deploy your backend service. Ensure that the DATABASE_URL, REDIS_URL, and other secrets are securely set in the Render dashboard.

**b. Configure Domain and SSL**

Render provides automatic SSL. Ensure that your frontend is aware of the deployed backend URL.

**2\. Frontend Deployment**

**a. Choose a Cloud Provider**

For example, using **Render** or **Vercel**:

1. **Create an Account:** Sign up at [Render](https://render.com/) or [Vercel](https://vercel.com/).
2. **Connect Repository:**
    - Select the frontend directory.
    - Configure build commands and publish directory (usually build for React).
3. **Set Environment Variables:**
    - Set REACT_APP_API_URL to your deployed backend URL.
4. **Deploy:**

The platform will build and deploy your frontend application. Ensure that API calls point to the correct backend URL.

**3\. Smart Contract Deployment on Cloud**

If deploying smart contracts directly from a cloud server:

1. **Ensure Hardhat is Installed:** Install Hardhat and dependencies on the cloud server.
2. **Configure .env:** Set INFURA_PROJECT_ID and DEPLOYER_PRIVATE_KEY securely.
3. **Deploy Contracts:**

`

npx hardhat run scripts/deploy.js --network sepolia
`

1. **Update Backend .env:** Set CONTRACT_ADDRESS to the deployed contract address.

**Usage**

1. **Access the Application:**

Navigate to your frontend URL (e.g., <http://localhost:3000> or your deployed frontend URL).

1. **Sign Up / Sign In:**
    - Register using your email and password or sign in with Google OAuth.
2. **Create a Poll:**
    - Navigate to the "Create Poll" section.
    - Choose between a normal poll or a blockchain poll.
    - Fill in the poll details and options.
    - Submit to create the poll.
3. **Participate in a Poll:**
    - Browse available polls.
    - Select a poll to view its details.
    - Vote on your preferred option.
4. **View Poll Results:**
    - After voting, view the results which include vote counts and percentages.
5. **Manage Account Settings:**
    - Update your personal information in the "Account Settings" section.

**Troubleshooting**

- **Backend Server Not Starting:**
  - Ensure all environment variables are correctly set.
  - Check if PostgreSQL and Redis servers are running.
  - Verify that ports 5000 (backend) and 3000 (frontend) are not in use.
- **Database Connection Issues:**
  - Verify the DATABASE_URL in the backend .env file.
  - Ensure PostgreSQL is running and accessible.
- **Smart Contract Deployment Errors:**
  - Check your INFURA_PROJECT_ID and DEPLOYER_PRIVATE_KEY.
  - Ensure your deployer account has sufficient funds on the Sepolia Test Network.
  - Verify network configurations in hardhat.config.js.
- **Frontend API Calls Failing:**
  - Ensure the REACT_APP_API_URL is correctly set to your backend URL.
  - Check CORS settings in the backend.
- **Google OAuth Issues:**
  - Confirm that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct.
  - Ensure that the OAuth callback URL is correctly set in both Google Developers Console and the backend .env file.
    

**License**

This project is licensed under the [MIT License](LICENSE).
