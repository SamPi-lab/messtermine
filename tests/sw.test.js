// Prüft die Dateiliste in sw.js: Fehlt dort eine Datei, startet die App offline nicht.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const normalize = (path) => path.replace(/^\.\//, '');

// sw.js ist kein Modul, deshalb die Liste als Text herauslesen
const appFiles = [...read('sw.js').match(/const APP_FILES = \[([^\]]*)\]/)[1].matchAll(/'([^']+)'/g)]
  .map((m) => m[1]);
const cached = new Set(appFiles.map(normalize));

const html = read('index.html');
const htmlFiles = [...html.matchAll(/(?:href|src)="([^"#]+)"/g)].map((m) => m[1]);
const manifest = JSON.parse(read('manifest.webmanifest'));
const manifestFiles = [manifest.start_url, manifest.scope, ...manifest.icons.map((icon) => icon.src)];

// Alle Module, die app.js direkt oder über andere Module lädt
function importedModules(file, found = new Set()) {
  for (const [, path] of read(file).matchAll(/from '\.\/([^']+)'/g)) {
    if (!found.has(path)) {
      found.add(path);
      importedModules(path, found);
    }
  }
  return found;
}

test('jede in index.html verlinkte Datei wird offline gespeichert', () => {
  assert.ok(htmlFiles.length >= 4);
  for (const file of htmlFiles) assert.ok(cached.has(normalize(file)), `${file} fehlt in APP_FILES`);
});

test('jedes von app.js geladene Modul wird offline gespeichert', () => {
  const modules = importedModules('app.js');
  assert.ok(modules.has('logic.js') && modules.has('backup.js'));
  for (const file of modules) assert.ok(cached.has(file), `${file} fehlt in APP_FILES`);
});

test('die Startseite und die Manifest-Symbole werden offline gespeichert', () => {
  assert.ok(cached.has('') && cached.has('index.html'));
  for (const file of manifest.icons.map((icon) => icon.src)) assert.ok(cached.has(normalize(file)), file);
});

test('jede Datei in APP_FILES existiert', () => {
  for (const file of appFiles.filter((f) => f !== './')) {
    assert.ok(existsSync(new URL(`../${normalize(file)}`, import.meta.url)), `${file} gibt es nicht`);
  }
});

test('alle Pfade sind relativ, damit die App unter /messtermine/ läuft', () => {
  for (const path of [...appFiles, ...htmlFiles, ...manifestFiles, './sw.js']) {
    assert.ok(!path.startsWith('/') && !/^https?:/.test(path), `${path} ist nicht relativ`);
  }
  assert.match(read('app.js'), /register\('\.\/sw\.js'\)/);
});
