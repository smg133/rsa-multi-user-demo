# RSA Public Key Cryptography

A browser-based RSA demo implementing 1024-bit and 2048-bit key generation, message encryption, and decryption using the Web Crypto API.

## Files

- `index.html` — main page and app layout
- `styles.css` — styling for a modern UI
- `script.js` — RSA key generation, encryption, and decryption logic

## Usage

1. Open `index.html` in your browser, or run the local server below.
2. Choose either 1024-bit or 2048-bit RSA key size.
3. Click **Generate Keys**.
4. Enter plaintext and click **Encrypt** to produce Base64 ciphertext.
5. Paste ciphertext into the decrypt field and click **Decrypt**.

## Run locally with server

1. Install Node.js if needed.
2. Open a terminal in this folder.
3. Run `npm start`.
4. Open `http://localhost:5500` in your browser.

> For the best experience, use a modern browser such as Chrome, Edge, or Firefox.
