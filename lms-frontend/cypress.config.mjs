import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1440,
    viewportHeight: 900,
    defaultCommandTimeout: 10000,
    video: true,
    videosFolder: 'cypress/videos',
    screenshotOnRunFailure: true,
    env: {
      api: 'http://localhost:5000/api',
      demoPassword: 'Password123',
      student: 'mia@student.dev',
      instructor: 'lena@edunova.dev',
      admin: 'admin@edunova.dev',
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
