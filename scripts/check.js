import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const required = ['core/GRAYBEARD.md','adapters/AGENTS.md','schemas/ledger.schema.json','benchmarks/README.md'];
for (const file of required) if (!fs.existsSync(path.join(root,file))) throw new Error(`Missing ${file}`);
JSON.parse(fs.readFileSync(path.join(root,'schemas/ledger.schema.json'),'utf8'));
console.log('Graybeard integrity check: OK');
