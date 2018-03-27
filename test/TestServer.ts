import * as fs from "fs";
import * as http from "http";
import { exec } from "child_process";

const DEFAULT_TEST_PORT = 8081;

export function getPort() {
  if (process.env.ZLE_TEST_PORT) {
    return parseInt(process.env.ZLE_TEST_PORT!);
  } else {
    return DEFAULT_TEST_PORT;
  }
}

export function getPageUrl(pageName: string) {
  const port = getPort();
  return `http://localhost:${port}/${pageName}`;
}

function start() {
  const port = getPort();
  const server = http.createServer(async (request, response) => {
    const path = `${__dirname}/assets/${request.url!.slice(1)}.html`;
    fs.readFile(path, (err, data) => {
      if (err) {
        response.writeHead(400, { "Content-Type": "text/html" });
        response.end(err.toString());
        return;
      }
      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(data);
    });
  });
  server.on("listening", () => {
    console.info(
      `Test server is started on port ${port}, pid: ${process.pid}.`
    );
  });
  server.listen(port);
  return server;
}

function stop() {
  const port = getPort();
  exec(`kill $(lsof -t -i:${port})`, err => {
    if (err) {
      console.error(`Failed to stop test server: ${err}.`);
      return;
    }
    console.info("Test server is stopped.");
  });
}

if (require.main === module) {
  switch (process.argv[process.argv.length - 1]) {
    case "start": {
      start();
      break;
    }
    case "stop": {
      stop();
      break;
    }
  }
}
