import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.resolve(HERE, '..');

export const HOSTS = {
  generic: { label: 'Generic AGENTS.md', adapter: 'AGENTS.md', paths: ['AGENTS.md'] },
  claude: { label: 'Claude Code', adapter: 'CLAUDE.md', paths: ['CLAUDE.md', '.claude/skills'] },
  codex: { label: 'Codex', adapter: 'CODEX.md', paths: ['AGENTS.md'] },
  cursor: { label: 'Cursor', adapter: 'CURSOR.md', paths: ['.cursor/rules', 'AGENTS.md'] },
  opencode: { label: 'OpenCode', adapter: 'OPENCODE.md', paths: ['AGENTS.md', '.opencode/skills'] },
  gemini: { label: 'Gemini-style host', adapter: 'GEMINI.md', paths: ['GEMINI.md'] },
  cline: { label: 'Cline', adapter: 'CLINE.md', paths: ['.clinerules'] },
  roo: { label: 'Roo Code', adapter: 'ROO.md', paths: ['.roo/rules'] },
  copilot: { label: 'GitHub Copilot', adapter: 'COPILOT.md', paths: ['.github/copilot-instructions.md'] },
};

function exists(p) { return fs.existsSync(p); }
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function copyIfMissing(src, dst) {
  ensureDir(path.dirname(dst));
  if (!exists(dst)) fs.copyFileSync(src, dst);
  return !exists(dst);
}

export function detectHosts(root) {
  const checks = [
    ['claude', ['.claude', 'CLAUDE.md']],
    ['codex', ['AGENTS.md', '.codex']],
    ['cursor', ['.cursor', '.cursorrules']],
    ['opencode', ['.opencode', 'opencode.json']],
    ['gemini', ['GEMINI.md', '.gemini']],
    ['cline', ['.clinerules']],
    ['roo', ['.roo']],
    ['copilot', ['.github/copilot-instructions.md', '.github']],
  ];
  const detected = [];
  for (const [id, markers] of checks) {
    if (markers.some((m) => exists(path.join(root, m)))) detected.push(id);
  }
  return detected;
}

export function installHost(root, hostId) {
  const host = HOSTS[hostId];
  if (!host) throw new Error(`Unknown host: ${hostId}`);
  const adapterPath = path.join(ROOT, 'adapters', host.adapter);
  if (!exists(adapterPath)) throw new Error(`Adapter not found: ${host.adapter}`);

  const writes = [];
  if (hostId === 'cursor') {
    const dst = path.join(root, '.cursor/rules/sextant.mdc');
    ensureDir(path.dirname(dst));
    if (!exists(dst)) {
      fs.writeFileSync(dst, fs.readFileSync(adapterPath, 'utf8'));
      writes.push(dst);
    }
  } else if (hostId === 'copilot') {
    const dst = path.join(root, '.github/copilot-instructions.md');
    if (!exists(dst)) {
      ensureDir(path.dirname(dst));
      fs.copyFileSync(adapterPath, dst);
      writes.push(dst);
    }
  } else if (hostId === 'cline') {
    const dst = path.join(root, '.clinerules/sextant.md');
    ensureDir(path.dirname(dst));
    if (!exists(dst)) {
      fs.copyFileSync(adapterPath, dst);
      writes.push(dst);
    }
  } else if (hostId === 'roo') {
    const dst = path.join(root, '.roo/rules/sextant.md');
    ensureDir(path.dirname(dst));
    if (!exists(dst)) {
      fs.copyFileSync(adapterPath, dst);
      writes.push(dst);
    }
  } else if (hostId === 'opencode') {
    const dst = path.join(root, 'AGENTS.md');
    if (!exists(dst)) { fs.copyFileSync(adapterPath, dst); writes.push(dst); }
    writes.push(...installSkills(root, '.opencode/skills'));
  } else if (hostId === 'claude') {
    const dst = path.join(root, 'CLAUDE.md');
    if (!exists(dst)) { fs.copyFileSync(adapterPath, dst); writes.push(dst); }
    writes.push(...installSkills(root, '.claude/skills'));
  } else if (hostId === 'codex') {
    const dst = path.join(root, 'AGENTS.md');
    if (!exists(dst)) { fs.copyFileSync(adapterPath, dst); writes.push(dst); }
  } else {
    const dst = path.join(root, host.paths[0]);
    if (!exists(dst)) { ensureDir(path.dirname(dst)); fs.copyFileSync(adapterPath, dst); writes.push(dst); }
  }
  return writes;
}

export function installSkills(root, base = '.agents/skills') {
  const source = path.join(ROOT, 'skills');
  const files = fs.readdirSync(source).filter((f) => f.endsWith('.md') && f !== 'README.md');
  const writes = [];
  for (const file of files) {
    const name = file.replace(/\.md$/, '');
    const dst = path.join(root, base, name, 'SKILL.md');
    ensureDir(path.dirname(dst));
    if (!exists(dst)) { fs.copyFileSync(path.join(source, file), dst); writes.push(dst); }
  }
  return writes;
}

export function doctor(root) {
  const detected = detectHosts(root);
  const installed = [];
  for (const [id, host] of Object.entries(HOSTS)) {
    const present = host.paths.some((p) => exists(path.join(root, p)));
    if (present && id !== 'generic') installed.push(id);
  }
  return {
    version: '1.0.0',
    repository: root,
    gitRepo: exists(path.join(root, '.git')),
    detectedHosts: detected,
    configuredHosts: installed,
    agentsFile: exists(path.join(root, 'AGENTS.md')),
    memory: exists(path.join(root, '.sextant/decisions.json')),
    skills: exists(path.join(root, '.agents/skills')) || exists(path.join(root, '.opencode/skills')) || exists(path.join(root, '.claude/skills')),
    status: detected.length || installed.length || exists(path.join(root, 'AGENTS.md')) ? 'ready' : 'not-configured'
  };
}
