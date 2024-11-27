document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");

  // Navigation Event Handlers
  document.getElementById("nav-help").addEventListener("click", () => {
    content.innerHTML = `<h2>Help</h2>
        <ul>
          <li><b>register_file:</b> Register file with tracker</li>
          <li><b>download_file:</b> Download file from peer</li>
          <li><b>list_files:</b> List all files</li>
          <li><b>me:</b> Show peer information</li>
          <li><b>exit:</b> Exit application</li>
        </ul>`;
  });

  document.getElementById("nav-register").addEventListener("click", () => {
    content.innerHTML = `<h2>Register File</h2>
        <input id="file-input" type="text" placeholder="Enter file name" />
        <button id="register-btn">Register</button>`;
    document.getElementById("register-btn").addEventListener("click", () => {
      const fileName = document.getElementById("file-input").value;
      window.api.registerFile(fileName);
    });
  });

  document.getElementById("nav-download").addEventListener("click", () => {
    content.innerHTML = `<h2>Download File</h2>
        <input id="download-input" type="text" placeholder="Enter file name" />
        <button id="download-btn">Download</button>`;
    document.getElementById("download-btn").addEventListener("click", () => {
      const fileName = document.getElementById("download-input").value;
      window.api.downloadFile(fileName);
    });
  });

  document.getElementById("nav-list").addEventListener("click", async () => {
    const files = await window.api.listFiles();
    content.innerHTML = `<h2>List Files</h2>
        <ul>${files
          .map((file) => `<li>${file.filename} - ${file.size} Bytes</li>`)
          .join("")}</ul>`;
  });

  document.getElementById("nav-me").addEventListener("click", async () => {
    const peerInfo = await window.api.getPeerInfo();
    content.innerHTML = `<h2>Peer Information</h2>
        <p>IP: ${peerInfo.ip}</p>
        <p>Port: ${peerInfo.port}</p>
        <p>Download: ${peerInfo.download}</p>
        <p>Upload: ${peerInfo.upload}</p>`;
  });

  document.getElementById("nav-exit").addEventListener("click", () => {
    window.api.exitApp();
  });
});
