const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Client's address
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200 // Legacy browser support
};
app.use(cors(corsOptions)); // Apply CORS with correct options

app.use(express.json()); // Middleware for parsing JSON bodies

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret', // Use environment variable for the secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true } // Secure in production
}));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect(err => {
  if (err) {
      throw err;
  }
  console.log('MySQL connected...');
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  db.query('INSERT INTO auth_users (email, password) VALUES (?, ?)', [email, hashedPassword], (err, result) => {
      if (err) {
          res.status(500).send('Error registering new user');
      } else {
          res.status(201).send('User registered');
      }
  });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT password, id FROM auth_users WHERE email = ?', [email], async (err, results) => {
      if (err || results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
          res.status(401).send('Authentication failed');
      } else {
          req.session.userId = results[0].id; // Store user ID in session
          res.send({ loggedIn: true, message: 'Logged in successfully' });
      }
  });
});

// General error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
