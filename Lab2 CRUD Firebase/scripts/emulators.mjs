import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
const args = [
  "emulators:start",
  "--project",
  "demo-lab2-crud",
  "--only",
  "auth,firestore",
  "--export-on-exit=.firebase-data",
];
if (existsSync(".firebase-data/firebase-export-metadata.json"))
  args.push("--import=.firebase-data");
const child = spawn("firebase", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  detached: process.platform !== "win32",
});
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
let stopping = false;
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    if (stopping) return;
    stopping = true;
    child.kill("SIGINT");
  });
child.on("exit", (code) => {
  process.exitCode = code ?? 0;
});
