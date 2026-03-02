import { defineConfig } from 'tsup';

export default defineConfig([
    {
        entry: ['src/index.ts'],
        format: ['cjs', 'esm'],
        dts: true,
        sourcemap: true,
        clean: true,
        target: 'es2020',
        splitting: false,
        treeshake: true
    },
    {
        entry: ['src/server/index.ts'],
        format: ['cjs', 'esm'],
        dts: true,
        sourcemap: true,
        outDir: 'dist/server',
        target: 'es2020',
        platform: 'node',
        splitting: false,
        treeshake: true
    }
]);