import { spawnSync } from "node:child_process";
// Migrations are explicit and run through the verified Neon owner connection.
// Builds in every environment remain read-only with respect to databases.
const build = spawnSync("next", ["build", "--webpack"], {
  stdio: "inherit",
  env: process.env,
});
process.exit(build.status ?? 1);
