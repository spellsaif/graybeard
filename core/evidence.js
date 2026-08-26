import { inspectRepository, findRelevantFiles, findTests, findCallers } from './repository.js';
import { inferTaskType, normalizeTaskType, isPresentationIntent } from './classifier.js';
import { riskScore, calculateRisk } from './risk.js';

export function analyzeTask({
  text = '',
  repositorySnapshot = null,
  root = process.cwd(),
  uncertaintyOverride = null,
  impactOverride = null,
  irreversibilityOverride = null,
  blastRadiusOverride = null,
  confidenceOverride = null,
  taskTypeOverride = null
} = {}) {
  const str = String(text || '').trim();
  const snapshot = repositorySnapshot || inspectRepository(root);
  
  const relevantFiles = findRelevantFiles(root, str, { limit: 10 });
  const relatedTests = findTests(root, relevantFiles);

  // Extract candidate symbols from task and relevant files
  const tokens = str.match(/[A-Za-z0-9_$]+/g) || [];
  const candidateSymbols = [];
  for (const token of tokens) {
    if (token.length < 3) continue;
    const matched = snapshot.symbols.filter(s => s.name.toLowerCase() === token.toLowerCase());
    candidateSymbols.push(...matched);
  }

  // Find callers for top symbols
  const callers = [];
  for (const sym of candidateSymbols.slice(0, 3)) {
    const symCallers = findCallers(root, sym.name);
    callers.push(...symCallers);
  }

  // Determine domain / task type using prompt + repository clues
  let inferredType = inferTaskType(str);
  if (inferredType === 'unknown' && relevantFiles.length > 0) {
    const hasMigration = relevantFiles.some(f => /migration|schema|prisma|db/i.test(f));
    const hasSecurity = relevantFiles.some(f => /auth|security|permission|session/i.test(f));
    const hasConcurrency = relevantFiles.some(f => /queue|worker|mutex|lock|sync/i.test(f));
    if (hasSecurity) inferredType = 'security';
    else if (hasMigration) inferredType = 'migration';
    else if (hasConcurrency) inferredType = 'concurrency';
  }
  const taskType = normalizeTaskType(taskTypeOverride || inferredType, str);

  // Calculate evidence-based risk factors
  let uncertainty = uncertaintyOverride !== null ? uncertaintyOverride : 0.35;
  let impact = impactOverride !== null ? impactOverride : 0.4;
  let irreversibility = irreversibilityOverride !== null ? irreversibilityOverride : 0.2;
  let blastRadius = blastRadiusOverride !== null ? blastRadiusOverride : 0.2;

  // Domain impact baseline
  switch (taskType) {
    case 'security':
      impact = Math.max(impact, 0.9);
      irreversibility = Math.max(irreversibility, 0.8);
      break;
    case 'migration':
      impact = Math.max(impact, 0.85);
      irreversibility = Math.max(irreversibility, 0.9);
      break;
    case 'concurrency':
      impact = Math.max(impact, 0.85);
      uncertainty = Math.max(uncertainty, 0.6);
      break;
    case 'architecture':
      impact = Math.max(impact, 0.8);
      blastRadius = Math.max(blastRadius, 0.7);
      break;
    case 'performance':
      impact = Math.max(impact, 0.6);
      break;
    case 'bug':
      impact = Math.max(impact, 0.5);
      break;
    case 'styling':
    case 'docs':
      impact = Math.min(impact, 0.1);
      irreversibility = Math.min(irreversibility, 0.1);
      uncertainty = Math.min(uncertainty, 0.15);
      blastRadius = Math.min(blastRadius, 0.15);
      break;
  }

  // Repository evidence adjustments
  if (callers.length >= 5) {
    blastRadius = Math.max(blastRadius, 0.8);
  } else if (callers.length >= 2) {
    blastRadius = Math.max(blastRadius, 0.5);
  }

  if (relevantFiles.length === 0 && str.length > 0 && !isPresentationIntent(str)) {
    uncertainty = Math.max(uncertainty, 0.75);
  }

  // Calculate composite risk score with calibrated floor model
  const score = riskScore({ uncertainty, impact, irreversibility, blastRadius });
  const risk = calculateRisk({ uncertainty, impact, irreversibility, blastRadius });

  const confidence = confidenceOverride !== null ? confidenceOverride : Number(Math.max(0.1, 1 - (uncertainty * 0.7)).toFixed(2));
  const isFastPath = (risk === 'LOW' || (confidence >= 0.85 && blastRadius <= 0.3)) &&
    !['security', 'migration', 'concurrency', 'architecture', 'legacy'].includes(taskType);

  // Compile structural facts
  const facts = [];
  if (snapshot.languages.length > 0) facts.push(`Repository languages: ${snapshot.languages.join(', ')}`);
  if (relevantFiles.length > 0) facts.push(`Identified relevant files: ${relevantFiles.slice(0, 3).join(', ')}`);
  if (relatedTests.length > 0) facts.push(`Detected related test suites: ${relatedTests.slice(0, 2).join(', ')}`);
  if (callers.length > 0) facts.push(`Found ${callers.length} symbol call sites across repo`);
  if (snapshot.schemas.length > 0) facts.push(`Detected schema boundaries: ${snapshot.schemas.slice(0, 2).join(', ')}`);
  if (snapshot.existingInvariants.length > 0) facts.push(`Active durable invariants: ${snapshot.existingInvariants.length}`);

  return {
    text: str,
    taskType,
    risk,
    score,
    confidence,
    isFastPath,
    facts,
    evidence: {
      languages: snapshot.languages,
      packageManagers: snapshot.packageManagers,
      relevantFiles,
      relatedTests,
      candidateSymbols: candidateSymbols.map(s => s.name),
      callersCount: callers.length,
      schemas: snapshot.schemas,
      existingInvariants: snapshot.existingInvariants,
      gitStatus: snapshot.gitStatus,
      changedFiles: snapshot.changedFiles
    },
    factors: {
      uncertainty,
      impact,
      irreversibility,
      blastRadius
    }
  };
}
