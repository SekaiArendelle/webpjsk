import { build } from "esbuild";
import { Buffer } from "node:buffer";

const result = await build({
  entryPoints: ["tests/judgment.test.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const code = result.outputFiles[0].text;
await import(
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
);
