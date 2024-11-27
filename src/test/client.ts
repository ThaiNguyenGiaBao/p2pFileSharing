import * as net from 'net';

const HOST = '191.16.11.128'; // Replace with the server's IP address
const PORT = 3000;

// Connect to the server
const client = net.createConnection(PORT, HOST, () => {
  console.log('Connected to the server.');

  // Allow client to send messages to the server
  process.stdin.on('data', (input) => {
    client.write(input.toString().trim());
  });
});

// Handle data received from the server
client.on('data', (data) => {
  console.log(`Server: ${data.toString()}`);
});

// Handle server disconnection
client.on('end', () => {
  console.log('Disconnected from the server.');
});

// Handle errors
client.on('error', (err) => {
  console.error(`Connection error: ${err.message}`);
});
