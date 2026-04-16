const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const Database = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5500;

// Database setup
const db = new Database.Database('rsa_app.db');

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT,
      public_key TEXT,
      private_key TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER,
      receiver_id INTEGER,
      ciphertext TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id)
    )
  `);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'rsa-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(path.join(__dirname, 'login.html'));
  }
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).send('Database error');
    if (user && bcrypt.compareSync(password, user.password_hash)) {
      req.session.userId = user.id;
      res.redirect('/dashboard');
    } else {
      res.send('Invalid credentials');
    }
  });
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashedPassword], function(err) {
    if (err) {
      res.send('Username already exists');
    } else {
      res.redirect('/login');
    }
  });
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/encrypt', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'encrypt.html'));
});

app.get('/decrypt', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'decrypt.html'));
});

app.post('/generate-keys', requireAuth, (req, res) => {
  const { bits } = req.body;
  // Use the existing RSA functions from script.js logic
  // For simplicity, we'll simulate key generation here
  // In a real app, you'd import the JS functions or rewrite in Node
  const publicKey = `n=123456789\ne=65537`; // Placeholder
  const privateKey = `n=123456789\ne=65537\nd=987654321`; // Placeholder

  db.run('UPDATE users SET public_key = ?, private_key = ? WHERE id = ?', [publicKey, privateKey, req.session.userId], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ publicKey, privateKey });
  });
});

app.get('/users', requireAuth, (req, res) => {
  db.all('SELECT id, username, public_key FROM users WHERE id != ?', [req.session.userId], (err, users) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(users);
  });
});

app.post('/encrypt', requireAuth, (req, res) => {
  const { plaintext, receiverId } = req.body;
  // Encrypt logic here
  const ciphertext = `encrypted_${plaintext}`; // Placeholder

  db.run('INSERT INTO messages (sender_id, receiver_id, ciphertext) VALUES (?, ?, ?)', [req.session.userId, receiverId, ciphertext], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

app.get('/messages', requireAuth, (req, res) => {
  db.all(`
    SELECT m.*, u.username as sender_name
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.receiver_id = ?
  `, [req.session.userId], (err, messages) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(messages);
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
