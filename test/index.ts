import * as fs from "fs";
import * as http from "http";

export const DEFAULT_TESTING_SERVER_PORT = 8081;
export const DEFAULT_PUPPETEER_EXECUTABLE_PATH =
  "/Applications/Chromium.app/Contents/MacOS/Chromium";

export function getExecutablePath() {
  let executablePath = DEFAULT_PUPPETEER_EXECUTABLE_PATH;
  if (process.env.ZLE_PUPPETEER_EXECUTABLE_PATH) {
    executablePath = process.env.ZLE_PUPPETEER_EXECUTABLE_PATH!;
  }
  return executablePath;
}

export function getPort() {
  let port = DEFAULT_TESTING_SERVER_PORT;
  if (process.env.ZLE_TESTING_SERVER_PORT) {
    port = parseInt(process.env.ZLE_TESTING_SERVER_PORT!);
  }
  return port;
}

export function getPageUrl(pageName: string) {
  const port = getPort();
  return `http://localhost:${port}/${pageName}`;
}

export function createTestingServer(port: number) {
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
  server.listen(port);
  return server;
}
