import { defineConfig } from "tsup";

export default defineConfig([
    {
        entry: {
            index: "src/index.ts",
            "server/index": "src/server/index.ts",
        },
        format: ["cjs", "esm"],
        dts: true,
        sourcemap: true,
        splitting: false,
        clean: true,
        treeshake: true,
        target: "es2020",
        platform: "node",
    },

    // Explicit .mjs for Node.js ESM
    {
        entry: {
            index: "src/index.ts",
            "server/index": "src/server/index.ts",
        },
        format: ["esm"],
        dts: false,
        sourcemap: true,
        splitting: false,
        treeshake: true,
        target: "es2020",
        platform: "node",
        outDir: "dist-mjs",
        esbuildOptions(options) {
            options.outExtension = { ".js": ".mjs" };
        },
    },
]);