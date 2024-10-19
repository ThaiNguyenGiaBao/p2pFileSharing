import express, { Request, Response } from "express";
import bodyParser from "body-parser";
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

export type Peer = {
  id: string;
  ip: string;
  port: number;
};

export type File = {
  name: string;
  size: number;
};

type FileRepository = {
  [filename: string]: {
    peers: Peer[];
  };
};

const PORT = 8000;
const peerList: Peer[] = [];
const fileRepository: FileRepository = {};

app.post("/peer/register", (req: Request, res: Response) => {
  const peer: Peer = req.body;
  peerList.push(peer);
  res.send("Peer registered: " + peer.id);
  console.log(peerList);
});

app.get("/file/get/:filename", (req: Request, res: Response) => {
  const filename = req.params.filename;
  console.log("Getting file: " + filename);
  const peers = fileRepository[filename];
  res.send(peers);
  console.log(peers);
});

app.post("/file/register", (req: Request, res: Response) => {
  const { file, peer }: { file: File; peer: Peer } = req.body;
  if (!fileRepository[file.name]) {
    fileRepository[file.name] = {
      peers: [],
    };
  }
  fileRepository[file.name].peers.push(peer);
  res.send("File registered: " + file.name);
  console.log(fileRepository);
});

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
