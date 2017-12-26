import { exec } from 'child_process';
import { getPort } from '../helpers';

const port = getPort();
exec(`kill $(lsof -t -i:${port})`, (err) => {
  if (err) {
    console.error(`Failed to stop testing server: ${err}.`);
    return;
  }
  console.info('Testing server is stopped.');
});
