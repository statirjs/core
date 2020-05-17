import { formatePipeActionName } from '../src/forme/creator';

describe('Test formatePipeActionName', () => {
  test('return value', () => {
    expect(formatePipeActionName('test', '1')).toEqual('test:1');

    expect(formatePipeActionName('', '')).toEqual(':');

    expect(formatePipeActionName(null as any, '')).toEqual('null:');
  });
});
