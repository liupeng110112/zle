import * as fs from 'fs';
import * as http from 'http';
import { DEFAULT_TESTING_SERVER_PORT } from "./constants";

export function getPageUrl(pageName: string) {
  let port = DEFAULT_TESTING_SERVER_PORT;
  if (process.env.NEON_TESTING_SERVER_PORT) {
    port = parseInt(process.env.NEON_TESTING_SERVER_PORT!);
  }
  return `http://localhost:${port}/${pageName}`;
}

export function createTestingServer(port: number) {
  const server = http.createServer(async (request, response) => {
    const path = `${__dirname}/assets/${request.url!.slice(1)}.html`;
    fs.readFile(path, (err, data) => {
      if (err) {
        response.writeHead(400, { 'Content-Type': 'text/html' });
        response.end(err.toString());
        return;
      }
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(data);
    });
  });
  server.listen(port);
  return server;
}
