import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { assertChangeSurface, detectInvariantViolation } from './guard.js';

function exists(p) { return fs.existsSync(p); }

export function detectOracles(root = process.cwd()) {
  const oracles = [];

  // 1. Node.js / TypeScript / JavaScript
  const pkgPath = path.join(root, 'package.json');
  if (exists(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const scripts = pkg.scripts || {};
      if (scripts.test) oracles.push({ type: 'test', runner: 'npm', command: 'npm test', description: 'Node test script' });
      if (scripts.check) oracles.push({ type: 'integrity', runner: 'npm', command: 'npm run check', description: 'Project integrity check' });
      if (scripts.typecheck) oracles.push({ type: 'typecheck', runner: 'npm', command: 'npm run typecheck', description: 'TypeScript typecheck script' });
      if (scripts.lint) oracles.push({ type: 'lint', runner: 'npm', command: 'npm run lint', description: 'Linter script' });
    } catch { /* ignore malformed package.json */ }

    if (exists(path.join(root, 'tsconfig.json')) && !oracles.some(o => o.type === 'typecheck')) {
      oracles.push({ type: 'typecheck', runner: 'tsc', command: 'npx tsc --noEmit', description: 'TypeScript Compiler Check' });
    }
  }

  // 2. Rust
  if (exists(path.join(root, 'Cargo.toml'))) {
    oracles.push({ type: 'typecheck', runner: 'cargo', command: 'cargo check', description: 'Rust Cargo Check' });
    oracles.push({ type: 'test', runner: 'cargo', command: 'cargo test', description: 'Rust Cargo Test Suite' });
  }

  // 3. Python
  if (exists(path.join(root, 'pyproject.toml')) || exists(path.join(root, 'pytest.ini')) || exists(path.join(root, 'setup.py')) || exists(path.join(root, 'requirements.txt'))) {
    oracles.push({ type: 'test', runner: 'pytest', command: 'pytest', description: 'Python Pytest Suite' });
    if (exists(path.join(root, 'mypy.ini')) || exists(path.join(root, 'pyproject.toml'))) {
      oracles.push({ type: 'typecheck', runner: 'mypy', command: 'mypy .', description: 'Python MyPy Type Checker' });
    }
    if (exists(path.join(root, 'ruff.toml')) || exists(path.join(root, '.ruff.toml'))) {
      oracles.push({ type: 'lint', runner: 'ruff', command: 'ruff check .', description: 'Python Ruff Linter' });
    }
  }

  // 4. Go
  if (exists(path.join(root, 'go.mod'))) {
    oracles.push({ type: 'test', runner: 'go', command: 'go test ./...', description: 'Go Test Suite' });
    oracles.push({ type: 'lint', runner: 'go', command: 'go vet ./...', description: 'Go Vet Static Analysis' });
  }

  // 5. Java / Kotlin (Maven / Gradle)
  if (exists(path.join(root, 'pom.xml'))) {
    oracles.push({ type: 'test', runner: 'maven', command: 'mvn test', description: 'Maven Test Suite' });
  }
  if (exists(path.join(root, 'build.gradle')) || exists(path.join(root, 'build.gradle.kts'))) {
    const gradleCmd = process.platform === 'win32' && exists(path.join(root, 'gradlew.bat'))
      ? 'gradlew.bat test'
      : (exists(path.join(root, 'gradlew')) ? './gradlew test' : 'gradle test');
    oracles.push({ type: 'test', runner: 'gradle', command: gradleCmd, description: 'Gradle Test Suite' });
  }

  // 6. .NET / C#
  if (exists(path.join(root, '*.sln')) || exists(path.join(root, '*.csproj')) || (fs.existsSync(root) && fs.readdirSync(root).some(f => f.endsWith('.sln') || f.endsWith('.csproj')))) {
    oracles.push({ type: 'test', runner: 'dotnet', command: 'dotnet test', description: '.NET Test Suite' });
    oracles.push({ type: 'typecheck', runner: 'dotnet', command: 'dotnet build', description: '.NET Build Check' });
  }

  // 7. Ruby
  if (exists(path.join(root, 'Gemfile'))) {
    if (exists(path.join(root, 'spec'))) {
      oracles.push({ type: 'test', runner: 'rspec', command: 'bundle exec rspec', description: 'Ruby RSpec Suite' });
    } else {
      oracles.push({ type: 'test', runner: 'rake', command: 'bundle exec rake test', description: 'Ruby Rake Test' });
    }
  }

  // 8. PHP
  if (exists(path.join(root, 'composer.json'))) {
    if (exists(path.join(root, 'phpunit.xml')) || exists(path.join(root, 'phpunit.xml.dist'))) {
      oracles.push({ type: 'test', runner: 'phpunit', command: './vendor/bin/phpunit', description: 'PHPUnit Test Suite' });
    }
  }

  // 9. C / C++ (CMake / Make)
  if (exists(path.join(root, 'CMakeLists.txt'))) {
    oracles.push({ type: 'test', runner: 'ctest', command: 'ctest --output-on-failure', description: 'CMake CTest Suite' });
  } else if (exists(path.join(root, 'Makefile'))) {
    oracles.push({ type: 'test', runner: 'make', command: 'make test', description: 'Makefile Test Target' });
  }

  // 10. Elixir
  if (exists(path.join(root, 'mix.exs'))) {
    oracles.push({ type: 'test', runner: 'mix', command: 'mix test', description: 'Elixir Mix Test Suite' });
  }

  return oracles;
}

export function runOracle(oracle, { cwd = process.cwd(), timeoutMs = 30000 } = {}) {
  const start = Date.now();
  try {
    const output = execSync(oracle.command, {
      cwd,
      timeout: timeoutMs,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return {
      command: oracle.command,
      type: oracle.type,
      passed: true,
      exitCode: 0,
      output: String(output || '').trim(),
      durationMs: Date.now() - start
    };
  } catch (err) {
    return {
      command: oracle.command,
      type: oracle.type,
      passed: false,
      exitCode: err.status ?? 1,
      output: (String(err.stdout || '') + '\n' + String(err.stderr || '')).trim(),
      error: err.message,
      durationMs: Date.now() - start
    };
  }
}

export function verifyWorkspace(root = process.cwd(), { types = ['test', 'typecheck', 'integrity'] } = {}) {
  const oracles = detectOracles(root).filter(o => types.includes(o.type));
  const results = [];
  for (const oracle of oracles) {
    results.push(runOracle(oracle, { cwd: root }));
  }
  const allPassed = results.length > 0 && results.every(r => r.passed);
  return {
    verified: allPassed,
    totalOracles: results.length,
    passedCount: results.filter(r => r.passed).length,
    failedCount: results.filter(r => !r.passed).length,
    results
  };
}

export function verifyDecision({
  root = process.cwd(),
  decision = '',
  invariant = '',
  expectedBehavior = '',
  plannedFiles = [],
  actualDiff = null,
  oracleTypes = ['test', 'typecheck', 'integrity']
} = {}) {
  // 1. Workspace / regression verification
  const workspaceResult = verifyWorkspace(root, { types: oracleTypes });
  const regressionPassed = workspaceResult.totalOracles === 0 || workspaceResult.verified || workspaceResult.failedCount === 0;

  // 2. Boundary diff check
  const boundaryCheck = assertChangeSurface({
    planned: plannedFiles,
    actualDiff,
    root
  });
  const boundaryPassed = boundaryCheck.passed;

  // 3. Invariant check
  const invViolation = detectInvariantViolation({
    proposedChange: decision,
    invariants: invariant ? [invariant] : []
  });
  const invariantPassed = !invViolation.stop;

  // 4. Economy check
  const economyPassed = !boundaryCheck.locExceeded;

  // 5. Behavior check
  const behaviorPassed = regressionPassed && (Boolean(decision) || Boolean(expectedBehavior));

  const breakdown = {
    behavior: behaviorPassed ? 'PASS' : 'FAIL',
    regression: regressionPassed ? 'PASS' : 'FAIL',
    invariant: invariantPassed ? 'PASS' : 'FAIL',
    boundary: boundaryPassed ? 'PASS' : 'FAIL',
    economy: economyPassed ? 'PASS' : 'FAIL'
  };

  const allPassed = Object.values(breakdown).every(v => v === 'PASS');

  return {
    verified: allPassed,
    breakdown,
    summary: `Verification Proof: [Behavior: ${breakdown.behavior}, Regression: ${breakdown.regression}, Invariant: ${breakdown.invariant}, Boundary: ${breakdown.boundary}, Economy: ${breakdown.economy}]`,
    details: {
      workspace: workspaceResult,
      boundary: boundaryCheck,
      invariantViolation: invViolation.stop ? invViolation.evidence : null
    }
  };
}
