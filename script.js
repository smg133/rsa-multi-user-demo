const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

const addUserButton = document.getElementById("add-user");
const usersList = document.getElementById("users-list");

const recipientSelect = document.getElementById("recipient-select");
const encryptPublicKeyArea = document.getElementById("encrypt-public-key");
const plaintextArea = document.getElementById("plaintext");
const ciphertextArea = document.getElementById("ciphertext");
const encryptButton = document.getElementById("encrypt");

const decryptUserSelect = document.getElementById("decrypt-user-select");
const ciphertextDecryptArea = document.getElementById("ciphertext-decrypt");
const decryptedTextArea = document.getElementById("decrypted-text");
const decryptButton = document.getElementById("decrypt");

let users = [];

function utf8ToBytes(text) {
  return new TextEncoder().encode(text);
}

function bytesToUtf8(bytes) {
  return new TextDecoder().decode(bytes);
}

function bytesToBigInt(bytes) {
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return BigInt("0x" + hex);
}

function bigIntToBytes(value) {
  let hex = value.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  return new Uint8Array(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
}

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function randomBigInt(bits) {
  const bytes = randomBytes(Math.ceil(bits / 8));
  if (bits % 8) {
    const mask = 0xff >> (8 - (bits % 8));
    bytes[0] &= mask;
  }
  bytes[0] |= 1 << ((bits - 1) % 8);
  bytes[bytes.length - 1] |= 1;
  return bytesToBigInt(bytes);
}

function modPow(base, exponent, modulus) {
  let result = 1n;
  let power = base % modulus;
  let exp = exponent;
  while (exp > 0n) {
    if (exp & 1n) result = (result * power) % modulus;
    power = (power * power) % modulus;
    exp >>= 1n;
  }
  return result;
}

function gcd(a, b) {
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

function egcd(a, b) {
  if (b === 0n) return [1n, 0n, a];
  const [x, y, g] = egcd(b, a % b);
  return [y, x - (a / b) * y, g];
}

function modInverse(a, m) {
  const [x, , g] = egcd(a, m);
  if (g !== 1n) throw new Error("No modular inverse");
  return ((x % m) + m) % m;
}

function isProbablePrime(n, rounds = 6) {
  if (n < 2n) return false;
  const smallPrimes = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n];
  for (const p of smallPrimes) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }

  let d = n - 1n;
  let s = 0;
  while (d % 2n === 0n) {
    d /= 2n;
    s += 1;
  }

  for (let i = 0; i < rounds; i += 1) {
    const a = 2n + bytesToBigInt(randomBytes((n.toString(2).length + 7) >> 3)) % (n - 3n);
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;

    let witness = false;
    for (let j = 1; j < s; j += 1) {
      x = modPow(x, 2n, n);
      if (x === n - 1n) {
        witness = true;
        break;
      }
    }
    if (witness) continue;
    return false;
  }

  return true;
}

function generatePrime(bits) {
  while (true) {
    const candidate = randomBigInt(bits);
    if (isProbablePrime(candidate)) return candidate;
  }
}

function generateRsaKeyPair(bits) {
  const e = 65537n;
  let p, q, n, phi, d;
  do {
    p = generatePrime(bits / 2);
    q = generatePrime(bits / 2);
  } while (p === q);

  n = p * q;
  phi = (p - 1n) * (q - 1n);

  if (gcd(e, phi) !== 1n) return generateRsaKeyPair(bits);

  d = modInverse(e, phi);
  return { n, e, d };
}

function formatKey(key) {
  return `n=${key.n}\ne=${key.e}\nd=${key.d}`;
}

function encodeMessageToBigInt(message) {
  return bytesToBigInt(utf8ToBytes(message));
}

function decodeBigIntToMessage(value) {
  return bytesToUtf8(bigIntToBytes(value));
}

function encryptWithPublicKey(message, publicKey) {
  const m = encodeMessageToBigInt(message);
  if (m >= publicKey.n) {
    throw new Error("Message too long for key size.");
  }
  return modPow(m, publicKey.e, publicKey.n);
}

function decryptWithPrivateKey(cipherBigInt, privateKey) {
  return decodeBigIntToMessage(modPow(cipherBigInt, privateKey.d, privateKey.n));
}

function parsePublicKey(input) {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const key = {};
  for (const line of lines) {
    const parts = line.split("=");
    if (parts.length !== 2) continue;
    const name = parts[0].trim();
    const value = parts[1].trim();
    if (name === "n" || name === "e") {
      key[name] = BigInt(value);
    }
  }
  if (!key.n || !key.e) {
    throw new Error("Public key must include n and e in the form n=... and e=...");
  }
  return key;
}

function addUser() {
  const user = {
    name: `User ${users.length + 1}`,
    key: null,
    element: null
  };
  users.push(user);
  renderUsers();
  updateSelects();
}

function renderUsers() {
  usersList.innerHTML = "";
  users.forEach((user, index) => {
    const card = document.createElement("div");
    card.className = "user-card";
    card.innerHTML = `
      <input type="text" class="user-name" value="${user.name}" placeholder="User Name">
      <div class="button-row key-actions">
        <label>Key size</label>
        <select class="key-size">
          <option value="1024">1024 bits</option>
          <option value="2048" selected>2048 bits</option>
        </select>
        <button class="generate-key" type="button">Generate Keys</button>
        <button class="copy-public-key" type="button">Copy Public Key</button>
        <button class="copy-private-key" type="button">Copy Private Key</button>
        <button class="remove-user" type="button">Remove</button>
      </div>
      <div class="key-grid">
        <div>
          <h3>Public Key</h3>
          <textarea class="public-key" readonly rows="6" placeholder="Public key appears here..."></textarea>
        </div>
        <div>
          <h3>Private Key</h3>
          <textarea class="private-key" readonly rows="6" placeholder="Private key appears here..."></textarea>
        </div>
      </div>
    `;
    user.element = card;
    usersList.appendChild(card);

    const nameInput = card.querySelector(".user-name");
    nameInput.addEventListener("input", () => {
      user.name = nameInput.value;
      updateSelects();
    });

    const generateBtn = card.querySelector(".generate-key");
    generateBtn.addEventListener("click", () => generateUserKeys(index));

    const copyPubBtn = card.querySelector(".copy-public-key");
    copyPubBtn.addEventListener("click", () => copyUserPublicKey(index));

    const copyPrivBtn = card.querySelector(".copy-private-key");
    copyPrivBtn.addEventListener("click", () => copyUserPrivateKey(index));

    const removeBtn = card.querySelector(".remove-user");
    removeBtn.addEventListener("click", () => removeUser(index));
  });
}

function updateSelects() {
  recipientSelect.innerHTML = '<option value="">Select Recipient</option>';
  decryptUserSelect.innerHTML = '<option value="">Select User</option>';
  users.forEach((user, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = user.name;
    recipientSelect.appendChild(option.cloneNode(true));
    decryptUserSelect.appendChild(option);
  });
}

function generateUserKeys(index) {
  const user = users[index];
  const card = user.element;
  const keySize = parseInt(card.querySelector(".key-size").value, 10);
  const generateBtn = card.querySelector(".generate-key");
  const pubArea = card.querySelector(".public-key");
  const privArea = card.querySelector(".private-key");

  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  setTimeout(() => {
    user.key = generateRsaKeyPair(keySize);
    pubArea.value = `n=${user.key.n}\ne=${user.key.e}`;
    privArea.value = formatKey(user.key);
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate Keys";
    updateSelects();
  }, 50);
}

function copyUserPublicKey(index) {
  const user = users[index];
  if (!user.key) {
    alert("Generate keys first.");
    return;
  }
  const pubKey = `n=${user.key.n}\ne=${user.key.e}`;
  navigator.clipboard.writeText(pubKey).then(
    () => alert(`${user.name} public key copied to clipboard.`),
    () => alert("Unable to copy. Please copy manually.")
  );
}

function copyUserPrivateKey(index) {
  const user = users[index];
  if (!user.key) {
    alert("Generate keys first.");
    return;
  }
  navigator.clipboard.writeText(formatKey(user.key)).then(
    () => alert(`${user.name} private key copied to clipboard.`),
    () => alert("Unable to copy. Please copy manually.")
  );
}

function removeUser(index) {
  users.splice(index, 1);
  renderUsers();
  updateSelects();
}

function encryptMessage() {
  const plaintext = plaintextArea.value.trim();
  if (!plaintext) {
    alert("Enter a message to encrypt.");
    return;
  }
  const pubKeyText = encryptPublicKeyArea.value;
  if (!pubKeyText) {
    alert("Select a recipient.");
    return;
  }
  let publicKey;
  try {
    publicKey = parsePublicKey(pubKeyText);
  } catch (error) {
    alert(error.message);
    return;
  }
  try {
    const cipherBigInt = encryptWithPublicKey(plaintext, publicKey);
    ciphertextArea.value = bytesToBase64(bigIntToBytes(cipherBigInt));
  } catch (error) {
    alert(error.message);
  }
}

function decryptMessage() {
  const index = decryptUserSelect.value;
  if (index === "") {
    alert("Select a user.");
    return;
  }
  const user = users[index];
  if (!user.key) {
    alert("Selected user has no keys generated.");
    return;
  }
  const ciphertext = ciphertextDecryptArea.value.trim();
  if (!ciphertext) {
    alert("Paste ciphertext to decrypt.");
    return;
  }
  try {
    const cipherBytes = base64ToBytes(ciphertext);
    const cipherBigInt = bytesToBigInt(cipherBytes);
    decryptedTextArea.value = decryptWithPrivateKey(cipherBigInt, user.key);
  } catch (error) {
    alert("Decryption failed. Check the ciphertext and the user's private key.");
  }
}

function switchTab(targetId) {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === targetId);
  });
  tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === targetId);
  });
}

recipientSelect.addEventListener("change", () => {
  const index = recipientSelect.value;
  if (index === "") {
    encryptPublicKeyArea.value = "";
    return;
  }
  const user = users[index];
  if (!user.key) {
    alert("Selected user has no keys generated.");
    encryptPublicKeyArea.value = "";
    return;
  }
  encryptPublicKeyArea.value = `n=${user.key.n}\ne=${user.key.e}`;
});

addUserButton.addEventListener("click", addUser);
encryptButton.addEventListener("click", encryptMessage);
decryptButton.addEventListener("click", decryptMessage);
tabButtons.forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

// Initialize with two users
addUser();
addUser();
