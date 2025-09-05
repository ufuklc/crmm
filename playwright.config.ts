// import type { PlaywrightTestConfig } from "@playwright/test";
// import { devices } from "@playwright/test";

const config = {
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { /* ...devices["Desktop Chrome"] */ } },
    { name: "firefox", use: { /* ...devices["Desktop Firefox"] */ } },
    { name: "webkit", use: { /* ...devices["Desktop Safari"] */ } },
    { name: "Mobile Chrome", use: { /* ...devices["Pixel 5"] */ } },
  ],
};

export default config;


