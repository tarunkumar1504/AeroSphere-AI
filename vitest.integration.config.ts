import { defineConfig } from 'vitest/config';
import path from 'node:path';
import os from 'node:os';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    environment: 'node',
    fileParallelism: false,
    include: ['src/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    env: {
      AEROSPHERE_DATA_DIR: path.join(os.tmpdir(), `aerosphere-integration-${process.pid}`),
      GEMINI_API_KEY: '',
    },
  },
});
