import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
//import tracker from "./tracker"; // Import tracker logic

let mainWindow: BrowserWindow | null = null;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "renderer.js"), // Preload script
    },
  });

  mainWindow.loadFile("index.html");
});

// Handle commands from the Renderer process
ipcMain.on("action", async (event: any, action: string, args: any[] = []) => {
  try {
    let output: string;

    switch (action) {
      case "help":
        //output = tracker.help();
        break;
      case "me":
        //output = tracker.getPeerInfo();
        break;
      case "list_files":
        //const files = await tracker.getFiles();
        //output = files.join("\n");
        break;
      case "register_file":
        //await tracker.registerFile(args[0]);
        output = `File registered: ${args[0]}`;
        break;
      case "download_file":
        //await tracker.downloadFile(args[0]);
        output = `Downloading file: ${args[0]}`;
        break;
      case "exit":
        app.quit();
        return;
      default:
        output = "Invalid action.";
    }

    //event.reply("output", output);
  } catch (error) {
    // event.reply("output", `Error: ${error.message}`);
  }
});
