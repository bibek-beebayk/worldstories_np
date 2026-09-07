import { readdir, readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { gzipSync } from "node:zlib";

// Sum each emitted client JS/CSS file once, including lazy routes and workers.
// This is total build output, not a first-page network transfer measurement.
for (const project of [".", "../worldstories_f"]) {
  const directory = resolve(project, "build/client");
  const totals = { js: { bytes: 0, gzip: 0 }, css: { bytes: 0, gzip: 0 } };
  for (const name of await readdir(directory, { recursive: true })) {
    const extension = extname(name);
    const kind = [".js", ".mjs"].includes(extension) ? "js" : extension === ".css" ? "css" : null;
    if (!kind) continue;
    const contents = await readFile(resolve(directory, name));
    totals[kind].bytes += contents.length;
    totals[kind].gzip += gzipSync(contents).length;
  }
  console.log(JSON.stringify({ project, ...totals }));
}
