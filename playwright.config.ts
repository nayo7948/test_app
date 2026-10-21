import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const env = { DATABASE_URL: "file:./e2e.db" };

export default defineConfig({
  testDir: "tests/e2e",
  workers: 1,
  use: { baseURL: `http://localhost:${PORT}` },
  // Same scenarios on a phone and a desktop browser (the layout is responsive).
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    // Throwaway database, then a production build of the app.
    command: `rm -f prisma/e2e.db && prisma db push --skip-generate && next build && next start -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    env,
    timeout: 300_000,
    reuseExistingServer: false,
  },
});
