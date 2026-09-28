// Combines both builds into ./dist — kid at "/", parent at "/parent/" — so they share one origin.
import { cpSync, rmSync, existsSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
for (const app of ['kid', 'parent']) if (!existsSync(`apps/${app}/dist`)) throw new Error(`apps/${app}/dist missing — run the app builds first`);
cpSync('apps/kid/dist', 'dist', { recursive: true });
cpSync('apps/parent/dist', 'dist/parent', { recursive: true });
console.log('✔ dist/ ready (kid at /, parent at /parent/)');
