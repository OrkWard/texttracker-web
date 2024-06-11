import type { NextApiRequest, NextApiResponse } from "next";
import net from "net";
import path from "path";

export type Sentences = {
  id: number;
  sentence: string;
}[];

const socketPath = path.join(
  "/home/orkward/Repos/texttracker-web/web/",
  "server",
  "ipc.sock"
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const body = await new Promise<string>((resolve, reject) => {
    const ipcClient = net.createConnection(socketPath, () => {
      // console.log("Connect to ipc server");
    });

    ipcClient.on("data", (data) => {
      console.log(`Receive data: ${data}`);
      resolve(data.toString());
    });

    ipcClient.on("end", () => {
      // console.log("IPC connection ended");
    });

    ipcClient.on("error", (err) => {
      console.log(`IPC client error: ${err}`);
      reject(err);
    });
  });

  res.status(200).send(body);
}
