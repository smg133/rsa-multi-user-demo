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

2. Start the server locally:
   ```
   npm start
   ```

3. Open http://localhost:5500 in your browser

## Deployment

This app can be deployed to services like Render, Railway, Heroku, or any Node.js host.

### Deploy on Render

1. Push your code to GitHub.
2. Log in to Render and create a new **Web Service**.
3. Connect your GitHub repository.
4. Use the `main` branch.
5. Set the build command to:
   ```
   npm install
   ```
6. Set the start command to:
   ```
   npm start
   ```
7. Render will provide a public URL like `https://your-app.onrender.com`.

### Deploy on Railway

1. Connect your GitHub repo to Railway.
2. Create a new project from repository.
3. Railway detects your Node app automatically.
4. Confirm `npm install` and `npm start`.
5. Railway gives you a public URL.

## Public access and Google

- After deployment, your site is publicly available at the provided URL.
- Share that URL from another website to help Google discover it.
- If you want Google to index the site, you can submit the URL in Google Search Console.

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
