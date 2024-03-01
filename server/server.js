const net = require("net");
const http = require("http");

let sentences = [];
let lastId = 0;

const sentenceServer = net.createServer(function (socket) {
  socket.on("data", (data) => {
    const [sentence, id] = JSON.parse(data.toString());
    if (id <= lastId) sentences = [];
    lastId = id;

    sentences.push({ id, sentence });
    console.log(data.toString());
  });
});

sentenceServer.listen(8080, "127.0.0.1");

const webServer = http.createServer((req, res) => {
  const headers = {
    "Access-Control-Allow-Origin": "*" /* @dev First, read about security */,
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Max-Age": 2592000, // 30 days
  };

  if (req.method === "OPTIONS") {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  if (["GET", "POST"].indexOf(req.method) > -1) {
    res.writeHead(200, headers);
    res.end(JSON.stringify(sentences));
    return;
  }

  res.writeHead(405, headers);
  res.end(`${req.method} is not allowed for the request.`);
});

webServer.listen(8081, "127.0.0.1");
