const fs = require('fs');

const TYPES_DIR = './types';

const TARGET_FILE = './index.d.ts';

const FILES_WHITELIST = ['typing/internal.d.ts', 'typing/external.d.ts'];

function deleteImportStatement(file) {
  const matchs = file.match(/import.*;/) || [];

  return matchs.reduce((acc, next) => acc.replace(next, ''), file);
}

function deleteExportStatement(file) {
  const matchs = file.match(/export {};/) || [];

  return matchs.reduce((acc, next) => acc.replace(next, ''), file);
}

function cleanReImport(file) {
  const matchs = file.match(/S\./g) || [];

  return matchs.reduce((acc, next) => acc.replace(next, ''), file);
}

function getFiles() {
  return FILES_WHITELIST.map((name) => {
    const file = fs.readFileSync(TYPES_DIR + '/' + name, 'utf-8');

    const unimportedFile = deleteImportStatement(file);

    const unexportedFile = deleteExportStatement(unimportedFile);

    const cleanReImportFile = cleanReImport(unexportedFile);

    return cleanReImportFile;
  });
}

function getBundledFile(files) {
  return files.reduce((acc, next) => acc + next, '');
}

function writeBundle(bundle) {
  try {
    fs.writeFileSync(TARGET_FILE, bundle);
  } catch (err) {
    console.error(err);
  }
}

function main() {
  const files = getFiles();

  const bundle = getBundledFile(files);

  writeBundle(bundle);
}

main();
