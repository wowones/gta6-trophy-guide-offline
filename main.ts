// Leonida Legacy: hand the offline trophy dossier in.
// Node 22+ runs this TypeScript file directly, with no build step and no packages.
// The guide itself is the plain static tree in app/. This program copies that
// tree and the four browser captures into the output directory, then asks the
// kit's vendored library to write the deterministic dossier from what it copied.
//
// Inside the grader the destination is /output. Everywhere else the operator
// stands a scratch directory in with MAKEFUN_OUTPUT_DIR, for example:
//   MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps. Only text_max_bytes changes the dossier's bytes; the rest
// make us refuse an entry the scorer would refuse too.
const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

// Fail early on a capture set the scorer would refuse: 3 or 4 images, each
// within its size cap. The dossier library repeats this check after the copy.
function checkScreenshots(): void {
  const dir = join(here, 'screenshots');
  if (!existsSync(dir)) throw new Error('screenshots/: the capture directory is missing');
  const images = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^(jpe?g|png)$/i.test(entry.name.slice(entry.name.lastIndexOf('.') + 1)));
  if (images.length < 3 || images.length > 4) {
    throw new Error(`screenshots/: found ${images.length} images, expected 3 or 4`);
  }
  for (const image of images) {
    const bytes = statSync(join(dir, image.name)).size;
    if (bytes > caps.screenshots.max_bytes) {
      throw new Error(`screenshots/${image.name}: ${bytes} bytes, over the capture size cap`);
    }
  }
}

checkScreenshots();

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

writeFileSync(join(out, 'dossier.json'), buildDossier(out, caps));
