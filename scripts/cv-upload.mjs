import fs from "node:fs/promises";
import { put } from "@vercel/blob";
if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN)
  throw new Error("Connect a private Vercel Blob store before uploading.");
if (!process.env.CV_BLOB_PATHNAME)
  throw new Error("Set CV_BLOB_PATHNAME to the intended private pathname.");
try {
  const file = await fs.readFile(
    new URL("../private/shaun-mathiasz-cv.pdf", import.meta.url),
  );
  if (file.subarray(0, 5).toString() !== "%PDF-") throw new Error();
  await put(process.env.CV_BLOB_PATHNAME, file, {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/pdf",
    allowOverwrite: false,
  });
  console.log("CV uploaded privately. No public fallback was created.");
} catch {
  console.error(
    "Private upload not confirmed. Check the store, credentials, path and existing file without printing credentials.",
  );
  process.exitCode = 1;
}
