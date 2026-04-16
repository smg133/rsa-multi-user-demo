# RSA Secure Messaging App

A web application for secure messaging using RSA public-key cryptography. Users can register, generate RSA keys, and exchange encrypted messages.

## Features

- User registration and login
- RSA key pair generation (1024/2048 bits)
- Secure message encryption and decryption
- User-to-user messaging with automatic public key lookup
- Manual public key entry option

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open http://localhost:5500 in your browser

## Usage

1. Register a new account or login
2. Generate your RSA key pair in the dashboard
3. Go to Encrypt to send messages to other users
4. Go to Decrypt to view and decrypt received messages

## Files

- `server.js` — Express server with SQLite database
- `login.html` — Login page
- `register.html` — Registration page
- `dashboard.html` — User dashboard for key management
- `encrypt.html` — Message encryption interface
- `decrypt.html` — Message decryption interface
- `styles.css` — Modern UI styling

1. Install Node.js if needed.
2. Open a terminal in this folder.
3. Run `npm start`.
4. Open `http://localhost:5500` in your browser.

> For the best experience, use a modern browser such as Chrome, Edge, or Firefox.
