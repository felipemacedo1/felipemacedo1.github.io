import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',fullyParallel:true,workers:2,use:{baseURL:'http://localhost:4321',headless:true},webServer:{command:'npm run preview -- --port 4321',url:'http://localhost:4321',reuseExistingServer:!process.env.CI},reporter:'list'});
