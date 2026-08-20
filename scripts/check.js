import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(new URL('..', import.meta.url).pathname);
const required = ['core/SEXTANT.md','adapters/AGENTS.md','schemas/ledger.schema.json','benchmarks/README.md'];
for (const file of required) if (!fs.existsSync(path.join(root,file))) throw new Error(`Missing ${file}`);
JSON.parse(fs.readFileSync(path.join(root,'schemas/ledger.schema.json'),'utf8'));
console.log('Sextant integrity check: OK');
