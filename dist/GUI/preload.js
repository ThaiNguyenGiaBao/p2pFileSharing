const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  registerFile: (fileName) => ipcRenderer.send('register-file', fileName),
  downloadFile: (fileName) => ipcRenderer.send('download-file', fileName),
  listFiles: () => ipcRenderer.invoke('list-files'),
  getPeerInfo: () => ipcRenderer.invoke('get-peer-info'),
  exitApp: () => ipcRenderer.send('exit-app'),
});
