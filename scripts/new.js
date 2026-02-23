#!/usr/bin/env node
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const projectName = process.argv[2];

if (!projectName) {
  console.error("Usage: npm run new -- <projectName>");
  console.error("Example: npm run new -- project3");
  process.exit(1);
}

const projectPath = path.join(__dirname, "..", "projects", projectName);
const srcDir = path.join(projectPath, "src");
const indexPath = path.join(srcDir, "index.ts");
const tsconfigPath = path.join(projectPath, "tsconfig.json");

if (fs.existsSync(projectPath)) {
  console.error(`Project "${projectName}" already exists.`);
  process.exit(1);
}

// Create src/index.ts
fs.mkdirSync(srcDir, { recursive: true });
fs.writeFileSync(
  indexPath,
  `console.log("Hello from ${projectName}!");\n`,
  "utf8"
);

// Create tsconfig.json (matches project1/project2 structure)
const tsconfig = {
  compilerOptions: {
    rootDir: "./src",
    outDir: "./dist",
    module: "nodenext",
    target: "esnext",
    strict: true,
    skipLibCheck: true,
  },
  include: ["src/**/*"],
};
fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2), "utf8");

// Build to generate dist/index.js
const buildResult = spawnSync("npx", ["tsc", "-p", projectPath], {
  stdio: "inherit",
});

if (buildResult.status !== 0) {
  console.error("Build failed. Fix any errors and run: npm run start -- " + projectName);
  process.exit(buildResult.status ?? 1);
}

console.log(`\nCreated project "${projectName}". Run with: npm run start -- ${projectName}`);
