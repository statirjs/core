const fs = require('fs');

const TYPES_DIR = './types';

const TARGET_FILE = './index.d.ts';

const FILES_WHITELIST = ['typing/internal.d.ts', 'typing/external.d.ts'];

function getFiles() {
  return FILES_WHITELIST.map((name) => {
    const file = fs.readFileSync(TYPES_DIR + '/' + name, 'utf-8');

    return file;
  });
}

function getBundledFile(files) {
  return files
    .reduce((acc, next) => acc + next, '')
    .replace(/import/g, '\nimport')
    .replace(/export/g, '\nexport');
}

function extractImportPcakage(importLine) {
  return importLine
    .match(/from '.*';/g)[0]
    .replace("from '", '')
    .replace("';", '');
}

function extractImportValue(importLine) {
  return importLine
    .match(/import.*from/g)[0]
    .replace('import ', '')
    .replace(' from', '')
    .replace('{ ', '')
    .replace(' }', '')
    .split(', ');
}

function groupByTypes(acc, next) {
  const [key, value] = next;
  const keys = acc.map(([existKey]) => existKey);

  const isExist = keys.includes(key);
  const nextAcc = isExist ? acc : [...acc, [key, []]];

  return nextAcc.map(([existKey, existValue]) =>
    existKey === key ? [key, [...existValue, ...value]] : [existKey, existValue]
  );
}

function filterByTypes([key, value]) {
  return [
    key,
    value.reduce((acc, next) => (acc.includes(next) ? acc : [...acc, next]), [])
  ];
}

function formateImportString([key, value]) {
  const isBundledImport = value.some((item) => item.includes('*'));

  const valueString = value.reduce((acc, next) => `${acc}, ${next}`);

  return isBundledImport ? '' : `import { ${valueString} } from "${key}";`;
}

function mergeImports(imports) {
  const importTypes = imports.map((importLine) => [
    extractImportPcakage(importLine),
    extractImportValue(importLine)
  ]);

  const grouped = importTypes.reduce(groupByTypes, []);

  const filtred = grouped.map(filterByTypes);

  const formated = filtred.map(formateImportString);

  return formated.join('\n');
}

function replaceImports(bundle) {
  const matchs = bundle.match(/import.*;/g);

  const source = matchs.reduce(
    (acc, next) => acc.replace(next, '').replace(/S\./g, ''),
    bundle
  );

  const imports = mergeImports(matchs);

  return imports + source;
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

  const source = replaceImports(bundle);

  writeBundle(source);
}

main();
