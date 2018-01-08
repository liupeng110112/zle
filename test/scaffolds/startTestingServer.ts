import { createTestingServer, getPort } from "../";

const port = getPort();
const server = createTestingServer(port);
server.on("listening", () => {
  console.info(
    `Testing server is started on port ${port}, pid: ${process.pid}.`
  );
});
