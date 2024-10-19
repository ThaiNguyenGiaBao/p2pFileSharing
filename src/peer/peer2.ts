import net from "net";
import readline from "readline";
import { Peer, File } from "../server/server";
import axios from "axios";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const peer: Peer = {
  id: "client2",
  ip: "localhost",
  port: 3001,
};

const file: File = {
  name: "test2",
  size: 100,
};

rl.on("line", async (input) => {
  if (input == "registerPeer") {
    await axios
      .post("http://localhost:8000/peer/register", peer)
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err.message);
      });
  } else if (input == "registerFile") {
    await axios
      .post("http://localhost:8000/file/register", { file, peer })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err.message);
      });
  } else if (input == "get") {
    rl.question("Enter filename: ", async (filename) => {
      await axios
        .get("http://localhost:8000/file/get/" + filename)
        .then((res) => {
          console.log(res.data);
          const peers: Peer[] = res.data.peers;
          console.log(peers);
          const client = net.createConnection({ port: peers[0].port }, () => {
            console.log("Connected to peer: ", peers[0].id);

            client.on("data", (data) => {
              console.log("Received data: " + data);
            });

            rl.on("line", (input) => {
              client.write(input);
            });
          });
        })
        .catch((err) => {
          console.error(err.message);
        });
    });
  }
});

// Send a HTTP request to server (port 8000) to register the peer

const server = net.createServer((socket) => {
  console.log("Client connected: " + socket);

  socket.on("data", (data) => {
    console.log("Received data: " + data);
  });

  rl.on("line", (input) => {
    socket.write(input);
  });
});

server.listen(peer.port, () => {
  console.log("Server listening on port ", peer.port);
});
