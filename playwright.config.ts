import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const env = { DATABASE_URL: "file:./e2e.db" };

export default defineConfig({
  testDir: "tests/e2e",
  workers: 1,
  use: { baseURL: `http://localhost:${PORT}`, ...devices["Pixel 7"] },
  webServer: {
    // Throwaway database, then a production build of the app.
    command: `rm -f prisma/e2e.db && prisma db push --skip-generate && next build && next start -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    env,
    timeout: 300_000,
    reuseExistingServer: false,
  },
});
