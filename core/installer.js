import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

export const HOSTS = {
  generic: { label: 'Generic AGENTS.md', adapter: 'AGENTS.md', paths: ['AGENTS.md', '.agents/skills'] },
  claude: { label: 'Claude Code', adapter: 'CLAUDE.md', paths: ['CLAUDE.md', '.claude/skills'] },
  cursor: { label: 'Cursor', adapter: 'CURSOR.md', paths: ['.cursor/rules/graybeard.mdc', '.cursorrules', '.cursor'] },
  windsurf: { label: 'Windsurf Cascade', adapter: 'WINDSURF.md', paths: ['.windsurf/rules/graybeard.md', '.windsurfrules', '.windsurf'] },
  opencode: { label: 'OpenCode', adapter: 'OPENCODE.md', paths: ['AGENTS.md', '.opencode/skills'] },
  gemini: { label: 'Gemini-style / Antigravity', adapter: 'GEMINI.md', paths: ['GEMINI.md', '.gemini'] },
  cline: { label: 'Cline', adapter: 'CLINE.md', paths: ['.clinerules/graybeard.md', '.clinerules'] },
  roo: { label: 'Roo Code', adapter: 'ROO.md', paths: ['.roo/rules/graybeard.md', '.roo/rules', '.roorules', '.roomodes'] },
  copilot: { label: 'GitHub Copilot', adapter: 'COPILOT.md', paths: ['.github/copilot-instructions.md'] },
  aider: { label: 'Aider', adapter: 'AIDER.md', paths: ['CONVENTIONS.md', '.aider.conf.yml'] },
  continue: { label: 'Continue.dev', adapter: 'CONTINUE.md', paths: ['.continue/rules/graybeard.md', '.continue'] },
  codex: { label: 'Codex', adapter: 'CODEX.md', paths: ['AGENTS.md', '.codex'] },
};

export const GRAYBEARD_MARKER_START = '<!-- GRAYBEARD_START -->';
export const GRAYBEARD_MARKER_END = '<!-- GRAYBEARD_END -->';

function exists(p) { return fs.existsSync(p); }
function isDirectory(p) {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

export function injectOrUpdateSection(filePath, content, { wrap = true } = {}) {
  ensureDir(path.dirname(filePath));
  const wrapped = wrap ? `\n${GRAYBEARD_MARKER_START}\n${content.trim()}\n${GRAYBEARD_MARKER_END}\n` : content;

  if (!exists(filePath)) {
    fs.writeFileSync(filePath, wrapped.trimStart(), 'utf8');
    return true;
  }

  const existing = fs.readFileSync(filePath, 'utf8');
  if (wrap && existing.includes(GRAYBEARD_MARKER_START) && existing.includes(GRAYBEARD_MARKER_END)) {
    const regex = new RegExp(`${GRAYBEARD_MARKER_START}[\\s\\S]*?${GRAYBEARD_MARKER_END}`, 'g');
    const updated = existing.replace(regex, `${GRAYBEARD_MARKER_START}\n${content.trim()}\n${GRAYBEARD_MARKER_END}`);
    fs.writeFileSync(filePath, updated, 'utf8');
    return true;
  }

  if (wrap) {
    const updated = existing.trimEnd() + '\n\n' + wrapped.trim() + '\n';
    fs.writeFileSync(filePath, updated, 'utf8');
    return true;
  }

  return false;
}

export function detectHosts(root) {
  const checks = [
    ['claude', ['.claude', 'CLAUDE.md']],
    ['cursor', ['.cursor', '.cursorrules']],
    ['windsurf', ['.windsurf', '.windsurfrules']],
    ['opencode', ['.opencode', 'opencode.json']],
    ['gemini', ['GEMINI.md', '.gemini']],
    ['cline', ['.clinerules']],
    ['roo', ['.roo', '.roorules', '.roomodes']],
    ['copilot', ['.github/copilot-instructions.md', '.github']],
    ['aider', ['.aider.conf.yml', 'CONVENTIONS.md']],
    ['continue', ['.continue']],
    ['codex', ['AGENTS.md', '.codex']],
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
  const adapterContent = fs.readFileSync(adapterPath, 'utf8');

  const writes = [];

  if (hostId === 'cursor') {
    const dstMdc = path.join(root, '.cursor/rules/graybeard.mdc');
    ensureDir(path.dirname(dstMdc));
    fs.writeFileSync(dstMdc, adapterContent, 'utf8');
    writes.push(dstMdc);
    if (exists(path.join(root, '.cursorrules'))) {
      const dstRules = path.join(root, '.cursorrules');
      injectOrUpdateSection(dstRules, adapterContent);
      writes.push(dstRules);
    }
  } else if (hostId === 'windsurf') {
    const dstRulesDir = path.join(root, '.windsurf/rules/graybeard.md');
    ensureDir(path.dirname(dstRulesDir));
    fs.writeFileSync(dstRulesDir, adapterContent, 'utf8');
    writes.push(dstRulesDir);
    if (exists(path.join(root, '.windsurfrules'))) {
      const dstFile = path.join(root, '.windsurfrules');
      injectOrUpdateSection(dstFile, adapterContent);
      writes.push(dstFile);
    }
  } else if (hostId === 'copilot') {
    const dst = path.join(root, '.github/copilot-instructions.md');
    injectOrUpdateSection(dst, adapterContent);
    writes.push(dst);
  } else if (hostId === 'cline') {
    const clinerulesPath = path.join(root, '.clinerules');
    if (exists(clinerulesPath) && isDirectory(clinerulesPath)) {
      const dst = path.join(clinerulesPath, 'graybeard.md');
      fs.writeFileSync(dst, adapterContent, 'utf8');
      writes.push(dst);
    } else {
      injectOrUpdateSection(clinerulesPath, adapterContent);
      writes.push(clinerulesPath);
    }
  } else if (hostId === 'roo') {
    const rooRulesDir = path.join(root, '.roo/rules');
    if (exists(path.join(root, '.roo')) || exists(rooRulesDir)) {
      ensureDir(rooRulesDir);
      const dst = path.join(rooRulesDir, 'graybeard.md');
      fs.writeFileSync(dst, adapterContent, 'utf8');
      writes.push(dst);
    } else {
      const rooFile = path.join(root, '.roorules');
      injectOrUpdateSection(rooFile, adapterContent);
      writes.push(rooFile);
    }
  } else if (hostId === 'opencode') {
    const dst = path.join(root, 'AGENTS.md');
    injectOrUpdateSection(dst, adapterContent);
    writes.push(dst);

    const opencodeJsonPath = path.join(root, 'opencode.json');
    if (exists(opencodeJsonPath)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(opencodeJsonPath, 'utf8'));
        if (Array.isArray(cfg.instructions) && !cfg.instructions.includes('AGENTS.md')) {
          cfg.instructions.push('AGENTS.md');
          fs.writeFileSync(opencodeJsonPath, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
          writes.push(opencodeJsonPath);
        }
      } catch { /* ignore malformed json */ }
    }

    writes.push(...installSkills(root, '.opencode/skills'));
    writes.push(...installSkills(root, '.agents/skills'));
  } else if (hostId === 'claude') {
    const dst = path.join(root, 'CLAUDE.md');
    injectOrUpdateSection(dst, adapterContent);
    writes.push(dst);
    writes.push(...installSkills(root, '.claude/skills'));
  } else if (hostId === 'aider') {
    const dst = path.join(root, 'CONVENTIONS.md');
    injectOrUpdateSection(dst, adapterContent);
    writes.push(dst);
  } else if (hostId === 'continue') {
    const dst = path.join(root, '.continue/rules/graybeard.md');
    ensureDir(path.dirname(dst));
    fs.writeFileSync(dst, adapterContent, 'utf8');
    writes.push(dst);
  } else if (hostId === 'gemini') {
    const dst = path.join(root, 'GEMINI.md');
    injectOrUpdateSection(dst, adapterContent);
    writes.push(dst);
    writes.push(...installSkills(root, '.agents/skills'));
  } else if (hostId === 'codex') {
    const dst = path.join(root, 'AGENTS.md');
    injectOrUpdateSection(dst, adapterContent);
    writes.push(dst);
    writes.push(...installSkills(root, '.agents/skills'));
  } else {
    const dst = path.join(root, host.paths[0]);
    injectOrUpdateSection(dst, adapterContent);
    writes.push(dst);
    writes.push(...installSkills(root, '.agents/skills'));
  }
  return writes;
}

export function installSkills(root, base = '.agents/skills') {
  const source = path.join(ROOT, 'skills');
  const files = fs.readdirSync(source).filter((f) => f.endsWith('.md') && f !== 'README.md');
  const writes = [];
  for (const file of files) {
    const rawName = file.replace(/\.md$/, '');
    const dstRaw = path.join(root, base, rawName, 'SKILL.md');
    const dstPrefixed = path.join(root, base, `graybeard-${rawName}`, 'SKILL.md');
    ensureDir(path.dirname(dstRaw));
    ensureDir(path.dirname(dstPrefixed));
    fs.copyFileSync(path.join(source, file), dstRaw);
    fs.copyFileSync(path.join(source, file), dstPrefixed);
    writes.push(dstRaw, dstPrefixed);
  }
  return [...new Set(writes)];
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
    memory: exists(path.join(root, '.graybeard/decisions.json')),
    skills: exists(path.join(root, '.agents/skills')) || exists(path.join(root, '.opencode/skills')) || exists(path.join(root, '.claude/skills')),
    status: detected.length || installed.length || exists(path.join(root, 'AGENTS.md')) ? 'ready' : 'not-configured'
  };
}
