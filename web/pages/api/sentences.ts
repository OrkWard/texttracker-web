import type { NextApiRequest, NextApiResponse } from "next";
import net from "net";

export type Sentences = {
  id: number;
  sentence: string;
}[];

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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Sentences>
) {
  res.status(200).json(sentences);
  sentences = [];
}
