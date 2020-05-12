const fs = require('fs');

const TYPES_DIR = './types';

const TARGET_FILE = './index.d.ts';

const FILES_WHITELIST = [
  'typing/index.d.ts',
  'utils/index.d.ts',
  'core/piceOfStore.d.ts',
  'core/store.d.ts',
  'devtool/index.d.ts'
];

function deleteImportStatement(file) {
  const matchs = file.match(/import.*;/) || [];

  return matchs.reduce((acc, next) => acc.replace(next, ''), file);
}

function deleteExportStatement(file) {
  const matchs = file.match(/export {};/) || [];

  return matchs.reduce((acc, next) => acc.replace(next, ''), file);
}

function getFiles() {
  return FILES_WHITELIST.map((name) => {
    const file = fs.readFileSync(TYPES_DIR + '/' + name, 'utf-8');

    const unimportedFile = deleteImportStatement(file);

    const unexportedFile = deleteExportStatement(unimportedFile);

    return unexportedFile;
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
