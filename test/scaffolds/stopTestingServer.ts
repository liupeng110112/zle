import { exec } from 'child_process';
import { DEFAULT_TESTING_SERVER_PORT } from "../constants";

let port = DEFAULT_TESTING_SERVER_PORT;
if (process.env.NEON_TESTING_SERVER_PORT) {
  port = parseInt(process.env.NEON_TESTING_SERVER_PORT!);
}

exec(`kill $(lsof -t -i:${port})`, (err) => {
  if (err) {
    console.error(`Failed to stop testing server: ${err}.`);
    return;
  }
  console.info('Testing server is stopped.');
});
