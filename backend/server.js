const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();
const RedisStore = require('connect-redis').default;
const redis = require('redis');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const helmet = require('helmet');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const FRONTEND_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : 'https://evote-89pd.onrender.com';

const BACKEND_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000'
  : 'https://api-evote.onrender.com';

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_ENV = 'development';
}

console.log('Current environment:', process.env.NODE_ENV);
console.log('Frontend URL:', FRONTEND_URL);
console.log('Backend URL:', BACKEND_URL);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(express.json());
app.set('trust proxy', 1);

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per window
});
app.use(limiter);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Helper functions to interact with the database
async function findUserByGoogleId(googleId) {
  const result = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  return result.rows[0];
}

async function createUser(userData) {
  const { googleId, firstName, lastName, email, phoneNumber } = userData;
  const result = await pool.query(
    `INSERT INTO users (google_id, first_name, last_name, email, phone_number)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [googleId, firstName, lastName, email, phoneNumber]
  );
  return result.rows[0];
}

async function findUserById(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
};

// Configure Redis for session storage in production
if (process.env.NODE_ENV === 'production') {
  const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.connect().catch(console.error);
  redisClient.on('connect', () => console.log('Connected to Redis successfully.'));
  redisClient.on('error', (err) => console.error('Redis connection error:', err));

  sessionConfig.store = new RedisStore({ client: redisClient });
}

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport with Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await findUserByGoogleId(profile.id);
        if (!user) {
          user = await createUser({
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Configure Passport with Local strategy for email/password authentication
passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
      if (!user) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }
      if (!user.password) {
        return done(null, false, { message: 'Please log in with Google.' });
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// Serialize user ID to store in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session using the stored ID
passport.deserializeUser(async (id, done) => {
  try {
    const user = await findUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Authentication Routes

// Register a new user
app.post(
  '/auth/register',
  [
    body('firstName').isString(),
    body('lastName').isString(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('phoneNumber').optional().isMobilePhone(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, phoneNumber } = req.body;

    try {
      // Check if the email already exists
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'Email already in use.' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const result = await pool.query(
        `INSERT INTO users (first_name, last_name, email, password, phone_number)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [firstName, lastName, email, hashedPassword, phoneNumber]
      );
      const newUser = result.rows[0];

      // Automatically log in the new user
      req.login(newUser, (err) => {
        if (err) return next(err);
        res.json({
          message: 'Registration successful',
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.first_name || newUser.firstName,
            lastName: newUser.last_name || newUser.lastName,
            displayName: `${newUser.first_name || newUser.firstName} ${
              newUser.last_name || newUser.lastName
            }`,
          },
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Log in an existing user
app.post(
  '/auth/login',
  [body('email').isEmail(), body('password').exists()],
  (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(400).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) return next(err);
        res.json({
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name || user.firstName,
            lastName: user.last_name || user.lastName,
            displayName: `${user.first_name || user.firstName} ${
              user.last_name || user.lastName
            }`,
          },
        });
      });
    })(req, res, next);
  }
);

// Retrieve contract information
app.get('/contract-info', (req, res) => {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const abiPath = path.join(__dirname, 'artifacts/contracts/poll.sol/PollContract.json');

  try {
    const abiFileContent = fs.readFileSync(abiPath, 'utf8');
    const abiJson = JSON.parse(abiFileContent);
    const abi = abiJson.abi;
    res.json({ contractAddress, abi });
  } catch (error) {
    console.error('Error reading ABI file:', error);
    return res.status(500).json({ error: 'Failed to load contract ABI from server.' });
  }
});

// OAuth Routes

// Initiate Google OAuth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Google OAuth callback
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}`);
  }
);

// Check if the user is authenticated
app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    const userData = {
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.first_name || req.user.firstName,
        lastName: req.user.last_name || req.user.lastName,
        displayName: `${req.user.first_name || req.user.firstName} ${
          req.user.last_name || req.user.lastName
        }`,
      },
    };
    res.json(userData);
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// Update user information
app.put('/auth/user', ensureAuthenticated, async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, email } = req.body;

  try {
    await pool.query(
      `UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE id = $4`,
      [firstName, lastName, email, userId]
    );
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Logout the user
app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to log out' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ error: 'Failed to destroy session' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
}

// Poll Routes

// Create a new poll
app.post(
  '/polls',
  ensureAuthenticated,
  [
    body('title').isString(),
    body('description').optional().isString(),
    body('options').isArray({ min: 2 }),
    body('type').isIn(['normal', 'blockchain']),
    body('blockchainId').optional().isInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { blockchainId, title, description, options, type } = req.body;
    const userId = req.user.id;

    try {
      // Insert the poll, including blockchainId if provided
      const pollResult = await pool.query(
        `INSERT INTO polls (user_id, title, description, type, blockchain_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [userId, title, description, type, blockchainId || null]
      );

      const pollId = pollResult.rows[0].id;

      // Insert options
      const optionPromises = options.map((optionText) =>
        pool.query(
          `INSERT INTO options (poll_id, text)
           VALUES ($1, $2) RETURNING *`,
          [pollId, optionText]
        )
      );

      const optionResults = await Promise.all(optionPromises);

      res.json({
        poll: pollResult.rows[0],
        options: optionResults.map((result) => result.rows[0]),
      });
    } catch (error) {
      console.error('Error creating poll:', error.stack);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }
);

// Retrieve all polls
app.get('/polls', ensureAuthenticated, async (req, res) => {
  try {
    const pollsResult = await pool.query(
      `SELECT polls.*, users.first_name, users.last_name
       FROM polls
       JOIN users ON polls.user_id = users.id`
    );

    res.json(pollsResult.rows);
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Retrieve poll details
app.get('/polls/:pollId', ensureAuthenticated, async (req, res) => {
  const { pollId } = req.params;

  try {
    const pollResult = await pool.query('SELECT * FROM polls WHERE id = $1', [pollId]);
    const optionsResult = await pool.query('SELECT * FROM options WHERE poll_id = $1', [pollId]);

    res.json({
      poll: pollResult.rows[0],
      options: optionsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching poll details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Vote on a poll
app.post(
  '/polls/:pollId/vote',
  ensureAuthenticated,
  [body('optionId').isInt()],
  async (req, res) => {
    const { pollId } = req.params;
    const { optionId } = req.body;
    const userId = req.user.id;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user has already voted on this poll
      const voteCheck = await pool.query(
        `SELECT * FROM votes WHERE user_id = $1 AND poll_id = $2`,
        [userId, pollId]
      );

      if (voteCheck.rows.length > 0) {
        return res.status(400).json({ message: 'You have already voted on this poll.' });
      }

      // Insert vote
      await pool.query(
        `INSERT INTO votes (user_id, option_id, poll_id)
         VALUES ($1, $2, $3)`,
        [userId, optionId, pollId]
      );

      res.json({ message: 'Vote recorded successfully.' });
    } catch (error) {
      console.error('Error recording vote:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Retrieve poll results with vote counts
app.get('/polls/:pollId/results', ensureAuthenticated, async (req, res) => {
  const { pollId } = req.params;

  try {
    const pollResult = await pool.query('SELECT * FROM polls WHERE id = $1', [pollId]);
    const optionsResult = await pool.query(
      `SELECT options.*, COUNT(votes.id) as votes_count
       FROM options
       LEFT JOIN votes ON options.id = votes.option_id
       WHERE options.poll_id = $1
       GROUP BY options.id`,
      [pollId]
    );

    res.json({
      poll: pollResult.rows[0],
      options: optionsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching poll results:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Check if the user has already voted on a poll
app.get('/polls/:pollId/hasVoted', ensureAuthenticated, async (req, res) => {
  const { pollId } = req.params;
  const userId = req.user.id;

  try {
    const voteCheck = await pool.query(
      `SELECT * FROM votes WHERE user_id = $1 AND poll_id = $2`,
      [userId, pollId]
    );

    res.json({ hasVoted: voteCheck.rows.length > 0 });
  } catch (error) {
    console.error('Error checking vote status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});
