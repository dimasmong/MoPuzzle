import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4180',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 800 }
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'desktop-edge',
      use: { ...devices['Desktop Edge'] }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] } // 412x915
    },
    {
      name: 'iphone-14',
      use: { ...devices['iPhone 14'] } // 390x844
    }
  ],
  webServer: {
    command: 'npm.cmd run preview -- --port 4180',
    port: 4180,
    reuseExistingServer: false
  }
});
