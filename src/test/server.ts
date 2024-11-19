import * as net from 'net';

const PORT = 3000;

// Create the server
const server = net.createServer((socket) => {
  console.log('A client connected.');

  // Handle data received from the client
  socket.on('data', (data) => {
    console.log(`Client: ${data.toString()}`);
  });

  // Handle client disconnection
  socket.on('end', () => {
    console.log('Client disconnected.');
  });

  // Handle errors
  socket.on('error', (err) => {
    console.error(`Socket error: ${err.message}`);
  });

  // Allow server to send messages to the client
  process.stdin.on('data', (input) => {
    socket.write(input.toString().trim());
  });
});

// Start listening for connections
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error(`Server error: ${err.message}`);
});
