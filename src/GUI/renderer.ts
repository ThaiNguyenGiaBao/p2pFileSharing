const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", () => {
  const outputElement = document.getElementById("output") as HTMLTextAreaElement;

  const appendOutput = (text: string) => {
    outputElement.value += text + "\n";
  };

  ipcRenderer.on("output", (_event, output: string) => {
    appendOutput(output);
  });

  // Button event listeners
  document.getElementById("help")?.addEventListener("click", () => {
    ipcRenderer.send("action", "help");
  });

  document.getElementById("me")?.addEventListener("click", () => {
    ipcRenderer.send("action", "me");
  });

  document.getElementById("listFiles")?.addEventListener("click", () => {
    ipcRenderer.send("action", "list_files");
  });

  document.getElementById("registerFile")?.addEventListener("click", () => {
    const fileName = prompt("Enter file name to register:");
    if (fileName) ipcRenderer.send("action", "register_file", [fileName]);
  });

  document.getElementById("downloadFile")?.addEventListener("click", () => {
    const fileName = prompt("Enter file name to download:");
    if (fileName) ipcRenderer.send("action", "download_file", [fileName]);
  });

  document.getElementById("exit")?.addEventListener("click", () => {
    ipcRenderer.send("action", "exit");
  });
});
