import { testHelp } from './help';

export function hello(): string {
  return 'hello world!';
}

export function help(): string {
  return `HELP ME PLS PATCH! ${testHelp()}`;
}