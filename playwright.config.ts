import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: [
    'specs/**/*.spec.ts',
    '**/*automation*.spec.ts',
  ],
  testIgnore: [
    '**/node_modules/**',
    'backend/**',
    'frontend/**',
    'playwright-report/**',
    'test-results/**',
  ],
  fullyParallel: false, // Run tests sequentially for this suite
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for sequential execution
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    channel: 'chrome',
    headless: false,
    launchOptions: {
      slowMo: 150,
    },
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  timeout: 180000, // 3 minutes total timeout

  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'echo "Ensure frontend is running on http://localhost:3000"',
    port: 3000,
    reuseExistingServer: true,
    timeout: 0,
  },
});
