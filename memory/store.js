import fs from 'node:fs';
import path from 'node:path';
import { decisionKey } from '../core/index.js';

export function createMemoryStore(file) {
  const dir = path.dirname(file);

  function read() {
    try {
      if (!fs.existsSync(file)) return { version: 1, decisions: {} };
      const raw = fs.readFileSync(file, 'utf8');
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && parsed.decisions ? parsed : { version: 1, decisions: {} };
    } catch {
      return { version: 1, decisions: {} };
    }
  }

  function writeAtomic(db) {
    fs.mkdirSync(dir, { recursive: true });
    const tmpFile = path.join(dir, `.tmp-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
    fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf8');
    fs.renameSync(tmpFile, file);
  }

  function tokenize(str) {
    return String(str || '').toLowerCase().match(/[a-z0-9_.-]+/g) || [];
  }

  function scoreRelevance(item, queryTokens, rawQuery) {
    if (!queryTokens.length) return 1;
    const itemStr = `${item.area || ''} ${item.invariant || ''} ${item.decision || ''}`.toLowerCase();
    
    // Exact phrase match bonus
    let score = 0;
    if (rawQuery && itemStr.includes(rawQuery)) score += 50;
    if (item.key && rawQuery && item.key.includes(rawQuery)) score += 30;

    const itemTokens = new Set(tokenize(itemStr));
    for (const token of queryTokens) {
      if (itemTokens.has(token)) score += 10;
      else if ([...itemTokens].some(t => t.includes(token) || token.includes(t))) score += 3;
    }
    return score;
  }

  return {
    remember(input = {}) {
      if (!input.area || !input.invariant || !input.decision) {
        throw new Error('remember requires area, invariant, and decision fields');
      }
      const db = read();
      const key = input.key ?? decisionKey(input);
      const existing = db.decisions[key] || {};
      const normalized = {
        ...existing,
        ...input,
        key,
        confidence: Number(input.confidence ?? existing.confidence ?? 1),
        updatedAt: new Date().toISOString(),
        createdAt: existing.createdAt ?? new Date().toISOString()
      };
      db.decisions[key] = normalized;
      writeAtomic(db);
      return normalized;
    },

    find({ query = '', minScore = 1, limit = 50 } = {}) {
      const q = String(query).trim().toLowerCase();
      const db = read();
      const items = Object.values(db.decisions);
      if (!q) return items.slice(0, limit);

      const queryTokens = tokenize(q);
      const scored = items.map(item => ({
        item,
        score: scoreRelevance(item, queryTokens, q)
      }));

      return scored
        .filter(entry => entry.score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(entry => entry.item);
    },

    remove(key) {
      const db = read();
      if (db.decisions[key]) {
        delete db.decisions[key];
        writeAtomic(db);
        return true;
      }
      return false;
    },

    all() {
      return Object.values(read().decisions);
    },

    count() {
      return Object.keys(read().decisions).length;
    }
  };
}
