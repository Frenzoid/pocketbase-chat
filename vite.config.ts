import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import copy from "rollup-plugin-copy";

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    copy({
      targets: [
        {
          src: "node_modules/bootstrap/dist/css/bootstrap.min.css",
          dest: "public/vendor/bootstrap/css",
        },
        {
          src: "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
          dest: "public/vendor/bootstrap/js",
        },
      ],
    }),
    svelte()],
})
