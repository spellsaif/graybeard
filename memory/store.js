import fs from 'node:fs';
import path from 'node:path';
import { decisionKey } from '../core/index.js';

export function createMemoryStore(file) {
  function read() {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return { decisions: {} }; }
  }
  function write(db) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(db, null, 2));
  }
  return {
    remember(input) {
      const db = read();
      const normalized = { ...input, key: input.key ?? decisionKey(input), updatedAt: new Date().toISOString() };
      db.decisions[normalized.key] = normalized;
      write(db);
      return normalized;
    },
    find({ query = '' } = {}) {
      const q = String(query).toLowerCase();
      const db = read();
      return Object.values(db.decisions).filter(v => !q || JSON.stringify(v).toLowerCase().includes(q));
    },
    all() { return Object.values(read().decisions); },
  };
}
