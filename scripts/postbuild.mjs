import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

writeFileSync(
  join(process.cwd(), 'dist-cjs', 'package.json'),
  `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`,
);

writeFileSync(
  join(process.cwd(), 'dist', 'package.json'),
  `${JSON.stringify({ type: 'module' }, null, 2)}\n`,
);
