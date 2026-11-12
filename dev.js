#!/usr/bin/env node
/**
 * dev.js — pre-flight-checked launcher for the EduNova stack.
 *
 *   Prefer the simpler `npm run dev` (npm concurrently) when you don't need
 *   the extra checks below. This script still works standalone:
 *
 *   node dev.js            # API on :5000 + web client on :5173
 *   node dev.js --install  # force npm install in both packages first
 *   node dev.js --no-web   # API only
 *
 * What it does:
 *   1. checks Node, MongoDB, .env and node_modules;
 *   2. warns (instead of crashing) when a port is already in use;
 *   3. streams both processes into one colour-prefixed console;
 *   4. kills both when you press Ctrl+C.
 */
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');

const ROOT = __dirname;
const BACKEND = path.join(ROOT, 'lms-backend');
const FRONTEND = path.join(ROOT, 'lms-frontend');

const args = new Set(process.argv.slice(2));
const FORCE_INSTALL = args.has('--install');
const API_ONLY = args.has('--no-web');

const C = {
  reset: '\u001b[0m',
  dim: '\u001b[2m',
  bold: '\u001b[1m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  magenta: '\u001b[35m',
  cyan: '\u001b[36m',
};

const log = (message) => console.log(message);
const rule = () => log(C.dim + '─'.repeat(66) + C.reset);

function probe(port, host = '127.0.0.1', timeout = 700) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const done = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeout);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
    socket.connect(port, host);
  });
}

function ensureDependencies(dir, label) {
  const missing = !fs.existsSync(path.join(dir, 'node_modules'));
  if (!missing && !FORCE_INSTALL) return false;

  log(`${C.yellow}•${C.reset} ${label}: ${missing ? 'dependencies missing' : '--install requested'} → running npm install`);
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npm, ['install', '--no-audit', '--no-fund'], { cwd: dir, stdio: 'inherit' });
  if (result.status !== 0) {
    log(`${C.red}✖ npm install failed in ${label}. Fix the error above and re-run.${C.reset}`);
    process.exit(1);
  }
  log(`${C.green}✔${C.reset} ${label}: dependencies installed`);
  return true;
}

function ensureEnv() {
  const env = path.join(BACKEND, '.env');
  const example = path.join(BACKEND, '.env.example');
  if (fs.existsSync(env) || !fs.existsSync(example)) return;
  fs.copyFileSync(example, env);
  log(`${C.green}✔${C.reset} Created lms-backend/.env from .env.example`);
}

const children = [];
let shuttingDown = false;

function launch(name, colour, cwd, command, commandArgs) {
  const child = spawn(command, commandArgs, {
    cwd,
    env: process.env,
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const prefix = `${colour}[${name}]${C.reset} `;
  const pipe = (stream, target) => {
    let buffer = '';
    stream.setEncoding('utf8');
    stream.on('data', (chunk) => {
      buffer += chunk;
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop();
      lines.forEach((line) => {
        if (line.trim()) target.write(`${prefix}${line}\n`);
      });
    });
  };

  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);

  child.on('exit', (code) => {
    if (shuttingDown) return;
    log(`${colour}[${name}]${C.reset} exited with code ${code}`);
    stopAll(code ?? 0);
  });

  children.push({ name, child });
  return child;
}

function stopAll(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  log(`\n${C.dim}Stopping EduNova…${C.reset}`);

  children.forEach(({ name, child }) => {
    if (child.exitCode !== null || child.killed) return;
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      child.kill('SIGTERM');
    }
    log(`${C.dim}  stopped ${name}${C.reset}`);
  });

  setTimeout(() => process.exit(exitCode), 300);
}

(async () => {
  rule();
  log(`${C.bold}${C.blue}EduNova LMS${C.reset} ${C.dim}— First Release dev stack${C.reset}`);
  rule();

  const major = Number(process.versions.node.split('.')[0]);
  if (major < 18) {
    log(`${C.red}✖ Node 18+ is required (found ${process.versions.node}).${C.reset}`);
    process.exit(1);
  }
  log(`${C.green}✔${C.reset} Node ${process.versions.node}`);

  if (!(await probe(27017))) {
    log(`${C.yellow}!${C.reset} MongoDB does not answer on 127.0.0.1:27017.`);
    log(`  ${C.dim}Start it with: net start MongoDB  (or point MONGO_URI elsewhere in lms-backend/.env)${C.reset}`);
  } else {
    log(`${C.green}✔${C.reset} MongoDB reachable on 127.0.0.1:27017`);
  }

  ensureEnv();
  ensureDependencies(BACKEND, 'api');
  if (!API_ONLY) ensureDependencies(FRONTEND, 'web');

  const apiBusy = await probe(5000);
  if (apiBusy) {
    log(`${C.yellow}!${C.reset} Port 5000 is already in use — assuming an API is already running.`);
  }

  const webBusy = API_ONLY ? false : await probe(5173);
  if (webBusy) {
    log(`${C.yellow}!${C.reset} Port 5173 is already in use — the web client may fail to bind.`);
  }

  rule();
  if (!apiBusy) {
    log(`${C.dim}starting${C.reset} API       ${C.cyan}http://localhost:5000/api${C.reset}`);
    launch('api', C.green, BACKEND, 'npm', ['start']);
  } else {
    log(`${C.dim}reusing${C.reset} API       ${C.cyan}http://localhost:5000/api${C.reset}`);
  }

  if (!API_ONLY && !webBusy) {
    log(`${C.dim}starting${C.reset} web       ${C.magenta}http://localhost:5173${C.reset}`);
    launch('web', C.magenta, FRONTEND, 'npm', ['run', 'dev']);
  } else if (!API_ONLY) {
    log(`${C.dim}reusing${C.reset} web       ${C.magenta}http://localhost:5173${C.reset}`);
  }

  rule();
  log(`${C.dim}Demo accounts · password Password123${C.reset}`);
  log(`  ${C.dim}student${C.reset}     mia@student.dev`);
  log(`  ${C.dim}instructor${C.reset}  lena@edunova.dev`);
  log(`  ${C.dim}admin${C.reset}       admin@edunova.dev`);
  log(`\n${C.dim}First run? Seed the database:${C.reset} cd lms-backend && npm run seed`);

  if (children.length === 0) {
    log(`${C.yellow}Nothing to start — both services were already running.${C.reset}\n`);
    return;
  }

  log(`${C.dim}Press Ctrl+C to stop everything.${C.reset}\n`);

  process.on('SIGINT', () => stopAll(0));
  process.on('SIGTERM', () => stopAll(0));
})();
