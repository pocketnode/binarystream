import { build } from "bun";
import dts from "bun-plugin-dts";
import { exists, rm } from "node:fs/promises";

const OUT_DIR = new URL(await import.meta.resolve("./dist")).pathname;
if (await exists(OUT_DIR)) await rm(OUT_DIR, { recursive: true });

await build({
    entrypoints: [new URL(await import.meta.resolve("./src/BinaryStream.ts")).pathname],
    target: "browser",
    outdir: OUT_DIR,
    minify: {
        identifiers: false,
        syntax: true,
        whitespace: true
    },
    plugins: [dts()],
    sourcemap: "inline"
});