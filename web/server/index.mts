import net from "net";
import path from "path";
import fs from "fs";

export type Sentences = {
  id: number;
  sentence: string;
}[];

// store all sentence with id from texttracker
let sentences: Sentences = [];

const sentenceServer = net.createServer(function (socket) {
  socket.on("data", (data) => {
    try {
      const [sentence, id] = JSON.parse(data.toString());

      sentences.push({ id, sentence });
      console.log(data.toString());
    } catch (err) {
      console.error(err);
    }
  });
});

sentenceServer.listen(8080, "127.0.0.1");

const ipcServer = net.createServer(function (socket) {
  // console.log("Socket Connected");
  // console.log(`Write ${JSON.stringify(sentences)}`);
  socket.write(JSON.stringify(sentences));
  sentences = [];
  socket.end();

  socket.on("end", () => {
    // console.log("Connect End");
  });

  socket.on("error", (err) => {
    // console.error("Socket Error: ", err);
  });
});

const socketPath = path.join(import.meta.dirname, "ipc.sock");

ipcServer.listen(socketPath, () => {
  console.log(`IPC server listening on ${socketPath}`);
});

ipcServer.on("error", (err) => {
  console.error(`IPC server error: ${err}`);
});

function cleanup() {
  if (fs.existsSync(socketPath)) {
    fs.unlinkSync(socketPath);
    console.log(`Delete ${socketPath}`);
  }
}

process.on("exit", cleanup);
process.on("SIGINT", () => {
  console.log("Receive SIGINT");
  process.exit();
});
process.on("SIGTERM", () => {
  console.log("Receive SIGTERM");
  process.exit();
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception", err);
  process.exit(1);
});
