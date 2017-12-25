export const DEFAULT_TESTING_SERVER_PORT = process.env.NEON_TESTING_SERVER_PORT ? parseInt(process.env.NEON_TESTING_SERVER_PORT!) : 8081;
export const DEFAULT_TESTING_URL = `http://localhost:${DEFAULT_TESTING_SERVER_PORT}/`;
