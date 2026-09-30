import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const children = new Set();
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) child.kill("SIGINT");
}

function start(args) {
  const child = spawn(process.execPath, args, {
    stdio: "inherit",
    detached: process.platform !== "win32",
  });
  children.add(child);
  child.on("error", (error) => {
    console.error(error.message);
    children.delete(child);
    stop(1);
  });
  child.on("exit", (code) => {
    children.delete(child);
    if (!stopping) stop(code ?? 1);
  });
  return child;
}

function portReady(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ host: "127.0.0.1", port });
    socket.setTimeout(500);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => stop());
start(["scripts/emulators.mjs"]);
const deadline = Date.now() + 120_000;
while (!stopping) {
  const ready = await Promise.all([portReady(8085), portReady(9099)]);
  if (ready.every(Boolean)) {
    start([
      require.resolve("next/dist/bin/next"),
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3002",
    ]);
    break;
  }
  if (Date.now() > deadline) {
    console.error(
      "Los emuladores no iniciaron en 120 segundos. Revisa Java y los puertos 8085 y 9099.",
    );
    stop(1);
    break;
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
}
