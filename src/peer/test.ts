import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", async (input) => {
  console.log("Received input:", input);
  const inputs = input.trim().split(" ");
  const command = inputs[0];
  console.log("Command is:", command);
});
