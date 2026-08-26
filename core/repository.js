import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'target', 'vendor',
  '.next', '.nuxt', '.output', 'coverage', '.cache', 'tmp', 'temp',
  'venv', '.venv', '__pycache__', '.pytest_cache', '.mypy_cache',
  'bin', 'obj', '.gradle', '.idea', '.vscode'
]);

const EXTENSION_LANGUAGE_MAP = {
  '.js': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.mts': 'typescript',
  '.cts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.kt': 'kotlin',
  '.cs': 'csharp',
  '.rb': 'ruby',
  '.php': 'php',
  '.c': 'c',
  '.cpp': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp',
  '.ex': 'elixir',
  '.exs': 'elixir',
  '.sql': 'sql',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.md': 'markdown'
};

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function walkDir(dir, maxDepth = 6, currentDepth = 0) {
  if (currentDepth > maxDepth) return [];
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.graybeard') continue;
      if (IGNORED_DIRS.has(entry.name)) continue;

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...walkDir(fullPath, maxDepth, currentDepth + 1));
      } else if (entry.isFile()) {
        results.push(fullPath);
      }
    }
  } catch {
    // Ignore unreadable dirs
  }
  return results;
}

export function inspectRepository(root = process.cwd()) {
  const allFiles = walkDir(root);
  const relFiles = allFiles.map(f => path.relative(root, f).replace(/\\/g, '/'));

  // 1. Languages
  const languages = new Set();
  for (const f of relFiles) {
    const ext = path.extname(f).toLowerCase();
    if (EXTENSION_LANGUAGE_MAP[ext]) {
      languages.add(EXTENSION_LANGUAGE_MAP[ext]);
    }
  }

  // 2. Package Managers & Build Configs
  const packageManagers = [];
  const dependencies = {};
  
  if (fs.existsSync(path.join(root, 'package.json'))) {
    packageManagers.push('npm');
    if (fs.existsSync(path.join(root, 'pnpm-lock.yaml'))) packageManagers.push('pnpm');
    if (fs.existsSync(path.join(root, 'yarn.lock'))) packageManagers.push('yarn');
    if (fs.existsSync(path.join(root, 'bun.lockb')) || fs.existsSync(path.join(root, 'bun.lock'))) packageManagers.push('bun');
    const pkg = safeRead(path.join(root, 'package.json'));
    if (pkg) {
      try {
        const parsed = JSON.parse(pkg);
        Object.assign(dependencies, parsed.dependencies || {}, parsed.devDependencies || {});
      } catch { /* malformed */ }
    }
  }
  if (fs.existsSync(path.join(root, 'Cargo.toml'))) packageManagers.push('cargo');
  if (fs.existsSync(path.join(root, 'pyproject.toml')) || fs.existsSync(path.join(root, 'requirements.txt'))) packageManagers.push('pip');
  if (fs.existsSync(path.join(root, 'go.mod'))) packageManagers.push('go');
  if (fs.existsSync(path.join(root, 'pom.xml'))) packageManagers.push('maven');
  if (fs.existsSync(path.join(root, 'build.gradle')) || fs.existsSync(path.join(root, 'build.gradle.kts'))) packageManagers.push('gradle');
  if (fs.existsSync(path.join(root, 'Gemfile'))) packageManagers.push('bundler');
  if (fs.existsSync(path.join(root, 'composer.json'))) packageManagers.push('composer');
  if (fs.existsSync(path.join(root, 'mix.exs'))) packageManagers.push('mix');

  // 3. Tests
  const testPattern = /(\.test\.|\.spec\.|__tests__|tests\/|test\/|test_|_test\.)/i;
  const tests = relFiles.filter(f => testPattern.test(f));

  // 4. Schemas & Models
  const schemaPattern = /(\.schema\.json|\.prisma|migrations\/|models\/|schema\.sql|\.proto|\.graphql)$/i;
  const schemas = relFiles.filter(f => schemaPattern.test(f));

  // 5. Symbols extraction (Functions, Classes, Types)
  const symbols = [];
  for (const relFile of relFiles) {
    const ext = path.extname(relFile);
    if (!['.js', '.mjs', '.cjs', '.ts', '.tsx', '.py', '.go', '.rs'].includes(ext)) continue;
    if (testPattern.test(relFile)) continue;

    const content = safeRead(path.join(root, relFile));
    if (!content) continue;

    // Fast symbol regexes
    const jsTsRegex = /(?:export\s+(?:default\s+)?(?:async\s+)?(?:function\*?|class|const|let|var|type|interface|enum)\s+([A-Za-z0-9_$]+))/g;
    const pyRegex = /^(?:def|class)\s+([A-Za-z0-9_]+)/gm;
    const goRegex = /^func\s+(?:\([^)]+\)\s+)?([A-Za-z0-9_]+)/gm;
    const rsRegex = /^(?:pub\s+)?(?:fn|struct|enum|trait|type)\s+([A-Za-z0-9_]+)/gm;

    let match;
    if (['.js', '.mjs', '.cjs', '.ts', '.tsx'].includes(ext)) {
      while ((match = jsTsRegex.exec(content)) !== null) {
        symbols.push({ name: match[1], file: relFile });
      }
    } else if (ext === '.py') {
      while ((match = pyRegex.exec(content)) !== null) {
        symbols.push({ name: match[1], file: relFile });
      }
    } else if (ext === '.go') {
      while ((match = goRegex.exec(content)) !== null) {
        symbols.push({ name: match[1], file: relFile });
      }
    } else if (ext === '.rs') {
      while ((match = rsRegex.exec(content)) !== null) {
        symbols.push({ name: match[1], file: relFile });
      }
    }
  }

  // 6. Existing Invariants from Memory or Docs
  const existingInvariants = [];
  const memPath = path.join(root, '.graybeard', 'decisions.json');
  if (fs.existsSync(memPath)) {
    try {
      const db = JSON.parse(fs.readFileSync(memPath, 'utf8'));
      if (db && db.decisions) {
        for (const dec of Object.values(db.decisions)) {
          if (dec.invariant) existingInvariants.push(dec.invariant);
        }
      }
    } catch { /* ignore */ }
  }

  // 7. Git Status & Changed Files
  let gitStatus = 'clean';
  let changedFiles = [];
  try {
    const statusOutput = execSync('git status --porcelain', { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    if (statusOutput) {
      gitStatus = 'dirty';
      changedFiles = statusOutput.split('\n').map(l => l.slice(3).trim()).filter(Boolean);
    }
  } catch {
    gitStatus = 'non-git';
  }

  return {
    root,
    totalFiles: relFiles.length,
    languages: Array.from(languages),
    packageManagers: [...new Set(packageManagers)],
    dependencies,
    tests,
    schemas,
    symbols: symbols.slice(0, 500),
    existingInvariants,
    gitStatus,
    changedFiles,
    files: relFiles
  };
}

export function findRelevantFiles(root = process.cwd(), task = '', { limit = 15 } = {}) {
  const snapshot = inspectRepository(root);
  const taskStr = String(task || '').toLowerCase();
  const tokens = taskStr.match(/[a-z0-9_.-]+/g) || [];
  if (tokens.length === 0) return snapshot.files.slice(0, limit);

  const scored = snapshot.files.map(file => {
    let score = 0;
    const lowerFile = file.toLowerCase();
    const basename = path.basename(lowerFile);

    // Direct path/filename token matches
    for (const t of tokens) {
      if (t.length < 2) continue;
      if (lowerFile === t || basename === t) score += 20;
      else if (lowerFile.includes(t)) score += 8;
    }

    // Matching symbols inside file
    const matchingSymbols = snapshot.symbols.filter(s => s.file === file);
    for (const sym of matchingSymbols) {
      const lowerSym = sym.name.toLowerCase();
      for (const t of tokens) {
        if (lowerSym === t) score += 15;
        else if (lowerSym.includes(t)) score += 5;
      }
    }

    // Check file contents if low score
    if (score < 5) {
      const content = safeRead(path.join(root, file));
      if (content) {
        const lowerContent = content.toLowerCase();
        for (const t of tokens) {
          if (t.length >= 4 && lowerContent.includes(t)) score += 2;
        }
      }
    }

    return { file, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.file);
}

export function findTests(root = process.cwd(), relevantFiles = []) {
  const snapshot = inspectRepository(root);
  if (!relevantFiles || relevantFiles.length === 0) return snapshot.tests;

  const matched = new Set();
  for (const relFile of relevantFiles) {
    const base = path.basename(relFile, path.extname(relFile));
    for (const testFile of snapshot.tests) {
      if (testFile.includes(base)) {
        matched.add(testFile);
      }
    }
  }

  // If no specific tests found, return first general test files
  if (matched.size === 0) {
    return snapshot.tests.slice(0, 5);
  }
  return Array.from(matched);
}

export function findCallers(root = process.cwd(), symbol = '') {
  if (!symbol) return [];
  const sym = String(symbol).trim();
  const snapshot = inspectRepository(root);
  const callers = [];

  const symRegex = new RegExp(`\\b${sym}\\b`);
  for (const file of snapshot.files) {
    const ext = path.extname(file);
    if (!['.js', '.mjs', '.cjs', '.ts', '.tsx', '.py', '.go', '.rs', '.java'].includes(ext)) continue;
    const content = safeRead(path.join(root, file));
    if (content && symRegex.test(content)) {
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (symRegex.test(line)) {
          callers.push({ file, line: idx + 1, snippet: line.trim() });
        }
      });
    }
  }

  return callers;
}

export function gitHistory(root = process.cwd(), file = '', { maxCommits = 5 } = {}) {
  if (!file) return [];
  try {
    const output = execSync(`git log -n ${maxCommits} --pretty=format:"%h|%an|%ad|%s" --date=short -- "${file}"`, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();
    if (!output) return [];
    return output.split('\n').map(line => {
      const [hash, author, date, message] = line.split('|');
      return { hash, author, date, message };
    });
  } catch {
    return [];
  }
}

export function getDiff(root = process.cwd()) {
  try {
    const diffStat = execSync('git diff --stat', { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    const diffNames = execSync('git diff --name-only', { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    const patch = execSync('git diff -U3', { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const files = diffNames ? diffNames.split('\n').map(f => f.trim()).filter(Boolean) : [];
    
    let insertions = 0;
    let deletions = 0;
    const statMatch = diffStat.match(/(\d+)\s+insertion[s]?\(\+\)(?:,\s+(\d+)\s+deletion[s]?\(-\))?|(\d+)\s+deletion[s]?\(-\)/);
    if (statMatch) {
      insertions = Number(statMatch[1] || 0);
      deletions = Number(statMatch[2] || statMatch[3] || 0);
    }

    return {
      hasDiff: files.length > 0,
      files,
      insertions,
      deletions,
      diffStat,
      patch
    };
  } catch {
    return {
      hasDiff: false,
      files: [],
      insertions: 0,
      deletions: 0,
      diffStat: '',
      patch: ''
    };
  }
}
