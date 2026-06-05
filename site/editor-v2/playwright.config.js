import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  webServer: {
    command: 'npx vite preview --port 5181 --outDir ../dist/editor-v2',
    port: 5181,
    timeout: 10000,
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:5181',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
});
