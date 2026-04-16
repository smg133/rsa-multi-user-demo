async function loadUsers() {
  const response = await fetch('/users');
  const users = await response.json();
  const select = document.getElementById('receiver-select');
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.username;
    option.dataset.publicKey = user.public_key;
    select.appendChild(option);
  });
}

document.getElementById('receiver-select').addEventListener('change', () => {
  const select = document.getElementById('receiver-select');
  const selectedOption = select.options[select.selectedIndex];
  const publicKey = selectedOption.dataset.publicKey;
  document.getElementById('manual-public-key').value = publicKey || '';
});

document.getElementById('encrypt-btn').addEventListener('click', async () => {
  const receiverId = document.getElementById('receiver-select').value;
  const plaintext = document.getElementById('plaintext').value;
  const manualKey = document.getElementById('manual-public-key').value;

  if (!plaintext) {
    alert('Enter a message');
    return;
  }

  if (!receiverId && !manualKey) {
    alert('Select a receiver or enter a public key');
    return;
  }

  const response = await fetch('/encrypt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plaintext, receiverId })
  });

  if (response.ok) {
    alert('Message sent!');
    document.getElementById('plaintext').value = '';
  } else {
    alert('Error sending message');
  }
});

loadUsers();