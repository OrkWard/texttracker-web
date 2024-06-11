import type { NextApiRequest, NextApiResponse } from "next";
import net from "net";
import path from "path";

export type Sentences = {
  id: number;
  sentence: string;
}[];

const socketPath = path.join(import.meta.dirname, "server", "ipc.sock");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const ipcClient = net.createConnection(socketPath, () => {
    console.log("Connect to ipc server");
  });

  ipcClient.on("data", (data) => {
    res.status(200).json(data.toString());
  });

  ipcClient.on("end", () => {
    console.log("IPC connection ended");
  });

  ipcClient.on("error", (err) => {
    console.log(`IPC client error: ${err}`);
  });
}
