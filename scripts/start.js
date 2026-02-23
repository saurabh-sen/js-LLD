#!/usr/bin/env node
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const projectName = process.argv[2];

if (!projectName) {
  console.error("Usage: npm run start -- <projectName>");
  console.error("Example: npm run start -- project1");
  process.exit(1);
}

const projectPath = path.join(__dirname, "..", "projects", projectName);
const tsconfigPath = path.join(projectPath, "tsconfig.json");
const distPath = path.join(projectPath, "dist", "index.js");

if (!fs.existsSync(projectPath)) {
  console.error(`Project "${projectName}" not found in projects/`);
  process.exit(1);
}

if (!fs.existsSync(tsconfigPath)) {
  console.error(`No tsconfig.json found in projects/${projectName}/`);
  process.exit(1);
}

// Build TypeScript
const buildResult = spawnSync("npx", ["tsc", "-p", projectPath], {
  stdio: "inherit",
});

if (buildResult.status !== 0) {
  process.exit(buildResult.status ?? 1);
}

if (!fs.existsSync(distPath)) {
  console.error(`Build failed: dist/index.js not found. Check that src/index.ts exists.`);
  process.exit(1);
}

// Run the compiled output
const runResult = spawnSync("node", [distPath], {
  stdio: "inherit",
  cwd: projectPath,
});

process.exit(runResult.status ?? 0);
