import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

/**
 * A custom Vite plugin that resolves module imports with the "figma:asset/" prefix
 * to the project's assets directory.
 *
 * @returns A Vite plugin instance for resolving Figma asset imports
 *
 * @example
 * // In your code, you can import assets like:
 * import icon from "figma:asset/icons/logo.svg";
 */
function figmaAssetsResolver(): Plugin {
  /** The prefix used to identify Figma asset imports */
  const PREFIX = "figma:asset/";

  return {
    name: "figma-assets-resolver",

    /**
     * Resolves module IDs with the Figma asset prefix to actual file paths.
     *
     * @param importId - The module identifier being resolved
     * @returns The resolved absolute path, or null if not a Figma asset import
     */
    resolveId(importId: string) {
      if (!importId.startsWith(PREFIX)) {
        return null;
      }

      const relativePath = importId.substring(PREFIX.length);
      return path.resolve(__dirname, "./src/assets", relativePath);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), figmaAssetsResolver()],
  resolve: {
    alias: {
      // Alias @ to the src directory
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
