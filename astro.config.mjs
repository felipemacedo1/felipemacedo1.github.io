import { defineConfig } from 'astro/config';
export default defineConfig({ site: 'https://felipemacedo.me', output: 'static', trailingSlash: 'always', build: {format: 'directory'} });
