async function loadMessages() {
  const response = await fetch('/messages');
  const messages = await response.json();
  const list = document.getElementById('messages-list');
  list.innerHTML = '';

  messages.forEach(message => {
    const div = document.createElement('div');
    div.className = 'message-item';
    div.innerHTML = `
      <h3>From: ${message.sender_name}</h3>
      <p><strong>Ciphertext:</strong> ${message.ciphertext}</p>
      <button onclick="decryptMessage(${message.id}, '${message.ciphertext}')">Decrypt</button>
      <p id="plaintext-${message.id}"></p>
    `;
    list.appendChild(div);
  });
}

async function decryptMessage(id, ciphertext) {
  // Placeholder for decryption
  const plaintext = `decrypted_${ciphertext}`;
  document.getElementById(`plaintext-${id}`).textContent = `Plaintext: ${plaintext}`;
}

loadMessages();