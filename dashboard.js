document.getElementById('generate-keys').addEventListener('click', async () => {
  const bits = document.getElementById('key-size').value;
  const response = await fetch('/generate-keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bits })
  });
  const data = await response.json();
  document.getElementById('public-key').value = data.publicKey;
  document.getElementById('private-key').value = data.privateKey;
});

document.getElementById('copy-public').addEventListener('click', () => {
  const text = document.getElementById('public-key').value;
  navigator.clipboard.writeText(text);
  alert('Public key copied!');
});

document.getElementById('copy-private').addEventListener('click', () => {
  const text = document.getElementById('private-key').value;
  navigator.clipboard.writeText(text);
  alert('Private key copied!');
});