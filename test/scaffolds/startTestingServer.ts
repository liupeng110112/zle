import { DEFAULT_TESTING_SERVER_PORT } from "../constants";
import { createTestingServer } from "../helpers";

let port = DEFAULT_TESTING_SERVER_PORT;
if (process.env.NEON_TESTING_SERVER_PORT) {
  port = parseInt(process.env.NEON_TESTING_SERVER_PORT!);
}

const server = createTestingServer(port);
server.on('listening', () => {
  console.info(`Testing server is started on port ${port}, pid: ${process.pid}.`);
});
