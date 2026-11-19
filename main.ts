// Entry point for the gta6-trophy-guide-01 hand-in.
// Node 22 runs this TypeScript file directly: no build, no dependencies, standard library only.
//
// The guide itself is the static app/ tree. This program stages app/ and screenshots/ into the
// submission directory and asks the kit's dossier library to summarise them for the judge.
// Inside the grader the destination is /output; elsewhere MAKEFUN_OUTPUT_DIR stands in for it.

import { closeSync, cpSync, existsSync, mkdirSync, openSync, readSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const SHOT_MAX_BYTES = 262144;
const SHOT_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

/**
 * Refuse a screenshot set the scorer would refuse before spending time on the dossier.
 * Alongside the count and byte cap, check the file name and the image's magic bytes so a
 * stray text file or a renamed download cannot slip into the hand-in.
 */
function preflightScreenshots(directory: string): string[] {
  if (!existsSync(directory)) throw new Error('screenshots/: the folder is missing');
  const names = readdirSync(directory)
    .filter((name) => !name.startsWith('.'))
    .sort();
  if (names.length < 3 || names.length > 4) {
    throw new Error(`screenshots/: expected 3 or 4 images, found ${names.length}`);
  }
  for (const name of names) {
    if (!SHOT_NAME.test(name)) throw new Error(`screenshots/${name}: file name is not allowed`);
    const path = join(directory, name);
    const size = statSync(path).size;
    if (size > SHOT_MAX_BYTES) {
      throw new Error(`screenshots/${name}: ${size} bytes, over the ${SHOT_MAX_BYTES} byte limit`);
    }
    const handle = openSync(path, 'r');
    try {
      const head = Buffer.alloc(3);
      readSync(handle, head, 0, 3, 0);
      const jpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
      const png = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e;
      if (!jpeg && !png) throw new Error(`screenshots/${name}: neither a JPEG nor a PNG`);
    } finally {
      closeSync(handle);
    }
    console.log(`  ${name}: ${size} bytes`);
  }
  return names;
}

const shots = preflightScreenshots(join(here, 'screenshots'));
console.log(`Screenshot preflight passed: ${shots.length} images`);

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// These are the scorer's own caps: only text_max_bytes shapes the dossier bytes, the rest refuse
// an entry that the gate would refuse later.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});

writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`Wrote dossier.json: ${dossier.byteLength} bytes`);
